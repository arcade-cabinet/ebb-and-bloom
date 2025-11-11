/**
 * Test Utilities
 * 
 * Shared helper functions for tests.
 */

/**
 * Assert value is within range [min, max]
 */
export function assertInRange(value: number, min: number, max: number, message?: string): void {
  if (value < min || value > max) {
    throw new Error(
      message || `Expected ${value} to be in range [${min}, ${max}]`
    );
  }
}

/**
 * Assert value is close to expected within tolerance
 */
export function assertCloseTo(value: number, expected: number, tolerance: number): void {
  const diff = Math.abs(value - expected);
  if (diff > tolerance) {
    throw new Error(
      `Expected ${value} to be close to ${expected} (tolerance: ${tolerance}), but diff was ${diff}`
    );
  }
}

/**
 * Create array of test cases for parameterized testing
 */
export function createTestCases<T>(cases: T[]): T[] {
  return cases;
}
