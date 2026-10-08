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
  /** Ride-along fee for one additional passenger (Jim's pricing doc, 8/27). */
  passengerPrice: number | null;
  aircraft: string;
} = {
  // Jim's rate card: the discovery flight "will not exceed $250" (bots have
  // quoted this since 8/29). Published 2026-09-05 with Chris's go-ahead.
  price: 250,
  durationMinutes: 60,
  passengerPrice: 75,
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

/**
 * The one list of "I'm interested in" options.
 *
 * Every form, the admin lead views and the owner-alert emails read this, so a
 * new option appears everywhere at once. It used to be copied into the contact
 * form, the admin new-lead form and a private map in lib/email.ts; they drifted,
 * and the contact form ended up with no Discovery Flight option at all even
 * though the email map had a label for it (Jim, 2026-10-07).
 *
 * `value` is what gets stored in leads.flight_interest — always the key, never
 * the label.
 */
export const FLIGHT_INTERESTS: ReadonlyArray<{ value: string; label: string }> = [
  // The discovery flight is the way most people start, so it leads the list.
  { value: 'discovery', label: 'Discovery Flight' },
  { value: 'private', label: 'Private Pilot License' },
  { value: 'instrument', label: 'Instrument Rating' },
  { value: 'commercial', label: 'Commercial License' },
  { value: 'rental', label: 'Aircraft Rental' },
  { value: 'tour', label: 'Aerial Tour' },
  { value: 'ferry', label: 'Ferry Flight' },
  { value: 'insurance', label: 'Insurance Checkout' },
  { value: 'biennial', label: 'Biannual Review (BFR)' },
  { value: 'other', label: 'Other' },
];

const FLIGHT_INTEREST_LABEL: Record<string, string> = Object.fromEntries(
  FLIGHT_INTERESTS.map((i) => [i.value, i.label]),
);

/**
 * Human label for a stored interest. Unknown values pass through unchanged —
 * leads filed before this list existed stored the label itself
 * (e.g. "Discovery Flight"), and those should still read correctly.
 */
export function flightInterestLabel(key: string | null | undefined): string {
  if (!key) return 'Not specified';
  return FLIGHT_INTEREST_LABEL[key] ?? key;
}
