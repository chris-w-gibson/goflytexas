import { and, desc, eq, gt, isNotNull, ne, or, sql } from 'drizzle-orm';
import { db } from './db';
import { emailEvents, leadNotes, leads, type Lead, type NewLead } from './db/schema';
import {
  dueFollowupStep,
  FOLLOWUP_MAX_AGE_DAYS,
  parseFollowupSchedule,
} from './followup';

export type LeadStatus = Lead['status'];

export async function createLead(input: NewLead): Promise<Lead> {
  const [row] = await db.insert(leads).values(input).returning();
  return row;
}

export async function listLeads(opts?: {
  status?: LeadStatus;
  limit?: number;
}): Promise<Lead[]> {
  const limit = opts?.limit ?? 200;
  if (opts?.status) {
    return db
      .select()
      .from(leads)
      .where(eq(leads.status, opts.status))
      .orderBy(desc(leads.createdAt))
      .limit(limit);
  }
  return db.select().from(leads).orderBy(desc(leads.createdAt)).limit(limit);
}

export async function getLeadById(id: string): Promise<Lead | undefined> {
  const [row] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return row;
}

export async function getLeadByUnsubscribeToken(
  token: string,
): Promise<Lead | undefined> {
  const [row] = await db
    .select()
    .from(leads)
    .where(eq(leads.unsubscribeToken, token))
    .limit(1);
  return row;
}

export async function getLeadByContactToken(
  token: string,
): Promise<Lead | undefined> {
  const [row] = await db
    .select()
    .from(leads)
    .where(eq(leads.contactToken, token))
    .limit(1);
  return row;
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<Lead | undefined> {
  const now = new Date();
  // A human moving a lead to contacted/converted counts as the first touch.
  const humanTouch = status === 'contacted' || status === 'converted';
  const [row] = await db
    .update(leads)
    .set({
      status,
      updatedAt: now,
      ...(humanTouch
        ? { firstContactedAt: sql`coalesce(${leads.firstContactedAt}, ${now})` }
        : {}),
    })
    .where(eq(leads.id, id))
    .returning();
  return row;
}

/**
 * Record a HUMAN contact at an explicit time (e.g. the moment a live-answered
 * call ended): sets first_contacted_at (once), last_contacted_at (never
 * earlier than what's there), and moves a `new` lead to `contacted`.
 * Converted/unsubscribed are left alone.
 */
export async function markContactedAt(id: string, at: Date): Promise<Lead | undefined> {
  const [row] = await db
    .update(leads)
    .set({
      status: sql`case when ${leads.status} = 'new' then 'contacted'::lead_status else ${leads.status} end`,
      firstContactedAt: sql`coalesce(${leads.firstContactedAt}, ${at})`,
      lastContactedAt: sql`greatest(coalesce(${leads.lastContactedAt}, ${at}), ${at})`,
      updatedAt: new Date(),
    })
    .where(eq(leads.id, id))
    .returning();
  return row;
}

/** Human contact right now (admin buttons, notes, ack link). */
export async function markContacted(id: string): Promise<Lead | undefined> {
  return markContactedAt(id, new Date());
}

/** Free-text activity note on a lead (human or automated author). */
export async function addLeadNote(input: {
  leadId: string;
  authorName: string;
  body: string;
}): Promise<void> {
  await db.insert(leadNotes).values({
    leadId: input.leadId,
    authorName: input.authorName,
    body: input.body.slice(0, 4000),
  });
}

/** Same as markContacted, addressed by the token from the notification email. */
export async function markContactedByToken(token: string): Promise<Lead | undefined> {
  const lead = await getLeadByContactToken(token);
  if (!lead) return undefined;
  return markContacted(lead.id);
}

/**
 * Automated touch (drip email). Only bumps last_contacted_at — never status or
 * first_contacted_at, so the drip can't masquerade as a human response.
 */
export async function touchLastContacted(id: string): Promise<void> {
  const now = new Date();
  await db
    .update(leads)
    .set({ lastContactedAt: now, updatedAt: now })
    .where(eq(leads.id, id));
}

export async function unsubscribeLead(token: string): Promise<Lead | undefined> {
  const [row] = await db
    .update(leads)
    .set({
      unsubscribed: true,
      status: 'unsubscribed',
      updatedAt: new Date(),
    })
    .where(eq(leads.unsubscribeToken, token))
    .returning();
  return row;
}

export type FollowupCandidate = { lead: Lead; step: number; sentCount: number };

/**
 * Open leads (new/contacted, not unsubscribed, younger than the max age) with
 * the follow-up step that is due right now, per the staggered schedule.
 */
/**
 * Correlated count of follow-ups already sent to the outer `leads` row.
 *
 * The outer column MUST be table-qualified: inside a raw `sql` fragment Drizzle
 * renders `${leads.id}` as a bare `"id"`, which Postgres resolves to the
 * subquery's own `email_events.id` — the count was always 0, so the drip
 * re-sent step 1 to every lead on every run (2026-08-29/30, 70 emails).
 */
export function followupSentCountSql() {
  return sql<number>`(
    select count(*)::int from ${emailEvents} e
    where e.lead_id = ${leads}.${sql.identifier(leads.id.name)}
      and e.kind = 'weekly_followup' and e.error is null
  )`;
}

export async function findFollowupCandidates(opts?: {
  schedule?: number[];
  now?: Date;
  limit?: number;
}): Promise<FollowupCandidate[]> {
  const schedule = opts?.schedule ?? parseFollowupSchedule(process.env.FOLLOWUP_DAYS);
  const now = opts?.now ?? new Date();
  const limit = opts?.limit ?? 200;
  const oldest = new Date(now.getTime() - FOLLOWUP_MAX_AGE_DAYS * 24 * 60 * 60 * 1000);

  const sentCount = followupSentCountSql();

  const rows = await db
    .select({ lead: leads, sentCount })
    .from(leads)
    .where(
      and(
        eq(leads.unsubscribed, false),
        // Phone-only leads (no email) never enter the email drip.
        isNotNull(leads.email),
        or(eq(leads.status, 'new'), eq(leads.status, 'contacted')),
        gt(leads.createdAt, oldest),
      ),
    )
    .orderBy(desc(leads.createdAt))
    .limit(limit);

  const due: FollowupCandidate[] = [];
  for (const { lead, sentCount: n } of rows) {
    const step = dueFollowupStep({ createdAt: lead.createdAt, sentCount: n, schedule, now });
    if (step) due.push({ lead, step, sentCount: n });
  }
  return due;
}

/** Most recent open lead with this display phone (XXX-XXX-XXXX) — for call dedupe. */
export async function findRecentLeadByEmail(
  email: string,
  since: Date = new Date(Date.now() - 24 * 60 * 60 * 1000),
): Promise<Lead | undefined> {
  const [row] = await db
    .select()
    .from(leads)
    .where(
      and(eq(leads.email, email), gt(leads.createdAt, since), ne(leads.status, 'unsubscribed')),
    )
    .orderBy(desc(leads.createdAt))
    .limit(1);
  return row;
}

export async function findRecentLeadByPhone(
  phone: string,
  since: Date = new Date(Date.now() - 24 * 60 * 60 * 1000),
): Promise<Lead | undefined> {
  const [row] = await db
    .select()
    .from(leads)
    .where(
      and(eq(leads.phone, phone), gt(leads.createdAt, since), ne(leads.status, 'unsubscribed')),
    )
    .orderBy(desc(leads.createdAt))
    .limit(1);
  return row;
}

export async function recordEmailEvent(input: {
  leadId: string;
  kind: 'auto_reply' | 'weekly_followup' | 'admin_notify' | 'manual';
  error?: string | null;
}): Promise<void> {
  await db.insert(emailEvents).values({
    leadId: input.leadId,
    kind: input.kind,
    error: input.error ?? null,
  });
}

export async function countLeads(): Promise<{
  total: number;
  new_: number;
  contacted: number;
  converted: number;
  unsubscribed: number;
}> {
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      new_: sql<number>`count(*) filter (where status = 'new')::int`,
      contacted: sql<number>`count(*) filter (where status = 'contacted')::int`,
      converted: sql<number>`count(*) filter (where status = 'converted')::int`,
      unsubscribed: sql<number>`count(*) filter (where status = 'unsubscribed')::int`,
    })
    .from(leads);
  return row;
}

