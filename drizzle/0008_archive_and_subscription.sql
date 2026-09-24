-- Jim 2026-09-24 (GFT Hub): archive contacts once they are settled, and keep
-- subscribed/unsubscribed separate from the pipeline status — "if you select
-- contacted you can no longer tell if they are subscribed or not". Hand-applied
-- like 0006/0007:
--   railway run -s Postgres -e production -- psql "$DATABASE_PUBLIC_URL" -f drizzle/0008_archive_and_subscription.sql
-- No BEGIN/COMMIT, no --single-transaction, every statement idempotent.

-- Archived = settled; hidden from the working list, still counted as
-- subscribed until they or we unsubscribe them.
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "archived_at" timestamp with time zone;

-- Subscription lives on the boolean only. Rows parked in status 'unsubscribed'
-- go back to the pipeline stage they were actually at (contacted if a person
-- ever reached them, else new); the boolean already says they are out of the
-- drip. The enum value stays defined (Postgres cannot drop it) but nothing
-- writes it any more.
UPDATE "leads" SET "unsubscribed" = true
 WHERE "status" = 'unsubscribed' AND "unsubscribed" = false;
UPDATE "leads"
   SET "status" = CASE WHEN "first_contacted_at" IS NOT NULL THEN 'contacted'::lead_status
                       ELSE 'new'::lead_status END,
       "updated_at" = now()
 WHERE "status" = 'unsubscribed';
