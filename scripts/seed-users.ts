import { eq } from 'drizzle-orm';
import { db } from '../lib/db';
import { users } from '../lib/db/schema';
import { hashPassword } from '../lib/auth';
import { sendUserInvite } from '../lib/email';

interface SeedUser {
  email: string;
  name: string;
  role?: 'admin' | 'staff';
}

const SEED_USERS: SeedUser[] = [
  { email: 'jmalone@enviroserve.co', name: 'Jim Malone', role: 'admin' },
  { email: 'cginsa12@gmail.com', name: 'Chris Gibson', role: 'admin' },
];

function generateTempPassword(): string {
  // 12 chars, mixed case + digits, easy to read (no 0/O/1/l/I)
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pw = '';
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < bytes.length; i++) {
    pw += alphabet[bytes[i] % alphabet.length];
  }
  return pw;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is required to send invite emails');
  }

  for (const u of SEED_USERS) {
    const existing = await db.select().from(users).where(eq(users.email, u.email)).limit(1);
    if (existing[0]) {
      console.log(`SKIP  ${u.email} — already exists`);
      continue;
    }
    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);
    await db.insert(users).values({
      email: u.email,
      name: u.name,
      passwordHash,
      role: u.role ?? 'admin',
      mustChangePassword: true,
    });
    console.log(`OK    ${u.email} — created`);
    try {
      await sendUserInvite(u.email, u.name, tempPassword);
      console.log(`      invite email sent`);
    } catch (err) {
      console.error(`      FAILED to send invite:`, err);
      console.error(`      Temp password for manual delivery: ${tempPassword}`);
    }
  }
  console.log('done');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
