# GoFlyTexas Development Guidelines

## Project Purpose
Aviation school website focused on discovery flights and pilot training in Texas.

## Core Features
1. Hero section with clear call-to-action
2. Discovery flight information
3. Aircraft showcase gallery
4. Contact form with validation
5. Mobile-first responsive design

## Design Requirements
- Clean, professional aviation theme
- Sky blue (#0EA5E9) and white color scheme
- High-quality aircraft images
- Fast loading (Core Web Vitals optimized)
- Accessible (WCAG 2.1 AA compliant)

## SEO Priorities
- Primary keyword: "discovery flight Dallas"
- Secondary: "flight school Texas", "learn to fly Dallas"
- Local business schema markup required
- Fast page load speed (<3 seconds)
- Mobile-optimized (60%+ traffic is mobile)

## Technical Stack
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- React Hook Form for forms
- Vercel for hosting
- Sharp for image optimization

## Development Rules
1. Use semantic HTML for better SEO
2. Implement proper heading hierarchy (h1 → h2 → h3)
3. All images must have descriptive alt text
4. Components should be reusable and testable
5. Mobile-first approach (design for mobile, enhance for desktop)
6. Use Next.js Image component for all images
7. Implement proper meta tags on every page

## File Structure
```
app/
├── page.tsx                 # Homepage
├── discovery-flight/        # Discovery flight details
├── aircraft/               # Aircraft showcase
├── contact/                # Contact page
└── layout.tsx              # Root layout with SEO defaults

components/
├── Hero.tsx                # Hero section
├── AircraftCard.tsx        # Individual aircraft display
├── AircraftGrid.tsx        # Aircraft gallery
├── ContactForm.tsx         # Contact form with validation
├── Navigation.tsx          # Main navigation
└── Footer.tsx              # Footer with contact info

lib/
├── schema.ts               # SEO schema markup
└── constants.ts            # Site-wide constants
```

## Performance Targets
- Lighthouse Score: >90 on all metrics
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Cumulative Layout Shift: <0.1

## Content Guidelines
- Professional but approachable tone
- Focus on safety and expertise
- Highlight instructor experience
- Clear pricing information
- Strong calls-to-action

## Future Enhancements
- Online booking system
- Student portal
- Weather integration
- Blog for SEO content
- Google Reviews integration
## Recent changes

### 2026-09-05 — SEO, images, and lead-endpoint hardening (portfolio audit C1/C2/H1/H3/H4/H7)

- **Canonicals**: the root layout no longer sets one canonical for the whole site
  (it made Google treat every page as the homepage). `metadataBase` + a per-page
  `alternates.canonical` on every public route; client-component routes
  (`aircraft`, `our-team`, `flight-training`, `contact`, `login`) carry their
  metadata in a `layout.tsx` because a `'use client'` page cannot export it.
  `login`, `admin`, `ack`, `unsubscribe` are `noindex`.
- **Images**: `sharp` is a dependency so `/_next/image` actually optimizes;
  the 18 photos over ~1 MB in `public/` were downscaled in place to ≤2000 px
  (52 MB → 7 MB, same file names, so localStorage image-slot assignments still
  resolve). `ImageCarousel` uses `next/image`. The hero video renders only on
  ≥768 px screens without reduced-motion; phones get the optimized poster.
- **Leads endpoint**: per-IP window (5 / 10 min, `LEADS_RATE_LIMIT`,
  `LEADS_RATE_WINDOW_MS`), a `website` honeypot field on the contact form,
  and a 24-hour dedupe by email (`findRecentLeadByEmail`) so a double submit
  doesn't email Jim twice.
- **Unsubscribe**: GET shows a confirm button, a server action does the
  unsubscribe (mail scanners were unsubscribing leads by prefetching the
  link). `POST /api/unsubscribe?token=` is the RFC 8058 one-click target and
  lead-facing emails carry `List-Unsubscribe` headers.
- **Headers**: HSTS, nosniff, SAMEORIGIN, referrer policy, permissions policy
  from `next.config.mjs`. CI (`.github/workflows/ci.yml`) runs lint,
  typecheck and tests on push/PR.
- Still manual: request indexing of `/discovery-flight` in Search Console (the
  API cannot), the click-to-call conversion action in Google Ads (a write),
  and the Drizzle journal regeneration for migrations 0004–0007.

## Leads: subscription and archive are not statuses (2026-09-24)

Jim (GFT Hub, 9/24): archive contacts once settled; delete the fake leads the AI call bot
made in testing; a name search on the landing page; subscribed/unsubscribed as its own column
("if you select contacted you can no longer tell if they are subscribed").

- `leads.status` is the pipeline only: `new | contacted | converted`. The enum still defines
  `unsubscribed` (Postgres cannot drop a value) but nothing writes it; migration 0008 moved
  those rows back to `contacted` (first_contacted_at set) or `new`. Subscription is the
  `unsubscribed` boolean — `unsubscribeLead` / `setSubscription` touch only that.
- `leads.archived_at` = settled. `listLeads` defaults to `view: 'active'` (archived hidden),
  `?view=archived` shows them; counts and the response stats exclude archived; the drip and
  the call-dedupe skip archived. Archiving never changes subscription.
- `?q=` searches name / email / phone (ilike) from the dashboard box and the leads page;
  `lib/leadFilters.ts` owns the query-string contract (old `?status=unsubscribed` links map to
  `?subscribed=no`).
- `deleteLeadAction` needs the confirm checkbox; notes cascade, calls keep their row with
  `lead_id` nulled.
- Migration `drizzle/0008_archive_and_subscription.sql` is hand-applied like 0006/0007
  (`railway run -s Postgres -e production -- psql "$DATABASE_PUBLIC_URL" -f …`), idempotent.

## On call and Media (2026-11-21)

Jim (11/20): "an on call per day calendar or a batting list" for the phone, and "a repository
for media content… users drop their content in a general media tab".

### On call (`/admin/on-call`)

- `phone_staff` (name + cell), `on_call_rota` (weekday 0 = Sunday → position 1, 2) and
  `on_call_overrides` (one date with its own order). A date with an override uses only the
  override; every other day follows the usual week. Rules are pure in `lib/voice/onCall.ts`
  (`orderFor`, `ringPlan`), storage in `lib/onCallStore.ts`. The day is the Central day
  (`VOICE_TZ`), never the UTC date.
- **It changes nothing while `VOICE_ROUTING_MODE=ai_only`** (the live setting): the page says
  so. In `humans_first`, in business hours, a day WITH people is rung one after another
  (`sequenceDialTwiml`, `VOICE_SEQUENCE_RING_TIMEOUT`, default 15 s each, two people at most),
  then the AI. A day with nobody scheduled keeps the old behaviour: `VOICE_RING_TARGETS` all
  ring together, and with none of those the AI answers.
- The order is chosen once, when the call comes in, and stored on `calls.ring_plan`; the
  dial-result and gather routes read it from the row (`step` in the query), so a schedule edit
  or midnight in the middle of a call cannot ring or name the wrong person.
- Anyone signed in changes the schedule; only an admin adds, switches off or removes a phone
  (whose cell a business call rings). The break-glass key is read-only here. A number that is
  one of our own lines (`reservedNumbers`) is refused, or it would loop.
- The ordered ring has unit tests only. It has never taken a live call: the `humans_first`
  test calls (Stage B) were parked on 8/29 and are still owed before the mode is switched.

### Media (`/admin/media`)

- Files live in the Railway storage bucket `media` (S3 API, private, region `iad`); the table
  `media_items` is the index. The browser sends each file straight to the bucket with a signed
  link (`/admin/media/sign` → PUT → `/admin/media/items`), so a phone video never passes through
  this server. Viewing goes through `/admin/media/file/<id>`, which redirects to a one-hour
  signed link (`?thumb=1`, `?download=1`).
- Variables on the web service: `MEDIA_BUCKET`, `MEDIA_ENDPOINT`, `MEDIA_REGION` (`auto`),
  `MEDIA_ACCESS_KEY_ID`, `MEDIA_SECRET_ACCESS_KEY` (the bucket's own credentials; a copy for
  scripts sits in `~/.config/goflytexas/media.env`, mode 600). Without them the page says
  storage is not set up and takes no uploads.
- The bucket needs CORS for the site's origin or the browser PUT is refused before it starts:
  `npx tsx scripts/media-bucket-cors.ts https://www.goflytexas.com` (re-run if the address changes).
- A signed upload link signs the content type (`signableHeaders`); by default only the host is
  signed and the link takes anything. The size cannot be signed, so `/admin/media/items` reads
  the size back from the bucket and removes a file over the limit. It accepts a storage key only
  in the shape the sign route issues for that item (`isKeyFor`).
- Thumbnails are made in the browser (a 640 px JPEG; a frame for a video) and stored beside the
  file as `<id>.thumb.jpg`. A HEIC picked on a desktop gets no thumbnail and shows its file name.
- `cleared_to_post` ("OK to post") is off until someone ticks it. Anything that later drafts or
  publishes posts reads only rows with it on.
- Development: `MEDIA_LOCAL_DIR` stands in for the bucket through `/admin/media/local`, only
  when `NODE_ENV` is not production.
- Migrations `drizzle/0009_on_call.sql` and `drizzle/0010_media_library.sql` are hand-applied
  like 0006-0008 and must land before the deploy that reads the new tables.

## Jim's 11/22 call (requirements: `docs/meetings/requirements/call-jim_2026-11-22.md`)

- **The phone assistant never asks for or agrees to a callback time (GFT-1122-10).** Jim: a set
  time is a window the team will miss. `VOICE_PERSONA` says so in its own paragraph and the
  wrap-up turn confirms only the number (`lib/__tests__/voicePersona.test.ts`). A time the caller
  offers on their own is still kept: `preferredTime` in the extraction, printed on the lead as
  "Caller mentioned: …" (it used to read "Best time: …", which looked like an appointment).
- **`LEAD_NOTIFY_EMAILS` is unset on production since 11/23 (GFT-1122-11):** lead emails go to
  `ADMIN_EMAIL` (`info@goflytexas.com`) only. `railway variable delete` did not restart the
  service; a `railway redeploy --service goflytexas` was needed for the change to take effect.
