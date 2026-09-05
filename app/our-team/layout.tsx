import type { Metadata } from 'next';

// This route's page is a client component and cannot export metadata, so the
// title, description and canonical live here (audit 2026-09-04, C1/M1).
export const metadata: Metadata = {
  title: 'Our Instructors',
  description:
    'Meet the certified flight instructors behind GoFlyTexas one-on-one training at Aero Valley Airport in Roanoke, Texas.',
  alternates: { canonical: '/our-team' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
