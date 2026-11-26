-- Suggestions and bug reports from the team (Jim 2026-11-25, handwritten:
-- "Suggestion Tab / Bug"). One row per report; a picture, when there is one,
-- lives in the media bucket under suggestions/.
--
-- Hand-applied like 0006-0011, idempotent:
--   railway run -s Postgres -e production -- psql "$DATABASE_PUBLIC_URL" -f drizzle/0012_suggestions.sql

create table if not exists suggestions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('suggestion', 'bug')),
  body text not null,
  picture_key text,
  picture_type text,
  author_id uuid references users (id) on delete set null,
  author_name text not null,
  status text not null default 'open' check (status in ('open', 'done')),
  -- What was done about it, written by whoever closed it.
  reply text,
  closed_by_name text,
  closed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists suggestions_created_at_idx on suggestions (created_at desc);
