import { describe, expect, it } from 'vitest';
import fixture from './fixtures/vapi-end-of-call.json';
import { normalizeRetellCallEnded, normalizeVapiEndOfCall, parseTranscriptText } from '../voice/normalize';

describe('normalizeVapiEndOfCall', () => {
  it('maps the end-of-call-report fixture', () => {
    const n = normalizeVapiEndOfCall(fixture);
    expect(n).not.toBeNull();
    expect(n!.platform).toBe('vapi');
    expect(n!.platformCallId).toBe('vapi-call-fixture-001');
    expect(n!.fromNumber).toBe('+18175550142');
    expect(n!.toNumber).toBe('+19405550199');
    expect(n!.durationSec).toBe(102);
    expect(n!.endedReason).toBe('customer-ended-call');
    expect(n!.recordingUrl).toMatch(/fixture-001\.wav$/);
    expect(n!.startedAt?.toISOString()).toBe('2026-08-28T20:31:10.000Z');
    expect(n!.platformSummary).toMatch(/discovery/);
  });
  it('maps bot→assistant, keeps user, drops system, preserves timing', () => {
    const n = normalizeVapiEndOfCall(fixture)!;
    expect(n.transcript.map((t) => t.role)).toEqual([
      'assistant',
      'user',
      'assistant',
      'user',
      'assistant',
    ]);
    expect(n.transcript[1].text).toMatch(/Sarah Mitchell/);
    expect(n.transcript[1].at).toBe(9.8);
  });
  it('falls back to the text transcript when no messages array exists', () => {
    const n = normalizeVapiEndOfCall({
      message: {
        type: 'end-of-call-report',
        call: { id: 'c2' },
        artifact: { transcript: 'AI: Hello there\nUser: Hi I need help\nwith rentals' },
      },
    })!;
    expect(n.transcript).toEqual([
      { role: 'assistant', text: 'Hello there' },
      { role: 'user', text: 'Hi I need help with rentals' },
    ]);
  });
  it('derives duration from timestamps and returns null without a call id', () => {
    const n = normalizeVapiEndOfCall({
      message: {
        type: 'end-of-call-report',
        call: { id: 'c3' },
        startedAt: '2026-08-28T10:00:00Z',
        endedAt: '2026-08-28T10:00:45Z',
      },
    })!;
    expect(n.durationSec).toBe(45);
    expect(normalizeVapiEndOfCall({ message: { type: 'end-of-call-report' } })).toBeNull();
    expect(normalizeVapiEndOfCall('nope')).toBeNull();
  });
});

describe('parseTranscriptText', () => {
  it('handles Caller/Assistant labels too', () => {
    expect(parseTranscriptText('Assistant: a\nCaller: b')).toEqual([
      { role: 'assistant', text: 'a' },
      { role: 'user', text: 'b' },
    ]);
  });
});

describe('normalizeRetellCallEnded (future swap)', () => {
  it('maps the core fields', () => {
    const n = normalizeRetellCallEnded({
      event: 'call_ended',
      call: {
        call_id: 'r1',
        from_number: '+18175550142',
        to_number: '+19405550199',
        start_timestamp: 1787950000000,
        end_timestamp: 1787950030000,
        transcript_object: [
          { role: 'agent', content: 'Hi' },
          { role: 'user', content: 'Hello I need info' },
        ],
        recording_url: 'https://r/rec.wav',
        disconnection_reason: 'user_hangup',
      },
    })!;
    expect(n.platform).toBe('retell');
    expect(n.durationSec).toBe(30);
    expect(n.transcript[0]).toEqual({ role: 'assistant', text: 'Hi' });
  });
});
