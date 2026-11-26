import { NextResponse, type NextRequest } from 'next/server';
import { isUuid } from '@/lib/media/rules';
import { mediaStorage, viewUrl } from '@/lib/media/storage';
import { getSuggestion } from '@/lib/suggestions/store';

/** The picture on a suggestion: a redirect to a one-hour signed link. Admin pages only (middleware). */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isUuid(params.id)) return new NextResponse('Not found', { status: 404 });
  const row = await getSuggestion(params.id);
  const storage = mediaStorage();
  if (!row?.pictureKey || !storage) return new NextResponse('Not found', { status: 404 });
  const url = await viewUrl(storage, row.pictureKey, { contentType: row.pictureType ?? undefined });
  // Sent as given: a bucket link is absolute, the development stand-in is a path on this site.
  return new NextResponse(null, { status: 302, headers: { Location: url, 'Cache-Control': 'private, max-age=600' } });
}
