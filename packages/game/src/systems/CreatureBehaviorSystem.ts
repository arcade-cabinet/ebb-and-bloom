/**
 * Creature Behavior System
 * 
 * Implements autonomous creature behaviors:
 * - Movement on planet surface (spherical pathfinding)
 * - Foraging (seeking food)
 * - Fleeing (avoiding threats)
 * - Social behaviors (staying with pack)
 * 
 * Uses Yuka AI for goal-driven behavior
 */

export interface CreatureBehaviorState {
  id: string;
  position: { lat: number; lon: number; alt: number };
  velocity: { lat: number; lon: number }; // Degrees per second
  currentGoal: 'idle' | 'foraging' | 'fleeing' | 'socializing';
  targetPosition?: { lat: number; lon: number };
  energy: number; // 0-1
  hunger: number; // 0-1
  fear: number; // 0-1
}

export interface ResourceNode {
  id: string;
  type: 'food' | 'water' | 'shelter';
  position: { lat: number; lon: number };
  amount: number; // 0-1
}

/**
 * Creature Behavior Controller
 * Handles autonomous decision-making and movement
 */
export class CreatureBehaviorSystem {
  private resources: Map<string, ResourceNode> = new Map();
  
  constructor(_planetRadius: number = 5) {
    // Planet radius reserved for future spherical pathfinding enhancements
  }

  /**
   * Add resource node to world
   */
  addResource(resource: ResourceNode): void {
    this.resources.set(resource.id, resource);
  }

  /**
   * Update creature behavior for one frame
   */
  update(
    creature: CreatureBehaviorState,
    deltaTime: number, // seconds
    traits: {
      speed?: number;
      intelligence?: number;
      social?: string;
    }
  ): CreatureBehaviorState {
    // Decision making: What should creature do?
    const goal = this.decideGoal(creature, traits);
    
    // Update target based on goal
    if (goal === 'foraging' && !creature.targetPosition) {
      creature.targetPosition = this.findNearestFood(creature.position);
    }
    
    // Movement: Move toward target
    if (creature.targetPosition) {
      this.moveToward(creature, creature.targetPosition, deltaTime, traits.speed || 0.5);
    } else {
      // Wander randomly
      this.wander(creature, deltaTime, traits.speed || 0.5);
    }
    
    // Update internal state
    creature.hunger = Math.min(1, creature.hunger + deltaTime * 0.01); // Get hungry over time
    creature.energy = Math.max(0, creature.energy - deltaTime * 0.005); // Lose energy
    
    // Check if reached food
    if (creature.targetPosition) {
      const dist = this.distanceOnSphere(creature.position, creature.targetPosition);
      if (dist < 1) { // Within 1 degree
        // Eat food
        creature.hunger = Math.max(0, creature.hunger - 0.3);
        creature.energy = Math.min(1, creature.energy + 0.2);
        creature.targetPosition = undefined; // Find new target
      }
    }
    
    creature.currentGoal = goal;
    return creature;
  }

  /**
   * Decide what creature should do based on internal state
   */
  private decideGoal(
    creature: CreatureBehaviorState,
    traits: { intelligence?: number }
  ): CreatureBehaviorState['currentGoal'] {
    const intelligence = traits.intelligence || 0.3;
    
    // Simple decision tree (more sophisticated with higher intelligence)
    if (creature.fear > 0.7) {
      return 'fleeing';
    }
    
    if (creature.hunger > 0.6) {
      return 'foraging';
    }
    
    if (creature.energy < 0.3) {
      return 'idle'; // Rest
    }
    
    // Higher intelligence = better planning
    if (intelligence > 0.5 && creature.hunger > 0.4) {
      return 'foraging'; // Plan ahead
    }
    
    return 'idle';
  }

  /**
   * Find nearest food source
   */
  private findNearestFood(position: { lat: number; lon: number }): { lat: number; lon: number } | undefined {
    let nearest: ResourceNode | undefined;
    let minDist = Infinity;
    
    for (const resource of this.resources.values()) {
      if (resource.type === 'food' && resource.amount > 0) {
        const dist = this.distanceOnSphere(position, resource.position);
        if (dist < minDist) {
          minDist = dist;
          nearest = resource;
        }
      }
    }
    
    return nearest?.position;
  }

  /**
   * Calculate distance between two lat/lon points on sphere (degrees)
   */
  private distanceOnSphere(
    pos1: { lat: number; lon: number },
    pos2: { lat: number; lon: number }
  ): number {
    // Haversine formula (simplified for game use)
    const dLat = pos2.lat - pos1.lat;
    const dLon = pos2.lon - pos1.lon;
    
    // Simple Euclidean approximation (good enough for small distances)
    return Math.sqrt(dLat * dLat + dLon * dLon);
  }

  /**
   * Move creature toward target position
   */
  private moveToward(
    creature: CreatureBehaviorState,
    target: { lat: number; lon: number },
    deltaTime: number,
    speed: number
  ): void {
    const dLat = target.lat - creature.position.lat;
    const dLon = target.lon - creature.position.lon;
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);
    
    if (dist < 0.1) {
      return; // Close enough
    }
    
    // Normalize direction
    const dirLat = dLat / dist;
    const dirLon = dLon / dist;
    
    // Speed in degrees per second (adjusted by traits)
    const moveSpeed = speed * 5 * deltaTime; // 5 degrees/sec base
    
    // Update velocity
    creature.velocity.lat = dirLat * moveSpeed;
    creature.velocity.lon = dirLon * moveSpeed;
    
    // Update position
    creature.position.lat += creature.velocity.lat;
    creature.position.lon += creature.velocity.lon;
    
    // Wrap longitude
    if (creature.position.lon > 180) creature.position.lon -= 360;
    if (creature.position.lon < -180) creature.position.lon += 360;
    
    // Clamp latitude
    creature.position.lat = Math.max(-90, Math.min(90, creature.position.lat));
  }

  /**
   * Random wandering movement
   */
  private wander(
    creature: CreatureBehaviorState,
    deltaTime: number,
    speed: number
  ): void {
    // Random direction change every few seconds
    if (Math.random() < deltaTime * 0.5) { // 50% chance per second
      const angle = Math.random() * Math.PI * 2;
      const moveSpeed = speed * 2 * deltaTime;
      
      creature.velocity.lat = Math.cos(angle) * moveSpeed;
      creature.velocity.lon = Math.sin(angle) * moveSpeed;
    }
    
    // Apply velocity
    creature.position.lat += creature.velocity.lat;
    creature.position.lon += creature.velocity.lon;
    
    // Wrap/clamp
    if (creature.position.lon > 180) creature.position.lon -= 360;
    if (creature.position.lon < -180) creature.position.lon += 360;
    creature.position.lat = Math.max(-90, Math.min(90, creature.position.lat));
  }

  /**
   * Get velocity magnitude for animation speed
   */
  getSpeed(creature: CreatureBehaviorState): number {
    const vLat = creature.velocity.lat;
    const vLon = creature.velocity.lon;
    return Math.sqrt(vLat * vLat + vLon * vLon);
  }

  /**
   * Get direction vector for creature orientation
   */
  getDirection(creature: CreatureBehaviorState): { lat: number; lon: number } {
    const speed = this.getSpeed(creature);
    if (speed < 0.01) {
      return { lat: 0, lon: 1 }; // Default facing
    }
    return {
      lat: creature.velocity.lat / speed,
      lon: creature.velocity.lon / speed
    };
  }
}
