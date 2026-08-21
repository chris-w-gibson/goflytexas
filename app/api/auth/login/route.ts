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

// In-memory per-IP throttle: 10 attempts per 15 minutes. Same
// single-instance caveat as the chat widget's limiter — swap for Redis
// if the app ever scales horizontally.
const ATTEMPT_LIMIT = 10;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, number[]>();

function throttled(ip: string): boolean {
  const windowStart = Date.now() - ATTEMPT_WINDOW_MS;
  const recent = (attempts.get(ip) ?? []).filter((t) => t > windowStart);
  attempts.set(ip, recent);
  if (recent.length >= ATTEMPT_LIMIT) return true;
  recent.push(Date.now());
  return false;
}

const inputSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (throttled(ip)) {
    return NextResponse.json(
      { error: 'Too many attempts — please wait a few minutes and try again.' },
      { status: 429 }
    );
  }

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
