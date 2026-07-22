'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import {
  createPasswordResetToken,
  createUser,
  generateRandomToken,
  getSessionFromCookies,
  getUserByEmail,
  getUserById,
} from '@/lib/auth';
import { sendPasswordResetEmail, sendUserInvite } from '@/lib/email';

async function requireAdmin() {
  const session = await getSessionFromCookies();
  if (!session || session.role !== 'admin') {
    throw new Error('Admin access required');
  }
  return session;
}

const inviteSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('Invalid email').max(200),
  role: z.enum(['admin', 'staff']),
});

export type InviteState = { error?: string; success?: string };

export async function inviteUserAction(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  await requireAdmin();

  const parsed = inviteSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(', ') };
  }

  const existing = await getUserByEmail(parsed.data.email);
  if (existing) {
    return { error: 'A user with that email already exists.' };
  }

  const tempPassword = generateRandomToken(9); // 12-char urlsafe temp password
  const user = await createUser({
    email: parsed.data.email,
    name: parsed.data.name,
    password: tempPassword,
    role: parsed.data.role,
    mustChangePassword: true,
  });

  try {
    await sendUserInvite(user.email, user.name, tempPassword);
  } catch {
    return {
      error:
        'User was created, but the invite email failed to send. Use "Send password reset" on their row instead.',
    };
  }

  revalidatePath('/admin/users');
  return {
    success: `Invite sent to ${user.email} — they'll set their own password on first login.`,
  };
}

export async function toggleUserDisabledAction(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const disable = formData.get('disable') === 'true';
  if (!id) return;
  if (id === session.uid && disable) {
    throw new Error("You can't disable your own account.");
  }
  const target = await getUserById(id);
  if (!target) return;
  await db.update(users).set({ disabled: disable }).where(eq(users.id, id));
  revalidatePath('/admin/users');
}

export async function sendPasswordResetAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const target = await getUserById(id);
  if (!target || target.disabled) return;
  const rawToken = await createPasswordResetToken(target.id);
  await sendPasswordResetEmail(target.email, target.name, rawToken);
  revalidatePath('/admin/users');
}
