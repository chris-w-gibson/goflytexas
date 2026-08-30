import type { NextRequest } from 'next/server';
import { parseForm, verifyTwilioSignature } from './twilio';

/** Next.js glue for the Twilio routes: body parsing, signature check, XML responses. */

const MAX_BODY_BYTES = 64 * 1024;

export function publicBaseUrl(env: Record<string, string | undefined> = process.env): string {
  return (env.VOICE_PUBLIC_BASE_URL || env.NEXT_PUBLIC_SITE_URL || 'https://www.goflytexas.com').replace(
    /\/+$/,
    '',
  );
}

/**
 * The URL Twilio signed. Railway's proxy rewrites host/scheme, so rebuild
 * from the configured public base; also accept the forwarded-host variant.
 */
export function candidateUrls(req: NextRequest): string[] {
  const u = new URL(req.url);
  const tail = `${u.pathname}${u.search}`;
  const urls = [`${publicBaseUrl()}${tail}`];
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  if (host) urls.push(`${proto}://${host}${tail}`);
  return Array.from(new Set(urls));
}

export type TwilioRequest =
  | { ok: true; params: Record<string, string>; query: URLSearchParams; baseUrl: string }
  | { ok: false; status: 401 | 413 | 500; error: string };

export async function readTwilioRequest(req: NextRequest): Promise<TwilioRequest> {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return { ok: false, status: 500, error: 'TWILIO_AUTH_TOKEN not set' };
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return { ok: false, status: 413, error: 'body too large' };
  const params = parseForm(raw);
  const valid = verifyTwilioSignature({
    authToken,
    signature: req.headers.get('x-twilio-signature'),
    urls: candidateUrls(req),
    params,
  });
  if (!valid) return { ok: false, status: 401, error: 'bad signature' };
  return { ok: true, params, query: new URL(req.url).searchParams, baseUrl: publicBaseUrl() };
}

export function xml(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/xml; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export function empty(status = 204): Response {
  return new Response(null, { status });
}

/** Auth/size failure on a TwiML route: non-2xx + empty document → Twilio uses the number's Fallback URL. */
export function twimlError(r: { status: 401 | 413 | 500; error: string }): Response {
  console.warn('twilio request rejected:', r.status, r.error);
  return xml('<?xml version="1.0" encoding="UTF-8"?><Response/>', r.status === 401 ? 403 : r.status);
}
