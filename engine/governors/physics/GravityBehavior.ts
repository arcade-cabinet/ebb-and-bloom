/**
 * GRAVITY BEHAVIOR
 * 
 * Yuka-native implementation of Newton's Law of Universal Gravitation.
 * 
 * Instead of calling calculateGravity() externally, this behavior
 * applies gravitational forces directly in the agent steering loop.
 * 
 * Based on: physics.ts calculateGravity()
 * Pattern: Custom SteeringBehavior (like Yuka's Pursuit/Flee)
 * 
 * Formula: F = G * (m1 * m2) / r²
 * Where:
 * - G = 6.674e-11 (gravitational constant)
 * - m1, m2 = masses
 * - r = distance
 */

import { SteeringBehavior, Vector3 } from 'yuka';
import { PHYSICS_CONSTANTS } from '../../tables/physics-constants';

const force = new Vector3();
const direction = new Vector3();

export class GravityBehavior extends SteeringBehavior {
  /**
   * Minimum distance to prevent singularities
   * @type {number}
   */
  minDistance: number = 0.1;
  
  /**
   * Maximum force to prevent explosions
   * @type {number}
   */
  maxForce: number = 100;
  
  /**
   * Gravitational constant (can be scaled for game feel)
   * @type {number}
   */
  G: number = PHYSICS_CONSTANTS.G;
  
  /**
   * Scale factor for game-friendly gravity (default 1.0 = realistic)
   * Set to higher values (1e10, 1e20) for visible effects at game scales
   * @type {number}
   */
  scale: number = 1.0;
  
  constructor() {
    super();
  }
  
  /**
   * Calculate gravitational force toward all massive neighbors
   * 
   * @param {Vehicle} vehicle - The agent
   * @param {Vector3} force - Force accumulator
   * @param {number} delta - Time delta
   * @returns {Vector3} - Accumulated force
   */
  calculate(vehicle: any, force: Vector3, delta: number): Vector3 {
    // Get all entities with mass
    const entities = vehicle.manager?.entities || [];
    
    for (const entity of entities) {
      if (entity === vehicle) continue;
      if (!entity.mass || entity.mass === 0) continue;
      
      // Calculate distance
      direction.subVectors(entity.position, vehicle.position);
      const distanceSquared = Math.max(
        direction.squaredLength(),
        this.minDistance * this.minDistance
      );
      const distance = Math.sqrt(distanceSquared);
      
      // F = G * (m1 * m2) / r²
      const m1 = vehicle.mass || 1;
      const m2 = entity.mass || 1;
      const magnitude = (this.G * this.scale * m1 * m2) / distanceSquared;
      
      // Clamp to maxForce
      const clampedMagnitude = Math.min(magnitude, this.maxForce);
      
      // Direction (normalize)
      direction.divideScalar(distance);
      
      // Add to force accumulator
      force.add(direction.multiplyScalar(clampedMagnitude));
    }
    
    return force;
  }
}

