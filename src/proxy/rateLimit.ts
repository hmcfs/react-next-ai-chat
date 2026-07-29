import { NextRequest, NextResponse } from 'next/server';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 100; // 每分钟 100 次
const WINDOW_MS = 60 * 1000; // 1 分钟

export function rateLimit(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    req.headers.get('host') ||
    'unknown';
  const now = Date.now();
  let record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    record = { count: 0, resetTime: now + WINDOW_MS };
    rateLimitMap.set(ip, record);
  }
  record.count++;
  if (record.count > RATE_LIMIT) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
      }
    );
  }
  return null;
}
