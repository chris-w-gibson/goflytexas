import { NextResponse, type NextRequest } from 'next/server';
import { findFollowupCandidates, recordEmailEvent, touchLastContacted } from '@/lib/leads';
import { sendFollowup } from '@/lib/email';

// Staggered follow-up drip (default day 7 / 14 / 21 via FOLLOWUP_DAYS).
// Safe to run daily or hourly: a step is only sent once per lead and steps
// never skip. Route path kept for the existing Railway cron pinger.
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
  byStep: Record<string, number>;
  errors: Array<{ leadId: string; step: number; error: string }>;
}> {
  const candidates = await findFollowupCandidates();
  let sent = 0;
  let failed = 0;
  const byStep: Record<string, number> = {};
  const errors: Array<{ leadId: string; step: number; error: string }> = [];

  for (const { lead, step } of candidates) {
    try {
      await sendFollowup(lead, step);
      await recordEmailEvent({ leadId: lead.id, kind: 'weekly_followup' });
      // Automated touch only — never flips status or first_contacted_at.
      await touchLastContacted(lead.id);
      sent++;
      byStep[step] = (byStep[step] ?? 0) + 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failed++;
      errors.push({ leadId: lead.id, step, error: message });
      await recordEmailEvent({ leadId: lead.id, kind: 'weekly_followup', error: message });
    }
  }

  return { considered: candidates.length, sent, failed, byStep, errors };
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
