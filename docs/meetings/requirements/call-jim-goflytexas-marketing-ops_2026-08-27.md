# Requirements: Call with Jim — GoFlyTexas marketing, lead response & booking — 2026-08-27

**Date**: 2026-08-27 (evening call, recorded 6:19 PM CT)
**Attendees** (inferred from transcript): Jim Malone, Chris Gibson
**Source**: [transcript](../transcriptions/Call%20Jim%20At%20Christopher_260827_181950_2026-08-27.txt) · ~55 min · whisper-small
**Generated**: by Claude Code via meeting-requirements skill

Context: second Jim call of the day (the 1:10 PM one was the Envirolink SWPPP-documents walkthrough).
This one is the GoFlyTexas conversation Jim had been "putting off" [28:41]. **The recording starts
mid-sentence** — the opening topic (follow-up email cadence) was already underway. Chris walked Jim
through the Google Ads numbers, Jim explained what a lead is actually worth, Jim screen-shared
**Flight Circle** (the scheduling/management tool) and handed over a login so an agent can learn it,
and the two agreed that GoFlyTexas is the test bed for lead-response automation (auto-reply → voice
agent → auto-booking) that later rolls over to PServo.

## Headlines (TL;DR for skim)

- **Lead response time is the business problem.** Jim's partner answers calls/emails but a website
  lead sat in the shared inbox "for 14 hours" [10:09]; "prompt is the name of the game… if you don't
  call back within 10 minutes" they've talked to three competitors [09:48]; "two out of three I call
  have already done something" [50:00]. Minimum: **automated acknowledgement to every lead** [10:43].
- **AI voice agent answering the GoFly phone** — Jim was blown away by a roofer's AI receptionist
  ("Matt", third-party at $750/mo) [04:46]–[05:55]. Chris: build it ourselves on existing credits;
  GoFly is the sandbox, then "roll that over to PServo and offload those costs to your partner" [23:48].
- **Chatbot becomes a sales agent with real pricing.** Jim is fine sharing rates with the bot and
  spelled out the whole rate/block-time logic on the call [29:14]–[37:41]; Chris: "capture all that
  logic and create a little sales agent inside the chat box" [30:16].
- **Lead value is now known** (closes the open question from 8/12): discovery flight ≈ $150 wet incl.
  instructor and is a **loss leader** [22:40] [41:09]; a student who continues spends ~$15k for the
  license [22:53] and up to ~$75k lifetime [23:11]. $138/lead is "still a little steep" for a
  discovery flight alone but fine if it feeds enrolment [22:00]–[23:19].
- **Auto-booking discovery flights via Flight Circle** — Jim asked for front-end booking [24:07];
  the workable design is agent-driven CFI rotation with click-to-confirm, color-coded in Flight
  Circle. Explicitly **not** a priority — "a fun little brain activity" [27:50]–[28:30].
- **Chris takes over GoFly digital marketing as the driving force**; Jim/CFIs keep the in-person
  channel (high-school lunches, homeschool nights) [43:43]–[51:14].

## Features (new work)

### Immediate automated response to every inbound lead

- **What**: When a contact/discovery-flight form (or chat lead) lands, send an instant acknowledgement
  to the prospect (email + SMS if a phone is given) and a notification to Jim/partner — so nothing
  sits unanswered while the partner is "changing oil in a plane" [46:00].
- **Why** [stakeholder]: "this thing's been sitting on here for 14 hours… that lead is going to
  waste" [10:09]–[10:22]; "Yeah, at least have automated ones" [10:43]. Jim's whole thesis on speed:
  [09:48], [49:30]–[50:05].
- **Acceptance**: every new lead gets a reply within a minute, with next-step language (book a
  discovery flight / call-back promise); Jim can see response time per lead in `/admin`.
- **Priority**: **P0** — cheapest fix to the stated pain; both agreed on the call.
- **Open questions**: which inbox/phone does the partner actually use, so the notification reaches
  him (Chris has no access to the shared GoFly email/phone today [03:20]–[04:08]).

### Follow-up email cadence + copy

- **What**: Change the weekly follow-up drip to a **staggered** cadence (Chris floated 7 / 14 / 21
  days [00:00]) and write the copy with "social-science selling" verbiage that keeps people intrigued
  rather than a weekly nag.
- **Why** [team + stakeholder]: "if you just do every week, they're going to…" [00:16]; Jim: "if you
  want to really get in like social science selling… verbiage that plays around and gets people a
  little more intrigued" [00:21]. Jim already sent Chris the existing marketing emails to reuse
  [28:41]–[28:47].
- **Acceptance**: cron sends day-7 / 14 / 21 (or researched equivalent) touches, distinct copy each
  step, stops on booked/closed status.
