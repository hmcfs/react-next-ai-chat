import { getRedis } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../lib/jwt';
import { isProtected } from './route';
export async function authProxy(req: NextRequest) {
  const redis = getRedis();
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;
  const payload = token ? verifyToken(token) : null;
  if (payload && payload.userId) {
    const cache = await redis.get(`${process.env.REDIS_KEY_PREFIX}user:token:${payload.userId}`);
    if (!cache) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!payload && isProtected(pathname)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = new URL('/sign-in', req.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url.toString());
  }

  if (payload) {
    const reqHeaders = new Headers(req.headers);
    reqHeaders.set('x-user-id', String(payload.userId));
    return NextResponse.next({ request: { headers: reqHeaders } });
  }
  return NextResponse.next();
}
