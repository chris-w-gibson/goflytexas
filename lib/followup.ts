/**
 * Pure scheduling + formatting helpers for lead follow-up and response-time
 * tracking. No I/O here so it can be unit-tested without a database.
 *
 * Background (Jim call 2026-08-27): the old drip emailed every open lead
 * weekly, forever. Replaced with a staggered schedule (default day 7 / 14 / 21
 * after the lead came in) with distinct copy per step, then it stops.
 */

export const DEFAULT_FOLLOWUP_DAYS = [7, 14, 21] as const;

/** Leads older than this are never picked up by the drip (safety valve). */
export const FOLLOWUP_MAX_AGE_DAYS = 60;

/** A lead waiting longer than this for a first human touch is "slow". */
export const SLOW_RESPONSE_MS = 60 * 60 * 1000;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Parse `FOLLOWUP_DAYS="7,14,21"` into a validated, strictly increasing list
 * of positive integers. Falls back to the default on any problem.
 */
export function parseFollowupSchedule(raw: string | undefined | null): number[] {
  if (!raw) return [...DEFAULT_FOLLOWUP_DAYS];
  const days = raw
    .split(',')
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  const increasing = days.every((d, i) => i === 0 || d > days[i - 1]);
  if (days.length === 0 || !increasing) return [...DEFAULT_FOLLOWUP_DAYS];
  return days;
}

/**
 * Which follow-up step (1-based) is due for a lead right now, or null.
 *
 * `sentCount` is how many follow-ups have already gone out successfully; the
 * next step is `sentCount + 1` and it is due once `schedule[sentCount]` days
 * have elapsed since the lead was created. Steps never skip and never repeat,
 * so running the cron daily (or hourly) is idempotent.
 */
export function dueFollowupStep(opts: {
  createdAt: Date;
  sentCount: number;
  schedule: readonly number[];
  now?: Date;
}): number | null {
  const { createdAt, sentCount, schedule } = opts;
  const now = opts.now ?? new Date();
  if (sentCount < 0 || sentCount >= schedule.length) return null;
  const ageDays = (now.getTime() - createdAt.getTime()) / DAY_MS;
  if (ageDays > FOLLOWUP_MAX_AGE_DAYS) return null;
  return ageDays >= schedule[sentCount] ? sentCount + 1 : null;
}

/** "12m", "3h 20m", "2d 4h" — coarse, human. */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '—';
  const m = Math.floor(ms / 60_000);
  if (m < 1) return '<1m';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return m % 60 ? `${h}h ${m % 60}m` : `${h}h`;
  const d = Math.floor(h / 24);
  return h % 24 ? `${d}d ${h % 24}h` : `${d}d`;
}

/** "0s", "48s", "1m 42s", "12m" — second-granular, for call lengths. */
export function formatCallDuration(sec: number | null | undefined): string {
  if (sec == null || !Number.isFinite(sec) || sec < 0) return '—';
  const s = Math.round(sec);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m}m ${r}s` : `${m}m`;
}

export type ResponseState =
  | { kind: 'responded'; ms: number; slow: boolean }
  | { kind: 'waiting'; ms: number; slow: boolean }
  | { kind: 'none' };

/**
 * How the lead's first human response looks right now.
 * - responded: a person marked it contacted (or added a note) — show the time it took
 * - waiting:   still `new` with no human touch — show how long it has been sitting
 * - none:      historical leads that were only ever touched by the automated drip
 */
export function responseState(
  lead: { createdAt: Date; firstContactedAt: Date | null; status: string },
  now: Date = new Date(),
): ResponseState {
  if (lead.firstContactedAt) {
    // Clamped at 0: a lead filed from a live-answered call can carry a first
    // contact that predates the row.
    const ms = Math.max(0, lead.firstContactedAt.getTime() - lead.createdAt.getTime());
    return { kind: 'responded', ms, slow: ms > SLOW_RESPONSE_MS };
  }
  if (lead.status === 'new') {
    const ms = now.getTime() - lead.createdAt.getTime();
    return { kind: 'waiting', ms, slow: ms > SLOW_RESPONSE_MS };
  }
  return { kind: 'none' };
}

/** Parse a comma-separated recipient list from env, dropping blanks/dupes. */
export function parseEmailList(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return Array.from(
    new Set(
      raw
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.includes('@')),
    ),
  );
}
