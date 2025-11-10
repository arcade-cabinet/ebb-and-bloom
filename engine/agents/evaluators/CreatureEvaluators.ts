/**
 * CREATURE AGENT EVALUATORS
 * 
 * Determine which goals creature agents should pursue.
 */

import { GoalEvaluator } from 'yuka';
import { CreatureAgent, SurvivalGoal, ReproductionGoal } from '../CreatureAgent';

/**
 * Survival Evaluator - Creature should find food/water/shelter
 */
export class SurvivalEvaluator extends GoalEvaluator {
  calculateDesirability(creature: CreatureAgent): number {
    // Survival is always high priority
    // Gets more urgent as hunger increases
    return 0.5 + (creature.hunger * 0.5);
  }
  
  setGoal(creature: CreatureAgent): void {
    if (!creature.brain) return;
    
    const currentSubgoal = creature.brain.currentSubgoal();
    
    if (!(currentSubgoal instanceof SurvivalGoal)) {
      creature.brain.clearSubgoals();
      creature.brain.addSubgoal(new SurvivalGoal(creature as any));
    }
  }
}

/**
 * Reproduction Evaluator - Creature should reproduce (if conditions allow)
 */
export class ReproductionEvaluator extends GoalEvaluator {
  calculateDesirability(creature: CreatureAgent): number {
    // Only reproduce if:
    // 1. Mature (age > 5)
    // 2. Well-fed (hunger < 0.3)
    // 3. Not already reproducing
    if (creature.age > 5 && creature.hunger < 0.3) {
      return 0.7;
    }
    return 0.0;
  }
  
  setGoal(creature: CreatureAgent): void {
    if (!creature.brain) return;
    
    const currentSubgoal = creature.brain.currentSubgoal();
    
    if (!(currentSubgoal instanceof ReproductionGoal)) {
      creature.brain.clearSubgoals();
      creature.brain.addSubgoal(new ReproductionGoal(creature as any));
    }
  }
}