/** Response-time KPIs for the dashboard (last 30 days). */
export async function getResponseStats(): Promise<{
  waiting: number;
  waitingOverHour: number;
  responded30d: number;
  medianResponseMs: number | null;
  withinHourPct: number | null;
}> {
  const [row] = await db
    .select({
      waiting: sql<number>`count(*) filter (where status = 'new' and first_contacted_at is null)::int`,
      waitingOverHour: sql<number>`count(*) filter (where status = 'new' and first_contacted_at is null and created_at < now() - interval '1 hour')::int`,
      responded30d: sql<number>`count(*) filter (where first_contacted_at is not null and created_at > now() - interval '30 days')::int`,
      medianResponseMs: sql<number | null>`(
        percentile_cont(0.5) within group (order by extract(epoch from (first_contacted_at - created_at)))
        filter (where first_contacted_at is not null and created_at > now() - interval '30 days')
      ) * 1000`,
      withinHour: sql<number>`count(*) filter (where first_contacted_at is not null and created_at > now() - interval '30 days' and first_contacted_at - created_at <= interval '1 hour')::int`,
    })
    .from(leads);
  const median = row.medianResponseMs === null ? null : Number(row.medianResponseMs);
  return {
    waiting: row.waiting,
    waitingOverHour: row.waitingOverHour,
    responded30d: row.responded30d,
    medianResponseMs: median,
    withinHourPct: row.responded30d ? Math.round((row.withinHour / row.responded30d) * 100) : null,
  };
}
