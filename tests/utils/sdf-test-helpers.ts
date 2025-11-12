/**
 * SDF TEST HELPERS - Phase 0.1.5
 * 
 * Comprehensive testing utilities for SDF rendering system.
 * Provides factories, matchers, and benchmark helpers.
 */

import { SDFScene, SDFPrimitive } from '../../engine/rendering/sdf/SDFPrimitives';
import { expect } from 'vitest';
import * as THREE from 'three';

/**
 * Factory function to create test SDF scenes with common configurations.
 */
export function createTestSDFScene(config?: {
  primitiveCount?: number;
  primitiveType?: SDFPrimitive['type'];
  withRotation?: boolean;
  withScale?: boolean;
  withOperations?: boolean;
  materialId?: string;
}): SDFScene {
  const {
    primitiveCount = 1,
    primitiveType = 'sphere',
    withRotation = false,
    withScale = false,
    withOperations = false,
    materialId = 'default'
  } = config || {};
  
  const primitives: SDFPrimitive[] = [];
  
  for (let i = 0; i < primitiveCount; i++) {
    const primitive: SDFPrimitive = {
      type: primitiveType,
      position: [i * 2, 0, 0],
      params: getPrimitiveDefaultParams(primitiveType),
      materialId,
    };
    
    if (withRotation) {
      primitive.rotation = [
        Math.PI / 4,
        Math.PI / 6,
        Math.PI / 8
      ];
    }
    
    if (withScale) {
      primitive.scale = [1.5, 1.2, 1.0];
    }
    
    if (withOperations && i > 0) {
      primitive.operation = 'smooth-union';
      primitive.operationStrength = 0.2;
    }
    
    primitives.push(primitive);
  }
  
  return {
    primitives,
    camera: {
      position: [0, 0, 5],
      target: [0, 0, 0]
    },
    lighting: {
      ambient: 0.3,
      directional: {
        direction: [1, 1, -1],
        intensity: 0.8
      }
    }
  };
}

/**
 * Get default parameters for a primitive type.
 */
function getPrimitiveDefaultParams(type: SDFPrimitive['type']): number[] {
  const defaults: Record<SDFPrimitive['type'], number[]> = {
    sphere: [1.0],
    box: [1.0, 1.0, 1.0],
    cylinder: [0.5, 1.0],
    cone: [0.8, 0.6, 1.0],
    pyramid: [1.0],
    torus: [0.8, 0.2],
    octahedron: [1.0],
    hexprism: [0.5, 1.0],
    capsule: [0, 1, 0, 0.3],
    porbital: [0.5],
    dorbital: [0.5],
    triPrism: [0.5, 1.0],
    ellipsoid: [1.0, 0.5, 0.3],
    roundedBox: [1.0, 1.0, 1.0, 0.1],
    cappedCylinder: [1.0, 0.5],
    plane: [0, 1, 0, 0],
    roundCone: [0.5, 0.2, 1.0],
    mengerSponge: [1.0],
    gyroid: [1.0, 0.1],
    superellipsoid: [0.5, 0.5, 1.0],
    torusKnot: [2.0, 3.0, 1.0]
  };
  
  return defaults[type] || [1.0];
}

/**
 * Create a molecular test scene (water, benzene, etc.)
 */
