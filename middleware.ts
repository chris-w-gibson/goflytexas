import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE = 'gft_session';
const BREAK_GLASS_COOKIE = 'gft_admin_key';

async function hasValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
    return typeof payload.uid === 'string';
  } catch {
    return false;
  }
}

function breakGlassValid(req: NextRequest): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;
  // Cookie-based break-glass (legacy from URL-key flow)
  return req.cookies.get(BREAK_GLASS_COOKIE)?.value === expected;
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Allow break-glass URL key for me (one-time set, then cookie persists)
  const expected = process.env.ADMIN_TOKEN;
  if (expected) {
    const queryKey = searchParams.get('key');
    if (queryKey && queryKey === expected) {
      const url = req.nextUrl.clone();
      url.searchParams.delete('key');
      const res = NextResponse.redirect(url);
      res.cookies.set(BREAK_GLASS_COOKIE, expected, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,
        path: '/admin',
      });
      return res;
    }
  }

  if (await hasValidSession(req)) {
    return NextResponse.next();
  }
  if (breakGlassValid(req)) {
    return NextResponse.next();
  }

  // Not authenticated → redirect to /login
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = '/login';
  loginUrl.search = `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};
