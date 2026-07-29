import { NextRequest, NextResponse } from 'next/server';
import { getCircuitBreaker } from '@/lib/circuit-breaker';

const externalApiBreaker = getCircuitBreaker('external-api', {
  failureThreshold: 3,
  successThreshold: 2,
  timeoutMs: 5000,
  resetTimeoutMs: 30000,
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const simulateFailure = searchParams.get('fail') === 'true';

  try {
    const result = await externalApiBreaker.execute(async () => {
      if (simulateFailure) {
        throw new Error('Simulated service failure');
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      return {
        message: 'Success from external service',
        timestamp: new Date().toISOString(),
        circuitState: externalApiBreaker.getState(),
      };
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
        circuitState: externalApiBreaker.getState(),
      },
      { status: error instanceof Error && error.message === 'Circuit breaker is open' ? 503 : 500 }
    );
  }
}