export function createMolecularScene(molecule: 'water' | 'hydrogen' | 'oxygen' | 'benzene'): SDFScene {
  const scenes = {
    water: {
      primitives: [
        { type: 'sphere' as const, position: [0, 0, 0] as [number, number, number], params: [0.35], materialId: 'element-o' },
        { 
          type: 'sphere' as const, 
          position: [-0.8, 0.6, 0] as [number, number, number], 
          params: [0.2], 
          materialId: 'element-h',
          operation: 'smooth-union' as const,
          operationStrength: 0.15
        },
        { 
          type: 'sphere' as const, 
          position: [0.8, 0.6, 0] as [number, number, number], 
          params: [0.2], 
          materialId: 'element-h',
          operation: 'smooth-union' as const,
          operationStrength: 0.15
        }
      ]
    },
    hydrogen: {
      primitives: [
        { type: 'sphere' as const, position: [-0.4, 0, 0] as [number, number, number], params: [0.2], materialId: 'element-h' },
        { 
          type: 'sphere' as const, 
          position: [0.4, 0, 0] as [number, number, number], 
          params: [0.2], 
          materialId: 'element-h',
          operation: 'smooth-union' as const,
          operationStrength: 0.1
        }
      ]
    },
    oxygen: {
      primitives: [
        { type: 'sphere' as const, position: [-0.6, 0, 0] as [number, number, number], params: [0.3], materialId: 'element-o' },
        { 
          type: 'sphere' as const, 
          position: [0.6, 0, 0] as [number, number, number], 
          params: [0.3], 
          materialId: 'element-o',
          operation: 'smooth-union' as const,
          operationStrength: 0.15
        }
      ]
    },
    benzene: {
      primitives: Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 0.7;
        return {
          type: 'sphere' as const,
          position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0] as [number, number, number],
          params: [0.25],
          materialId: 'element-c',
          operation: (i === 0 ? undefined : 'smooth-union') as any,
          operationStrength: 0.2
        };
      })
    }
  };
  
  const sceneData = scenes[molecule];
  
  return {
    primitives: sceneData.primitives,
    camera: { position: [0, 0, 3], target: [0, 0, 0] },
    lighting: { ambient: 0.3, directional: { direction: [1, 1, -1], intensity: 0.8 } }
  };
}

/**
 * CPU equivalents of GLSL SDF functions for testing.
 */
export const SDFCPUFunctions = {
  sphere: (p: [number, number, number], r: number): number => {
    return Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]) - r;
  },
  
  box: (p: [number, number, number], b: [number, number, number]): number => {
    const qx = Math.abs(p[0]) - b[0];
    const qy = Math.abs(p[1]) - b[1];
    const qz = Math.abs(p[2]) - b[2];
    
    const outsideDist = Math.sqrt(
      Math.max(qx, 0) ** 2 + Math.max(qy, 0) ** 2 + Math.max(qz, 0) ** 2
    );
    
    const insideDist = Math.min(Math.max(qx, Math.max(qy, qz)), 0);
    
    return outsideDist + insideDist;
  },
  
  torus: (p: [number, number, number], t: [number, number]): number => {
    const qx = Math.sqrt(p[0] * p[0] + p[2] * p[2]) - t[0];
    const qy = p[1];
    return Math.sqrt(qx * qx + qy * qy) - t[1];
  },
  
  cylinder: (p: [number, number, number], h: number, r: number): number => {
    const dx = Math.abs(Math.sqrt(p[0] * p[0] + p[2] * p[2])) - r;
    const dy = Math.abs(p[1]) - h;
    return Math.min(Math.max(dx, dy), 0) + Math.sqrt(Math.max(dx, 0) ** 2 + Math.max(dy, 0) ** 2);
  },
  
  union: (d1: number, d2: number): number => {
    return Math.min(d1, d2);
  },
  
  subtraction: (d1: number, d2: number): number => {
    return Math.max(-d1, d2);
  },
  
  intersection: (d1: number, d2: number): number => {
    return Math.max(d1, d2);
  },
  
  smoothUnion: (d1: number, d2: number, k: number): number => {
    const h = Math.max(0, Math.min(1, 0.5 + 0.5 * (d2 - d1) / k));
    return d2 * (1 - h) + d1 * h - k * h * (1 - h);
  },
  
  smoothSubtraction: (d1: number, d2: number, k: number): number => {
    const h = Math.max(0, Math.min(1, 0.5 - 0.5 * (d2 + d1) / k));
    return d2 * (1 - h) + (-d1) * h + k * h * (1 - h);
  },
  
  smoothIntersection: (d1: number, d2: number, k: number): number => {
    const h = Math.max(0, Math.min(1, 0.5 - 0.5 * (d2 - d1) / k));
    return d2 * (1 - h) + d1 * h + k * h * (1 - h);
  }
};

