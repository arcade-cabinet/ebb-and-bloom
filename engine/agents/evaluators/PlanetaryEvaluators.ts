/**
 * PLANETARY AGENT EVALUATORS
 * 
 * Determine which goals planetary agents should pursue.
 */

import { GoalEvaluator } from 'yuka';
import { PlanetaryAgent, ClimateGoal, LifeGoal } from '../PlanetaryAgent';

/**
 * Climate Evaluator - Planet should evolve its climate
 */
export class ClimateEvaluator extends GoalEvaluator {
  calculateDesirability(planet: PlanetaryAgent): number {
    // Always evolving climate
    return 1.0;
  }
  
  setGoal(planet: PlanetaryAgent): void {
    if (!planet.brain) return;
    
    const currentSubgoal = planet.brain.currentSubgoal();
    
    if (!(currentSubgoal instanceof ClimateGoal)) {
      planet.brain.clearSubgoals();
      planet.brain.addSubgoal(new ClimateGoal(planet as any));
    }
  }
}

/**
 * Life Evaluator - Planet should develop life (if conditions allow)
 */
export class LifeEvaluator extends GoalEvaluator {
  calculateDesirability(planet: PlanetaryAgent): number {
    // Check if conditions are right for life
    // (temperature, water, etc.)
    if (planet.temperature > 273 && planet.temperature < 373) {
      // Liquid water range
      return 0.8;
    }
    return 0.0;
  }
  
  setGoal(planet: PlanetaryAgent): void {
    if (!planet.brain) return;
    
    const currentSubgoal = planet.brain.currentSubgoal();
    
    if (!(currentSubgoal instanceof LifeGoal)) {
      planet.brain.clearSubgoals();
      planet.brain.addSubgoal(new LifeGoal(planet as any));
    }
  }
}

