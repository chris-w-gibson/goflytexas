import { formatSpoken, toE164 } from './phone';
import { escapeXml, isBusinessHours, routeUrl, safeQuery, say, twiml, type Env } from './twilio';

/**
 * Ringing a person through from inside an AI call (Jim 2026-11-27): the
 * assistant answers every call; when the caller asks for a person, the next
 * person on the lead rotation is rung on their cell while the assistant keeps
 * talking. About twelve seconds each, two people at most ("two's enough"),
 * and the person presses 1 to take the call. Somebody who does not pick up is
 * skipped: no make-up turn.
 *
 * Pure rules, wording and TwiML. No DB, no network, no Next.js.
 */

export type RingThroughMode = 'off' | 'business_hours' | 'always';

const MODES: RingThroughMode[] = ['off', 'business_hours', 'always'];

/** Off unless switched on: nobody's cell rings until this has taken a real test call. */
export function ringThroughMode(env: Env = process.env): RingThroughMode {
  const v = (env.VOICE_RING_THROUGH ?? 'off').trim().toLowerCase() as RingThroughMode;
  return MODES.includes(v) ? v : 'off';
}

/** May a person be rung at this moment? */
export function ringThroughOpen(mode: RingThroughMode, now: Date, env: Env = process.env): boolean {
  if (mode === 'always') return true;
  if (mode !== 'business_hours') return false;
  return isBusinessHours(now, env.VOICE_TZ ?? 'America/Chicago', env.VOICE_BUSINESS_HOURS ?? '08:00-17:00');
}

/** How long one person's cell rings (Jim: "12 seconds, whatever is a reasonable amount of time"). */
export function ringThroughTimeoutSec(env: Env = process.env): number {
  const n = Number(env.VOICE_RING_THROUGH_TIMEOUT ?? 12);
  return Number.isFinite(n) ? Math.min(30, Math.max(8, Math.floor(n))) : 12;
}

/** Seconds the person has to press 1 once they have picked up and heard who is calling. */
export const PRESS_ONE_SECONDS = 6;

/** Jim: "I don't want to go down the list like try one, try two, try three, try four… two's enough." */
export const RING_THROUGH_MAX_PEOPLE = 2;

export type RingPerson = { userId: string; name: string; number: string };

/**
 * Kept on the Twilio parent row (`calls.ring_through`).
 * - ringing:   plan[step]'s cell is ringing (or they are hearing who is calling)
 * - connected: plan[step] pressed 1 and was joined to the caller
 * - missed:    nobody took it (also: there was nobody to ring, plan empty)
 * - ended:     the caller left while it rang; nobody is counted as having missed it
 */
export type RingThroughState = {
  state: 'ringing' | 'connected' | 'missed' | 'ended';
  step: number;
  plan: RingPerson[];
  /** The Twilio call to the person being rung. */
  legSid: string | null;
  callerName: string | null;
  startedAt: string;
  answeredUserId?: string | null;
  answeredName?: string | null;
  /** The assistant platform's live-control address for this call, when it sent one. */
  controlUrl?: string | null;
  /** The caller has heard that nobody could be reached. */
  toldCaller?: boolean;
};

/**
 * Who to ring, from the people coming up in the rotation (already in order,
 * each once). A person with no cell saved cannot be rung and is passed over;
 * so is a cell that is one of our own lines or the caller's own number.
 */
export function chooseRingPlan(
  comingUp: { id: string; name: string; phone: string | null }[],
  opts: { reserved: ReadonlySet<string>; caller: string | null },
): RingPerson[] {
  const out: RingPerson[] = [];
  const seen = new Set<string>();
  for (const p of comingUp) {
    const number = toE164(p.phone ?? null);
    if (!number || opts.reserved.has(number) || number === opts.caller || seen.has(number)) continue;
    seen.add(number);
    out.push({ userId: p.id, name: p.name, number });
    if (out.length === RING_THROUGH_MAX_PEOPLE) break;
  }
  return out;
}

export function firstRing(i: {
  plan: RingPerson[];
  callerName: string | null;
  controlUrl: string | null;
  now: Date;
}): RingThroughState {
  return {
    state: i.plan.length > 0 ? 'ringing' : 'missed',
    step: 0,
    plan: i.plan,
    legSid: null,
    callerName: i.callerName,
    startedAt: i.now.toISOString(),
    controlUrl: i.controlUrl,
  };
}

/** The person being rung did not take it: the next one's turn, or nobody is left. */
export function afterMiss(s: RingThroughState): RingThroughState {
  const next = s.step + 1;
  return next < s.plan.length
    ? { ...s, step: next, legSid: null }
    : { ...s, state: 'missed', legSid: null };
}

