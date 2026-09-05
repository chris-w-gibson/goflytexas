import type { Metadata } from 'next';

// This route's page is a client component and cannot export metadata, so the
// title, description and canonical live here (audit 2026-09-04, C1/M1).
export const metadata: Metadata = {
  title: 'Contact GoFlyTexas',
  description:
    'Call, email or message GoFlyTexas at Aero Valley Airport in Roanoke, TX to book a discovery flight or ask about training. Open daily 8am–5pm, flights by appointment.',
  alternates: { canonical: '/contact' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
