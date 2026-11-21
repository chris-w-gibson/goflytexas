'use server';

import { revalidatePath } from 'next/cache';
import { getSessionFromCookies } from '@/lib/auth';
import { cleanNote, isUuid } from '@/lib/media/rules';
import { mediaStorage, removeStored } from '@/lib/media/storage';
import { deleteMedia, getMedia, updateMedia } from '@/lib/media/store';

const PAGE = '/admin/media';

async function requireSession() {
  const session = await getSessionFromCookies();
  if (!session) throw new Error('Sign in to change the media library');
  return session;
}

export async function saveMediaAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = formData.get('id');
  if (!isUuid(id)) return;
  await updateMedia(id, {
    note: cleanNote(formData.get('note')),
    clearedToPost: formData.get('cleared') === 'on',
  });
  revalidatePath(PAGE);
}

/** The person who added a file, or an admin, removes it — the file and its row. */
export async function deleteMediaAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const id = formData.get('id');
  if (!isUuid(id) || formData.get('confirm') !== 'on') return;
  const item = await getMedia(id);
  if (!item) return;
  if (session.role !== 'admin' && item.uploadedBy !== session.uid) {
    throw new Error('Only the person who added this, or an admin, can delete it');
  }
  const storage = mediaStorage();
  if (storage) {
    await removeStored(storage, item.storageKey);
    if (item.thumbKey) await removeStored(storage, item.thumbKey);
  }
  await deleteMedia(id);
  revalidatePath(PAGE);
}
