import type { Metadata } from 'next';

// This route's page is a client component and cannot export metadata, so the
// title, description and canonical live here (audit 2026-09-04, C1/M1).
export const metadata: Metadata = {
  title: 'Our Aircraft at Aero Valley Airport',
  description:
    'The GoFlyTexas training fleet at Aero Valley Airport (52F) in Roanoke, TX: well-maintained aircraft for lessons, rentals and discovery flights.',
  alternates: { canonical: '/aircraft' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
