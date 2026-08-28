import { desc, eq, gte, sql } from 'drizzle-orm';
import { db } from './db';
import { calls, type Call } from './db/schema';
import type { CallExtraction, CallStatus, NormalizedCallEnd, VoicePlatform } from './voice/types';

/** First LLM turn of a call — makes the call visible even if no webhook ever arrives. */
export async function upsertCallStarted(input: {
  platform: VoicePlatform;
  platformCallId: string;
  fromNumber: string | null;
  toNumber: string | null;
}): Promise<void> {
  await db
    .insert(calls)
    .values({
      platform: input.platform,
      platformCallId: input.platformCallId,
      fromNumber: input.fromNumber,
      toNumber: input.toNumber,
      startedAt: new Date(),
      status: 'received',
    })
    .onConflictDoNothing({ target: calls.platformCallId });
}

/** Idempotent on platform_call_id: retries just refresh the payload. */
export async function upsertCallEnded(n: NormalizedCallEnd, rawPayload: unknown): Promise<Call> {
  const now = new Date();
  const [row] = await db
    .insert(calls)
    .values({
      platform: n.platform,
      platformCallId: n.platformCallId,
      fromNumber: n.fromNumber,
      toNumber: n.toNumber,
      forwardedFrom: n.forwardedFrom,
      startedAt: n.startedAt,
      endedAt: n.endedAt,
      durationSec: n.durationSec,
      endedReason: n.endedReason,
      recordingUrl: n.recordingUrl,
      transcript: n.transcript,
      rawPayload,
      status: 'received',
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: calls.platformCallId,
      set: {
        fromNumber: sql`coalesce(excluded.from_number, ${calls.fromNumber})`,
        toNumber: sql`coalesce(excluded.to_number, ${calls.toNumber})`,
        forwardedFrom: sql`coalesce(excluded.forwarded_from, ${calls.forwardedFrom})`,
        startedAt: sql`coalesce(excluded.started_at, ${calls.startedAt})`,
        endedAt: n.endedAt,
        durationSec: n.durationSec,
        endedReason: n.endedReason,
        recordingUrl: sql`coalesce(excluded.recording_url, ${calls.recordingUrl})`,
        transcript: n.transcript,
        rawPayload,
        updatedAt: now,
      },
    })
    .returning();
  return row;
}

export async function finalizeCall(
  id: string,
  patch: {
    status: CallStatus;
    leadId?: string | null;
    summary?: string | null;
    extracted?: CallExtraction | null;
  },
): Promise<void> {
  await db
    .update(calls)
    .set({
      status: patch.status,
      ...(patch.leadId !== undefined ? { leadId: patch.leadId } : {}),
      ...(patch.summary !== undefined ? { summary: patch.summary } : {}),
      ...(patch.extracted !== undefined ? { extracted: patch.extracted } : {}),
      updatedAt: new Date(),
    })
    .where(eq(calls.id, id));
}

export async function listCalls(opts?: { limit?: number }): Promise<Call[]> {
  return db
    .select()
    .from(calls)
    .orderBy(desc(calls.createdAt))
    .limit(opts?.limit ?? 100);
}

export async function getCallById(id: string): Promise<Call | undefined> {
  const [row] = await db.select().from(calls).where(eq(calls.id, id)).limit(1);
  return row;
}

export async function listCallsForLead(leadId: string): Promise<Call[]> {
  return db.select().from(calls).where(eq(calls.leadId, leadId)).orderBy(desc(calls.createdAt));
}

export async function countCallsSince(since: Date): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(calls)
    .where(gte(calls.createdAt, since));
  return row?.n ?? 0;
}
