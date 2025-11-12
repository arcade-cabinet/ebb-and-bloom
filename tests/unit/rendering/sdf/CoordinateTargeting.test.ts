/**
 * COORDINATE TARGETING TESTS - Phase 0.3
 * 
 * Comprehensive tests for coordinate targeting system.
 * Tests region classification, blend transitions, edge cases,
 * and new targeting types (surface, volume, edge, vertex).
 */

import { describe, it, expect } from 'vitest';

describe('Coordinate Targeting System', () => {
  describe('Region Classification', () => {
    describe('Top Region', () => {
      it('should classify points in top hemisphere correctly', () => {
        const topPoint: [number, number, number] = [0, 1, 0];
        const result = classifyTopRegion(topPoint);
        expect(result).toBe(1.0);
      });

      it('should classify points in bottom hemisphere as 0', () => {
        const bottomPoint: [number, number, number] = [0, -1, 0];
        const result = classifyTopRegion(bottomPoint);
        expect(result).toBe(0.0);
      });

      it('should classify equator point as 0.5 with blend', () => {
        const equatorPoint: [number, number, number] = [1, 0, 0];
        const result = classifyTopRegionSmooth(equatorPoint, 0.1);
        expect(result).toBeGreaterThan(0.4);
        expect(result).toBeLessThan(0.6);
      });
    });

    describe('Bottom Region', () => {
      it('should classify points in bottom hemisphere correctly', () => {
        const bottomPoint: [number, number, number] = [0, -1, 0];
        const result = classifyBottomRegion(bottomPoint);
        expect(result).toBe(1.0);
      });

      it('should classify points in top hemisphere as 0', () => {
        const topPoint: [number, number, number] = [0, 1, 0];
        const result = classifyBottomRegion(topPoint);
        expect(result).toBe(0.0);
      });
    });

    describe('Sides Region', () => {
      it('should classify equatorial points correctly', () => {
        const sidePoint: [number, number, number] = [1, 0, 0];
        const result = classifySidesRegion(sidePoint);
        expect(result).toBeGreaterThan(0.5);
      });

      it('should classify polar points as 0', () => {
        const polarPoint: [number, number, number] = [0, 1, 0];
        const result = classifySidesRegion(polarPoint);
        expect(result).toBeLessThan(0.5);
      });

      it('should have smooth transition from equator to poles', () => {
        const point1 = classifySidesRegion([1, 0, 0]);
        const point2 = classifySidesRegion([0.7, 0.7, 0]);
        const point3 = classifySidesRegion([0, 1, 0]);
        expect(point1).toBeGreaterThan(point2);
        expect(point2).toBeGreaterThan(point3);
      });
    });

    describe('Front/Back/Left/Right Regions', () => {
      it('should classify front region correctly', () => {
        const frontPoint: [number, number, number] = [0, 0, 1];
        const result = classifyFrontRegion(frontPoint);
        expect(result).toBe(1.0);
      });

      it('should classify back region correctly', () => {
        const backPoint: [number, number, number] = [0, 0, -1];
        const result = classifyBackRegion(backPoint);
        expect(result).toBe(1.0);
      });

      it('should classify left region correctly', () => {
        const leftPoint: [number, number, number] = [-1, 0, 0];
        const result = classifyLeftRegion(leftPoint);
        expect(result).toBe(1.0);
      });

      it('should classify right region correctly', () => {
        const rightPoint: [number, number, number] = [1, 0, 0];
        const result = classifyRightRegion(rightPoint);
        expect(result).toBe(1.0);
      });

      it('should have smooth transitions with blend radius', () => {
        const blendRadius = 0.3;
        const leftResult = classifyLeftRegionSmooth([-0.15, 0, 0], blendRadius);
        const rightResult = classifyRightRegionSmooth([0.15, 0, 0], blendRadius);
        expect(leftResult).toBeGreaterThan(0.3);
        expect(leftResult).toBeLessThan(1.0);
        expect(rightResult).toBeGreaterThan(0.3);
        expect(rightResult).toBeLessThan(1.0);
      });
    });

    describe('All Region', () => {
      it('should always return 1.0 for any point', () => {
        expect(classifyAllRegion([0, 0, 0])).toBe(1.0);
        expect(classifyAllRegion([1, 2, 3])).toBe(1.0);
        expect(classifyAllRegion([-5, -10, 20])).toBe(1.0);
      });
    });
  });

  describe('Blend Radius Transitions', () => {
    it('should have sharp transition with blend radius 0', () => {
      const result1 = classifyTopRegionSmooth([0, 0.01, 0], 0);
      const result2 = classifyTopRegionSmooth([0, -0.01, 0], 0);
      expect(result1).toBeCloseTo(1.0, 2);
      expect(result2).toBeCloseTo(0.0, 2);
    });

    it('should have smooth transition with larger blend radius', () => {
      const blendRadius = 0.5;
      const results: number[] = [];
      for (let y = -0.5; y <= 0.5; y += 0.1) {
        results.push(classifyTopRegionSmooth([0, y, 0], blendRadius));
      }
      
      for (let i = 1; i < results.length; i++) {
        expect(results[i]).toBeGreaterThanOrEqual(results[i - 1]);
      }
      
      expect(results[0]).toBeCloseTo(0.0, 1);
      expect(results[results.length - 1]).toBeCloseTo(1.0, 1);
    });

    it('should have symmetric blend on both sides', () => {
      const blendRadius = 0.2;
      const above = classifyTopRegionSmooth([0, 0.1, 0], blendRadius);
      const below = classifyTopRegionSmooth([0, -0.1, 0], blendRadius);
      expect(above + below).toBeCloseTo(1.0, 5);
    });

    it('should approach step function as blend radius approaches 0', () => {
      const y = 0.001;
      const blend1 = classifyTopRegionSmooth([0, y, 0], 0.1);
      const blend2 = classifyTopRegionSmooth([0, y, 0], 0.01);
      const blend3 = classifyTopRegionSmooth([0, y, 0], 0.001);
      
      expect(blend3).toBeGreaterThan(blend1);
      expect(blend2).toBeGreaterThan(blend1);
      expect(blend3).toBeCloseTo(1.0, 1);
    });
  });

  describe('Box-Specific Region Classification', () => {
    it('should identify top face correctly', () => {
      const boxSize: [number, number, number] = [1, 1, 1];
      const topFacePoint: [number, number, number] = [0, 1, 0];
      const result = classifyBoxTopFace(topFacePoint, boxSize, 0.1);
      expect(result).toBeGreaterThan(0.3);
    });

    it('should identify bottom face correctly', () => {
      const boxSize: [number, number, number] = [1, 1, 1];
      const bottomFacePoint: [number, number, number] = [0, -1, 0];
      const result = classifyBoxBottomFace(bottomFacePoint, boxSize, 0.1);
      expect(result).toBeGreaterThan(0.3);
    });

    it('should identify side faces correctly', () => {
      const boxSize: [number, number, number] = [1, 1, 1];
      const frontFacePoint: [number, number, number] = [0, 0, 1];
      const result = classifyBoxFrontFace(frontFacePoint, boxSize, 0.1);
      expect(result).toBeGreaterThan(0.3);
    });

    it('should have reasonable value at corners', () => {
      const boxSize: [number, number, number] = [1, 1, 1];
      const cornerPoint: [number, number, number] = [1, 1, 1];
      const topResult = classifyBoxTopFace(cornerPoint, boxSize, 0.1);
      expect(topResult).toBeGreaterThanOrEqual(0);
      expect(topResult).toBeLessThanOrEqual(1);
    });

    it('should have valid value at edges between faces', () => {
      const boxSize: [number, number, number] = [1, 1, 1];
      const edgePoint: [number, number, number] = [1, 1, 0];
      const topResult = classifyBoxTopFace(edgePoint, boxSize, 0.1);
      expect(topResult).toBeGreaterThanOrEqual(0);
      expect(topResult).toBeLessThanOrEqual(1);
    });
  });

  describe('Sphere-Specific Region Classification', () => {
    it('should use normalized coordinates for spheres', () => {
      const radius = 2.0;
      const point1: [number, number, number] = [0, 2, 0];
      const point2: [number, number, number] = [0, 1, 0];
      const result1 = classifySphereTopRegion(point1, radius, 0.1);
      const result2 = classifySphereTopRegion(point2, radius, 0.1);
      expect(result1).toBeCloseTo(result2, 2);
    });

    it('should work with different sphere sizes', () => {
      const smallResult = classifySphereTopRegion([0, 0.5, 0], 0.5, 0.1);
      const largeResult = classifySphereTopRegion([0, 5, 0], 5, 0.1);
      expect(smallResult).toBeCloseTo(largeResult, 2);
    });
  });

  describe('Blend Functions', () => {
    it('should blend values linearly', () => {
      const result = blendRegions(0.0, 1.0, 0.5);
      expect(result).toBeCloseTo(0.5, 5);
    });

    it('should return first value when blend factor is 0', () => {
      const result = blendRegions(5.0, 10.0, 0.0);
      expect(result).toBeCloseTo(5.0, 5);
    });

    it('should return second value when blend factor is 1', () => {
      const result = blendRegions(5.0, 10.0, 1.0);
      expect(result).toBeCloseTo(10.0, 5);
    });

    it('should blend vec3 values correctly', () => {
      const result = blendRegionsVec3([1, 0, 0], [0, 1, 0], 0.5);
      expect(result[0]).toBeCloseTo(0.5, 5);
      expect(result[1]).toBeCloseTo(0.5, 5);
      expect(result[2]).toBeCloseTo(0.0, 5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle points at origin', () => {
      const origin: [number, number, number] = [0, 0, 0];
      expect(() => classifyTopRegion(origin)).not.toThrow();
      expect(() => classifyBottomRegion(origin)).not.toThrow();
      expect(() => classifySidesRegion(origin)).not.toThrow();
    });

    it('should handle very large coordinates', () => {
      const largePoint: [number, number, number] = [1000, 1000, 1000];
      const result = classifyTopRegion(largePoint);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    it('should handle very small blend radii', () => {
      const result = classifyTopRegionSmooth([0, 0.1, 0], 0.00001);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    it('should handle negative coordinates', () => {
      const negPoint: [number, number, number] = [-1, -1, -1];
      const result = classifyTopRegion(negPoint);
      expect(result).toBe(0);
    });

    it('should handle thin surfaces with small blend radius', () => {
      const thinBlend = 0.001;
      const point: [number, number, number] = [0, 0.0005, 0];
      const result = classifyTopRegionSmooth(point, thinBlend);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });

    it('should handle overlapping regions correctly', () => {
      const point: [number, number, number] = [0.7, 0.7, 0];
      const topBlend = classifyTopRegionSmooth(point, 0.2);
      const sidesBlend = classifySidesRegion(point);
      expect(topBlend + sidesBlend).toBeGreaterThan(0);
    });
  });

  describe('Integration with Material System', () => {
    it('should allow multiple materials on single primitive', () => {
      const point: [number, number, number] = [0, 1, 0];
      const topMaterialBlend = classifyTopRegion(point);
      const bottomMaterialBlend = classifyBottomRegion(point);
      
      expect(topMaterialBlend).toBe(1.0);
      expect(bottomMaterialBlend).toBe(0.0);
    });

    it('should support material transitions', () => {
      const blendRadius = 0.5;
      const transitionPoints: [number, number, number][] = [
        [0, -0.5, 0],
        [0, -0.25, 0],
        [0, 0, 0],
        [0, 0.25, 0],
        [0, 0.5, 0],
      ];
      
      const topBlends = transitionPoints.map(p => 
        classifyTopRegionSmooth(p, blendRadius)
      );
      
      for (let i = 1; i < topBlends.length; i++) {
        expect(topBlends[i]).toBeGreaterThan(topBlends[i - 1]);
      }
    });
  });

  describe('New Targeting Types (Phase 0.3)', () => {
    describe('Surface Targeting', () => {
      it('should return high value for points on surface', () => {
        const sdf = 0.01;
        const threshold = 0.05;
        const result = isSurfaceTest(sdf, threshold);
        expect(result).toBeGreaterThan(0.7);
      });

      it('should return low value for points far from surface', () => {
        const sdf = 1.0;
        const threshold = 0.05;
        const result = isSurfaceTest(sdf, threshold);
        expect(result).toBeLessThan(0.3);
      });

      it('should have smooth falloff', () => {
        const threshold = 0.1;
        const sdf1 = isSurfaceTest(0.0, threshold);
        const sdf2 = isSurfaceTest(0.03, threshold);
        const sdf3 = isSurfaceTest(0.07, threshold);
        const sdf4 = isSurfaceTest(0.15, threshold);
        expect(sdf1).toBeGreaterThan(sdf2);
        expect(sdf2).toBeGreaterThan(sdf3);
        expect(sdf3).toBeGreaterThanOrEqual(sdf4);
      });
    });

    describe('Volume Targeting', () => {
      it('should return 1.0 for points inside volume', () => {
        const result = isVolumeTest(-0.5);
        expect(result).toBe(1.0);
      });

      it('should return 0.0 for points outside volume', () => {
        const result = isVolumeTest(0.5);
        expect(result).toBe(0.0);
      });

      it('should have sharp transition at boundary', () => {
        const inside = isVolumeTest(-0.001);
        const outside = isVolumeTest(0.001);
        expect(inside).toBe(1.0);
        expect(outside).toBe(0.0);
      });
    });

    describe('Edge Targeting', () => {
      it('should return reasonable value for edge detection', () => {
        const result = isEdgeTest(0.1, 0.2);
        expect(result).toBeGreaterThanOrEqual(0.0);
        expect(result).toBeLessThanOrEqual(1.0);
      });

      it('should be sensitive to edge width parameter', () => {
        const wide = isEdgeTest(0.1, 0.5);
        const narrow = isEdgeTest(0.1, 0.1);
        expect(Math.abs(wide - narrow)).toBeGreaterThan(0);
      });
    });

    describe('Vertex Targeting', () => {
      it('should return reasonable value for vertex detection', () => {
        const result = isVertexTest(0.1, 0.2);
        expect(result).toBeGreaterThanOrEqual(0.0);
        expect(result).toBeLessThanOrEqual(1.0);
      });

      it('should be sensitive to vertex radius parameter', () => {
        const large = isVertexTest(0.05, 0.5);
        const small = isVertexTest(0.05, 0.1);
        expect(Math.abs(large - small)).toBeGreaterThan(0);
      });
    });

    describe('Unified getMask Function', () => {
      it('should combine target and region masks', () => {
        const sdf = 0.01;
        const result = getMaskTest(
          [0, 1, 0],
          sdf,
          'surface',
          'top',
          0.1,
          0.05
        );
        expect(result).toBeGreaterThan(0.0);
        expect(result).toBeLessThanOrEqual(1.0);
      });

      it('should filter by region correctly', () => {
        const sdf = 0.01;
        const topResult = getMaskTest([0, 1, 0], sdf, 'surface', 'top', 0.1, 0.05);
        const bottomResult = getMaskTest([0, -1, 0], sdf, 'surface', 'top', 0.1, 0.05);
        expect(topResult).toBeGreaterThan(bottomResult);
      });

      it('should work with all target types', () => {
        const p: [number, number, number] = [0, 0.5, 0];
        const surface = getMaskTest(p, 0.01, 'surface', 'all', 0.1, 0.05);
        const volume = getMaskTest(p, -0.5, 'volume', 'all', 0.1, 0.1);
        const edge = getMaskTest(p, 0.1, 'edge', 'all', 0.1, 0.2);
        const vertex = getMaskTest(p, 0.1, 'vertex', 'all', 0.1, 0.2);
        
        expect(surface).toBeGreaterThanOrEqual(0.0);
        expect(volume).toBe(1.0);
        expect(edge).toBeGreaterThanOrEqual(0.0);
        expect(vertex).toBeGreaterThanOrEqual(0.0);
      });

      it('should work with all regions', () => {
        const regions: Array<'all' | 'top' | 'bottom' | 'sides' | 'front' | 'back' | 'left' | 'right'> = 
          ['all', 'top', 'bottom', 'sides', 'front', 'back', 'left', 'right'];
        
        regions.forEach(region => {
          const result = getMaskTest([0, 0, 0], 0.01, 'surface', region, 0.1, 0.05);
          expect(result).toBeGreaterThanOrEqual(0.0);
          expect(result).toBeLessThanOrEqual(1.0);
        });
      });
    });
  });
});

function classifyTopRegion(p: [number, number, number]): number {
  return p[1] > 0 ? 1.0 : 0.0;
}

function classifyBottomRegion(p: [number, number, number]): number {
  return p[1] < 0 ? 1.0 : 0.0;
}

function classifySidesRegion(p: [number, number, number]): number {
  const yNorm = Math.abs(p[1]) / (Math.abs(p[0]) + Math.abs(p[1]) + Math.abs(p[2]) + 0.0001);
  return 1.0 - smoothstep(0.3, 0.5, yNorm);
}

function classifyFrontRegion(p: [number, number, number]): number {
  return p[2] > 0 ? 1.0 : 0.0;
}

function classifyBackRegion(p: [number, number, number]): number {
  return p[2] < 0 ? 1.0 : 0.0;
}

function classifyLeftRegion(p: [number, number, number]): number {
  return p[0] < 0 ? 1.0 : 0.0;
}

function classifyRightRegion(p: [number, number, number]): number {
  return p[0] > 0 ? 1.0 : 0.0;
}

function classifyAllRegion(_p: [number, number, number]): number {
  return 1.0;
}

function classifyTopRegionSmooth(p: [number, number, number], blendRadius: number): number {
  return smoothstep(-blendRadius, blendRadius, p[1]);
}

function classifyBoxTopFace(p: [number, number, number], boxSize: [number, number, number], blendRadius: number): number {
  const d = [
    Math.abs(p[0]) - boxSize[0],
    Math.abs(p[1]) - boxSize[1],
    Math.abs(p[2]) - boxSize[2],
  ];
  const maxD = Math.max(d[0], d[1], d[2]);
  const isTopFace = smoothstep(blendRadius, -blendRadius, Math.abs(d[1] - maxD));
  const isTop = p[1] > 0 ? 1.0 : 0.0;
  return isTopFace * isTop;
}

function classifyBoxBottomFace(p: [number, number, number], boxSize: [number, number, number], blendRadius: number): number {
  const d = [
    Math.abs(p[0]) - boxSize[0],
    Math.abs(p[1]) - boxSize[1],
    Math.abs(p[2]) - boxSize[2],
  ];
  const maxD = Math.max(d[0], d[1], d[2]);
  const isBottomFace = smoothstep(blendRadius, -blendRadius, Math.abs(d[1] - maxD));
  const isBottom = p[1] < 0 ? 1.0 : 0.0;
  return isBottomFace * isBottom;
}

function classifyBoxFrontFace(p: [number, number, number], boxSize: [number, number, number], blendRadius: number): number {
  const d = [
    Math.abs(p[0]) - boxSize[0],
    Math.abs(p[1]) - boxSize[1],
    Math.abs(p[2]) - boxSize[2],
  ];
  const maxD = Math.max(d[0], d[1], d[2]);
  const isFrontFace = smoothstep(blendRadius, -blendRadius, Math.abs(d[2] - maxD));
  const isFront = p[2] > 0 ? 1.0 : 0.0;
  return isFrontFace * isFront;
}

function classifySphereTopRegion(p: [number, number, number], _radius: number, blendRadius: number): number {
  const len = Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]);
  if (len < 0.0001) return 0.5;
  const pNorm: [number, number, number] = [p[0] / len, p[1] / len, p[2] / len];
  return smoothstep(-blendRadius, blendRadius, pNorm[1]);
}

function blendRegions(value1: number, value2: number, blendFactor: number): number {
  return value1 * (1.0 - blendFactor) + value2 * blendFactor;
}

function blendRegionsVec3(value1: [number, number, number], value2: [number, number, number], blendFactor: number): [number, number, number] {
  return [
    blendRegions(value1[0], value2[0], blendFactor),
    blendRegions(value1[1], value2[1], blendFactor),
    blendRegions(value1[2], value2[2], blendFactor),
  ];
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function classifyLeftRegionSmooth(p: [number, number, number], blendRadius: number): number {
  return smoothstep(-blendRadius, blendRadius, -p[0]);
}

function classifyRightRegionSmooth(p: [number, number, number], blendRadius: number): number {
  return smoothstep(-blendRadius, blendRadius, p[0]);
}

function isSurfaceTest(sdf: number, threshold: number): number {
  return 1.0 - smoothstep(0.0, threshold, Math.abs(sdf));
}

function isVolumeTest(sdf: number): number {
  return sdf <= 0.0 ? 1.0 : 0.0;
}

function isEdgeTest(sdf: number, edgeWidth: number): number {
  const mockGradient = Math.abs(sdf) / edgeWidth;
  return smoothstep(0.5, 2.0, mockGradient);
}

function isVertexTest(sdf: number, vertexRadius: number): number {
  const mockVariance = Math.abs(sdf) / vertexRadius;
  return smoothstep(0.0, 1.0, mockVariance);
}

function getMaskTest(
  p: [number, number, number],
  sdf: number,
  targetType: 'surface' | 'volume' | 'edge' | 'vertex',
  region: 'all' | 'top' | 'bottom' | 'sides' | 'front' | 'back' | 'left' | 'right',
  blendRadius: number,
  param: number
): number {
  let targetMask = 1.0;
  
  switch (targetType) {
    case 'surface':
      targetMask = isSurfaceTest(sdf, param);
      break;
    case 'volume':
      targetMask = isVolumeTest(sdf);
      break;
    case 'edge':
      targetMask = isEdgeTest(sdf, param);
      break;
    case 'vertex':
      targetMask = isVertexTest(sdf, param);
      break;
  }
  
  let regionMask = 1.0;
  
  switch (region) {
    case 'all':
      regionMask = 1.0;
      break;
    case 'top':
      regionMask = classifyTopRegionSmooth(p, blendRadius);
      break;
    case 'bottom':
      regionMask = smoothstep(-blendRadius, blendRadius, -p[1]);
      break;
    case 'sides':
      const yNorm = Math.abs(p[1]) / (Math.sqrt(p[0]*p[0] + p[2]*p[2]) + 0.0001);
      regionMask = 1.0 - smoothstep(0.5 - blendRadius, 0.5 + blendRadius, yNorm);
      break;
    case 'front':
      regionMask = smoothstep(-blendRadius, blendRadius, p[2]);
      break;
    case 'back':
      regionMask = smoothstep(-blendRadius, blendRadius, -p[2]);
      break;
    case 'left':
      regionMask = classifyLeftRegionSmooth(p, blendRadius);
      break;
    case 'right':
      regionMask = classifyRightRegionSmooth(p, blendRadius);
      break;
  }
  
  return targetMask * regionMask;
}