export function afterAccept(s: RingThroughState): RingThroughState {
  const person = s.plan[s.step];
  return { ...s, state: 'connected', answeredUserId: person.userId, answeredName: person.name };
}

/**
 * What a finished ring means for the lead (GFT-1127-02).
 * - taken:  the lead is that person's; whoever was rung before them is skipped
 * - missed: everyone rung is skipped and the lead goes to the next person after them
 * - null:   nothing was rung, or the caller left first; the rotation runs as usual
 */
export type RingOutcome =
  | { kind: 'taken'; userId: string; name: string; missed: RingPerson[] }
  | { kind: 'missed'; tried: RingPerson[] };

export function ringOutcome(s: RingThroughState | null | undefined): RingOutcome | null {
  if (!s) return null;
  if (s.state === 'connected' && s.answeredUserId) {
    return {
      kind: 'taken',
      userId: s.answeredUserId,
      name: s.answeredName ?? s.plan[s.step]?.name ?? 'Team',
      missed: s.plan.slice(0, s.step),
    };
  }
  if (s.state === 'missed' && s.plan.length > 0) return { kind: 'missed', tried: s.plan };
  return null;
}

/** One line for the Calls page. */
export function ringThroughWords(s: RingThroughState | null | undefined): string | null {
  if (!s) return null;
  const names = (people: RingPerson[]) => people.map((p) => p.name).join(', then ');
  switch (s.state) {
    case 'connected': {
      const missed = s.plan.slice(0, s.step);
      const took = s.answeredName ?? s.plan[s.step]?.name ?? 'someone';
      return missed.length
        ? `Asked for a person. Rang ${names(missed)} (no answer), then ${took} took the call.`
        : `Asked for a person. ${took} took the call.`;
    }
    case 'missed':
      return s.plan.length
        ? `Asked for a person. Rang ${names(s.plan)}: nobody took it.`
        : 'Asked for a person. Nobody could be rung.';
    case 'ended':
      return `Asked for a person. The caller left while ${names(s.plan.slice(0, s.step + 1))} was being rung.`;
    default:
      return `Asked for a person. Ringing ${s.plan[s.step]?.name ?? 'the team'}.`;
  }
}

/**
 * What the On call page says about ringing a person through right now:
 * whether it is on, who would be rung, and who cannot be because no cell is
 * saved for them.
 */
export function ringThroughPageWords(i: {
  mode: RingThroughMode;
  open: boolean;
  plan: RingPerson[];
  noCell: string[];
  seconds: number;
}): string[] {
  if (i.mode === 'off') {
    return ['Ringing a person through is switched off: a caller who asks for a person is offered a callback.'];
  }
  const lines: string[] = [];
  if (i.plan.length === 0) {
    lines.push(
      'A caller who asks for a person cannot be put through yet: nobody in the rotation who is working today has a cell saved. An admin adds cells on the Users page.',
    );
  } else {
    const who = i.plan.map((p) => p.name).join(', then ');
    lines.push(
      `A caller who asks for a person: the assistant rings ${who} (${i.seconds} seconds each) and keeps talking meanwhile. Press 1 to take the call. Someone who does not pick up is skipped.`,
    );
  }
  if (i.plan.length > 0 && !i.open) lines.push('Outside business hours nobody is rung; the assistant offers a callback.');
  if (i.noCell.length > 0) lines.push(`No cell saved, so cannot be rung: ${i.noCell.join(', ')}.`);
  return lines;
}

// ---------------------------------------------------------------- the assistant's side

/**
 * The tool the phone assistant uses to start the ring. It is offered on every
 * turn while the feature is on, so the cached prompt prefix never changes; the
 * per-turn note says whether it may be used.
 */
export const REACH_TEAM_TOOL = {
  name: 'reach_team',
  description:
    'Start ringing a GoFlyTexas team member so the caller can be put through to a person. Use it only when the call details say reaching a person is possible, only when the caller has asked to speak to a person, and at most once per call. It returns nothing: say one short sentence telling the caller you are trying to reach someone, and keep helping.',
  input_schema: {
    type: 'object' as const,
    properties: {
      caller_name: {
        type: 'string',
        description: "The caller's first and last name as they gave it, or an empty string if they have not given one.",
      },
    },
    required: [],
  },
};

/** Said when the assistant started the ring without saying anything itself. */
export const REACHING_LINE = 'Let me try to reach someone for you. I can keep helping while I do.';

/** Said to the caller when nobody took it. */
export const NOBODY_LINE =
  "I'm sorry, I couldn't reach anyone just now. I can take your details and have someone call you right back.";

export type RingNoteView =
  | { kind: 'available' }
  | { kind: 'unavailable' }
  | { kind: 'state'; state: RingThroughState };

