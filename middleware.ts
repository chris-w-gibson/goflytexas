import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_COOKIE = 'gft_admin_key';

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    // No token configured — admin is open. Surfaced via banner on the page.
    return NextResponse.next();
  }

  const cookieVal = req.cookies.get(ADMIN_COOKIE)?.value;
  if (cookieVal === expected) {
    return NextResponse.next();
  }

  const queryKey = searchParams.get('key');
  if (queryKey && queryKey === expected) {
    const url = req.nextUrl.clone();
    url.searchParams.delete('key');
    const res = NextResponse.redirect(url);
    res.cookies.set(ADMIN_COOKIE, expected, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/admin',
    });
    return res;
  }

  return new NextResponse('Not found', { status: 404 });
}

export const config = {
  matcher: ['/admin/:path*'],
};
