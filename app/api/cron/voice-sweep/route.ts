import { NextResponse, type NextRequest } from 'next/server';
import { listStuckTranscriptions } from '@/lib/calls';
import { processTwilioCall } from '@/lib/voice/pipeline';

/**
 * Re-runs transcription + the brain for human-answered Twilio calls whose
 * background job never finished (deploy mid-job, Deepgram outage, …).
 * Twilio does not retry callbacks, so this is the safety net. Hourly via
 * GitHub Actions, same CRON_SECRET pattern as the follow-up drip.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get('authorization');
  if (header === `Bearer ${secret}`) return true;
  return req.nextUrl.searchParams.get('key') === secret;
}

async function sweep() {
  const stuck = await listStuckTranscriptions(20);
  const results: Array<{ callSid: string; result: string }> = [];
  for (const row of stuck) {
    try {
      const r = await processTwilioCall(row.platformCallId, { force: row.transcriptionStatus === 'failed' });
      results.push({ callSid: row.platformCallId, result: 'call' in r ? r.call.status : r.skipped });
    } catch (err) {
      results.push({ callSid: row.platformCallId, result: `error: ${err instanceof Error ? err.message : String(err)}` });
    }
  }
  return { considered: stuck.length, results };
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.json({ ok: true, ...(await sweep()) });
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.json({ ok: true, ...(await sweep()) });
}
