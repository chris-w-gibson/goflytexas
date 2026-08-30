import type { Call } from '../db/schema';
import { toE164 } from './phone';
import type { AnsweredBy, NormalizedCallEnd, TranscriptTurn, VoicePlatform } from './types';

type AnyRecord = Record<string, unknown>;

function rec(v: unknown): AnyRecord | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as AnyRecord) : null;
}
function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}
function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}
function date(v: unknown): Date | null {
  if (v == null) return null;
  const d = typeof v === 'number' ? new Date(v) : new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "AI: hi\nUser: hello" → turns. Used when the platform sends only a text transcript. */
export function parseTranscriptText(text: string, opts?: { assistantLabels?: string[] }): TranscriptTurn[] {
  const extra = (opts?.assistantLabels ?? []).map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(
    `^\\s*(AI|Assistant|Agent|Bot|Staff${extra.length ? '|' + extra.join('|') : ''}|User|Caller|Customer)\\s*:\\s*(.*)$`,
    'i',
  );
  const turns: TranscriptTurn[] = [];
  for (const line of text.split(/\r?\n/)) {
    const m = re.exec(line);
    if (!m) {
      const last = turns[turns.length - 1];
      if (last && line.trim()) last.text = `${last.text} ${line.trim()}`;
      continue;
    }
    const role = /^(user|caller|customer)$/i.test(m[1]) ? 'user' : 'assistant';
    if (m[2].trim()) turns.push({ role, text: m[2].trim() });
  }
  return turns;
}

function turnsFromMessages(list: unknown): TranscriptTurn[] {
  if (!Array.isArray(list)) return [];
  const turns: TranscriptTurn[] = [];
  for (const item of list) {
    const m = rec(item);
    if (!m) continue;
    const role = str(m.role);
    const mapped: TranscriptTurn['role'] | null =
      role === 'user' || role === 'customer' || role === 'caller'
        ? 'user'
        : role === 'bot' || role === 'assistant' || role === 'agent'
          ? 'assistant'
          : null;
    if (!mapped) continue;
    const text = str(m.message) ?? str(m.content);
    if (!text) continue;
    const at = num(m.secondsFromStart) ?? num(m.seconds_from_start);
    turns.push(at == null ? { role: mapped, text } : { role: mapped, text, at });
  }
  return turns;
}

/**
 * Vapi `end-of-call-report` (server message) → NormalizedCallEnd.
 * Lenient on purpose: Vapi's payload has grown fields over time and we only
 * need a handful. Returns null when there is no call id to key on.
 */
export function normalizeVapiEndOfCall(body: unknown): NormalizedCallEnd | null {
  const root = rec(body);
  if (!root) return null;
  const msg = rec(root.message) ?? root;
  const call = rec(msg.call) ?? {};
  const platformCallId = str(call.id) ?? str(msg.callId);
  if (!platformCallId) return null;

  const artifact = rec(msg.artifact) ?? {};
  const customer = rec(call.customer) ?? rec(msg.customer) ?? {};
  const phoneNumber = rec(call.phoneNumber) ?? rec(msg.phoneNumber) ?? {};
  const recording = rec(artifact.recording) ?? {};
  const mono = rec(recording.mono) ?? {};

  const startedAt = date(msg.startedAt) ?? date(call.startedAt) ?? date(call.createdAt);
  const endedAt = date(msg.endedAt) ?? date(call.endedAt);
  let durationSec = num(msg.durationSeconds);
  if (durationSec == null && num(msg.durationMs) != null) durationSec = (num(msg.durationMs) as number) / 1000;
  if (durationSec == null && startedAt && endedAt) {
    durationSec = (endedAt.getTime() - startedAt.getTime()) / 1000;
  }

  let transcript = turnsFromMessages(artifact.messages);
  if (transcript.length === 0) transcript = turnsFromMessages(msg.messages);
  if (transcript.length === 0) {
    const text = str(artifact.transcript) ?? str(msg.transcript);
    if (text) transcript = parseTranscriptText(text);
  }

  return {
    platform: 'vapi',
    platformCallId,
    fromNumber: toE164(str(customer.number)),
    toNumber: toE164(str(phoneNumber.number)),
    forwardedFrom: toE164(str(call.forwardedFrom) ?? str(customer.forwardedFrom) ?? str(msg.forwardedFrom)),
    startedAt,
    endedAt,
    durationSec: durationSec == null ? null : Math.max(0, Math.round(durationSec)),
    endedReason: str(msg.endedReason) ?? str(call.endedReason),
    recordingUrl:
      str(msg.recordingUrl) ??
      str(artifact.recordingUrl) ??
      str(recording.stereoUrl) ??
      str(mono.combinedUrl) ??
      str(call.recordingUrl),
    transcript,
    platformSummary: str(msg.summary) ?? str(rec(msg.analysis)?.summary),
    answeredBy: 'ai',
    answeredByName: null,
    // Set by Vapi for Twilio-provider numbers; used to link to the Twilio parent row.
    parentCallId: str(call.phoneCallProviderId),
  };
}

/** Retell `call_ended` / `call_analyzed` → NormalizedCallEnd (kept for the platform swap). */
export function normalizeRetellCallEnded(body: unknown): NormalizedCallEnd | null {
  const root = rec(body);
  const call = rec(root?.call);
  if (!call) return null;
  const platformCallId = str(call.call_id);
  if (!platformCallId) return null;
  const start = date(call.start_timestamp);
  const end = date(call.end_timestamp);
  const durationMs = num(call.duration_ms);
  const durationSec =
    durationMs != null ? durationMs / 1000 : start && end ? (end.getTime() - start.getTime()) / 1000 : null;
  const transcriptObj = Array.isArray(call.transcript_object)
    ? turnsFromMessages(call.transcript_object)
    : [];
  const transcript =
    transcriptObj.length > 0
      ? transcriptObj
      : str(call.transcript)
        ? parseTranscriptText(str(call.transcript) as string)
        : [];
  return {
    platform: 'retell',
    platformCallId,
    fromNumber: toE164(str(call.from_number)),
    toNumber: toE164(str(call.to_number)),
    forwardedFrom: null,
    startedAt: start,
    endedAt: end,
    durationSec: durationSec == null ? null : Math.max(0, Math.round(durationSec)),
    endedReason: str(call.disconnection_reason),
    recordingUrl: str(call.recording_url),
    transcript,
    platformSummary: str(rec(call.call_analysis)?.call_summary),
    answeredBy: 'ai',
    answeredByName: null,
    parentCallId: null,
  };
}

export type TwilioCallState = {
  callSid: string;
  from: string | null;
  to: string | null;
  forwardedFrom: string | null;
  startedAt: Date | null;
  endedAt: Date | null;
  durationSec: number | null;
  endedReason: string | null;
  answeredBy: AnsweredBy;
  answeredByName: string | null;
  recordingUrl: string | null;
  transcript: TranscriptTurn[];
};

/**
 * Twilio calls arrive as several callbacks, so the normalized shape is built
 * from OUR stored state rather than one payload.
 */
export function normalizeTwilioCall(s: TwilioCallState): NormalizedCallEnd {
  let durationSec = s.durationSec;
  if (durationSec == null && s.startedAt && s.endedAt) {
    durationSec = (s.endedAt.getTime() - s.startedAt.getTime()) / 1000;
  }
  return {
    platform: 'twilio',
    platformCallId: s.callSid,
    fromNumber: toE164(s.from),
    toNumber: toE164(s.to),
    forwardedFrom: toE164(s.forwardedFrom),
    startedAt: s.startedAt,
    endedAt: s.endedAt,
    durationSec: durationSec == null ? null : Math.max(0, Math.round(durationSec)),
    endedReason: s.endedReason,
    recordingUrl: s.recordingUrl,
    transcript: s.transcript,
    platformSummary: null,
    answeredBy: s.answeredBy,
    answeredByName: s.answeredByName,
    parentCallId: null,
  };
}

/** Any stored call row → NormalizedCallEnd (pipeline re-runs, admin Reprocess). */
export function normalizeFromCallRow(row: Call): NormalizedCallEnd {
  return {
    platform: row.platform as VoicePlatform,
    platformCallId: row.platformCallId,
    fromNumber: row.fromNumber,
    toNumber: row.toNumber,
    forwardedFrom: row.forwardedFrom,
    startedAt: row.startedAt,
    endedAt: row.endedAt,
    durationSec: row.durationSec,
    endedReason: row.endedReason,
    recordingUrl: row.recordingUrl,
    transcript: row.transcript ?? [],
    platformSummary: null,
    answeredBy: row.answeredBy ?? (row.platform === 'twilio' ? 'none' : 'ai'),
    answeredByName: row.answeredByName,
    parentCallId: row.parentCallId,
  };
}
