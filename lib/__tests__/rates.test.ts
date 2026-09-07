import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { RATES, blockEffective, usd } from '../rates';

// lib/rates.ts feeds the guides and /facts; the bot/voice knowledge doc is the
// other copy of the same numbers. If Jim changes a rate, both must move.
const doc = readFileSync('docs/bot-knowledge/rates-and-block-time.md', 'utf8');

describe('published rates stay in step with the bot knowledge doc', () => {
  it.each([
    ['glass-panel hourly', `${usd(RATES.glassPanelHourly)} per Hobbs hour`],
    ['round-gauge hourly', `${usd(RATES.roundGaugeHourly)}\n  per Hobbs hour`],
    ['CFI hourly', `${usd(RATES.cfiHourly)} per\n  hour with a two-hour minimum`],
    ['advanced CFI hourly', `${usd(RATES.cfiAdvancedHourly)} per hour for advanced`],
    ['block price', `${usd(RATES.blockPrice)} buys a 10-hour block PLUS one bonus hour`],
    ['round-gauge block credit', `returns a ${usd(RATES.roundGaugeBlockCredit)} credit`],
    ['typical private pilot cost', usd(RATES.privatePilotTypical)],
    ['largest blocks below $150', 'below $150 per hour'],
  ])('%s', (_label, needle) => {
    expect(doc).toContain(needle);
  });

  it('block math matches the doc ("about $173 per hour")', () => {
    expect(Math.round(blockEffective())).toBe(173);
    expect(doc).toContain('about $173 per hour');
  });
});
