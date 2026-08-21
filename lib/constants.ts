/**
 * Site-wide constants.
 */

export const CONTACT = {
  phoneDisplay: '(940) 905-3090',
  phoneHref: 'tel:+19409053090',
  email: 'info@goflytexas.com',
  airport: 'Aero Valley Airport (52F)',
  street: '104 Boeing Way',
  city: 'Roanoke',
  state: 'TX',
  zip: '76262',
} as const;

/**
 * Discovery flight offer.
 *
 * `price` and `durationMinutes` are null until Jim confirms them. While null the
 * page shows a "call for current pricing" CTA and the offer schema omits the
 * price — set the real values here and the hero, FAQ and structured data all
 * pick them up together. Do not hard-code a price anywhere else.
 */
export const DISCOVERY_FLIGHT: {
  price: number | null;
  durationMinutes: number | null;
  aircraft: string;
} = {
  price: null,
  durationMinutes: null,
  aircraft: 'Cessna 172',
};

/** "$199", or null when pricing hasn't been confirmed yet. */
export function formattedDiscoveryPrice(): string | null {
  const { price } = DISCOVERY_FLIGHT;
  if (price === null) return null;
  return `$${price.toLocaleString('en-US')}`;
}

/** "about an hour" / "about 90 minutes", or null when the duration isn't set. */
export function formattedDiscoveryDuration(): string | null {
  const { durationMinutes } = DISCOVERY_FLIGHT;
  if (durationMinutes === null) return null;
  if (durationMinutes === 60) return 'about an hour';
  return `about ${durationMinutes} minutes`;
}
