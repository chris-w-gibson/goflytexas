-- Phase 2: every call rings the team first via Twilio, the AI answers the rest
-- (plan 2026-08-29). Hand-applied like 0006:
--   railway run -s Postgres -e production -- psql "$DATABASE_PUBLIC_URL" -f drizzle/0007_twilio_switchboard.sql
-- calls.status is plain text (no enum change), but keep the 0006 rules anyway:
-- no BEGIN/COMMIT, no --single-transaction, every statement idempotent.

ALTER TABLE "calls" ADD COLUMN IF NOT EXISTS "answered_by"          text;        -- 'human' | 'ai' | 'none'; null = not known yet
ALTER TABLE "calls" ADD COLUMN IF NOT EXISTS "answered_by_name"     text;        -- ring-target label ('Jim'); only when human
ALTER TABLE "calls" ADD COLUMN IF NOT EXISTS "parent_call_id"       text;        -- Twilio CallSid of the parent leg, set on the Vapi child
ALTER TABLE "calls" ADD COLUMN IF NOT EXISTS "recording_sid"        text;        -- Twilio RecordingSid (media proxy key)
ALTER TABLE "calls" ADD COLUMN IF NOT EXISTS "dial_call_sid"        text;        -- child leg that accepted the call
ALTER TABLE "calls" ADD COLUMN IF NOT EXISTS "transcription_status" text;        -- pending | running | done | failed
ALTER TABLE "calls" ADD COLUMN IF NOT EXISTS "forwarded_to_ai_at"   timestamp with time zone;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'calls_answered_by_check') THEN
    ALTER TABLE "calls" ADD CONSTRAINT "calls_answered_by_check"
      CHECK ("answered_by" IS NULL OR "answered_by" IN ('human', 'ai', 'none'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "calls_parent_call_id_idx"
  ON "calls" ("parent_call_id") WHERE "parent_call_id" IS NOT NULL;
-- Whisper history lookup and parent<->child linking both search by caller, newest first.
CREATE INDEX IF NOT EXISTS "calls_from_number_created_idx"
  ON "calls" ("from_number", "created_at" DESC);

-- Backfill: every pre-Phase-2 row was AI-answered.
UPDATE "calls" SET "answered_by" = 'ai'
 WHERE "answered_by" IS NULL AND "platform" IN ('vapi', 'retell');
