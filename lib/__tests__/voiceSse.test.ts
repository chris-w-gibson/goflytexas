import { describe, expect, it } from 'vitest';
import { completionJson, SSE_DONE, sseChunk } from '../voice/openaiSse';
import { formatCallDuration } from '../followup';

describe('sseChunk', () => {
  it('emits an OpenAI-shaped delta frame', () => {
    const frame = sseChunk('chatcmpl-1', 'goflytexas-voice', 'Hi ', null, 123);
    expect(frame.startsWith('data: ')).toBe(true);
    expect(frame.endsWith('\n\n')).toBe(true);
    const json = JSON.parse(frame.slice(6));
    expect(json.object).toBe('chat.completion.chunk');
    expect(json.choices[0].delta).toEqual({ role: 'assistant', content: 'Hi ' });
    expect(json.choices[0].finish_reason).toBeNull();
    expect(json.created).toBe(123);
  });
  it('emits an empty delta with finish_reason stop, and the DONE sentinel', () => {
    const json = JSON.parse(sseChunk('id', 'm', null, 'stop').slice(6));
    expect(json.choices[0].delta).toEqual({});
    expect(json.choices[0].finish_reason).toBe('stop');
    expect(SSE_DONE).toBe('data: [DONE]\n\n');
  });
  it('builds a non-streaming completion', () => {
    const c = completionJson('id', 'm', 'hello', 1) as { choices: Array<{ message: { content: string } }> };
    expect(c.choices[0].message.content).toBe('hello');
  });
});

describe('formatCallDuration', () => {
  it('formats seconds and minutes', () => {
    expect(formatCallDuration(0)).toBe('0s');
    expect(formatCallDuration(48)).toBe('48s');
    expect(formatCallDuration(102)).toBe('1m 42s');
    expect(formatCallDuration(720)).toBe('12m');
    expect(formatCallDuration(null)).toBe('—');
  });
});
