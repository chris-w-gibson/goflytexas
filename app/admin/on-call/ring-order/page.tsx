import Link from 'next/link';
import { getSessionFromCookies } from '@/lib/auth';
import { loadSchedule } from '@/lib/onCallStore';
import {
  WEEKDAY_NAMES,
  WEEK_ORDER,
  addDays,
  dayLabel,
  hoursWords,
  localDay,
  orderFor,
  orderWords,
  upcoming,
  weekStart,
  type DayOrder,
  type StaffRow,
} from '@/lib/voice/onCall';
import { formatPhoneDisplay } from '@/lib/voice/phone';
import { routingMode, sequenceRingTimeoutSec, type RoutingMode } from '@/lib/voice/twilio';
import { AddPersonForm } from './AddPersonForm';
import {
  clearDayAction,
  removePersonAction,
  saveDayAction,
  saveWeekAction,
  setPersonActiveAction,
} from './actions';

export const dynamic = 'force-dynamic';

const SLOTS = [
  { key: 'first', label: 'Rings first' },
  { key: 'second', label: 'Then' },
] as const;

function modeWords(mode: RoutingMode, hours: string): { title: string; body: string; live: boolean } {
  if (mode === 'humans_first') {
    return {
      title: 'People first',
      body: `From ${hours} a call rings the person on call, then the next, then the AI. Outside those hours the AI answers.`,
      live: true,
    };
  }
  if (mode === 'passthrough') {
    return {
      title: 'Straight to the team',
      body: 'Calls ring the team directly. The AI and this schedule are switched off.',
      live: false,
    };
  }
  return {
    title: 'The AI answers every call',
    body: 'This schedule is saved and ready. Phones start ringing in this order when calls are switched to people first.',
    live: false,
  };
}

