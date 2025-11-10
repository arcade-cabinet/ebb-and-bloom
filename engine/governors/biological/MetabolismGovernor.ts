/**
 * METABOLISM GOVERNOR
 * 
 * Kleiber's Law as Yuka Goal + Evaluator.
 * 
 * Implements:
 * - Metabolic rate from body mass (M = 70 * mass^0.75)
 * - Energy depletion over time
 * - Hunger goal when energy low
 * 
 * Based on: biology.ts calculateMetabolicRate()
 * Pattern: GoalEvaluator + Goal (like examples/goal/)
 */

import { GoalEvaluator, Goal, Vector3 } from 'yuka';

/**
 * Kleiber's Law: Metabolic rate = 70 * mass^0.75 (watts)
 */
function calculateMetabolicRate(bodyMass: number): number {
  return 70 * Math.pow(bodyMass, 0.75);
}

/**
 * HUNGER GOAL EVALUATOR
 * 
 * Desirability increases as energy depletes.
 * Uses Kleiber's Law to determine energy needs.
 */
export class HungerEvaluator extends GoalEvaluator {
  /**
   * Calculate how badly the agent needs food
   * 
   * @param agent - The agent
   * @returns Desirability (0-1)
   */
  calculateDesirability(agent: any): number {
    // No energy property = not hungry
    if (agent.energy === undefined) return 0;
    if (agent.maxEnergy === undefined) return 0;
    
    // Energy ratio (0 = starving, 1 = full)
    const energyRatio = agent.energy / agent.maxEnergy;
    
    // Desirability inversely proportional to energy
    // When energy < 30%, hunger becomes high priority
    if (energyRatio < 0.3) {
      return 1.0; // CRITICAL - must eat!
    } else if (energyRatio < 0.6) {
      return 0.6; // Should eat soon
    } else {
      return 0.0; // Not hungry
    }
  }
  
  /**
   * Set SeekFoodGoal as current goal
   */
  setGoal(agent: any): void {
    const currentGoal = agent.brain?.currentSubgoal();
    
    if (!(currentGoal instanceof SeekFoodGoal)) {
      agent.brain.clearSubgoals();
      agent.brain.addSubgoal(new SeekFoodGoal(agent));
    }
  }
}

/**
 * SEEK FOOD GOAL
 * 
 * Composite goal: Find nearest food → Move to it → Eat it
 */
export class SeekFoodGoal extends Goal {
  constructor(owner: any) {
    super(owner);
  }
  
  activate(): void {
    const owner = this.owner;
    
    // Find nearest food source
    const food = this.findNearestFood(owner);
    
    if (food) {
      owner.currentTarget = food;
      
      // Use Yuka's arrive behavior to reach food
      const arriveBehavior = owner.steering?.behaviors?.find(
        (b: any) => b.constructor.name === 'ArriveBehavior'
      );
      
      if (arriveBehavior) {
        arriveBehavior.target = food.position;
        arriveBehavior.active = true;
      }
    } else {
      this.status = Goal.STATUS.FAILED;
    }
  }
  
  execute(): void {
    if (!this.active()) return;
    
    const owner = this.owner;
    const target = owner.currentTarget;
    
    if (!target) {
      this.status = Goal.STATUS.FAILED;
      return;
    }
    
    // Check if reached food
    const distance = owner.position.distanceTo(target.position);
    
    if (distance < 1.0) {
      // Eat! Restore energy based on Kleiber's Law
      const metabolicRate = calculateMetabolicRate(owner.mass || 1);
      const energyGain = metabolicRate * 10; // 10 seconds worth
      
      owner.energy = Math.min(owner.maxEnergy, owner.energy + energyGain);
      
      // Remove food (or reduce its quantity)
      if (target.consume) {
        target.consume();
      }
      
      this.status = Goal.STATUS.COMPLETED;
    }
  }
  
  terminate(): void {
    const arriveBehavior = this.owner.steering?.behaviors?.find(
      (b: any) => b.constructor.name === 'ArriveBehavior'
    );
    
    if (arriveBehavior) {
      arriveBehavior.active = false;
    }
    
    this.owner.currentTarget = null;
  }
  
  /**
   * Find nearest food in entity manager
   */
  private findNearestFood(agent: any): any | null {
    const entities = agent.manager?.entities || [];
    let nearest = null;
    let minDist = Infinity;
    
    for (const entity of entities) {
      if (entity.type === 'food' && entity.available) {
        const dist = agent.position.distanceTo(entity.position);
        if (dist < minDist) {
          minDist = dist;
          nearest = entity;
        }
      }
    }
    
    return nearest;
  }
}

/**
 * METABOLISM SYSTEM
 * 
 * Depletes energy based on Kleiber's Law over time.
 * Add to agent's update() method.
 */
export class MetabolismSystem {
  /**
   * Update agent's energy based on metabolic rate
   * 
   * @param agent - The agent
   * @param delta - Time delta (seconds)
   */
  static update(agent: any, delta: number): void {
    if (agent.energy === undefined) return;
    if (agent.mass === undefined) return;
    
    // Kleiber's Law: M = 70 * mass^0.75 (watts)
    const metabolicRate = calculateMetabolicRate(agent.mass);
    
    // Energy cost = metabolic rate * time
    const energyCost = metabolicRate * delta;
    
    // Deplete energy
    agent.energy = Math.max(0, agent.energy - energyCost);
    
    // Check for starvation
    if (agent.energy === 0 && agent.onStarve) {
      agent.onStarve();
    }
  }
}

