import { NextResponse, type NextRequest } from 'next/server';
import { unsubscribeLead } from '@/lib/leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// RFC 8058 one-click unsubscribe target for the List-Unsubscribe header.
// Mail clients POST here; humans use the /unsubscribe page, which confirms
// first so link scanners can't unsubscribe someone by prefetching (H3).
export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  await unsubscribeLead(token).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
