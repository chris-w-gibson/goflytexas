import { and, desc, eq, isNull, lt, or, sql } from 'drizzle-orm';
import { db } from './db';
import { emailEvents, leads, type Lead, type NewLead } from './db/schema';

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

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<Lead | undefined> {
  const [row] = await db
    .update(leads)
    .set({ status, updatedAt: new Date() })
    .where(eq(leads.id, id))
    .returning();
  return row;
}

export async function markContacted(id: string): Promise<Lead | undefined> {
  const now = new Date();
  const [row] = await db
    .update(leads)
    .set({
      status: 'contacted',
      lastContactedAt: now,
      updatedAt: now,
    })
    .where(eq(leads.id, id))
    .returning();
  return row;
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

export async function findWeeklyFollowupCandidates(opts?: {
  intervalDays?: number;
  limit?: number;
}): Promise<Lead[]> {
  const days = opts?.intervalDays ?? 7;
  const limit = opts?.limit ?? 100;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return db
    .select()
    .from(leads)
    .where(
      and(
        eq(leads.unsubscribed, false),
        or(eq(leads.status, 'new'), eq(leads.status, 'contacted')),
        or(isNull(leads.lastContactedAt), lt(leads.lastContactedAt, cutoff)),
      ),
    )
    .orderBy(desc(leads.createdAt))
    .limit(limit);
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
