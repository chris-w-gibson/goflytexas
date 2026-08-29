import { describe, expect, it } from 'vitest';
import {
  CALL_CONNECTED,
  classifyCall,
  flattenContent,
  hasMeaningfulSpeech,
  toAnthropicMessages,
  turnsToPlainText,
} from '../voice/transcript';

describe('toAnthropicMessages', () => {
  it('drops system/tool roles and keeps the spoken greeting behind a synthetic user turn', () => {
    const out = toAnthropicMessages([
      { role: 'system', content: 'ignored' },
      { role: 'assistant', content: 'Hi, thanks for calling.' },
      { role: 'user', content: 'Hello there' },
      { role: 'tool', content: 'x' },
    ]);
    expect(out).toEqual([
      { role: 'user', content: CALL_CONNECTED },
      { role: 'assistant', content: 'Hi, thanks for calling.' },
      { role: 'user', content: 'Hello there' },
    ]);
  });
  it('merges consecutive same-role turns and flattens content parts', () => {
    const out = toAnthropicMessages([
      { role: 'user', content: 'one' },
      { role: 'user', content: [{ type: 'text', text: 'two' }] },
      { role: 'assistant', content: 'ok' },
      { role: 'user', content: '' },
      { role: 'user', content: 'three' },
    ]);
    expect(out).toEqual([
      { role: 'user', content: 'one\ntwo' },
      { role: 'assistant', content: 'ok' },
      { role: 'user', content: 'three' },
    ]);
  });
  it('caps length and still starts with a user turn', () => {
    // m0..m8: even = user, odd = assistant, so the history ends on a user turn.
    const msgs = Array.from({ length: 9 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `m${i}`,
    }));
    const out = toAnthropicMessages(msgs, { maxMessages: 3 });
    expect(out[0].role).toBe('user');
    expect(out.length).toBeLessThanOrEqual(3);
    expect(out[out.length - 1]).toEqual({ role: 'user', content: 'm8' });
    // A window that starts on an assistant turn is trimmed to start on a user turn.
    expect(toAnthropicMessages(msgs, { maxMessages: 2 })).toEqual([{ role: 'user', content: 'm8' }]);
  });
  it('flattens odd content shapes to empty strings safely', () => {
    expect(flattenContent(null)).toBe('');
    expect(flattenContent([{ type: 'image_url' }])).toBe('');
  });
});

describe('classifyCall', () => {
  const real = [
    { role: 'assistant' as const, text: 'Hi' },
    { role: 'user' as const, text: 'I want to book a discovery flight' },
  ];
  it('treats very short calls as no_message even with speech', () => {
    expect(classifyCall({ durationSec: 6, turns: real })).toBe('no_message');
  });
  it('treats calls with no meaningful caller speech as no_message', () => {
    expect(classifyCall({ durationSec: 40, turns: [{ role: 'user', text: 'hello' }] })).toBe('no_message');
    expect(classifyCall({ durationSec: 40, turns: [] })).toBe('no_message');
  });
  it('treats a real conversation as a message', () => {
    expect(classifyCall({ durationSec: 40, turns: real })).toBe('message');
    expect(classifyCall({ durationSec: null, turns: real })).toBe('message');
  });
  it('hasMeaningfulSpeech needs ≥3 words from the caller', () => {
    expect(hasMeaningfulSpeech([{ role: 'user', text: 'yes please now' }])).toBe(true);
    expect(hasMeaningfulSpeech([{ role: 'assistant', text: 'a long assistant line here' }])).toBe(false);
  });
});

describe('turnsToPlainText', () => {
  it('labels roles for the extractor', () => {
    expect(turnsToPlainText([{ role: 'assistant', text: 'Hi' }, { role: 'user', text: 'Yo' }])).toBe(
      'Assistant: Hi\nCaller: Yo',
    );
  });
});
