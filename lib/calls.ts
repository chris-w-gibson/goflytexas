import { and, desc, eq, gte, inArray, isNull, lt, ne, or, sql } from 'drizzle-orm';
import { db } from './db';
import { calls, type Call } from './db/schema';
import type {
  AnsweredBy,
  CallExtraction,
  CallStatus,
  NormalizedCallEnd,
  TranscriptTurn,
  TranscriptionStatus,
  VoicePlatform,
} from './voice/types';

/** First LLM turn of a call — makes the call visible even if no webhook ever arrives. */
export async function upsertCallStarted(input: {
  platform: VoicePlatform;
  platformCallId: string;
  fromNumber: string | null;
  toNumber: string | null;
  answeredBy?: AnsweredBy;
}): Promise<void> {
  await db
    .insert(calls)
    .values({
      platform: input.platform,
      platformCallId: input.platformCallId,
      fromNumber: input.fromNumber,
      toNumber: input.toNumber,
      answeredBy: input.answeredBy ?? null,
      startedAt: new Date(),
      status: 'received',
    })
    .onConflictDoNothing({ target: calls.platformCallId });
}

/**
 * Idempotent on platform_call_id. Every column coalesces so a retry or a
 * partial payload never wipes something a previous callback stored; the
 * transcript is only replaced by a NON-EMPTY new one; answered_by never
 * downgrades a human row.
 */
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
      answeredBy: n.answeredBy,
      answeredByName: n.answeredByName,
      parentCallId: n.parentCallId,
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
        endedAt: sql`coalesce(excluded.ended_at, ${calls.endedAt})`,
        durationSec: sql`coalesce(excluded.duration_sec, ${calls.durationSec})`,
        endedReason: sql`coalesce(excluded.ended_reason, ${calls.endedReason})`,
        recordingUrl: sql`coalesce(excluded.recording_url, ${calls.recordingUrl})`,
        transcript: sql`case when excluded.transcript is null or jsonb_array_length(excluded.transcript) = 0 then ${calls.transcript} else excluded.transcript end`,
        rawPayload: sql`coalesce(excluded.raw_payload, ${calls.rawPayload})`,
        answeredBy: sql`coalesce(${calls.answeredBy}, excluded.answered_by)`,
        answeredByName: sql`coalesce(${calls.answeredByName}, excluded.answered_by_name)`,
        parentCallId: sql`coalesce(${calls.parentCallId}, excluded.parent_call_id)`,
        updatedAt: now,
      },
    })
    .returning();
  return row;
}

export type TwilioCallPatch = {
  callSid: string;
  fromNumber?: string | null;
  toNumber?: string | null;
  forwardedFrom?: string | null;
  startedAt?: Date | null;
  endedAt?: Date | null;
  durationSec?: number | null;
  endedReason?: string | null;
  status?: CallStatus;
  answeredBy?: AnsweredBy | null;
  answeredByName?: string | null;
  dialCallSid?: string | null;
  recordingSid?: string | null;
  recordingUrl?: string | null;
  transcript?: TranscriptTurn[] | null;
  transcriptionStatus?: TranscriptionStatus | null;
  forwardedToAiAt?: Date | null;
  /** Merged into raw_payload under this key (one key per callback kind). */
  event?: { name: string; payload: unknown };
};

/**
 * Partial, coalescing merge for Twilio's multi-callback flow. Insert on the
 * first callback (status defaults to 'ringing'); afterwards a provided
 * non-null value wins, a null never overwrites, and status/answeredBy are set
 * plainly when supplied. raw_payload accumulates one entry per callback kind.
 */
