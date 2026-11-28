import { and, asc, desc, eq, gte, inArray, isNotNull, ne, sql } from 'drizzle-orm';
import { db } from './db';
import { leadNotes, leads, rotationDaysOff, rotationState, users, type Lead } from './db/schema';
import {
  AI_NOTE_AUTHOR,
  everyoneComingUp,
  moved,
  nextUp,
  nextUpSkipping,
  orderForNewcomer,
  pointerAfter,
  type DayOff,
  type LeadOwner,
  type Pointer,
  type RotationPerson,
} from './rotation';
import { localDay } from './voice/onCall';

type Env = Record<string, string | undefined>;

/** The Central day the rotation reads days off against. */
export function rotationDay(now: Date, env: Env = process.env): string {
  return localDay(now, env.VOICE_TZ ?? 'America/Chicago').day;
}

type Reader = Pick<typeof db, 'select'>;

async function peopleIn(reader: Reader): Promise<RotationPerson[]> {
  const rows = await reader
    .select({ id: users.id, name: users.name, email: users.email, order: users.rotationOrder })
    .from(users)
    .where(and(eq(users.inRotation, true), eq(users.disabled, false)));
  return rows.map((r) => ({ ...r, order: r.order ?? 0 }));
}

async function daysOffFrom(reader: Reader, day: string): Promise<DayOff[]> {
  return reader
    .select({
      id: rotationDaysOff.id,
      userId: rotationDaysOff.userId,
      startDay: rotationDaysOff.startDay,
      endDay: rotationDaysOff.endDay,
      note: rotationDaysOff.note,
    })
    .from(rotationDaysOff)
    .where(gte(rotationDaysOff.endDay, day))
    .orderBy(asc(rotationDaysOff.startDay));
}

async function pointerOf(reader: Reader): Promise<Pointer> {
  const [row] = await reader.select().from(rotationState).where(eq(rotationState.id, 1)).limit(1);
  return { userId: row?.lastUserId ?? null, position: row?.lastPosition ?? null };
}

export type RotationView = {
  people: RotationPerson[];
  /** Days off that are running or still to come. */
  daysOff: DayOff[];
  pointer: Pointer;
  /** People with a login who are not in the rotation. */
  others: { id: string; name: string; email: string }[];
};

/** Everything the On call page shows. */
export async function loadRotation(day: string): Promise<RotationView> {
  const [people, daysOff, pointer, others] = await Promise.all([
    peopleIn(db),
    daysOffFrom(db, day),
    pointerOf(db),
    db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(and(eq(users.inRotation, false), eq(users.disabled, false)))
      .orderBy(asc(users.name)),
  ]);
  return { people, daysOff, pointer, others };
}

/**
 * Give a lead to the next person in the rotation and move the list on.
 * The state row is locked for the length of the hand-out, so two leads that
 * arrive together go to two different people. Null = nobody could take it
 * (empty list, or everyone off today): the lead stays with the shared inbox.
 */
export async function handOutLead(
  leadId: string,
  now: Date = new Date(),
  opts?: { skip?: string[] },
): Promise<LeadOwner | null> {
  const day = rotationDay(now);
  return db.transaction(async (tx) => {
    await tx.insert(rotationState).values({ id: 1 }).onConflictDoNothing();
    await tx.execute(sql`select id from rotation_state where id = 1 for update`);
    const [people, daysOff, pointer] = await Promise.all([peopleIn(tx), daysOffFrom(tx, day), pointerOf(tx)]);
    // People rung for this call who did not pick up are skipped (they get no make-up turn).
    const person = opts?.skip?.length
      ? nextUpSkipping(people, pointer, day, daysOff, new Set(opts.skip))
      : nextUp(people, pointer, day, daysOff);
    if (!person) return null;
    const after = pointerAfter(person);
    await tx.update(leads).set({ ownerId: person.id, assignedAt: now, updatedAt: now }).where(eq(leads.id, leadId));
    await tx
      .update(rotationState)
      .set({ lastUserId: after.userId, lastPosition: after.position, updatedAt: now })
      .where(eq(rotationState.id, 1));
    return { id: person.id, name: person.name, email: person.email };
  });
}

/**
 * The hand-out must never cost a lead: if it fails, the lead is already saved
 * and its email goes to the shared inbox the way it did before the rotation.
 */
export async function handOutLeadSafely(
  leadId: string,
  now: Date = new Date(),
  opts?: { skip?: string[] },
): Promise<LeadOwner | null> {
  try {
    return await handOutLead(leadId, now, opts);
  } catch (err) {
    console.error('[rotation] hand-out failed; the lead goes to the shared inbox', err);
    return null;
  }
}

/**
 * The lead belongs to the person who took the call (a caller rung through to
 * them). The list moves on from that person, so whoever was rung before them
 * and did not pick up is skipped. Null when that person can no longer hold a
 * lead; the caller of this then hands it out the usual way.
 */
export async function giveLeadTo(leadId: string, userId: string, now: Date = new Date()): Promise<LeadOwner | null> {
  return db.transaction(async (tx) => {
    await tx.insert(rotationState).values({ id: 1 }).onConflictDoNothing();
    await tx.execute(sql`select id from rotation_state where id = 1 for update`);
    const [person] = await tx
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        disabled: users.disabled,
        inRotation: users.inRotation,
        order: users.rotationOrder,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!person || person.disabled) return null;
    await tx.update(leads).set({ ownerId: person.id, assignedAt: now, updatedAt: now }).where(eq(leads.id, leadId));
    if (person.inRotation) {
      await tx
        .update(rotationState)
        .set({ lastUserId: person.id, lastPosition: person.order ?? 0, updatedAt: now })
        .where(eq(rotationState.id, 1));
    }
    return { id: person.id, name: person.name, email: person.email };
  });
}

