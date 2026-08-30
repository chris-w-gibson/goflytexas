# AI phone agent — platform setup runbook

Code side lives in the repo (`app/api/voice/*`, `lib/voice/*`, `lib/voicePersona.ts`,
`app/admin/calls`). This file is the **outside-the-repo** configuration so it is reproducible.
Plan: `~/.claude/plans/i-d-like-to-plan-iridescent-bachman.md` (2026-08-28).

## Design in one paragraph

Humans keep first ring on (940) 905-3090. Jim's carrier conditionally forwards no-answer / busy /
after-hours calls to an **unpublished Twilio number** imported into **Vapi**. Vapi runs the call
(STT/TTS/turn-taking/recording) and asks our Next.js route for every reply
(`POST /api/voice/llm/chat/completions`, OpenAI-compatible SSE, Claude + spoken persona + the
`bot_documents` rate card). When the call ends Vapi posts an `end-of-call-report` to
`POST /api/voice/webhook`; we classify (hang-up / spam / real), extract name-phone-interest-time with
Claude, create a `leads` row (`source = phone`), and send the same owner alert web leads get
(tap-to-call + "I've reached out" ack). Transcripts: `/admin/calls`.

## 0. What exists (configured 2026-08-28 via API — ids in `~/.config/goflytexas/voice.env`, mode 600)

| Thing | Value |
|---|---|
| Vapi org | `cginsa12@gmail.com's Org`, Google sign-in, PAYG (5 free credits to start) |
| Vapi assistant | **GoFly missed-call assistant** `fbf16989-54b9-4d29-ba57-ba18b1a90c19` — custom-LLM `https://www.goflytexas.com/api/voice/llm` (Bearer header), Deepgram `nova-3` STT w/ keyterm boost, Deepgram Aura `asteria` voice, `endCallPhrases` = goodbye sentence, 300 s max, background sound off, recording on, server URL `/api/voice/webhook` with `x-vapi-secret` header, `serverMessages: [end-of-call-report]` |
| **Forwarding target** | **+1 (940) 242-3072** (Justin, TX) — Twilio-owned, SID `PN18bb67eb537d15c63f0cf790f5997de9`, imported into Vapi as `e3e2448e-ec30-47e3-9cea-2f56a7f46ccc`, attached to the assistant, `smsEnabled=false`. Never published; this is what Jim forwards to. |
| Backup number | **+1 (940) 291-7613** — Vapi-provisioned (free), id `70951724-9c0d-4ab9-8f9f-386af6bc690b`, same assistant. Keep for testing or release later. |
| Twilio | Existing upgraded account "My first Twilio account" (`AC9b44…`, SMS MFA → phone …4908, ~$16 balance). Pre-existing numbers 817-670-4011 and 855-592-9472 were left untouched. |
| Railway env | `VOICE_LLM_SECRET`, `VOICE_WEBHOOK_SECRET` (64-hex, generated), `VOICE_MAX_TURNS=16`, `VOICE_DAILY_CALL_LIMIT=60`, `VOICE_NOTIFY_NO_MESSAGE=0` — set 2026-08-28 |

Gotchas hit: Vapi's custom-LLM request body is only `model, temperature, max_tokens, stream, messages` —
**no call id or caller number**. Fix that works (verified 8/29): put template variables in
`model.headers` — `x-call-id: {{call.id}}`, `x-customer-number: {{customer.number}}` — Vapi renders
them per call; the route reads those headers (and ignores un-rendered `{{…}}`).
Vapi's API sits behind Cloudflare and rejects Python `urllib` (error 1010) — use `curl`.
Deepgram voice ids must be the Aura-1 names (`asteria`, `luna`, …); the spec's Aura-2 names (`thalia`) are rejected.
`silenceTimeoutSeconds` is not on the current CreateAssistantDTO; Vapi's default silence handling applies.

## 1. Railway (web service) — env vars

| Var | Value |
|---|---|
| `VOICE_LLM_SECRET` | `openssl rand -hex 32` — paste the same value into the Vapi custom-LLM credential |
| `VOICE_WEBHOOK_SECRET` | `openssl rand -hex 32` — paste into the Vapi assistant's server-URL secret |
| `VOICE_MODEL` | (optional) leave unset → `CHAT_MODEL` → `claude-haiku-4-5` |
| `VOICE_MAX_TURNS` | 16 |
| `VOICE_DAILY_CALL_LIMIT` | 60 |
| `VOICE_NOTIFY_NO_MESSAGE` | 0 |

`ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_EMAIL`, `LEAD_NOTIFY_EMAILS`,
`NEXT_PUBLIC_SITE_URL` already exist. Nothing new is `NEXT_PUBLIC_`.

Migration (hand-applied, idempotent — see the header of the file):
`railway run -s Postgres -e production -- psql "$DATABASE_PUBLIC_URL" -f drizzle/0006_voice_calls.sql`

## 2. Twilio (~20 min)

1. Account upgraded off trial (trial numbers only accept calls from verified numbers). Billing →
   set a **$10 low-balance alert**.
2. Phone Numbers → Buy a Number → US, area code **940** (fallback 817 / 682), capability **Voice**.
   ~$1.15/mo. Voice only → no A2P/10DLC registration needed.
3. ~~Leave the number's voice configuration alone — Vapi takes it over on import.~~ **Phase 2 inverts
   this:** the number's Voice URL points at OUR switchboard (`POST /api/voice/twilio/inbound`), the
   Fallback URL at a static TwiML Bin, the status callback at `/api/voice/twilio/status`, and the
   Vapi import of this number is deleted. The AI is reached by dialing `VOICE_AI_NUMBER` (+1 940-291-7613). See §7.

## 3. Vapi

1. Phone Numbers → **Import from Twilio** → Twilio Account SID + Auth Token + the number.
2. Assistants → create **"GoFly missed-call assistant"**:
   - **Model**: Custom LLM → URL `https://www.goflytexas.com/api/voice/llm`
     (Vapi appends `/chat/completions`), credential = `VOICE_LLM_SECRET` (sent as Bearer / `x-vapi-secret`).
     Temperature irrelevant (we ignore it). Max tokens irrelevant (server caps at 300).
   - **First message**: exactly `VOICE_GREETING` from `lib/voicePersona.ts`.
   - **End call phrases**: `Thanks for calling GoFlyTexas. Goodbye.` (must match `VOICE_GOODBYE` exactly).
   - **Server URL**: `https://www.goflytexas.com/api/voice/webhook`, secret = `VOICE_WEBHOOK_SECRET`.
     Server messages: **end-of-call-report** only.
   - **Voice**: a warm US-English voice (pick one; keep it consistent).
   - **Transcriber**: default; add keyword boosts: GoFlyTexas, Aero Valley, Roanoke, discovery flight,
     Cessna, block time, glass panel, round gauge, CFI, Hobbs.
   - **Max duration**: 300 s. **Silence timeout**: 20 s. **Recording**: on.
3. Attach the assistant to the imported number (inbound).
4. Test from the dashboard "Talk to assistant" (web call), then dial the Twilio number from a cell.

## 4. Jim — conditional forwarding (one setting, reversible)

Ask Jim what line (940) 905-3090 is: wireless (which carrier), landline, or a VoIP app.

| Line | Turn on (no-answer + busy → Twilio number) | Turn off |
|---|---|---|
| Verizon Wireless | `*71` + 10-digit Twilio number, Send | `*73` |
| AT&T / T-Mobile (GSM codes) | `**61*1<twilio>*11*20#` (no answer, 20 s) then `**67*1<twilio>#` (busy) | `##61#`, `##67#` (or `##004#`) |
| AT&T landline / POTS | `*92` + number (no answer), `*90` + number (busy) | `*93`, `*91` |
| VoIP (RingCentral, Grasshopper, Google Voice…) | Call handling → "if unanswered after 20 s → forward to external number" | same screen |

Direct-dial behaviour is unchanged. Rollback is always on Jim's side, independent of any deploy.

## 5. Verification (Gate 7 per the plan)

1. Dial the Twilio number: greeting discloses AI + "sorry we missed you"; ask a rate question,
   give a name, say "use this number", ask for a Tuesday-afternoon callback, say goodbye → the
   agent ends the call itself.
2. Owner inbox: "Missed call · AI answered" email — summary, call length, tap-to-call, no mailto,
   transcript + recording links; tap "I've reached out" → `/ack` stamps the response time.
3. `/admin/calls`: the row expands to the transcript; "Open lead →" shows a `phone` lead with
   Response "waiting …" (or the ack time); `/admin/leads` shows `no email`.