export async function upsertTwilioCall(patch: TwilioCallPatch): Promise<Call> {
  const now = new Date();
  const rawPayload = patch.event ? { [patch.event.name]: patch.event.payload } : undefined;
  const set: Record<string, unknown> = { updatedAt: now };
  const coalesce = (col: keyof typeof calls.$inferSelect, dbName: string, provided: boolean) => {
    if (provided) set[col] = sql.raw(`coalesce(excluded.${dbName}, calls.${dbName})`);
  };
  coalesce('fromNumber', 'from_number', patch.fromNumber !== undefined);
  coalesce('toNumber', 'to_number', patch.toNumber !== undefined);
  coalesce('forwardedFrom', 'forwarded_from', patch.forwardedFrom !== undefined);
  coalesce('startedAt', 'started_at', patch.startedAt !== undefined);
  coalesce('endedAt', 'ended_at', patch.endedAt !== undefined);
  coalesce('durationSec', 'duration_sec', patch.durationSec !== undefined);
  coalesce('endedReason', 'ended_reason', patch.endedReason !== undefined);
  coalesce('dialCallSid', 'dial_call_sid', patch.dialCallSid !== undefined);
  coalesce('recordingSid', 'recording_sid', patch.recordingSid !== undefined);
  coalesce('recordingUrl', 'recording_url', patch.recordingUrl !== undefined);
  coalesce('forwardedToAiAt', 'forwarded_to_ai_at', patch.forwardedToAiAt !== undefined);
  if (patch.transcript !== undefined) {
    set.transcript = sql`case when excluded.transcript is null or jsonb_array_length(excluded.transcript) = 0 then ${calls.transcript} else excluded.transcript end`;
  }
  if (rawPayload) {
    set.rawPayload = sql`coalesce(${calls.rawPayload}, '{}'::jsonb) || excluded.raw_payload`;
  }
  if (patch.status !== undefined) set.status = patch.status;
  if (patch.answeredBy !== undefined) set.answeredBy = patch.answeredBy;
  if (patch.answeredByName !== undefined) set.answeredByName = patch.answeredByName;
  if (patch.transcriptionStatus !== undefined) set.transcriptionStatus = patch.transcriptionStatus;

  const [row] = await db
    .insert(calls)
    .values({
      platform: 'twilio',
      platformCallId: patch.callSid,
      fromNumber: patch.fromNumber ?? null,
      toNumber: patch.toNumber ?? null,
      forwardedFrom: patch.forwardedFrom ?? null,
      startedAt: patch.startedAt ?? null,
      endedAt: patch.endedAt ?? null,
      durationSec: patch.durationSec ?? null,
      endedReason: patch.endedReason ?? null,
      status: patch.status ?? 'ringing',
      answeredBy: patch.answeredBy ?? null,
      answeredByName: patch.answeredByName ?? null,
      dialCallSid: patch.dialCallSid ?? null,
      recordingSid: patch.recordingSid ?? null,
      recordingUrl: patch.recordingUrl ?? null,
      transcript: patch.transcript ?? null,
      transcriptionStatus: patch.transcriptionStatus ?? null,
      forwardedToAiAt: patch.forwardedToAiAt ?? null,
      rawPayload: rawPayload ?? null,
      updatedAt: now,
    })
    .onConflictDoUpdate({ target: calls.platformCallId, set })
    .returning();
  return row;
}

/**
 * Race-safe state transition: only rows currently in one of `from` move to
 * `to`. Returns the updated row, or undefined if something else got there
 * first (e.g. two humans pressing 1 at the same moment).
 */
