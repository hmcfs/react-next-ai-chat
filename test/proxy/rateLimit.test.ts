import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { rateLimit } from '@/proxy/rateLimit';

const createMockRequest = (headers: Record<string, string>) => {
  return {
    headers: {
      get: (key: string) => headers[key] || null,
    },
  } as any;
};

describe('rateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return null when under limit', () => {
    const req = createMockRequest({ 'x-forwarded-for': '192.168.1.1' });
    const result = rateLimit(req);
    expect(result).toBeNull();
  });

  it('should extract IP from x-forwarded-for header', () => {
    const req = createMockRequest({ 'x-forwarded-for': '10.0.0.1, 192.168.1.1' });
    const result = rateLimit(req);
    expect(result).toBeNull();
  });

  it('should fallback to x-real-ip when x-forwarded-for is missing', () => {
    const req = createMockRequest({ 'x-real-ip': '10.0.0.2' });
    const result = rateLimit(req);
    expect(result).toBeNull();
  });

  it('should fallback to host when no IP headers', () => {
    const req = createMockRequest({ host: 'localhost:3000' });
    const result = rateLimit(req);
    expect(result).toBeNull();
  });

  it('should return 429 when rate limit exceeded', () => {
    const req = createMockRequest({ 'x-forwarded-for': '192.168.1.100' });

    for (let i = 0; i < 100; i++) {
      rateLimit(req);
    }

    const result = rateLimit(req);
    expect(result).not.toBeNull();
    expect(result?.status).toBe(429);
  });

  it('should reset count after window expires', () => {
    const req = createMockRequest({ 'x-forwarded-for': '192.168.1.200' });

    for (let i = 0; i < 100; i++) {
      rateLimit(req);
    }

    const limited = rateLimit(req);
    expect(limited?.status).toBe(429);

    vi.advanceTimersByTime(60 * 1000 + 1);

    const afterReset = rateLimit(req);
    expect(afterReset).toBeNull();
  });

  it('should track different IPs independently', () => {
    const req1 = createMockRequest({ 'x-forwarded-for': '192.168.1.1' });
    const req2 = createMockRequest({ 'x-forwarded-for': '192.168.1.2' });

    for (let i = 0; i < 100; i++) {
      rateLimit(req1);
    }

    expect(rateLimit(req1)?.status).toBe(429);
    expect(rateLimit(req2)).toBeNull();
  });

  it('should return error message in response', () => {
    const req = createMockRequest({ 'x-forwarded-for': '192.168.1.50' });

    for (let i = 0; i < 100; i++) {
      rateLimit(req);
    }

    const result = rateLimit(req);
    expect(result).not.toBeNull();
  });
});
