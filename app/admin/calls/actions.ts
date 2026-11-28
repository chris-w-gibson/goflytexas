'use server';

import { revalidatePath } from 'next/cache';
import { getSessionFromCookies } from '@/lib/auth';
import { getCallById } from '@/lib/calls';
import { processRawPayload, processTwilioCall } from '@/lib/voice/pipeline';
import type { VoicePlatform } from '@/lib/voice/types';

/**
 * Re-run the post-call pipeline. Platform calls replay their stored webhook
 * payload; human-answered Twilio calls re-transcribe the recording first.
 * `real=1` files a call that was marked as a test (one of our own phones) as a
 * real caller.
 */
export async function reprocessCallAction(formData: FormData) {
  const session = await getSessionFromCookies();
  if (!session) throw new Error('Sign in required');
  const id = String(formData.get('id') ?? '');
  if (!id) throw new Error('Missing id');
  const call = await getCallById(id);
  if (!call) throw new Error('Call not found');
  const real = formData.get('real') === '1';
  if (call.platform === 'twilio') {
    const r = await processTwilioCall(call.platformCallId, { force: true, real });
    if ('skipped' in r) throw new Error(`Not reprocessed: ${r.skipped}`);
  } else {
    if (!call.rawPayload) throw new Error('No stored payload for this call');
    await processRawPayload(call.platform as VoicePlatform, call.rawPayload, { real });
  }
  revalidatePath('/admin/calls');
  revalidatePath('/admin/leads');
  revalidatePath('/admin');
}
