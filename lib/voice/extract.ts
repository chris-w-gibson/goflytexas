import type Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { toE164 } from './phone';
import { turnsToPlainText } from './transcript';
import { CALL_INTERESTS, type CallExtraction, type TranscriptTurn } from './types';

export type ExtractionMode = { kind: 'ai' } | { kind: 'human'; staffName: string };

export const callExtractionSchema = z.object({
  summary: z.string().max(600),
  callerName: z.string().max(120).nullable(),
  callbackPhone: z.string().max(24).nullable(),
  interest: z.enum(CALL_INTERESTS).nullable(),
  preferredTime: z.string().max(120).nullable(),
  spam: z.boolean(),
  spamReason: z.string().max(200).nullable(),
});

/** Human-answered calls also capture what was promised / agreed. */
export const humanCallExtractionSchema = callExtractionSchema.extend({
  followUps: z.array(z.string().max(200)).max(8),
  booking: z.string().max(200).nullable(),
});

const DAY_MS = 24 * 60 * 60 * 1000;

const INTEREST_RULE =
  '- interest: discovery (intro/discovery flight), private (private pilot training), instrument, commercial, rental (aircraft rental / flying club), tour (sightseeing / aerial tour), ferry, insurance (insurance checkout), biennial (flight review / BFR), other. null if unclear.';

export const EXTRACTION_SYSTEM = `You read the transcript of a phone call between a caller and the AI assistant of GoFlyTexas, a flight school and aircraft rental business at Aero Valley Airport in Roanoke, Texas. Produce a structured record for the owner who will call the person back.

Rules:
- summary: two or three sentences, third person, plain and specific. What they want, anything they asked about (prices, schedules, aircraft), and any commitment the assistant made. Never include the assistant's own filler.
- callerName: the caller's name as they gave it, properly capitalized; null if they never gave one.
- callbackPhone: ONLY if the caller stated a callback number that is different from the caller ID shown to you. Digits only. Otherwise null.
${INTEREST_RULE}
- preferredTime: the callback day/time in the caller's words, e.g. "Tuesday after 3pm"; null if none.
- spam: true for robocalls, recorded messages, sales pitches to the business, wrong numbers, pranks or abuse, or calls where the caller never expressed any interest in flying or the school. Give spamReason in a few words; otherwise null.
- Do not invent anything that is not in the transcript.`;

export function humanExtractionSystem(staffName: string): string {
  return `You read the transcript of a phone call between a caller and ${staffName}, a member of the GoFlyTexas team (an instructor or the owner). GoFlyTexas is a flight school and aircraft rental business at Aero Valley Airport in Roanoke, Texas. ${staffName} answered this call live, so nothing needs to be "called back" unless someone said so on the call. Lines are labelled "Caller:" and "${staffName}:". The transcript is machine-generated from a phone recording: names, numbers and aviation terms may be misheard, so prefer whatever the caller confirmed or spelled out. Produce a structured record for the team's lead list.

Rules:
- summary: two or three sentences, third person, plain and specific: who called, what they wanted, what ${staffName} told them (prices, availability, requirements, aircraft), and how the call ended. No small talk, no filler.
- followUps: every concrete commitment or open item, one short line each, most urgent first. Include anything ${staffName} promised to do ("send the rate sheet", "check Saturday availability"), anything the caller said they would do ("call back after payday", "email a copy of their logbook"), and anything that needs to go on the schedule. Empty array if there are none.
- booking: if a flight, lesson, checkout, tour or visit was agreed with a day and/or time, one line like "Discovery flight, Sat Sep 6, 10am"; otherwise null.
- callerName: the caller's name as given, properly capitalized; null if never given. Do not use a name ${staffName} only guessed.
- callbackPhone: ONLY if the caller stated a number different from the caller ID shown to you. Digits only. Otherwise null.
${INTEREST_RULE} Current students and renters are not "other": pick what the call was about.
- preferredTime: when the caller wants to fly, visit, or be called, in their words; null if none.
- spam: true only for robocalls, vendors or recruiters pitching the business, wrong numbers, pranks or abuse. A short, awkward or unfinished call with a real prospect is NOT spam. Give spamReason in a few words; otherwise null.
- Do not invent anything that is not in the transcript.`;
}

