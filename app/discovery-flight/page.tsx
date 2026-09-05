import { Metadata } from 'next';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import DiscoveryFlightForm from '@/components/DiscoveryFlightForm';
import {
  CONTACT,
  DISCOVERY_FLIGHT,
  formattedDiscoveryDuration,
  formattedDiscoveryPrice,
} from '@/lib/constants';
import {
  Plane,
  ClipboardCheck,
  BookOpen,
  MapPin,
  Phone,
  CheckCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Discovery Flight in Dallas–Fort Worth',
  description:
    'Take the controls of a real airplane on a discovery flight at Aero Valley Airport in Roanoke, TX. Fly with a certified instructor — no experience needed. Serving Dallas, Fort Worth and Denton.',
  keywords: [
    'discovery flight Dallas',
    'discovery flight Fort Worth',
    'intro flight DFW',
    'first flight lesson Dallas',
    'learn to fly Dallas',
  ],
  openGraph: {
    title: 'Discovery Flight in Dallas–Fort Worth | GoFlyTexas',
    description:
      'Take the controls of a real airplane with a certified instructor at Aero Valley Airport. No experience needed.',
  },
  alternates: {
    canonical: 'https://www.goflytexas.com/discovery-flight',
  },
};

const price = formattedDiscoveryPrice();
const duration = formattedDiscoveryDuration();

const faqs: { q: string; a: string }[] = [
  {
    q: 'How much does a discovery flight cost?',
    a: price
      ? `A discovery flight is ${price}, which covers the aircraft and your instructor for the whole session.`
      : `Give us a call at ${CONTACT.phoneDisplay} and we'll go over current pricing — it covers the aircraft and your instructor for the whole session.`,
  },
  {
    q: 'How long does it take?',
    a: duration
      ? `Plan on ${duration} from the time you arrive, including the briefing before and the debrief after your flight.`
      : 'Plan on being at the airport a little longer than the flight itself — there is a short briefing before you go up and a debrief when you land.',
  },
  {
    q: 'Do I need any experience?',
    a: 'None at all. Most people who take a discovery flight have never touched the controls of an airplane before.',
  },
  {
    q: 'Will I actually get to fly the airplane?',
    a: 'Yes. Once you are safely airborne your instructor will hand you the controls. They are right beside you with a full set of their own the entire time.',
  },
  {
    q: 'Does it count toward a pilot certificate?',
    a: 'It does. The flight is logged as dual instruction with your certified flight instructor, so the time counts toward the flight experience required for your certificate.',
  },
  {
    q: 'Where do you fly out of?',
    a: `${CONTACT.airport}, at ${CONTACT.street} in ${CONTACT.city}, ${CONTACT.state} — in the north part of the DFW metroplex, convenient to Dallas, Fort Worth and Denton.`,
  },
  {
    q: 'What should I bring?',
    a: 'Just a photo ID, sunglasses and comfortable clothes. We supply the airplane, the headset and the instructor.',
  },
];

