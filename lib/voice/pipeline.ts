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
import { giveLeadToSafely, handOutLeadSafely, ownerOf } from '@/lib/rotationStore';
import { extractCall, fallbackExtraction, isRecentDuplicate, type ExtractionMode } from './extract';
import {
  normalizeFromCallRow,
  normalizeRetellCallEnded,
  normalizeVapiEndOfCall,
} from './normalize';
import { formatPhoneDisplay } from './phone';
import { ringOutcome, type RingOutcome } from './ringThrough';
import { testCallerFor } from './testCallerStore';
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
 * How a ring-through on this call ended, read from the caller's Twilio row
 * (the assistant's own row points at it). Null = the caller never asked for a
 * person, or left before anyone could take it.
 */
async function ringOutcomeFor(call: Call): Promise<RingOutcome | null> {
  try {
    if (call.platform === 'twilio') return ringOutcome(call.ringThrough);
    const parentSid = call.parentCallId ?? (await getCallById(call.id))?.parentCallId;
    return parentSid ? ringOutcome((await getCallByPlatformId(parentSid))?.ringThrough) : null;
  } catch (err) {
    console.error('voice pipeline: ring-through lookup failed', err);
    return null;
  }
}

/**
 * `real`: an admin said a call marked as a test was a real caller after all
 * (Calls page, "File as a real call"), so the own-phone check is stepped over.
 */
export type ProcessOpts = { real?: boolean };

/**
 * Turn a finished platform call (Vapi/Retell) into a lead + owner alert.
 * Idempotent: a retried webhook for a call that already produced a lead, or
 * was already filed as a test, returns immediately.
 */
export async function processCallEnd(
  n: NormalizedCallEnd,
  rawPayload: unknown,
  opts?: ProcessOpts,
): Promise<Call> {
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
  if (call.status === 'test' && !opts?.real) return call;

  try {
    return await processStoredCall(call, n, opts);
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
export async function processStoredCall(
  call: Call,
  n: NormalizedCallEnd,
  opts?: ProcessOpts,
): Promise<Call> {
  const human = n.answeredBy === 'human';
  const staffName = n.answeredByName ?? 'Staff';
  const mode: ExtractionMode = human ? { kind: 'human', staffName } : { kind: 'ai' };
  const notifyNoMessage = process.env.VOICE_NOTIFY_NO_MESSAGE === '1';
  const kind = human
    ? classifyHumanCall({ durationSec: n.durationSec, turns: n.transcript })
    : classifyCall({ durationSec: n.durationSec, turns: n.transcript });

  // One of our own phones trying the line (Jim 2026-11-27): the call stays in
  // Calls with its summary so it can be listened back, and nothing else
  // happens: no lead, no note on an old lead, no turn used, no email.
  const tester = opts?.real ? null : await testCallerFor(n.fromNumber);
  if (tester) {
    let heard: CallExtraction | null = null;
    if (kind !== 'no_message') {
      try {
        heard =
          (await countPipelineCallsSince(startOfUtcDay())) > dailyCallLimit()
            ? fallbackExtraction(n.transcript, n.fromNumber, mode)
            : await extractCall(getClient(), voiceModel(), n.transcript, n.fromNumber, mode);
      } catch (err) {
        console.error('voice pipeline: test call summary failed', err);
      }
    }
    await finalizeCall(call.id, {
      status: 'test',
      ...(heard ? { extracted: heard, summary: heard.summary } : {}),
      ...(human ? { transcriptionStatus: 'done' as const } : {}),
    });
    return (await getCallById(call.id)) ?? call;
  }

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
    extracted.preferredTime ? `Caller mentioned: ${extracted.preferredTime}` : null,
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

  // A call nobody answered is a lead like any other (Jim 2026-11-22: "the
  // phone calls we want to treat just like we're treating the internet leads…
  // the voicemail will go to them"): it goes to the next person in the
  // rotation. A repeat caller stays with whoever already has them. A call a
  // person answered is theirs already and is not handed out.
  //
  // A caller who asked for a person (Jim 2026-11-27): when somebody took the
  // call the lead is theirs, and whoever was rung first and did not pick up is
  // skipped; when nobody took it, everyone rung is skipped and the lead goes
  // to the next person after them.
  const ring = await ringOutcomeFor(call);
  let owner: Awaited<ReturnType<typeof ownerOf>> = null;
  if (ring?.kind === 'taken') {
    owner = lead.ownerId
      ? await ownerOf(lead)
      : ((await giveLeadToSafely(lead.id, ring.userId)) ?? (await handOutLeadSafely(lead.id)));
  } else if (!human) {
    owner = lead.ownerId
      ? await ownerOf(lead)
      : ring?.kind === 'missed'
        ? await handOutLeadSafely(lead.id, new Date(), { skip: ring.tried.map((p) => p.userId) })
        : await handOutLeadSafely(lead.id);
  }

  const fresh = (await getCallById(call.id)) ?? call;
  try {
    await sendAdminNotification(lead, {
      owner,
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
        putThroughTo: !human && ring?.kind === 'taken' ? ring.name : null,
        rangNoAnswer:
          ring?.kind === 'missed'
            ? ring.tried.map((p) => p.name)
            : ring?.kind === 'taken'
              ? ring.missed.map((p) => p.name)
              : [],
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
  opts?: { force?: boolean } & ProcessOpts,
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
      const call = await processStoredCall(fresh, normalizeFromCallRow(fresh), { real: opts?.real });
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
  opts?: ProcessOpts,
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
  const call = await processCallEnd(n, body, opts);
  return { call };
}