4. Hang up immediately on a second call → `no_message`, no lead, no email.
5. Railway logs: `voice llm usage … cache_read_input_tokens` > 0 on the second turn.

## 6. Rollout

Week 0 — direct-dial tests from 3 phones/carriers. Week 1 — Jim enables forwarding; review every
transcript daily and tune `VOICE_PERSONA`. Rollback: Jim's carrier code, or point the Vapi assistant
at a fixed "please call back during business hours" first message.

## 7. Phase 2 — the switchboard (every call rings the team first)

Plan: `~/.claude/plans/i-d-like-to-plan-iridescent-bachman.md` (2026-08-29). Jim **forwards ALL calls**
from (940) 905-3090 to +1 940-242-3072. Twilio rings the team's cells with a whisper + press-1, records
answered calls dual-channel, Deepgram transcribes with roles, and the same post-call brain files notes
+ lead (stamped as a human touch) + the "Answered by Jim" email. Nobody presses 1 / after hours → the
call is dialed to the AI line (`VOICE_AI_NUMBER`) and the Phase 1 assistant takes it.

**Row states** (`calls.status`, `platform='twilio'`): `ringing → answered → processed|no_message|spam|failed`
for human calls; `ringing → forwarded_to_ai` (never a lead/email — the linked Vapi row is) when the AI takes
it; `passthrough` in kill-switch mode. `answered_by` = human | ai | none; `transcription_status` =
pending | running | done | failed (hourly `voice-sweep` cron re-queues stuck rows).

**Env** (Railway, read per request): `VOICE_ROUTING_MODE` (`ai_only` = Phase 1 behaviour; `humans_first`;
`passthrough` = plain forward, no AI/recording — the server-side rollback), `VOICE_RING_TARGETS`
(`+1…:Jim,+1…:Ann`; never the forwarded line), `VOICE_PUBLISHED_NUMBER`, `VOICE_TWILIO_NUMBER`,
`VOICE_AI_NUMBER`, `VOICE_AI_SIP_URI` (optional), `VOICE_RING_TIMEOUT` (20), `VOICE_WHISPER_TIMEOUT` (4),
`VOICE_BUSINESS_HOURS` (08:00-17:00), `VOICE_TZ`, `VOICE_WHISPER_VOICE`, `VOICE_PUBLIC_BASE_URL`
(exact host Twilio is configured with — signature check), `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`,
`DEEPGRAM_API_KEY`, `DEEPGRAM_MODEL`.

**Twilio number config** (API, one-time): `VoiceUrl=https://www.goflytexas.com/api/voice/twilio/inbound`
(POST), `VoiceFallbackUrl=<TwiML Bin: <Dial timeout=20> the first ring target, then <Dial> VOICE_AI_NUMBER>`,
`StatusCallback=https://www.goflytexas.com/api/voice/twilio/status` (POST). Then delete the Vapi import of
+1 940-242-3072 (Vapi phone-number id `e3e2448e…`) so Vapi never rewrites the webhook. Fund Twilio to ~$50
with auto-recharge — at $0 every call hits the fallback.

**Migration:** `railway run -s Postgres -e production -- psql "$DATABASE_PUBLIC_URL" -f drizzle/0007_twilio_switchboard.sql` (idempotent).

**Jim — forward ALL calls** (one code, instant, reversible): Verizon `*72` + Twilio number / off `*73`;
AT&T / T-Mobile (GSM) `**21*1<twilio>#` / off `##21#`; landline `*72`/`*73`; VoIP app → "forward all calls".
Direct-dial to the team's cells is unaffected. Caller ID on their handsets shows the real caller.

**Gate 7 stages:** A `ai_only` + number repointed (call → AI as before; `forwarded_to_ai` parent + linked Vapi
row; one email; break the route → fallback Bin still rings). B `humans_first` with Chris's cell as the only
target (ringback → whisper → press 1 → talk → `processed`, Caller/Chris transcript, lead `contacted`, "answered
by Chris" email, recording proxy; decline → AI after ~20 s; after-hours → AI). C add Jim's cell, Jim dials the
forward-all code, one call each way; check `ForwardedFrom` in the inbound payload.

**Recording disclosure:** none (owner decision; Texas one-party). Out-of-state two-party callers carry some
exposure; the AI leg already discloses.
