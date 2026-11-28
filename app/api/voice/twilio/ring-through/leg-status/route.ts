import type { NextRequest } from 'next/server';
import { ringDeps } from '@/lib/voice/ringThroughDeps';
import { onLegEnded } from '@/lib/voice/ringThroughFlow';
import { empty, readTwilioRequest } from '@/lib/voice/twilioRequest';

/**
 * Status callback for the call we placed to a team member's cell. When that
 * call is over and they did not take the caller (no answer, busy, declined,
 * voicemail, or they picked up and did not press 1), the next person is rung,
 * or the caller is told nobody could be reached. A leg that ends after the
 * person took the call changes nothing here.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OVER = new Set(['completed', 'busy', 'failed', 'no-answer', 'canceled']);

export async function POST(req: NextRequest) {
  const r = await readTwilioRequest(req);
  if (!r.ok) return empty(r.status);
  const parentSid = r.query.get('parent') ?? '';
  const step = Number(r.query.get('step') ?? -1);
  if (!parentSid || !OVER.has(r.params.CallStatus ?? '')) return empty(204);
  await onLegEnded(ringDeps(), { parentSid, step }).catch((err) =>
    console.error('ring-through leg-status failed', parentSid, err),
  );
  return empty(204);
}
