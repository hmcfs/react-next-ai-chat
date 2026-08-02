import { createBBFRoute } from '@/lib/bff-proxy';
import { NextRequest, NextResponse } from 'next/server';

const handler = createBBFRoute();
export async function POST(req: NextRequest) {
  const response = await handler(req);
  const data = await response.json();
  //console.log('登录响应:', data);

  const newRes = NextResponse.json(data);
  newRes.cookies.set('token', data.data.token, {
    httpOnly: true,
    //secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 3,
  });
  return newRes;
}
