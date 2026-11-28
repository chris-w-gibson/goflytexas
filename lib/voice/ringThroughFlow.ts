import {
  NOBODY_LINE,
  afterAccept,
  afterMiss,
  firstRing,
  joinAsCallerTwiml,
  type RingPerson,
  type RingThroughState,
} from './ringThrough';
import type { RingStore } from './ringThroughStore';
import { routeUrl } from './twilio';
import type { TwilioRest } from './twilioRest';

/**
 * The moves of a ring-through, with storage and the phone network passed in so
 * the order of events is unit-tested without either.
 *
 *   start → ring plan[0] → (no 1 pressed) → ring plan[1] → (no 1 pressed) → missed
 *                        ↘ 1 pressed → the caller is moved into the room → connected
 */
export type RingDeps = {
  store: RingStore;
  /** Null when Twilio is not configured: nobody can be rung. */
  twilio: TwilioRest | null;
  /** Makes the assistant say a line on the live call; false when it could not. */
  say: (controlUrl: string, text: string) => Promise<boolean>;
  baseUrl: string;
  /** Our own Twilio number, shown to the person being rung. */
  from: string | null;
  timeoutSec: number;
  voice?: string;
  now: () => Date;
};

async function tellCaller(deps: RingDeps, parentSid: string, state: RingThroughState): Promise<void> {
  if (!state.controlUrl) return;
  if (await deps.say(state.controlUrl, NOBODY_LINE)) await deps.store.markTold(parentSid).catch(() => undefined);
}

/** Ring the person at `state.step`; a cell that cannot be rung at all counts as a miss. */
async function ringFrom(deps: RingDeps, parentSid: string, start: RingThroughState): Promise<'ringing' | 'missed' | 'changed'> {
  let s = start;
  for (;;) {
    const person = s.plan[s.step];
    try {
      if (!deps.twilio || !deps.from) throw new Error('twilio is not configured');
      const { sid } = await deps.twilio.createCall({
        to: person.number,
        from: deps.from,
        url: routeUrl(deps.baseUrl, '/api/voice/twilio/ring-through/whisper', { parent: parentSid, step: s.step }),
        statusCallback: routeUrl(deps.baseUrl, '/api/voice/twilio/ring-through/leg-status', { parent: parentSid, step: s.step }),
        timeoutSec: deps.timeoutSec,
      });
      await deps.store.setLeg(parentSid, s.step, sid);
      return 'ringing';
    } catch (err) {
      console.error('ring-through: could not ring step', s.step, err instanceof Error ? err.message : err);
      const next = afterMiss(s);
      if (!(await deps.store.swap(parentSid, s.step, next))) return 'changed';
      if (next.state !== 'ringing') {
        await tellCaller(deps, parentSid, next);
        return 'missed';
      }
      s = next;
    }
  }
}

/** The assistant asked for a person to be rung. Once per call. */
export async function startRingThrough(
  deps: RingDeps,
  i: { parentSid: string; plan: RingPerson[]; callerName: string | null; controlUrl: string | null },
): Promise<'ringing' | 'missed' | 'already' | 'changed'> {
  const state = firstRing({ plan: i.plan, callerName: i.callerName, controlUrl: i.controlUrl, now: deps.now() });
  if (!(await deps.store.begin(i.parentSid, state))) return 'already';
  if (state.state !== 'ringing') return 'missed';
  return ringFrom(deps, i.parentSid, state);
}

/** A person's leg ended without a 1: no answer, busy, declined, voicemail, or they passed. */
export async function onLegEnded(
  deps: RingDeps,
  i: { parentSid: string; step: number },
): Promise<'ringing' | 'missed' | 'ignored' | 'changed'> {
  const row = await deps.store.get(i.parentSid);
  const cur = row?.state;
  if (!cur || cur.state !== 'ringing' || cur.step !== i.step) return 'ignored';
  const next = afterMiss(cur);
  if (!(await deps.store.swap(i.parentSid, i.step, next))) return 'ignored';
  if (next.state !== 'ringing') {
    await tellCaller(deps, i.parentSid, next);
    return 'missed';
  }
  return ringFrom(deps, i.parentSid, next);
}

/** The person pressed 1. First to press wins; the caller is moved out of the assistant's call into the room. */
export async function onAccept(
  deps: RingDeps,
  i: { parentSid: string; step: number },
): Promise<{ ok: true; person: RingPerson } | { ok: false }> {
  const row = await deps.store.get(i.parentSid);
  const cur = row?.state;
  if (!cur || cur.state !== 'ringing' || cur.step !== i.step || !deps.twilio) return { ok: false };
  const person = cur.plan[i.step];
  const next = afterAccept(cur);
  if (!(await deps.store.claim(i.parentSid, i.step, next))) return { ok: false };
  try {
    await deps.twilio.updateCall(i.parentSid, {
      twiml: joinAsCallerTwiml({ baseUrl: deps.baseUrl, parentSid: i.parentSid, personName: person.name, voice: deps.voice }),
    });
  } catch (err) {
    // The caller hung up in the moment between the press and the move.
    console.error('ring-through: could not move the caller', err instanceof Error ? err.message : err);
    await deps.store.unclaim(i.parentSid, { ...cur, state: 'ended' }).catch(() => undefined);
    return { ok: false };
  }
  return { ok: true, person };
}

/** The caller's call ended. A cell that is still ringing for them is hung up. */
export async function onCallerGone(deps: RingDeps, parentSid: string): Promise<void> {
  const was = await deps.store.endIfRinging(parentSid);
  if (!was?.legSid || !deps.twilio) return;
  await deps.twilio.updateCall(was.legSid, { status: 'completed' }).catch(() => undefined);
}
