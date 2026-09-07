import { ATTR_COOKIE, parseAttributionCookie } from '@/lib/attribution';
import { NextResponse, type NextRequest } from 'next/server';
import { createLead, findRecentLeadByEmail, recordEmailEvent } from '@/lib/leads';
import { leadInputSchema } from '@/lib/validation';
import { sendAdminNotification, sendAutoReply } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Abuse controls (audit 2026-09-04, H4). Every accepted lead fires two
// Resend emails and lands on Jim's phone, so the endpoint needs a floor:
// a per-IP window, a honeypot, and a 24-hour dedupe by email.
const RATE_LIMIT = Number(process.env.LEADS_RATE_LIMIT ?? 5);
const RATE_WINDOW_MS = Number(process.env.LEADS_RATE_WINDOW_MS ?? 10 * 60 * 1000);
const hits = new Map<string, number[]>();

function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_WINDOW_MS;
  const prev = (hits.get(ip) ?? []).filter((t) => t > windowStart);
  if (prev.length >= RATE_LIMIT) {
    hits.set(ip, prev);
    return true;
  }
  prev.push(now);
  hits.set(ip, prev);
  if (hits.size > 10_000) {
    hits.forEach((times, key) => {
      if (times.every((t) => t <= windowStart)) hits.delete(key);
    });
  }
  return false;
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many submissions. Please call us at (940) 905-3090.' },
      { status: 429 },
    );
  }

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

  // First-touch attribution captured client-side into a cookie (see
  // components/AttributionCapture.tsx): gclid/utm_* for paid, or
  // source/medium (organic | direct | referral) classified from the referrer.
  const attribution = parseAttributionCookie(req.cookies.get(ATTR_COOKIE)?.value);

  const data = parsed.data;

  // Honeypot filled → a bot. Answer as if accepted so it learns nothing.
  if (data.website) {
    return NextResponse.json({ ok: true, id: 'accepted' }, { status: 201 });
  }

  // Same address within 24 h → a double submit or a retry. Reuse the lead and
  // don't email anyone twice.
  const recent = await findRecentLeadByEmail(data.email.toLowerCase());
  if (recent) {
    return NextResponse.json({ ok: true, id: recent.id, duplicate: true }, { status: 200 });
  }

  const lead = await createLead({
    name: data.name,
    email: data.email.toLowerCase(),
    phone: data.phone || null,
    flightInterest: data.flightInterest || null,
    preferredContact: data.preferredContact ?? 'email',
    message: data.message || null,
    source: 'web',
    attribution,
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
