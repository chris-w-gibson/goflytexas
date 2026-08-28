'use server';

import { revalidatePath } from 'next/cache';
import { getSessionFromCookies } from '@/lib/auth';
import { getCallById } from '@/lib/calls';
import { processRawPayload } from '@/lib/voice/pipeline';
import type { VoicePlatform } from '@/lib/voice/types';

/** Re-run the post-call pipeline from the stored webhook payload. */
export async function reprocessCallAction(formData: FormData) {
  const session = await getSessionFromCookies();
  if (!session) throw new Error('Sign in required');
  const id = String(formData.get('id') ?? '');
  if (!id) throw new Error('Missing id');
  const call = await getCallById(id);
  if (!call?.rawPayload) throw new Error('No stored payload for this call');
  await processRawPayload(call.platform as VoicePlatform, call.rawPayload);
  revalidatePath('/admin/calls');
  revalidatePath('/admin/leads');
  revalidatePath('/admin');
}
