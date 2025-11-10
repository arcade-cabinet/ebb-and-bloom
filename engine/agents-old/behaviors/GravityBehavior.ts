/**
 * GRAVITY BEHAVIOR
 * 
 * Steering behavior that makes agents cluster via gravitational attraction.
 * THIS is how structure emerges - not forced placement!
 * 
 * Based on Yuka's SteeringBehavior pattern.
 * Calculates gravitational forces between agents.
 */

import { Vector3 } from 'yuka';

// Yuka doesn't export SteeringBehavior in types, so we define interface
interface SteeringBehavior {
  active: boolean;
  weight: number;
  calculate(vehicle: any, force: Vector3, delta: number): Vector3;
}

/**
 * Gravitational constant (scaled for game units)
 * Real G = 6.674e-11 m³/(kg·s²)
 * Scaled for game performance
 */
const G_SCALED = 1e-6; // Adjusted for game units and time step

/**
 * Softening parameter (prevents singularities at close range)
 */
const SOFTENING = 0.1;

/**
 * Gravity Behavior
 * 
 * Agents attract each other based on mass and distance.
 * Creates natural clustering (galaxies, star systems, etc.)
 */
export class GravityBehavior implements SteeringBehavior {
  active: boolean = true;
  weight: number = 1.0;
  
  // Maximum range for gravitational influence
  maxRange: number = 1000; // Game units
  
  constructor(maxRange?: number) {
    if (maxRange !== undefined) {
      this.maxRange = maxRange;
    }
  }
  
  /**
   * Calculate gravitational forces on vehicle
   * 
   * F = G * m1 * m2 / r²
   * But we return acceleration (F/m1 = G * m2 / r²)
   */
  calculate(vehicle: any, force: Vector3, delta: number): Vector3 {
    if (!this.active) return force;
    if (!vehicle.manager) return force;
    if (!vehicle.mass) return force; // No mass = no gravity
    
    // Iterate through all entities in manager
    for (const other of vehicle.manager.entities) {
      // Skip self
      if (other === vehicle) continue;
      
      // Only apply gravity to entities with mass
      if (!other.mass) continue;
      
      // Calculate direction and distance
      const direction = new Vector3().copy(other.position).sub(vehicle.position);
      const distance = direction.length();
      
      // Skip if too far (performance optimization)
      if (distance > this.maxRange) continue;
      
      // Prevent division by zero with softening
      const r2 = distance * distance + SOFTENING * SOFTENING;
      
      // Calculate gravitational force magnitude
      // F = G * m1 * m2 / r²
      // Acceleration a = F/m1 = G * m2 / r²
      const gravityMagnitude = (G_SCALED * other.mass) / r2;
      
      // Add to force (direction toward other)
      direction.normalize();
      force.add(direction.multiplyScalar(gravityMagnitude));
    }
    
    // Apply weight
    force.multiplyScalar(this.weight);
    
    return force;
  }
}

/**
 * USAGE:
 * 
 * // Add to any agent that should experience gravity
 * class StellarAgent extends Vehicle {
 *   start() {
 *     // Add gravity steering
 *     const gravityBehavior = new GravityBehavior(1000); // 1000 unit range
 *     this.steering.add(gravityBehavior);
 *     
 *     return this;
 *   }
 * }
 * 
 * // Agents will cluster naturally!
 * // - Dense regions attract more agents
 * // - Galaxies form from clustering
 * // - Spiral structure emerges from angular momentum
 * // - NO forced placement needed!
 */

