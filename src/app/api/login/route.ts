import { pswCrypt } from '@/lib/crypt';
import { signToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password)
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
  const user = await prisma.sysUser.findUnique({
    where: { username },
    select: { password: true, id: true, username: true },
  });
  const isValid = await pswCrypt.compare(password, user?.password || '');
  if (!user || !isValid)
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  const info = {
    username,
    userId: user.id,
  };
  const token = signToken(info);
  const res = NextResponse.json({
    code: 1,
    message: 'login success',
    data: { id: user.id, username: user.username },
  });
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return res;
}
export async function GET(req: NextRequest) {
  return NextResponse.json({ success: true });
}
