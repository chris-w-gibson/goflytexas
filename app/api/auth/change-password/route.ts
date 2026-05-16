import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import {
  getSessionFromCookies,
  getUserById,
  setSessionCookie,
  updateUserPassword,
  verifyPassword,
} from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const inputSchema = z
  .object({
    currentPassword: z.string().min(1).max(200),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(200),
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: 'New password must be different from current',
    path: ['newPassword'],
  });

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = inputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  const user = await getUserById(session.uid);
  if (!user || user.disabled) {
    return NextResponse.json({ error: 'Account unavailable' }, { status: 403 });
  }
  const ok = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
  }

  await updateUserPassword(user.id, parsed.data.newPassword, true);

  // Refresh session token (still same uid; mustChangePassword now false)
  await setSessionCookie({
    uid: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return NextResponse.json({ ok: true });
}
