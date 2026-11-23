-- Lead rotation (Jim 2026-11-22: "a batter's list… whoever we select is in
-- that group. And if we want to take them out for particular days… we can.
-- It doesn't reset each day. It just goes down the list in order and then
-- goes back to the top").
--
-- Hand-applied like 0006-0010, idempotent, and it must land BEFORE the deploy
-- that reads the new columns:
--   railway run -s Postgres -e production -- psql "$DATABASE_PUBLIC_URL" -f drizzle/0011_lead_rotation.sql
--
-- users.in_rotation / rotation_order   who gets leads, and in what order
-- rotation_days_off                    inclusive Central days a person is passed over
-- rotation_state                       one row: who got the last lead (the place the list carries on from)
-- leads.owner_id / assigned_at         who the lead went to, and when

alter table users add column if not exists in_rotation boolean not null default false;
alter table users add column if not exists rotation_order integer;

create table if not exists rotation_days_off (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  start_day date not null,
  end_day date not null,
  note text,
  created_at timestamptz not null default now(),
  check (end_day >= start_day)
);
create index if not exists rotation_days_off_user_idx on rotation_days_off (user_id, end_day);

create table if not exists rotation_state (
  id integer primary key default 1 check (id = 1),
  last_user_id uuid references users (id) on delete set null,
  last_position integer,
  updated_at timestamptz not null default now()
);
insert into rotation_state (id) values (1) on conflict (id) do nothing;

alter table leads add column if not exists owner_id uuid references users (id) on delete set null;
alter table leads add column if not exists assigned_at timestamptz;
create index if not exists leads_owner_idx on leads (owner_id);
