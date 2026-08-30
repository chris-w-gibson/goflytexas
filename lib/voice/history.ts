import { and, desc, eq, isNull, ne, or, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { calls, leads } from '@/lib/db/schema';
import { formatPhoneDisplay } from './phone';
import type { CallerHistory } from './twilio';

/**
 * What the whisper says about the caller: latest lead by phone (any age),
 * how many times they've called, what it was about last time.
 */
export async function getCallerHistory(fromE164: string | null): Promise<CallerHistory> {
  const empty: CallerHistory = { name: null, lastInterest: null, priorCalls: 0, lastAt: null };
  const display = formatPhoneDisplay(fromE164);
  if (!fromE164 || !display) return empty;

  const [lead] = await db
    .select({ name: leads.name, interest: leads.flightInterest, createdAt: leads.createdAt })
    .from(leads)
    .where(and(eq(leads.phone, display), ne(leads.name, 'Unknown caller')))
    .orderBy(desc(leads.createdAt))
    .limit(1);

  // Physical calls only: Twilio parents, or platform calls that weren't handed off by Twilio.
  const [agg] = await db
    .select({
      n: sql<number>`count(*)::int`,
      lastAt: sql<Date | null>`max(${calls.createdAt})`,
      lastInterest: sql<string | null>`(array_agg(${calls.extracted}->>'interest' order by ${calls.createdAt} desc) filter (where ${calls.extracted}->>'interest' is not null))[1]`,
    })
    .from(calls)
    .where(and(eq(calls.fromNumber, fromE164), or(eq(calls.platform, 'twilio'), isNull(calls.parentCallId))));

  return {
    name: lead?.name ?? null,
    lastInterest: lead?.interest ?? agg?.lastInterest ?? null,
    priorCalls: agg?.n ?? 0,
    lastAt: agg?.lastAt ? new Date(agg.lastAt) : lead?.createdAt ?? null,
  };
}
