import type { NextRequest } from 'next/server';
import { callerGoneTwiml, joinAsTeamTwiml } from '@/lib/voice/ringThrough';
import { ringDeps } from '@/lib/voice/ringThroughDeps';
import { onAccept } from '@/lib/voice/ringThroughFlow';
import { hangupTwiml } from '@/lib/voice/twilio';
import { readTwilioRequest, twimlError, xml } from '@/lib/voice/twilioRequest';

/**
 * The team member's keypress on a ring-through. A 1 takes the call: the caller
 * is moved out of the assistant's call and both meet in the room. Anything
 * else hangs up this leg, and the leg's status callback rings the next person.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const r = await readTwilioRequest(req);
  if (!r.ok) return twimlError(r);
  const parentSid = r.query.get('parent') ?? '';
  const step = Number(r.query.get('step') ?? -1);
  const voice = process.env.VOICE_WHISPER_VOICE || undefined;
  if (!parentSid || (r.params.Digits ?? '').trim() !== '1') return xml(hangupTwiml());

  const taken = await onAccept(ringDeps(), { parentSid, step }).catch((err) => {
    console.error('ring-through accept failed', err);
    return { ok: false as const };
  });
  return xml(taken.ok ? joinAsTeamTwiml({ parentSid, voice }) : callerGoneTwiml(voice));
}