/**
 * Assert that a computed SDF distance matches expected value within tolerance.
 */
export function assertSDFDistance(
  point: [number, number, number],
  expectedDistance: number,
  sdfFunction: (p: [number, number, number]) => number,
  tolerance = 0.001
): void {
  const actualDistance = sdfFunction(point);
  expect(Math.abs(actualDistance - expectedDistance)).toBeLessThanOrEqual(tolerance);
}

/**
 * Assert that rendering performance meets 60fps target.
 */
export interface PerformanceMetrics {
  renderTime: number;
  frameTime: number;
  fps: number;
  primitiveCount: number;
}

export function assertRenderPerformance(
  metrics: PerformanceMetrics,
  targetFPS = 60,
  options?: {
    allowedDeviation?: number;
  }
): void {
  const { allowedDeviation = 0.8 } = options || {};
  const minFPS = targetFPS * allowedDeviation;
  
  expect(metrics.fps).toBeGreaterThanOrEqual(minFPS);
  expect(metrics.frameTime).toBeLessThanOrEqual(1000 / minFPS);
}

/**
 * Measure render performance for a test scenario.
 */
export function measureRenderPerformance(
  renderFn: () => void,
  primitiveCount: number
): PerformanceMetrics {
  const startTime = performance.now();
  renderFn();
  const endTime = performance.now();
  
  const renderTime = endTime - startTime;
  const frameTime = renderTime;
  const fps = 1000 / frameTime;
  
  return {
    renderTime,
    frameTime,
    fps,
    primitiveCount
  };
}

/**
 * Compare screenshot with baseline (for Playwright tests).
 */
export async function compareScreenshots(
  page: any,
  name: string,
  options?: {
    threshold?: number;
    maxDiffPixels?: number;
  }
): Promise<void> {
  const { threshold = 0.1, maxDiffPixels = 100 } = options || {};
  
  await page.screenshot({
    path: `test-results/screenshots/${name}.png`,
    animations: 'disabled'
  });
  
  await expect(page).toHaveScreenshot(`${name}.png`, {
    threshold,
    maxDiffPixels
  });
}

/**
 * Create a performance test scene with specified complexity.
 */
export function createPerformanceScene(primitiveCount: number): SDFScene {
  const primitives: SDFPrimitive[] = [];
  const types: SDFPrimitive['type'][] = [
    'sphere', 'box', 'cylinder', 'torus', 'cone',
    'octahedron', 'ellipsoid', 'roundedBox'
  ];
  
  for (let i = 0; i < primitiveCount; i++) {
    const typeIndex = i % types.length;
    const x = (i % 10) * 2 - 9;
    const y = Math.floor(i / 10) * 2 - 9;
    const z = Math.floor(i / 100) * 2;
    
    primitives.push({
      type: types[typeIndex],
      position: [x, y, z],
      params: getPrimitiveDefaultParams(types[typeIndex]),
      materialId: `element-${['h', 'o', 'c', 'fe'][i % 4]}`,
      rotation: [
        (i * 0.1) % (Math.PI * 2),
        (i * 0.2) % (Math.PI * 2),
        (i * 0.3) % (Math.PI * 2)
      ],
      scale: [
        1 + (i % 3) * 0.2,
        1 + (i % 5) * 0.1,
        1 + (i % 7) * 0.15
      ]
    });
  }
  
  return {
    primitives,
    camera: { position: [0, 0, 15], target: [0, 0, 0] },
    lighting: { ambient: 0.3, directional: { direction: [1, 1, -1], intensity: 0.8 } }
  };
}

