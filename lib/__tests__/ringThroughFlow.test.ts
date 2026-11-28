import { describe, expect, it } from 'vitest';
import { NOBODY_LINE, ringOutcome, type RingPerson, type RingThroughState } from '../voice/ringThrough';
import { onAccept, onCallerGone, onLegEnded, startRingThrough, type RingDeps } from '../voice/ringThroughFlow';
import type { RingStore } from '../voice/ringThroughStore';
import type { TwilioRest } from '../voice/twilioRest';

// The order of events in a ring-through, with the database and the phone
// network replaced by stand-ins that keep the same rules: every change to the
// stored state is conditional on the state it expects to find.
const mark: RingPerson = { userId: 'u-mark', name: 'Mark King', number: '+18175550101' };
const jim: RingPerson = { userId: 'u-jim', name: 'Jim Lewis', number: '+18175550102' };
const SID = 'CAparent';
const base = 'https://www.goflytexas.com';

type Row = { state: RingThroughState | null; fromNumber: string | null; ended: boolean; answeredBy: 'ai' | 'human' };

function world(opts?: { failCreate?: (to: string) => boolean; failUpdate?: boolean; twilio?: boolean; control?: boolean }) {
  const row: Row = { state: null, fromNumber: '+12145550000', ended: false, answeredBy: 'ai' };
  const placed: { to: string; from: string; url: string; statusCallback: string; timeoutSec: number; sid: string }[] = [];
  const updates: { sid: string; twiml?: string; status?: string }[] = [];
  const said: string[] = [];
  const ringingAt = (step: number) => row.state?.state === 'ringing' && row.state.step === step;
  const store: RingStore = {
    async get() {
      return { state: row.state, fromNumber: row.fromNumber, ended: row.ended };
    },
    async begin(_sid, state) {
      if (row.state || row.ended) return false;
      row.state = state;
      return true;
    },
    async setLeg(_sid, step, legSid) {
      if (ringingAt(step)) row.state = { ...row.state!, legSid };
    },
    async swap(_sid, step, next) {
      if (!ringingAt(step)) return false;
      row.state = next;
      return true;
    },
    async claim(_sid, step, next) {
      if (!ringingAt(step) || row.ended) return false;
      row.state = next;
      row.answeredBy = 'human';
      return true;
    },
    async unclaim(_sid, next) {
      if (row.state?.state !== 'connected') return;
      row.state = next;
      row.answeredBy = 'ai';
    },
    async endIfRinging() {
      if (row.state?.state !== 'ringing') return null;
      const was = row.state;
      row.state = { ...was, state: 'ended' };
      return was;
    },
    async markTold() {
      if (row.state) row.state = { ...row.state, toldCaller: true };
    },
  };
  const twilio: TwilioRest = {
    async createCall(i) {
      if (opts?.failCreate?.(i.to)) throw new Error('twilio Calls.json 400: 21215');
      const sid = `CAleg${placed.length + 1}`;
      placed.push({ ...i, sid });
      return { sid };
    },
    async updateCall(sid, i) {
      if (opts?.failUpdate) throw new Error('twilio Calls 404: call is not in-progress');
      updates.push({ sid, ...('twiml' in i ? { twiml: i.twiml } : { status: i.status }) });
    },
  };
  const deps: RingDeps = {
    store,
    twilio: opts?.twilio === false ? null : twilio,
    say: async (_url, text) => {
      said.push(text);
      return true;
    },
    baseUrl: base,
    from: '+19402423072',
    timeoutSec: 12,
    now: () => new Date('2026-11-30T18:00:00Z'),
  };
  const start = (plan: RingPerson[]) =>
    startRingThrough(deps, {
      parentSid: SID,
      plan,
      callerName: 'Susie Johnson',
      controlUrl: opts?.control ? 'https://x.vapi.ai/call/control' : null,
    });
  return { row, placed, updates, said, deps, start };
}

