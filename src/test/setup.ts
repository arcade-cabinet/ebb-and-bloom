/**
 * Test Setup - Global test configuration for ecosystem testing
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Capacitor for unit testing
globalThis.Capacitor = {
  isNativePlatform: vi.fn(() => false),
  getPlatform: vi.fn(() => 'web'),
  Plugins: {}
} as any;

// Mock Three.js WebGL for headless testing
const mockWebGLContext = {
  getExtension: vi.fn(),
  getParameter: vi.fn(() => 16), // MAX_TEXTURE_SIZE
  createShader: vi.fn(),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  createProgram: vi.fn(),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  useProgram: vi.fn(),
  createTexture: vi.fn(),
  bindTexture: vi.fn(),
  texParameteri: vi.fn(),
  texImage2D: vi.fn()
};

Object.defineProperty(globalThis.HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn((type: string) => {
    if (type === 'webgl' || type === 'webgl2') {
      return mockWebGLContext;
    }
    if (type === '2d') {
      return {
        fillRect: vi.fn(),
        fillStyle: '',
        clearRect: vi.fn(),
        getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
        putImageData: vi.fn(),
        createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) }))
      };
    }
    return null;
  })
});

// Mock performance API
globalThis.performance = globalThis.performance || {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn()
} as any;

// Mock requestAnimationFrame
globalThis.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
globalThis.cancelAnimationFrame = vi.fn();

// Mock SimplexNoise for deterministic testing
vi.mock('simplex-noise', () => ({
  SimplexNoise: class MockSimplexNoise {
    noise2D(x: number, y: number): number {
      return Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.5;
    }
    
    noise3D(x: number, y: number, z: number): number {
      return Math.sin(x * 0.1) * Math.cos(y * 0.1) * Math.sin(z * 0.1) * 0.5;
    }
  }
}));

// Mock three-terrain for testing
vi.mock('three-terrain', () => ({
  DiamondSquare: vi.fn(),
  Erosion: vi.fn(),
  HeightTexture: vi.fn()
}));

// Mock Yuka for testing
vi.mock('yuka', () => ({
  EntityManager: class MockEntityManager {
    add = vi.fn();
    remove = vi.fn(); 
    update = vi.fn();
  },
  Time: class MockTime {
    update = vi.fn();
    getDelta = vi.fn(() => 0.016);
  },
  Vehicle: class MockVehicle {
    position = { x: 0, y: 0, z: 0, set: vi.fn(), copy: vi.fn() };
    velocity = { x: 0, y: 0, z: 0, length: vi.fn(() => 0) };
    steering = { add: vi.fn(), behaviors: [] };
    maxSpeed = 5;
    maxForce = 2;
  },
  WanderBehavior: class MockWanderBehavior {
    radius = 10;
    distance = 8;
    jitter = 2;
  },
  SeekBehavior: class MockSeekBehavior {
    target = null;
    weight = 1;
  },
  EvadeBehavior: class MockEvadeBehavior {
    panicDistance = 8;
    weight = 1;
  },
  FlockBehavior: class MockFlockBehavior {
    weight = 1;
  }
}));

console.log('Ecosystem test setup complete - All APIs mocked for TDD');
