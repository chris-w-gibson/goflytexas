import type { NextRequest } from 'next/server';
import { callerGoneTwiml, ringThroughWhisperLine, ringWhisperTwiml } from '@/lib/voice/ringThrough';
import { ringStore } from '@/lib/voice/ringThroughStore';
import { readTwilioRequest, twimlError, xml } from '@/lib/voice/twilioRequest';

/**
 * Runs on the team member's cell the moment they pick up a ring-through: says
 * who is calling and waits for a 1. Nothing is written here; the accept route
 * records the press. If the caller has gone, or the ring has moved on to the
 * next person, they are told and the leg ends.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const r = await readTwilioRequest(req);
  if (!r.ok) return twimlError(r);
  const parentSid = r.query.get('parent') ?? '';
  const step = Number(r.query.get('step') ?? -1);
  const voice = process.env.VOICE_WHISPER_VOICE || undefined;

  const row = parentSid ? await ringStore.get(parentSid).catch(() => null) : null;
  const state = row?.state;
  if (!row || row.ended || !state || state.state !== 'ringing' || state.step !== step) {
    return xml(callerGoneTwiml(voice));
  }
  return xml(
    ringWhisperTwiml({
      baseUrl: r.baseUrl,
      parentSid,
      step,
      line: ringThroughWhisperLine(state.callerName, row.fromNumber),
      voice,
    }),
  );
}
