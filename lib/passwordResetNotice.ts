/**
 * What the Users page says after "Send password reset" (Jim 2026-11-25: the
 * button showed nothing, so it was pressed fifteen times and fifteen emails
 * went out). Pure: the action and the page both read it.
 */

/** How long a reset link works. The email says the same. */
export const PASSWORD_RESET_MINUTES = 60;

/** A second press inside this window sends nothing. */
export const RESEND_WAIT_SECONDS = 60;

export type ResetOutcome = 'sent' | 'wait' | 'failed';

export function parseOutcome(v: string | string[] | undefined): ResetOutcome | null {
  const s = Array.isArray(v) ? v[0] : v;
  return s === 'sent' || s === 'wait' || s === 'failed' ? s : null;
}

/** Whether the last reset for this person is too recent to send another. */
export function tooSoon(lastAskedAt: Date | null | undefined, now: Date): boolean {
  if (!lastAskedAt) return false;
  const seconds = (now.getTime() - lastAskedAt.getTime()) / 1000;
  return seconds >= 0 && seconds < RESEND_WAIT_SECONDS;
}

export type ResetNotice = { tone: 'ok' | 'hold' | 'bad'; text: string };

export function resetNotice(outcome: ResetOutcome, email: string): ResetNotice {
  if (outcome === 'sent') {
    return { tone: 'ok', text: `Reset email sent to ${email}. The link in it works for 1 hour.` };
  }
  if (outcome === 'wait') {
    return {
      tone: 'hold',
      text: `A reset email went to ${email} less than a minute ago. Nothing more was sent; give it a moment to arrive.`,
    };
  }
  return { tone: 'bad', text: `The reset email to ${email} could not be sent. Try again.` };
}
