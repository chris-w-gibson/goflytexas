/**
 * Dates on the admin pages are read by people in Texas, and the pages render on
 * a server whose clock is UTC. A date formatted without a zone there shows the
 * next day for anything after 6 PM Central (7 PM in summer), so a lead that came
 * in Tuesday evening was listed under Wednesday. Every date an admin page prints
 * goes through here.
 */
export const CENTRAL = 'America/Chicago';

type When = Date | string | number;

/** "11/24/2026" */
export function centralDate(when: When): string {
  return new Date(when).toLocaleDateString('en-US', { timeZone: CENTRAL });
}

/** "11/24/2026, 6:22 PM" */
export function centralDateTime(when: When): string {
  return new Date(when).toLocaleString('en-US', {
    timeZone: CENTRAL,
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** "Nov 24, 6:22 PM" */
export function centralShort(when: When): string {
  return new Date(when).toLocaleString('en-US', {
    timeZone: CENTRAL,
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** "Nov 24, 2026" */
export function centralDay(when: When): string {
  return new Date(when).toLocaleDateString('en-US', {
    timeZone: CENTRAL,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
