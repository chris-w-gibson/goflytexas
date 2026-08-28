import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FOLLOWUP_DAYS,
  dueFollowupStep,
  formatDuration,
  parseEmailList,
  parseFollowupSchedule,
  responseState,
} from '../followup';

const DAY = 24 * 60 * 60 * 1000;
const t0 = new Date('2026-08-01T12:00:00Z');
const daysLater = (d: number) => new Date(t0.getTime() + d * DAY);

describe('parseFollowupSchedule', () => {
  it('defaults when unset or garbage', () => {
    expect(parseFollowupSchedule(undefined)).toEqual([...DEFAULT_FOLLOWUP_DAYS]);
    expect(parseFollowupSchedule('')).toEqual([...DEFAULT_FOLLOWUP_DAYS]);
    expect(parseFollowupSchedule('abc')).toEqual([...DEFAULT_FOLLOWUP_DAYS]);
  });
  it('parses a custom increasing list', () => {
    expect(parseFollowupSchedule('3, 10,30')).toEqual([3, 10, 30]);
  });
  it('rejects non-increasing lists', () => {
    expect(parseFollowupSchedule('7,7,21')).toEqual([...DEFAULT_FOLLOWUP_DAYS]);
    expect(parseFollowupSchedule('14,7')).toEqual([...DEFAULT_FOLLOWUP_DAYS]);
  });
});

describe('dueFollowupStep', () => {
  const schedule = [7, 14, 21];

  it('sends nothing before day 7', () => {
    expect(dueFollowupStep({ createdAt: t0, sentCount: 0, schedule, now: daysLater(6.9) })).toBeNull();
  });
  it('step 1 becomes due at day 7 and stays due until sent', () => {
    expect(dueFollowupStep({ createdAt: t0, sentCount: 0, schedule, now: daysLater(7) })).toBe(1);
    expect(dueFollowupStep({ createdAt: t0, sentCount: 0, schedule, now: daysLater(12) })).toBe(1);
  });
  it('never skips: at day 20 with only step 1 sent, step 2 is due (not 3)', () => {
    expect(dueFollowupStep({ createdAt: t0, sentCount: 1, schedule, now: daysLater(20) })).toBe(2);
  });
  it('is idempotent within a day: after step 2 is sent nothing is due until day 21', () => {
    expect(dueFollowupStep({ createdAt: t0, sentCount: 2, schedule, now: daysLater(14.5) })).toBeNull();
    expect(dueFollowupStep({ createdAt: t0, sentCount: 2, schedule, now: daysLater(21) })).toBe(3);
  });
  it('stops after the last step', () => {
    expect(dueFollowupStep({ createdAt: t0, sentCount: 3, schedule, now: daysLater(40) })).toBeNull();
  });
  it('ignores leads older than the max age', () => {
    expect(dueFollowupStep({ createdAt: t0, sentCount: 0, schedule, now: daysLater(61) })).toBeNull();
  });
});

describe('formatDuration', () => {
  it('formats minutes, hours and days', () => {
    expect(formatDuration(30_000)).toBe('<1m');
    expect(formatDuration(12 * 60_000)).toBe('12m');
    expect(formatDuration(3 * 3_600_000 + 20 * 60_000)).toBe('3h 20m');
    expect(formatDuration(2 * DAY + 4 * 3_600_000)).toBe('2d 4h');
    expect(formatDuration(-5)).toBe('—');
  });
});

describe('responseState', () => {
  it('reports a fast human response', () => {
    const s = responseState({ createdAt: t0, firstContactedAt: new Date(t0.getTime() + 8 * 60_000), status: 'contacted' });
    expect(s).toEqual({ kind: 'responded', ms: 8 * 60_000, slow: false });
  });
  it('flags a slow response (> 1h)', () => {
    const s = responseState({ createdAt: t0, firstContactedAt: new Date(t0.getTime() + 14 * 3_600_000), status: 'contacted' });
    expect(s.kind).toBe('responded');
    expect(s.kind === 'responded' && s.slow).toBe(true);
  });
  it('shows waiting time for untouched new leads', () => {
    const s = responseState({ createdAt: t0, firstContactedAt: null, status: 'new' }, new Date(t0.getTime() + 90 * 60_000));
    expect(s).toEqual({ kind: 'waiting', ms: 90 * 60_000, slow: true });
  });
  it('is "none" for legacy leads only touched by the drip', () => {
    expect(responseState({ createdAt: t0, firstContactedAt: null, status: 'contacted' })).toEqual({ kind: 'none' });
  });
});

describe('parseEmailList', () => {
  it('splits, trims and dedupes', () => {
    expect(parseEmailList(' a@x.com, b@y.com ,a@x.com, nope ')).toEqual(['a@x.com', 'b@y.com']);
    expect(parseEmailList(undefined)).toEqual([]);
  });
});
