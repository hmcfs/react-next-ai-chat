import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../lib/jwt';
import { isProtected, isPublic } from './route';
export async function authProxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;
  const user = token ? verifyToken(token) : null;

  if (!user && isProtected(pathname)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = new URL('/sign-in', req.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url.toString());
  }

  if (user) {
    const reqHeaders = new Headers(req.headers);
    reqHeaders.set('user', JSON.stringify(user));
    return NextResponse.next({ request: { headers: reqHeaders } });
  }
  return NextResponse.next();
}
