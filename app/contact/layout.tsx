import type { Metadata } from 'next';

// This route's page is a client component and cannot export metadata, so the
// title, description and canonical live here (audit 2026-09-04, C1/M1).
export const metadata: Metadata = {
  title: 'Contact Us — Book a $250 Discovery Flight in Roanoke, TX',
  description:
    'Call (940) 905-3090 or message GoFlyTexas to book a $250 discovery flight or ask about training. Aero Valley Airport, 104 Boeing Way, Roanoke TX. Open daily 8am–5pm, flights by appointment.',
  alternates: { canonical: '/contact' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
