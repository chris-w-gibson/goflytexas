# Flight Circle integration — API first, front-end agent fallback

_Status 2026-08-30: design. Blocked on Flight Circle's answer to
`docs/outbound/flight-circle-api-request.md`. Nothing here is built._

## What Jim asked for (8/27 call)

- Prospect picks a day/time → an agent asks a CFI from a rotation (email/text) → the CFI's
  click confirms → the booking lands in Flight Circle under an **agent color** ("look at all
  these magenta").
- Chief pilot + two named instructors are **never** auto-booked unless nothing else fits.
- Discovery flights have no prerequisites; real training needs insurance + signed contract
  first. If a slot fails, offer an hour later.
- Volume: tens of leads a week. The value is response time, not throughput.

## One interface, two adapters

Everything above the adapter is identical regardless of how we reach Flight Circle. The
adapter is chosen by env, so losing API access is a config change plus a worker, not a
rewrite.

```
lib/flightcircle/
  types.ts        Reservation, Slot, Instructor, Aircraft, Customer (our shapes, not theirs)
  client.ts       interface FlightCircleClient {
                    listInstructors(): Promise<Instructor[]>
                    listAircraft(): Promise<Aircraft[]>
                    listReservations(range): Promise<Reservation[]>
                    findOpenSlots(q: {durationMin, from, to, excludeInstructorIds}): Promise<Slot[]>
                    findCustomer(q: {email?, phone?}): Promise<Customer | null>
                    createReservation(input, opts: {idempotencyKey, label: 'AI'}): Promise<Reservation>
                    cancelReservation(id, reason): Promise<void>
                  }
  api/            OAuth2 adapter — direct HTTPS calls (FLIGHTCIRCLE_MODE=api)
  browser/        job-queue adapter — writes fc_jobs rows, a Playwright worker on the VM
                  executes them (FLIGHTCIRCLE_MODE=browser)
  calendar/       read-only adapter over the Google Calendar sync add-on (FLIGHTCIRCLE_MODE=
                  calendar) — availability only, no writes
  index.ts        pick adapter from FLIGHTCIRCLE_MODE; 'off' → every method throws
                  NotConfigured and the booking UI hides itself
```

Booking flow (adapter-agnostic):

```
lead picks slot on /book (or the phone agent captures a preferred time)
  → booking_requests row (status requested)
  → rotation picks a CFI (excludes protected ids, round-robin by last_assigned_at)
  → CFI gets email/SMS "Discovery flight Sat 10:00, Bob Tomato — Accept / Pass"
  → Accept → client.createReservation(…label 'AI') → status booked → lead + Jim notified
  → Pass / 30-min timeout → next CFI; nobody → status needs_human → Jim alert
```

Tables: `booking_requests`, `fc_instructors` (mirror + `protected` flag + `last_assigned_at`),
`fc_reservations` (mirror, for availability + reconciliation), `fc_jobs` (browser mode only).

## Path A — API (preferred)

- OAuth 2.0 authorization-code. One-time consent by Jim (or the dedicated agent user) at
  `/api/integrations/flightcircle/connect` → callback stores refresh token encrypted in
  `integration_tokens`. Access tokens refreshed on demand; codes are single-use/30 s, so the
  callback must exchange immediately.
- Reads: poll `listReservations` for the next 14 days every 10 min (cron) into
  `fc_reservations`; instructors/aircraft hourly. Availability is computed locally
  (aircraft × instructor × business hours − reservations), so slot search is instant and
  never hammers their API.
- Writes: `createReservation` with an idempotency key = booking_request id; on a 409/duplicate
  re-read and adopt. Label/color per their answer to Q4; if unsupported, prefix the title
  `[AI]` and put the lead id in the note.
- Failure modes: token revoked → mode auto-degrades to `calendar` for reads and
  `needs_human` for writes, alert Chris. Rate-limit → backoff, never retry a write blindly.

## Path B — front-end agent (fallback if no API / too expensive)

Run Flight Circle's web app with a browser under our control and treat screens as the API.
This is workable because volume is tiny and every write is confirmed by a human (the CFI)
before we touch the schedule.

**Where it runs.** A Playwright worker on the dev-vm (Chromium is deliberately not in the
Railway image). Systemd service `goflytexas-fc-agent`, polls `fc_jobs` every 30 s,
one job at a time, business hours only for writes. Same pattern as the EnviroLink sentinel
crons.

**Whose login.** A dedicated Flight Circle user "GoFly Agent" (scheduler/dispatcher role,
not admin) that Jim creates. Reasons: revocable without touching Jim's login, the schedule
shows who booked, and the agent color can be that user's color. Credentials in
`~/.config/goflytexas/flightcircle.env`; never in the repo or Railway. Persistent browser
profile so we log in once; on a login page mid-job, re-auth and retry once, then fail the job.
If Flight Circle enforces MFA on that user, the worker pauses and pages Chris (no code
guessing).

**How the worker sees pages.** One page-object per screen (`browser/pages/schedule.ts`,
`reservationForm.ts`, `people.ts`), selectors by role/label text — never by generated class
names. Every job records a before/after screenshot and the DOM text it relied on into
`fc_jobs.evidence` so a bad booking is diagnosable.

**Jobs.**

| kind | what it does | guardrails |
|---|---|---|
| `sync_instructors` | read People → instructors, active flag | read-only |
| `sync_schedule` | read schedule grid for 14 days → `fc_reservations` | read-only; runs every 15 min |
| `create_reservation` | open new reservation, fill aircraft/CFI/customer/time, set color AI, save | dry-run first (fill, screenshot, don't save) → compare to intent → save; refuse protected CFIs; refuse if the slot is no longer free on re-read; max 3 writes/hour |
| `cancel_reservation` | find by our note marker `[gft:<booking id>]`, cancel | only reservations we created |
| `find_customer` / `create_customer` | search by email/phone; create minimal record | never edit existing customers |

**Drift detection.** Nightly `smoke` job loads each page-object and asserts its landmarks
(headings, buttons). First failure flips `FLIGHTCIRCLE_MODE` to `calendar` (reads keep
working via Google Calendar sync) and alerts Chris; writes go `needs_human` — Jim gets the
same email he gets today, just with "book this yourself" instead of "already booked".

**Rules of the road.** ≤ 1 UI action / 2 s, single session, no scraping beyond our own
school's data, and we tell Flight Circle we're doing it (the API request already discloses
the use case). If their terms forbid automation of the UI, Path B is off the table and the
answer is Path C.

## Path C — Google Calendar sync (reads only, cheapest)

Flight Circle's Google Calendar Integration add-on mirrors the schedule to a Google
calendar. We read it (Google Calendar API, service account shared on that calendar, or the
Calendar connector) → `fc_reservations`. Gives availability for the phone/web agents with
zero automation risk. Writes still need A or B, or a human. Worth enabling **regardless** —
it is the safety net both other paths degrade to.

## Decision table

| Flight Circle says | We run |
|---|---|
| API yes, reasonable price | A, with C as the degrade path |
| API no / too expensive, UI automation not forbidden | B for writes + C for reads |
| API no, automation forbidden | C for reads; writes stay human (CFI email with a "book it" link) |

## Build order once the answer lands

1. `lib/flightcircle` interface + `off` adapter + booking_requests table + CFI rotation +
   CFI accept/pass email (works with zero Flight Circle access; Jim books by hand from the
   email). Ship this first — it's most of the user-visible value.
2. Path C reader (Jim enables the add-on; ~half a day).
3. Path A or B adapter per the decision table.
4. /book page + phone-agent "preferred time" → booking_requests.

## Open questions for Jim

- Create the "GoFly Agent" user now (needed for B, harmless for A).
- Enable Google Calendar Integration add-on and share the calendar with us.
- Confirm the three protected instructors by name.
- Discovery-flight duration to block (60 min + turnaround?) and which aircraft qualify.
