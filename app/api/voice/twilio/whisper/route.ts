import type { NextRequest } from 'next/server';
import { getCallByPlatformId } from '@/lib/calls';
import { getCallerHistory } from '@/lib/voice/history';
import { toE164 } from '@/lib/voice/phone';
import { whisperLine, whisperTimeoutSec, whisperTwiml } from '@/lib/voice/twilio';
import { readTwilioRequest, twimlError, xml } from '@/lib/voice/twilioRequest';

/**
 * Runs on the CALLEE leg after they pick up, before bridging: says who is
 * calling and asks for a 1. No writes here — the gather route records the answer.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const r = await readTwilioRequest(req);
  if (!r.ok) return twimlError(r);
  const parentSid = r.query.get('parent') ?? '';
  const targetIndex = Number(r.query.get('t') ?? 0) || 0;

  let from = toE164(r.params.From ?? null);
  if (!from && parentSid) {
    from = (await getCallByPlatformId(parentSid).catch(() => undefined))?.fromNumber ?? null;
  }
  const history = await getCallerHistory(from).catch((err) => {
    console.error('twilio whisper: history lookup failed', err);
    return { name: null, lastInterest: null, priorCalls: 0, lastAt: null };
  });

  return xml(
    whisperTwiml({
      baseUrl: r.baseUrl,
      parentSid,
      targetIndex,
      line: whisperLine(history, from),
      voice: process.env.VOICE_WHISPER_VOICE || undefined,
      timeoutSec: whisperTimeoutSec(),
    }),
  );
}