const offerSchema: Record<string, unknown> = {
  '@type': 'Offer',
  availability: 'https://schema.org/InStock',
  ...(DISCOVERY_FLIGHT.price !== null
    ? { price: DISCOVERY_FLIGHT.price, priceCurrency: 'USD' }
    : {}),
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: 'Discovery Flight',
      serviceType: 'Introductory flight lesson',
      description:
        'An introductory flight with a certified flight instructor at Aero Valley Airport in Roanoke, Texas. No experience required — you take the controls.',
      url: 'https://www.goflytexas.com/discovery-flight',
      provider: {
        '@type': ['LocalBusiness', 'EducationalOrganization'],
        name: 'GoFlyTexas',
        telephone: '+1-940-905-3090',
        address: {
          '@type': 'PostalAddress',
          streetAddress: CONTACT.street,
          addressLocality: CONTACT.city,
          addressRegion: CONTACT.state,
          postalCode: CONTACT.zip,
          addressCountry: 'US',
        },
      },
      areaServed: [
        { '@type': 'City', name: 'Dallas' },
        { '@type': 'City', name: 'Fort Worth' },
        { '@type': 'City', name: 'Denton' },
        { '@type': 'City', name: 'Roanoke' },
      ],
      offers: offerSchema,
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

const steps = [
  {
    icon: ClipboardCheck,
    title: 'Preflight briefing',
    body: 'Your instructor walks you around the airplane, shows you what they check and why, and explains exactly what is about to happen. Ask anything.',
  },
  {
    icon: Plane,
    title: 'You fly',
    body: `You take off from ${CONTACT.airport} and, once you are clear of the pattern, your instructor hands you the controls. Turns, climbs, descents — you are flying the airplane.`,
  },
  {
    icon: BookOpen,
    title: 'Debrief and logbook',
    body: 'Back on the ground you talk through how it went, and the flight goes in a logbook as dual instruction — the first entry toward a pilot certificate if you decide to keep going.',
  },
];

export default function DiscoveryFlightPage() {
  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navigation />

      {/* Hero */}
      <section className="bg-navy-900 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Fly a real airplane on your first day
              </h1>
              <p className="text-xl text-navy-100 mb-6">
                A discovery flight is the easiest way to find out whether flying is for
                you. You will sit in the left seat of a {DISCOVERY_FLIGHT.aircraft} at{' '}
                {CONTACT.airport} in {CONTACT.city}, take off with a certified
                instructor beside you, and fly it yourself. No experience, no
                commitment.
              </p>

              <div className="flex flex-wrap items-baseline gap-3 mb-8">
                {price ? (
                  <>
                    <span className="text-4xl font-bold text-white">{price}</span>
                    <span className="text-navy-200">
                      all in — aircraft and instructor
                      {duration ? `, ${duration}` : ''}
                    </span>
                  </>
                ) : (
                  <span className="text-lg text-navy-100">
                    Call{' '}
                    <a
                      href={CONTACT.phoneHref}
                      className="text-sky-400 font-semibold hover:text-sky-300"
                    >
                      {CONTACT.phoneDisplay}
                    </a>{' '}
                    for current pricing and the next open slot.
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#book"
                  className="inline-flex items-center justify-center px-8 py-3 bg-sky-600 text-white font-semibold rounded-full hover:bg-sky-700 transition-colors"
                >
                  Book My Discovery Flight
                </a>
                <a
                  href={CONTACT.phoneHref}
                  className="inline-flex items-center justify-center px-8 py-3 bg-transparent text-white font-semibold rounded-full border-2 border-white hover:bg-white/10 transition-colors"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  {CONTACT.phoneDisplay}
                </a>
              </div>
            </div>

            <div id="book" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-white mb-4">
                Request your flight
              </h2>
              <DiscoveryFlightForm />
            </div>
          </div>
        </div>
      </section>

      {/* What happens */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
              What happens on the day
            </h2>
            <p className="text-lg text-navy-600">
              Three parts, and you are the one flying for the middle one.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div
                key={step.title}
                className="bg-navy-50 rounded-lg p-8 border border-navy-100"
              >
                <div className="w-12 h-12 bg-navy-900 rounded-full flex items-center justify-center mb-5">
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-navy-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-navy-600">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-16 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Who takes a discovery flight
              </h2>
              <ul className="space-y-4">
                {[
                  'People who have wondered about flying for years and never had a reason to start.',
                  'Anyone weighing flight training and wanting to try it before spending real money.',
                  'Someone shopping for a gift that is not another object.',
                  'Pilots-to-be comparing schools who want to meet an instructor first.',
                ].map((item) => (
                  <li key={item} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-sky-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-navy-100">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-navy-800 border border-navy-700 rounded-lg p-8">
              <div className="flex items-center mb-4">
                <MapPin className="h-6 w-6 text-sky-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Where we fly from</h3>
              </div>
              <p className="text-navy-100 mb-4">
                {CONTACT.airport}
                <br />
                {CONTACT.street}
                <br />
                {CONTACT.city}, {CONTACT.state} {CONTACT.zip}
              </p>
              <p className="text-navy-200 mb-6">
                We are in the north part of the DFW metroplex, easy to reach from
                Dallas, Fort Worth and Denton.
              </p>
              <Link
                href="/aircraft"
                className="inline-flex items-center text-sky-400 font-medium hover:text-sky-300"
              >
                See the airplanes you could fly →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-10 text-center">
            Common questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="border-b border-navy-100 pb-6 last:border-b-0"
              >
                <h3 className="text-lg font-semibold text-navy-900 mb-2">{faq.q}</h3>
                <p className="text-navy-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-16 bg-navy-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready when you are
          </h2>
          <p className="text-lg text-navy-200 mb-8">
            Leave your details and we will call you to pick a day, or skip ahead and
            call us now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#book"
              className="inline-flex items-center justify-center px-8 py-3 bg-sky-600 text-white font-semibold rounded-full hover:bg-sky-700 transition-colors"
            >
              Book My Discovery Flight
            </a>
            <a
              href={CONTACT.phoneHref}
              className="inline-flex items-center justify-center px-8 py-3 bg-transparent text-white font-semibold rounded-full border-2 border-white hover:bg-white/10 transition-colors"
            >
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
