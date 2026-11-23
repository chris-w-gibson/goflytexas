/**
 * Lead rotation rules (Jim 2026-11-22: "a batter's list… it doesn't reset each
 * day. It just goes down the list in order and then goes back to the top").
 * Pure: no DB, no Next.js. The store and the pages feed it rows.
 *
 * The rotation is the people from Users who are in it, in order. Each new lead
 * goes to the next person after the one who got the last lead. A person on a
 * day off is passed over and keeps their place in the list.
 */

export type RotationPerson = { id: string; name: string; email: string; order: number };

/** Inclusive calendar days (YYYY-MM-DD, Central). One day off = the same day twice. */
export type DayOff = { id: string; userId: string; startDay: string; endDay: string; note: string | null };

/** Who got the last lead, and where they stood in the list when they got it. */
export type Pointer = { userId: string | null; position: number | null };

/** Who a lead went to. */
export type LeadOwner = { id: string; name: string; email: string };

export function inOrder(people: RotationPerson[]): RotationPerson[] {
  return [...people].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export function isOff(userId: string, day: string, daysOff: DayOff[]): boolean {
  return daysOff.some((d) => d.userId === userId && d.startDay <= day && day <= d.endDay);
}

/**
 * The last day of the stretch of days off that covers `day`, or null when the
 * person is working. Ranges that touch or overlap read as one stretch.
 */
export function offThrough(userId: string, day: string, daysOff: DayOff[]): string | null {
  const mine = daysOff.filter((d) => d.userId === userId);
  let end: string | null = null;
  let cursor = day;
  for (;;) {
    const covering = mine.filter((d) => d.startDay <= cursor && cursor <= d.endDay);
    if (covering.length === 0) return end;
    end = covering.map((d) => d.endDay).sort().at(-1)!;
    cursor = nextDay(end);
  }
}

function nextDay(day: string): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Where the walk starts: the place after whoever got the last lead. */
function startIndex(list: RotationPerson[], pointer: Pointer): number {
  const at = pointer.userId ? list.findIndex((p) => p.id === pointer.userId) : -1;
  if (at >= 0) return (at + 1) % list.length;
  // That person has left the rotation: carry on from where they stood.
  if (pointer.position !== null) {
    const after = list.findIndex((p) => p.order > pointer.position!);
    return after >= 0 ? after : 0;
  }
  return 0;
}

/**
 * The next `count` people to get a lead on `day`, in the order they would get
 * them. Empty when nobody is in the rotation or everyone is off.
 */
export function comingUp(
  people: RotationPerson[],
  pointer: Pointer,
  day: string,
  daysOff: DayOff[],
  count: number,
): RotationPerson[] {
  const list = inOrder(people);
  if (list.length === 0) return [];
  const working = list.filter((p) => !isOff(p.id, day, daysOff));
  if (working.length === 0) return [];
  const out: RotationPerson[] = [];
  let i = startIndex(list, pointer);
  while (out.length < count) {
    const person = list[i];
    if (!isOff(person.id, day, daysOff)) out.push(person);
    i = (i + 1) % list.length;
  }
  return out;
}

/** Who gets the next lead on `day`. Null = nobody can take it; it goes to the shared inbox only. */
export function nextUp(
  people: RotationPerson[],
  pointer: Pointer,
  day: string,
  daysOff: DayOff[],
): RotationPerson | null {
  return comingUp(people, pointer, day, daysOff, 1)[0] ?? null;
}

/** The pointer after `person` has been given a lead. */
export function pointerAfter(person: RotationPerson): Pointer {
  return { userId: person.id, position: person.order };
}

/** Swap a person with their neighbour. Returns the two rows whose order changed, or none at an end. */
export function moved(
  people: RotationPerson[],
  userId: string,
  direction: 'up' | 'down',
): { id: string; order: number }[] {
  const list = inOrder(people);
  const at = list.findIndex((p) => p.id === userId);
  const other = direction === 'up' ? at - 1 : at + 1;
  if (at < 0 || other < 0 || other >= list.length) return [];
  return [
    { id: list[at].id, order: list[other].order },
    { id: list[other].id, order: list[at].order },
  ];
}

/** A new person joins at the end of the list. */
export function orderForNewcomer(people: RotationPerson[]): number {
  return people.reduce((max, p) => Math.max(max, p.order), 0) + 1;
}

/** A start and an end day make a range when both are real days and in order. */
export function dayOffRange(start: string, end: string): { startDay: string; endDay: string } | null {
  const real = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T12:00:00Z`));
  if (!real(start)) return null;
  const last = end || start;
  if (!real(last) || last < start) return null;
  return { startDay: start, endDay: last };
}

/** "Nov 26" or "Nov 26 to Nov 29". */
export function dayOffWords(d: { startDay: string; endDay: string }): string {
  const words = (day: string) =>
    new Date(`${day}T12:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' });
  return d.startDay === d.endDay ? words(d.startDay) : `${words(d.startDay)} to ${words(d.endDay)}`;
}

/** "Mark, then Jim, then Kristen" for the people coming up. */
export function comingUpWords(people: { name: string }[]): string {
  return people.map((p) => p.name).join(', then ');
}

/** Notes the phone assistant files are not something a person did. */
export const AI_NOTE_AUTHOR = 'AI phone agent';

export type FollowThrough = { text: string; who: string | null; done: boolean };

/**
 * One short reading of what was done with a lead (Jim: "who that lead went to
 * and then what they did with it"). The latest note a person wrote says most;
 * without one, the status does.
 */
export function whatTheyDid(lead: {
  status: string;
  firstContactedAt: Date | null;
  lastNote: { authorName: string; body: string } | null;
}): FollowThrough {
  const note = lead.lastNote;
  const converted = lead.status === 'converted';
  if (note) {
    const body = note.body.replace(/\s+/g, ' ').trim();
    const short = body.length > 90 ? `${body.slice(0, 89).trimEnd()}…` : body;
    return { text: converted ? `Converted. ${short}` : short, who: note.authorName, done: true };
  }
  if (converted) return { text: 'Converted', who: null, done: true };
  if (lead.firstContactedAt) return { text: 'Marked contacted, no note', who: null, done: true };
  return { text: 'Nothing yet', who: null, done: false };
}

/**
 * Who the lead email goes to. With an owner it is theirs, and the shared inbox
 * (plus anyone on LEAD_NOTIFY_EMAILS) is copied; without one it goes to the
 * shared inbox as before.
 */
export function leadRecipients(
  owner: { email: string } | null,
  shared: string[],
): { to: string[]; cc?: string[] } {
  const seen = new Set<string>();
  const unique = (list: string[]) =>
    list.filter((e) => {
      const k = e.trim().toLowerCase();
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  if (!owner) return { to: unique(shared) };
  const to = unique([owner.email]);
  const cc = unique(shared);
  return cc.length > 0 ? { to, cc } : { to };
}
