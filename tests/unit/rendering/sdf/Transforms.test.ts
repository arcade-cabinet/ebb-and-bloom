/**
 * SDF TRANSFORMS TESTS - Phase 0.1.4
 * 
 * Comprehensive tests for 3D transformation support in SDF shader.
 * Tests rotation matrices, scaling, and distance field compensation.
 */

import { describe, it, expect } from 'vitest';

type Vec3 = [number, number, number];
type Mat3 = [Vec3, Vec3, Vec3];

/**
 * CPU-equivalent transformation functions
 * These mirror the GLSL functions in SDF_TRANSFORMS_GLSL
 */
class TransformCPU {
  static rotateX(angle: number): Mat3 {
    const s = Math.sin(angle);
    const c = Math.cos(angle);
    return [
      [1, 0, 0],
      [0, c, -s],
      [0, s, c]
    ];
  }
  
  static rotateY(angle: number): Mat3 {
    const s = Math.sin(angle);
    const c = Math.cos(angle);
    return [
      [c, 0, s],
      [0, 1, 0],
      [-s, 0, c]
    ];
  }
  
  static rotateZ(angle: number): Mat3 {
    const s = Math.sin(angle);
    const c = Math.cos(angle);
    return [
      [c, -s, 0],
      [s, c, 0],
      [0, 0, 1]
    ];
  }
  
  static eulerToRotation(euler: Vec3): Mat3 {
    const rotX = TransformCPU.rotateX(euler[0]);
    const rotY = TransformCPU.rotateY(euler[1]);
    const rotZ = TransformCPU.rotateZ(euler[2]);
    
    return TransformCPU.matMul(TransformCPU.matMul(rotZ, rotY), rotX);
  }
  
  static matMul(a: Mat3, b: Mat3): Mat3 {
    const result: Mat3 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        result[i][j] = 
          a[i][0] * b[0][j] +
          a[i][1] * b[1][j] +
          a[i][2] * b[2][j];
      }
    }
    return result;
  }
  
  static matVecMul(m: Mat3, v: Vec3): Vec3 {
    return [
      m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
      m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
      m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2]
    ];
  }
  
  static transpose(m: Mat3): Mat3 {
    return [
      [m[0][0], m[1][0], m[2][0]],
      [m[0][1], m[1][1], m[2][1]],
      [m[0][2], m[1][2], m[2][2]]
    ];
  }
  
  static applyInverseRotation(p: Vec3, euler: Vec3): Vec3 {
    const rot = TransformCPU.eulerToRotation(euler);
    const invRot = TransformCPU.transpose(rot);
    return TransformCPU.matVecMul(invRot, p);
  }
  
  static applyInverseScale(p: Vec3, scale: Vec3): Vec3 {
    return [p[0] / scale[0], p[1] / scale[1], p[2] / scale[2]];
  }
  
  static applyInverseTransform(p: Vec3, rotation: Vec3, scale: Vec3): Vec3 {
    // Forward transform: local -> scale -> rotate -> world
    // Inverse: world -> inverse_rotate -> inverse_scale -> local
    const pRotated = TransformCPU.applyInverseRotation(p, rotation);
    const pScaled = TransformCPU.applyInverseScale(pRotated, scale);
    return pScaled;
  }
  
  static getScaleCompensation(scale: Vec3): number {
    return Math.min(scale[0], scale[1], scale[2]);
  }
  
  static compensateSDFDistance(distance: number, scale: Vec3): number {
    return distance * TransformCPU.getScaleCompensation(scale);
  }
  
  static vecLength(v: Vec3): number {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  }
  
  static vecDot(a: Vec3, b: Vec3): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }
}

