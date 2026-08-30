import { describe, expect, it } from 'vitest';
import {
  EXTRACTION_SYSTEM,
  extractionSystemFor,
  fallbackExtraction,
  humanCallExtractionSchema,
  humanExtractionSystem,
  schemaFor,
} from '../voice/extract';
import { normalizeFromCallRow, normalizeTwilioCall, normalizeVapiEndOfCall, parseTranscriptText } from '../voice/normalize';
import { classifyHumanCall, hasAnySpeech, turnsToPlainText } from '../voice/transcript';
import fixture from './fixtures/vapi-end-of-call.json';

describe('human-answered classification and labels', () => {
  const talk = [
    { role: 'assistant' as const, text: 'GoFlyTexas, Jim.' },
    { role: 'user' as const, text: 'Hi.' },
  ];
  it('keeps short real conversations, drops instant drops and silence', () => {
    expect(classifyHumanCall({ durationSec: 12, turns: talk })).toBe('message');
    expect(classifyHumanCall({ durationSec: 3, turns: talk })).toBe('no_message');
    expect(classifyHumanCall({ durationSec: 40, turns: [] })).toBe('no_message');
    expect(hasAnySpeech([{ role: 'assistant', text: '   ' }])).toBe(false);
  });
  it('labels the staff member by name', () => {
    expect(turnsToPlainText(talk, { assistantLabel: 'Jim' })).toBe('Jim: GoFlyTexas, Jim.\nCaller: Hi.');
    expect(turnsToPlainText(talk)).toBe('Assistant: GoFlyTexas, Jim.\nCaller: Hi.');
  });
});

describe('extraction modes', () => {
  it('selects the human prompt and schema', () => {
    const sys = extractionSystemFor({ kind: 'human', staffName: 'Jim' });
    expect(sys).toBe(humanExtractionSystem('Jim'));
    expect(sys).toContain('"Jim:"');
    expect(sys).toContain('followUps');
    expect(sys).toContain('is NOT spam');
    expect(extractionSystemFor({ kind: 'ai' })).toBe(EXTRACTION_SYSTEM);
    expect(EXTRACTION_SYSTEM).not.toContain('followUps');
    expect(schemaFor({ kind: 'human', staffName: 'Jim' })).toBe(humanCallExtractionSchema);
  });
  it('human schema requires followUps/booking; fallback carries the staff name', () => {
    const base = { summary: 'x', callerName: null, callbackPhone: null, interest: null, preferredTime: null, spam: false, spamReason: null };
    expect(humanCallExtractionSchema.safeParse(base).success).toBe(false);
    expect(humanCallExtractionSchema.safeParse({ ...base, followUps: ['a'], booking: null }).success).toBe(true);
    const fb = fallbackExtraction([{ role: 'user', text: 'rent a 172' }], '+18175550142', { kind: 'human', staffName: 'Jim' });
    expect(fb.summary).toMatch(/^Jim answered\. Caller said/);
    expect(fb.followUps).toEqual([]);
    expect(fb.booking).toBeNull();
  });
});

describe('normalization for Phase 2', () => {
  it('Vapi rows are AI-answered and carry the Twilio parent SID when present', () => {
    const n = normalizeVapiEndOfCall(fixture)!;
    expect(n.answeredBy).toBe('ai');
    expect(n.parentCallId).toBeNull();
    const withParent = normalizeVapiEndOfCall({ message: { type: 'end-of-call-report', call: { id: 'v1', phoneCallProviderId: 'CA777' } } })!;
    expect(withParent.parentCallId).toBe('CA777');
  });
  it('normalizeTwilioCall derives duration and normalizes numbers', () => {
    const n = normalizeTwilioCall({
      callSid: 'CA1',
      from: '(817) 555-0142',
      to: '9402423072',
      forwardedFrom: '+19409053090',
      startedAt: new Date('2026-08-29T15:00:00Z'),
      endedAt: new Date('2026-08-29T15:03:30Z'),
      durationSec: null,
      endedReason: 'dial:completed',
      answeredBy: 'human',
      answeredByName: 'Jim',
      recordingUrl: 'https://api.twilio.com/rec/RE1',
      transcript: [],
    });
    expect(n).toMatchObject({ platform: 'twilio', platformCallId: 'CA1', fromNumber: '+18175550142', toNumber: '+19402423072', forwardedFrom: '+19409053090', durationSec: 210, answeredBy: 'human', answeredByName: 'Jim' });
  });
  it('normalizeFromCallRow defaults answeredBy by platform', () => {
    const base = { id: 'x', platformCallId: 'p', leadId: null, fromNumber: null, toNumber: null, forwardedFrom: null, startedAt: null, endedAt: null, durationSec: null, status: 'received', endedReason: null, recordingUrl: null, transcript: null, summary: null, extracted: null, rawPayload: null, answeredBy: null, answeredByName: null, parentCallId: null, recordingSid: null, dialCallSid: null, transcriptionStatus: null, forwardedToAiAt: null, createdAt: new Date(), updatedAt: new Date() };
    expect(normalizeFromCallRow({ ...base, platform: 'twilio' } as never).answeredBy).toBe('none');
    expect(normalizeFromCallRow({ ...base, platform: 'vapi' } as never).answeredBy).toBe('ai');
  });
  it('parseTranscriptText accepts Staff and custom name labels', () => {
    expect(parseTranscriptText('Jim: hello\nCaller: hi', { assistantLabels: ['Jim'] })).toEqual([
      { role: 'assistant', text: 'hello' },
      { role: 'user', text: 'hi' },
    ]);
    expect(parseTranscriptText('Staff: yo')).toEqual([{ role: 'assistant', text: 'yo' }]);
  });
});
