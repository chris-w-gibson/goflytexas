import { toE164 } from './phone';
import type { Env } from './twilio';

/**
 * Calls from our own phones (Jim 2026-11-27, GFT-1127-07). Jim and Mark rang
 * the line to try the assistant and the call became a lead, used a turn in the
 * rotation and started chasing Jim Lewis to call a customer who did not exist.
 *
 * A call from a phone on this list is kept in Calls for listening back, and
 * that is all: no lead, no turn used, no email. Pure, no DB.
 */

export type NamedPhone = { name: string; phone: string | null };

/**
 * `VOICE_TEST_CALLERS="+18175551234:Chris,Ann:+18175555678"`: phones that are
 * ours but belong to nobody on Users or the on-call list. Either order per
 * entry; an entry without a valid number is dropped.
 */
export function extraTestCallers(env: Env = process.env): NamedPhone[] {
  const out: NamedPhone[] = [];
  for (const entry of (env.VOICE_TEST_CALLERS ?? '').split(',')) {
    const parts = entry.split(':').map((s) => s.trim()).filter(Boolean);
    let phone: string | null = null;
    let name = '';
    for (const p of parts) {
      const e = toE164(p);
      if (e && !phone) phone = e;
      else if (!e && !name) name = p;
    }
    if (phone) out.push({ name: name || 'Team', phone });
  }
  return out;
}

/**
 * Our own phones, number → whose it is. The first list to name a number wins,
 * so pass the lists best name first (Users, the on-call list, the setting).
 */
export function teamPhoneBook(...lists: NamedPhone[][]): Map<string, string> {
  const book = new Map<string, string>();
  for (const list of lists) {
    for (const p of list) {
      const e = toE164(p.phone);
      if (e && !book.has(e)) book.set(e, p.name.trim() || 'Team');
    }
  }
  return book;
}

/** Whose phone the call came from, or null for a caller who is not one of us. */
export function testCallerName(from: string | null | undefined, book: ReadonlyMap<string, string>): string | null {
  const e = toE164(from);
  return e ? (book.get(e) ?? null) : null;
}

/** The line on the Calls page under a test call. `name` is null once the phone is no longer on the list. */
export function testCallWords(name: string | null): string {
  const who = name ? `Test call from ${name}'s phone.` : 'Test call from one of our own phones.';
  return `${who} No lead was made and nobody's turn was used.`;
}