describe('SDF Transforms - Rotation Matrices', () => {
  describe('rotateX', () => {
    it('should create identity matrix for zero angle', () => {
      const mat = TransformCPU.rotateX(0);
      expect(mat[0][0]).toBeCloseTo(1, 5);
      expect(mat[0][1]).toBeCloseTo(0, 5);
      expect(mat[0][2]).toBeCloseTo(0, 5);
      expect(mat[1][0]).toBeCloseTo(0, 5);
      expect(mat[1][1]).toBeCloseTo(1, 5);
      expect(mat[1][2]).toBeCloseTo(0, 5);
      expect(mat[2][0]).toBeCloseTo(0, 5);
      expect(mat[2][1]).toBeCloseTo(0, 5);
      expect(mat[2][2]).toBeCloseTo(1, 5);
    });
    
    it('should rotate 90 degrees around X-axis', () => {
      const mat = TransformCPU.rotateX(Math.PI / 2);
      const point: Vec3 = [1, 1, 0];
      const rotated = TransformCPU.matVecMul(mat, point);
      
      expect(rotated[0]).toBeCloseTo(1, 5);
      expect(rotated[1]).toBeCloseTo(0, 5);
      expect(rotated[2]).toBeCloseTo(1, 5);
    });
    
    it('should be orthogonal (preserves length)', () => {
      const angle = Math.PI / 3;
      const mat = TransformCPU.rotateX(angle);
      const point: Vec3 = [1, 2, 3];
      const rotated = TransformCPU.matVecMul(mat, point);
      
      const originalLength = TransformCPU.vecLength(point);
      const rotatedLength = TransformCPU.vecLength(rotated);
      
      expect(rotatedLength).toBeCloseTo(originalLength, 5);
    });
  });
  
  describe('rotateY', () => {
    it('should create identity matrix for zero angle', () => {
      const mat = TransformCPU.rotateY(0);
      expect(mat[0][0]).toBeCloseTo(1, 5);
      expect(mat[0][1]).toBeCloseTo(0, 5);
      expect(mat[0][2]).toBeCloseTo(0, 5);
      expect(mat[1][0]).toBeCloseTo(0, 5);
      expect(mat[1][1]).toBeCloseTo(1, 5);
      expect(mat[1][2]).toBeCloseTo(0, 5);
      expect(mat[2][0]).toBeCloseTo(0, 5);
      expect(mat[2][1]).toBeCloseTo(0, 5);
      expect(mat[2][2]).toBeCloseTo(1, 5);
    });
    
    it('should rotate 90 degrees around Y-axis', () => {
      const mat = TransformCPU.rotateY(Math.PI / 2);
      const point: Vec3 = [1, 1, 0];
      const rotated = TransformCPU.matVecMul(mat, point);
      
      expect(rotated[0]).toBeCloseTo(0, 5);
      expect(rotated[1]).toBeCloseTo(1, 5);
      expect(rotated[2]).toBeCloseTo(-1, 5);
    });
    
    it('should be orthogonal (preserves length)', () => {
      const angle = Math.PI / 4;
      const mat = TransformCPU.rotateY(angle);
      const point: Vec3 = [2, 1, 3];
      const rotated = TransformCPU.matVecMul(mat, point);
      
      const originalLength = TransformCPU.vecLength(point);
      const rotatedLength = TransformCPU.vecLength(rotated);
      
      expect(rotatedLength).toBeCloseTo(originalLength, 5);
    });
  });
  
  describe('rotateZ', () => {
    it('should create identity matrix for zero angle', () => {
      const mat = TransformCPU.rotateZ(0);
      expect(mat[0][0]).toBeCloseTo(1, 5);
      expect(mat[0][1]).toBeCloseTo(0, 5);
      expect(mat[0][2]).toBeCloseTo(0, 5);
      expect(mat[1][0]).toBeCloseTo(0, 5);
      expect(mat[1][1]).toBeCloseTo(1, 5);
      expect(mat[1][2]).toBeCloseTo(0, 5);
      expect(mat[2][0]).toBeCloseTo(0, 5);
      expect(mat[2][1]).toBeCloseTo(0, 5);
      expect(mat[2][2]).toBeCloseTo(1, 5);
    });
    
    it('should rotate 90 degrees around Z-axis', () => {
      const mat = TransformCPU.rotateZ(Math.PI / 2);
      const point: Vec3 = [1, 0, 1];
      const rotated = TransformCPU.matVecMul(mat, point);
      
      expect(rotated[0]).toBeCloseTo(0, 5);
      expect(rotated[1]).toBeCloseTo(1, 5);
      expect(rotated[2]).toBeCloseTo(1, 5);
    });
    
    it('should be orthogonal (preserves length)', () => {
      const angle = Math.PI / 6;
      const mat = TransformCPU.rotateZ(angle);
      const point: Vec3 = [3, 2, 1];
      const rotated = TransformCPU.matVecMul(mat, point);
      
      const originalLength = TransformCPU.vecLength(point);
      const rotatedLength = TransformCPU.vecLength(rotated);
      
      expect(rotatedLength).toBeCloseTo(originalLength, 5);
    });
  });
  
  describe('eulerToRotation', () => {
    it('should create identity for zero rotation', () => {
      const mat = TransformCPU.eulerToRotation([0, 0, 0]);
      const point: Vec3 = [1, 2, 3];
      const rotated = TransformCPU.matVecMul(mat, point);
      
      expect(rotated[0]).toBeCloseTo(point[0], 5);
      expect(rotated[1]).toBeCloseTo(point[1], 5);
      expect(rotated[2]).toBeCloseTo(point[2], 5);
    });
    
    it('should combine rotations correctly', () => {
      const euler: Vec3 = [Math.PI / 4, Math.PI / 6, Math.PI / 8];
      const mat = TransformCPU.eulerToRotation(euler);
      const point: Vec3 = [1, 0, 0];
      const rotated = TransformCPU.matVecMul(mat, point);
      
      expect(TransformCPU.vecLength(rotated)).toBeCloseTo(1, 5);
    });
    
    it('should be orthogonal (composite rotation preserves length)', () => {
      const euler: Vec3 = [0.5, 1.2, 0.8];
      const mat = TransformCPU.eulerToRotation(euler);
      const point: Vec3 = [2, 3, 4];
      const rotated = TransformCPU.matVecMul(mat, point);
      
      const originalLength = TransformCPU.vecLength(point);
      const rotatedLength = TransformCPU.vecLength(rotated);
      
      expect(rotatedLength).toBeCloseTo(originalLength, 5);
    });
  });
  
  describe('Matrix orthogonality', () => {
    it('transpose equals inverse for rotation matrices', () => {
      const angle = Math.PI / 3;
      const mat = TransformCPU.rotateX(angle);
      const transpose = TransformCPU.transpose(mat);
      const product = TransformCPU.matMul(mat, transpose);
      
      expect(product[0][0]).toBeCloseTo(1, 5);
      expect(product[1][1]).toBeCloseTo(1, 5);
      expect(product[2][2]).toBeCloseTo(1, 5);
      expect(product[0][1]).toBeCloseTo(0, 5);
      expect(product[0][2]).toBeCloseTo(0, 5);
      expect(product[1][2]).toBeCloseTo(0, 5);
    });
    
    it('determinant equals 1 for rotation matrices', () => {
      const euler: Vec3 = [0.5, 0.7, 0.3];
      const mat = TransformCPU.eulerToRotation(euler);
      
      const det = 
        mat[0][0] * (mat[1][1] * mat[2][2] - mat[1][2] * mat[2][1]) -
        mat[0][1] * (mat[1][0] * mat[2][2] - mat[1][2] * mat[2][0]) +
        mat[0][2] * (mat[1][0] * mat[2][1] - mat[1][1] * mat[2][0]);
      
      expect(det).toBeCloseTo(1, 5);
    });
  });
});

