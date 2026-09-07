'use client';

import { useEffect } from 'react';
import { ATTR_COOKIE, attributionCookie, deriveFirstTouch } from '@/lib/attribution';

/**
 * First-touch channel attribution. Paid/campaign landings (gclid, utm_*) are
 * stored verbatim; every other first visit is classified from the referrer as
 * organic search, direct, or referral. Stored in a 90-day cookie that the leads
 * API reads server-side, so every lead form on the site gets attribution for
 * free. First touch wins — an existing cookie is never overwritten.
 */
export default function AttributionCapture() {
  useEffect(() => {
    if (document.cookie.split('; ').some((c) => c.startsWith(`${ATTR_COOKIE}=`))) return;
    const attr = deriveFirstTouch({
      search: window.location.search,
      referrer: document.referrer,
      pathname: window.location.pathname,
      host: window.location.host,
    });
    if (!attr) return;
    document.cookie = attributionCookie(attr);
  }, []);
  return null;
}
