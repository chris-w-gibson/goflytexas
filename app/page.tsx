import type { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';

// The homepage body is a client component (image editing, fade-ins), so the
// metadata lives here in a thin server wrapper. The self-canonical keeps ad
// landing variants (/?gclid=…, /?utm_…) from being treated as separate pages.
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function Home() {
  return <HomeClient />;
}
