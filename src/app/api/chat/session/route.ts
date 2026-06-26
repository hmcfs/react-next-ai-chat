import { fail, success } from '@/lib/error/response';
import { getAuthContext } from '@/lib/jwt';
import { createSession, getHistorySession } from '@/lib/service/chat/session.service';
import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  try {
    const res = await req.json();
    const content = res.content.trim();
    const userId = getAuthContext(req);
    if (!content) return NextResponse.json({ error: '请输入内容' }, { status: 400 });
    const data = await createSession(userId, content);
    return success(data, 'create session success');
  } catch (e) {
    return fail(e);
  }
}
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;

    const userId = getAuthContext(req);

    const data = await getHistorySession(userId, page, pageSize);
    return success(data, 'select history chat success');
  } catch (e) {
    console.error('查询聊天记录失败：', e);
    return fail(e);
  }
}
