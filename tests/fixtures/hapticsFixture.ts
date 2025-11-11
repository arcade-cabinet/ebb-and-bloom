/**
 * Haptics Test Fixture
 * 
 * Provides Capacitor Haptics API mocking utilities for testing haptic feedback systems.
 * 
 * IMPORTANT: This fixture requires the test file to set up the mock at module level:
 * 
 * ```typescript
 * import { vi } from 'vitest';
 * 
 * const mockHaptics = {
 *   vibrate: vi.fn().mockResolvedValue(undefined),
 *   impact: vi.fn().mockResolvedValue(undefined),
 *   notification: vi.fn().mockResolvedValue(undefined),
 * };
 * 
 * vi.mock('@capacitor/haptics', () => ({
 *   Haptics: mockHaptics,
 *   ImpactStyle: { Light: 'LIGHT', Medium: 'MEDIUM', Heavy: 'HEAVY' },
 *   NotificationType: { Success: 'SUCCESS', Warning: 'WARNING', Error: 'ERROR' },
 * }));
 * ```
 */

import { beforeEach, vi } from 'vitest';
import type { ImpactStyle } from '@capacitor/haptics';

export interface MockHapticsAPI {
  vibrate: ReturnType<typeof vi.fn>;
  impact: ReturnType<typeof vi.fn>;
  notification: ReturnType<typeof vi.fn>;
}

export interface HapticsFixture {
  mockHaptics: MockHapticsAPI;
  resetMocks: () => void;
  getImpactCalls: () => { style: ImpactStyle }[];
  getVibrateCalls: () => { duration: number }[];
}

export function setupHapticsFixture(mockHaptics: MockHapticsAPI): HapticsFixture {
  const resetMocks = () => {
    mockHaptics.vibrate.mockClear();
    mockHaptics.impact.mockClear();
    mockHaptics.notification.mockClear();
  };

  beforeEach(() => {
    resetMocks();
  });

  return {
    mockHaptics,
    resetMocks,
    getImpactCalls: () => mockHaptics.impact.mock.calls.map(call => call[0]),
    getVibrateCalls: () => mockHaptics.vibrate.mock.calls.map(call => call[0]),
  };
}
