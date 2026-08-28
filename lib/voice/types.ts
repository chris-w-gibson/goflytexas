/**
 * Shared types for the AI phone agent. Kept dependency-free so the DB schema,
 * pure helpers and tests can all import them.
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
};

export type CallStatus = 'received' | 'processed' | 'no_message' | 'spam' | 'failed';

export type VoicePlatform = 'vapi' | 'retell';

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
};
