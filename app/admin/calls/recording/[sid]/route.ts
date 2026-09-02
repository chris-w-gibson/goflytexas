import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth';
import { getCallById } from '@/lib/calls';
import { fetchVapiRecording } from '@/lib/voice/vapi';

/**
 * Admin-gated recording proxy used by the owner email's "Listen" link and the
 * admin calls page. Accepts either a Twilio recording sid (RE…) or one of our
 * call ids:
 *  - Twilio media needs Basic auth → stream the MP3.
 *  - Vapi stores bare R2 URLs that are not readable; the playable ones are
 *    presigned and expire in ~30 min → fetch a fresh one now and redirect.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TWILIO_RECORDING_SID = /^RE[0-9a-f]{32}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function streamTwilio(sid: string): Promise<Response> {
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

async function redirectVapi(platformCallId: string): Promise<Response> {
  const apiKey = process.env.VAPI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Vapi not configured' }, { status: 500 });
  const rec = await fetchVapiRecording(platformCallId, { apiKey });
  if (!rec) return NextResponse.json({ error: 'recording unavailable' }, { status: 502 });
  // The presigned URL is short-lived: never let a browser or mail client cache the redirect.
  return NextResponse.redirect(rec.url, { status: 302, headers: { 'Cache-Control': 'no-store' } });
}

export async function GET(_req: Request, { params }: { params: { sid: string } }) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  const key = params.sid;

  if (TWILIO_RECORDING_SID.test(key)) return streamTwilio(key);

  if (UUID.test(key)) {
    const call = await getCallById(key);
    if (!call) return NextResponse.json({ error: 'no such call' }, { status: 404 });
    if (call.platform === 'twilio') {
      return call.recordingSid ? streamTwilio(call.recordingSid) : NextResponse.json({ error: 'no recording' }, { status: 404 });
    }
    if (call.platform === 'vapi') {
      return call.recordingUrl ? redirectVapi(call.platformCallId) : NextResponse.json({ error: 'no recording' }, { status: 404 });
    }
  }
  return NextResponse.json({ error: 'bad id' }, { status: 400 });
}
