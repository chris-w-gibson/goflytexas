import { toE164 } from './phone';
import { ringThroughTimeoutSec } from './ringThrough';
import type { RingDeps } from './ringThroughFlow';
import { ringStore } from './ringThroughStore';
import { publicBaseUrl } from './twilioRequest';
import { sayOnCall, twilioRestFromEnv } from './twilioRest';

/** The real storage and phone network for the ring-through moves. */
export function ringDeps(env: Record<string, string | undefined> = process.env): RingDeps {
  return {
    store: ringStore,
    twilio: twilioRestFromEnv(env),
    say: (url, text) => sayOnCall(url, text),
    baseUrl: publicBaseUrl(env),
    from: toE164(env.VOICE_TWILIO_NUMBER ?? null),
    timeoutSec: ringThroughTimeoutSec(env),
    voice: env.VOICE_WHISPER_VOICE || undefined,
    now: () => new Date(),
  };
}