describe('SDF Transforms - Scaling', () => {
  describe('applyInverseScale', () => {
    it('should scale inversely on all axes', () => {
      const point: Vec3 = [2, 4, 6];
      const scale: Vec3 = [2, 2, 2];
      const scaled = TransformCPU.applyInverseScale(point, scale);
      
      expect(scaled[0]).toBe(1);
      expect(scaled[1]).toBe(2);
      expect(scaled[2]).toBe(3);
    });
    
    it('should handle non-uniform scaling', () => {
      const point: Vec3 = [3, 6, 9];
      const scale: Vec3 = [3, 2, 1];
      const scaled = TransformCPU.applyInverseScale(point, scale);
      
      expect(scaled[0]).toBe(1);
      expect(scaled[1]).toBe(3);
      expect(scaled[2]).toBe(9);
    });
    
    it('should handle identity scale', () => {
      const point: Vec3 = [1, 2, 3];
      const scale: Vec3 = [1, 1, 1];
      const scaled = TransformCPU.applyInverseScale(point, scale);
      
      expect(scaled).toEqual(point);
    });
  });
  
  describe('getScaleCompensation', () => {
    it('should return minimum scale component', () => {
      const scale: Vec3 = [2, 3, 1.5];
      const compensation = TransformCPU.getScaleCompensation(scale);
      
      expect(compensation).toBe(1.5);
    });
    
    it('should return 1 for uniform scale of 1', () => {
      const scale: Vec3 = [1, 1, 1];
      const compensation = TransformCPU.getScaleCompensation(scale);
      
      expect(compensation).toBe(1);
    });
    
    it('should handle uniform scaling', () => {
      const scale: Vec3 = [2, 2, 2];
      const compensation = TransformCPU.getScaleCompensation(scale);
      
      expect(compensation).toBe(2);
    });
    
    it('should use minimum for conservative distance estimates', () => {
      const scale: Vec3 = [5, 0.5, 3];
      const compensation = TransformCPU.getScaleCompensation(scale);
      
      expect(compensation).toBe(0.5);
    });
  });
  
  describe('compensateSDFDistance', () => {
    it('should multiply distance by scale compensation', () => {
      const distance = 2.0;
      const scale: Vec3 = [3, 3, 3];
      const compensated = TransformCPU.compensateSDFDistance(distance, scale);
      
      expect(compensated).toBe(6);
    });
    
    it('should preserve distance for unit scale', () => {
      const distance = 5.0;
      const scale: Vec3 = [1, 1, 1];
      const compensated = TransformCPU.compensateSDFDistance(distance, scale);
      
      expect(compensated).toBe(5);
    });
    
    it('should use minimum component for non-uniform scale', () => {
      const distance = 1.0;
      const scale: Vec3 = [10, 2, 5];
      const compensated = TransformCPU.compensateSDFDistance(distance, scale);
      
      expect(compensated).toBe(2);
    });
    
    it('should handle negative distances (inside shape)', () => {
      const distance = -1.5;
      const scale: Vec3 = [2, 2, 2];
      const compensated = TransformCPU.compensateSDFDistance(distance, scale);
      
      expect(compensated).toBe(-3);
    });
  });
});

