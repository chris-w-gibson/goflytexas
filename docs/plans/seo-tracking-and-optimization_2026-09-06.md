# GoFlyTexas — SEO: how we track it and how we move it

_Written 2026-09-06 from live Search Console data (property verified 8/21, so ~18 days of data), the
repo, and the site. Numbers are the 28-day window ending 9/6._

## Where we are

| Metric (28d) | Value |
|---|---|
| Clicks / impressions | 70 / 1,965 |
| CTR / avg. position | 3.6% / 7.9 |
| Homepage share | 66 of 70 clicks, 1,728 impressions |
| Brand queries ("goflytexas", "go fly texas", "gofly texas") | 11 clicks |
| Best non-brand query | "flight schools near me" — 27 impressions, 3 clicks, position 3.1 |
| /discovery-flight (primary target) | 18 impressions, 0 clicks; "discovery flight" pos 68, "discovery flight fort worth" pos 30, "discovery flight dallas" pos 26 |
| Pages with impressions but ~0 clicks | /flight-training 128 impr (pos 7.4), /cfi-academy 116 (pos 8), /contact 139, /aircraft 101 (pos 4.1), /private-pilot 76 (pos 17) |
| Visible words per page | 223 (contact) to 645 (home); program pages ~360–410 |

Reading: organic today is brand traffic to the homepage. The primary keyword does not rank. Program
pages are shown but not clicked (title/description problem). Content is thin for competitive local terms.

**Technical footing (good):** robots.txt, sitemap with lastmod, per-page canonicals (9/4 + 9/6),
LocalBusiness schema (address, geo, hours, offers) in the root layout, FAQPage + Service schema on the
discovery page, www canonical host, Next/Image optimization fixed 9/4.

**Gaps:** no analytics beyond the Ads tag (no GA4); the lead attribution cookie stores only gclid/utm, so an
organic lead is indistinguishable from direct; the nightly marketing_sync has Ads only, no Search Console
leg; no Google Business Profile link in `sameAs` (only Facebook/Instagram); no `llms.txt`; PageSpeed
Insights quota is exhausted on the shared GCP project so Core Web Vitals are unmeasured; address appears
as both 104 and 106 Boeing Way across our materials.

## Track (build once, runs nightly)

### T1 · Search Console leg in marketing_sync → ProjectPulse (half a day)
Add a GSC pull to `~/projects/LifeLedger/scripts/agents/marketing_sync.py` using the same ADC token
(webmasters scope already granted): daily rows (clicks, impressions, CTR, position) into
`marketing_metrics` with `source='gsc'`, plus a weekly snapshot of top queries and pages. The Marketing
tab then shows organic beside paid with the same 30-vs-prior-30 deltas Jim already reads.
Done when: Jim sees organic clicks/impressions/position on the Marketing tab without opening Search Console.

### T2 · Organic attribution on leads (an hour)
Extend `components/AttributionCapture.tsx`: when there is no gclid/utm, store first-touch
`{source: organic|direct|referral, referrer host, landing path}` in the same 90-day cookie. Leads then
carry the channel, and the admin Response tiles can split paid vs organic.
Done when: a lead that arrived from a Google organic result shows `organic` in `leads.attribution`.

### T3 · Keyword watchlist (part of T1)
Fixed list tracked weekly from GSC (position, impressions): discovery flight dallas / fort worth / denton /
roanoke; flight school near me; flight school roanoke tx; flight school fort worth; learn to fly dallas;
cessna 172 rental dfw; private pilot training fort worth; cfi academy texas; bfr fort worth. Flag moves of
±5 positions in the weekly digest.

### T4 · Core Web Vitals (monthly)
Get a free PageSpeed Insights API key on the goflytexas-mcp project (the current call uses another
project's exhausted quota) or run Lighthouse from relay Chrome; store mobile LCP/CLS/INP per page in
`marketing_metrics`. Done when: a month-over-month vitals row exists for the home and discovery pages.

### T5 · Weekly digest (automated)
A plain-English paragraph on Jim's ProjectPulse board every Monday: organic clicks vs last week, best
new query, watchlist movers, index coverage issues (from the GSC MCP `compare_search_periods` and
`check_indexing_issues`).

## Optimize (in order of return per hour)

### O1 · Titles and descriptions on the pages Google already shows (1–2 hours, this week)
Five pages get impressions and no clicks. Rewrite titles as location + outcome + price cue, e.g.
"Flight School in Roanoke, TX (DFW) — Discovery Flights from $250 | GoFlyTexas"; descriptions that
answer the query in one line. Measure CTR per page two weeks later via T1.

### O2 · Make /discovery-flight the local landing page (half a day, this week)
H1 "Discovery Flight in Dallas–Fort Worth (Aero Valley, Roanoke TX)"; 900–1,200 words: what happens
minute by minute, the $250 all-in price and what it includes, who it's for, what to bring, the FAQ
(already schema'd), instructor and aircraft photos with descriptive alt text; a "we're 25 minutes from"
block naming Fort Worth, Denton, Flower Mound, Southlake, Keller, Lewisville (Jim's field-marketing
towns); links to it from every page's CTA and the footer. City-specific pages only if T3 shows demand.

### O3 · Google Business Profile (Jim + CFIs own reviews; we own the listing)
"Near me" is the top non-brand intent and it is decided by the map pack, not the website. Claim/verify the
GBP at Aero Valley 52F, fix the address to one canonical NAP (104 vs 106 Boeing Way), add hours, photos,
the $250 discovery flight as a product, weekly posts; put the GBP URL in `sameAs`. Reviews: Jim's
"burger day" plan — target 25+ reviews; reply to every one.

### O4 · Citations and links (2 hours, then ongoing)
Consistent NAP on: AOPA flight-school finder, FAA/flightschoollist-type directories, Aero Valley airport
site, Roanoke and Denton chambers, Bing Places, Apple Maps, Yelp. Ask partners (aircraft clubs, high
schools' aviation programs) for a link to the discovery page.

### O5 · Content program = the "LLM-SEO" ask from 7/21 (2 posts/month)
Answer real buyer questions with pages that double as chatbot knowledge: "What a private pilot license
costs in Texas (2026)", "Discovery flight: what to expect", "Block time explained", "Wet vs dry rental
rates", "BFR checklist". Each: FAQ schema, internal links, a lead form. Keep the rates doc as the single
source so the bot and the pages never disagree. Add `llms.txt` and a `/facts` page (name, address, phone,
prices, fleet, hours) so AI answer engines cite us correctly.

### O6 · Index hygiene (monthly, 15 minutes)
Re-inspect the two stale "duplicate" verdicts (~9/13), then monthly `check_indexing_issues` over the
sitemap; keep every public page self-canonical; keep `/login`, `/admin`, `/ack`, `/unsubscribe` out.

### O7 · Speed (after T4 gives a baseline)
Hero video and images are the likely LCP cost on mobile; poster image + lazy video, preconnect to fonts.

## 90-day targets

- Non-brand organic clicks: from ~20/month to 100+/month.
- /discovery-flight in the top 10 for "discovery flight fort worth" and "discovery flight dallas".
- Organic leads visible in attribution: 5+/month.
- Map pack: appearing for "flight school near me" from Roanoke/Denton/Fort Worth searches.

## Sequence

| When | Do |
|---|---|
| This week | T2, O1, O2 (code + copy), T1 (sync leg) |
| Next 2 weeks | O3 with Jim, O4, T4 key, T5 digest |
| Ongoing | O5 two posts a month, O6 monthly |
