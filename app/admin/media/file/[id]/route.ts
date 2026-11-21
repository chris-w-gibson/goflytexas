import { NextResponse, type NextRequest } from 'next/server';
import { isUuid } from '@/lib/media/rules';
import { mediaStorage, viewUrl } from '@/lib/media/storage';
import { getMedia } from '@/lib/media/store';

/**
 * Shows one library file: looks the item up and sends the browser to a
 * signed link that lasts an hour. `?thumb=1` is the small picture for the
 * grid, `?download=1` saves the original under its own name. The bucket is
 * private; this route sits under /admin, so only a signed-in person gets here.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const storage = mediaStorage();
  if (!storage || !isUuid(params.id)) return new NextResponse('Not found', { status: 404 });
  const item = await getMedia(params.id);
  if (!item) return new NextResponse('Not found', { status: 404 });

  const q = req.nextUrl.searchParams;
  let url: string;
  if (q.get('thumb') === '1') {
    if (item.thumbKey) url = await viewUrl(storage, item.thumbKey, { contentType: 'image/jpeg' });
    else if (item.kind === 'photo') url = await viewUrl(storage, item.storageKey, { contentType: item.mimeType });
    else return new NextResponse('No preview', { status: 404 });
  } else {
    url = await viewUrl(storage, item.storageKey, {
      contentType: item.mimeType,
      downloadAs: q.get('download') === '1' ? item.filename : undefined,
    });
  }
  // The link goes out as given: a bucket URL is absolute, the development
  // stand-in is a path on this site (rebuilding it from req.url would name
  // the server's own host, not the one the browser is on).
  return new NextResponse(null, { status: 302, headers: { Location: url, 'Cache-Control': 'private, max-age=600' } });
}
