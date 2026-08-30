import type { NextRequest } from 'next/server';
import { upsertTwilioCall } from '@/lib/calls';
import { processTwilioCall } from '@/lib/voice/pipeline';
import { empty, readTwilioRequest } from '@/lib/voice/twilioRequest';

/**
 * <Dial recordingStatusCallback>. The dual-channel recording is ready →
 * store it and kick off transcription + the post-call brain in the
 * background. Respond immediately: Twilio gives webhooks 15 s, Deepgram on
 * a long call takes longer. Idempotent via the transcription claim.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const r = await readTwilioRequest(req);
  if (!r.ok) return empty(r.status);
  const p = r.params;
  const callSid = p.CallSid;
  if (!callSid || p.RecordingStatus !== 'completed' || !p.RecordingSid) return empty(204);

  const duration = Number(p.RecordingDuration);
  await upsertTwilioCall({
    callSid,
    recordingSid: p.RecordingSid,
    recordingUrl: p.RecordingUrl ?? null,
    durationSec: Number.isFinite(duration) ? duration : null,
    event: { name: 'recording', payload: p },
  }).catch((err) => console.error('twilio recording: upsert failed', err));

  void processTwilioCall(callSid).catch((err) =>
    console.error('twilio recording: pipeline failed', callSid, err),
  );
  return empty(204);
}
