'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSessionFromCookies } from '@/lib/auth';
import {
  createBotDocument,
  deleteBotDocument,
  extractText,
  setBotDocumentActive,
} from '@/lib/botKnowledge';

const uploadSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
});

export type UploadState = { error?: string; success?: string };

export async function uploadBotDocumentAction(
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const parsed = uploadSchema.safeParse({ title: formData.get('title') });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(', ') };
  }

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Choose a file to upload.' };
  }

  let content: string;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    content = await extractText(buffer, file.name, file.type);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Could not read the file.' };
  }

  const session = await getSessionFromCookies();
  await createBotDocument({
    title: parsed.data.title,
    filename: file.name,
    mimeType: file.type || 'application/octet-stream',
    content,
    uploadedBy: session?.uid ?? null,
  });

  revalidatePath('/admin/bot-knowledge');
  return { success: `"${parsed.data.title}" uploaded — the bot can use it now.` };
}

export async function toggleBotDocumentAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const isActive = formData.get('isActive') === 'true';
  if (!id) return;
  await setBotDocumentActive(id, isActive);
  revalidatePath('/admin/bot-knowledge');
}

export async function deleteBotDocumentAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await deleteBotDocument(id);
  revalidatePath('/admin/bot-knowledge');
}
