import { describe, expect, it } from 'vitest';
import {
  FLIGHT_INTERESTS,
  NON_SALES_INTERESTS,
  flightInterestLabel,
  isSalesInterest,
} from '../constants';

/**
 * Regression for Jim's 2026-10-07 report: the contact form had no Discovery
 * Flight option even though lib/email.ts carried a label for it. The options
 * were copied into three files and drifted. One list now feeds them all.
 */
describe('FLIGHT_INTERESTS', () => {
  it('offers the discovery flight, first', () => {
    expect(FLIGHT_INTERESTS[0]).toEqual({ value: 'discovery', label: 'Discovery Flight' });
  });

  it('has unique, non-empty, lowercase keys', () => {
    const values = FLIGHT_INTERESTS.map((i) => i.value);
    expect(new Set(values).size).toBe(values.length);
    for (const v of values) {
      expect(v).toMatch(/^[a-z]+$/);
    }
  });

  it('covers every interest the forms used to hard-code', () => {
    const values = FLIGHT_INTERESTS.map((i) => i.value);
    for (const expected of [
      'discovery', 'private', 'instrument', 'commercial', 'rental',
      'tour', 'ferry', 'insurance', 'biennial', 'other',
    ]) {
      expect(values).toContain(expected);
    }
  });
});

describe('flightInterestLabel', () => {
  it('maps a stored key to its label', () => {
    expect(flightInterestLabel('discovery')).toBe('Discovery Flight');
    expect(flightInterestLabel('biennial')).toBe('Biannual Review (BFR)');
  });

  it('says so when nothing was chosen', () => {
    expect(flightInterestLabel(null)).toBe('Not specified');
    expect(flightInterestLabel(undefined)).toBe('Not specified');
    expect(flightInterestLabel('')).toBe('Not specified');
  });

  it('passes through legacy label-valued rows unchanged', () => {
    // 15 prod leads stored the label itself before the form was fixed.
    expect(flightInterestLabel('Discovery Flight')).toBe('Discovery Flight');
  });
});

describe('non-sales interests', () => {
  it('treats careers as not a sales enquiry', () => {
    expect(isSalesInterest('careers')).toBe(false);
  });

  it('treats everything else, including nothing chosen, as a prospect', () => {
    for (const { value } of FLIGHT_INTERESTS) {
      if (value === 'careers') continue;
      expect(isSalesInterest(value)).toBe(true);
    }
    expect(isSalesInterest(null)).toBe(true);
    expect(isSalesInterest('Discovery Flight')).toBe(true);
  });

  it('every non-sales key is a real option', () => {
    const values = FLIGHT_INTERESTS.map((i) => i.value);
    for (const key of NON_SALES_INTERESTS) {
      expect(values).toContain(key);
    }
  });
});
