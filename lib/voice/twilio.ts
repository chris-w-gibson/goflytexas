import { createHmac, timingSafeEqual } from 'node:crypto';
import { formatPhoneDisplay, toE164 } from './phone';

/** Loose env shape so tests can pass plain objects. */
export type Env = Record<string, string | undefined>;

/**
 * Pure helpers for the Twilio switchboard: config parsing, business hours,
 * TwiML building, form parsing and webhook signature validation. No Next.js
 * or DB imports so everything here is unit-testable.
 */

export type RoutingMode = 'humans_first' | 'ai_only' | 'passthrough';
export type RingTarget = { name: string; number: string };

const ROUTING_MODES: RoutingMode[] = ['humans_first', 'ai_only', 'passthrough'];

export function routingMode(env: Env = process.env): RoutingMode {
  const v = (env.VOICE_ROUTING_MODE ?? 'ai_only').trim() as RoutingMode;
  return ROUTING_MODES.includes(v) ? v : 'ai_only';
}

/** Numbers that must never be rung (they route back to us). */
export function reservedNumbers(env: Env = process.env): Set<string> {
  return new Set(
    [env.VOICE_PUBLISHED_NUMBER, env.VOICE_TWILIO_NUMBER, env.VOICE_AI_NUMBER]
      .map((n) => toE164(n ?? null))
      .filter((n): n is string => !!n),
  );
}

/**
 * `VOICE_RING_TARGETS="+18175551234:Jim,Ann:+18175555678"` → targets.
 * Either order per entry; invalid numbers, duplicates and reserved numbers
 * are dropped. Max 10 (Twilio's <Dial> limit).
 */
export function ringTargets(env: Env = process.env): RingTarget[] {
  const raw = env.VOICE_RING_TARGETS ?? '';
  const reserved = reservedNumbers(env);
  const out: RingTarget[] = [];
  const seen = new Set<string>();
  for (const entry of raw.split(',')) {
    const parts = entry.split(':').map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) continue;
    let number: string | null = null;
    let name = '';
    for (const p of parts) {
      const e = toE164(p);
      if (e && !number) number = e;
      else if (!e && !name) name = p;
    }
    if (!number || seen.has(number) || reserved.has(number)) continue;
    seen.add(number);
    out.push({ name: name || `Team ${out.length + 1}`, number });
    if (out.length === 10) break;
  }
  return out;
}

export function ringTimeoutSec(env: Env = process.env): number {
  const n = Number(env.VOICE_RING_TIMEOUT ?? 20);
  return Number.isFinite(n) ? Math.min(45, Math.max(5, Math.floor(n))) : 20;
}

export function whisperTimeoutSec(env: Env = process.env): number {
  const n = Number(env.VOICE_WHISPER_TIMEOUT ?? 4);
  return Number.isFinite(n) ? Math.min(10, Math.max(2, Math.floor(n))) : 4;
}

export function localClock(now: Date, tz: string): { hour: number; minute: number; weekday: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return {
    hour: Number(get('hour')) % 24,
    minute: Number(get('minute')),
    weekday: Math.max(0, weekdays.indexOf(get('weekday'))),
  };
}

/** `window` like "08:00-17:00" in `tz`, every day. Malformed → always open. */
export function isBusinessHours(now: Date, tz: string, window: string): boolean {
  const m = /^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/.exec(window.trim());
  if (!m) return true;
  const start = Number(m[1]) * 60 + Number(m[2]);
  const end = Number(m[3]) * 60 + Number(m[4]);
  const { hour, minute } = localClock(now, tz);
  const cur = hour * 60 + minute;
  return start <= end ? cur >= start && cur < end : cur >= start || cur < end;
}