describe('starting the ring', () => {
  it('rings the first person from our own number for twelve seconds', async () => {
    const w = world();
    expect(await w.start([mark, jim])).toBe('ringing');
    expect(w.placed).toHaveLength(1);
    expect(w.placed[0]).toMatchObject({ to: mark.number, from: '+19402423072', timeoutSec: 12 });
    expect(w.placed[0].url).toBe(`${base}/api/voice/twilio/ring-through/whisper?parent=${SID}&step=0`);
    expect(w.placed[0].statusCallback).toBe(`${base}/api/voice/twilio/ring-through/leg-status?parent=${SID}&step=0`);
    expect(w.row.state).toMatchObject({ state: 'ringing', step: 0, legSid: 'CAleg1' });
  });

  it('happens once per call', async () => {
    const w = world();
    await w.start([mark]);
    expect(await w.start([mark])).toBe('already');
    expect(w.placed).toHaveLength(1);
  });

  it('with nobody to ring it is a miss and no phone rings', async () => {
    const w = world();
    expect(await w.start([])).toBe('missed');
    expect(w.placed).toHaveLength(0);
    expect(w.row.state?.state).toBe('missed');
  });

  it('does not start once the caller has gone', async () => {
    const w = world();
    w.row.ended = true;
    expect(await w.start([mark])).toBe('already');
    expect(w.placed).toHaveLength(0);
  });

  it('a cell that cannot be rung at all counts as a miss and the next person is rung', async () => {
    const w = world({ failCreate: (to) => to === mark.number });
    expect(await w.start([mark, jim])).toBe('ringing');
    expect(w.placed.map((p) => p.to)).toEqual([jim.number]);
    expect(w.row.state).toMatchObject({ state: 'ringing', step: 1, legSid: 'CAleg1' });
  });

  it('with the phone account not set up it is a miss, not an error', async () => {
    const w = world({ twilio: false });
    expect(await w.start([mark, jim])).toBe('missed');
    expect(w.row.state?.state).toBe('missed');
  });
});

describe('a person who does not take it', () => {
  it('the second person is rung, and after them nobody: two is enough', async () => {
    const w = world();
    await w.start([mark, jim]);
    expect(await onLegEnded(w.deps, { parentSid: SID, step: 0 })).toBe('ringing');
    expect(w.placed.map((p) => p.to)).toEqual([mark.number, jim.number]);
    expect(w.row.state).toMatchObject({ state: 'ringing', step: 1, legSid: 'CAleg2' });
    expect(await onLegEnded(w.deps, { parentSid: SID, step: 1 })).toBe('missed');
    expect(w.placed).toHaveLength(2);
    expect(ringOutcome(w.row.state)).toEqual({ kind: 'missed', tried: [mark, jim] });
  });

  it('a late or repeated callback for a step that is over changes nothing', async () => {
    const w = world();
    await w.start([mark, jim]);
    await onLegEnded(w.deps, { parentSid: SID, step: 0 });
    expect(await onLegEnded(w.deps, { parentSid: SID, step: 0 })).toBe('ignored');
    expect(w.placed).toHaveLength(2);
  });

  it('the caller is told when nobody could be reached, when the assistant can be made to speak', async () => {
    const w = world({ control: true });
    await w.start([mark]);
    await onLegEnded(w.deps, { parentSid: SID, step: 0 });
    expect(w.said).toEqual([NOBODY_LINE]);
    expect(w.row.state?.toldCaller).toBe(true);
  });

  it('without that, the assistant is left to say it on its next turn', async () => {
    const w = world();
    await w.start([mark]);
    await onLegEnded(w.deps, { parentSid: SID, step: 0 });
    expect(w.said).toEqual([]);
    expect(w.row.state?.toldCaller).toBeUndefined();
  });
});

