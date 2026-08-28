import { describe, expect, it } from 'vitest';
import {
  formatPhoneDisplay,
  formatSpoken,
  isAnonymousCaller,
  lastFour,
  toE164,
} from '../voice/phone';

describe('toE164', () => {
  it('normalizes common US formats', () => {
    expect(toE164('(940) 905-3090')).toBe('+19409053090');
    expect(toE164('940-905-3090')).toBe('+19409053090');
    expect(toE164('9409053090')).toBe('+19409053090');
    expect(toE164('19409053090')).toBe('+19409053090');
    expect(toE164('+1 940 905 3090')).toBe('+19409053090');
  });
  it('rejects garbage, short numbers and anonymous callers', () => {
    expect(toE164('')).toBeNull();
    expect(toE164(null)).toBeNull();
    expect(toE164('12345')).toBeNull();
    expect(toE164('anonymous')).toBeNull();
    expect(toE164('Restricted')).toBeNull();
    expect(toE164('+442071234567')).toBeNull();
  });
});

describe('display + spoken', () => {
  it('formats the web-form shape and the spoken shape', () => {
    expect(formatPhoneDisplay('+19409053090')).toBe('940-905-3090');
    expect(formatPhoneDisplay('junk')).toBeNull();
    expect(formatSpoken('+19409053090')).toBe('9 4 0, 9 0 5, 3 0 9 0');
    expect(lastFour('+19409053090')).toBe('3090');
  });
  it('flags anonymous callers', () => {
    expect(isAnonymousCaller('anonymous')).toBe(true);
    expect(isAnonymousCaller(undefined)).toBe(true);
    expect(isAnonymousCaller('+18175550142')).toBe(false);
  });
});
