import type { Metadata } from 'next';

// This route's page is a client component and cannot export metadata, so the
// title, description and canonical live here (audit 2026-09-04, C1/M1).
export const metadata: Metadata = {
  title: 'Flight Training Programs in Dallas–Fort Worth',
  description:
    'Private pilot, instrument, commercial and CFI training with one-on-one instruction at Aero Valley Airport, Roanoke, TX. Serving Dallas, Fort Worth and Denton.',
  alternates: { canonical: '/flight-training' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