/**
 * Validate SDF scene structure and constraints.
 */
export function validateSDFScene(scene: SDFScene): void {
  expect(scene).toBeDefined();
  expect(scene.primitives).toBeInstanceOf(Array);
  expect(scene.camera).toBeDefined();
  expect(scene.camera.position).toHaveLength(3);
  expect(scene.camera.target).toHaveLength(3);
  expect(scene.lighting).toBeDefined();
  
  for (const primitive of scene.primitives) {
    expect(primitive.type).toBeDefined();
    expect(primitive.position).toHaveLength(3);
    expect(primitive.params).toBeInstanceOf(Array);
    expect(primitive.params.length).toBeGreaterThan(0);
    expect(primitive.materialId).toBeDefined();
    
    if (primitive.rotation) {
      expect(primitive.rotation).toHaveLength(3);
    }
    
    if (primitive.scale) {
      expect(primitive.scale).toHaveLength(3);
    }
  }
}

/**
 * Create all 21 primitives showcase scene for visual regression testing.
 */
export function createAllPrimitivesShowcase(): SDFScene {
  const primitives: SDFPrimitive[] = [
    { type: 'sphere', position: [-6, 4, 0], params: [0.5], materialId: 'element-h' },
    { type: 'box', position: [-4, 4, 0], params: [0.4, 0.4, 0.4], materialId: 'element-o' },
    { type: 'cylinder', position: [-2, 4, 0], params: [0.5, 0.3], materialId: 'element-c' },
    { type: 'cone', position: [0, 4, 0], params: [0.5, 0.7, 0.6], materialId: 'element-fe' },
    { type: 'pyramid', position: [2, 4, 0], params: [0.5], materialId: 'element-h' },
    { type: 'torus', position: [4, 4, 0], params: [0.4, 0.15], materialId: 'element-o' },
    { type: 'octahedron', position: [6, 4, 0], params: [0.5], materialId: 'element-c' },
    
    { type: 'hexprism', position: [-6, 2, 0], params: [0.4, 0.6], materialId: 'element-fe' },
    { type: 'capsule', position: [-4, 2, 0], params: [0, 0.5, 0, 0.2], materialId: 'element-h' },
    { type: 'porbital', position: [-2, 2, 0], params: [0.4], materialId: 'element-o' },
    { type: 'dorbital', position: [0, 2, 0], params: [0.4], materialId: 'element-c' },
    { type: 'triPrism', position: [2, 2, 0], params: [0.4, 0.6], materialId: 'element-fe' },
    { type: 'ellipsoid', position: [4, 2, 0], params: [0.6, 0.3, 0.2], materialId: 'element-h' },
    { type: 'roundedBox', position: [6, 2, 0], params: [0.4, 0.4, 0.4, 0.1], materialId: 'element-o' },
    
    { type: 'cappedCylinder', position: [-6, 0, 0], params: [0.6, 0.3], materialId: 'element-c' },
    { type: 'plane', position: [-4, 0, 0], params: [0, 1, 0, 0.5], materialId: 'element-fe' },
    { type: 'roundCone', position: [-2, 0, 0], params: [0.4, 0.2, 0.8], materialId: 'element-h' },
    { type: 'mengerSponge', position: [0, 0, 0], params: [0.5], materialId: 'element-o' },
    { type: 'gyroid', position: [2, 0, 0], params: [1.5, 0.1], materialId: 'element-c' },
    { type: 'superellipsoid', position: [4, 0, 0], params: [0.5, 0.5, 0.5], materialId: 'element-fe' },
    { type: 'torusKnot', position: [6, 0, 0], params: [2.0, 3.0, 0.6], materialId: 'element-h' }
  ];
  
  return {
    primitives,
    camera: { position: [0, 2, 12], target: [0, 2, 0] },
    lighting: { ambient: 0.4, directional: { direction: [1, 1, -1], intensity: 1.0 } }
  };
}
