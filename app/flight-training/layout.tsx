import type { Metadata } from 'next';

// This route's page is a client component and cannot export metadata, so the
// title, description and canonical live here (audit 2026-09-04, C1/M1).
export const metadata: Metadata = {
  title: 'Flight School in Roanoke, TX (DFW) — Private Pilot to CFI',
  description:
    'One-on-one flight training 25 minutes from Fort Worth and Denton at Aero Valley Airport, Roanoke TX: private pilot, instrument, commercial and CFI. Start with a $250 discovery flight.',
  alternates: { canonical: '/flight-training' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
