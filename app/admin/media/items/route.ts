import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSessionFromCookies } from '@/lib/auth';
import { checkUpload, cleanNote, isKeyFor, isUuid, thumbKey } from '@/lib/media/rules';
import { mediaStorage, removeStored, storedSize } from '@/lib/media/storage';
import { addMedia } from '@/lib/media/store';

/**
 * Step 2 of an upload: the file is in storage — list it in the library. The
 * size is read back from storage, never taken from the browser, and a key is
 * accepted only in the shape the sign route issues for this item.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const dimension = (v: unknown, max: number): number | null =>
  typeof v === 'number' && Number.isFinite(v) && v > 0 && v <= max ? Math.round(v) : null;

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Sign in to add media.' }, { status: 401 });
  const storage = mediaStorage();
  if (!storage) return NextResponse.json({ error: 'Media storage is not set up yet.' }, { status: 503 });

  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const id = b?.id;
  const key = b?.key;
  const name = typeof b?.name === 'string' ? b.name.slice(0, 200) : '';
  if (!isUuid(id) || !isKeyFor(id, key) || !name) {
    return NextResponse.json({ error: 'That upload is not one this page started.' }, { status: 400 });
  }

  const size = await storedSize(storage, key);
  if (size === null) {
    return NextResponse.json({ error: `${name}: the upload did not finish. Try it again.` }, { status: 409 });
  }
  const check = checkUpload({ name, type: typeof b?.type === 'string' ? b.type : null, size });
  if (!check.ok || !key.endsWith(`.${check.ext}`)) {
    await removeStored(storage, key).catch(() => undefined);
    return NextResponse.json({ error: check.ok ? `${name}: the file type changed mid-upload.` : check.error }, { status: 400 });
  }

  const tKey = thumbKey(key);
  const hasThumb = b?.thumbKey === tKey && (await storedSize(storage, tKey)) !== null;

  await addMedia({
    id,
    kind: check.kind,
    storageKey: key,
    thumbKey: hasThumb ? tKey : null,
    filename: name,
    mimeType: check.mime,
    sizeBytes: size,
    width: dimension(b?.width, 20000),
    height: dimension(b?.height, 20000),
    durationSec: check.kind === 'video' ? dimension(b?.durationSec, 6 * 60 * 60) : null,
    note: cleanNote(b?.note),
    clearedToPost: b?.cleared === true,
    uploadedBy: session.uid,
    uploadedByName: session.name || session.email,
  });
  revalidatePath('/admin/media');
  return NextResponse.json({ ok: true, id });
}
