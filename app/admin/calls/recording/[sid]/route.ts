import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth';

/**
 * Admin-gated proxy for Twilio recordings (their media URLs require Basic
 * auth). Streams the MP3 so the owner email's "Listen" link just works.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { sid: string } }) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  const sid = params.sid;
  if (!/^RE[0-9a-f]{32}$/.test(sid)) return NextResponse.json({ error: 'bad sid' }, { status: 400 });
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) return NextResponse.json({ error: 'Twilio not configured' }, { status: 500 });

  const upstream = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Recordings/${sid}.mp3`,
    {
      headers: { Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}` },
      signal: AbortSignal.timeout(60_000),
    },
  );
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: `recording unavailable (${upstream.status})` }, { status: 502 });
  }
  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'private, max-age=3600',
      'Content-Disposition': `inline; filename="${sid}.mp3"`,
    },
  });
}
