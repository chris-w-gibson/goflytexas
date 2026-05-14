import { NextResponse, type NextRequest } from 'next/server';
import { findWeeklyFollowupCandidates, markContacted, recordEmailEvent } from '@/lib/leads';
import { sendWeeklyFollowup } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get('authorization');
  if (header === `Bearer ${secret}`) return true;
  const query = req.nextUrl.searchParams.get('key');
  return query === secret;
}

async function runFollowup(): Promise<{
  considered: number;
  sent: number;
  failed: number;
  errors: Array<{ leadId: string; error: string }>;
}> {
  const candidates = await findWeeklyFollowupCandidates();
  let sent = 0;
  let failed = 0;
  const errors: Array<{ leadId: string; error: string }> = [];

  for (const lead of candidates) {
    try {
      await sendWeeklyFollowup(lead);
      await recordEmailEvent({ leadId: lead.id, kind: 'weekly_followup' });
      // Update last_contacted so we don't re-send for 7 days. Don't flip status if already 'contacted'.
      await markContacted(lead.id);
      sent++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failed++;
      errors.push({ leadId: lead.id, error: message });
      await recordEmailEvent({ leadId: lead.id, kind: 'weekly_followup', error: message });
    }
  }

  return { considered: candidates.length, sent, failed, errors };
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const result = await runFollowup();
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const result = await runFollowup();
  return NextResponse.json({ ok: true, ...result });
}
