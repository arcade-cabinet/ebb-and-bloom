/**
 * SDF OPERATIONS TESTS - Phase 0.1.5
 * 
 * Comprehensive tests for SDF boolean operations.
 * Tests union, subtraction, intersection, and smooth variants.
 */

import { describe, it, expect } from 'vitest';
import { SDFCPUFunctions } from '../../../utils/sdf-test-helpers';

describe('SDF Operations', () => {
  describe('opUnion', () => {
    it('should return minimum of two distances', () => {
      const d1 = 1.0;
      const d2 = 2.0;
      const result = SDFCPUFunctions.union(d1, d2);
      expect(result).toBe(1.0);
    });
    
    it('should handle equal distances', () => {
      const d1 = 1.5;
      const d2 = 1.5;
      const result = SDFCPUFunctions.union(d1, d2);
      expect(result).toBe(1.5);
    });
    
    it('should handle negative distances', () => {
      const d1 = -0.5;
      const d2 = 0.5;
      const result = SDFCPUFunctions.union(d1, d2);
      expect(result).toBe(-0.5);
    });
    
    it('should be commutative', () => {
      const d1 = 1.0;
      const d2 = 2.0;
      const result1 = SDFCPUFunctions.union(d1, d2);
      const result2 = SDFCPUFunctions.union(d2, d1);
      expect(result1).toBe(result2);
    });
    
    it('should combine two spheres correctly', () => {
      const p: [number, number, number] = [0.5, 0, 0];
      const sphere1 = SDFCPUFunctions.sphere([p[0] - 0.5, p[1], p[2]], 0.5);
      const sphere2 = SDFCPUFunctions.sphere([p[0] + 0.5, p[1], p[2]], 0.5);
      const union = SDFCPUFunctions.union(sphere1, sphere2);
      
      expect(union).toBeLessThanOrEqual(Math.min(sphere1, sphere2));
    });
  });
  
  describe('opSubtraction', () => {
    it('should subtract second shape from first', () => {
      const d1 = 1.0;
      const d2 = 2.0;
      const result = SDFCPUFunctions.subtraction(d1, d2);
      expect(result).toBe(2.0);
    });
    
    it('should create interior when subtracting from inside', () => {
      const d1 = -0.5;
      const d2 = 1.0;
      const result = SDFCPUFunctions.subtraction(d1, d2);
      expect(result).toBe(1.0);
    });
    
    it('should handle overlapping shapes', () => {
      const d1 = 0.5;
      const d2 = -0.3;
      const result = SDFCPUFunctions.subtraction(d1, d2);
      expect(result).toBeLessThan(0);
    });
    
    it('should NOT be commutative', () => {
      const d1 = 1.0;
      const d2 = 2.0;
      const result1 = SDFCPUFunctions.subtraction(d1, d2);
      const result2 = SDFCPUFunctions.subtraction(d2, d1);
      expect(result1).not.toBe(result2);
    });
    
    it('should subtract sphere from box', () => {
      const p: [number, number, number] = [0, 0, 0];
      const box = SDFCPUFunctions.box(p, [1, 1, 1]);
      const sphere = SDFCPUFunctions.sphere(p, 0.7);
      const subtraction = SDFCPUFunctions.subtraction(sphere, box);
      
      expect(subtraction).toBeGreaterThan(box);
    });
  });
  
  describe('opIntersection', () => {
    it('should return maximum of two distances', () => {
      const d1 = 1.0;
      const d2 = 2.0;
      const result = SDFCPUFunctions.intersection(d1, d2);
      expect(result).toBe(2.0);
    });
    
    it('should handle equal distances', () => {
      const d1 = 1.5;
      const d2 = 1.5;
      const result = SDFCPUFunctions.intersection(d1, d2);
      expect(result).toBe(1.5);
    });
    
    it('should be commutative', () => {
      const d1 = 1.0;
      const d2 = 2.0;
      const result1 = SDFCPUFunctions.intersection(d1, d2);
      const result2 = SDFCPUFunctions.intersection(d2, d1);
      expect(result1).toBe(result2);
    });
    
    it('should create intersection of two shapes', () => {
      const d1 = -0.5;
      const d2 = -0.3;
      const result = SDFCPUFunctions.intersection(d1, d2);
      expect(result).toBe(-0.3);
    });
    
    it('should intersect box and sphere', () => {
      const p: [number, number, number] = [0, 0, 0];
      const box = SDFCPUFunctions.box(p, [1, 1, 1]);
      const sphere = SDFCPUFunctions.sphere(p, 1.2);
      const intersection = SDFCPUFunctions.intersection(box, sphere);
      
      expect(intersection).toBe(Math.max(box, sphere));
    });
  });
  
  describe('opSmoothUnion', () => {
    it('should blend smoothly between two shapes', () => {
      const d1 = 0.3;
      const d2 = 0.4;
      const k = 0.5;
      const result = SDFCPUFunctions.smoothUnion(d1, d2, k);
      
      expect(result).toBeLessThan(Math.min(d1, d2));
      expect(result).toBeGreaterThan(Math.min(d1, d2) - k);
    });
    
    it('should approach regular union when k is small', () => {
      const d1 = 1.0;
      const d2 = 2.0;
      const k = 0.001;
      const smoothResult = SDFCPUFunctions.smoothUnion(d1, d2, k);
      const regularUnion = SDFCPUFunctions.union(d1, d2);
      
      expect(smoothResult).toBeCloseTo(regularUnion, 2);
    });
    
    it('should be symmetric', () => {
      const d1 = 1.0;
      const d2 = 2.0;
      const k = 0.5;
      const result1 = SDFCPUFunctions.smoothUnion(d1, d2, k);
      const result2 = SDFCPUFunctions.smoothUnion(d2, d1, k);
      
      expect(result1).toBeCloseTo(result2, 5);
    });
    
    it('should create smooth blend with larger k', () => {
      const d1 = 0.5;
      const d2 = 0.5;
      const k = 0.5;
      const result = SDFCPUFunctions.smoothUnion(d1, d2, k);
      
      expect(result).toBeLessThan(0.5);
    });
    
    it('should handle negative distances (overlapping shapes)', () => {
      const d1 = -0.3;
      const d2 = -0.4;
      const k = 0.3;
      const result = SDFCPUFunctions.smoothUnion(d1, d2, k);
      
      expect(result).toBeLessThan(Math.min(d1, d2));
    });
  });
  
  describe('opSmoothSubtraction', () => {
    it('should blend subtraction smoothly', () => {
      const d1 = 0.3;
      const d2 = 0.4;
      const k = 0.5;
      const result = SDFCPUFunctions.smoothSubtraction(d1, d2, k);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('number');
    });
    
    it('should approach regular subtraction when k is small', () => {
      const d1 = 1.0;
      const d2 = 2.0;
      const k = 0.001;
      const smoothResult = SDFCPUFunctions.smoothSubtraction(d1, d2, k);
      const regularSubtraction = SDFCPUFunctions.subtraction(d1, d2);
      
      expect(smoothResult).toBeCloseTo(regularSubtraction, 2);
    });
    
    it('should NOT be symmetric', () => {
      const d1 = 1.0;
      const d2 = 2.0;
      const k = 0.5;
      const result1 = SDFCPUFunctions.smoothSubtraction(d1, d2, k);
      const result2 = SDFCPUFunctions.smoothSubtraction(d2, d1, k);
      
      expect(result1).not.toBeCloseTo(result2, 5);
    });
  });
  
  describe('opSmoothIntersection', () => {
    it('should blend intersection smoothly', () => {
      const d1 = 0.3;
      const d2 = 0.4;
      const k = 0.5;
      const result = SDFCPUFunctions.smoothIntersection(d1, d2, k);
      const hardIntersection = SDFCPUFunctions.intersection(d1, d2);
      
      expect(result).toBeGreaterThan(hardIntersection);
    });
    
    it('should approach regular intersection when k is small', () => {
      const d1 = 1.0;
      const d2 = 2.0;
      const k = 0.001;
      const smoothResult = SDFCPUFunctions.smoothIntersection(d1, d2, k);
      const regularIntersection = SDFCPUFunctions.intersection(d1, d2);
      
      expect(smoothResult).toBeCloseTo(regularIntersection, 2);
    });
    
    it('should be symmetric', () => {
      const d1 = 1.0;
      const d2 = 2.0;
      const k = 0.5;
      const result1 = SDFCPUFunctions.smoothIntersection(d1, d2, k);
      const result2 = SDFCPUFunctions.smoothIntersection(d2, d1, k);
      
      expect(result1).toBeCloseTo(result2, 5);
    });
  });
  
  describe('Operation Composition', () => {
    it('should allow chaining multiple operations', () => {
      const p: [number, number, number] = [0, 0, 0];
      const sphere1 = SDFCPUFunctions.sphere([p[0] - 1, p[1], p[2]], 0.6);
      const sphere2 = SDFCPUFunctions.sphere([p[0] + 1, p[1], p[2]], 0.6);
      const box = SDFCPUFunctions.box(p, [0.8, 0.8, 0.8]);
      
      const union = SDFCPUFunctions.union(sphere1, sphere2);
      const subtraction = SDFCPUFunctions.subtraction(box, union);
      
      expect(subtraction).toBeDefined();
    });
    
    it('should combine union and intersection', () => {
      const d1 = -0.5;
      const d2 = -0.3;
      const d3 = -0.4;
      
      const union = SDFCPUFunctions.union(d1, d2);
      const intersection = SDFCPUFunctions.intersection(union, d3);
      
      expect(intersection).toBe(Math.max(union, d3));
    });
    
    it('should create complex CSG operations', () => {
      const p: [number, number, number] = [0, 0, 0];
      
      const mainSphere = SDFCPUFunctions.sphere(p, 1.0);
      const cutSphere = SDFCPUFunctions.sphere([p[0] + 0.5, p[1], p[2]], 0.7);
      const addSphere = SDFCPUFunctions.sphere([p[0] - 0.8, p[1], p[2]], 0.4);
      
      const subtracted = SDFCPUFunctions.subtraction(cutSphere, mainSphere);
      const final = SDFCPUFunctions.union(subtracted, addSphere);
      
      expect(final).toBeDefined();
    });
  });
  
  describe('Mathematical Properties', () => {
    it('union should be associative', () => {
      const d1 = 1.0;
      const d2 = 2.0;
      const d3 = 3.0;
      
      const result1 = SDFCPUFunctions.union(SDFCPUFunctions.union(d1, d2), d3);
      const result2 = SDFCPUFunctions.union(d1, SDFCPUFunctions.union(d2, d3));
      
      expect(result1).toBe(result2);
    });
    
    it('intersection should be associative', () => {
      const d1 = 1.0;
      const d2 = 2.0;
      const d3 = 3.0;
      
      const result1 = SDFCPUFunctions.intersection(SDFCPUFunctions.intersection(d1, d2), d3);
      const result2 = SDFCPUFunctions.intersection(d1, SDFCPUFunctions.intersection(d2, d3));
      
      expect(result1).toBe(result2);
    });
    
    it('union should have identity element (infinity)', () => {
      const d = 1.0;
      const infinity = Number.MAX_VALUE;
      const result = SDFCPUFunctions.union(d, infinity);
      
      expect(result).toBe(d);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle zero distances', () => {
      const result = SDFCPUFunctions.union(0, 0);
      expect(result).toBe(0);
    });
    
    it('should handle very large distances', () => {
      const d1 = 1000000;
      const d2 = 2000000;
      const result = SDFCPUFunctions.union(d1, d2);
      expect(result).toBe(d1);
    });
    
    it('should handle smooth union with k=0', () => {
      const d1 = 1.0;
      const d2 = 2.0;
      const result = SDFCPUFunctions.smoothUnion(d1, d2, 0);
      
      expect(result).toBe(SDFCPUFunctions.union(d1, d2));
    });
    
    it('should handle smooth operations with very large k', () => {
      const d1 = 1.0;
      const d2 = 2.0;
      const k = 10.0;
      const result = SDFCPUFunctions.smoothUnion(d1, d2, k);
      
      expect(result).toBeDefined();
      expect(result).toBeLessThan(d1);
    });
  });
  
  describe('Practical Scenarios', () => {
    it('should create smooth molecular bonds', () => {
      const atom1Pos: [number, number, number] = [-0.5, 0, 0];
      const atom2Pos: [number, number, number] = [0.5, 0, 0];
      
      const atom1 = SDFCPUFunctions.sphere(atom1Pos, 0.3);
      const atom2 = SDFCPUFunctions.sphere(atom2Pos, 0.3);
      
      const hardUnion = SDFCPUFunctions.union(atom1, atom2);
      const smoothUnion = SDFCPUFunctions.smoothUnion(atom1, atom2, 0.15);
      
      expect(smoothUnion).toBeLessThan(hardUnion);
    });
    
    it('should create cutout effects for molecular orbitals', () => {
      const mainOrbital: [number, number, number] = [0, 0, 0];
      const cutout: [number, number, number] = [0, 0, 0];
      
      const orbital = SDFCPUFunctions.sphere(mainOrbital, 1.0);
      const cut = SDFCPUFunctions.sphere(cutout, 0.5);
      
      const result = SDFCPUFunctions.subtraction(cut, orbital);
      
      expect(result).toBeGreaterThan(orbital);
    });
  });
});
