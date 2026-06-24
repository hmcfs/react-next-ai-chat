import { getId } from '@/lib/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const res = await req.json();
    const content = res.content.trim();
    const userId = getId(req.cookies.get('token')?.value || '');
    if (!userId) return NextResponse.json({ error: '请先登录' }, { status: 401 });
    if (!content) return NextResponse.json({ error: '请输入内容' }, { status: 400 });
    const newSession = await prisma.chat_session.create({
      data: {
        user_id: userId,
        title: content.slice(0, 20),
        chat_message: {
          create: [
            {
              role: 'user',
              content,
            },
          ],
        },
      },
      include: {
        chat_message: true,
      },
    });
    const { chat_id, title } = newSession;
    return NextResponse.json({ data: { chat_id, title }, code: 1, msg: 'create session success' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'create session failed' }, { status: 500 });
  }
}
