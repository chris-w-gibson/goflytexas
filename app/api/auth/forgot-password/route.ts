import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createPasswordResetToken, getUserByEmail } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const inputSchema = z.object({
  email: z.string().trim().email().max(200),
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

  const user = await getUserByEmail(parsed.data.email);
  if (user && !user.disabled) {
    const rawToken = await createPasswordResetToken(user.id);
    void sendPasswordResetEmail(user.email, user.name, rawToken).catch(() => {});
  }

  // Always 200 — don't leak whether the email exists
  return NextResponse.json({ ok: true });
}
