import { toE164 } from './phone';
import type { RingTarget } from './twilio';

/**
 * On-call schedule rules (Jim 2026-11-20: "an on call per day calendar or a
 * batting list"). Pure: no DB, no Next.js — the store and the page feed it rows.
 *
 * A day's order is a short list of people: the first is rung, then the next,
 * then the AI assistant. It comes from the usual week (weekday → order)
 * unless that date has its own entry, which replaces the whole day.
 */

/** People rung before the AI. Each one adds a full ring to the caller's wait. */
export const MAX_RING_ORDER = 2;

export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Monday first, the way the page lists the week. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export type StaffRow = { id: string; name: string; phone: string; active: boolean };
export type RotaRow = { weekday: number; position: number; staffId: string };
export type OverrideRow = { day: string; position: number; staffId: string };
export type Schedule = { staff: StaffRow[]; rota: RotaRow[]; overrides: OverrideRow[] };
export type DayOrder = { day: string; weekday: number; changed: boolean; people: StaffRow[] };

/** Calendar date (YYYY-MM-DD) and weekday (0 = Sunday) of `now` in `tz`. */
export function localDay(now: Date, tz: string): { day: string; weekday: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const day = `${get('year')}-${get('month')}-${get('day')}`;
  return { day, weekday: weekdayOf(day) };
}

export function isDay(v: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T12:00:00Z`));
}

export function weekdayOf(day: string): number {
  return new Date(`${day}T12:00:00Z`).getUTCDay();
}

export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** The Monday on or before `day`. */
export function weekStart(day: string): string {
  return addDays(day, -((weekdayOf(day) + 6) % 7));
}

/**
 * Who is up on `day`, in ring order. A date with its own entry uses only that
 * entry; otherwise the usual week. Someone switched off or removed is left
 * out, and nobody is listed twice.
 */
export function orderFor(day: string, s: Schedule): DayOrder {
  const weekday = weekdayOf(day);
  const own = s.overrides.filter((o) => o.day === day);
  const rows = own.length > 0 ? own : s.rota.filter((r) => r.weekday === weekday);
  const byId = new Map(s.staff.map((p) => [p.id, p]));
  const people: StaffRow[] = [];
  for (const row of [...rows].sort((a, b) => a.position - b.position)) {
    const person = byId.get(row.staffId);
    if (!person || !person.active || people.some((p) => p.id === person.id)) continue;
    people.push(person);
    if (people.length === MAX_RING_ORDER) break;
  }
  return { day, weekday, changed: own.length > 0, people };
}

/** `count` days starting at `from`. */
export function upcoming(from: string, count: number, s: Schedule): DayOrder[] {
  return Array.from({ length: count }, (_, i) => orderFor(addDays(from, i), s));
}

/** The numbers Twilio dials, in order. Unusable and reserved numbers are dropped. */
export function ringPlan(people: StaffRow[], reserved: Set<string>): RingTarget[] {
  const out: RingTarget[] = [];
  for (const p of people) {
    const number = toE164(p.phone);
    if (!number || reserved.has(number) || out.some((t) => t.number === number)) continue;
    out.push({ name: p.name, number });
  }
  return out.slice(0, MAX_RING_ORDER);
}

/** One row per position chosen on a form; blanks and repeats are dropped. */
export function positionsFrom(staffIds: (string | null | undefined)[]): { position: number; staffId: string }[] {
  const out: { position: number; staffId: string }[] = [];
  for (const id of staffIds) {
    const v = (id ?? '').trim();
    if (!v || out.some((o) => o.staffId === v)) continue;
    out.push({ position: out.length + 1, staffId: v });
    if (out.length === MAX_RING_ORDER) break;
  }
  return out;
}

/** "Mark, then Jim, then the AI" — the one sentence the page and the flow use. */
export function orderWords(people: { name: string }[]): string {
  if (people.length === 0) return 'the AI answers';
  return `${people.map((p) => p.name).join(', then ')}, then the AI`;
}

/** "08:00-17:00" → "8:00 AM to 5:00 PM"; anything else is shown as "all day" (the router treats it as always open). */
export function hoursWords(window: string): string {
  const m = /^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/.exec(window.trim());
  if (!m) return 'all day';
  const clock = (h: number, min: string) => `${h % 12 === 0 ? 12 : h % 12}:${min} ${h % 24 < 12 ? 'AM' : 'PM'}`;
  return `${clock(Number(m[1]), m[2])} to ${clock(Number(m[3]), m[4])}`;
}

/** "Mon, Nov 23" for a YYYY-MM-DD day. */
export function dayLabel(day: string, opts: { weekday?: boolean } = {}): string {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    ...(opts.weekday === false ? {} : { weekday: 'short' }),
    month: 'short',
    day: 'numeric',
  });
}
