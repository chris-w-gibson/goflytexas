import type { TranscriptTurn } from './types';

/** Loose OpenAI-style message as sent by Vapi's custom-LLM hook. */
export type OpenAiMessage = {
  role: string;
  content?: string | null | Array<unknown>;
};

export type AnthropicTurn = { role: 'user' | 'assistant'; content: string };

/** Flatten string or content-part arrays to plain text. */
export function flattenContent(content: OpenAiMessage['content']): string {
  if (typeof content === 'string') return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object') {
          const p = part as { type?: string; text?: string };
          if (p.type === 'text' && typeof p.text === 'string') return p.text;
        }
        return '';
      })
      .join(' ')
      .trim();
  }
  return '';
}

/** Synthetic first turn so the platform's spoken greeting stays in context. */
export const CALL_CONNECTED = '[Call connected.]';

/**
 * OpenAI-shaped history → Anthropic messages.
 * - drops system/tool/function roles (we bring our own system prompt)
 * - merges consecutive same-role turns
 * - keeps the platform's spoken greeting (a leading assistant turn) by
 *   prepending a synthetic "[Call connected.]" user turn — otherwise the model
 *   doesn't know it already greeted and says hello twice
 * - keeps the last `maxMessages`, still starting with a user turn
 */
export function toAnthropicMessages(
  messages: OpenAiMessage[],
  opts?: { maxMessages?: number },
): AnthropicTurn[] {
  const max = opts?.maxMessages ?? 32;
  const merged: AnthropicTurn[] = [];
  for (const m of messages) {
    if (m.role !== 'user' && m.role !== 'assistant') continue;
    const text = flattenContent(m.content);
    if (!text) continue;
    const last = merged[merged.length - 1];
    if (last && last.role === m.role) {
      last.content = `${last.content}\n${text}`;
    } else {
      merged.push({ role: m.role, content: text });
    }
  }
  if (merged.length && merged[0].role === 'assistant') {
    merged.unshift({ role: 'user', content: CALL_CONNECTED });
  }
  let out = merged.slice(-max);
  while (out.length && out[0].role !== 'user') out = out.slice(1);
  return out;
}

/** "Caller: …" / "Assistant: …" lines; the staff member's name replaces "Assistant" on human-answered calls. */
export function turnsToPlainText(
  turns: TranscriptTurn[],
  opts?: { assistantLabel?: string },
): string {
  const label = opts?.assistantLabel ?? 'Assistant';
  return turns.map((t) => `${t.role === 'user' ? 'Caller' : label}: ${t.text}`).join('\n');
}

const MIN_WORDS = 3;

/** True when the caller said at least one thing of ≥3 words. */
export function hasMeaningfulSpeech(turns: TranscriptTurn[]): boolean {
  return turns.some(
    (t) => t.role === 'user' && t.text.trim().split(/\s+/).filter(Boolean).length >= MIN_WORDS,
  );
}

/** True when anybody said anything at all. */
export function hasAnySpeech(turns: TranscriptTurn[]): boolean {
  return turns.some((t) => t.text.trim().length > 0);
}

export const NO_MESSAGE_MAX_SECONDS = 10;
export const HUMAN_NO_MESSAGE_MAX_SECONDS = 5;

/** AI-answered calls: hang-ups and robodials never become leads. */
export function classifyCall(input: {
  durationSec: number | null;
  turns: TranscriptTurn[];
}): 'no_message' | 'message' {
  if (input.durationSec != null && input.durationSec < NO_MESSAGE_MAX_SECONDS) return 'no_message';
  if (!hasMeaningfulSpeech(input.turns)) return 'no_message';
  return 'message';
}

/**
 * Human-answered calls: a short awkward real conversation still counts.
 * Only a near-instant drop or a recording nobody spoke on is "no message".
 */
export function classifyHumanCall(input: {
  durationSec: number | null;
  turns: TranscriptTurn[];
}): 'no_message' | 'message' {
  if (input.durationSec != null && input.durationSec < HUMAN_NO_MESSAGE_MAX_SECONDS) return 'no_message';
  if (!hasAnySpeech(input.turns)) return 'no_message';
  return 'message';
}
