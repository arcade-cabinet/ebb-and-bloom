/**
 * STELLAR AGENT EVALUATORS
 * 
 * Determine which goals stellar agents should pursue based on current state.
 * Follows Yuka's GoalEvaluator pattern for production-grade AI.
 */

import { GoalEvaluator } from 'yuka';
import { StellarAgent, FusionGoal, SupernovaGoal } from '../StellarAgent';

/**
 * Fusion Evaluator - Star should fuse hydrogen
 */
export class FusionEvaluator extends GoalEvaluator {
  calculateDesirability(star: StellarAgent): number {
    // Always want to fuse if we have fuel
    return star.fuelRemaining > 0 ? 1.0 : 0.0;
  }
  
  setGoal(star: StellarAgent): void {
    if (!star.brain) return;
    
    const currentSubgoal = star.brain.currentSubgoal();
    
    // Only add if not already active
    if (!(currentSubgoal instanceof FusionGoal)) {
      star.brain.clearSubgoals();
      star.brain.addSubgoal(new FusionGoal(star as any));
    }
  }
}

/**
 * Supernova Evaluator - Massive star should explode
 */
export class SupernovaEvaluator extends GoalEvaluator {
  calculateDesirability(star: StellarAgent): number {
    // Only massive stars (> 8 solar masses) go supernova
    // Only when fuel is depleted
    if (star.mass > 8 && star.fuelRemaining <= 0) {
      return 1.0;
    }
    return 0.0;
  }
  
  setGoal(star: StellarAgent): void {
    if (!star.brain) return;
    
    const currentSubgoal = star.brain.currentSubgoal();
    
    // Only add if not already active
    if (!(currentSubgoal instanceof SupernovaGoal)) {
      star.brain.clearSubgoals();
      star.brain.addSubgoal(new SupernovaGoal(star as any));
    }
  }
}

