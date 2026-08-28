import type Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { toE164 } from './phone';
import { turnsToPlainText } from './transcript';
import { CALL_INTERESTS, type CallExtraction, type TranscriptTurn } from './types';

export const callExtractionSchema = z.object({
  summary: z.string().max(600),
  callerName: z.string().max(120).nullable(),
  callbackPhone: z.string().max(24).nullable(),
  interest: z.enum(CALL_INTERESTS).nullable(),
  preferredTime: z.string().max(120).nullable(),
  spam: z.boolean(),
  spamReason: z.string().max(200).nullable(),
});

const DAY_MS = 24 * 60 * 60 * 1000;

export const EXTRACTION_SYSTEM = `You read the transcript of a phone call between a caller and the AI assistant of GoFlyTexas, a flight school and aircraft rental business at Aero Valley Airport in Roanoke, Texas. Produce a structured record for the owner who will call the person back.

Rules:
- summary: two or three sentences, third person, plain and specific. What they want, anything they asked about (prices, schedules, aircraft), and any commitment the assistant made. Never include the assistant's own filler.
- callerName: the caller's name as they gave it, properly capitalized; null if they never gave one.
- callbackPhone: ONLY if the caller stated a callback number that is different from the caller ID shown to you. Digits only. Otherwise null.
- interest: discovery (intro/discovery flight), private (private pilot training), instrument, commercial, rental (aircraft rental / flying club), tour (sightseeing / aerial tour), ferry, insurance (insurance checkout), biennial (flight review / BFR), other. null if unclear.
- preferredTime: the callback day/time in the caller's words, e.g. "Tuesday after 3pm"; null if none.
- spam: true for robocalls, recorded messages, sales pitches to the business, wrong numbers, pranks or abuse, or calls where the caller never expressed any interest in flying or the school. Give spamReason in a few words; otherwise null.
- Do not invent anything that is not in the transcript.`;

function clean(input: CallExtraction, callerId: string | null): CallExtraction {
  const callback = toE164(input.callbackPhone);
  return {
    summary: input.summary.trim(),
    callerName: input.callerName?.trim() || null,
    callbackPhone: callback && callback !== toE164(callerId) ? callback : null,
    interest: input.interest,
    preferredTime: input.preferredTime?.trim() || null,
    spam: input.spam,
    spamReason: input.spam ? input.spamReason?.trim() || 'flagged' : null,
  };
}

/** Deterministic stand-in when the model is unavailable or over budget. */
export function fallbackExtraction(turns: TranscriptTurn[], callerId: string | null): CallExtraction {
  const said = turns
    .filter((t) => t.role === 'user')
    .map((t) => t.text.trim())
    .join(' ')
    .slice(0, 400);
  return clean(
    {
      summary: said ? `Caller said: "${said}"` : 'Caller left no clear message.',
      callerName: null,
      callbackPhone: null,
      interest: null,
      preferredTime: null,
      spam: false,
      spamReason: null,
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

function userPrompt(turns: TranscriptTurn[], callerId: string | null): string {
  return `Caller ID: ${callerId ?? 'unknown'}\n\nTranscript:\n${turnsToPlainText(turns)}`;
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
): Promise<CallExtraction> {
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: userPrompt(turns, callerId) }];

  try {
    const msg = await client.messages.parse({
      model,
      max_tokens: 800,
      system: EXTRACTION_SYSTEM,
      messages,
      output_config: { format: zodOutputFormat(callExtractionSchema) },
    });
    if (msg.parsed_output) return clean(msg.parsed_output, callerId);
  } catch (err) {
    console.warn('voice extract: structured output failed, trying tool', err);
  }

  try {
    const msg = await client.messages.create({
      model,
      max_tokens: 800,
      system: EXTRACTION_SYSTEM,
      messages,
      tools: [
        {
          name: 'record_call_extraction',
          description: 'Record the structured summary of the call.',
          input_schema: z.toJSONSchema(callExtractionSchema) as Anthropic.Tool['input_schema'],
        },
      ],
      tool_choice: { type: 'tool', name: 'record_call_extraction' },
    });
    const block = msg.content.find((b) => b.type === 'tool_use');
    const parsed = callExtractionSchema.safeParse(block && 'input' in block ? block.input : null);
    if (parsed.success) return clean(parsed.data, callerId);
  } catch (err) {
    console.warn('voice extract: tool fallback failed', err);
  }

  return fallbackExtraction(turns, callerId);
}
