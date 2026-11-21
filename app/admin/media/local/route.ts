import { Readable } from 'node:stream';
import { NextResponse, type NextRequest } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth';
import { MAX_VIDEO_BYTES, extensionOf, mediaType } from '@/lib/media/rules';
import { mediaStorage, readLocal, writeLocal } from '@/lib/media/storage';

/**
 * Development only: stands in for the storage bucket when MEDIA_LOCAL_DIR is
 * set and NODE_ENV is not production (mediaStorage refuses it otherwise, and
 * this route then answers 404).
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KEY = /^media\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.(?:thumb\.jpg|[a-z0-9]{1,5})$/;

function localKey(req: NextRequest): string | null {
  const key = req.nextUrl.searchParams.get('key') ?? '';
  return KEY.test(key) ? key : null;
}

export async function PUT(req: NextRequest) {
  const storage = mediaStorage();
  const key = localKey(req);
  if (storage?.driver !== 'local' || !key) return new NextResponse('Not found', { status: 404 });
  if (!(await getSessionFromCookies())) return new NextResponse('Sign in', { status: 401 });
  const body = Buffer.from(await req.arrayBuffer());
  if (body.length === 0 || body.length > MAX_VIDEO_BYTES) return new NextResponse('Bad size', { status: 400 });
  await writeLocal(storage, key, body);
  return new NextResponse(null, { status: 200 });
}

export async function GET(req: NextRequest) {
  const storage = mediaStorage();
  const key = localKey(req);
  if (storage?.driver !== 'local' || !key) return new NextResponse('Not found', { status: 404 });
  const file = await readLocal(storage, key);
  if (!file) return new NextResponse('Not found', { status: 404 });
  const type = key.endsWith('.thumb.jpg') ? 'image/jpeg' : mediaType(null, `x.${extensionOf(key)}`);
  return new NextResponse(Readable.toWeb(file.stream) as ReadableStream, {
    headers: {
      'Content-Type': type ?? 'application/octet-stream',
      'Content-Length': String(file.size),
      'Cache-Control': 'private, max-age=600',
    },
  });
}
