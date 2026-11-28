import Link from 'next/link';
import { getSessionFromCookies } from '@/lib/auth';
import {
  comingUp,
  comingUpWords,
  dayOffWords,
  inOrder,
  isOff,
  offThrough,
  type DayOff,
  type RotationPerson,
} from '@/lib/rotation';
import { loadRotation, recentHandOuts, ringCandidates, rotationDay } from '@/lib/rotationStore';
import {
  chooseRingPlan,
  ringThroughMode,
  ringThroughOpen,
  ringThroughPageWords,
  ringThroughTimeoutSec,
} from '@/lib/voice/ringThrough';
import { addDays, dayLabel } from '@/lib/voice/onCall';
import { reservedNumbers, routingMode } from '@/lib/voice/twilio';
import {
  addDayOffAction,
  addToRotationAction,
  moveInRotationAction,
  removeDayOffAction,
  removeFromRotationAction,
} from './actions';

export const dynamic = 'force-dynamic';

const SOURCE_WORDS: Record<string, string> = { web: 'Website', phone: 'Phone', manual: 'Typed in' };

function FlowStrip({ next }: { next: RotationPerson | null }) {
  const steps = [
    { label: 'A lead comes in', sub: 'website form, missed call or voicemail' },
    { label: 'AI assistant', sub: 'answers the phone first' },
    next
      ? { label: next.name, sub: 'next in the rotation' }
      : { label: 'Nobody up', sub: 'the rotation is empty or everyone is off' },
    { label: 'Lead email', sub: next ? `to ${next.name} only` : 'to the shared inbox' },
  ];
  return (
    <ol className="flex flex-col sm:flex-row sm:flex-wrap sm:items-stretch gap-1 sm:gap-2 text-sm" data-testid="lead-flow">
      {steps.map((s, i) => (
        <li key={s.label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <div
            className={`border rounded-lg px-3 py-2 ${
              i === 2 && next ? 'bg-sky-50 border-sky-400' : 'bg-white border-slate-200'
            }`}
          >
            <p className="font-medium text-navy-900">{s.label}</p>
            <p className="text-xs text-slate-500">{s.sub}</p>
          </div>
          {i < steps.length - 1 && (
            <span aria-hidden className="text-slate-400 pl-4 sm:pl-0">
              <span className="sm:hidden">↓</span>
              <span className="hidden sm:inline">→</span>
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

function PersonRow({
  person,
  place,
  count,
  today,
  daysOff,
  isNext,
  canEdit,
  isAdmin,
}: {
  person: RotationPerson;
  place: number;
  count: number;
  today: string;
  daysOff: DayOff[];
  isNext: boolean;
  canEdit: boolean;
  isAdmin: boolean;
}) {
  const mine = daysOff.filter((d) => d.userId === person.id);
  const through = offThrough(person.id, today, daysOff);
  return (
    <li className="py-3 space-y-2" data-testid={`rotation-person-${place}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="w-6 text-sm font-semibold text-slate-400">{place}.</span>
        <div className="flex-1 min-w-[10rem]">
          <p className="font-medium text-navy-900">{person.name}</p>
          <p className="text-xs text-slate-500">{person.email}</p>
        </div>
        {through ? (
          <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800" data-testid="off-today">
            Off today, back {dayLabel(addDays(through, 1))}
          </span>
        ) : isNext ? (
          <span className="text-xs px-2 py-1 rounded-full bg-sky-100 text-sky-800 font-medium" data-testid="next-up">
            Gets the next lead
          </span>
        ) : null}
        {isAdmin && (
          <div className="flex items-center gap-1.5">
            {(['up', 'down'] as const).map((direction) => (
              <form key={direction} action={moveInRotationAction}>
                <input type="hidden" name="userId" value={person.id} />
                <input type="hidden" name="direction" value={direction} />
                <button
                  type="submit"
                  disabled={direction === 'up' ? place === 1 : place === count}
                  aria-label={`Move ${person.name} ${direction}`}
                  className="text-xs border border-slate-300 rounded-lg px-2 py-1 hover:bg-slate-50 disabled:opacity-30"
                >
                  {direction === 'up' ? '↑' : '↓'}
                </button>
              </form>
            ))}
            <form action={removeFromRotationAction}>
              <input type="hidden" name="userId" value={person.id} />
              <button
                type="submit"
                className="text-xs border border-red-200 text-red-600 rounded-lg px-2 py-1 hover:bg-red-50"
              >
                Take out
              </button>
            </form>
          </div>
        )}
      </div>
      <div className="pl-9 space-y-1.5">
        {mine.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" data-testid="days-off">
            {mine.map((d) => (
              <li
                key={d.id}
                className="text-xs bg-slate-100 text-slate-700 rounded-full pl-2.5 pr-1 py-0.5 flex items-center gap-1"
              >
                <span>
                  Off {dayOffWords(d)}
                  {d.note ? ` (${d.note})` : ''}
                </span>
                {canEdit && (
                  <form action={removeDayOffAction}>
                    <input type="hidden" name="id" value={d.id} />
                    <button
                      type="submit"
                      aria-label={`Remove ${person.name}'s days off ${dayOffWords(d)}`}
                      className="rounded-full px-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                    >
                      ×
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
        {canEdit && (
          <details className="text-xs">
            <summary className="cursor-pointer text-sky-700 hover:underline select-none">Add days off</summary>
            <form action={addDayOffAction} className="mt-2 flex flex-wrap items-end gap-2">
              <input type="hidden" name="userId" value={person.id} />
              <label className="flex flex-col gap-0.5 text-slate-600">
                First day off
                <input
                  type="date"
                  name="start"
                  required
                  min={today}
                  className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
                />
              </label>
              <label className="flex flex-col gap-0.5 text-slate-600">
                Last day off
                <input type="date" name="end" min={today} className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm" />
              </label>
              <label className="flex flex-col gap-0.5 text-slate-600 flex-1 min-w-[8rem]">
                Note
                <input
                  type="text"
                  name="note"
                  maxLength={120}
                  placeholder="vacation"
                  className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
                />
              </label>
              <button type="submit" className="bg-navy-900 text-white rounded-lg px-3 py-2 font-medium">
                Save days off
              </button>
            </form>
            <p className="mt-1 text-slate-500">Leave the last day empty for a single day.</p>
          </details>
        )}
      </div>
    </li>
  );
}

export default async function OnCallPage() {
  const session = await getSessionFromCookies();
  const now = new Date();
  const today = rotationDay(now);
  const [rotation, handOuts, candidates] = await Promise.all([loadRotation(today), recentHandOuts(), ringCandidates(now)]);
  const ringMode = ringThroughMode();
  const ringWords = ringThroughPageWords({
    mode: ringMode,
    open: ringThroughOpen(ringMode, now),
    plan: chooseRingPlan(candidates, { reserved: reservedNumbers(), caller: null }),
    noCell: candidates.filter((c) => !c.phone).map((c) => c.name),
    seconds: ringThroughTimeoutSec(),
  });
  const people = inOrder(rotation.people);
  const working = people.filter((p) => !isOff(p.id, today, rotation.daysOff));
  const upNext = comingUp(people, rotation.pointer, today, rotation.daysOff, Math.min(3, working.length));
  const next = upNext[0] ?? null;
  const canEdit = Boolean(session);
  const isAdmin = session?.role === 'admin';
  const ringing = routingMode() === 'humans_first';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">On call</h1>
        <p className="text-sm text-slate-600 mt-1">
          Who gets the next lead. Everyone on the list takes a turn, in order, and the list picks up tomorrow
          where it stopped today.
        </p>
      </div>

      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3" data-testid="rotation-status">
        <p className="text-sm text-slate-600">
          {next ? (
            <>
              The next lead goes to <strong className="text-navy-900">{next.name}</strong>
              {upNext.length > 1 ? <>, then {comingUpWords(upNext.slice(1))}</> : null}.
            </>
          ) : people.length === 0 ? (
            <>Nobody is in the rotation yet, so every lead goes to the shared inbox.</>
          ) : (
            <>Everyone in the rotation is off today, so leads go to the shared inbox.</>
          )}
        </p>
        <FlowStrip next={next} />
        <div className="text-sm text-slate-600 space-y-1 border-t border-slate-100 pt-3" data-testid="ring-through-status">
          {ringWords.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </section>

      {!canEdit && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Sign in with your own login to change the rotation.
        </p>
      )}

      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-2" data-testid="rotation-list">
        <div>
          <h2 className="font-semibold text-navy-900">The rotation</h2>
          <p className="text-sm text-slate-600">
            Each new lead goes to the next person down, then back to the top. Someone on a day off is passed over
            and keeps their place.
          </p>
        </div>
        {people.length === 0 ? (
          <p className="text-sm text-slate-500">Nobody yet. Add the first person below.</p>
        ) : (
          <ol className="divide-y divide-slate-100">
            {people.map((p, i) => (
              <PersonRow
                key={p.id}
                person={p}
                place={i + 1}
                count={people.length}
                today={today}
                daysOff={rotation.daysOff}
                isNext={next?.id === p.id}
                canEdit={canEdit}
                isAdmin={isAdmin}
              />
            ))}
          </ol>
        )}
        {isAdmin && (
          <div className="pt-3 border-t border-slate-100">
            {rotation.others.length === 0 ? (
              <p className="text-sm text-slate-500">
                Everyone with a login is in the rotation. Invite someone new on{' '}
                <Link href="/admin/users" className="text-sky-700 hover:underline">
                  Users
                </Link>
                .
              </p>
            ) : (
              <form action={addToRotationAction} className="flex flex-wrap items-end gap-2" data-testid="add-to-rotation">
                <label className="flex flex-col gap-0.5 text-xs text-slate-600">
                  Add someone from Users
                  <select name="userId" required className="border border-slate-300 rounded-lg px-2 py-2 text-sm bg-white">
                    {rotation.others.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </label>
                <button type="submit" className="bg-navy-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-800">
                  Add to the rotation
                </button>
                <span className="text-xs text-slate-500">
                  Not listed? Invite them on{' '}
                  <Link href="/admin/users" className="text-sky-700 hover:underline">
                    Users
                  </Link>{' '}
                  first.
                </span>
              </form>
            )}
          </div>
        )}
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-2" data-testid="rotation-recent">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-semibold text-navy-900">Latest leads handed out</h2>
          <Link href="/admin/leads" className="text-sm text-sky-700 hover:underline">
            All leads
          </Link>
        </div>
        {handOuts.length === 0 ? (
          <p className="text-sm text-slate-500">No lead has been handed out yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-1.5 pr-3">When</th>
                  <th className="py-1.5 pr-3">Lead</th>
                  <th className="py-1.5 pr-3">Came in by</th>
                  <th className="py-1.5">Went to</th>
                </tr>
              </thead>
              <tbody>
                {handOuts.map((h) => (
                  <tr key={h.leadId} className="border-t border-slate-100">
                    <td className="py-1.5 pr-3 text-slate-500 whitespace-nowrap">
                      {h.assignedAt.toLocaleString('en-US', {
                        timeZone: 'America/Chicago',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-1.5 pr-3">
                      <Link href={`/admin/leads/${h.leadId}`} className="text-sky-700 hover:underline">
                        {h.leadName}
                      </Link>
                    </td>
                    <td className="py-1.5 pr-3 text-slate-600">{SOURCE_WORDS[h.source] ?? h.source}</td>
                    <td className="py-1.5 font-medium text-navy-900">{h.ownerName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-xs text-slate-500">
        {ringing
          ? 'Phones ring people before the AI right now. '
          : 'The AI answers every call, so nobody’s phone rings. '}
        <Link href="/admin/on-call/ring-order" className="text-sky-700 hover:underline">
          Phone ring order
        </Link>
      </p>
    </div>
  );
}
