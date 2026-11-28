import { describe, expect, it } from 'vitest';
import {
  REACH_TEAM_TOOL,
  afterAccept,
  afterMiss,
  callerGoneTwiml,
  chooseRingPlan,
  firstRing,
  joinAsCallerTwiml,
  joinAsTeamTwiml,
  ringOutcome,
  ringRoom,
  ringThroughMode,
  ringThroughNote,
  ringThroughOpen,
  ringThroughPageWords,
  ringThroughTimeoutSec,
  ringThroughWhisperLine,
  ringThroughWords,
  ringWhisperTwiml,
  spokenName,
  trustedControlUrl,
  type RingPerson,
} from '../voice/ringThrough';

// Jim 2026-11-27: the caller asks for a person; ring whoever is next on the
// rotation while the assistant keeps talking; about 12 seconds each; "two's
// enough"; press 1 to take the call; whoever does not pick up is skipped.
const mark: RingPerson = { userId: 'u-mark', name: 'Mark King', number: '+18175550101' };
const jim: RingPerson = { userId: 'u-jim', name: 'Jim Lewis', number: '+18175550102' };
const now = new Date('2026-11-30T18:00:00Z'); // noon Central
const base = 'https://www.goflytexas.com';
const SID = 'CA0123456789abcdef';

describe('the switch', () => {
  it('is off unless it is switched on', () => {
    expect(ringThroughMode({})).toBe('off');
    expect(ringThroughMode({ VOICE_RING_THROUGH: 'nonsense' })).toBe('off');
    expect(ringThroughMode({ VOICE_RING_THROUGH: 'business_hours' })).toBe('business_hours');
    expect(ringThroughMode({ VOICE_RING_THROUGH: ' Always ' })).toBe('always');
  });

  it('rings nobody outside business hours unless told to ring at any hour', () => {
    const night = new Date('2026-12-01T04:00:00Z'); // 10 PM Central
    expect(ringThroughOpen('business_hours', now, {})).toBe(true);
    expect(ringThroughOpen('business_hours', night, {})).toBe(false);
    expect(ringThroughOpen('always', night, {})).toBe(true);
    expect(ringThroughOpen('off', now, {})).toBe(false);
  });

  it('rings each person about twelve seconds, kept inside sensible bounds', () => {
    expect(ringThroughTimeoutSec({})).toBe(12);
    expect(ringThroughTimeoutSec({ VOICE_RING_THROUGH_TIMEOUT: '2' })).toBe(8);
    expect(ringThroughTimeoutSec({ VOICE_RING_THROUGH_TIMEOUT: '90' })).toBe(30);
    expect(ringThroughTimeoutSec({ VOICE_RING_THROUGH_TIMEOUT: 'soon' })).toBe(12);
  });
});

describe('who is rung', () => {
  const reserved = new Set(['+19402423072']);

  it('takes the next two people who have a cell, in rotation order', () => {
    const plan = chooseRingPlan(
      [
        { id: 'u-mark', name: 'Mark King', phone: '+18175550101' },
        { id: 'u-jim', name: 'Jim Lewis', phone: '817-555-0102' },
        { id: 'u-kris', name: 'Kristen', phone: '+18175550103' },
      ],
      { reserved, caller: '+12145550000' },
    );
    expect(plan).toEqual([mark, jim]);
  });

  it('passes over a person with no cell, one of our own lines, and the caller themselves', () => {
    const plan = chooseRingPlan(
      [
        { id: 'a', name: 'No Cell', phone: null },
        { id: 'b', name: 'Our Line', phone: '+19402423072' },
        { id: 'c', name: 'The Caller', phone: '+12145550000' },
        { id: 'u-jim', name: 'Jim Lewis', phone: '+18175550102' },
      ],
      { reserved, caller: '+12145550000' },
    );
    expect(plan).toEqual([jim]);
  });

  it('rings a shared cell once', () => {
    const plan = chooseRingPlan(
      [
        { id: 'a', name: 'A', phone: '+18175550101' },
        { id: 'b', name: 'B', phone: '+18175550101' },
      ],
      { reserved, caller: null },
    );
    expect(plan.map((p) => p.userId)).toEqual(['a']);
  });
});

