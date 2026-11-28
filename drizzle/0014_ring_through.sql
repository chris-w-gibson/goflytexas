-- Ringing a person through from inside an AI call (Jim 2026-11-27): who was
-- rung, which step it is on, and how it ended, kept on the caller's Twilio row.
-- Null = the caller never asked for a person.
--
-- Hand-applied like 0006-0013, idempotent:
--   railway run -s Postgres -e production -- psql "$DATABASE_PUBLIC_URL" -f drizzle/0014_ring_through.sql

alter table calls add column if not exists ring_through jsonb;
