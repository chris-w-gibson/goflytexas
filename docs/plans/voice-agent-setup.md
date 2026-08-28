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
3. Leave the number's voice configuration alone — Vapi takes it over on import.

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
