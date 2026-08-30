import type { TranscriptTurn } from './types';

/**
 * Twilio dual-channel recording → Deepgram (prerecorded, multichannel) →
 * role-labelled turns. Channel 0 is the parent leg (the caller), channel 1 is
 * the dialed staff member. Node 18 safe: global fetch, buffered bodies.
 */

export type TranscribeOpts = {
  accountSid: string;
  authToken: string;
  deepgramKey: string;
  model?: string;
  keyterms?: string[];
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
};

export const DEFAULT_KEYTERMS = [
  'GoFlyTexas',
  'Aero Valley',
  'Roanoke',
  'Cessna',
  'discovery flight',
  'block time',
  'glass panel',
  'round gauge',
  'Hobbs',
  'CFI',
];

/** Reads the env; throws with a clear message when a secret is missing. */
export function twilioTranscribeOpts(env: Record<string, string | undefined> = process.env): TranscribeOpts {
  const accountSid = env.TWILIO_ACCOUNT_SID;
  const authToken = env.TWILIO_AUTH_TOKEN;
  const deepgramKey = env.DEEPGRAM_API_KEY;
  if (!accountSid || !authToken) throw new Error('TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN not set');
  if (!deepgramKey) throw new Error('DEEPGRAM_API_KEY not set');
  return { accountSid, authToken, deepgramKey, model: env.DEEPGRAM_MODEL || 'nova-3' };
}

function basicAuth(sid: string, token: string): string {
  return `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`;
}

/**
 * Download the recording as WAV. Asks for both channels; if Twilio refuses
 * (mono recording) falls back to the single channel and says so.
 */
export async function fetchTwilioRecording(
  recordingUrl: string,
  opts: TranscribeOpts,
): Promise<{ bytes: ArrayBuffer; channels: 1 | 2 }> {
  const f = opts.fetchImpl ?? fetch;
  const base = recordingUrl.replace(/\.(wav|mp3|json)$/i, '');
  const headers = { Authorization: basicAuth(opts.accountSid, opts.authToken) };
  const timeout = opts.timeoutMs ?? 90_000;

  let res = await f(`${base}.wav?RequestedChannels=2`, {
    headers,
    signal: AbortSignal.timeout(timeout),
  });
  let channels: 1 | 2 = 2;
  if (!res.ok) {
    res = await f(`${base}.wav`, { headers, signal: AbortSignal.timeout(timeout) });
    channels = 1;
  }
  if (!res.ok) throw new Error(`Twilio recording fetch failed: HTTP ${res.status}`);
  return { bytes: await res.arrayBuffer(), channels };
}

type DeepgramUtterance = {
  channel?: number;
  speaker?: number;
  start?: number;
  end?: number;
  transcript?: string;
};

/**
 * Pure: Deepgram response → turns. Prefers `results.utterances`; falls back to
 * per-channel words. Consecutive same-role utterances closer than `gapSec`
 * are merged. `callerChannel` says which channel is the caller (Twilio: 0).
 */
export function deepgramToTurns(
  resp: unknown,
  opts?: { gapSec?: number; callerChannel?: 0 | 1 },
): TranscriptTurn[] {
  const gapSec = opts?.gapSec ?? 1.2;
  const callerChannel = opts?.callerChannel ?? 0;
  const results = (resp as { results?: Record<string, unknown> } | null)?.results;
  if (!results || typeof results !== 'object') return [];

  const roleFor = (u: DeepgramUtterance): TranscriptTurn['role'] => {
    const idx = typeof u.channel === 'number' ? u.channel : typeof u.speaker === 'number' ? u.speaker : 0;
    return idx === callerChannel ? 'user' : 'assistant';
  };

  let utterances: DeepgramUtterance[] = Array.isArray(results.utterances)
    ? (results.utterances as DeepgramUtterance[])
    : [];

  if (utterances.length === 0 && Array.isArray(results.channels)) {
    // Words-only fallback: group each channel's words into segments on gaps.
    utterances = [];
    (results.channels as Array<{ alternatives?: Array<{ words?: Array<{ word?: string; punctuated_word?: string; start?: number; end?: number }> }> }>).forEach(
      (ch, channelIdx) => {
        const words = ch?.alternatives?.[0]?.words ?? [];
        let cur: DeepgramUtterance | null = null;
        for (const w of words) {
          const text = w.punctuated_word ?? w.word ?? '';
          if (!text) continue;
          if (cur && typeof w.start === 'number' && typeof cur.end === 'number' && w.start - cur.end > gapSec) {
            utterances.push(cur);
            cur = null;
          }
          if (!cur) cur = { channel: channelIdx, start: w.start, end: w.end, transcript: text };
          else {
            cur.transcript = `${cur.transcript} ${text}`;
            cur.end = w.end;
          }
        }
        if (cur) utterances.push(cur);
      },
    );
  }

  const sorted = utterances
    .filter((u) => typeof u.transcript === 'string' && u.transcript.trim())
    .sort((a, b) => (a.start ?? 0) - (b.start ?? 0));

  const turns: TranscriptTurn[] = [];
  let lastEnd = -Infinity;
  for (const u of sorted) {
    const role = roleFor(u);
    const text = (u.transcript as string).trim();
    const start = typeof u.start === 'number' ? u.start : undefined;
    const last = turns[turns.length - 1];
    if (last && last.role === role && start !== undefined && start - lastEnd < gapSec) {
      last.text = `${last.text} ${text}`;
    } else {
      turns.push(start === undefined ? { role, text } : { role, text, at: Math.round(start * 10) / 10 });
    }
    lastEnd = typeof u.end === 'number' ? u.end : lastEnd;
  }
  return turns;
}

/** Recording URL → role-labelled turns (+ the raw Deepgram response for storage). */
export async function transcribeRecording(
  recordingUrl: string,
  opts: TranscribeOpts,
): Promise<{ turns: TranscriptTurn[]; raw: unknown; channels: 1 | 2 }> {
  const f = opts.fetchImpl ?? fetch;
  const { bytes, channels } = await fetchTwilioRecording(recordingUrl, opts);
  const params = new URLSearchParams({
    model: opts.model ?? 'nova-3',
    smart_format: 'true',
    punctuate: 'true',
    utterances: 'true',
  });
  if (channels === 2) params.set('multichannel', 'true');
  else params.set('diarize', 'true');
  for (const k of opts.keyterms ?? DEFAULT_KEYTERMS) params.append('keyterm', k);

  const res = await f(`https://api.deepgram.com/v1/listen?${params.toString()}`, {
    method: 'POST',
    headers: { Authorization: `Token ${opts.deepgramKey}`, 'Content-Type': 'audio/wav' },
    body: bytes,
    signal: AbortSignal.timeout(opts.timeoutMs ?? 90_000),
  });
  if (!res.ok) throw new Error(`Deepgram failed: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  const raw: unknown = await res.json();
  return { turns: deepgramToTurns(raw, { callerChannel: 0 }), raw, channels };
}
