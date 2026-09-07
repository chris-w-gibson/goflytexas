import type { Metadata } from 'next';

// This route's page is a client component and cannot export metadata, so the
// title, description and canonical live here (audit 2026-09-04, C1/M1).
export const metadata: Metadata = {
  title: 'Cessna 172 Rentals and Training Fleet — Aero Valley (52F)',
  description:
    'Rent or train in the GoFlyTexas Cessna 172 fleet at Aero Valley Airport, Roanoke TX: glass-panel and round-gauge 172s, wet rates with fuel included, block time from $1,900. Checkouts for licensed pilots.',
  alternates: { canonical: '/aircraft' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