- **Priority**: P1
- **Open questions**: exact cadence — Chris said he'd "look at social science stuff" [00:10];
  recording starts mid-discussion so any earlier decisions weren't captured.

### AI voice agent for the GoFly phone line

- **What**: An AI receptionist that answers inbound calls, handles turn-around questions
  knowledgeably, keeps to task, records/transcribes every call, and hands a summary to a human before
  the callback. Built in-house (open-source voice stack + existing Anthropic credits), not the $750/mo
  third party.
- **Why** [stakeholder]: Jim tested the roofer's agent repeatedly and couldn't trip it — "that's the
  best AI shit I ever talked to" [05:30]; owner's take: "how much would it cost me to have someone
  answer that phone and speak knowledgeably like this thing can" [08:30]; "it records everything…
  before I call you back I can review what you've already answered" [12:45]. Chris: "All of it's open
  source now… we can already use our cloud credits" [05:39]. Strategic: GoFly is the sandbox, PServo
  is the payoff [23:48].
- **Acceptance** (as discussed): answers within a ring; identifies as AI when asked and returns to
  task; captures name/interest/callback; transcript + summary in `/admin` alongside the lead; Jim
  estimates most callers won't know it's AI [11:30]–[12:10].
- **Priority**: P1 (strong energy from both; sequenced after the P0 auto-reply)
- **Open questions**: phone provider / number porting; who receives the summary; whether the agent
  may quote pricing (Jim said he's fine sharing rates with the bot [29:00]).

### Chatbot sales logic + pricing knowledge base

- **What**: Feed the website chatbot the real rate card and the block-time/credit logic so it can
  sell like Jim does. Rates captured on the call (Jim, [29:14]–[41:11]):
  - Glass-panel aircraft (3 planes): **$190/hr** (Jim first said "195 or 190" — verify) [29:14]
  - Round-gauge aircraft: **$180/hr** [29:30]
  - Block time: **$1,900 = 10 hrs + 1 free** (effective ~$172.73/hr) [36:41]; flying the $180 plane on
    block credits returns $10/hr as account credit (≈11.5 hrs) [37:00]–[37:20]; buying a 50-hr block
    on the cheapest plane gets to ~$152–155/hr [30:00]–[30:11]
  - **Wet rates** (fuel included) — competitors advertising "$120/hr" are dry, add ~$100/hr fuel
    [37:39]–[38:10]
  - Discovery flight: **1 hr, $150**, includes instructor [41:09]
  - CFIs flying for GoFly get a discount [41:00]; CFIs are charged more when renting for themselves
    [40:45] (Jim wasn't aware — verify)
  - Flight Circle has a "Rates & block time" doc and built-in training courses/checklists [36:21], [41:40]
  - Promo mechanics Jim likes: "**$30 credit** per hour flown at night — beat the heat" (credit toward
    future flights, not a discount) [42:18]–[42:50]
- **Why** [stakeholder]: "I don't really mind sharing with the bot what we charge" [29:05]; Chris:
  "capture all that logic and create a little sales agent inside the chat box… you're both you and a
  sales agent" [30:16]–[30:29].
- **Acceptance**: bot answers "how much" questions with the two-tier rate, explains block time and wet
  vs dry, steers to a discovery flight; answers grounded in an uploaded rate-card doc (KB upload
  pattern, per the 8/21 decision — no paste box).
- **Priority**: P1
- **Open questions**: $190 vs $195 for glass panel; Jim mentioned "$40/35/50" CFI rates from the old
  independent-CFI model [47:30] — not current, don't publish.

### Agent-assisted discovery-flight booking (Flight Circle)

- **What**: Let a prospect pick a day/time on the site; an agent requests a CFI from a rotation via
  email/text, the CFI's click confirms, and the booking is written to Flight Circle under an
  **AI-specific color** so Jim can see agent bookings at a glance ("look at all these magenta"
  [33:19]). The rotation is refreshed by reading Flight Circle's active-instructor list (turnover ≈
  one CFI a month [27:05]).
- **Why** [stakeholder]: "is there a booking service for people to go in and book… on the front end?"
  [24:07]; "we've got enough planes and not so much business that you pick a day, we can accommodate
  you… right down to you name the time" [27:30]. Chief pilot currently assigns CFIs by hand [24:45].
- **Constraints captured**: three specific instructors (the chief pilot + two others) must **not** be
  auto-booked unless nothing else fits [39:45]; discovery flights have no prerequisites, but real
  training requires insurance + signed contract first [25:10]–[25:50]; if a slot fails, call back and
  offer an hour later [40:15].
- **Priority**: **P2** — Chris: "I'm not saying overly prioritize it… a fun little brain activity"
  [28:15]; Jim: "I think there's a real possibility… kind of brainstorming it out" [28:25].
- **Open questions**: Flight Circle API vs browser automation; how Google Calendar sync interacts
  [32:40]; whether the agent books under Jim's account (Jim: "it's going to use my account, so it's
  going to say I did it" [34:40]).

### Ads reporting Jim can actually read

- **What**: A GoFly report (ProjectPulse Marketing tab or emailed) with clicks, leads, cost/lead,
  **conversion rate on clicks**, and **hour-of-day** breakdown of clicks vs leads — the Ads UI
  couldn't show Jim either ("where the fuck do you click to see clicks" [13:40]; "that's not going to
  tell me the hours" [16:30]).
- **Why** [stakeholder]: "what's the conversion on those [clicks]" [16:46]; Jim watches lead arrival
  times (4, 6, 8, 10 PM) vs ad clicks peaking ~1 PM with a second peak ~8–9 PM [00:34]–[00:55],
  [15:50]–[16:10].
- **Acceptance**: Jim doesn't have to open ads.google.com.
- **Priority**: P1 (partly exists — marketing_sync already writes daily rows to PP; add conversion
  rate + hour-of-day)

## Bugs / Fixes

### Conversion tracking — expectation mismatch, not a bug

- Jim thought the site tracking confirmed calls/emails; it records **clicks** on the phone/email
  links and form submissions, and Chris corroborates ad-click time vs lead time on the backend
  [01:43]–[04:20]. Jim: "I got a false understanding of what that was" [04:08]; settled that a
  click-to-call is treated as a likely call. No code change; feeds the voice-agent case (only way to
  truly confirm a call).

## UX / polish

- Ad **schedule/dayparting**: Jim pushed for ads to be strongest in the afternoon/evening when leads
  arrive; Chris noted ad clicks land midday — decide after the hour-of-day report [00:44]–[01:10].
- Chatbot should open on the ad landing path alongside the contact form (current behaviour Chris
  described [20:05]–[20:20]); keep.

## Decisions (no action required)

- **Ads cleanup validated by Jim**: cost/lead $378 → $180 → $138 since the 8/21 call [18:26]–[19:15];
  "let's save Jim some dollars" [12:55]. Jim agreed Google's auto-apply "is fighting us" [17:57].
- **Click ≠ lead**: click = landed on the site; lead = form submit / phone or email click [19:34]–[21:50].
- **Lead economics**: discovery flight is a loss leader; the win is the $15k student / $75k lifetime
  [22:40]–[23:19]. Jim's angle: "make a little money, plane values keep going up, and practice the
  SEO/chatbot/voice-bot stuff to roll over to PServo" [23:25]–[23:53].
- **Ownership split**: Jim does all GoFly marketing today; partner handles inbound calls/emails and
  word-of-mouth [43:43]–[44:20]. Chris becomes the driving force on digital and will task the CFIs on
  field marketing (Flower Mound, Lewisville, Northwest, Denton high schools; homeschool groups)
  [50:35]–[51:14]. Jim: "I like results" [51:20].
- **Flight Circle login shared** in Teams during the call for the agent to "go in there and start
  learning" [34:09], [41:35]. Store it in the secrets folder — **never in the repo or this doc**.
- Business pulse: 202 billable hours this month, likely ~225 cap [51:45]; aircraft can't fly above
  104°F, which cost cancellations this week [52:20]; homeschool open-house drew 60–70 parents vs
  10–12 expected [45:00]–[45:30]; only ~6 Google reviews — Jim plans a burger day for reviews
  [42:56]–[43:33].

## Out of scope (explicitly)

- Auto-booking is **not** to be over-prioritised — "just something when you get time and you want to
  play around with it" [28:15].
- Don't auto-book the chief pilot or the two other named instructors [39:45].
- Chris is **not** taking over the partner's phone/email duties — the goal is to speed up and
  instrument that path, and Jim wants to "spell it off" to PServo once proven [10:54]–[11:10].

## Open questions

1. ~~Glass-panel rate: $190 or $195? Jim said both in one breath [29:14].~~ **Resolved 2026-08-28 (Chris): $195/hr.**
2. Which email/phone should lead notifications and voice-agent summaries go to (partner vs Jim)?
3. Follow-up cadence — confirm 7/14/21 or let Chris's research set it; what was decided before the
   recording started?
4. Does Flight Circle expose an API, or is this browser-driven? Does Jim want a dedicated agent user
   instead of his own account?
5. Voice-agent telephony: keep the current GoFly number and forward, or provision a new line?
