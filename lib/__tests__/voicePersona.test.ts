import { describe, expect, it } from 'vitest';
import { callContextNote, VOICE_PERSONA, wrapUpInstruction } from '../voicePersona';
import { formatSpoken } from '../voice/phone';

// Jim 2026-11-22: a set callback time is a window the team will miss.
describe('VOICE_PERSONA', () => {
  it('tells the assistant never to ask for or agree to a callback time', () => {
    expect(VOICE_PERSONA).toContain('Never ask when they would like to be called back');
    expect(VOICE_PERSONA).not.toMatch(/ask the best day and time|best time/i);
  });
});

describe('wrapUpInstruction', () => {
  it.each(['turns', 'time'] as const)('confirms only the callback number when out of %s', (reason) => {
    expect(wrapUpInstruction(reason)).toContain('confirm the callback number only if the caller has not confirmed it yet');
    expect(wrapUpInstruction(reason)).toContain('do not say the number again');
    expect(wrapUpInstruction(reason)).not.toMatch(/best time/i);
  });
});

describe('how a phone number is said', () => {
  // Jim 11/25: the assistant said "two fourteen, four twelve, nine zero forty".
  it('is one digit at a time, never paired up, and only once', () => {
    expect(VOICE_PERSONA).toContain('"nine four zero, nine zero five, three zero nine zero"');
    expect(VOICE_PERSONA).toContain('Say the callback number once');
    expect(VOICE_PERSONA).not.toContain('Phone numbers as spoken digits: "nine forty');
  });

  it('hands the caller ID to the assistant already in words', () => {
    expect(callContextNote({ callerSpoken: formatSpoken('+12144129040'), turn: 2, maxTurns: 16 })).toBe(
      "[Call details: The caller's number from caller ID, written the way to say it, is two one four, four one two, nine zero four zero. This is assistant turn 2 of 16.]",
    );
  });
});
