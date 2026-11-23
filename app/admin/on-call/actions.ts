'use server';

import { revalidatePath } from 'next/cache';
import { getSessionFromCookies } from '@/lib/auth';
import { dayOffRange } from '@/lib/rotation';
import {
  addDayOff,
  addToRotation,
  moveInRotation,
  removeDayOff,
  removeFromRotation,
} from '@/lib/rotationStore';

const PAGE = '/admin/on-call';

/** Days off are set by anyone signed in; the break-glass key is read-only. */
async function requireSession() {
  const session = await getSessionFromCookies();
  if (!session) throw new Error('Sign in to change the rotation');
  return session;
}

/** Who is in the rotation, and in what order, is an admin's call. */
async function requireAdmin() {
  const session = await requireSession();
  if (session.role !== 'admin') throw new Error('Admin access required');
  return session;
}

const pick = (formData: FormData, key: string): string => {
  const v = formData.get(key);
  return typeof v === 'string' ? v.trim() : '';
};

export async function addToRotationAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const userId = pick(formData, 'userId');
  if (!userId) return;
  await addToRotation(userId);
  revalidatePath(PAGE);
}

export async function removeFromRotationAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const userId = pick(formData, 'userId');
  if (!userId) return;
  await removeFromRotation(userId);
  revalidatePath(PAGE);
}

export async function moveInRotationAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const userId = pick(formData, 'userId');
  const direction = pick(formData, 'direction');
  if (!userId || (direction !== 'up' && direction !== 'down')) return;
  await moveInRotation(userId, direction);
  revalidatePath(PAGE);
}

export async function addDayOffAction(formData: FormData): Promise<void> {
  await requireSession();
  const userId = pick(formData, 'userId');
  const range = dayOffRange(pick(formData, 'start'), pick(formData, 'end'));
  if (!userId || !range) return;
  await addDayOff({ userId, ...range, note: pick(formData, 'note').slice(0, 120) || null });
  revalidatePath(PAGE);
}

export async function removeDayOffAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = pick(formData, 'id');
  if (!id) return;
  await removeDayOff(id);
  revalidatePath(PAGE);
}
