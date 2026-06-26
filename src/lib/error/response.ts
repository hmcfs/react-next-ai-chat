import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './error';
export function success<T>(data: T, msg = 'success') {
  return NextResponse.json({ data, msg: msg, code: 1 });
}
export function fail(e: unknown): NextResponse {
  if (e instanceof ZodError) {
    const issues = (e as any).issues?.map((i: any) => i.message).join('; ');
    return NextResponse.json(
      { code: 400, msg: issues || '参数校验失败', data: null },
      { status: 400 }
    );
  }
  if (e instanceof AppError) {
    return NextResponse.json(
      { error: e.message, code: e.code, data: null },
      { status: e.statusCode }
    );
  }
  console.error('处理失败：', e);
  return NextResponse.json(
    { code: 500, msg: '服务器内部错误，请稍后重试', data: null },
    { status: 500 }
  );
}
