'use client';

import { useEffect } from 'react';

/**
 * First-touch channel attribution. When a visitor lands with a gclid or any
 * utm_* parameter, store it in a 90-day cookie. The leads API reads the cookie
 * server-side, so every lead form on the site gets attribution for free.
 * First touch wins — an existing cookie is never overwritten.
 */
const PARAMS = ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

export default function AttributionCapture() {
  useEffect(() => {
    if (document.cookie.split('; ').some((c) => c.startsWith('gft_attr='))) return;
    const qs = new URLSearchParams(window.location.search);
    const attr: Record<string, string> = {};
    for (const p of PARAMS) {
      const v = qs.get(p);
      if (v) attr[p] = v.slice(0, 200);
    }
    if (Object.keys(attr).length === 0) return;
    attr.landing = window.location.pathname.slice(0, 200);
    attr.first_seen = new Date().toISOString();
    document.cookie = `gft_attr=${encodeURIComponent(JSON.stringify(attr))}; max-age=${90 * 86400}; path=/; SameSite=Lax`;
  }, []);
  return null;
}