export function extractionSystemFor(mode: ExtractionMode): string {
  return mode.kind === 'human' ? humanExtractionSystem(mode.staffName) : EXTRACTION_SYSTEM;
}

export function schemaFor(mode: ExtractionMode) {
  return mode.kind === 'human' ? humanCallExtractionSchema : callExtractionSchema;
}

function clean(input: CallExtraction, callerId: string | null): CallExtraction {
  const callback = toE164(input.callbackPhone);
  const followUps = (input.followUps ?? []).map((s) => s.trim()).filter(Boolean).slice(0, 8);
  return {
    summary: input.summary.trim(),
    callerName: input.callerName?.trim() || null,
    callbackPhone: callback && callback !== toE164(callerId) ? callback : null,
    interest: input.interest,
    preferredTime: input.preferredTime?.trim() || null,
    spam: input.spam,
    spamReason: input.spam ? input.spamReason?.trim() || 'flagged' : null,
    ...(input.followUps !== undefined ? { followUps } : {}),
    ...(input.booking !== undefined ? { booking: input.booking?.trim() || null } : {}),
  };
}

/** Deterministic stand-in when the model is unavailable or over budget. */
export function fallbackExtraction(
  turns: TranscriptTurn[],
  callerId: string | null,
  mode: ExtractionMode = { kind: 'ai' },
): CallExtraction {
  const said = turns
    .filter((t) => t.role === 'user')
    .map((t) => t.text.trim())
    .join(' ')
    .slice(0, 400);
  const prefix = mode.kind === 'human' ? `${mode.staffName} answered. ` : '';
  return clean(
    {
      summary: said ? `${prefix}Caller said: "${said}"` : `${prefix}Caller left no clear message.`,
      callerName: null,
      callbackPhone: null,
      interest: null,
      preferredTime: null,
      spam: false,
      spamReason: null,
      ...(mode.kind === 'human' ? { followUps: [], booking: null } : {}),
    },
    callerId,
  );
}

/** One lead per phone number per window; repeat calls become notes instead. */
export function isRecentDuplicate(
  lead: { createdAt: Date },
  now: Date = new Date(),
  windowMs: number = DAY_MS,
): boolean {
  const age = now.getTime() - lead.createdAt.getTime();
  return age >= 0 && age < windowMs;
}

function userPrompt(turns: TranscriptTurn[], callerId: string | null, mode: ExtractionMode): string {
  const text = turnsToPlainText(turns, {
    assistantLabel: mode.kind === 'human' ? mode.staffName : 'Assistant',
  });
  return `Caller ID: ${callerId ?? 'unknown'}\n\nTranscript:\n${text}`;
}

/**
 * Structured extraction with Claude. Tries structured outputs first, then a
 * forced strict tool, then the deterministic fallback — never throws.
 */
export async function extractCall(
  client: Anthropic,
  model: string,
  turns: TranscriptTurn[],
  callerId: string | null,
  mode: ExtractionMode = { kind: 'ai' },
): Promise<CallExtraction> {
  const system = extractionSystemFor(mode);
  const schema = schemaFor(mode);
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: userPrompt(turns, callerId, mode) },
  ];

  try {
    const msg = await client.messages.parse({
      model,
      max_tokens: 900,
      system,
      messages,
      output_config: { format: zodOutputFormat(schema) },
    });
    if (msg.parsed_output) return clean(msg.parsed_output as CallExtraction, callerId);
  } catch (err) {
    console.warn('voice extract: structured output failed, trying tool', err);
  }

  try {
    const msg = await client.messages.create({
      model,
      max_tokens: 900,
      system,
      messages,
      tools: [
        {
          name: 'record_call_extraction',
          description: 'Record the structured summary of the call.',
          input_schema: z.toJSONSchema(schema) as Anthropic.Tool['input_schema'],
        },
      ],
      tool_choice: { type: 'tool', name: 'record_call_extraction' },
    });
    const block = msg.content.find((b) => b.type === 'tool_use');
    const parsed = schema.safeParse(block && 'input' in block ? block.input : null);
    if (parsed.success) return clean(parsed.data as CallExtraction, callerId);
  } catch (err) {
    console.warn('voice extract: tool fallback failed', err);
  }

  return fallbackExtraction(turns, callerId, mode);
}