// ---------------------------------------------------------------- TwiML

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function twiml(inner: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${inner}</Response>`;
}

export function say(text: string, voice = 'Polly.Matthew-Neural'): string {
  return `<Say voice="${escapeXml(voice)}">${escapeXml(text)}</Say>`;
}

/** Empty document: on a whisper leg this means "bridge the call". */
export function acceptTwiml(): string {
  return twiml('');
}

export function hangupTwiml(): string {
  return twiml('<Hangup/>');
}

export function rejectTwiml(): string {
  return twiml('<Reject reason="busy"/>');
}

/** Only `[A-Za-z0-9_-]` survives in query values, so signed URLs never re-encode. */
export function safeQuery(v: string): string {
  return v.replace(/[^A-Za-z0-9_-]/g, '');
}

export function routeUrl(baseUrl: string, path: string, query?: Record<string, string | number>): string {
  const base = baseUrl.replace(/\/+$/, '');
  const qs = query
    ? Object.entries(query)
        .map(([k, v]) => `${k}=${safeQuery(String(v))}`)
        .join('&')
    : '';
  return `${base}${path}${qs ? `?${qs}` : ''}`;
}

/** Simultaneous ring of every target with a whisper on each leg. */
export function inboundDialTwiml(i: {
  baseUrl: string;
  parentSid: string;
  targets: RingTarget[];
  timeoutSec: number;
}): string {
  const action = routeUrl(i.baseUrl, '/api/voice/twilio/dial-result', { parent: i.parentSid });
  const recording = routeUrl(i.baseUrl, '/api/voice/twilio/recording');
  const numbers = i.targets
    .map((t, idx) => {
      const url = routeUrl(i.baseUrl, '/api/voice/twilio/whisper', { parent: i.parentSid, t: idx });
      return `<Number url="${escapeXml(url)}" method="POST">${escapeXml(t.number)}</Number>`;
    })
    .join('');
  return twiml(
    `<Dial timeout="${i.timeoutSec}" answerOnBridge="true" ringTone="us" record="record-from-answer-dual" recordingStatusCallback="${escapeXml(recording)}" recordingStatusCallbackEvent="completed absent" recordingStatusCallbackMethod="POST" action="${escapeXml(action)}" method="POST" timeLimit="3600">${numbers}</Dial>`,
  );
}

/** Whisper played to the callee before bridging; no key within the timeout → hang up that leg. */
export function whisperTwiml(i: {
  baseUrl: string;
  parentSid: string;
  targetIndex: number;
  line: string;
  voice?: string;
  timeoutSec?: number;
}): string {
  const action = routeUrl(i.baseUrl, '/api/voice/twilio/gather', { parent: i.parentSid, t: i.targetIndex });
  return twiml(
    `<Gather input="dtmf" numDigits="1" timeout="${i.timeoutSec ?? 4}" action="${escapeXml(action)}" method="POST">${say(i.line, i.voice)}</Gather><Hangup/>`,
  );
}

/** Hand the caller to the AI assistant (Vapi), then apologise if that fails. */
export function aiFallbackTwiml(i: {
  aiNumber: string | null;
  aiSipUri?: string | null;
  voice?: string;
}): string {
  const target = i.aiSipUri
    ? `<Sip>${escapeXml(i.aiSipUri)}</Sip>`
    : i.aiNumber
      ? `<Number>${escapeXml(i.aiNumber)}</Number>`
      : '';
  const dial = target
    ? `<Dial timeout="30" answerOnBridge="true" timeLimit="600">${target}</Dial>`
    : '';
  return twiml(
    `${dial}${say("Sorry, we can't take your call right now. Please try again a little later.", i.voice)}`,
  );
}

/** Kill switch: plain forward to the first target, no recording, no whisper. */
export function passthroughTwiml(i: { targets: RingTarget[]; timeoutSec: number; voice?: string }): string {
  const numbers = i.targets.map((t) => `<Number>${escapeXml(t.number)}</Number>`).join('');
  const dial = numbers ? `<Dial timeout="${i.timeoutSec}" answerOnBridge="true">${numbers}</Dial>` : '';
  return twiml(`${dial}${say("Sorry, we can't take your call right now. Please try again a little later.", i.voice)}`);
}

// ---------------------------------------------------------------- whisper text

const SPOKEN_INTEREST: Record<string, string> = {
  discovery: 'a discovery flight',
  private: 'private pilot training',
  instrument: 'an instrument rating',
  commercial: 'commercial training',
  rental: 'aircraft rental',
  tour: 'an aerial tour',
  ferry: 'a ferry flight',
  insurance: 'an insurance checkout',
  biennial: 'a flight review',
  other: 'flying',
};

export type CallerHistory = {
  name: string | null;
  lastInterest: string | null;
  priorCalls: number;
  lastAt: Date | null;
};

function spokenDay(d: Date, now: Date): string {
  const ms = now.getTime() - d.getTime();
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  if (days <= 0) return 'earlier today';
  if (days === 1) return 'yesterday';
  if (days < 7) return d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'America/Chicago' });
  if (days < 30) return `${Math.floor(days / 7)} week${days >= 14 ? 's' : ''} ago`;
  return 'a while back';
}

/** ≤ ~22 words; everything is plain text — the TwiML builder escapes it. */
export function whisperLine(h: CallerHistory, fromE164: string | null, now: Date = new Date()): string {
  const name = h.name && h.name !== 'Unknown caller' ? h.name : null;
  const interest = h.lastInterest ? SPOKEN_INTEREST[h.lastInterest] ?? h.lastInterest : null;
  if (name) {
    const when = h.lastAt ? `, called ${spokenDay(h.lastAt, now)}` : '';
    const about = interest ? ` about ${interest}` : '';
    return `GoFlyTexas call from ${name}${when}${about}. Press 1 to accept.`;
  }
  if (h.priorCalls > 0) {
    const about = interest ? ` about ${interest}` : '';
    return `GoFlyTexas call, repeat caller${about}. Press 1 to accept.`;
  }
  const display = formatPhoneDisplay(fromE164);
  if (!display) return 'GoFlyTexas call, caller ID withheld. Press 1 to accept.';
  return `GoFlyTexas call from ${display.split('-').join(' ')}. Press 1 to accept.`;
}

// ---------------------------------------------------------------- requests

export function parseForm(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  new URLSearchParams(raw).forEach((v, k) => {
    out[k] = v;
  });
  return out;
}

/** Twilio's scheme: base64(HMAC-SHA1(authToken, url + Σ sorted(key+value))). */
export function twilioSignature(authToken: string, url: string, params: Record<string, string>): string {
  const data =
    url +
    Object.keys(params)
      .sort()
      .map((k) => k + params[k])
      .join('');
  return createHmac('sha1', authToken).update(data, 'utf8').digest('base64');
}

export function verifyTwilioSignature(i: {
  authToken: string;
  signature: string | null | undefined;
  urls: string[];
  params: Record<string, string>;
}): boolean {
  if (!i.signature || !i.authToken) return false;
  const given = Buffer.from(i.signature);
  for (const url of i.urls) {
    const expected = Buffer.from(twilioSignature(i.authToken, url, i.params));
    if (expected.length === given.length && timingSafeEqual(expected, given)) return true;
  }
  return false;
}

/** Where a recording can be played from the email/admin: Twilio media needs auth → our proxy. */
export function recordingLink(
  call: { platform: string; recordingUrl: string | null; recordingSid?: string | null },
  baseUrl: string,
): string | null {
  if (call.platform === 'twilio') {
    return call.recordingSid ? `${baseUrl.replace(/\/+$/, '')}/admin/calls/recording/${call.recordingSid}` : null;
  }
  return call.recordingUrl;
}