describe('SDF Transforms - Combined Transforms', () => {
  describe('applyInverseTransform', () => {
    it('should apply inverse rotation then inverse scale', () => {
      const point: Vec3 = [2, 0, 0];
      const rotation: Vec3 = [0, 0, Math.PI / 2];
      const scale: Vec3 = [2, 1, 1];
      
      const transformed = TransformCPU.applyInverseTransform(point, rotation, scale);
      
      // After inverse rotation by -90° around Z: [2,0,0] -> [0,-2,0]
      // After inverse scale [2,1,1]: [0,-2,0] -> [0,-2,0]
      expect(transformed[0]).toBeCloseTo(0, 5);
      expect(transformed[1]).toBeCloseTo(-2, 5);
      expect(transformed[2]).toBeCloseTo(0, 5);
    });
    
    it('should handle identity transforms', () => {
      const point: Vec3 = [1, 2, 3];
      const rotation: Vec3 = [0, 0, 0];
      const scale: Vec3 = [1, 1, 1];
      
      const transformed = TransformCPU.applyInverseTransform(point, rotation, scale);
      
      expect(transformed[0]).toBeCloseTo(point[0], 5);
      expect(transformed[1]).toBeCloseTo(point[1], 5);
      expect(transformed[2]).toBeCloseTo(point[2], 5);
    });
    
    it('should combine complex rotation and scaling', () => {
      const point: Vec3 = [3, 6, 9];
      const rotation: Vec3 = [Math.PI / 4, Math.PI / 6, Math.PI / 8];
      const scale: Vec3 = [3, 2, 1];
      
      const transformed = TransformCPU.applyInverseTransform(point, rotation, scale);
      
      const expectedRotated = TransformCPU.applyInverseRotation(point, rotation);
      const expectedTransformed = TransformCPU.applyInverseScale(expectedRotated, scale);
      
      expect(transformed[0]).toBeCloseTo(expectedTransformed[0], 5);
      expect(transformed[1]).toBeCloseTo(expectedTransformed[1], 5);
      expect(transformed[2]).toBeCloseTo(expectedTransformed[2], 5);
    });
  });
  
  describe('Inverse transform properties', () => {
    it('should invert forward transform correctly', () => {
      const point: Vec3 = [1, 2, 3];
      const rotation: Vec3 = [0.5, 0.7, 0.3];
      const scale: Vec3 = [2, 3, 1.5];
      
      // Forward transform: local -> scale -> rotate -> world
      const scaleForward: Vec3 = [point[0] * scale[0], point[1] * scale[1], point[2] * scale[2]];
      const mat = TransformCPU.eulerToRotation(rotation);
      const worldPoint = TransformCPU.matVecMul(mat, scaleForward);
      
      // Inverse transform: world -> inverse_rotate -> inverse_scale -> local
      const recovered = TransformCPU.applyInverseTransform(worldPoint, rotation, scale);
      
      expect(recovered[0]).toBeCloseTo(point[0], 5);
      expect(recovered[1]).toBeCloseTo(point[1], 5);
      expect(recovered[2]).toBeCloseTo(point[2], 5);
    });
  });
});

