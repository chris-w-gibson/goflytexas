import type { ReactNode } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { CONTACT, formattedDiscoveryPrice } from '@/lib/constants';
import { Phone } from 'lucide-react';

/**
 * Chrome for the long-form guides under /guides: hero, prose column, FAQ block
 * and the same discovery-flight CTA every page ends on. Pages pass JSON-LD
 * themselves so each guide controls its own Article/FAQPage schema.
 */
export function GuideLayout({
  eyebrow,
  title,
  intro,
  updated,
  jsonLd,
  children,
  faqs,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  jsonLd: unknown;
  children: ReactNode;
  faqs?: { q: string; a: string }[];
}) {
  const price = formattedDiscoveryPrice();
  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navigation />
      <section className="bg-navy-900 pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sky-400 font-semibold uppercase tracking-wide text-sm mb-3">{eyebrow}</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5">{title}</h1>
          <p className="text-xl text-navy-100">{intro}</p>
          <p className="text-sm text-navy-300 mt-4">Updated {updated} · GoFlyTexas, {CONTACT.airport}, {CONTACT.city}, {CONTACT.state}</p>
        </div>
      </section>
      <article className="py-14 bg-white">
        <div className="guide-prose max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </article>
      {faqs && faqs.length > 0 && (
        <section className="py-14 bg-navy-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-navy-900 mb-8">Common questions</h2>
            <div className="space-y-6">
              {faqs.map((f) => (
                <div key={f.q} className="border-b border-navy-100 pb-6 last:border-b-0">
                  <h3 className="text-lg font-semibold text-navy-900 mb-2">{f.q}</h3>
                  <p className="text-navy-600">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="py-16 bg-navy-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">See for yourself</h2>
          <p className="text-lg text-navy-200 mb-8">
            The fastest way to know whether flying is for you is an hour in the left seat with an instructor
            {price ? ` — ${price} all-in` : ''}.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/discovery-flight" className="inline-flex items-center justify-center px-8 py-3 bg-sky-600 text-white font-semibold rounded-full hover:bg-sky-700 transition-colors">
              Book a discovery flight
            </Link>
            <a href={CONTACT.phoneHref} className="inline-flex items-center justify-center px-8 py-3 bg-transparent text-white font-semibold rounded-full border-2 border-white hover:bg-white/10 transition-colors">
              <Phone className="mr-2 h-4 w-4" />
              {CONTACT.phoneDisplay}
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

export function guideJsonLd(i: { url: string; headline: string; description: string; datePublished: string; dateModified: string; faqs?: { q: string; a: string }[] }) {
  const graph: unknown[] = [
    {
      '@type': 'Article',
      headline: i.headline,
      description: i.description,
      url: i.url,
      datePublished: i.datePublished,
      dateModified: i.dateModified,
      author: { '@type': 'Organization', name: 'GoFlyTexas', url: 'https://www.goflytexas.com' },
      publisher: { '@type': 'Organization', name: 'GoFlyTexas', url: 'https://www.goflytexas.com' },
      mainEntityOfPage: i.url,
    },
  ];
  if (i.faqs?.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: i.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
