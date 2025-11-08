/**
 * Timeout and stall protection utilities for tests
 */

export const TEST_TIMEOUTS = {
  UNIT: 5000, // 5s for unit tests
  INTEGRATION: 10000, // 10s for integration tests
  API: 15000, // 15s for API calls
  RENDER: 20000, // 20s for rendering operations
} as const;

/**
 * Wrap async test function with timeout protection
 */
export function withTimeout<T>(
  fn: () => Promise<T>,
  timeout: number = TEST_TIMEOUTS.UNIT
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Test timeout after ${timeout}ms`)), timeout)
    ),
  ]);
}

/**
 * Stall detection - throws if no activity for specified time
 */
export function createStallDetector(timeout: number = TEST_TIMEOUTS.API) {
  let lastActivity = Date.now();
  let intervalId: NodeJS.Timeout | null = null;

  const updateActivity = () => {
    lastActivity = Date.now();
  };

  const start = () => {
    intervalId = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > timeout) {
        clearInterval(intervalId!);
        throw new Error(`Stall detected - no activity for ${timeout}ms`);
      }
    }, 1000);
  };

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  return { updateActivity, start, stop };
}

/**
 * Retry with exponential backoff and timeout
 */
export async function retryWithTimeout<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    timeout?: number;
    backoffMs?: number;
  } = {}
): Promise<T> {
  const { maxRetries = 3, timeout = TEST_TIMEOUTS.API, backoffMs = 1000 } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await withTimeout(fn, timeout);
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, backoffMs * Math.pow(2, attempt)));
    }
  }

  throw new Error('Retry exhausted');
}
