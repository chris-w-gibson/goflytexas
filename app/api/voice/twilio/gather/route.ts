import type { NextRequest } from 'next/server';
import { transitionTwilioCall } from '@/lib/calls';
import { acceptTwiml, hangupTwiml, ringTargets } from '@/lib/voice/twilio';
import { readTwilioRequest, twimlError, xml } from '@/lib/voice/twilioRequest';

/**
 * The callee's keypress from the whisper. "1" claims the call (race-safe:
 * only the first presser moves ringing → answered); anything else, or a
 * second presser, hangs up that leg so the caller keeps ringing / falls to the AI.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const r = await readTwilioRequest(req);
  if (!r.ok) return twimlError(r);
  const parentSid = r.query.get('parent') ?? '';
  const targetIndex = Number(r.query.get('t') ?? 0) || 0;
  const digits = (r.params.Digits ?? '').trim();
  if (!parentSid || digits !== '1') return xml(hangupTwiml());

  const name = ringTargets()[targetIndex]?.name ?? 'Team';
  const row = await transitionTwilioCall(parentSid, ['ringing'], 'answered', {
    answeredBy: 'human',
    answeredByName: name,
    dialCallSid: r.params.CallSid ?? null,
  }).catch((err) => {
    console.error('twilio gather: transition failed', err);
    return undefined;
  });
  return xml(row ? acceptTwiml() : hangupTwiml());
}
