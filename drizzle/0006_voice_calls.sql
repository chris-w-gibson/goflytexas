-- AI phone agent for missed calls (plan 2026-08-28). Applied by hand like 0004/0005:
--   railway run -s Postgres -e production -- psql "$DATABASE_PUBLIC_URL" -f drizzle/0006_voice_calls.sql
-- ALTER TYPE ... ADD VALUE cannot run inside a transaction block. psql -f is
-- autocommit per statement, so do NOT wrap this file in BEGIN/COMMIT and do NOT
-- use --single-transaction. Every statement is idempotent.

ALTER TYPE "lead_source" ADD VALUE IF NOT EXISTS 'phone';

-- Phone-only callers have no email. Every reader is null-guarded in code.
ALTER TABLE "leads" ALTER COLUMN "email" DROP NOT NULL;

CREATE TABLE IF NOT EXISTS "calls" (
  "id"               uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "platform"         text NOT NULL,                       -- 'vapi' (| 'retell' later)
  "platform_call_id" text NOT NULL,                       -- idempotency key for webhook retries
  "lead_id"          uuid REFERENCES "leads"("id") ON DELETE SET NULL,
  "from_number"      text,                                -- caller id, E.164
  "to_number"        text,                                -- our Twilio number, E.164
  "forwarded_from"   text,                                -- when the platform reports it
  "started_at"       timestamp with time zone,
  "ended_at"         timestamp with time zone,
  "duration_sec"     integer,
  "status"           text NOT NULL DEFAULT 'received',    -- received | processed | no_message | spam | failed
  "ended_reason"     text,
  "recording_url"    text,
  "transcript"       jsonb,                               -- [{role:'user'|'assistant', text, at?}]
  "summary"          text,
  "extracted"        jsonb,                               -- CallExtraction
  "raw_payload"      jsonb,                               -- last webhook body, for debugging / reprocess
  "created_at"       timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"       timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "calls_platform_call_id_idx" ON "calls" ("platform_call_id");
CREATE INDEX IF NOT EXISTS "calls_lead_id_idx"    ON "calls" ("lead_id");
CREATE INDEX IF NOT EXISTS "calls_created_at_idx" ON "calls" ("created_at" DESC);
-- Dedupe-by-phone lookup for repeat callers.
CREATE INDEX IF NOT EXISTS "leads_phone_created_idx" ON "leads" ("phone", "created_at" DESC);
