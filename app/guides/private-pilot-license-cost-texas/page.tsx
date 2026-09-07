import type { Metadata } from 'next';
import Link from 'next/link';
import { GuideLayout, guideJsonLd } from '@/components/GuideLayout';
import { CONTACT, formattedDiscoveryPrice } from '@/lib/constants';
import { RATES, blockEffective, usd } from '@/lib/rates';

const URL = 'https://www.goflytexas.com/guides/private-pilot-license-cost-texas';
const TITLE = 'What a Private Pilot License Costs in Texas (2026)';
const DESCRIPTION = `A line-by-line estimate for earning a private pilot certificate near Fort Worth: aircraft at ${usd(RATES.roundGaugeHourly)}–${usd(RATES.glassPanelHourly)} per hour wet, instructor at ${usd(RATES.cfiHourly)}, exams and gear, and how block time and flying more often bring the total down.`;
const PUBLISHED = '2026-09-06';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/guides/private-pilot-license-cost-texas' },
  openGraph: { title: `${TITLE} | GoFlyTexas`, description: DESCRIPTION, type: 'article' },
};

const price = formattedDiscoveryPrice();
const hoursMid = 60;
const aircraftMid = hoursMid * RATES.roundGaugeHourly;
const instructorHours = 45;
const instructorMid = instructorHours * RATES.cfiHourly;
const extras = 1500;
const total = aircraftMid + instructorMid + extras;
const blockSavings = Math.round(hoursMid * (RATES.roundGaugeHourly - blockEffective()));

const faqs = [
  {
    q: 'How much does a private pilot license cost at GoFlyTexas?',
    a: `Most students land in the neighborhood of ${usd(RATES.privatePilotTypical)} all-in. The biggest variable is how many hours you need, which mostly depends on how often you fly. Aircraft time is ${usd(RATES.roundGaugeHourly)}–${usd(RATES.glassPanelHourly)} per hour with fuel included and instruction is ${usd(RATES.cfiHourly)} per hour.`,
  },
  {
    q: 'How many hours does it take to get a private pilot license?',
    a: `The FAA minimum is ${RATES.faaMinimumHours} hours. Most people finish between ${RATES.typicalHoursLow} and ${RATES.typicalHoursHigh} hours, and the students who fly two or three times a week finish closest to the minimum because they are not re-learning what they forgot between lessons.`,
  },
  {
    q: 'Is a wet rate or a dry rate cheaper?',
    a: `Wet includes fuel; dry does not. A ${usd(120)} dry rate needs roughly ${usd(RATES.dryRateFuelAdder)} an hour of fuel added at current prices, so it is not cheaper than a ${usd(RATES.roundGaugeHourly)} wet rate. Always compare wet to wet. GoFlyTexas rates are wet.`,
  },
  {
    q: 'Does block time really save money?',
    a: `Yes. ${usd(RATES.blockPrice)} buys ${RATES.blockHours} hours (10 plus a bonus hour), which works out to about ${usd(Math.round(blockEffective()))} per hour on the glass-panel airplanes, and on the round-gauge airplanes each block hour flown returns a ${usd(RATES.roundGaugeBlockCredit)} account credit. Over a ${hoursMid}-hour certificate that is roughly ${usd(blockSavings)} back in your pocket, before the round-gauge credit.`,
  },
  {
    q: 'Can I pay as I go?',
    a: 'Yes. There is no contract or upfront tuition. You pay for the aircraft and instructor time you use, and you can buy block time whenever it makes sense for you.',
  },
  {
    q: 'What is the cheapest way to start?',
    a: price
      ? `A discovery flight: ${price} all-in for about an hour with an instructor, and it is logged as dual instruction so the time counts toward your certificate.`
      : 'A discovery flight: about an hour with an instructor, logged as dual instruction so the time counts toward your certificate.',
  },
];

