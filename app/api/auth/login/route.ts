import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import {
  getUserByEmail,
  recordLogin,
  setSessionCookie,
  verifyPassword,
} from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const inputSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
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
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const user = await getUserByEmail(email);
  if (!user || user.disabled) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  await setSessionCookie({
    uid: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  await recordLogin(user.id);

  return NextResponse.json({
    ok: true,
    mustChangePassword: user.mustChangePassword,
    redirect: user.mustChangePassword ? '/login/change-password' : '/admin',
  });
}
