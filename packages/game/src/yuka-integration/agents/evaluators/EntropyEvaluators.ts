/**
 * ENTROPY AGENT EVALUATORS
 * 
 * EntropyAgent has ONE goal: evolve the universe.
 * This evaluator always returns max desirability.
 */

import { GoalEvaluator } from 'yuka';
import { EntropyAgent, UniverseEvolutionGoal } from '../EntropyAgent';

/**
 * Universe Evolution Evaluator
 * Always wants to evolve (expand/contract based on phase)
 */
export class UniverseEvolutionEvaluator extends GoalEvaluator {
  calculateDesirability(universe: EntropyAgent): number {
    // Universe always wants to evolve
    return 1.0;
  }
  
  setGoal(universe: EntropyAgent): void {
    if (!universe.brain) return;
    
    const currentSubgoal = universe.brain.currentSubgoal();
    
    // Only add if not already active
    if (!(currentSubgoal instanceof UniverseEvolutionGoal)) {
      universe.brain.clearSubgoals();
      universe.brain.addSubgoal(new UniverseEvolutionGoal(universe as any));
    }
  }
}

