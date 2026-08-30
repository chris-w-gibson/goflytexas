import type { NextRequest } from 'next/server';
import { getCallByPlatformId, transitionTwilioCall, upsertTwilioCall } from '@/lib/calls';
import { toE164 } from '@/lib/voice/phone';
import { aiFallbackTwiml, hangupTwiml } from '@/lib/voice/twilio';
import { readTwilioRequest, twimlError, xml } from '@/lib/voice/twilioRequest';

/**
 * <Dial action>: the ring is over. Either a human talked (hang up; the
 * recording callback finishes the job), the caller gave up while it rang, or
 * nobody accepted → hand the caller to the AI assistant.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const r = await readTwilioRequest(req);
  if (!r.ok) return twimlError(r);
  const p = r.params;
  const parentSid = r.query.get('parent') || p.CallSid || '';
  const now = new Date();
  const dialStatus = p.DialCallStatus ?? 'unknown';
  const bridged = p.DialBridged === 'true';
  const durationSec = Number(p.DialCallDuration);
  const ai = {
    aiNumber: toE164(process.env.VOICE_AI_NUMBER ?? null),
    aiSipUri: process.env.VOICE_AI_SIP_URI || null,
    voice: process.env.VOICE_WHISPER_VOICE || undefined,
  };
  if (!parentSid) return xml(hangupTwiml());

  const row = await getCallByPlatformId(parentSid).catch(() => undefined);
  const human = row?.answeredBy === 'human' || bridged;

  if (human) {
    if (row && row.answeredBy !== 'human') {
      // Bridged without our gather recording it — still a human conversation.
      await transitionTwilioCall(parentSid, ['ringing'], 'answered', {
        answeredBy: 'human',
        answeredByName: 'Team',
        dialCallSid: p.DialCallSid ?? null,
      }).catch(() => undefined);
    }
    await upsertTwilioCall({
      callSid: parentSid,
      endedAt: now,
      durationSec: Number.isFinite(durationSec) ? durationSec : null,
      endedReason: `dial:${dialStatus}`,
      dialCallSid: p.DialCallSid ?? null,
      event: { name: 'dial-result', payload: p },
    }).catch((err) => console.error('twilio dial-result: upsert failed', err));
    return xml(hangupTwiml());
  }

  if (p.CallStatus === 'completed') {
    await transitionTwilioCall(parentSid, ['ringing'], 'no_message', {
      answeredBy: 'none',
      endedAt: now,
      endedReason: 'caller-hung-up-while-ringing',
    }).catch(() => undefined);
    return xml(hangupTwiml());
  }

  await transitionTwilioCall(parentSid, ['ringing'], 'forwarded_to_ai', {
    answeredBy: 'ai',
    endedReason: `dial:${dialStatus}`,
    forwardedToAiAt: now,
  }).catch((err) => console.error('twilio dial-result: transition failed', err));
  return xml(aiFallbackTwiml(ai));
}
