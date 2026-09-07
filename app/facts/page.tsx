import type { Metadata } from 'next';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { CONTACT, DISCOVERY_FLIGHT, formattedDiscoveryPrice } from '@/lib/constants';
import { RATES, usd } from '@/lib/rates';

export const metadata: Metadata = {
  title: 'GoFlyTexas at a Glance — Facts, Rates, Hours, Location',
  description: 'The plain facts about GoFlyTexas: where we are (Aero Valley Airport, Roanoke TX), hours, phone, aircraft, current hourly and block rates, discovery flight price, and the training we offer.',
  alternates: { canonical: '/facts' },
};

const price = formattedDiscoveryPrice();

const rows: [string, string][] = [
  ['Business', 'GoFlyTexas — flight school, aircraft rental and discovery flights'],
  ['Airport', CONTACT.airport],
  ['Address', `${CONTACT.street}, ${CONTACT.city}, ${CONTACT.state} ${CONTACT.zip}`],
  ['Area served', 'Dallas–Fort Worth: Fort Worth, Denton, Southlake, Keller, Flower Mound, Lewisville, Frisco, Plano, Dallas'],
  ['Phone', CONTACT.phoneDisplay],
  ['Email', CONTACT.email],
  ['Hours', 'Office 8am–5pm daily; flights by appointment, seven days a week'],
  ['Website', 'https://www.goflytexas.com'],
  ['Aircraft', `Cessna 172 fleet — glass-panel and traditional round-gauge instrument panels`],
  ['Discovery flight', price ? `${price} all-in (aircraft, instructor, briefings), about ${DISCOVERY_FLIGHT.durationMinutes} minutes of flight time; extra passenger ${DISCOVERY_FLIGHT.passengerPrice ? usd(DISCOVERY_FLIGHT.passengerPrice) : 'ask'}` : 'call for current pricing'],
  ['Aircraft rental (wet, fuel included)', `${usd(RATES.roundGaugeHourly)}/hr round gauge · ${usd(RATES.glassPanelHourly)}/hr glass panel`],
  ['Instructor', `${usd(RATES.cfiHourly)}/hr (two-hour minimum) · ${usd(RATES.cfiAdvancedHourly)}/hr instrument and commercial`],
  ['Block time', `${usd(RATES.blockPrice)} = ${RATES.blockHours} hours (10 + 1 bonus); ${usd(RATES.roundGaugeBlockCredit)}/hr credit on round-gauge aircraft; larger blocks below ${usd(150)}/hr`],
  ['Private pilot certificate', `typically about ${usd(RATES.privatePilotTypical)} all-in; FAA minimum ${RATES.faaMinimumHours} hours, most finish in ${RATES.typicalHoursLow}–${RATES.typicalHoursHigh}`],
  ['Training offered', 'Discovery flights, private pilot, instrument rating, commercial pilot, CFI/CFII academy, flight reviews (BFR) and instrument proficiency checks, rental checkouts'],
  ['Scheduling', 'Existing customers book aircraft and instructors in Flight Circle'],
  ['Rates current as of', RATES.asOf],
];

export default function FactsPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <section className="bg-navy-900 pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">GoFlyTexas at a glance</h1>
          <p className="text-xl text-navy-100">One page of plain facts — location, hours, aircraft and current prices — kept in step with our rate sheet.</p>
        </div>
      </section>
      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <dl className="divide-y divide-navy-100 border border-navy-100 rounded-lg overflow-hidden">
            {rows.map(([k, v]) => (
              <div key={k} className="grid sm:grid-cols-3 gap-2 px-5 py-3 odd:bg-navy-50">
                <dt className="font-semibold text-navy-900">{k}</dt>
                <dd className="sm:col-span-2 text-navy-700">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="text-navy-600 mt-8">
            Prices can change; the phone always has the current number. To try flying before you decide anything,
            book a <Link href="/discovery-flight" className="text-sky-700 font-medium">discovery flight</Link>.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