describe('the steps of a ring', () => {
  const start = firstRing({ plan: [mark, jim], callerName: 'Susie Johnson', controlUrl: null, now });

  it('starts on the first person', () => {
    expect(start).toMatchObject({ state: 'ringing', step: 0, legSid: null, callerName: 'Susie Johnson' });
  });

  it('with nobody to ring it is a miss from the start', () => {
    expect(firstRing({ plan: [], callerName: null, controlUrl: null, now }).state).toBe('missed');
  });

  it('moves to the second person, then stops: two is enough', () => {
    const second = afterMiss({ ...start, legSid: 'CAleg1' });
    expect(second).toMatchObject({ state: 'ringing', step: 1, legSid: null });
    expect(afterMiss(second)).toMatchObject({ state: 'missed', step: 1 });
  });

  it('records who took the call', () => {
    expect(afterAccept(afterMiss(start))).toMatchObject({
      state: 'connected',
      answeredUserId: 'u-jim',
      answeredName: 'Jim Lewis',
    });
  });
});

describe('what the ring means for the lead', () => {
  const start = firstRing({ plan: [mark, jim], callerName: null, controlUrl: null, now });

  it('the lead is the person who took it, and whoever was rung first is skipped', () => {
    expect(ringOutcome(afterAccept(afterMiss(start)))).toEqual({
      kind: 'taken',
      userId: 'u-jim',
      name: 'Jim Lewis',
      missed: [mark],
    });
    expect(ringOutcome(afterAccept(start))).toEqual({ kind: 'taken', userId: 'u-mark', name: 'Mark King', missed: [] });
  });

  it('everyone rung is skipped when nobody took it', () => {
    expect(ringOutcome(afterMiss(afterMiss(start)))).toEqual({ kind: 'missed', tried: [mark, jim] });
  });

  it('nobody is skipped when nobody was rung, the ring is still going, or the caller left first', () => {
    expect(ringOutcome(null)).toBeNull();
    expect(ringOutcome(start)).toBeNull();
    expect(ringOutcome({ ...start, state: 'ended' })).toBeNull();
    expect(ringOutcome(firstRing({ plan: [], callerName: null, controlUrl: null, now }))).toBeNull();
  });
});

describe('what the assistant is told each turn', () => {
  const start = firstRing({ plan: [mark], callerName: null, controlUrl: null, now });

  it('may ring only when it is possible, only when asked, and once', () => {
    const note = ringThroughNote({ kind: 'available' });
    expect(note).toContain('reach_team');
    expect(note).toContain('asks to speak to a person');
    expect(note).toContain('Never promise');
  });

  it('is told not to ring when it is not possible', () => {
    expect(ringThroughNote({ kind: 'unavailable' })).toContain('do not use reach_team');
  });

  it('keeps talking while it rings and does not ring twice', () => {
    const note = ringThroughNote({ kind: 'state', state: start });
    expect(note).toContain('ringing right now');
    expect(note).toContain('Do not use reach_team again');
  });

  it('tells the caller once that nobody could be reached', () => {
    const missed = afterMiss(start);
    expect(ringThroughNote({ kind: 'state', state: missed })).toContain('Tell the caller once');
    expect(ringThroughNote({ kind: 'state', state: { ...missed, toldCaller: true } })).toContain('do not say it again');
  });

  it('the tool asks for nothing it must have', () => {
    expect(REACH_TEAM_TOOL.name).toBe('reach_team');
    expect(REACH_TEAM_TOOL.input_schema.required).toEqual([]);
  });
});

describe('what is read out and trusted', () => {
  it('keeps a name to what a name is made of', () => {
    expect(spokenName("  Susie O'Brien-Johnson ")).toBe("Susie O'Brien-Johnson");
    expect(spokenName('Susie <Say>press 9</Say>')).toBe('Susie Say press Say');
    expect(spokenName('')).toBeNull();
    expect(spokenName(42)).toBeNull();
  });

  it('tells the person who is calling and to press 1', () => {
    expect(ringThroughWhisperLine('Susie Johnson', '+12145550000')).toBe(
      'GoFlyTexas call for you from Susie Johnson. Press 1 to take the call.',
    );
    expect(ringThroughWhisperLine(null, '+12144129040')).toBe(
      'GoFlyTexas call for you from two one four, four one two, nine zero four zero. Press 1 to take the call.',
    );
    expect(ringThroughWhisperLine(null, null)).toBe('GoFlyTexas call for you. Press 1 to take the call.');
  });

  it('only talks to the assistant platform at its own https address', () => {
    expect(trustedControlUrl('https://phone-call-websocket.aws-us-west-2-backend-production1.vapi.ai/abc/control')).toContain(
      'vapi.ai/abc/control',
    );
    expect(trustedControlUrl('http://x.vapi.ai/abc/control')).toBeNull();
    expect(trustedControlUrl('https://vapi.ai.evil.example/control')).toBeNull();
    expect(trustedControlUrl('https://169.254.169.254/latest')).toBeNull();
    expect(trustedControlUrl(undefined)).toBeNull();
  });
});