export async function transitionTwilioCall(
  callSid: string,
  from: CallStatus[],
  to: CallStatus,
  patch?: Pick<
    TwilioCallPatch,
    'answeredBy' | 'answeredByName' | 'endedAt' | 'durationSec' | 'endedReason' | 'dialCallSid' | 'forwardedToAiAt'
  >,
): Promise<Call | undefined> {
  const [row] = await db
    .update(calls)
    .set({
      status: to,
      ...(patch?.answeredBy !== undefined ? { answeredBy: patch.answeredBy } : {}),
      ...(patch?.answeredByName !== undefined ? { answeredByName: patch.answeredByName } : {}),
      ...(patch?.endedAt !== undefined ? { endedAt: patch.endedAt } : {}),
      ...(patch?.durationSec !== undefined ? { durationSec: patch.durationSec } : {}),
      ...(patch?.endedReason !== undefined ? { endedReason: patch.endedReason } : {}),
      ...(patch?.dialCallSid !== undefined ? { dialCallSid: patch.dialCallSid } : {}),
      ...(patch?.forwardedToAiAt !== undefined ? { forwardedToAiAt: patch.forwardedToAiAt } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(calls.platformCallId, callSid), inArray(calls.status, from)))
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
    transcriptionStatus?: TranscriptionStatus | null;
  },
): Promise<void> {
  await db
    .update(calls)
    .set({
      status: patch.status,
      ...(patch.leadId !== undefined ? { leadId: patch.leadId } : {}),
      ...(patch.summary !== undefined ? { summary: patch.summary } : {}),
      ...(patch.extracted !== undefined ? { extracted: patch.extracted } : {}),
      ...(patch.transcriptionStatus !== undefined
        ? { transcriptionStatus: patch.transcriptionStatus }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(calls.id, id));
}

/**
 * Claim a human-answered Twilio call for transcription. Succeeds when the row
 * has a recording and is pending/failed/never started, or its 'running' claim
 * is older than 5 minutes (a deploy killed the job). Returns the row or
 * undefined when another worker holds it / it's already done.
 */
export async function claimTranscription(callSid: string): Promise<Call | undefined> {
  const stale = new Date(Date.now() - 5 * 60 * 1000);
  const [row] = await db
    .update(calls)
    .set({ transcriptionStatus: 'running', updatedAt: new Date() })
    .where(
      and(
        eq(calls.platformCallId, callSid),
        eq(calls.platform, 'twilio'),
        eq(calls.answeredBy, 'human'),
        sql`${calls.recordingSid} is not null`,
        or(
          isNull(calls.transcriptionStatus),
          inArray(calls.transcriptionStatus, ['pending', 'failed']),
          and(eq(calls.transcriptionStatus, 'running'), lt(calls.updatedAt, stale)),
        ),
      ),
    )
    .returning();
  return row;
}

/** Human rows whose transcription never finished — for the sweep cron. */
export async function listStuckTranscriptions(limit = 20): Promise<Call[]> {
  const stale = new Date(Date.now() - 5 * 60 * 1000);
  return db
    .select()
    .from(calls)
    .where(
      and(
        eq(calls.platform, 'twilio'),
        eq(calls.answeredBy, 'human'),
        sql`${calls.recordingSid} is not null`,
        or(
          inArray(calls.transcriptionStatus, ['pending', 'failed']),
          and(eq(calls.transcriptionStatus, 'running'), lt(calls.updatedAt, stale)),
        ),
      ),
    )
    .orderBy(desc(calls.createdAt))
    .limit(limit);
}

/**
 * Attach a platform child call (Vapi) to the Twilio parent that handed it
 * off. Prefers an explicit parent SID; otherwise the newest unclaimed
 * forwarded_to_ai parent from the same number inside the window.
 */
export async function linkChildCall(input: {
  childPlatformCallId: string;
  explicitParentSid: string | null;
  fromNumber: string | null;
  startedAt: Date | null;
  windowMs?: number;
}): Promise<string | null> {
  let parentSid: string | null = null;
  if (input.explicitParentSid) {
    const [p] = await db
      .select({ sid: calls.platformCallId })
      .from(calls)
      .where(and(eq(calls.platformCallId, input.explicitParentSid), eq(calls.platform, 'twilio')))
      .limit(1);
    parentSid = p?.sid ?? null;
  }
  if (!parentSid && input.fromNumber) {
    const windowMs = input.windowMs ?? 15 * 60 * 1000;
    const anchor = input.startedAt ?? new Date();
    const since = new Date(anchor.getTime() - windowMs);
    const [p] = await db
      .select({ sid: calls.platformCallId })
      .from(calls)
      .where(
        and(
          eq(calls.platform, 'twilio'),
          eq(calls.status, 'forwarded_to_ai'),
          eq(calls.fromNumber, input.fromNumber),
          gte(calls.createdAt, since),
          sql`not exists (select 1 from ${calls} c2 where c2.parent_call_id = ${calls.platformCallId})`,
        ),
      )
      .orderBy(desc(calls.createdAt))
      .limit(1);
    parentSid = p?.sid ?? null;
  }
  if (!parentSid) return null;
  await db
    .update(calls)
    .set({ parentCallId: parentSid, updatedAt: new Date() })
    .where(and(eq(calls.platformCallId, input.childPlatformCallId), isNull(calls.parentCallId)));
  return parentSid;
}

export async function getCallByPlatformId(platformCallId: string): Promise<Call | undefined> {
  const [row] = await db.select().from(calls).where(eq(calls.platformCallId, platformCallId)).limit(1);
  return row;
}

export async function listCalls(opts?: { limit?: number }): Promise<Call[]> {
  return db
    .select()
    .from(calls)
    .orderBy(desc(calls.createdAt))
    .limit(opts?.limit ?? 100);
}

/** Vapi children keyed by their Twilio parent SID — for the admin "AI took it →" link. */
export async function listChildrenByParent(parentSids: string[]): Promise<Map<string, Call>> {
  const map = new Map<string, Call>();
  if (parentSids.length === 0) return map;
  const rows = await db.select().from(calls).where(inArray(calls.parentCallId, parentSids));
  for (const r of rows) if (r.parentCallId && !map.has(r.parentCallId)) map.set(r.parentCallId, r);
  return map;
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

/**
 * Calls that actually run the extraction pipeline today — AI-platform rows plus
 * human-answered Twilio rows. Ringing/forwarded parents are excluded so a
 * fallen-through call isn't counted twice against VOICE_DAILY_CALL_LIMIT.
 */
export async function countPipelineCallsSince(since: Date): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(calls)
    .where(
      and(gte(calls.createdAt, since), or(ne(calls.platform, 'twilio'), eq(calls.answeredBy, 'human'))),
    );
  return row?.n ?? 0;
}
