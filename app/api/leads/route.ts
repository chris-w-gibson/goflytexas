import { NextResponse, type NextRequest } from 'next/server';
import { createLead, recordEmailEvent } from '@/lib/leads';
import { leadInputSchema } from '@/lib/validation';
import { sendAdminNotification, sendAutoReply } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = leadInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const lead = await createLead({
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    flightInterest: data.flightInterest || null,
    preferredContact: data.preferredContact ?? 'email',
    message: data.message || null,
    source: 'web',
  });

  // Fire emails in the background — don't block the response on Resend
  void Promise.allSettled([
    sendAutoReply(lead)
      .then(() => recordEmailEvent({ leadId: lead.id, kind: 'auto_reply' }))
      .catch((err) =>
        recordEmailEvent({
          leadId: lead.id,
          kind: 'auto_reply',
          error: String(err?.message ?? err),
        }),
      ),
    sendAdminNotification(lead)
      .then(() => recordEmailEvent({ leadId: lead.id, kind: 'admin_notify' }))
      .catch((err) =>
        recordEmailEvent({
          leadId: lead.id,
          kind: 'admin_notify',
          error: String(err?.message ?? err),
        }),
      ),
  ]);

  return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
}
