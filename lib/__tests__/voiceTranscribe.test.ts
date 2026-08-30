import { describe, expect, it } from 'vitest';
import fixture from './fixtures/deepgram-multichannel.json';
import { deepgramToTurns, twilioTranscribeOpts } from '../voice/transcribe';

describe('deepgramToTurns', () => {
  it('maps channels to roles, interleaves by time, merges close same-role utterances', () => {
    const turns = deepgramToTurns(fixture, { callerChannel: 0 });
    expect(turns.map((t) => t.role)).toEqual(['assistant', 'user', 'assistant', 'assistant', 'user']);
    expect(turns[1]).toEqual({ role: 'user', text: "Hi, I'm calling about a discovery flight. For my husband.", at: 2.3 });
    // 2.5 s gap between the two staff utterances → not merged
    expect(turns[2].text).toBe('Sure, let me check the schedule.');
    expect(turns[3].text).toBe('Tuesday at three is open.');
  });
  it('falls back to per-channel words when utterances are absent', () => {
    const turns = deepgramToTurns({
      results: {
        channels: [
          { alternatives: [{ words: [{ punctuated_word: 'Hello', start: 0, end: 0.3 }, { punctuated_word: 'there.', start: 0.4, end: 0.7 }, { punctuated_word: 'Later.', start: 5, end: 5.3 }] }] },
          { alternatives: [{ words: [{ word: 'hi', start: 1, end: 1.2 }] }] },
        ],
      },
    });
    expect(turns).toEqual([
      { role: 'user', text: 'Hello there.', at: 0 },
      { role: 'assistant', text: 'hi', at: 1 },
      { role: 'user', text: 'Later.', at: 5 },
    ]);
  });
  it('returns [] on garbage', () => {
    expect(deepgramToTurns(null)).toEqual([]);
    expect(deepgramToTurns({ results: {} })).toEqual([]);
    expect(deepgramToTurns({ results: { utterances: [{ transcript: '   ' }] } })).toEqual([]);
  });
});

describe('twilioTranscribeOpts', () => {
  it('fails loudly when a secret is missing', () => {
    expect(() => twilioTranscribeOpts({})).toThrow(/TWILIO/);
    expect(() => twilioTranscribeOpts({ TWILIO_ACCOUNT_SID: 'a', TWILIO_AUTH_TOKEN: 'b' })).toThrow(/DEEPGRAM/);
    expect(twilioTranscribeOpts({ TWILIO_ACCOUNT_SID: 'a', TWILIO_AUTH_TOKEN: 'b', DEEPGRAM_API_KEY: 'c' }).model).toBe('nova-3');
  });
});
