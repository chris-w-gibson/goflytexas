import { describe, expect, it } from 'vitest';
import { VOICE_PERSONA, wrapUpInstruction } from '../voicePersona';

// Jim 2026-11-22: a set callback time is a window the team will miss.
describe('VOICE_PERSONA', () => {
  it('tells the assistant never to ask for or agree to a callback time', () => {
    expect(VOICE_PERSONA).toContain('Never ask when they would like to be called back');
    expect(VOICE_PERSONA).not.toMatch(/ask the best day and time|best time/i);
  });
});

describe('wrapUpInstruction', () => {
  it.each(['turns', 'time'] as const)('confirms only the callback number when out of %s', (reason) => {
    expect(wrapUpInstruction(reason)).toContain('confirm the callback number if you do not have it yet');
    expect(wrapUpInstruction(reason)).not.toMatch(/best time/i);
  });
});
