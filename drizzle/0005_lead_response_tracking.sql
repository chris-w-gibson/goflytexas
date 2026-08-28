-- Lead response-time tracking + one-click acknowledge (Jim call 2026-08-27).
-- Applied by hand via psql like 0004 (idempotent).
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "first_contacted_at" timestamp with time zone;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "contact_token" uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS "leads_contact_token_idx" ON "leads" ("contact_token");
