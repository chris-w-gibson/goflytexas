import type { Metadata } from 'next';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Guides — Straight Answers About Learning to Fly in DFW',
  description: 'Plain-language guides from GoFlyTexas at Aero Valley Airport: what a private pilot license costs in Texas, how block time and wet vs dry rates work, and what to expect on a discovery flight.',
  alternates: { canonical: '/guides' },
};

const GUIDES = [
  {
    href: '/guides/private-pilot-license-cost-texas',
    title: 'What a private pilot license costs in Texas (2026)',
    blurb: 'A line-by-line estimate at our current rates, a worked example, and what makes the number go up or down.',
  },
  {
    href: '/guides/block-time-wet-vs-dry-rates',
    title: 'Block time and wet vs dry rates, explained',
    blurb: 'Why a low dry rate is not cheaper, how Hobbs time works, and how a block of hours lowers what you pay.',
  },
  {
    href: '/discovery-flight',
    title: 'Discovery flight: what happens on the day',
    blurb: 'Minute by minute, what to bring, how to get here, and what it costs.',
  },
];

export default function GuidesPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <section className="bg-navy-900 pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Guides</h1>
          <p className="text-xl text-navy-100">
            The questions people ask us on the phone, answered in writing with real numbers.
          </p>
        </div>
      </section>
      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {GUIDES.map((g) => (
            <Link key={g.href} href={g.href} className="block rounded-lg border border-navy-100 bg-navy-50 p-6 hover:border-sky-400 transition-colors">
              <h2 className="text-xl font-semibold text-navy-900 mb-2">{g.title}</h2>
              <p className="text-navy-600">{g.blurb}</p>
            </Link>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