/** Volatile per-turn note for the assistant; rides on the last user message like the call details. */
export function ringThroughNote(view: RingNoteView): string {
  if (view.kind === 'available') {
    return '[Reaching a person is possible on this call. If the caller asks to speak to a person, a human, or someone on the team: do not offer a callback. If you do not have their name yet, ask for it first. Once you have it, use the reach_team tool, once, and tell them in one short sentence that you are trying to reach someone and can keep helping while you do. Never promise that someone will pick up, and do not bring this up unless they ask for a person.]';
  }
  if (view.kind === 'unavailable') {
    return '[Reaching a person is not possible right now: do not use reach_team. If they ask for a person, flag a priority callback as usual.]';
  }
  const s = view.state;
  if (s.state === 'ringing') {
    return '[You are trying to reach a team member and their phone is ringing right now. Do not use reach_team again. Keep helping the caller and do not end the call unless they want to go. If they ask, say you are still trying.]';
  }
  if (s.toldCaller) {
    return '[The caller has already been told that nobody on the team could be reached. Do not use reach_team again and do not say it again. Take their message for a priority callback.]';
  }
  return '[Nobody on the team picked up just now. Do not use reach_team again. Tell the caller once, in one short sentence, that you could not reach anyone, then take their message for a priority callback.]';
}

/** A name fit to be read out to a team member: letters and the marks names carry, nothing else. */
export function spokenName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const clean = raw
    .replace(/[^A-Za-z\u00C0-\u024F\s'.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
  return clean.length >= 2 ? clean : null;
}

/** The control address must be the assistant platform's own, over https. */
export function trustedControlUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' && (u.hostname === 'vapi.ai' || u.hostname.endsWith('.vapi.ai')) ? u.toString() : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- the person's side

/** What the person hears when they pick up (Jim: "I have a GoFly Texas call on the phone for you. Her name is Susie Johnson."). */
export function ringThroughWhisperLine(callerName: string | null, fromE164: string | null): string {
  const name = spokenName(callerName);
  if (name) return `GoFlyTexas call for you from ${name}. Press 1 to take the call.`;
  const spoken = formatSpoken(fromE164);
  if (!spoken) return 'GoFlyTexas call for you. Press 1 to take the call.';
  return `GoFlyTexas call for you from ${spoken}. Press 1 to take the call.`;
}

/** Both sides of the call meet in a room named after the caller's call. */
export function ringRoom(parentSid: string): string {
  return `rt-${safeQuery(parentSid)}`;
}

const ROOM_ATTRS = 'startConferenceOnEnter="true" endConferenceOnExit="true" beep="false" waitUrl=""';

/** Played to the person when they pick up; no 1 within the wait hangs up their leg. */
export function ringWhisperTwiml(i: {
  baseUrl: string;
  parentSid: string;
  step: number;
  line: string;
  voice?: string;
}): string {
  const action = routeUrl(i.baseUrl, '/api/voice/twilio/ring-through/accept', { parent: i.parentSid, step: i.step });
  return twiml(
    `<Gather input="dtmf" numDigits="1" timeout="${PRESS_ONE_SECONDS}" action="${escapeXml(action)}" method="POST">${say(i.line, i.voice)}</Gather><Hangup/>`,
  );
}

/** The person pressed 1: into the room. */
export function joinAsTeamTwiml(i: { parentSid: string; voice?: string }): string {
  return twiml(
    `${say('Connecting you now.', i.voice)}<Dial><Conference ${ROOM_ATTRS}>${escapeXml(ringRoom(i.parentSid))}</Conference></Dial>`,
  );
}

/**
 * The caller leaves the assistant and joins the room. Recorded the same way an
 * answered call is, so the conversation is transcribed and filed on the lead
 * by the existing recording and dial-result routes.
 */
export function joinAsCallerTwiml(i: { baseUrl: string; parentSid: string; personName: string; voice?: string }): string {
  const recording = routeUrl(i.baseUrl, '/api/voice/twilio/recording');
  const action = routeUrl(i.baseUrl, '/api/voice/twilio/dial-result', { parent: i.parentSid });
  const first = spokenName(i.personName)?.split(' ')[0] ?? 'someone';
  return twiml(
    `${say(`I have ${first} on the line for you now.`, i.voice)}<Dial record="record-from-answer-dual" recordingStatusCallback="${escapeXml(recording)}" recordingStatusCallbackEvent="completed absent" recordingStatusCallbackMethod="POST" action="${escapeXml(action)}" method="POST" timeLimit="3600"><Conference ${ROOM_ATTRS}>${escapeXml(ringRoom(i.parentSid))}</Conference></Dial>`,
  );
}

/** The person pressed 1 but the caller had already gone. */
export function callerGoneTwiml(voice?: string): string {
  return twiml(`${say('The caller hung up before I could connect you. Their details will be in your email.', voice)}<Hangup/>`);
}