describe('the phone markup', () => {
  it('the person hears the line and has a few seconds to press 1, else their leg ends', () => {
    const xml = ringWhisperTwiml({ baseUrl: base, parentSid: SID, step: 1, line: 'GoFlyTexas call for you.' });
    expect(xml).toContain('<Gather input="dtmf" numDigits="1" timeout="6"');
    expect(xml).toContain(`${base}/api/voice/twilio/ring-through/accept?parent=${SID}&amp;step=1`);
    expect(xml).toContain('GoFlyTexas call for you.');
    expect(xml.endsWith('</Gather><Hangup/></Response>')).toBe(true);
  });

  it('both sides meet in one room named after the caller\'s call, with no hold music and no beep', () => {
    const team = joinAsTeamTwiml({ parentSid: SID });
    const caller = joinAsCallerTwiml({ baseUrl: base, parentSid: SID, personName: 'Mark King' });
    for (const xml of [team, caller]) {
      expect(xml).toContain(`>${ringRoom(SID)}</Conference>`);
      expect(xml).toContain('endConferenceOnExit="true"');
      expect(xml).toContain('beep="false"');
      expect(xml).toContain('waitUrl=""');
    }
    expect(caller).toContain('I have Mark on the line for you now.');
  });

  it('the conversation with the person is recorded and filed like any answered call', () => {
    const caller = joinAsCallerTwiml({ baseUrl: base, parentSid: SID, personName: 'Mark King' });
    expect(caller).toContain('record="record-from-answer-dual"');
    expect(caller).toContain(`recordingStatusCallback="${base}/api/voice/twilio/recording"`);
    expect(caller).toContain(`action="${base}/api/voice/twilio/dial-result?parent=${SID}"`);
    // The person's own leg is not recorded a second time.
    expect(joinAsTeamTwiml({ parentSid: SID })).not.toContain('record=');
  });

  it('a person who presses 1 after the caller has gone is told so', () => {
    expect(callerGoneTwiml()).toContain('The caller hung up before I could connect you.');
    expect(callerGoneTwiml()).toContain('<Hangup/>');
  });
});

describe('what the admin pages say', () => {
  const start = firstRing({ plan: [mark, jim], callerName: null, controlUrl: null, now });

  it('the call row says who was rung and who took it', () => {
    expect(ringThroughWords(null)).toBeNull();
    expect(ringThroughWords(afterAccept(start))).toBe('Asked for a person. Mark King took the call.');
    expect(ringThroughWords(afterAccept(afterMiss(start)))).toBe(
      'Asked for a person. Rang Mark King (no answer), then Jim Lewis took the call.',
    );
    expect(ringThroughWords(afterMiss(afterMiss(start)))).toBe(
      'Asked for a person. Rang Mark King, then Jim Lewis: nobody took it.',
    );
    expect(ringThroughWords({ ...start, state: 'ended' })).toBe(
      'Asked for a person. The caller left while Mark King was being rung.',
    );
  });

  it('On call says it is off, who would be rung, and who has no cell', () => {
    expect(ringThroughPageWords({ mode: 'off', open: false, plan: [], noCell: [], seconds: 12 })).toEqual([
      'Ringing a person through is switched off: a caller who asks for a person is offered a callback.',
    ]);
    const on = ringThroughPageWords({ mode: 'business_hours', open: false, plan: [mark, jim], noCell: ['Kristen'], seconds: 12 });
    expect(on[0]).toContain('rings Mark King, then Jim Lewis (12 seconds each)');
    expect(on[1]).toContain('Outside business hours nobody is rung');
    expect(on[2]).toBe('No cell saved, so cannot be rung: Kristen.');
    const nobody = ringThroughPageWords({ mode: 'always', open: true, plan: [], noCell: ['Mark King'], seconds: 12 });
    expect(nobody[0]).toContain('cannot be put through yet');
  });
});