export default function Page() {
  return (
    <GuideLayout
      eyebrow="Guide · Costs"
      title={TITLE}
      intro={`Straight numbers from a flight school at Aero Valley Airport, north of Fort Worth. No tuition packages, no fine print — here is what goes into the bill and what moves it.`}
      updated={RATES.asOf}
      jsonLd={guideJsonLd({ url: URL, headline: TITLE, description: DESCRIPTION, datePublished: PUBLISHED, dateModified: PUBLISHED, faqs })}
      faqs={faqs}
    >
      <h2>The short answer</h2>
      <p>
        At GoFlyTexas a private pilot certificate typically comes to about <strong>{usd(RATES.privatePilotTypical)}</strong>.
        Some people spend less, a few spend more, and the difference is almost always the number of hours it takes
        them, not the rates. Everything below is priced at our current rates, which include fuel.
      </p>

      <h2>What you are paying for</h2>
      <p>Four things make up the total. Only the first two are large.</p>
      <ol>
        <li>
          <strong>Aircraft time.</strong> Our Cessna 172s rent at {usd(RATES.roundGaugeHourly)} per hour for the
          traditional round-gauge airplanes and {usd(RATES.glassPanelHourly)} per hour for the glass-panel airplanes,
          wet — fuel is in the price. Time is billed on the Hobbs meter, which runs only while the engine is running.
        </li>
        <li>
          <strong>Instructor time.</strong> {usd(RATES.cfiHourly)} per hour with a two-hour minimum per session.
          Early on, nearly every flight has an instructor beside you; once you solo, a growing share of your hours are
          just you and the airplane.
        </li>
        <li>
          <strong>Ground instruction and study.</strong> One-on-one ground sessions are at the instructor rate.
          Books, an online course if you want one, and a headset are yours to keep.
        </li>
        <li>
          <strong>FAA and medical.</strong> The knowledge test, a third-class medical certificate from an aviation
          medical examiner, and the examiner&apos;s fee for your practical test (the checkride). Budget about
          {' '}{usd(extras)} for those together with your gear.
        </li>
      </ol>

      <h2>A worked example</h2>
      <p>
        Here is a typical student who flies twice a week on the round-gauge airplane and finishes in {hoursMid}
        hours:
      </p>
      <table>
        <thead>
          <tr><th>Item</th><th>Basis</th><th>Cost</th></tr>
        </thead>
        <tbody>
          <tr><td>Aircraft, {hoursMid} hours</td><td>{usd(RATES.roundGaugeHourly)}/hr wet</td><td>{usd(aircraftMid)}</td></tr>
          <tr><td>Instructor, {instructorHours} hours (flight + ground)</td><td>{usd(RATES.cfiHourly)}/hr</td><td>{usd(instructorMid)}</td></tr>
          <tr><td>Knowledge test, medical, checkride examiner, headset and books</td><td>estimate</td><td>{usd(extras)}</td></tr>
          <tr><td><strong>Total</strong></td><td></td><td><strong>{usd(total)}</strong></td></tr>
        </tbody>
      </table>
      <p>
        The same student buying aircraft time in {usd(RATES.blockPrice)} blocks ({RATES.blockHours} hours each) saves
        about {usd(blockSavings)} on the aircraft line, and on the round-gauge airplane each block hour also returns a
        {' '}{usd(RATES.roundGaugeBlockCredit)} credit toward future flying. That is how {usd(total)} becomes a number
        closer to {usd(RATES.privatePilotTypical)}.
      </p>

      <h2>What makes it cost more</h2>
      <ul>
        <li>
          <strong>Flying once a week or less.</strong> The FAA minimum is {RATES.faaMinimumHours} hours, but skills fade
          between lessons and you spend the first part of each flight getting back to where you were. Students who fly
          two or three times a week typically finish between {RATES.typicalHoursLow} and {RATES.typicalHoursHigh}
          hours; once-a-week students often need more.
        </li>
        <li>
          <strong>Long gaps.</strong> A month off in the middle of training costs real hours to recover. If you know a
          busy season is coming, it is cheaper to pause before solo than after.
        </li>
        <li>
          <strong>Comparing dry rates to wet.</strong> Some schools and clubs advertise a low dry rate and add fuel on
          top. At today&apos;s prices that adds roughly {usd(RATES.dryRateFuelAdder)} an hour, so a {usd(120)} dry
          rate is not cheaper than our {usd(RATES.roundGaugeHourly)} wet rate. Compare wet to wet.
        </li>
      </ul>

      <h2>What makes it cost less</h2>
      <ul>
        <li><strong>Fly often.</strong> Two or three lessons a week is the single biggest saver.</li>
        <li><strong>Buy block time.</strong> Ten hours plus one free, and the round-gauge credit on top.</li>
        <li><strong>Show up prepared.</strong> Study the lesson before you fly and ground time drops.</li>
        <li><strong>Start with a discovery flight.</strong> It is logged as dual instruction, so it is not a separate expense — it is your first hour.</li>
      </ul>

      <h2>How to get a real number for you</h2>
      <p>
        Call {CONTACT.phoneDisplay} or <Link href="/contact">send us a note</Link> with how often you can fly and
        which airplane you prefer, and we will put a plan together with a realistic hour count. If you have not been
        up yet, start with a <Link href="/discovery-flight">discovery flight</Link> — the hour counts, and you will
        know within twenty minutes whether this is for you. Our full <Link href="/private-pilot">private pilot
        program</Link> page covers what the training itself looks like.
      </p>
    </GuideLayout>
  );
}
