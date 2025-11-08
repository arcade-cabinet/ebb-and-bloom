/**
 * Vitest setup file for frontend tests
 * Mocks BabylonJS and browser APIs
 */

import { vi } from 'vitest';

// Mock BabylonJS Engine
global.HTMLCanvasElement = class HTMLCanvasElement {
  getContext() {
    return {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Array(4) })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => []),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      transform: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
    };
  }
  addEventListener: any = vi.fn();
  removeEventListener: any = vi.fn();
  width = 800;
  height = 600;
} as any;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:5174',
    search: '',
    pathname: '/',
  },
  writable: true,
});

// Mock fetch
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Timeout and stall protection
const TEST_TIMEOUT = 10000; // 10 seconds
const STALL_DETECTION_INTERVAL = 1000; // Check every second

// Global test timeout
if (typeof globalThis.setTimeout !== 'undefined') {
  const originalSetTimeout = globalThis.setTimeout;
  globalThis.setTimeout = function(fn: any, delay: number, ...args: any[]) {
    // Cap timeouts at test timeout
    const cappedDelay = Math.min(delay, TEST_TIMEOUT);
    return originalSetTimeout(fn, cappedDelay, ...args);
  };
}

// Stall detection for async operations
let lastActivity = Date.now();
const activityCheck = setInterval(() => {
  const now = Date.now();
  if (now - lastActivity > TEST_TIMEOUT * 2) {
    console.error('Test stall detected - no activity for', now - lastActivity, 'ms');
    clearInterval(activityCheck);
  }
}, STALL_DETECTION_INTERVAL);

// Update activity on any async operation
const originalFetch = global.fetch;
global.fetch = function(...args: any[]) {
  lastActivity = Date.now();
  return originalFetch.apply(this, args);
};

