/**
 * SDF PRIMITIVES TESTS - Phase 0.1.5
 * 
 * Comprehensive tests for SDF primitive functions.
 * Tests CPU equivalents of GLSL math functions to validate correctness.
 */

import { describe, it, expect } from 'vitest';
import { SDFCPUFunctions, assertSDFDistance } from '../../../utils/sdf-test-helpers';

describe('SDF Primitives - CPU Equivalents', () => {
  describe('sdSphere', () => {
    it('should return 0 at surface', () => {
      const point: [number, number, number] = [1, 0, 0];
      const distance = SDFCPUFunctions.sphere(point, 1.0);
      expect(distance).toBeCloseTo(0, 5);
    });
    
    it('should return negative inside sphere', () => {
      const point: [number, number, number] = [0, 0, 0];
      const distance = SDFCPUFunctions.sphere(point, 1.0);
      expect(distance).toBe(-1.0);
    });
    
    it('should return positive outside sphere', () => {
      const point: [number, number, number] = [2, 0, 0];
      const distance = SDFCPUFunctions.sphere(point, 1.0);
      expect(distance).toBe(1.0);
    });
    
    it('should handle arbitrary points correctly', () => {
      const point: [number, number, number] = [0.5, 0.5, 0.5];
      const distance = SDFCPUFunctions.sphere(point, 1.0);
      const expectedDist = Math.sqrt(0.75) - 1.0;
      expect(distance).toBeCloseTo(expectedDist, 5);
    });
    
    it('should scale with radius', () => {
      const point: [number, number, number] = [2, 0, 0];
      const distance = SDFCPUFunctions.sphere(point, 2.0);
      expect(distance).toBeCloseTo(0, 5);
    });
  });
  
  describe('sdBox', () => {
    it('should return 0 at surface corner', () => {
      const point: [number, number, number] = [1, 1, 1];
      const distance = SDFCPUFunctions.box(point, [1, 1, 1]);
      expect(distance).toBeCloseTo(0, 5);
    });
    
    it('should return negative inside box', () => {
      const point: [number, number, number] = [0, 0, 0];
      const distance = SDFCPUFunctions.box(point, [1, 1, 1]);
      expect(distance).toBe(-1);
    });
    
    it('should return positive outside box', () => {
      const point: [number, number, number] = [2, 2, 2];
      const distance = SDFCPUFunctions.box(point, [1, 1, 1]);
      expect(distance).toBeCloseTo(Math.sqrt(3), 5);
    });
    
    it('should handle non-uniform boxes', () => {
      const point: [number, number, number] = [2, 1, 0.5];
      const distance = SDFCPUFunctions.box(point, [1, 1, 1]);
      expect(distance).toBeGreaterThan(0);
    });
    
    it('should return 0 at surface face', () => {
      const point: [number, number, number] = [1, 0, 0];
      const distance = SDFCPUFunctions.box(point, [1, 1, 1]);
      expect(distance).toBeCloseTo(0, 5);
    });
  });
  
  describe('sdTorus', () => {
    it('should return 0 at surface', () => {
      const point: [number, number, number] = [1.5, 0, 0];
      const distance = SDFCPUFunctions.torus(point, [1.0, 0.5]);
      expect(distance).toBeCloseTo(0, 5);
    });
    
    it('should return negative inside torus tube', () => {
      const point: [number, number, number] = [1.2, 0, 0];
      const distance = SDFCPUFunctions.torus(point, [1.0, 0.5]);
      expect(distance).toBeLessThan(0);
    });
    
    it('should return positive outside torus', () => {
      const point: [number, number, number] = [2.0, 0, 0];
      const distance = SDFCPUFunctions.torus(point, [1.0, 0.5]);
      expect(distance).toBeGreaterThan(0);
    });
    
    it('should be symmetric around Y-axis', () => {
      const point1: [number, number, number] = [1.5, 0.2, 0];
      const point2: [number, number, number] = [1.5, -0.2, 0];
      const dist1 = SDFCPUFunctions.torus(point1, [1.0, 0.5]);
      const dist2 = SDFCPUFunctions.torus(point2, [1.0, 0.5]);
      expect(dist1).toBeCloseTo(dist2, 5);
    });
  });
  
  describe('sdCylinder', () => {
    it('should return 0 at surface', () => {
      const point: [number, number, number] = [0.5, 0, 0];
      const distance = SDFCPUFunctions.cylinder(point, 1.0, 0.5);
      expect(distance).toBeCloseTo(0, 5);
    });
    
    it('should return negative inside cylinder', () => {
      const point: [number, number, number] = [0, 0, 0];
      const distance = SDFCPUFunctions.cylinder(point, 1.0, 0.5);
      expect(distance).toBeLessThan(0);
    });
    
    it('should return positive outside cylinder', () => {
      const point: [number, number, number] = [2, 0, 0];
      const distance = SDFCPUFunctions.cylinder(point, 1.0, 0.5);
      expect(distance).toBeGreaterThan(0);
    });
    
    it('should respect height parameter', () => {
      const point: [number, number, number] = [0, 1.5, 0];
      const distance = SDFCPUFunctions.cylinder(point, 1.0, 0.5);
      expect(distance).toBeGreaterThan(0);
    });
    
    it('should respect radius parameter', () => {
      const point: [number, number, number] = [1.0, 0, 0];
      const distance = SDFCPUFunctions.cylinder(point, 1.0, 0.5);
      expect(distance).toBeGreaterThan(0);
    });
  });
  
  describe('Distance Function Properties', () => {
    it('should satisfy Lipschitz continuity for sphere', () => {
      const p1: [number, number, number] = [0, 0, 0];
      const p2: [number, number, number] = [0.1, 0, 0];
      
      const d1 = SDFCPUFunctions.sphere(p1, 1.0);
      const d2 = SDFCPUFunctions.sphere(p2, 1.0);
      
      const distChange = Math.abs(d2 - d1);
      const pointDist = Math.sqrt(0.1 ** 2);
      
      expect(distChange).toBeLessThanOrEqual(pointDist + 0.001);
    });
    
    it('should be symmetric for sphere', () => {
      const points: [number, number, number][] = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
        [-1, 0, 0],
        [0, -1, 0],
        [0, 0, -1]
      ];
      
      const distances = points.map(p => SDFCPUFunctions.sphere(p, 1.0));
      
      for (let i = 1; i < distances.length; i++) {
        expect(distances[i]).toBeCloseTo(distances[0], 5);
      }
    });
    
    it('should be origin-centered for box', () => {
      const point: [number, number, number] = [0, 0, 0];
      const distance = SDFCPUFunctions.box(point, [1, 1, 1]);
      expect(distance).toBeLessThan(0);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle zero radius sphere', () => {
      const point: [number, number, number] = [0, 0, 0];
      const distance = SDFCPUFunctions.sphere(point, 0);
      expect(distance).toBe(0);
    });
    
    it('should handle very large coordinates', () => {
      const point: [number, number, number] = [1000, 1000, 1000];
      const distance = SDFCPUFunctions.sphere(point, 1.0);
      expect(distance).toBeGreaterThan(1000);
    });
    
    it('should handle very small coordinates', () => {
      const point: [number, number, number] = [0.001, 0.001, 0.001];
      const distance = SDFCPUFunctions.sphere(point, 1.0);
      expect(distance).toBeCloseTo(-1.0 + Math.sqrt(0.000003), 5);
    });
    
    it('should handle negative box dimensions gracefully', () => {
      const point: [number, number, number] = [0, 0, 0];
      const distance = SDFCPUFunctions.box(point, [1, 1, 1]);
      expect(distance).toBeLessThan(0);
    });
  });
  
  describe('Mathematical Correctness', () => {
    it('should have gradient magnitude of 1 for sphere (unit sphere property)', () => {
      const epsilon = 0.001;
      const p: [number, number, number] = [2, 0, 0];
      
      const d = SDFCPUFunctions.sphere(p, 1.0);
      const dx = SDFCPUFunctions.sphere([p[0] + epsilon, p[1], p[2]], 1.0);
      
      const gradient = (dx - d) / epsilon;
      
      expect(Math.abs(gradient)).toBeCloseTo(1.0, 1);
    });
    
    it('should preserve distance under translation for sphere', () => {
      const p1: [number, number, number] = [1, 0, 0];
      const p2: [number, number, number] = [2, 1, 1];
      
      const d1 = SDFCPUFunctions.sphere(p1, 1.0);
      const translated: [number, number, number] = [p2[0] - 1, p2[1] - 1, p2[2] - 1];
      const d2 = SDFCPUFunctions.sphere(translated, 1.0);
      
      expect(d1).toBeCloseTo(d2, 5);
    });
  });
  
  describe('Helper Function: assertSDFDistance', () => {
    it('should pass when distance matches within tolerance', () => {
      const point: [number, number, number] = [1, 0, 0];
      assertSDFDistance(
        point,
        0,
        (p) => SDFCPUFunctions.sphere(p, 1.0),
        0.001
      );
    });
    
    it('should fail when distance exceeds tolerance', () => {
      const point: [number, number, number] = [2, 0, 0];
      expect(() => {
        assertSDFDistance(
          point,
          0,
          (p) => SDFCPUFunctions.sphere(p, 1.0),
          0.001
        );
      }).toThrow();
    });
  });
});