export async function giveLeadToSafely(leadId: string, userId: string, now: Date = new Date()): Promise<LeadOwner | null> {
  try {
    return await giveLeadTo(leadId, userId, now);
  } catch (err) {
    console.error('[rotation] could not give the lead to the person who took the call', err);
    return null;
  }
}

/**
 * The people who could be rung right now, in the order their turns come, each
 * once, with the cell saved on their user (null when none is saved).
 */
export async function ringCandidates(now: Date = new Date()): Promise<{ id: string; name: string; phone: string | null }[]> {
  const day = rotationDay(now);
  const [people, daysOff, pointer, cells] = await Promise.all([
    peopleIn(db),
    daysOffFrom(db, day),
    pointerOf(db),
    db.select({ id: users.id, phone: users.phone }).from(users).where(eq(users.inRotation, true)),
  ]);
  const cellOf = new Map(cells.map((c) => [c.id, c.phone]));
  return everyoneComingUp(people, pointer, day, daysOff).map((p) => ({ id: p.id, name: p.name, phone: cellOf.get(p.id) ?? null }));
}

/** Who a lead went to, when that person can still be written to. */
export async function ownerOf(lead: Pick<Lead, 'ownerId'>): Promise<LeadOwner | null> {
  if (!lead.ownerId) return null;
  const [row] = await db
    .select({ id: users.id, name: users.name, email: users.email, disabled: users.disabled })
    .from(users)
    .where(eq(users.id, lead.ownerId))
    .limit(1);
  return row && !row.disabled ? { id: row.id, name: row.name, email: row.email } : null;
}

/** Hand a lead to a named person (or to nobody). The rotation does not move. */
export async function setLeadOwner(leadId: string, userId: string | null): Promise<void> {
  const now = new Date();
  await db
    .update(leads)
    .set({ ownerId: userId, assignedAt: userId ? now : null, updatedAt: now })
    .where(eq(leads.id, leadId));
}

export async function addToRotation(userId: string): Promise<void> {
  await db.transaction(async (tx) => {
    const people = await peopleIn(tx);
    if (people.some((p) => p.id === userId)) return;
    // Someone switched off for a while may still hold an order; newcomers go to the end of everyone's.
    const [{ max }] = await tx
      .select({ max: sql<number>`coalesce(max(${users.rotationOrder}), 0)::int` })
      .from(users);
    const order = Math.max(orderForNewcomer(people), max + 1);
    await tx
      .update(users)
      .set({ inRotation: true, rotationOrder: order, updatedAt: new Date() })
      .where(eq(users.id, userId));
  });
}

/** Out of the rotation. Their order number stays, so the list carries on from their place. */
export async function removeFromRotation(userId: string): Promise<void> {
  await db.update(users).set({ inRotation: false, updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function moveInRotation(userId: string, direction: 'up' | 'down'): Promise<void> {
  await db.transaction(async (tx) => {
    for (const row of moved(await peopleIn(tx), userId, direction)) {
      await tx.update(users).set({ rotationOrder: row.order, updatedAt: new Date() }).where(eq(users.id, row.id));
    }
  });
}

export async function addDayOff(input: {
  userId: string;
  startDay: string;
  endDay: string;
  note: string | null;
}): Promise<void> {
  await db.insert(rotationDaysOff).values(input);
}

export async function removeDayOff(id: string): Promise<void> {
  await db.delete(rotationDaysOff).where(eq(rotationDaysOff.id, id));
}

export type HandOut = { leadId: string; leadName: string; source: string; assignedAt: Date; ownerName: string };

/** The latest leads that went to a person, newest first. */
export async function recentHandOuts(limit = 8): Promise<HandOut[]> {
  const rows = await db
    .select({
      leadId: leads.id,
      leadName: leads.name,
      source: leads.source,
      assignedAt: leads.assignedAt,
      ownerName: users.name,
    })
    .from(leads)
    .innerJoin(users, eq(users.id, leads.ownerId))
    .where(isNotNull(leads.assignedAt))
    .orderBy(desc(leads.assignedAt))
    .limit(limit);
  return rows.map((r) => ({ ...r, assignedAt: r.assignedAt! }));
}

/** Names for the "Went to" column and its filter: everyone who holds a lead or is in the rotation. */
export async function ownerNames(): Promise<Map<string, string>> {
  const rows = await db.select({ id: users.id, name: users.name }).from(users);
  return new Map(rows.map((r) => [r.id, r.name]));
}

/** The latest note a person wrote on each of these leads. */
export async function lastHumanNotes(
  leadIds: string[],
): Promise<Map<string, { authorName: string; body: string }>> {
  if (leadIds.length === 0) return new Map();
  const rows = await db
    .selectDistinctOn([leadNotes.leadId], {
      leadId: leadNotes.leadId,
      authorName: leadNotes.authorName,
      body: leadNotes.body,
    })
    .from(leadNotes)
    .where(and(inArray(leadNotes.leadId, leadIds), ne(leadNotes.authorName, AI_NOTE_AUTHOR)))
    .orderBy(leadNotes.leadId, desc(leadNotes.createdAt));
  return new Map(rows.map((r) => [r.leadId, { authorName: r.authorName, body: r.body }]));
}
