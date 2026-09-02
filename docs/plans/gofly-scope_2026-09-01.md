# GoFlyTexas — everything Jim asked for on the 8/29 and 8/31 calls, scoped to build

_Written 2026-09-01 from the two requirements docs in `docs/meetings/requirements/` (8/29, 8/31) plus the
open backlog carried from 8/27–8/31. Each package has a definition of done that can be pasted into a
ProjectPulse work item as its acceptance criteria._

## What was GoFlyTexas-related, in one table

| # | Ask | Call | Status today |
|---|---|---|---|
| 1 | Human answers when available, AI rides shotgun and files the lead, AI takes over on no-answer | 8/29 [41:48]–[43:32] | Built 8/29 (`4b307cc`), running in `ai_only`; humans-first untested |
| 2 | Receipts on every lead: spoke / voicemail / text / email, select all that apply | 8/29 [43:52]–[44:23] | Shipped 8/31 (`215993b`) |
| 3 | Put the real GoFly number on the system | 8/29 [45:19]–[45:49], 8/31 [38:07]–[40:56] | Open. Line is **Grasshopper** → Mark → voicemail |
| 4 | Bot quotes wrong prices: discovery flight "$150" and cheapest block-time rate (must be under $150) | 8/31 [34:17]–[35:02] | Discovery fixed 9/1 ($250 cap from Jim's 8/28 email + welcome letter); block-time reworded "below $150", exact figure still Jim's |
| 5 | Keep this agent; Jim recruits callers to "run it through the ringer" | 8/31 [37:26]–[38:06] | Agreed, not started |
| 6 | Better voice — "attitude… bank customer-service operator"; find the roofer's vendor | 8/31 [32:13]–[33:20], [36:34]–[37:04] | Open, P2 |
| 7 | Drop Grasshopper ($30/mo) and voicemail once the switchboard is live | 8/31 [39:32]–[40:23] | Follows #3 |
| 8 | Link in a test email opened a "nothing page" | 8/29 [44:35]–[44:49] | Unconfirmed; likely the recording link (raw R2 URL, InvalidArgument) |
| 9 | Chris audits every ask and shows open vs. closed in ProjectPulse, plain English | 8/31 [30:37]–[31:44] | Board has one GoFly item (Flight Circle) |

Carried from earlier, still open: hour-of-day ads report for dayparting (8/27), walk-in leads blocked by the
email requirement (8/31 email), apex domain forward (needs Jim on a Squarespace call), Flight Circle step 1
(8/30 plan), ad budget decision (43% impression share lost, Jim's call).

## Work packages

### WP-1 · Pricing fix (P0 — LIVE 9/1; block figure + rental-rate conflict pending Jim)

Covers #4. Real callers are hearing wrong numbers today.

Build:
1. Discovery flight is settled: "will not exceed $250" (Jim's welcome letter 8/27 + email 8/28). Still ask
   Jim for the exact cheapest block-time rate and block size, and whether the rental/CFI rates in his
   pricing.docx ($165/$185, CFI $75/$90) or the call ($180/$195 wet) are current.
2. Read the live `bot_documents` row "Rates, block time and discovery flight pricing" (Jim said on 8/30 he
   edited bot knowledge himself) and diff it against `docs/bot-knowledge/rates-and-block-time.md`.
3. Update the doc, replace the bot_document (upload through `/admin/bot-knowledge` so provenance stays),
   confirm `buildKnowledgeBlock()` picks it up (60 s in-process cache on the voice side).
4. Verify as a caller: chat widget and the AI line both quote the new numbers; add both questions to the
   voice accuracy script Chris mentioned so a regression shows up.

Done when: Jim calls, asks both questions, hears his numbers.
Needs from Jim: the exact cheapest block-time rate; which rental/CFI rates are current.

### WP-2 · Real number onto the switchboard (P1, ~1 day of work spread over a week)

Covers #1 (finish), #3, #7. This is the step that makes the phone work real for customers.

Build, in order:
1. **Stage B** (runbook §7): `VOICE_ROUTING_MODE=humans_first`, Chris's cell as the only ring target, four
   calls from another phone (press-1 talk / no answer / decline / 3-second bail). Verify `answered_by`,
   the Caller/Chris transcript, lead `contacted`, the "Answered by Chris" email and the recording proxy.
2. Fund Twilio to ~$50 with auto-recharge (balance ~$15; at $0 every call hits the fallback).
3. Add Mark's cell (and Jim's if he wants) to `VOICE_RING_TARGETS`; confirm `VOICE_BUSINESS_HOURS`.
4. **Grasshopper research** (Chris owns it): Grasshopper is VoIP, so "forward all" is a call-handling rule in
   its dashboard, not a carrier code. Two paths:
   - Forward-all from Grasshopper to +1 940-242-3072 — immediate, reversible, keeps paying $30.
   - Port (940) 905-3090 into Twilio — ends Grasshopper, needs an LOA and a recent bill, weeks not days.
   Recommend forward first, port once Stage C has run clean for a couple of weeks.
5. Decide the greeting: Grasshopper's "professional voice" or none (callers hear ringback and Mark picks
   up). Recommend none; a short `<Say>` before the dial is a five-line change if Jim wants one.
6. **Stage C**: Jim (or Chris with Jim's Grasshopper login) sets the forward, one call each way, check
   `ForwardedFrom` on the inbound payload.
7. After a clean week: port, cancel Grasshopper, confirm voicemail is off everywhere.

Done when: dialing the published number rings Mark with the whisper; his answered calls produce a
transcript, notes and a lead; unanswered or after-hours calls reach the AI; Jim's inbox gets one email per
call. Rollback at any step: `VOICE_ROUTING_MODE=passthrough`.
Needs from Jim: Mark's cell, ring-group decision, Grasshopper access or ten minutes on a call, greeting
decision.

### WP-3 · Tester week (P1, ~2 hours setup, then daily review)

Covers #5, and doubles as regression coverage for WP-1 and WP-4.

Build:
1. Hand Jim the number to give out. Use the Twilio number (+1 940-242-3072): in `ai_only` it reaches the AI
   by the same path real callers use. Keep the direct Vapi line (+1 940-291-7613) for Chris's own tests.
2. Point `LEAD_NOTIFY_EMAILS` at Chris for the week so Jim's inbox isn't flooded by test leads; restore after.
3. Review `/admin/calls` daily; log each call as an eval (input, expected, actual, pass/fail, one fix) with
   the agent-run-eval skill; fold fixes into `VOICE_PERSONA` and the KB.
4. Delete test leads at the end of the week (keep "Joe Best").

Done when: at least ten outside calls reviewed, every wrong or invented answer has a fix or a KB entry,
Jim has a one-page summary of what testers hit.
Needs from Jim: recruit the callers; tell them it's a test.

### WP-4 · Voice persona (P2, ~half a day)

Covers #6.

Build:
1. Jim supplies the roofer company name; identify the vendor (call the roofer's line, listen; most agencies
   badge the platform in the footer or the SMS follow-up).
2. Shortlist: ElevenLabs voices other than Sarah (Flash model stays for latency), Cartesia sonic. Pick two,
   PATCH the Vapi assistant, A/B with WP-3 testers.
3. Soften the persona: fewer clipped answers, one warm opener, keep the two-sentence cap.

Done when: WP-3 testers stop describing it as a call-center voice; Jim signs off on one voice.
Needs from Jim: the roofer's name; a listen to two candidates.

### WP-5 · Recording link bug (P1, ~1 hour)

Covers #8. The missed-call email's "Listen to the recording" opens a raw R2 URL that returns
InvalidArgument. Fix: route it through the existing admin recording proxy
(`app/admin/calls/recording/[sid]`) or presign correctly with an expiry longer than the email's useful
life. Confirm with Jim it was this link.

Done when: the link in a fresh missed-call email plays the recording from a phone, logged in or not per
the chosen design.

### WP-6 · Board and audit (P1, ~2 hours)

Covers #9. Put WP-1 to WP-5 on the ProjectPulse Workflow board with the "Done when" lines as acceptance
criteria, mark #1 and #2 delivered with their commits as proof (pp-workflow skill), then walk Jim through
the board on the next call: what he asked, what shipped, what's open.

## Suggested order

| When | Do | Why first |
|---|---|---|
| Now | WP-1, WP-5, WP-2 step 1–2 | Wrong prices and a dead link are customer-facing; Stage B is the only technical blocker on the phone |
| This week | WP-3, WP-2 steps 3–6, WP-6 | Testers need the price fix first; Grasshopper forward needs Stage B |
| Next | WP-4, WP-2 step 7, hour-of-day report, walk-in email relax | Polish and the earlier backlog |
| Later | Flight Circle step 1, apex domain, LLM-SEO | Parked by Jim or blocked on him |

## Everything needed from Jim, in one message

1. Discovery-flight price and the cheapest block-time rate (with block size).
2. Mark's cell number; whether Jim also rings.
3. Grasshopper access, or ten minutes on a call to set the forward.
4. Keep or drop the Grasshopper greeting.
5. Names of two or three people who will call the test line this week.
6. The roofer company whose AI receptionist he liked.
