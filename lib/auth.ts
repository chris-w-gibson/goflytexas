import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from './db';
import { passwordResetTokens, users, type User } from './db/schema';

const SESSION_COOKIE = 'gft_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET env var is required and must be ≥32 chars');
  }
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ['HS256'] });
    if (typeof payload.uid !== 'string' || typeof payload.email !== 'string') return null;
    return {
      uid: payload.uid,
      email: payload.email,
      name: typeof payload.name === 'string' ? payload.name : '',
      role: (payload.role === 'staff' ? 'staff' : 'admin') as 'admin' | 'staff',
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await createSessionToken(payload);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  cookies().delete(SESSION_COOKIE);
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const [u] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return u;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const [u] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return u;
}

export async function recordLogin(userId: string): Promise<void> {
  await db
    .update(users)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function updateUserPassword(
  userId: string,
  newPlain: string,
  clearMustChange = true,
): Promise<void> {
  const hash = await hashPassword(newPlain);
  await db
    .update(users)
    .set({
      passwordHash: hash,
      mustChangePassword: clearMustChange ? false : undefined,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export function generateRandomToken(byteLength = 24): string {
  const arr = new Uint8Array(byteLength);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  const raw = generateRandomToken(24);
  const tokenHash = await bcrypt.hash(raw, 10);
  await db.insert(passwordResetTokens).values({
    userId,
    tokenHash,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
  });
  return raw;
}

export async function consumePasswordResetToken(
  rawToken: string,
): Promise<{ userId: string } | null> {
  const candidates = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        gt(passwordResetTokens.expiresAt, new Date()),
        isNull(passwordResetTokens.consumedAt),
      ),
    );
  for (const row of candidates) {
    const matches = await bcrypt.compare(rawToken, row.tokenHash);
    if (matches) {
      await db
        .update(passwordResetTokens)
        .set({ consumedAt: new Date() })
        .where(eq(passwordResetTokens.id, row.id));
      return { userId: row.userId };
    }
  }
  return null;
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
  role?: 'admin' | 'staff';
  mustChangePassword?: boolean;
}): Promise<User> {
  const passwordHash = await hashPassword(input.password);
  const [u] = await db
    .insert(users)
    .values({
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash,
      role: input.role ?? 'admin',
      mustChangePassword: input.mustChangePassword ?? true,
    })
    .returning();
  return u;
}
