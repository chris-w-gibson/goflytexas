-- On-call schedule for the phone switchboard (Jim 2026-11-20: "an on call per
-- day calendar or a batting list").
--
-- Hand-applied like 0006-0008, idempotent:
--   railway run -s Postgres -e production -- psql "$DATABASE_PUBLIC_URL" -f drizzle/0009_on_call.sql
--
-- phone_staff        the people a call can ring (name + cell)
-- on_call_rota       the usual week: for each weekday, who is rung first, then second
-- on_call_overrides  one date that differs from the usual week (a swap, a day off)
-- calls.ring_plan    the order chosen when the call came in, so every later
--                    Twilio callback rings and names the same people

create table if not exists phone_staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists phone_staff_phone_key on phone_staff (phone);

create table if not exists on_call_rota (
  weekday integer not null check (weekday between 0 and 6),
  position integer not null check (position between 1 and 2),
  staff_id uuid not null references phone_staff (id) on delete cascade,
  primary key (weekday, position)
);

create table if not exists on_call_overrides (
  day date not null,
  position integer not null check (position between 1 and 2),
  staff_id uuid not null references phone_staff (id) on delete cascade,
  primary key (day, position)
);

alter table calls add column if not exists ring_plan jsonb;