describe('SDF Transforms - Distance Field Properties', () => {
  describe('Distance preservation under rotation', () => {
    it('should preserve distances when rotating around origin', () => {
      const p1: Vec3 = [1, 0, 0];
      const p2: Vec3 = [0, 1, 0];
      const rotation: Vec3 = [0, 0, Math.PI / 4];
      
      const p1Rotated = TransformCPU.applyInverseRotation(p1, rotation);
      const p2Rotated = TransformCPU.applyInverseRotation(p2, rotation);
      
      const originalDist = Math.sqrt(
        (p2[0] - p1[0]) ** 2 +
        (p2[1] - p1[1]) ** 2 +
        (p2[2] - p1[2]) ** 2
      );
      
      const rotatedDist = Math.sqrt(
        (p2Rotated[0] - p1Rotated[0]) ** 2 +
        (p2Rotated[1] - p1Rotated[1]) ** 2 +
        (p2Rotated[2] - p1Rotated[2]) ** 2
      );
      
      expect(rotatedDist).toBeCloseTo(originalDist, 5);
    });
  });
  
  describe('Distance scaling under uniform scale', () => {
    it('should scale distances proportionally', () => {
      const distance = 1.0;
      const uniformScale: Vec3 = [2, 2, 2];
      
      const compensated = TransformCPU.compensateSDFDistance(distance, uniformScale);
      
      expect(compensated).toBe(2);
    });
  });
  
  describe('Conservative distance under non-uniform scale', () => {
    it('should use minimum scale to maintain proper marching', () => {
      const distance = 1.0;
      const nonUniformScale: Vec3 = [10, 0.5, 5];
      
      const compensated = TransformCPU.compensateSDFDistance(distance, nonUniformScale);
      
      expect(compensated).toBe(0.5);
    });
  });
});
