'use server';

import { revalidatePath } from 'next/cache';
import { getSessionFromCookies } from '@/lib/auth';
import { isUuid } from '@/lib/media/rules';
import { cleanReply } from '@/lib/suggestions/rules';
import { closeSuggestion, reopenSuggestion } from '@/lib/suggestions/store';

const PAGE = '/admin/suggestions';

async function requireAdmin() {
  const session = await getSessionFromCookies();
  if (!session || session.role !== 'admin') throw new Error('Only an admin marks a suggestion done');
  return session;
}

export async function closeSuggestionAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const id = formData.get('id');
  if (!isUuid(id)) return;
  await closeSuggestion(id, session.name || session.email, cleanReply(formData.get('reply')));
  revalidatePath(PAGE);
}

export async function reopenSuggestionAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get('id');
  if (!isUuid(id)) return;
  await reopenSuggestion(id);
  revalidatePath(PAGE);
}
