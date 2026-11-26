-- A cell on each user (Jim 2026-11-22: "a phone on the user"; 11/25: text the
-- person a lead is waiting, ring them through). Stored as +1XXXXXXXXXX.
-- Nothing reads it yet: texts and ringing come after it.
--
-- Hand-applied like 0006-0012, idempotent:
--   railway run -s Postgres -e production -- psql "$DATABASE_PUBLIC_URL" -f drizzle/0013_user_phone.sql

alter table users add column if not exists phone text;
