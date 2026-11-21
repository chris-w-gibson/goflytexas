-- Media library (Jim 2026-11-20: "a repository for media content… users drop
-- their content in a general media tab"). The files live in the storage
-- bucket; this table is the index the Media tab lists.
--
-- Hand-applied like 0006-0009, idempotent:
--   railway run -s Postgres -e production -- psql "$DATABASE_PUBLIC_URL" -f drizzle/0010_media_library.sql

create table if not exists media_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('photo', 'video')),
  storage_key text not null unique,
  thumb_key text,
  filename text not null,
  mime_type text not null,
  size_bytes bigint not null,
  width integer,
  height integer,
  duration_sec integer,
  note text,
  -- Everyone shown agreed to be posted publicly. Off until someone says so;
  -- anything that drafts or publishes posts reads only rows with it on.
  cleared_to_post boolean not null default false,
  uploaded_by uuid references users (id) on delete set null,
  uploaded_by_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists media_items_created_at_idx on media_items (created_at desc);
