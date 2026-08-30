/**
 * Shared types for the AI phone agent + Twilio switchboard. Kept
 * dependency-free so the DB schema, pure helpers and tests can all import them.
 */

export type TranscriptTurn = {
  role: 'user' | 'assistant';
  text: string;
  /** Seconds from call start, when the platform provides it. */
  at?: number;
};

export const CALL_INTERESTS = [
  'discovery',
  'private',
  'instrument',
  'commercial',
  'rental',
  'tour',
  'ferry',
  'insurance',
  'biennial',
  'other',
] as const;
export type CallInterest = (typeof CALL_INTERESTS)[number];

export type CallExtraction = {
  /** 2–3 sentences, third person, written for the owner. */
  summary: string;
  callerName: string | null;
  /** E.164 when the caller gave a number different from caller ID; else null. */
  callbackPhone: string | null;
  interest: CallInterest | null;
  preferredTime: string | null;
  spam: boolean;
  spamReason: string | null;
  /** Human-answered calls only: promises, open items, things to schedule. */
  followUps?: string[];
  /** One line if a flight/lesson/visit was agreed with a day or time. */
  booking?: string | null;
};

/** Who ended up talking to the caller. */
export type AnsweredBy = 'human' | 'ai' | 'none';

export type CallStatus =
  | 'received'
  | 'processed'
  | 'no_message'
  | 'spam'
  | 'failed'
  // Twilio switchboard parent rows
  | 'ringing'
  | 'answered'
  | 'forwarded_to_ai'
  | 'passthrough';

export const TERMINAL_CALL_STATUSES: ReadonlySet<CallStatus> = new Set<CallStatus>([
  'processed',
  'no_message',
  'spam',
]);

export type TranscriptionStatus = 'pending' | 'running' | 'done' | 'failed';

export type VoicePlatform = 'vapi' | 'retell' | 'twilio';

export type NormalizedCallEnd = {
  platform: VoicePlatform;
  platformCallId: string;
  fromNumber: string | null;
  toNumber: string | null;
  forwardedFrom: string | null;
  startedAt: Date | null;
  endedAt: Date | null;
  durationSec: number | null;
  endedReason: string | null;
  recordingUrl: string | null;
  transcript: TranscriptTurn[];
  platformSummary: string | null;
  answeredBy: AnsweredBy;
  answeredByName: string | null;
  /** Twilio CallSid of the parent leg when the platform reports it. */
  parentCallId: string | null;
};
