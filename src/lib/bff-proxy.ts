import { NextRequest, NextResponse } from 'next/server';
import { getCircuitBreaker } from './circuit-breaker';
import { verifyToken } from './jwt';

const BACKEND_URL = process.env.BACKEND_SERVICE_URL || 'http://localhost:3001/api/v1';

const DEFAULT_CIRCUIT_BREAKER = {
  failureThreshold: 5,
  successThreshold: 3,
  timeoutMs: 30000,
  resetTimeoutMs: 60000,
};

export async function proxyToBackend(req: NextRequest, path: string): Promise<NextResponse> {
  const circuitBreaker = getCircuitBreaker('backend', DEFAULT_CIRCUIT_BREAKER);

  try {
    return await circuitBreaker.execute(async () => {
      const url = new URL(path, BACKEND_URL);
      const headers = new Headers(req.headers);
      headers.set('Host', url.host);
      console.log('转发目标 URL:', url.toString()); // 添加这行

      // 转发用户身份：从 JWT Cookie 中提取 userId，透传给后端
      const token = req.cookies.get('token')?.value;
      if (token) {
        const payload = verifyToken(token);
        if (payload?.userId) {
          headers.set('x-user-id', String(payload.userId) || '');
        }
      }
      headers.set('x-internal-secret', process.env.INTERNAL_SECRET || '');

      const res = await fetch(url.toString(), {
        method: req.method,
        headers,
        body: req.body,
        duplex: 'half',
        redirect: 'manual',
      } as RequestInit);

      if (!res.ok) {
        throw new Error(`Backend error: ${res.status}`);
      }
      return new NextResponse(res.body, {
        status: res.status,
        headers: res.headers,
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Circuit breaker is open') {
      return NextResponse.json(
        { error: 'Service temporarily unavailable', retryAfter: 60 },
        { status: 503 }
      );
    }
    if (error instanceof Error && error.message === 'Request timeout') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export function createBBFRoute() {
  return async function handler(req: NextRequest) {
    // 去掉 /api/bff 前缀，保留服务名 + 路径
    // e.g. /api/bff/chat/session → chat/session → http://backend:3000/api/v1/chat/session
    const path = req.nextUrl.pathname.replace(/^\/api\/bff\//, '') || '';
    const query = req.nextUrl.search;
    return proxyToBackend(req, path + query);
  };
}
