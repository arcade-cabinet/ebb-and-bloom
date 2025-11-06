/**
 * Test Setup - Global test configuration
 */

import { vi } from 'vitest';

// Mock Capacitor Haptics for tests
vi.mock('@capacitor/haptics', () => ({
  Haptics: {
    impact: vi.fn(),
    vibrate: vi.fn()
  }
}));

// Mock Phaser for tests
global.Phaser = {
  Scene: class {},
  Game: class {},
  Math: {
    Between: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
  }
} as any;
