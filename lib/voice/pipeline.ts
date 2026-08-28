import Anthropic from '@anthropic-ai/sdk';
import { db } from '@/lib/db';
import { leadNotes, type Call, type Lead } from '@/lib/db/schema';
import { countCallsSince, finalizeCall, getCallById, upsertCallEnded } from '@/lib/calls';
import { sendAdminNotification } from '@/lib/email';
import { createLead, findRecentLeadByPhone, recordEmailEvent } from '@/lib/leads';
import { extractCall, fallbackExtraction, isRecentDuplicate } from './extract';
import { normalizeRetellCallEnded, normalizeVapiEndOfCall } from './normalize';
import { formatPhoneDisplay } from './phone';
import { classifyCall } from './transcript';
import type { CallExtraction, NormalizedCallEnd, VoicePlatform } from './types';

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
 * Turn a finished call into a lead + owner alert. Idempotent: a retried
 * webhook for a call that already produced a lead returns immediately.
 */
export async function processCallEnd(n: NormalizedCallEnd, rawPayload: unknown): Promise<Call> {
  const call = await upsertCallEnded(n, rawPayload);
  if (call.status === 'processed' && call.leadId) return call;

  try {
    return await processStoredCall(call, n);
  } catch (err) {
    await finalizeCall(call.id, { status: 'failed' }).catch(() => undefined);
    throw err;
  }
}

async function processStoredCall(call: Call, n: NormalizedCallEnd): Promise<Call> {
  const notifyNoMessage = process.env.VOICE_NOTIFY_NO_MESSAGE === '1';
  const kind = classifyCall({ durationSec: n.durationSec, turns: n.transcript });

  let extracted: CallExtraction;
  if (kind === 'no_message') {
    if (!notifyNoMessage) {
      await finalizeCall(call.id, { status: 'no_message' });
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
    const overCap = (await countCallsSince(startOfUtcDay())) > dailyCallLimit();
    extracted = overCap
      ? fallbackExtraction(n.transcript, n.fromNumber)
      : await extractCall(getClient(), voiceModel(), n.transcript, n.fromNumber);
  }

  if (extracted.spam) {
    await finalizeCall(call.id, { status: 'spam', extracted, summary: extracted.summary });
    return (await getCallById(call.id)) ?? call;
  }

  const phone = formatPhoneDisplay(extracted.callbackPhone ?? n.fromNumber);
  const message = [
    extracted.summary,
    extracted.preferredTime ? `Best time to call back: ${extracted.preferredTime}` : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  let lead: Lead | undefined = phone ? await findRecentLeadByPhone(phone) : undefined;
  let repeat = false;
  if (lead && isRecentDuplicate(lead)) {
    repeat = true;
    // A repeat caller is the most urgent kind — note it, don't create a twin.
    // Direct insert (not markContacted): the AI is not a human touch.
    await db.insert(leadNotes).values({
      leadId: lead.id,
      authorName: AI_AUTHOR,
      body: `Called again ${whenCT(n.endedAt)}: ${extracted.summary}`,
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
      attribution: { utm_source: 'phone', utm_campaign: 'missed-call' },
    });
  }

  await finalizeCall(call.id, {
    status: kind === 'no_message' ? 'no_message' : 'processed',
    leadId: lead.id,
    summary: extracted.summary,
    extracted,
  });

  try {
    await sendAdminNotification(lead, {
      call: {
        id: call.id,
        durationSec: n.durationSec,
        fromNumber: n.fromNumber,
        summary: extracted.summary,
        recordingUrl: n.recordingUrl,
        repeat,
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

  return (await getCallById(call.id)) ?? call;
}

/** Normalize a raw platform payload and process it (webhook + admin Reprocess). */
export async function processRawPayload(
  platform: VoicePlatform,
  body: unknown,
): Promise<{ call: Call } | { ignored: string }> {
  const n = platform === 'retell' ? normalizeRetellCallEnded(body) : normalizeVapiEndOfCall(body);
  if (!n) return { ignored: 'no call id in payload' };
  const call = await processCallEnd(n, body);
  return { call };
}
