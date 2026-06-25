import { getId } from '@/lib/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fail } from '@/lib/error/response';

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
    return NextResponse.json({
      data: { chatId: chat_id, title: title, content },
      code: 1,
      msg: 'create session success',
    });
  } catch (e) {
    return fail(e);
  }
}
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const skip = (page - 1) * pageSize;
    const userId = getId(req.cookies.get('token')?.value || '');
    if (!userId) {
      return NextResponse.json({ error: ' Please login first', code: 0 }, { status: 401 });
    }
    const historyList = await prisma.chat_session.findMany({
      where: { user_id: userId, is_delete: false },
      select: {
        chat_id: true,
        title: true,
        create_time: true,
        update_time: true,
      },
      orderBy: { create_time: 'desc' },
      take: pageSize,
      skip,
    });
    return NextResponse.json({
      data: { historyList, page, pageSize },
      code: 1,
      msg: 'Select history chat success',
    });
  } catch (e) {
    console.error('查询聊天记录失败：', e);
    return NextResponse.json({ error: 'Select history chat failed', code: 0 }, { status: 500 });
  }
}
