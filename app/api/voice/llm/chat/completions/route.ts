import { NextResponse, type NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { timingSafeEqual } from 'node:crypto';
import { buildKnowledgeBlock } from '@/lib/botKnowledge';
import { upsertCallStarted } from '@/lib/calls';
import { completionJson, SSE_DONE, sseChunk } from '@/lib/voice/openaiSse';
import { formatSpoken, toE164 } from '@/lib/voice/phone';
import { openAiChatRequestSchema } from '@/lib/voice/schemas';
import { toAnthropicMessages } from '@/lib/voice/transcript';
import {
  VOICE_CAP_MESSAGE,
  VOICE_ERROR_MESSAGE,
  callContextNote,
  voiceMaxTurns,
  voiceSystemBlocks,
  wrapUpInstruction,
} from '@/lib/voicePersona';

/**
 * Vapi "custom LLM" hook — OpenAI chat-completions compatible, streaming SSE.
 * Vapi appends /chat/completions to the configured base URL
 * (https://www.goflytexas.com/api/voice/llm). The brain is Claude with the
 * spoken persona + the same bot_documents knowledge block as the web chat.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_BODY_BYTES = 256 * 1024;
const MAX_TOKENS = 300;
const MODEL_NAME = 'goflytexas-voice';

function voiceModel(): string {
  return process.env.VOICE_MODEL ?? process.env.CHAT_MODEL ?? 'claude-haiku-4-5';
}

function secretMatches(provided: string | null | undefined, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function authorized(req: NextRequest): boolean {
  const expected = process.env.VOICE_LLM_SECRET;
  if (!expected) return false; // fail closed
  const auth = req.headers.get('authorization') ?? '';
  const bearer = /^bearer\s+/i.test(auth) ? auth.replace(/^bearer\s+/i, '').trim() : null;
  return secretMatches(bearer, expected) || secretMatches(req.headers.get('x-vapi-secret'), expected);
}

// Vapi resends the FULL conversation on every request and (as observed live)
// sends no call id, so per-call state is derived from the history itself:
// the turn number is "assistant turns so far + 1", and a request with zero
// assistant turns beyond the spoken greeting is the first turn of a new call.
function turnNumber(history: Array<{ role: 'user' | 'assistant' }>): number {
  return history.filter((m) => m.role === 'assistant').length; // greeting counts as turn 0's reply
}

// Daily cap: count first-turn requests (exactly one per call). In-memory —
// single Railway instance, same trade-off as the chat route.
let dailyDate = '';
let dailyFirstTurns = 0;

function dailyCapExceeded(isFirstTurn: boolean): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== dailyDate) {
    dailyDate = today;
    dailyFirstTurns = 0;
  }
  const limit = Number(process.env.VOICE_DAILY_CALL_LIMIT ?? 60);
  const cap = Number.isFinite(limit) && limit > 0 ? limit : 60;
  if (isFirstTurn) {
    if (dailyFirstTurns >= cap) return true;
    dailyFirstTurns += 1;
  }
  return false;
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set');
  client ??= new Anthropic();
  return client;
}

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Accel-Buffering': 'no',
  Connection: 'keep-alive',
};

/** A canned line, in whichever shape the caller asked for. */
function fixedResponse(text: string, streaming: boolean, id: string): Response {
  if (!streaming) return NextResponse.json(completionJson(id, MODEL_NAME, text));
  const body = sseChunk(id, MODEL_NAME, text, null) + sseChunk(id, MODEL_NAME, null, 'stop') + SSE_DONE;
  return new Response(body, { headers: SSE_HEADERS });
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Request too large' }, { status: 413 });
  }
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = openAiChatRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const body = parsed.data;
  const streaming = body.stream !== false;
  const loose = json as Record<string, unknown>;
  const meta = (loose.metadata ?? {}) as Record<string, unknown>;
  // Vapi's request carries no call id by default; the assistant's model.headers
  // are configured with template variables ({{call.id}}, {{customer.number}})
  // in the hope Vapi interpolates them — the route works either way.
  const templated = (v: string | null) => (v && !/^\{\{.*\}\}$/.test(v) ? v : null);
  const callId =
    body.call?.id ??
    (typeof meta.callId === 'string' ? meta.callId : null) ??
    templated(req.headers.get('x-vapi-call-id')) ??
    templated(req.headers.get('x-call-id')) ??
    'unknown';
  const id = `chatcmpl-${callId === 'unknown' ? 'call' : callId}-${Date.now()}`;
  const customer = (loose.customer ?? {}) as Record<string, unknown>;
  const callerE164 = toE164(
    body.call?.customer?.number ??
      (typeof customer.number === 'string' ? customer.number : null) ??
      templated(req.headers.get('x-customer-number')),
  );

  const maxTurns = voiceMaxTurns();
  const history = toAnthropicMessages(body.messages, { maxMessages: 2 * maxTurns });
  const turn = turnNumber(history);
  if (turn <= 1) {
    // Diagnostic: what Vapi actually sends besides messages (names only, no content).
    console.log(
      'voice llm request shape',
      JSON.stringify({
        bodyKeys: Object.keys(loose).filter((k) => k !== 'messages'),
        callKeys: body.call ? Object.keys(body.call) : null,
        headerNames: Array.from(req.headers.keys()).filter((h) => h.startsWith('x-')),
        callId,
        hasCaller: !!callerE164,
      }),
    );
    if (callId !== 'unknown') {
      // Make the call visible in admin even if the end-of-call webhook never lands.
      void upsertCallStarted({
        platform: 'vapi',
        platformCallId: callId,
        fromNumber: callerE164,
        toNumber: toE164(body.call?.phoneNumber?.number ?? null),
      }).catch((err) => console.error('voice llm: upsertCallStarted failed', err));
    }
  }
  if (dailyCapExceeded(turn <= 1)) {
    return fixedResponse(VOICE_CAP_MESSAGE, streaming, id);
  }

  if (history.length === 0 || history[history.length - 1].role !== 'user') {
    return fixedResponse("Sorry, I didn't catch that. What can I help you with?", streaming, id);
  }
  // Volatile context rides on the last user turn so the cached system prefix
  // stays byte-identical across turns and calls.
  const notes = [callContextNote({ callerSpoken: formatSpoken(callerE164), turn, maxTurns })];
  if (turn >= maxTurns) notes.push(wrapUpInstruction('turns'));
  const last = history[history.length - 1];
  last.content = `${notes.join(' ')}\n${last.content}`;

  let stream: ReturnType<Anthropic['messages']['stream']>;
  try {
    const knowledge = await buildKnowledgeBlock();
    stream = getClient().messages.stream({
      model: voiceModel(),
      max_tokens: MAX_TOKENS,
      system: voiceSystemBlocks(knowledge),
      messages: history,
    });
  } catch (err) {
    console.error('voice llm: failed to start stream', err);
    return fixedResponse(VOICE_ERROR_MESSAGE, streaming, id);
  }

  stream.on('finalMessage', (m: Anthropic.Message) => {
    // cache_read_input_tokens > 0 on the 2nd turn proves the prefix cache works.
    console.log('voice llm usage', callId, turn, JSON.stringify(m.usage));
  });

  if (!streaming) {
    try {
      const final = await stream.finalMessage();
      const text = final.content
        .map((b: Anthropic.ContentBlock) => (b.type === 'text' ? b.text : ''))
        .join('')
        .trim();
      return NextResponse.json(completionJson(id, MODEL_NAME, text || VOICE_ERROR_MESSAGE));
    } catch (err) {
      console.error('voice llm: completion failed', err);
      return NextResponse.json(completionJson(id, MODEL_NAME, VOICE_ERROR_MESSAGE));
    }
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;
      const safeEnqueue = (text: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(text));
        } catch {
          closed = true;
        }
      };
      const finish = () => {
        safeEnqueue(sseChunk(id, MODEL_NAME, null, 'stop'));
        safeEnqueue(SSE_DONE);
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          // already closed by the runtime
        }
      };
      stream.on('text', (delta: string) => {
        safeEnqueue(sseChunk(id, MODEL_NAME, delta, null));
      });
      stream.on('error', (err: unknown) => {
        // Barge-in: Vapi drops the request when the caller interrupts, which
        // surfaces here as an abort. Expected — close quietly.
        const msg = err instanceof Error ? err.message : String(err);
        if (/abort/i.test(msg) || (err as { name?: string })?.name === 'AbortError') {
          finish();
          return;
        }
        console.error('voice llm: stream error', err);
        safeEnqueue(sseChunk(id, MODEL_NAME, ` ${VOICE_ERROR_MESSAGE}`, null));
        finish();
      });
      stream.on('end', finish);
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, { headers: SSE_HEADERS });
}
