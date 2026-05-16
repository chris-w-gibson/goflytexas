import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import {
  consumePasswordResetToken,
  getUserById,
  setSessionCookie,
  updateUserPassword,
} from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const inputSchema = z.object({
  token: z.string().min(8).max(200),
  newPassword: z.string().min(8).max(200),
});

export async function POST(req: NextRequest) {
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

  const consumed = await consumePasswordResetToken(parsed.data.token);
  if (!consumed) {
    return NextResponse.json(
      { error: 'Reset link is invalid or expired' },
      { status: 400 },
    );
  }
  const user = await getUserById(consumed.userId);
  if (!user || user.disabled) {
    return NextResponse.json({ error: 'Account unavailable' }, { status: 403 });
  }

  await updateUserPassword(user.id, parsed.data.newPassword, true);
  await setSessionCookie({
    uid: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return NextResponse.json({ ok: true });
}
