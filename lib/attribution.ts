/**
 * First-touch attribution shared by the client cookie writer
 * (components/AttributionCapture.tsx) and the leads API parser.
 *
 * Paid/campaign landings carry gclid or utm_* and are stored verbatim. Everything
 * else is classified from the referrer so an organic-search lead is distinguishable
 * from direct or referral traffic: source = google | bing | … | direct | <host>,
 * medium = organic | direct | referral. First touch wins — the cookie is never
 * overwritten once set.
 */

export const ATTR_COOKIE = 'gft_attr';
export const ATTR_MAX_AGE_SECONDS = 90 * 86400;

export const CAMPAIGN_PARAMS = ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

/** Keys the leads API will accept from the cookie; anything else is dropped. */
export const ALLOWED_ATTR_KEYS = new Set<string>([
  ...CAMPAIGN_PARAMS,
  'source',
  'medium',
  'referrer',
  'landing',
  'first_seen',
]);

const SEARCH_ENGINES: [RegExp, string][] = [
  [/(^|\.)google\./i, 'google'],
  [/(^|\.)bing\.com$/i, 'bing'],
  [/(^|\.)duckduckgo\.com$/i, 'duckduckgo'],
  [/(^|\.)yahoo\./i, 'yahoo'],
  [/(^|\.)search\.brave\.com$/i, 'brave'],
  [/(^|\.)ecosia\.org$/i, 'ecosia'],
];

export type FirstTouch = Record<string, string>;

const clip = (v: string, n = 200) => v.slice(0, n);

/**
 * Build the first-touch record for a landing, or null when nothing should be
 * stored (internal navigation from our own host).
 */
export function deriveFirstTouch(i: {
  search: string;
  referrer: string;
  pathname: string;
  host: string;
  now?: Date;
}): FirstTouch | null {
  const qs = new URLSearchParams(i.search);
  const attr: FirstTouch = {};
  for (const p of CAMPAIGN_PARAMS) {
    const v = qs.get(p);
    if (v) attr[p] = clip(v);
  }

  if (Object.keys(attr).length === 0) {
    let refHost = '';
    try {
      refHost = i.referrer ? new URL(i.referrer).hostname.toLowerCase() : '';
    } catch {
      refHost = '';
    }
    const own = i.host.toLowerCase().replace(/^www\./, '');
    if (refHost && refHost.replace(/^www\./, '') === own) return null; // internal navigation
    if (!refHost) {
      attr.source = 'direct';
      attr.medium = 'direct';
    } else {
      const engine = SEARCH_ENGINES.find(([re]) => re.test(refHost));
      if (engine) {
        attr.source = engine[1];
        attr.medium = 'organic';
      } else {
        attr.source = clip(refHost, 100);
        attr.medium = 'referral';
      }
      attr.referrer = clip(i.referrer);
    }
  }

  attr.landing = clip(i.pathname);
  attr.first_seen = (i.now ?? new Date()).toISOString();
  return attr;
}

/** Serialize for document.cookie. */
export function attributionCookie(attr: FirstTouch): string {
  return `${ATTR_COOKIE}=${encodeURIComponent(JSON.stringify(attr))}; max-age=${ATTR_MAX_AGE_SECONDS}; path=/; SameSite=Lax`;
}

/** Parse the raw cookie value server-side; drops unknown keys and non-strings. */
export function parseAttributionCookie(raw: string | undefined | null): FirstTouch | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  const out: FirstTouch = {};
  for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
    if (ALLOWED_ATTR_KEYS.has(k) && typeof v === 'string' && v.length > 0) out[k] = clip(v, 300);
  }
  return Object.keys(out).length ? out : null;
}

/** Human label for admin views: "Google Ads", "Google organic", "Direct", "Referral: x". */
export function attributionLabel(attr: FirstTouch | null | undefined): string {
  if (!attr) return 'Unknown';
  if (attr.gclid) return 'Google Ads';
  if (attr.utm_source) return `${attr.utm_source}${attr.utm_medium ? ` / ${attr.utm_medium}` : ''}`;
  if (attr.medium === 'organic') return `${attr.source ?? 'search'} organic`;
  if (attr.medium === 'direct') return 'Direct';
  if (attr.medium === 'referral') return `Referral: ${attr.source ?? ''}`.trim();
  return 'Unknown';
}
