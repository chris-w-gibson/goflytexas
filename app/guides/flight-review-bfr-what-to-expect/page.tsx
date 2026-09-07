import type { Metadata } from 'next';
import Link from 'next/link';
import { GuideLayout, guideJsonLd } from '@/components/GuideLayout';
import { CONTACT } from '@/lib/constants';
import { RATES, usd } from '@/lib/rates';

const URL = 'https://www.goflytexas.com/guides/flight-review-bfr-what-to-expect';
const TITLE = 'Flight Review (BFR) near Fort Worth: What to Expect and What to Bring';
const DESCRIPTION = `The FAA flight review every pilot needs every 24 months, explained by a Roanoke, TX flight school: the one-hour ground and one-hour flight minimums, what your instructor covers, what it costs at GoFlyTexas, and a checklist for the day.`;
const PUBLISHED = '2026-09-07';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/guides/flight-review-bfr-what-to-expect' },
  openGraph: { title: `${TITLE} | GoFlyTexas`, description: DESCRIPTION, type: 'article' },
};

const instructorTwoHours = RATES.cfiHourly * 2;
const withOurAircraft = instructorTwoHours + RATES.roundGaugeHourly;

const faqs = [
  {
    q: 'How often do I need a flight review?',
    a: 'Every 24 calendar months. If your last review was signed in March 2025, you are good through the end of March 2027. A new certificate or rating checkride also resets the clock.',
  },
  {
    q: 'What does a flight review consist of?',
    a: 'At least one hour of ground instruction and one hour of flight with a certified flight instructor. The ground portion covers current rules and procedures; the flight portion covers the maneuvers the instructor decides are needed for your certificate and the flying you do.',
  },
  {
    q: 'Can I fail a flight review?',
    a: 'There is no pass or fail and nothing goes on your record. If more work is needed, the instructor simply does not sign the endorsement yet and you fly again. The point is to get you current and confident, not to test you.',
  },
  {
    q: 'What does a flight review cost at GoFlyTexas?',
    a: `Instructor time is ${usd(RATES.cfiHourly)} per hour with a two-hour minimum, so a typical review is about ${usd(instructorTwoHours)} for the instructor. In your own airplane that is the whole bill; in one of our round-gauge Cessna 172s add the ${usd(RATES.roundGaugeHourly)} wet hourly rate, roughly ${usd(withOurAircraft)} all-in for a one-hour flight.`,
  },
  {
    q: 'What is the difference between a flight review and an instrument proficiency check?',
    a: 'A flight review keeps any pilot certificate current. An instrument proficiency check (IPC) is separate: it restores instrument privileges if you have gone more than six months without the required approaches, holds and tracking, and then a further six months without getting current on your own.',
  },
  {
    q: 'Can I combine a flight review with something else?',
    a: 'Yes. A checkride for a new rating counts as a flight review, and many pilots pair the review with a rental checkout so they leave able to rent our airplanes the same day.',
  },
];

export default function Page() {
  return (
    <GuideLayout
      eyebrow="Guide · Staying current"
      title={TITLE}
      intro="Two hours with an instructor every two years is the FAA's price of staying a pilot. Here is what those two hours look like at Aero Valley, what to bring, and how to make the flight portion genuinely useful instead of a box to tick."
      updated={RATES.asOf}
      jsonLd={guideJsonLd({ url: URL, headline: TITLE, description: DESCRIPTION, datePublished: PUBLISHED, dateModified: PUBLISHED, faqs })}
      faqs={faqs}
    >
      <h2>The rule in one paragraph</h2>
      <p>
        To act as pilot in command you need a flight review within the preceding 24 calendar months
        (14 CFR 61.56). It is a minimum of one hour of ground instruction and one hour of flight training
        with a certified flight instructor, who signs your logbook when satisfied. It is not a test: there is
        no pass or fail and nothing is reported. People still call it the &ldquo;biennial&rdquo; or BFR, and
        so do we on our <Link href="/flight-review">flight review page</Link>.
      </p>

      <h2>What the ground hour covers</h2>
      <ul>
        <li><strong>What changed since your last review.</strong> Airspace, weather products, ADS-B, the newer FAA guidance on things like preflight briefings and runway safety.</li>
        <li><strong>Your flying.</strong> Where you go, what you fly, what you have not done in a while. The instructor tailors the flight to that, which is why an honest conversation here makes the next hour better.</li>
        <li><strong>The parts of Part 91 you actually use.</strong> Currency rules, required equipment, fuel reserves, right of way, and the local procedures around {CONTACT.airport} and the DFW Class B shelf.</li>
      </ul>

      <h2>What the flight hour covers</h2>
      <p>
        The regulation leaves the content to the instructor&apos;s judgment, so it depends on you. A typical
        review out of Aero Valley includes:
      </p>
      <ul>
        <li>Preflight and a proper takeoff briefing.</li>
        <li>Slow flight, power-off and power-on stalls, steep turns.</li>
        <li>Simulated engine failure and an emergency descent.</li>
        <li>Pattern work: normal, short-field and soft-field takeoffs and landings, and a go-around.</li>
        <li>Anything from the ground discussion that deserved a look, such as a diversion or a crosswind landing.</li>
      </ul>
      <p>
        If you are rusty, say so. The instructor would rather spend the hour on what you need than on a
        checklist, and there is no penalty for needing a second flight.
      </p>

      <h2>Checklist for the day</h2>
      <ol>
        <li>Pilot certificate and government photo ID.</li>
        <li>Medical certificate or BasicMed paperwork, current.</li>
        <li>Logbook, so the endorsement goes in on the spot.</li>
        <li>Headset if you have one; we have loaners.</li>
        <li>Your airplane&apos;s documents (airworthiness, registration, weight and balance) if you are bringing your own aircraft.</li>
        <li>Fifteen minutes early, and a note of anything you want to work on.</li>
      </ol>

      <h2>What it costs</h2>
      <p>
        Instructor time is {usd(RATES.cfiHourly)} per hour with a two-hour minimum per session, which fits a
        review exactly: about {usd(instructorTwoHours)} for the instructor. In your own airplane that is the
        whole bill. In one of our round-gauge Cessna 172s, add the {usd(RATES.roundGaugeHourly)} wet hourly
        rate (fuel included) for roughly {usd(withOurAircraft)} for a one-hour flight; the glass-panel
        airplanes are {usd(RATES.glassPanelHourly)}. If you plan to rent from us afterward, we can roll a
        rental checkout into the same session. See <Link href="/guides/block-time-wet-vs-dry-rates">how our
        rates work</Link>.
      </p>

      <h2>Flight review or instrument proficiency check?</h2>
      <p>
        Instrument-rated pilots have a second clock. To fly IFR you need six approaches, holding, and
        intercepting and tracking courses within the preceding six months. Let that lapse and you have six
        more months to get current with a safety pilot; let <em>that</em> lapse and you need an instrument
        proficiency check with an instructor. An IPC can be combined with your flight review in one longer
        session, which is how most of our instrument pilots do it.
      </p>

      <h2>Booking</h2>
      <p>
        Call {CONTACT.phoneDisplay} or <Link href="/contact">send a note</Link> with your certificate, how
        recently you have flown, and whether you are bringing an airplane. Reviews are scheduled seven days
        a week by appointment.
      </p>
    </GuideLayout>
  );
}
