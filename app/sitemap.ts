import type { MetadataRoute } from 'next';

const BASE = 'https://www.goflytexas.com';

// Evaluated at build time: every deploy bumps lastmod, which is what nudges
// Google to recrawl pages it last saw before the per-page canonicals landed.
const LAST_MODIFIED = new Date();

// Public pages only — admin, api, and unsubscribe stay out.
const ROUTES: { path: string; priority: number }[] = [
  { path: '/', priority: 1.0 },
  { path: '/discovery-flight', priority: 0.9 },
  { path: '/flight-training', priority: 0.9 },
  { path: '/private-pilot', priority: 0.8 },
  { path: '/instrument', priority: 0.7 },
  { path: '/commercial', priority: 0.7 },
  { path: '/cfi-academy', priority: 0.7 },
  { path: '/flight-review', priority: 0.7 },
  { path: '/aircraft', priority: 0.8 },
  { path: '/our-team', priority: 0.6 },
  { path: '/contact', priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: 'weekly',
    priority: r.priority,
  }));
}
