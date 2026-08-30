import type { NextRequest } from 'next/server';
import { transitionTwilioCall, upsertTwilioCall } from '@/lib/calls';
import { empty, readTwilioRequest } from '@/lib/voice/twilioRequest';

/** Number-level status callback (terminal states). Coalesces end time/duration. */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TERMINAL = new Set(['completed', 'busy', 'failed', 'no-answer', 'canceled']);

export async function POST(req: NextRequest) {
  const r = await readTwilioRequest(req);
  if (!r.ok) return empty(r.status);
  const p = r.params;
  const callSid = p.CallSid;
  if (!callSid || !TERMINAL.has(p.CallStatus ?? '')) return empty(204);
  const duration = Number(p.CallDuration);
  await upsertTwilioCall({
    callSid,
    endedAt: new Date(),
    durationSec: Number.isFinite(duration) ? duration : null,
    event: { name: 'status', payload: p },
  }).catch((err) => console.error('twilio status: upsert failed', err));
  // A call that ended while still ringing never reached anyone.
  await transitionTwilioCall(callSid, ['ringing'], 'no_message', {
    answeredBy: 'none',
    endedReason: `ended-while-ringing:${p.CallStatus}`,
  }).catch(() => undefined);
  return empty(204);
}
