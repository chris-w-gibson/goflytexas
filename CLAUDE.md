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
