import { describe, expect, it } from 'vitest';
import { callExtractionSchema, fallbackExtraction, isRecentDuplicate } from '../voice/extract';

const DAY = 24 * 60 * 60 * 1000;

describe('callExtractionSchema', () => {
  it('accepts a well-formed model output', () => {
    const r = callExtractionSchema.safeParse({
      summary: 'Sarah wants a discovery flight for her husband.',
      callerName: 'Sarah Mitchell',
      callbackPhone: null,
      interest: 'discovery',
      preferredTime: 'Tuesday after 3pm',
      spam: false,
      spamReason: null,
    });
    expect(r.success).toBe(true);
  });
  it('rejects unknown interests and missing spam flag', () => {
    expect(
      callExtractionSchema.safeParse({
        summary: 'x',
        callerName: null,
        callbackPhone: null,
        interest: 'skydiving',
        preferredTime: null,
        spam: false,
        spamReason: null,
      }).success,
    ).toBe(false);
    expect(
      callExtractionSchema.safeParse({
        summary: 'x',
        callerName: null,
        callbackPhone: null,
        interest: null,
        preferredTime: null,
        spamReason: null,
      }).success,
    ).toBe(false);
  });
});

describe('fallbackExtraction', () => {
  it('quotes what the caller said and never flags spam', () => {
    const r = fallbackExtraction(
      [
        { role: 'assistant', text: 'Hi' },
        { role: 'user', text: 'I want to rent a 172 this weekend' },
      ],
      '+18175550142',
    );
    expect(r.summary).toContain('rent a 172');
    expect(r.spam).toBe(false);
    expect(r.callbackPhone).toBeNull();
  });
  it('handles an empty transcript', () => {
    expect(fallbackExtraction([], null).summary).toMatch(/no clear message/);
  });
});

describe('isRecentDuplicate', () => {
  const now = new Date('2026-08-28T20:00:00Z');
  it('is true inside the 24h window and false outside or in the future', () => {
    expect(isRecentDuplicate({ createdAt: new Date(now.getTime() - 60_000) }, now)).toBe(true);
    expect(isRecentDuplicate({ createdAt: new Date(now.getTime() - DAY + 1) }, now)).toBe(true);
    expect(isRecentDuplicate({ createdAt: new Date(now.getTime() - DAY) }, now)).toBe(false);
    expect(isRecentDuplicate({ createdAt: new Date(now.getTime() + 60_000) }, now)).toBe(false);
  });
});
