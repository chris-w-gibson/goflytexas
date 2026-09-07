/**
 * Published rates, in one place. Keep identical to
 * docs/bot-knowledge/rates-and-block-time.md (the chatbot/voice knowledge doc);
 * when Jim changes a number, change it here and there together.
 */
export const RATES = {
  asOf: 'September 2026',
  glassPanelHourly: 195, // wet, per Hobbs hour
  roundGaugeHourly: 180, // wet, per Hobbs hour
  cfiHourly: 75, // two-hour minimum per session
  cfiAdvancedHourly: 90, // instrument and commercial instruction
  blockPrice: 1900, // buys 10 hours + 1 bonus hour
  blockHours: 11,
  roundGaugeBlockCredit: 10, // per hour flown on block time in a round-gauge aircraft
  dryRateFuelAdder: 100, // what a "dry" competitor rate roughly adds per hour in fuel today
  privatePilotTypical: 15000, // typical all-in at GoFlyTexas
  faaMinimumHours: 40,
  typicalHoursLow: 55,
  typicalHoursHigh: 70,
} as const;

export const usd = (n: number) => `$${n.toLocaleString('en-US')}`;
export const blockEffective = () => RATES.blockPrice / RATES.blockHours;
