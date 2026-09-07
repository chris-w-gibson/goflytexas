import type { Metadata } from 'next';
import Link from 'next/link';
import { GuideLayout, guideJsonLd } from '@/components/GuideLayout';
import { CONTACT } from '@/lib/constants';
import { RATES } from '@/lib/rates';

const URL = 'https://www.goflytexas.com/guides/how-long-private-pilot-license';
const TITLE = 'How Long Does It Take to Get a Private Pilot License?';
const DESCRIPTION = `The honest timeline from a DFW-area flight school: the FAA's ${RATES.faaMinimumHours}-hour minimum, why most people finish in ${RATES.typicalHoursLow}–${RATES.typicalHoursHigh} hours, and how flying once, twice or three times a week turns that into months on the calendar.`;
const PUBLISHED = '2026-09-07';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/guides/how-long-private-pilot-license' },
  openGraph: { title: `${TITLE} | GoFlyTexas`, description: DESCRIPTION, type: 'article' },
};

const faqs = [
  {
    q: 'How many flight hours do you need for a private pilot license?',
    a: `The FAA minimum under Part 61 is ${RATES.faaMinimumHours} hours, including at least 20 with an instructor and 10 solo. Most people need ${RATES.typicalHoursLow}–${RATES.typicalHoursHigh} hours to be ready for the checkride, and the gap between the minimum and the real number is mostly about how often you fly.`,
  },
  {
    q: 'Can I get my private pilot license in three months?',
    a: 'Yes, if you fly three or four times a week and study between lessons. That is roughly 60 hours in 12–14 weeks, and it is the fastest realistic path without moving to a full-time academy.',
  },
  {
    q: 'What is the slowest it should take?',
    a: 'Flying once a week or less, plan on nine to twelve months and expect to need more total hours, because you spend part of each lesson recovering what faded since the last one. There is no expiry on your training, but momentum is cheaper.',
  },
  {
    q: 'How old do you have to be?',
    a: 'You can start lessons at any age, solo at 16, and take the private pilot checkride at 17. You also need a third-class medical certificate before you solo, and a student pilot certificate, both of which we help you arrange early.',
  },
  {
    q: 'What is the checkride?',
    a: 'The practical test with an FAA designated examiner: an oral exam on the ground followed by a flight where you demonstrate the maneuvers. Before it you also pass the FAA knowledge test, a computer-based multiple-choice exam.',
  },
  {
    q: 'Does a discovery flight count toward the license?',
    a: 'Yes. It is logged as dual instruction with a certified instructor, so your first hour toward the certificate is the discovery flight itself.',
  },
];

const cadence = [
  ['Three or four lessons a week', '3–4 months', `~${RATES.typicalHoursLow} hours`],
  ['Two lessons a week', '5–7 months', `~${Math.round((RATES.typicalHoursLow + RATES.typicalHoursHigh) / 2)} hours`],
  ['One lesson a week', '9–12 months', `${RATES.typicalHoursHigh}+ hours`],
];

export default function Page() {
  return (
    <GuideLayout
      eyebrow="Guide · Timeline"
      title={TITLE}
      intro="Three to twelve months, depending almost entirely on one thing: how often you fly. Here is the FAA's minimum, what people really need, and a way to pick your own finish date."
      updated={RATES.asOf}
      jsonLd={guideJsonLd({ url: URL, headline: TITLE, description: DESCRIPTION, datePublished: PUBLISHED, dateModified: PUBLISHED, faqs })}
      faqs={faqs}
    >
      <h2>The minimum, and the real number</h2>
      <p>
        The FAA requires {RATES.faaMinimumHours} hours of flight time for a private pilot certificate under
        Part 61: at least 20 hours with an instructor, 10 hours solo, and within those some specific
        experience — three hours of cross-country, three hours at night, three hours flying by reference to
        instruments, three hours of checkride preparation, and a solo cross-country with the required legs.
      </p>
      <p>
        Almost nobody finishes at 40. Most GoFlyTexas students are checkride-ready between{' '}
        {RATES.typicalHoursLow} and {RATES.typicalHoursHigh} hours, which is in line with the national
        picture. The extra hours are not a failure; they are the practice it takes to fly a pattern with a
        gusty crosswind, talk to a busy tower, and handle a simulated engine failure without thinking hard.
      </p>

      <h2>What sets the calendar</h2>
      <p>
        Hours are the cost; frequency is the time. Skills fade between lessons, and the more they fade the
        more of the next lesson goes to getting back to where you were. That is why the same certificate can
        take three months or a year:
      </p>
      <table>
        <thead>
          <tr><th>How often you fly</th><th>Calendar time</th><th>Total hours, typically</th></tr>
        </thead>
        <tbody>
          {cadence.map(([how, when, hours]) => (
            <tr key={how}><td>{how}</td><td>{when}</td><td>{hours}</td></tr>
          ))}
        </tbody>
      </table>
      <p>
        Weather is the other variable. North Texas is a good place to learn, but summer heat and the
        occasional spring storm line will cancel lessons; a schedule with slack in it finishes on time.
      </p>

      <h2>The milestones, in order</h2>
      <ol>
        <li><strong>Discovery flight.</strong> About an hour. Logged, so it counts.</li>
        <li><strong>Paperwork.</strong> Student pilot certificate and a third-class medical from an aviation medical examiner. Start these in the first two weeks so they are never the thing you are waiting on.</li>
        <li><strong>First solo.</strong> Typically between 15 and 25 hours: the pattern, emergencies and a solo endorsement from your instructor.</li>
        <li><strong>Solo cross-countries.</strong> Planning, navigation, talking to other airports. The most fun part of training for most people.</li>
        <li><strong>Knowledge test.</strong> The computer-based FAA exam. Many students take it around solo so the last stretch is all flying.</li>
        <li><strong>Checkride prep and the checkride.</strong> Three hours of polish, then an oral and a flight with an FAA designated examiner.</li>
      </ol>

      <h2>How to finish sooner</h2>
      <ul>
        <li><strong>Book lessons in pairs.</strong> Two a week is the tipping point where progress outruns forgetting.</li>
        <li><strong>Do the ground work at home.</strong> Show up knowing the lesson and the flight hour is all flying.</li>
        <li><strong>Get the medical early.</strong> A surprise on the medical is the one delay you cannot fly through.</li>
        <li><strong>Buy block time.</strong> It does not change the hours, but it lowers what each one costs — see <Link href="/guides/block-time-wet-vs-dry-rates">how block time works</Link> and <Link href="/guides/private-pilot-license-cost-texas">what the whole certificate costs</Link>.</li>
      </ul>

      <h2>Pick a finish date</h2>
      <p>
        Tell us when you would like to be a pilot and how many lessons a week you can commit to, and we will
        work the plan backward from there. Call {CONTACT.phoneDisplay} or <Link href="/contact">send a
        note</Link>. If you have not been up yet, a <Link href="/discovery-flight">discovery flight</Link> is the
        first hour of the plan. Our <Link href="/private-pilot">private pilot program</Link> page covers the
        training itself.
      </p>
    </GuideLayout>
  );
}
