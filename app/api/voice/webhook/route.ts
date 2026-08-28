import { NextResponse, type NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { vapiWebhookEnvelopeSchema } from '@/lib/voice/schemas';
import { processRawPayload } from '@/lib/voice/pipeline';

/**
 * Vapi server URL. Only `end-of-call-report` does work: it turns the finished
 * call into a lead + owner alert (lib/voice/pipeline.ts). Idempotent, so a
 * non-2xx response is safe — Vapi retries and the pipeline just resumes.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_BODY_BYTES = 1024 * 1024;

function secretMatches(provided: string | null | undefined, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function authorized(req: NextRequest): boolean {
  const expected = process.env.VOICE_WEBHOOK_SECRET;
  if (!expected) return false; // fail closed
  const auth = req.headers.get('authorization') ?? '';
  const bearer = /^bearer\s+/i.test(auth) ? auth.replace(/^bearer\s+/i, '').trim() : null;
  return (
    secretMatches(req.headers.get('x-vapi-secret'), expected) ||
    secretMatches(bearer, expected) ||
    secretMatches(req.nextUrl.searchParams.get('key'), expected)
  );
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
  const envelope = vapiWebhookEnvelopeSchema.safeParse(json);
  if (!envelope.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const type = envelope.data.message.type;
  if (type !== 'end-of-call-report') {
    return NextResponse.json({ ok: true, ignored: type });
  }

  try {
    const result = await processRawPayload('vapi', json);
    if ('ignored' in result) {
      return NextResponse.json({ error: result.ignored }, { status: 400 });
    }
    return NextResponse.json({ ok: true, callId: result.call.id, status: result.call.status });
  } catch (err) {
    console.error('voice webhook: processing failed', err);
    return NextResponse.json({ error: 'processing failed' }, { status: 500 });
  }
}
