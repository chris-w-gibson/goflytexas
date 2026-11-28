import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { phoneStaff, users } from '@/lib/db/schema';
import type { Env } from './twilio';
import { extraTestCallers, teamPhoneBook, testCallerName } from './testCallers';

/**
 * Our own phones: the cells on Users (people who can still sign in), everyone
 * on the on-call list, and VOICE_TEST_CALLERS. Number → whose it is.
 */
export async function teamPhones(env: Env = process.env): Promise<Map<string, string>> {
  const [people, staff] = await Promise.all([
    db.select({ name: users.name, phone: users.phone }).from(users).where(eq(users.disabled, false)),
    db.select({ name: phoneStaff.name, phone: phoneStaff.phone }).from(phoneStaff),
  ]);
  return teamPhoneBook(people, staff, extraTestCallers(env));
}

/**
 * Whose phone a call came from, when it is one of ours. A lookup that fails
 * answers null: a real caller must never be lost to a test check.
 */
export async function testCallerFor(from: string | null | undefined): Promise<string | null> {
  if (!from) return null;
  try {
    return testCallerName(from, await teamPhones());
  } catch (err) {
    console.error('voice pipeline: test-caller lookup failed', err);
    return null;
  }
}
