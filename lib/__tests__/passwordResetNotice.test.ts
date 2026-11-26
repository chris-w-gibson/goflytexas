import { describe, expect, it } from 'vitest';
import {
  PASSWORD_RESET_MINUTES,
  RESEND_WAIT_SECONDS,
  parseOutcome,
  resetNotice,
  tooSoon,
} from '../passwordResetNotice';

const EMAIL = 'pilot@example.com';
const NOW = new Date('2026-11-26T00:26:44Z');
const secondsAgo = (s: number) => new Date(NOW.getTime() - s * 1000);

describe('tooSoon', () => {
  it('lets the first reset through', () => {
    expect(tooSoon(null, NOW)).toBe(false);
  });

  it('holds a second press inside the wait', () => {
    expect(tooSoon(secondsAgo(1), NOW)).toBe(true);
    expect(tooSoon(secondsAgo(RESEND_WAIT_SECONDS - 1), NOW)).toBe(true);
  });

  it('lets a press through once the wait has passed', () => {
    expect(tooSoon(secondsAgo(RESEND_WAIT_SECONDS), NOW)).toBe(false);
  });

  it('does not hold on a stamp from the future', () => {
    expect(tooSoon(secondsAgo(-30), NOW)).toBe(false);
  });
});

describe('parseOutcome', () => {
  it('reads the three outcomes and nothing else', () => {
    expect(['sent', 'wait', 'failed', 'done', undefined].map(parseOutcome)).toEqual([
      'sent',
      'wait',
      'failed',
      null,
      null,
    ]);
    expect(parseOutcome(['wait', 'sent'])).toBe('wait');
  });
});

describe('resetNotice', () => {
  it('says where the email went and how long the link works', () => {
    expect(resetNotice('sent', EMAIL)).toEqual({
      tone: 'ok',
      text: `Reset email sent to ${EMAIL}. The link in it works for 1 hour.`,
    });
    expect(PASSWORD_RESET_MINUTES).toBe(60);
  });

  it('says nothing more was sent on a repeat press', () => {
    const n = resetNotice('wait', EMAIL);
    expect(n.tone).toBe('hold');
    expect(n.text).toContain('Nothing more was sent');
    expect(n.text).toContain(EMAIL);
  });

  it('says so when the email could not be sent', () => {
    expect(resetNotice('failed', EMAIL)).toEqual({
      tone: 'bad',
      text: `The reset email to ${EMAIL} could not be sent. Try again.`,
    });
  });
});
