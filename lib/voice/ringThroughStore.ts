import { and, desc, eq, gte, isNotNull, isNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { calls } from '@/lib/db/schema';
import type { RingThroughState } from './ringThrough';

/**
 * Where a ring-through is kept: `calls.ring_through` on the caller's Twilio
 * row. Every change is a conditional update, so two callbacks that arrive
 * together (a person pressing 1 as their ring times out, the caller hanging up
 * as someone accepts) cannot both win.
 */
export type RingStore = {
  get(parentSid: string): Promise<{ state: RingThroughState | null; fromNumber: string | null; ended: boolean } | null>;
  /** Start one, only if the call has none yet and the caller is still on. */
  begin(parentSid: string, state: RingThroughState): Promise<boolean>;
  setLeg(parentSid: string, step: number, legSid: string): Promise<void>;
  /** ringing at `step` → `next` (the next person, or nobody left). */
  swap(parentSid: string, step: number, next: RingThroughState): Promise<boolean>;
  /** ringing at `step` → connected, and the call becomes a person's. Fails when the caller has gone. */
  claim(parentSid: string, step: number, next: RingThroughState): Promise<boolean>;
  /** The caller could not be joined after all: the call is the assistant's again. */
  unclaim(parentSid: string, next: RingThroughState): Promise<void>;
  /** The caller left: ringing → ended. Returns the state it was in, for the cell still ringing. */
  endIfRinging(parentSid: string): Promise<RingThroughState | null>;
  markTold(parentSid: string): Promise<void>;
};

const ringingAt = (step: number) =>
  sql`${calls.ringThrough}->>'state' = 'ringing' and (${calls.ringThrough}->>'step')::int = ${step}`;

export const ringStore: RingStore = {
  async get(parentSid) {
    const [row] = await db
      .select({ state: calls.ringThrough, fromNumber: calls.fromNumber, endedAt: calls.endedAt })
      .from(calls)
      .where(eq(calls.platformCallId, parentSid))
      .limit(1);
    return row ? { state: row.state ?? null, fromNumber: row.fromNumber, ended: row.endedAt !== null } : null;
  },
  async begin(parentSid, state) {
    const rows = await db
      .update(calls)
      .set({ ringThrough: state, updatedAt: new Date() })
      .where(and(eq(calls.platformCallId, parentSid), isNull(calls.ringThrough), isNull(calls.endedAt)))
      .returning({ id: calls.id });
    return rows.length > 0;
  },
  async setLeg(parentSid, step, legSid) {
    await db
      .update(calls)
      .set({ ringThrough: sql`jsonb_set(${calls.ringThrough}, '{legSid}', to_jsonb(${legSid}::text))`, updatedAt: new Date() })
      .where(and(eq(calls.platformCallId, parentSid), ringingAt(step)));
  },
  async swap(parentSid, step, next) {
    const rows = await db
      .update(calls)
      .set({ ringThrough: next, updatedAt: new Date() })
      .where(and(eq(calls.platformCallId, parentSid), ringingAt(step)))
      .returning({ id: calls.id });
    return rows.length > 0;
  },
  async claim(parentSid, step, next) {
    const rows = await db
      .update(calls)
      .set({
        ringThrough: next,
        status: 'answered',
        answeredBy: 'human',
        answeredByName: next.answeredName ?? 'Team',
        updatedAt: new Date(),
      })
      .where(and(eq(calls.platformCallId, parentSid), ringingAt(step), isNull(calls.endedAt)))
      .returning({ id: calls.id });
    return rows.length > 0;
  },
  async unclaim(parentSid, next) {
    await db
      .update(calls)
      .set({ ringThrough: next, status: 'forwarded_to_ai', answeredBy: 'ai', answeredByName: null, updatedAt: new Date() })
      .where(and(eq(calls.platformCallId, parentSid), sql`${calls.ringThrough}->>'state' = 'connected'`));
  },
  async endIfRinging(parentSid) {
    const [row] = await db
      .update(calls)
      .set({ ringThrough: sql`jsonb_set(${calls.ringThrough}, '{state}', '"ended"')`, updatedAt: new Date() })
      .where(and(eq(calls.platformCallId, parentSid), sql`${calls.ringThrough}->>'state' = 'ringing'`))
      .returning({ state: calls.ringThrough });
    // The row comes back already marked ended; the cell that was ringing is still on it.
    return row?.state ? { ...row.state, state: 'ringing' } : null;
  },
  async markTold(parentSid) {
    await db
      .update(calls)
      .set({ ringThrough: sql`jsonb_set(${calls.ringThrough}, '{toldCaller}', 'true')`, updatedAt: new Date() })
      .where(and(eq(calls.platformCallId, parentSid), isNotNull(calls.ringThrough)));
  },
};

/**
 * The call the assistant is on right now, found from the caller's number: the
 * newest Twilio call from that number that was handed to the assistant and has
 * not ended. The assistant's own requests carry the caller's number, not our
 * call id.
 */
export async function liveAiCall(
  callerE164: string,
  now: Date = new Date(),
): Promise<{ parentSid: string; state: RingThroughState | null } | null> {
  const since = new Date(now.getTime() - 20 * 60 * 1000);
  const [row] = await db
    .select({ sid: calls.platformCallId, state: calls.ringThrough })
    .from(calls)
    .where(
      and(
        eq(calls.platform, 'twilio'),
        eq(calls.fromNumber, callerE164),
        isNotNull(calls.forwardedToAiAt),
        isNull(calls.endedAt),
        gte(calls.createdAt, since),
      ),
    )
    .orderBy(desc(calls.createdAt))
    .limit(1);
  return row ? { parentSid: row.sid, state: row.state ?? null } : null;
}

/** Tie the assistant's own call row to the caller's Twilio row as soon as the ring starts. */
export async function linkAssistantCall(assistantCallId: string, parentSid: string): Promise<void> {
  await db
    .update(calls)
    .set({ parentCallId: parentSid, updatedAt: new Date() })
    .where(and(eq(calls.platformCallId, assistantCallId), isNull(calls.parentCallId)));
}
