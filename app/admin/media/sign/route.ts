import { randomUUID } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth';
import { checkUpload, storageKey, thumbKey } from '@/lib/media/rules';
import { mediaStorage, uploadUrl } from '@/lib/media/storage';

/**
 * Step 1 of an upload: check the file is one we take and hand back a signed
 * link the browser sends it to. Nothing is recorded until /admin/media/items.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Sign in to add media.' }, { status: 401 });
  const storage = mediaStorage();
  if (!storage) return NextResponse.json({ error: 'Media storage is not set up yet.' }, { status: 503 });

  const body = (await req.json().catch(() => null)) as { name?: unknown; type?: unknown; size?: unknown; thumb?: unknown } | null;
  const name = typeof body?.name === 'string' ? body.name.slice(0, 200) : '';
  const check = checkUpload({
    name,
    type: typeof body?.type === 'string' ? body.type : null,
    size: typeof body?.size === 'number' ? body.size : NaN,
  });
  if (!name || !check.ok) {
    return NextResponse.json({ error: check.ok ? 'The file has no name.' : check.error }, { status: 400 });
  }

  const id = randomUUID();
  const key = storageKey(id, check.ext, new Date());
  const tKey = body?.thumb === true ? thumbKey(key) : null;
  return NextResponse.json({
    id,
    key,
    kind: check.kind,
    mime: check.mime,
    uploadUrl: await uploadUrl(storage, key, check.mime),
    thumbKey: tKey,
    thumbUploadUrl: tKey ? await uploadUrl(storage, tKey, 'image/jpeg') : null,
  });
}
