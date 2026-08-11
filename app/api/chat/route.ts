import { NextResponse, type NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { getActiveKnowledge } from '@/lib/botKnowledge';
import { logChatTurn } from '@/lib/chatLog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CHAT_MODEL = process.env.CHAT_MODEL ?? 'claude-haiku-4-5';
const MAX_TOKENS = 1024;
/** Server-side cap on conversation turns sent to the model. */
const MAX_HISTORY = 20;
/** Hard cap on messages per session — the widget enforces it too. */
const MAX_SESSION_MESSAGES = 30;
/** Per-IP sliding window: max requests per window. */
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 5 * 60 * 1000;
const MAX_BODY_BYTES = 32 * 1024;

// In-memory per-IP limiter. Fine at this traffic on Railway's single instance;
// swap for Redis if the app ever scales horizontally.
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_WINDOW_MS;
  const prev = (hits.get(ip) ?? []).filter((t) => t > windowStart);
  if (prev.length >= RATE_LIMIT) {
    hits.set(ip, prev);
    return true;
  }
  prev.push(now);
  hits.set(ip, prev);
  if (hits.size > 10_000) {
    // Bounded memory: drop windows that have fully expired.
    hits.forEach((times, key) => {
      if (times.every((t) => t <= windowStart)) hits.delete(key);
    });
  }
  return false;
}

const chatSchema = z.object({
  sessionId: z.string().uuid().optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(MAX_SESSION_MESSAGES),
});

const PERSONA = `You are the friendly front-desk assistant on the GoFlyTexas website. GoFlyTexas is a flight school and aircraft rental business at Aero Valley Airport (52F) in Roanoke, Texas, serving the Dallas–Fort Worth area.

Rules you must follow:
- Answer ONLY from the reference documents provided below. They are the sole source of truth.
- If the documents don't cover a question, or you're unsure, say so plainly and suggest reaching out: the visitor can use the "Talk to a human" option in this chat to leave their name, email, and phone, or call (940) 905-3090.
- Never invent prices, availability, policies, or requirements. Never speculate.
- Be warm and helpful, not pushy. Keep answers short — a few sentences unless the question genuinely needs more.
- Write like a friendly person texting, not a brochure: plain sentences, contractions, no markdown. Never use asterisks, bold, headers, or bullet-point lists — weave things into natural sentences instead ("We offer private pilot, instrument, and commercial training..."). One short paragraph is almost always enough.
- Gently encourage visitors to leave their contact info so the team can follow up, especially when they show interest in a discovery flight, lessons, or rentals.
- If asked whether you are an AI: yes, you're an AI assistant for GoFlyTexas.
- Politely decline requests unrelated to GoFlyTexas (homework, general chat, other businesses).`;

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }
  client ??= new Anthropic();
  return client;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many messages — please wait a few minutes.' },
      { status: 429 },
    );
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Request too large' }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const history = parsed.data.messages.slice(-MAX_HISTORY);

  const knowledge = await getActiveKnowledge();
  const knowledgeText =
    knowledge.length === 0
      ? 'No reference documents have been uploaded yet. Tell the visitor you cannot answer detailed questions right now and point them to the contact options.'
      : knowledge
          .map((doc) => `<document title="${doc.title}">\n${doc.content}\n</document>`)
          .join('\n\n');

  let stream: ReturnType<Anthropic['messages']['stream']>;
  try {
    // System prompt order matters for prompt caching: stable persona first,
    // then the knowledge block (deterministic doc order) carrying the cache
    // breakpoint. Repeat visitors hit the cache until a document changes.
    stream = getClient().messages.stream({
      model: CHAT_MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        { type: 'text', text: PERSONA },
        {
          type: 'text',
          text: `Reference documents:\n\n${knowledgeText}`,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: history,
    });
  } catch (err) {
    console.error('chat: failed to start stream', err);
    return NextResponse.json(
      { error: 'Chat is unavailable right now. Please use the contact form.' },
      { status: 503 },
    );
  }

  const lastUser = [...history].reverse().find((m) => m.role === 'user');
  let assistantText = '';

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
      const safeClose = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          // already closed by the runtime
        }
      };
      stream.on('text', (delta: string) => {
        assistantText += delta;
        safeEnqueue(delta);
      });
      stream.on('error', (err: unknown) => {
        console.error('chat: stream error', err);
        safeEnqueue(
          '\n\nSorry — something went wrong on my end. Please try again or use the contact form.',
        );
        safeClose();
      });
      stream.on('end', () => {
        safeClose();
        // Fire-and-forget transcript logging — never blocks the reply.
        if (lastUser && assistantText) {
          void logChatTurn(parsed.data.sessionId, lastUser.content, assistantText);
        }
      });
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
