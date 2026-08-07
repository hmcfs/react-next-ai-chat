import { NextRequest, NextResponse } from 'next/server';
import { getCircuitBreaker } from './circuit-breaker';
import { verifyToken } from './jwt';

const BACKEND_URL = process.env.BACKEND_SERVICE_URL || 'http://localhost:3001/api';

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
      // 浏览器对 >1MB 请求体会自动加 Expect: 100-continue；undici fetch 不支持该头
      // （抛 UND_ERR_NOT_SUPPORTED），转发前删除。连接级 hop-by-hop 头同样移除，
      // content-length 保留（我们读满了 body，长度一致）。
      headers.delete('expect');
      headers.delete('connection');
      headers.delete('transfer-encoding');
      console.log('转发目标 URL:', url.toString());

      // 转发用户身份：从 JWT Cookie 中提取 userId，透传给后端
      const token = req.cookies.get('token')?.value;
      if (token) {
        const payload = verifyToken(token);
        if (payload?.userId) {
          headers.set('x-user-id', String(payload.userId) || '');
        }
      }
      headers.set('x-internal-secret', process.env.INTERNAL_SECRET || '');

      // 先读取请求体，避免流被消费过的问题
      let bodyToForward: ArrayBuffer | undefined;
      if (req.body) {
        bodyToForward = await req.arrayBuffer();
      }

      const res = await fetch(url.toString(), {
        method: req.method,
        headers,
        body: bodyToForward,
        redirect: 'manual',
      });

      // 透传后端状态码与响应体：4xx 业务错误（如「请选择文件」）原样返回给前端，
      // 前端可读取 data.msg 展示具体错误信息
      // 5xx 视为后端故障，计入熔断器失败次数
      if (res.status >= 500) {
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
    // e.g. /api/bff/chat/session → chat/session → http://backend:3000/api/chat/session
    const path = req.nextUrl.pathname.replace(/^\/api\/bff\//, '') || '';
    const query = req.nextUrl.search;
    return proxyToBackend(req, path + query);
  };
}
