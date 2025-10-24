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