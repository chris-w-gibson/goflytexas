# GoFlyTexas: Chatbot + Ads Tracking — Implementation Plan (2026-07-22)

Source requirements: `docs/meetings/requirements/call-jim_2026-07-21.md` (Jim call, 7/21 ~11 PM).
Written by the EnviroLink-side session; execute from the GoFlyTexas terminal.

## What already exists (build on it, don't recreate)

- **Stack**: Next.js 14 App Router + TypeScript + Tailwind, Drizzle ORM + `pg` (Railway Postgres), Resend, zod, react-hook-form. Deploys on **Railway** (railway.toml; ignore the stale "Vercel" line in CLAUDE.md — Chris rule: never Vercel).
- **Admin portal + auth**: `app/admin/` with jose-JWT login (`app/login`, `app/api/auth`, `lib/auth.ts`), users + password_reset_tokens tables, seeded admin.
- **Leads CRM**: `app/admin/leads` (list/detail/new) + `app/api/leads` + `lib/leads.ts` + `email_events` — this IS the "contact list" Jim asked to manage; the bot plugs into it, nothing new needed for storage.
- **Google Ads base tag**: gtag.js already in root layout (commit `ddb5cad`). Only conversion *events* remain.
- **Repo state warning**: working tree has uncommitted changes (`.env.example` deleted, `public/5550J-in-Cali.png` modified). Ask Chris before committing/discarding them.

## Phase 1 — Bot knowledge base (Jim's "upload documents for the bot")

1. Drizzle migration: `bot_documents` table — `id` uuid pk, `title` text, `filename` text, `mimeType` text, `content` text (extracted plain text), `isActive` boolean default true, `uploadedBy` fk→users, `createdAt`. Target scale is 25–50 docs; store extracted text in Postgres, no object storage needed.
2. `lib/botKnowledge.ts` — CRUD + text extraction. PDF via `pdf-parse` (Jim's workflow is print-email-to-PDF), plus .txt/.md passthrough. Cap ~50 KB extracted text per doc, reject bigger with a clear error.
3. Admin page `app/admin/bot-knowledge/` following the `admin/leads` patterns: upload (react-hook-form + zod), list with title/date/size, preview, active toggle, delete. Auth comes free from the existing middleware.

## Phase 2 — Chat API (`app/api/chat/route.ts`)

- `@anthropic-ai/sdk`, **streaming** (`client.messages.stream(...)` piped to the response) so replies feel instant.
- **Model — decision for Chris** (see Decisions below): default per current Anthropic guidance is `claude-opus-4-8`; `claude-haiku-4-5` is the cheap option (~$1/$5 per MTok) for a public tire-kicker FAQ surface. Put the model id in an env var (`CHAT_MODEL`) either way so it's a config change, not a deploy.
- **System prompt** (order matters for prompt caching — stable content first):
  1. Persona/guardrails block: GoFlyTexas front-desk assistant; friendly, not pushy; answer ONLY from the provided documents; if unsure or asked for anything not covered, say so and offer the contact form; never invent prices/policies; always encourage leaving name/email/phone so the team can follow up; disclose it's an AI assistant if asked.
  2. Knowledge block: all `isActive` bot_documents concatenated, **sorted by id** (deterministic ordering — a shuffled doc list silently kills the prompt cache).
  3. `cache_control: {type: "ephemeral"}` breakpoint on the last system block — repeat visitors' requests then hit the cache (~90% cheaper input). Doc edits invalidate it naturally.
- **Request shape**: client sends trimmed history (cap ~20 turns server-side), `max_tokens` ~1024.
- **Abuse guards** (public unauthenticated endpoint): per-IP rate limit (simple in-memory sliding window is fine at this traffic; note Next.js on Railway is single-instance), per-session message cap (~30), payload size limit, and zod-validate the body. `ANTHROPIC_API_KEY` set in Railway service variables — never NEXT_PUBLIC.
- **Lead capture v1**: keep it deterministic — the widget shows a small "Leave your info" form (name/email/phone) that POSTs to the existing `/api/leads`, and the system prompt tells the bot to point people at it. (v2 option: a `save_lead` tool with `strict: true` so the bot files the lead itself mid-chat.)

## Phase 3 — Chat widget (`components/ChatWidget.tsx`)

- Client component mounted in root layout. Floating bubble bottom-right → slide-up panel; mobile-first (full-width sheet on small screens).
- Streams tokens from `/api/chat` via ReadableStream reader.
- **Gentle nudge** (Jim: "a little nagging… not overly aggressive"): one small "Got a question? I can answer it" bubble after ~20s on page, once per session (sessionStorage), dismissible.
- Sky-blue theme per site palette; "AI assistant" label in the header.
- Embedded lead mini-form (Phase 2's v1 capture) reachable from a persistent "Talk to a human" link.
- v2 (do NOT build now): avatar persona image/animation — Jim floated it,半 joking; park it.

## Phase 4 — Google Ads conversion tracking

- Add gtag **conversion events** (base tag already live): contact-form submit (primary "lead" conversion), `tel:` link clicks, discovery-flight CTA clicks. Fire via a tiny `lib/gtag.ts` helper.
- The `AW-XXXXXXX/label` conversion IDs must be created in the Google Ads account first — **that happens from the EnviroLink-side terminal** (it has the `google-ads-goflytexas` MCP). Coordinate: this terminal stubs the helper reading IDs from env (`NEXT_PUBLIC_GADS_CONV_*`), main terminal creates the conversion actions and supplies the IDs.
- Ads-account cleanup (phone numbers in ad copy → call assets, limited-status fixes) is Google-Ads-side work, not repo work — also main terminal.

## Phase 5 — Gates + deploy

- `npm run lint` + `npm run typecheck` + `next build` locally; Drizzle migration via `npm run db:migrate` against Railway Postgres (confirm `DATABASE_URL` env first).
- Commit only on Chris's explicit go (Conventional Commits). Railway auto-deploys on push.
- Gate 7 (live browser validation incl. mobile viewport + a real chat round-trip + a lead landing in admin/leads) runs from the EnviroLink-side terminal, which has the relay Chrome MCP.

## Decisions Chris must make before/while building

1. **Chat model**: `claude-opus-4-8` (best answers, ~$5/$25 per MTok) vs `claude-haiku-4-5` (fast/cheap, fine for FAQ regurgitation). Env-var either way.
2. **Anthropic API key**: which console org/key to use for GoFly — needs creating + adding to Railway.
3. The dirty working tree files (`.env.example`, hero png) — keep or discard.

## Suggested build order

Phase 1 → 2 → 3 (each with lint/typecheck), demo to Chris, then Phase 4 stubs, then gates + ship. Estimated: the "about a week" Chris quoted Jim is comfortable; core loop (1–3) is 1–2 sessions.
