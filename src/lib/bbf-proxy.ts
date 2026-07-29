import { NextRequest, NextResponse } from 'next/server';
import { getCircuitBreaker } from './circuit-breaker';

interface BackendConfig {
  baseUrl: string;
  timeout?: number;
  circuitBreaker?: {
    failureThreshold?: number;
    successThreshold?: number;
    timeoutMs?: number;
    resetTimeoutMs?: number;
  };
}

const backends: Record<string, BackendConfig> = {
  auth: {
    baseUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    circuitBreaker: {
      failureThreshold: 3,
      successThreshold: 2,
      timeoutMs: 10000,
      resetTimeoutMs: 30000,
    },
  },
  chat: {
    baseUrl: process.env.CHAT_SERVICE_URL || 'http://localhost:3002',
    circuitBreaker: {
      failureThreshold: 5,
      successThreshold: 3,
      timeoutMs: 30000,
      resetTimeoutMs: 60000,
    },
  },
  storage: {
    baseUrl: process.env.STORAGE_SERVICE_URL || 'http://localhost:3003',
    circuitBreaker: {
      failureThreshold: 5,
      successThreshold: 3,
      timeoutMs: 15000,
      resetTimeoutMs: 45000,
    },
  },
};

export async function proxyToBackend(
  req: NextRequest,
  backendName: string,
  path: string
): Promise<NextResponse> {
  const backend = backends[backendName];
  if (!backend) {
    return NextResponse.json({ error: 'Backend not found' }, { status: 404 });
  }

  const circuitBreaker = getCircuitBreaker(backendName, backend.circuitBreaker);

  try {
    return await circuitBreaker.execute(async () => {
      const url = new URL(path, backend.baseUrl);
      const headers = new Headers(req.headers);
      headers.set('Host', url.host);

      const res = await fetch(url.toString(), {
        method: req.method,
        headers,
        body: req.body,
        redirect: 'manual',
      });

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

export function createBBFRoute(backendName: string) {
  return async function handler(req: NextRequest) {
    const path = req.nextUrl.pathname.replace(/^\/api\/bbf\/[^/]+/, '') || '/';
    const query = req.nextUrl.search;
    const fullPath = path + query;
    return proxyToBackend(req, backendName, fullPath);
  };
}
