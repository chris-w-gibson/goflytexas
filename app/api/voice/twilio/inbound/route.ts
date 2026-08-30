import type { NextRequest } from 'next/server';
import { upsertTwilioCall } from '@/lib/calls';
import { toE164 } from '@/lib/voice/phone';
import {
  aiFallbackTwiml,
  inboundDialTwiml,
  isBusinessHours,
  passthroughTwiml,
  rejectTwiml,
  reservedNumbers,
  ringTargets,
  ringTimeoutSec,
  routingMode,
} from '@/lib/voice/twilio';
import { readTwilioRequest, twimlError, xml } from '@/lib/voice/twilioRequest';

/**
 * Twilio Voice URL for +1 940-242-3072. Every inbound call starts here:
 * ring the team with a whisper (humans_first, in hours) or hand straight to
 * the AI assistant. A DB hiccup never drops a call — the AI TwiML still goes out.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function aiOptions() {
  return {
    aiNumber: toE164(process.env.VOICE_AI_NUMBER ?? null),
    aiSipUri: process.env.VOICE_AI_SIP_URI || null,
    voice: process.env.VOICE_WHISPER_VOICE || undefined,
  };
}

export async function POST(req: NextRequest) {
  const r = await readTwilioRequest(req);
  if (!r.ok) return twimlError(r);
  const p = r.params;
  const callSid = p.CallSid;
  if (!callSid) return xml(rejectTwiml());

  const from = toE164(p.From ?? null);
  const to = toE164(p.To ?? null);
  const forwardedFrom = toE164(p.ForwardedFrom ?? null);
  if (from && reservedNumbers().has(from)) {
    console.warn('twilio inbound: loop guard rejected call from', from);
    return xml(rejectTwiml());
  }

  const now = new Date();
  const mode = routingMode();
  const targets = ringTargets();
  const inHours = isBusinessHours(
    now,
    process.env.VOICE_TZ ?? 'America/Chicago',
    process.env.VOICE_BUSINESS_HOURS ?? '08:00-17:00',
  );
  const base = { callSid, fromNumber: from, toNumber: to, forwardedFrom, startedAt: now };
  const log = (err: unknown) => console.error('twilio inbound: upsert failed', err);

  if (mode === 'passthrough') {
    void upsertTwilioCall({
      ...base,
      status: 'passthrough',
      answeredBy: 'none',
      event: { name: 'inbound', payload: p },
    }).catch(log);
    return xml(passthroughTwiml({ targets, timeoutSec: 30, voice: aiOptions().voice }));
  }

  if (mode === 'humans_first' && inHours && targets.length > 0) {
    try {
      await upsertTwilioCall({ ...base, status: 'ringing', event: { name: 'inbound', payload: p } });
    } catch (err) {
      log(err);
      return xml(aiFallbackTwiml(aiOptions()));
    }
    return xml(
      inboundDialTwiml({ baseUrl: r.baseUrl, parentSid: callSid, targets, timeoutSec: ringTimeoutSec() }),
    );
  }

  void upsertTwilioCall({
    ...base,
    status: 'forwarded_to_ai',
    answeredBy: 'ai',
    forwardedToAiAt: now,
    event: { name: 'inbound', payload: p },
  }).catch(log);
  return xml(aiFallbackTwiml(aiOptions()));
}
