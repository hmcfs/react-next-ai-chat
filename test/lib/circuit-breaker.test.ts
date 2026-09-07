import {
  CircuitBreaker,
  circuitBreakers,
  getCircuitBreaker,
  type CircuitBreakerOptions,
} from '@/lib/circuit-breaker';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const defaultOptions: CircuitBreakerOptions = {
  failureThreshold: 3,
  successThreshold: 2,
  timeoutMs: 5000,
  resetTimeoutMs: 1000,
};

describe('CircuitBreaker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    circuitBreakers.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should start in closed state', () => {
      const cb = new CircuitBreaker(defaultOptions);
      expect(cb.getState()).toBe('closed');
    });
  });

  describe('execute success', () => {
    it('should return result on successful execution', async () => {
      const cb = new CircuitBreaker(defaultOptions);
      const result = await cb.execute(() => Promise.resolve('ok'));
      expect(result).toBe('ok');
    });

    it('should remain closed after success', async () => {
      const cb = new CircuitBreaker(defaultOptions);
      await cb.execute(() => Promise.resolve('ok'));
      expect(cb.getState()).toBe('closed');
    });
  });

  describe('execute failure', () => {
    it('should throw error on failed execution', async () => {
      const cb = new CircuitBreaker(defaultOptions);
      await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail');
    });

    it('should open circuit after reaching failure threshold', async () => {
      const cb = new CircuitBreaker(defaultOptions);

      for (let i = 0; i < 3; i++) {
        await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
      }

      expect(cb.getState()).toBe('open');
    });

    it('should throw immediately when circuit is open', async () => {
      const cb = new CircuitBreaker(defaultOptions);

      for (let i = 0; i < 3; i++) {
        await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
      }

      await expect(cb.execute(() => Promise.resolve('ok'))).rejects.toThrow(
        'Circuit breaker is open'
      );
    });
  });

  describe('half-open state', () => {
    it('should transition to half-open after reset timeout', async () => {
      const cb = new CircuitBreaker(defaultOptions);

      for (let i = 0; i < 3; i++) {
        await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
      }

      expect(cb.getState()).toBe('open');

      vi.advanceTimersByTime(1000);
      expect(cb.getState()).toBe('half-open');
    });

    it('should close circuit after reaching success threshold in half-open', async () => {
      const cb = new CircuitBreaker(defaultOptions);

      for (let i = 0; i < 3; i++) {
        await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
      }

      vi.advanceTimersByTime(1000);
      expect(cb.getState()).toBe('half-open');

      await cb.execute(() => Promise.resolve('ok'));
      await cb.execute(() => Promise.resolve('ok'));

      expect(cb.getState()).toBe('closed');
    });

    it('should reopen circuit on failure in half-open', async () => {
      const cb = new CircuitBreaker(defaultOptions);

      for (let i = 0; i < 3; i++) {
        await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
      }

      vi.advanceTimersByTime(1000);
      expect(cb.getState()).toBe('half-open');

      await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {});

      expect(cb.getState()).toBe('open');
    });
  });

  describe('timeout', () => {
    it('should throw timeout error when execution exceeds timeout', async () => {
      const cb = new CircuitBreaker({ ...defaultOptions, timeoutMs: 100 });

      const promise = cb.execute(
        () => new Promise((resolve) => setTimeout(() => resolve('ok'), 200))
      );

      vi.advanceTimersByTime(200);

      await expect(promise).rejects.toThrow('Request timeout');
    });

    it('should abort signal on timeout', async () => {
      const cb = new CircuitBreaker({ ...defaultOptions, timeoutMs: 100 });
      let aborted = false;

      const promise = cb.execute(
        (signal) =>
          new Promise((resolve) => {
            const timer = setTimeout(() => resolve('ok'), 200);
            signal.addEventListener('abort', () => {
              aborted = true;
              clearTimeout(timer);
            });
          })
      );

      vi.advanceTimersByTime(200);

      await expect(promise).rejects.toThrow('Request timeout');
      expect(aborted).toBe(true);
    });
  });

  describe('reset on success in closed state', () => {
    it('should reset failure count on success in closed state', async () => {
      const cb = new CircuitBreaker(defaultOptions);

      await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
      await cb.execute(() => Promise.resolve('ok'));

      for (let i = 0; i < 2; i++) {
        await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
      }

      expect(cb.getState()).toBe('closed');
    });
  });
});

describe('getCircuitBreaker', () => {
  beforeEach(() => {
    circuitBreakers.clear();
  });

  it('should create a new circuit breaker if not exists', () => {
    const cb = getCircuitBreaker('test', defaultOptions);
    expect(cb).toBeInstanceOf(CircuitBreaker);
  });

  it('should return existing circuit breaker if exists', () => {
    const cb1 = getCircuitBreaker('test', defaultOptions);
    const cb2 = getCircuitBreaker('test', defaultOptions);
    expect(cb1).toBe(cb2);
  });

  it('should merge options with defaults', () => {
    const cb = getCircuitBreaker('test', { failureThreshold: 10 });
    expect(cb.getState()).toBe('closed');
  });
});