describe('pressing 1', () => {
  it('moves the caller out of the assistant call into the room, recorded, and the call is that person\'s', async () => {
    const w = world();
    await w.start([mark, jim]);
    const got = await onAccept(w.deps, { parentSid: SID, step: 0 });
    expect(got).toEqual({ ok: true, person: mark });
    expect(w.updates).toHaveLength(1);
    expect(w.updates[0].sid).toBe(SID);
    expect(w.updates[0].twiml).toContain('<Conference');
    expect(w.updates[0].twiml).toContain('record="record-from-answer-dual"');
    expect(w.updates[0].twiml).toContain('I have Mark on the line for you now.');
    expect(w.row.answeredBy).toBe('human');
    expect(ringOutcome(w.row.state)).toEqual({ kind: 'taken', userId: 'u-mark', name: 'Mark King', missed: [] });
  });

  it('the second person taking it leaves the first one skipped', async () => {
    const w = world();
    await w.start([mark, jim]);
    await onLegEnded(w.deps, { parentSid: SID, step: 0 });
    expect(await onAccept(w.deps, { parentSid: SID, step: 1 })).toEqual({ ok: true, person: jim });
    expect(ringOutcome(w.row.state)).toEqual({ kind: 'taken', userId: 'u-jim', name: 'Jim Lewis', missed: [mark] });
  });

  it('a press for a step that is already over takes nothing', async () => {
    const w = world();
    await w.start([mark, jim]);
    await onLegEnded(w.deps, { parentSid: SID, step: 0 });
    expect(await onAccept(w.deps, { parentSid: SID, step: 0 })).toEqual({ ok: false });
    expect(w.updates).toHaveLength(0);
    expect(w.row.state).toMatchObject({ state: 'ringing', step: 1 });
  });

  it('the leg ending after the person took the call does not ring anyone else', async () => {
    const w = world();
    await w.start([mark, jim]);
    await onAccept(w.deps, { parentSid: SID, step: 0 });
    expect(await onLegEnded(w.deps, { parentSid: SID, step: 0 })).toBe('ignored');
    expect(w.placed).toHaveLength(1);
    expect(w.row.state?.state).toBe('connected');
  });

  it('after the caller has hung up it takes nothing', async () => {
    const w = world();
    await w.start([mark]);
    w.row.ended = true;
    expect(await onAccept(w.deps, { parentSid: SID, step: 0 })).toEqual({ ok: false });
    expect(w.row.answeredBy).toBe('ai');
  });

  it('if the caller cannot be moved after all, the call goes back to being the assistant\'s and nobody is skipped', async () => {
    const w = world({ failUpdate: true });
    await w.start([mark]);
    expect(await onAccept(w.deps, { parentSid: SID, step: 0 })).toEqual({ ok: false });
    expect(w.row.answeredBy).toBe('ai');
    expect(w.row.state?.state).toBe('ended');
    expect(ringOutcome(w.row.state)).toBeNull();
  });
});

describe('the caller leaves while it rings', () => {
  it('the cell that is ringing is hung up and nobody is counted as having missed it', async () => {
    const w = world();
    await w.start([mark, jim]);
    await onCallerGone(w.deps, SID);
    expect(w.updates).toEqual([{ sid: 'CAleg1', status: 'completed' }]);
    expect(w.row.state?.state).toBe('ended');
    expect(ringOutcome(w.row.state)).toBeNull();
    // The hung-up leg's own callback then arrives and must not ring the second person.
    expect(await onLegEnded(w.deps, { parentSid: SID, step: 0 })).toBe('ignored');
    expect(w.placed).toHaveLength(1);
  });

  it('does nothing on a call where nobody was being rung', async () => {
    const w = world();
    await onCallerGone(w.deps, SID);
    expect(w.updates).toEqual([]);
    await w.start([mark]);
    await onAccept(w.deps, { parentSid: SID, step: 0 });
    await onCallerGone(w.deps, SID);
    expect(w.row.state?.state).toBe('connected');
  });
});
