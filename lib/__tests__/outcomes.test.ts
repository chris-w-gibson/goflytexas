import { describe, expect, it } from 'vitest';
import { composeOutcomeNote } from '../outcomes';

describe('composeOutcomeNote', () => {
  it('joins selected outcomes with the free-text note', () => {
    expect(composeOutcomeNote(['phone', 'text'], 'wants Saturday am')).toBe(
      'Made contact by phone · Sent a text — wants Saturday am',
    );
  });

  it('works with outcomes only', () => {
    expect(composeOutcomeNote(['voicemail'], '  ')).toBe('Called and left a voicemail');
  });

  it('works with a note only', () => {
    expect(composeOutcomeNote([], 'spoke at the airport')).toBe('spoke at the airport');
  });

  it('falls back to a plain ack when nothing was entered', () => {
    expect(composeOutcomeNote([], '')).toBe('Marked as reached out.');
  });

  it('drops unknown outcome ids', () => {
    expect(composeOutcomeNote(['phone', 'bogus'], '')).toBe('Made contact by phone');
  });
});
