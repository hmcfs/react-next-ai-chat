export interface CircuitBreakerOptions {
  failureThreshold: number;
  successThreshold: number;
  timeoutMs: number;
  resetTimeoutMs: number;
}

export type CircuitState = 'closed' | 'open' | 'half-open';

interface CircuitBreakerStats {
  failures: number;
  successes: number;
  lastFailureTime: number;
}

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private stats: CircuitBreakerStats = {
    failures: 0,
    successes: 0,
    lastFailureTime: 0,
  };

  constructor(private options: CircuitBreakerOptions) {}

  getState(): CircuitState {
    if (this.state === 'open') {
      const now = Date.now();
      if (now - this.stats.lastFailureTime >= this.options.resetTimeoutMs) {
        this.state = 'half-open';
        this.stats = { failures: 0, successes: 0, lastFailureTime: 0 };
      }
    }
    return this.state;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const state = this.getState();

    if (state === 'open') {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), this.options.timeoutMs)
        ),
      ]);

      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    if (this.state === 'half-open') {
      this.stats.successes++;
      if (this.stats.successes >= this.options.successThreshold) {
        this.state = 'closed';
        this.stats = { failures: 0, successes: 0, lastFailureTime: 0 };
      }
    } else {
      this.stats.failures = 0;
    }
  }

  private onFailure() {
    this.stats.failures++;
    this.stats.lastFailureTime = Date.now();

    if (this.state === 'half-open') {
      this.state = 'open';
    } else if (this.stats.failures >= this.options.failureThreshold) {
      this.state = 'open';
    }
  }
}

export const circuitBreakers = new Map<string, CircuitBreaker>();

export function getCircuitBreaker(
  name: string,
  options?: Partial<CircuitBreakerOptions>
): CircuitBreaker {
  if (!circuitBreakers.has(name)) {
    const defaultOptions: CircuitBreakerOptions = {
      failureThreshold: 5,
      successThreshold: 3,
      timeoutMs: 30000,
      resetTimeoutMs: 60000,
      ...options,
    };
    circuitBreakers.set(name, new CircuitBreaker(defaultOptions));
  }
  return circuitBreakers.get(name)!;
}