function PersonSelect({
  name,
  people,
  value,
  label,
}: {
  name: string;
  people: StaffRow[];
  value: string | undefined;
  label: string;
}) {
  return (
    <select
      name={name}
      defaultValue={value ?? ''}
      aria-label={label}
      className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white"
    >
      <option value="">Nobody</option>
      {people.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}

function FlowStrip({ people, ringSec }: { people: { name: string }[]; ringSec: number }) {
  const steps = [
    { label: 'Caller dials', sub: 'the GoFlyTexas number' },
    ...(people.length > 0
      ? people.map((p, i) => ({ label: p.name, sub: `${i === 0 ? 'rings first' : 'rings next'}, ${ringSec} seconds` }))
      : [{ label: 'On call', sub: 'nobody set for today' }]),
    { label: 'AI assistant', sub: 'answers, takes a message' },
    { label: 'Lead alert', sub: 'email with the details' },
  ];
  return (
    <ol className="flex flex-col sm:flex-row sm:flex-wrap sm:items-stretch gap-1 sm:gap-2 text-sm" data-testid="call-flow">
      {steps.map((s, i) => (
        <li key={`${s.label}-${i}`} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <div className="bg-white border border-slate-200 rounded-lg px-3 py-2">
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

function DayCell({
  d,
  today,
  people,
  canEdit,
}: {
  d: DayOrder;
  today: string;
  people: StaffRow[];
  canEdit: boolean;
}) {
  const past = d.day < today;
  const isToday = d.day === today;
  return (
    <div
      data-testid={`day-${d.day}`}
      className={`rounded-lg border p-2.5 min-h-[7.5rem] flex flex-col gap-1 ${
        isToday ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white'
      } ${past ? 'opacity-50' : ''}`}
    >
      <p className="text-xs font-medium text-slate-500 flex items-center justify-between gap-1">
        <span>
          <span className="md:hidden">{WEEKDAY_NAMES[d.weekday].slice(0, 3)} </span>
          {dayLabel(d.day, { weekday: false })}
          {isToday && <span className="text-sky-700"> · today</span>}
        </span>
        {d.changed && (
          <span className="text-[10px] uppercase tracking-wide bg-amber-100 text-amber-800 rounded px-1 py-0.5">
            Changed
          </span>
        )}
      </p>
      {d.people.length === 0 ? (
        <p className="text-sm text-slate-400">AI only</p>
      ) : (
        <ol className="text-sm text-navy-900">
          {d.people.map((p, i) => (
            <li key={p.id} className={i === 0 ? 'font-semibold' : 'text-slate-600'}>
              {i + 1}. {p.name}
            </li>
          ))}
        </ol>
      )}
      {canEdit && !past && (
        <details className="mt-auto text-xs">
          <summary className="cursor-pointer text-sky-700 hover:underline select-none">Change this day</summary>
          <form action={saveDayAction} className="mt-2 space-y-1.5">
            <input type="hidden" name="day" value={d.day} />
            {SLOTS.map((slot, i) => (
              <PersonSelect
                key={slot.key}
                name={slot.key}
                people={people}
                value={d.people[i]?.id}
                label={`${slot.label} on ${dayLabel(d.day)}`}
              />
            ))}
            <button type="submit" className="w-full bg-navy-900 text-white rounded-lg px-2 py-1.5 font-medium">
              Save this day
            </button>
          </form>
          {d.changed && (
            <form action={clearDayAction} className="mt-1.5">
              <input type="hidden" name="day" value={d.day} />
              <button type="submit" className="w-full border border-slate-300 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                Back to the usual week
              </button>
            </form>
          )}
        </details>
      )}
    </div>
  );
}

export default async function RingOrderPage() {
  const session = await getSessionFromCookies();
  const tz = process.env.VOICE_TZ ?? 'America/Chicago';
  const { day: today } = localDay(new Date(), tz);
  const monday = weekStart(today);
  const schedule = await loadSchedule(monday);
  const active = schedule.staff.filter((p) => p.active);
  const days = upcoming(monday, 14, schedule);
  const todayOrder = orderFor(today, schedule);
  const mode = modeWords(routingMode(), hoursWords(process.env.VOICE_BUSINESS_HOURS ?? '08:00-17:00'));
  const canEdit = Boolean(session);
  const isAdmin = session?.role === 'admin';
  const usual = (weekday: number, position: number) =>
    schedule.rota.find((r) => r.weekday === weekday && r.position === position)?.staffId;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/on-call" className="text-sky-700 hover:underline text-sm">
          ← On call
        </Link>
        <h1 className="text-2xl font-bold mt-2">Phone ring order</h1>
        <p className="text-sm text-slate-600 mt-1">
          Who a phone call rings each day, and in what order, before the AI picks up. Who gets each lead is set
          on the On call page, not here.
        </p>
      </div>

      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3" data-testid="on-call-status">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              mode.live ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Calls right now: {mode.title}
          </span>
          <span className="text-sm text-slate-600">
            Today, {dayLabel(today)}: <strong className="text-navy-900">{orderWords(todayOrder.people)}</strong>
          </span>
        </div>
        <p className="text-sm text-slate-600">{mode.body}</p>
        <FlowStrip people={todayOrder.people} ringSec={sequenceRingTimeoutSec()} />
      </section>

      {!canEdit && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Sign in with your own login to change the schedule.
        </p>
      )}

      <section className="space-y-2">
        <h2 className="font-semibold text-navy-900">This week and next</h2>
        <div className="hidden md:grid grid-cols-7 gap-2 text-xs font-medium text-slate-500">
          {WEEK_ORDER.map((w) => (
            <p key={w}>{WEEKDAY_NAMES[w]}</p>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2" data-testid="on-call-calendar">
          {days.map((d) => (
            <DayCell key={d.day} d={d} today={today} people={active} canEdit={canEdit} />
          ))}
        </div>
        <p className="text-xs text-slate-500">
          A changed day covers a swap or a day off. Every other day follows the usual week below.
        </p>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div>
          <h2 className="font-semibold text-navy-900">The usual week</h2>
          <p className="text-sm text-slate-600">
            The standing order for each day. Leave a day on Nobody and the AI answers that day.
          </p>
        </div>
        <form action={saveWeekAction} className="space-y-3" data-testid="usual-week">
          <div className="grid gap-2">
            <div className="hidden sm:grid grid-cols-[7rem_1fr_1fr] gap-3 text-xs font-medium text-slate-500">
              <span />
              {SLOTS.map((s) => (
                <span key={s.key}>{s.label}</span>
              ))}
            </div>
            {WEEK_ORDER.map((w) => (
              <div key={w} className="grid grid-cols-1 sm:grid-cols-[7rem_1fr_1fr] gap-1.5 sm:gap-3 sm:items-center">
                <span className="text-sm font-medium text-navy-900">{WEEKDAY_NAMES[w]}</span>
                {SLOTS.map((slot, i) => (
                  <PersonSelect
                    key={slot.key}
                    name={`${slot.key}_${w}`}
                    people={active}
                    value={usual(w, i + 1)}
                    label={`${slot.label} on ${WEEKDAY_NAMES[w]}`}
                  />
                ))}
              </div>
            ))}
          </div>
          {canEdit && (
            <button
              type="submit"
              className="bg-navy-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-800"
            >
              Save the usual week
            </button>
          )}
        </form>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3" data-testid="on-call-team">
        <div>
          <h2 className="font-semibold text-navy-900">Team phones</h2>
          <p className="text-sm text-slate-600">
            The people a call can ring, and the cell it rings. Admins manage this list.
          </p>
        </div>
        {schedule.staff.length === 0 ? (
          <p className="text-sm text-slate-500">Nobody yet. Add the first person below.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {schedule.staff.map((p) => (
              <li key={p.id} className="py-2 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[10rem]">
                  <p className="font-medium text-navy-900">{p.name}</p>
                  <p className="text-xs text-slate-500">{formatPhoneDisplay(p.phone) ?? p.phone}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    p.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {p.active ? 'Taking calls' : 'Off'}
                </span>
                {isAdmin && (
                  <>
                    <form action={setPersonActiveAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="active" value={String(!p.active)} />
                      <button
                        type="submit"
                        className="text-xs border border-slate-300 rounded-lg px-2 py-1 hover:bg-slate-50"
                      >
                        {p.active ? 'Switch off' : 'Switch on'}
                      </button>
                    </form>
                    <form action={removePersonAction} className="flex items-center gap-1.5">
                      <input type="hidden" name="id" value={p.id} />
                      <label className="text-xs text-slate-500 flex items-center gap-1">
                        <input type="checkbox" name="confirm" required /> sure
                      </label>
                      <button
                        type="submit"
                        className="text-xs border border-red-200 text-red-600 rounded-lg px-2 py-1 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </form>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        {isAdmin && <AddPersonForm />}
      </section>
    </div>
  );
}
