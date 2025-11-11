/**
 * YUKA Math Adapter
 * 
 * Centralized re-exports and utility wrappers for YUKA math library.
 * This module eliminates custom math implementations and provides
 * zero-allocation patterns for performance-critical code.
 * 
 * @see https://mugen87.github.io/yuka/
 * @see docs/YUKA_INTEGRATION_PLAN.md
 */

export { 
  Vector3, 
  Matrix3, 
  Matrix4, 
  Quaternion, 
  Ray, 
  Plane, 
  OBB, 
  AABB,
  MathUtils,
  LineSegment,
  ConvexHull,
  Polygon,
  Polyhedron,
  BoundingSphere,
  SAT
} from 'yuka';

import { Vector3, MathUtils } from 'yuka';

/**
 * VectorUtils - Zero-allocation vector utility patterns
 * 
 * Provides reusable temporary vectors and common vector operations
 * following YUKA's zero-allocation pattern for optimal performance.
 * 
 * @example
 * ```typescript
 * // Zero-allocation pattern
 * const result = VectorUtils.randomInSphere(10, VectorUtils.temp1);
 * // Use result immediately, don't store temp vectors
 * ```
 */
export class VectorUtils {
  /**
   * Reusable temporary vectors for zero-allocation operations.
   * 
   * **CRITICAL:** These are shared instances. Use them for immediate
   * calculations only, never store references to temp vectors.
   * 
   * @example
   * ```typescript
   * // CORRECT - Use immediately
   * const direction = VectorUtils.temp1;
   * direction.subVectors(target, source);
   * force.add(direction);
   * 
   * // WRONG - Don't store references
   * this.savedDirection = VectorUtils.temp1; // BAD!
   * ```
   */
  static readonly temp1 = new Vector3();
  static readonly temp2 = new Vector3();
  static readonly temp3 = new Vector3();

  /**
   * Generate random point within a sphere
   * 
   * Uses rejection sampling for uniform distribution within sphere volume.
   * 
   * @param radius - Sphere radius
   * @param out - Output vector (modified in-place)
   * @returns The output vector (for chaining)
   * 
   * @example
   * ```typescript
   * const position = new Vector3();
   * VectorUtils.randomInSphere(5, position);
   * ```
   */
  static randomInSphere(radius: number, out: Vector3): Vector3 {
    let x: number, y: number, z: number;
    let lengthSquared: number;

    do {
      x = MathUtils.randFloat(-1, 1);
      y = MathUtils.randFloat(-1, 1);
      z = MathUtils.randFloat(-1, 1);
      lengthSquared = x * x + y * y + z * z;
    } while (lengthSquared > 1);

    out.set(x * radius, y * radius, z * radius);
    return out;
  }

  /**
   * Generate random point on sphere surface
   * 
   * Uses spherical coordinates for uniform distribution on sphere surface.
   * 
   * @param radius - Sphere radius
   * @param out - Output vector (modified in-place)
   * @returns The output vector (for chaining)
   * 
   * @example
   * ```typescript
   * const direction = new Vector3();
   * VectorUtils.randomOnSphere(1, direction); // Unit sphere
   * ```
   */
  static randomOnSphere(radius: number, out: Vector3): Vector3 {
    const theta = MathUtils.randFloat(0, Math.PI * 2);
    const phi = Math.acos(MathUtils.randFloat(-1, 1));
    
    const sinPhi = Math.sin(phi);
    out.set(
      radius * sinPhi * Math.cos(theta),
      radius * sinPhi * Math.sin(theta),
      radius * Math.cos(phi)
    );
    
    return out;
  }

  /**
   * Generate random point within a cube
   * 
   * @param size - Cube side length (centered at origin)
   * @param out - Output vector (modified in-place)
   * @returns The output vector (for chaining)
   * 
   * @example
   * ```typescript
   * const position = new Vector3();
   * VectorUtils.randomInCube(10, position); // -5 to +5 on each axis
   * ```
   */
  static randomInCube(size: number, out: Vector3): Vector3 {
    const half = size * 0.5;
    out.set(
      MathUtils.randFloat(-half, half),
      MathUtils.randFloat(-half, half),
      MathUtils.randFloat(-half, half)
    );
    return out;
  }

  /**
   * Generate random point on XZ plane (horizontal plane in 3D space)
   * 
   * Useful for terrain, navigation, and 2D-like positioning in 3D.
   * 
   * @param rangeX - Range on X axis
   * @param rangeZ - Range on Z axis
   * @param y - Fixed Y coordinate (default: 0)
   * @param out - Output vector (modified in-place)
   * @returns The output vector (for chaining)
   * 
   * @example
   * ```typescript
   * const position = new Vector3();
   * VectorUtils.randomOnPlane(100, 100, 0, position); // Random ground position
   * ```
   */
  static randomOnPlane(rangeX: number, rangeZ: number, y: number = 0, out: Vector3): Vector3 {
    const halfX = rangeX * 0.5;
    const halfZ = rangeZ * 0.5;
    out.set(
      MathUtils.randFloat(-halfX, halfX),
      y,
      MathUtils.randFloat(-halfZ, halfZ)
    );
    return out;
  }

