import { and, asc, eq, gte } from 'drizzle-orm';
import { db } from './db';
import { onCallOverrides, onCallRota, phoneStaff } from './db/schema';
import {
  localDay,
  orderFor,
  positionsFrom,
  ringPlan,
  type Schedule,
} from './voice/onCall';
import { reservedNumbers, type Env, type RingTarget } from './voice/twilio';

/** Everything the on-call rules need: the people, the usual week, and dated changes from `fromDay` on. */
export async function loadSchedule(fromDay: string): Promise<Schedule> {
  const [staff, rota, overrides] = await Promise.all([
    db.select().from(phoneStaff).orderBy(asc(phoneStaff.name)),
    db.select().from(onCallRota),
    db.select().from(onCallOverrides).where(gte(onCallOverrides.day, fromDay)),
  ]);
  return {
    staff: staff.map((p) => ({ id: p.id, name: p.name, phone: p.phone, active: p.active })),
    rota,
    overrides,
  };
}

/** Who a call arriving at `now` rings, in order. Empty = nobody is scheduled. */
export async function loadRingPlan(now: Date, env: Env = process.env): Promise<RingTarget[]> {
  const { day } = localDay(now, env.VOICE_TZ ?? 'America/Chicago');
  const schedule = await loadSchedule(day);
  return ringPlan(orderFor(day, schedule).people, reservedNumbers(env));
}

export async function addPerson(name: string, phone: string): Promise<void> {
  await db.insert(phoneStaff).values({ name, phone });
}

export async function setPersonActive(id: string, active: boolean): Promise<void> {
  await db.update(phoneStaff).set({ active, updatedAt: new Date() }).where(eq(phoneStaff.id, id));
}

/** Removing a person takes them off every day they were on (cascade). */
export async function removePerson(id: string): Promise<void> {
  await db.delete(phoneStaff).where(eq(phoneStaff.id, id));
}

/** Replace one weekday of the usual week. */
export async function saveWeekday(weekday: number, staffIds: (string | null)[]): Promise<void> {
  const rows = positionsFrom(staffIds);
  await db.transaction(async (tx) => {
    await tx.delete(onCallRota).where(eq(onCallRota.weekday, weekday));
    if (rows.length > 0) await tx.insert(onCallRota).values(rows.map((r) => ({ weekday, ...r })));
  });
}

/** Give one date its own order. An empty order removes the change (back to the usual week). */
export async function saveDay(day: string, staffIds: (string | null)[]): Promise<void> {
  const rows = positionsFrom(staffIds);
  await db.transaction(async (tx) => {
    await tx.delete(onCallOverrides).where(eq(onCallOverrides.day, day));
    if (rows.length > 0) await tx.insert(onCallOverrides).values(rows.map((r) => ({ day, ...r })));
  });
}

export async function clearDay(day: string): Promise<void> {
  await db.delete(onCallOverrides).where(and(eq(onCallOverrides.day, day)));
}
