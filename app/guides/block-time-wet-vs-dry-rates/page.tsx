import type { Metadata } from 'next';
import Link from 'next/link';
import { GuideLayout, guideJsonLd } from '@/components/GuideLayout';
import { CONTACT } from '@/lib/constants';
import { RATES, blockEffective, usd } from '@/lib/rates';

const URL = 'https://www.goflytexas.com/guides/block-time-wet-vs-dry-rates';
const TITLE = 'Block Time and Wet vs Dry Rates, Explained';
const DESCRIPTION = `How aircraft rental pricing actually works: what a wet rate includes, why a low dry rate is not cheaper, and how a ${usd(RATES.blockPrice)} block of time turns ${usd(RATES.glassPanelHourly)} an hour into about ${usd(Math.round(blockEffective()))}.`;
const PUBLISHED = '2026-09-06';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/guides/block-time-wet-vs-dry-rates' },
  openGraph: { title: `${TITLE} | GoFlyTexas`, description: DESCRIPTION, type: 'article' },
};

const eff = Math.round(blockEffective() * 100) / 100;
const roundGaugeBlockHours = Math.round((RATES.blockPrice / (RATES.roundGaugeHourly - RATES.roundGaugeBlockCredit)) * 10) / 10;

const faqs = [
  {
    q: 'What does a wet rate mean?',
    a: 'Fuel is included in the hourly price. You fly, you pay the hourly rate, and that is the whole bill for the airplane. All GoFlyTexas rates are wet.',
  },
  {
    q: 'What does a dry rate mean?',
    a: `The hourly price does not include fuel; you pay for what the airplane burns on top of it. At today's fuel prices and burn rates that is roughly ${usd(RATES.dryRateFuelAdder)} an hour on a Cessna 172, so a ${usd(120)} dry rate really costs about ${usd(120 + RATES.dryRateFuelAdder)}.`,
  },
  {
    q: 'What is block time?',
    a: `Prepaid aircraft hours at a discount. At GoFlyTexas ${usd(RATES.blockPrice)} buys ${RATES.blockHours} hours — ten plus a bonus hour — which is about ${usd(eff)} per hour on the glass-panel airplanes instead of ${usd(RATES.glassPanelHourly)}.`,
  },
  {
    q: 'Does block time expire?',
    a: 'Ask us about the current terms when you buy; the point of block time is to reward people who fly regularly, and the hours are yours to use as you train.',
  },
  {
    q: 'Do I need block time to take a discovery flight?',
    a: 'No. A discovery flight is a single fixed price with the instructor included. Block time is for once you decide to keep going.',
  },
];

export default function Page() {
  return (
    <GuideLayout
      eyebrow="Guide · Pricing"
      title={TITLE}
      intro="Aircraft rental pricing has two words that change everything — wet and dry — and one habit that saves real money. Here is how it works at GoFlyTexas."
      updated={RATES.asOf}
      jsonLd={guideJsonLd({ url: URL, headline: TITLE, description: DESCRIPTION, datePublished: PUBLISHED, dateModified: PUBLISHED, faqs })}
      faqs={faqs}
    >
      <h2>Wet vs dry</h2>
      <p>
        A <strong>wet rate</strong> includes fuel. A <strong>dry rate</strong> does not — you pay the hourly rate and
        then the fuel the airplane burned. Schools and clubs that advertise a headline number like {usd(120)} an hour
        are almost always quoting dry. A Cessna 172 burns enough at today&apos;s prices that the fuel adds roughly
        {' '}{usd(RATES.dryRateFuelAdder)} an hour, which puts that {usd(120)} airplane at about
        {' '}{usd(120 + RATES.dryRateFuelAdder)} — more than our {usd(RATES.roundGaugeHourly)} wet round-gauge rate.
      </p>
      <p>
        GoFlyTexas quotes everything wet: {usd(RATES.roundGaugeHourly)} an hour for the round-gauge Cessna 172s and
        {' '}{usd(RATES.glassPanelHourly)} for the glass-panel ones. The number on the rate sheet is the number on the
        invoice. When you compare schools, ask one question first: <em>is that wet or dry?</em>
      </p>

      <h2>Hobbs time</h2>
      <p>
        Rental hours are measured on the Hobbs meter, which runs while the engine runs — taxi, run-up, flight and
        shutdown. It does not run while you are doing the preflight walk-around or the briefing with your instructor,
        so a one-hour lesson is usually right around one hour of aircraft time.
      </p>

      <h2>Block time</h2>
      <p>
        Block time is prepaid aircraft hours at a discount. Our block is <strong>{usd(RATES.blockPrice)} for
        {' '}{RATES.blockHours} hours</strong> — ten hours plus one bonus hour. On the glass-panel airplanes that is
        about {usd(eff)} an hour instead of {usd(RATES.glassPanelHourly)}.
      </p>
      <p>
        Fly a round-gauge airplane on block time and it gets better: every block hour flown in a
        {' '}{usd(RATES.roundGaugeHourly)} airplane returns a {usd(RATES.roundGaugeBlockCredit)} credit to your account,
        so the same {usd(RATES.blockPrice)} stretches to roughly {roundGaugeBlockHours} hours. Larger blocks of 25 and
        50 hours bring the effective rate down further still — on the largest blocks flown on the round-gauge fleet it
        comes in below {usd(150)} an hour. Ask for the current block sheet for the exact figure.
      </p>
      <table>
        <thead>
          <tr><th>How you pay</th><th>Glass panel</th><th>Round gauge</th></tr>
        </thead>
        <tbody>
          <tr><td>Hourly, wet</td><td>{usd(RATES.glassPanelHourly)}/hr</td><td>{usd(RATES.roundGaugeHourly)}/hr</td></tr>
          <tr><td>{usd(RATES.blockPrice)} block ({RATES.blockHours} hrs)</td><td>≈ {usd(eff)}/hr</td><td>≈ {usd(eff)}/hr plus a {usd(RATES.roundGaugeBlockCredit)}/hr credit</td></tr>
          <tr><td>Largest blocks</td><td>ask</td><td>below {usd(150)}/hr</td></tr>
        </tbody>
      </table>

      <h2>When block time makes sense</h2>
      <ul>
        <li><strong>You are training for a certificate.</strong> A private pilot certificate is {RATES.typicalHoursLow}–{RATES.typicalHoursHigh} hours for most people; that is five or six blocks, and the savings add up to real money. See <Link href="/guides/private-pilot-license-cost-texas">what a private pilot license costs</Link>.</li>
        <li><strong>You rent regularly.</strong> Licensed pilots who fly a couple of times a month get the same discount.</li>
        <li><strong>You have not flown yet.</strong> Then no — take a <Link href="/discovery-flight">discovery flight</Link> first. It is one fixed price with the instructor included.</li>
      </ul>

      <h2>Instructor time is separate</h2>
      <p>
        Block time covers the airplane. Instruction is {usd(RATES.cfiHourly)} an hour with a two-hour minimum per
        session ({usd(RATES.cfiAdvancedHourly)} for instrument and commercial work), billed as you go.
      </p>

      <h2>Questions</h2>
      <p>
        Call {CONTACT.phoneDisplay} or <Link href="/contact">message us</Link> and we will walk you through the current
        block sheet. Our <Link href="/aircraft">fleet page</Link> shows which airplanes are glass panel and which are
        round gauge.
      </p>
    </GuideLayout>
  );
}