  /**
   * Calculate signed angle between two vectors in radians
   * 
   * @param from - Starting vector
   * @param to - Target vector
   * @param axis - Rotation axis (for sign determination)
   * @returns Signed angle in radians (-PI to PI)
   * 
   * @example
   * ```typescript
   * const angle = VectorUtils.signedAngle(forward, target, up);
   * if (angle > 0) {
   *   // Turn left
   * } else {
   *   // Turn right
   * }
   * ```
   */
  static signedAngle(from: Vector3, to: Vector3, axis: Vector3): number {
    const angle = from.angleTo(to);
    
    const cross = VectorUtils.temp1;
    cross.crossVectors(from, to);
    
    const sign = cross.dot(axis) >= 0 ? 1 : -1;
    return angle * sign;
  }

  /**
   * Project vector onto a plane defined by normal
   * 
   * @param vector - Vector to project
   * @param normal - Plane normal (should be normalized)
   * @param out - Output vector (modified in-place)
   * @returns The output vector (for chaining)
   * 
   * @example
   * ```typescript
   * const groundVelocity = new Vector3();
   * VectorUtils.projectOnPlane(velocity, groundNormal, groundVelocity);
   * ```
   */
  static projectOnPlane(vector: Vector3, normal: Vector3, out: Vector3): Vector3 {
    const distance = vector.dot(normal);
    out.copy(normal).multiplyScalar(distance);
    out.copy(vector).sub(out);
    return out;
  }

  /**
   * Clamp vector length to maximum magnitude
   * 
   * @param vector - Vector to clamp (modified in-place)
   * @param maxLength - Maximum allowed length
   * @returns The input vector (for chaining)
   * 
   * @example
   * ```typescript
   * VectorUtils.clampLength(velocity, maxSpeed);
   * ```
   */
  static clampLength(vector: Vector3, maxLength: number): Vector3 {
    const lengthSquared = vector.squaredLength();
    if (lengthSquared > maxLength * maxLength) {
      vector.normalize().multiplyScalar(maxLength);
    }
    return vector;
  }

  /**
   * Smoothly interpolate between two vectors using exponential decay
   * 
   * More natural than linear interpolation for camera movement, etc.
   * 
   * @param current - Current vector (modified in-place)
   * @param target - Target vector
   * @param smoothTime - Time constant for smoothing (smaller = faster)
   * @param delta - Time step
   * @returns The current vector (for chaining)
   * 
   * @example
   * ```typescript
   * // Smooth camera follow
   * VectorUtils.smoothDamp(cameraPos, targetPos, 0.1, delta);
   * ```
   */
  static smoothDamp(current: Vector3, target: Vector3, smoothTime: number, delta: number): Vector3 {
    const omega = 2.0 / smoothTime;
    const x = omega * delta;
    const exp = 1.0 / (1.0 + x + 0.48 * x * x + 0.235 * x * x * x);
    
    const change = VectorUtils.temp1;
    change.copy(current).sub(target);
    
    const temp = VectorUtils.temp2;
    temp.copy(change).multiplyScalar(exp);
    
    current.copy(target).add(temp);
    return current;
  }

  /**
   * Check if vector is approximately zero (within epsilon)
   * 
   * @param vector - Vector to check
   * @param epsilon - Tolerance (default: 0.0001)
   * @returns True if vector length is less than epsilon
   * 
   * @example
   * ```typescript
   * if (VectorUtils.isZero(velocity)) {
   *   // Object is stationary
   * }
   * ```
   */
  static isZero(vector: Vector3, epsilon: number = 0.0001): boolean {
    return vector.squaredLength() < epsilon * epsilon;
  }

  /**
   * Get direction from one point to another (normalized)
   * 
   * @param from - Starting point
   * @param to - Target point
   * @param out - Output direction vector (modified in-place)
   * @returns The output vector (for chaining), or zero vector if points are coincident
   * 
   * @example
   * ```typescript
   * const direction = new Vector3();
   * VectorUtils.getDirection(position, target, direction);
   * force.copy(direction).multiplyScalar(speed);
   * ```
   */
  static getDirection(from: Vector3, to: Vector3, out: Vector3): Vector3 {
    out.subVectors(to, from);
    const length = out.length();
    if (length > 0.0001) {
      out.divideScalar(length);
    } else {
      out.set(0, 0, 0);
    }
    return out;
  }
}

/**
 * Common vector constants for convenience
 * 
 * **Note:** These are shared instances. Clone them if you need to modify.
 * 
 * @example
 * ```typescript
 * import { VECTOR_CONSTANTS } from './YukaMath';
 * 
 * // Correct - Clone before modifying
 * const up = VECTOR_CONSTANTS.UP.clone();
 * 
 * // Wrong - Don't modify shared instances
 * VECTOR_CONSTANTS.UP.y = 2; // BAD!
 * ```
 */
export const VECTOR_CONSTANTS = {
  ZERO: new Vector3(0, 0, 0),
  ONE: new Vector3(1, 1, 1),
  UP: new Vector3(0, 1, 0),
  DOWN: new Vector3(0, -1, 0),
  FORWARD: new Vector3(0, 0, -1),
  BACK: new Vector3(0, 0, 1),
  LEFT: new Vector3(-1, 0, 0),
  RIGHT: new Vector3(1, 0, 0),
} as const;
