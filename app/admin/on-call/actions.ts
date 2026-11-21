'use server';

import { revalidatePath } from 'next/cache';
import { getSessionFromCookies } from '@/lib/auth';
import {
  addPerson,
  clearDay,
  removePerson,
  saveDay,
  saveWeekday,
  setPersonActive,
} from '@/lib/onCallStore';
import { isDay } from '@/lib/voice/onCall';
import { formatPhoneDisplay, toE164 } from '@/lib/voice/phone';
import { reservedNumbers } from '@/lib/voice/twilio';

const PAGE = '/admin/on-call';

/** The schedule is changed by anyone signed in; the break-glass key is read-only. */
async function requireSession() {
  const session = await getSessionFromCookies();
  if (!session) throw new Error('Sign in to change the on-call schedule');
  return session;
}

/** Whose phone a business call rings is an admin's call. */
async function requireAdmin() {
  const session = await requireSession();
  if (session.role !== 'admin') throw new Error('Admin access required');
  return session;
}

const pick = (formData: FormData, key: string): string | null => {
  const v = formData.get(key);
  return typeof v === 'string' && v ? v : null;
};

export async function saveWeekAction(formData: FormData): Promise<void> {
  await requireSession();
  for (let weekday = 0; weekday < 7; weekday++) {
    await saveWeekday(weekday, [pick(formData, `first_${weekday}`), pick(formData, `second_${weekday}`)]);
  }
  revalidatePath(PAGE);
}

export async function saveDayAction(formData: FormData): Promise<void> {
  await requireSession();
  const day = pick(formData, 'day');
  if (!day || !isDay(day)) return;
  await saveDay(day, [pick(formData, 'first'), pick(formData, 'second')]);
  revalidatePath(PAGE);
}

export async function clearDayAction(formData: FormData): Promise<void> {
  await requireSession();
  const day = pick(formData, 'day');
  if (!day || !isDay(day)) return;
  await clearDay(day);
  revalidatePath(PAGE);
}

export type PersonState = { error?: string; success?: string };

export async function addPersonAction(_prev: PersonState, formData: FormData): Promise<PersonState> {
  await requireAdmin();
  const name = (pick(formData, 'name') ?? '').trim().slice(0, 80);
  const phone = toE164(pick(formData, 'phone'));
  if (!name) return { error: 'Enter a name.' };
  if (!phone) return { error: 'Enter a 10-digit cell number.' };
  if (reservedNumbers().has(phone)) {
    return { error: 'That is one of the business lines. Enter the person\'s own cell.' };
  }
  try {
    await addPerson(name, phone);
  } catch {
    return { error: `${formatPhoneDisplay(phone)} is already on the list.` };
  }
  revalidatePath(PAGE);
  return { success: `${name} added. Put them on a day below.` };
}

export async function setPersonActiveAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = pick(formData, 'id');
  if (!id) return;
  await setPersonActive(id, formData.get('active') === 'true');
  revalidatePath(PAGE);
}

export async function removePersonAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = pick(formData, 'id');
  if (!id || formData.get('confirm') !== 'on') return;
  await removePerson(id);
  revalidatePath(PAGE);
}
