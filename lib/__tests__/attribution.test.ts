import { describe, expect, it } from 'vitest';
import { attributionCookie, attributionLabel, deriveFirstTouch, parseAttributionCookie } from '../attribution';

const now = new Date('2026-09-06T12:00:00Z');
const base = { pathname: '/discovery-flight', host: 'www.goflytexas.com', now };

describe('deriveFirstTouch', () => {
  it('keeps gclid/utm landings verbatim (paid wins over referrer)', () => {
    const a = deriveFirstTouch({ ...base, search: '?gclid=abc&utm_campaign=x', referrer: 'https://www.google.com/' });
    expect(a).toEqual({ gclid: 'abc', utm_campaign: 'x', landing: '/discovery-flight', first_seen: now.toISOString() });
  });
  it('classifies Google / Bing referrers as organic', () => {
    expect(deriveFirstTouch({ ...base, search: '', referrer: 'https://www.google.com/' })).toMatchObject({ source: 'google', medium: 'organic', referrer: 'https://www.google.com/' });
    expect(deriveFirstTouch({ ...base, search: '', referrer: 'https://www.bing.com/search?q=flight+school' })).toMatchObject({ source: 'bing', medium: 'organic' });
  });
  it('no referrer → direct; other host → referral by host', () => {
    expect(deriveFirstTouch({ ...base, search: '', referrer: '' })).toMatchObject({ source: 'direct', medium: 'direct', landing: '/discovery-flight' });
    expect(deriveFirstTouch({ ...base, search: '', referrer: 'https://aopa.org/schools' })).toMatchObject({ source: 'aopa.org', medium: 'referral' });
  });
  it('internal navigation from our own host stores nothing', () => {
    expect(deriveFirstTouch({ ...base, search: '', referrer: 'https://www.goflytexas.com/' })).toBeNull();
    expect(deriveFirstTouch({ ...base, search: '', referrer: 'https://goflytexas.com/aircraft' })).toBeNull();
  });
  it('clips oversized values', () => {
    const a = deriveFirstTouch({ ...base, search: `?utm_term=${'x'.repeat(500)}`, referrer: '' })!;
    expect(a.utm_term).toHaveLength(200);
  });
});

describe('cookie round trip', () => {
  it('serializes and parses, dropping unknown keys and non-strings', () => {
    const attr = deriveFirstTouch({ ...base, search: '', referrer: 'https://www.google.com/' })!;
    const raw = attributionCookie(attr).split(';')[0].replace('gft_attr=', '');
    expect(parseAttributionCookie(raw)).toEqual(attr);
    const hostile = encodeURIComponent(JSON.stringify({ gclid: 'ok', evil: 'x', medium: 42, __proto__: { a: 1 } }));
    expect(parseAttributionCookie(hostile)).toEqual({ gclid: 'ok' });
    expect(parseAttributionCookie('%7Bnot-json')).toBeNull();
    expect(parseAttributionCookie(encodeURIComponent('[1,2]'))).toBeNull();
    expect(parseAttributionCookie(undefined)).toBeNull();
  });
});

describe('attributionLabel', () => {
  it('names the channel for admin views', () => {
    expect(attributionLabel({ gclid: 'x' })).toBe('Google Ads');
    expect(attributionLabel({ utm_source: 'phone', utm_campaign: 'missed-call' })).toBe('phone');
    expect(attributionLabel({ source: 'google', medium: 'organic' })).toBe('google organic');
    expect(attributionLabel({ source: 'direct', medium: 'direct' })).toBe('Direct');
    expect(attributionLabel({ source: 'aopa.org', medium: 'referral' })).toBe('Referral: aopa.org');
    expect(attributionLabel(null)).toBe('Unknown');
  });
});
