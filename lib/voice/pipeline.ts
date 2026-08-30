import Anthropic from '@anthropic-ai/sdk';
import type { Call, Lead } from '@/lib/db/schema';
import {
  claimTranscription,
  countPipelineCallsSince,
  finalizeCall,
  getCallById,
  getCallByPlatformId,
  linkChildCall,
  upsertCallEnded,
  upsertTwilioCall,
} from '@/lib/calls';
import { sendAdminNotification } from '@/lib/email';
import {
  addLeadNote,
  createLead,
  findRecentLeadByPhone,
  markContactedAt,
  recordEmailEvent,
} from '@/lib/leads';
import { extractCall, fallbackExtraction, isRecentDuplicate, type ExtractionMode } from './extract';
import {
  normalizeFromCallRow,
  normalizeRetellCallEnded,
  normalizeVapiEndOfCall,
} from './normalize';
import { formatPhoneDisplay } from './phone';
import { classifyCall, classifyHumanCall } from './transcript';
import { transcribeRecording, twilioTranscribeOpts } from './transcribe';
import { recordingLink } from './twilio';
import {
  TERMINAL_CALL_STATUSES,
  type CallExtraction,
  type CallStatus,
  type NormalizedCallEnd,
  type VoicePlatform,
} from './types';

export function voiceModel(): string {
  return process.env.VOICE_MODEL ?? process.env.CHAT_MODEL ?? 'claude-haiku-4-5';
}

export function dailyCallLimit(): number {
  const n = Number(process.env.VOICE_DAILY_CALL_LIMIT ?? 60);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 60;
}

export function startOfUtcDay(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.goflytexas.com').replace(/\/+$/, '');
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set');
  client ??= new Anthropic();
  return client;
}

function whenCT(d: Date | null): string {
  return (d ?? new Date()).toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const AI_AUTHOR = 'AI phone agent';

/**
 * Turn a finished platform call (Vapi/Retell) into a lead + owner alert.
 * Idempotent: a retried webhook for a call that already produced a lead
 * returns immediately.
 */
export async function processCallEnd(n: NormalizedCallEnd, rawPayload: unknown): Promise<Call> {
  const call = await upsertCallEnded(n, rawPayload);

  if (n.platform !== 'twilio') {
    // A Vapi call that Twilio handed off has a parent row; link them so the
    // admin shows one physical call and nothing is double-counted.
    await linkChildCall({
      childPlatformCallId: n.platformCallId,
      explicitParentSid: n.parentCallId,
      fromNumber: n.fromNumber,
      startedAt: n.startedAt ?? call.startedAt,
    }).catch((err) => console.error('voice pipeline: linkChildCall failed', err));
  }

  if (call.status === 'processed' && call.leadId) return call;

  try {
    return await processStoredCall(call, n);
  } catch (err) {
    await finalizeCall(call.id, { status: 'failed' }).catch(() => undefined);
    throw err;
  }
}

/**
 * The single post-call brain. Branches on who answered:
 * - ai:    AI-shaped no-message/spam heuristics, "Missed call" alert with ack
 * - human: gentler classifier, staff-aware extraction, lead stamped as a human
 *          touch at call end, "Answered by …" alert without the ack button
 */
export async function processStoredCall(call: Call, n: NormalizedCallEnd): Promise<Call> {
  const human = n.answeredBy === 'human';
  const staffName = n.answeredByName ?? 'Staff';
  const mode: ExtractionMode = human ? { kind: 'human', staffName } : { kind: 'ai' };
  const notifyNoMessage = process.env.VOICE_NOTIFY_NO_MESSAGE === '1';
  const kind = human
    ? classifyHumanCall({ durationSec: n.durationSec, turns: n.transcript })
    : classifyCall({ durationSec: n.durationSec, turns: n.transcript });

  let extracted: CallExtraction;
  if (kind === 'no_message') {
    if (human || !notifyNoMessage) {
      await finalizeCall(call.id, {
        status: 'no_message',
        ...(human ? { transcriptionStatus: 'done' as const } : {}),
      });
      return (await getCallById(call.id)) ?? call;
    }
    extracted = {
      summary: 'Missed call, no message left.',
      callerName: null,
      callbackPhone: null,
      interest: null,
      preferredTime: null,
      spam: false,
      spamReason: null,
    };
  } else {
    const overCap = (await countPipelineCallsSince(startOfUtcDay())) > dailyCallLimit();
    extracted = overCap
      ? fallbackExtraction(n.transcript, n.fromNumber, mode)
      : await extractCall(getClient(), voiceModel(), n.transcript, n.fromNumber, mode);
  }

  if (extracted.spam) {
    await finalizeCall(call.id, {
      status: 'spam',
      extracted,
      summary: extracted.summary,
      ...(human ? { transcriptionStatus: 'done' as const } : {}),
    });
    return (await getCallById(call.id)) ?? call;
  }

  const phone = formatPhoneDisplay(extracted.callbackPhone ?? n.fromNumber);
  const followUps = extracted.followUps ?? [];
  const message = [
    extracted.summary,
    extracted.booking ? `Booked: ${extracted.booking}` : null,
    followUps.length ? `Follow-ups:\n${followUps.map((f) => `- ${f}`).join('\n')}` : null,
    extracted.preferredTime ? `Best time: ${extracted.preferredTime}` : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  // "Recent" is judged against the call itself, not the wall clock, so a
  // reprocessed or late-arriving call dedupes the same way it would have live.
  const callTime = n.endedAt ?? n.startedAt ?? new Date();
  let lead: Lead | undefined = phone
    ? await findRecentLeadByPhone(phone, new Date(callTime.getTime() - 24 * 60 * 60 * 1000))
    : undefined;
  let repeat = false;
  if (lead && isRecentDuplicate(lead, callTime)) {
    repeat = true;
    // Repeat caller within a day — note it on the existing lead, no twin.
    await addLeadNote({
      leadId: lead.id,
      authorName: human ? `${staffName} (phone)` : AI_AUTHOR,
      body: human
        ? `Answered by ${staffName} ${whenCT(n.endedAt)}: ${extracted.summary}${
            followUps.length ? `\nFollow-ups: ${followUps.join('; ')}` : ''
          }`
        : `Called again ${whenCT(n.endedAt)}: ${extracted.summary}`,
    });
  } else {
    lead = await createLead({
      name: extracted.callerName ?? 'Unknown caller',
      email: null,
      phone,
      flightInterest: extracted.interest,
      preferredContact: 'phone',
      message,
      source: 'phone',
      attribution: { utm_source: 'phone', utm_campaign: human ? 'answered-call' : 'missed-call' },
      // A lead filed from a live-answered call existed from the moment the
      // phone rang; otherwise its first response would predate its creation.
      ...(human && n.startedAt ? { createdAt: n.startedAt } : {}),
    });
  }

  if (human) {
    // The human already spoke to them: that IS the first response.
    await markContactedAt(lead.id, n.endedAt ?? n.startedAt ?? new Date());
  }

  await finalizeCall(call.id, {
    status: kind === 'no_message' ? 'no_message' : 'processed',
    leadId: lead.id,
    summary: extracted.summary,
    extracted,
    ...(human ? { transcriptionStatus: 'done' as const } : {}),
  });

  const fresh = (await getCallById(call.id)) ?? call;
  try {
    await sendAdminNotification(lead, {
      call: {
        id: call.id,
        durationSec: n.durationSec,
        fromNumber: n.fromNumber,
        summary: extracted.summary,
        recordingUrl: recordingLink(fresh, siteUrl()),
        repeat,
        answeredBy: human ? 'human' : 'ai',
        answeredByName: n.answeredByName,
        followUps,
        booking: extracted.booking ?? null,
      },
    });
    await recordEmailEvent({ leadId: lead.id, kind: 'admin_notify' });
  } catch (err) {
    await recordEmailEvent({
      leadId: lead.id,
      kind: 'admin_notify',
      error: String(err instanceof Error ? err.message : err),
    });
  }

  return fresh;
}

const inFlight = new Map<string, Promise<{ call: Call } | { skipped: string }>>();

/**
 * Human-answered Twilio call: transcribe the dual-channel recording, then run
 * the brain. Idempotent via the transcription_status claim; `force` re-runs a
 * finished row (admin Reprocess).
 */
export async function processTwilioCall(
  callSid: string,
  opts?: { force?: boolean },
): Promise<{ call: Call } | { skipped: string }> {
  const existing = inFlight.get(callSid);
  if (existing) return existing;
  const job = (async () => {
    const row = await getCallByPlatformId(callSid);
    if (!row || row.platform !== 'twilio') return { skipped: 'unknown call' };
    if (row.answeredBy !== 'human') return { skipped: 'not human-answered' };
    if (!opts?.force && TERMINAL_CALL_STATUSES.has(row.status as CallStatus)) {
      return { skipped: `already ${row.status}` };
    }
    if (!row.recordingUrl) return { skipped: 'no recording yet' };
    if (opts?.force) await upsertTwilioCall({ callSid, transcriptionStatus: 'pending' });

    const claimed = await claimTranscription(callSid);
    if (!claimed) return { skipped: 'transcription already running or done' };

    try {
      let fresh = claimed;
      if (opts?.force || !fresh.transcript?.length) {
        const { turns, raw } = await transcribeRecording(fresh.recordingUrl!, twilioTranscribeOpts());
        fresh = await upsertTwilioCall({
          callSid,
          transcript: turns,
          event: { name: 'deepgram', payload: raw },
        });
      }
      const call = await processStoredCall(fresh, normalizeFromCallRow(fresh));
      return { call };
    } catch (err) {
      await finalizeCall(claimed.id, { status: 'failed', transcriptionStatus: 'failed' }).catch(
        () => undefined,
      );
      throw err;
    }
  })();
  inFlight.set(callSid, job);
  try {
    return await job;
  } finally {
    inFlight.delete(callSid);
  }
}

/** Normalize a raw platform payload and process it (webhook + admin Reprocess). */
export async function processRawPayload(
  platform: VoicePlatform,
  body: unknown,
): Promise<{ call: Call } | { ignored: string }> {
  let n: NormalizedCallEnd | null;
  switch (platform) {
    case 'vapi':
      n = normalizeVapiEndOfCall(body);
      break;
    case 'retell':
      n = normalizeRetellCallEnded(body);
      break;
    case 'twilio':
      throw new Error('twilio rows are rebuilt from stored state; use processTwilioCall');
    default:
      return { ignored: `unknown platform ${String(platform)}` };
  }
  if (!n) return { ignored: 'no call id in payload' };
  const call = await processCallEnd(n, body);
  return { call };
}
