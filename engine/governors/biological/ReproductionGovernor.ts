/**
 * REPRODUCTION GOVERNOR
 * 
 * Biological reproduction as Yuka Goal + Evaluator.
 * 
 * Implements:
 * - Mate-seeking behavior
 * - Gestation from allometric laws
 * - Offspring creation
 * 
 * Based on: biology.ts AllometricScaling (gestationTime, generationTime)
 * Pattern: GoalEvaluator + Goal (like MetabolismGovernor)
 */

import { Goal, GoalEvaluator, Vehicle } from 'yuka';

// Allometric scaling (from biology laws)
const AllometricScaling = {
    gestationTime: (mass: number) => 0.162 * Math.pow(mass, 0.25)
};

/**
 * REPRODUCTION GOAL EVALUATOR
 * 
 * Desirability based on:
 * - Maturity (must be adult)
 * - Energy levels (need surplus)
 * - Mate availability
 */
export class ReproductionEvaluator extends GoalEvaluator {
    /**
     * Calculate desirability of reproduction
     * 
     * @param agent - The agent
     * @returns Desirability (0-1)
     */
    calculateDesirability(agent: any): number {
        // Must be capable of reproduction
        if (!agent.canReproduce) return 0;

        // Must have sufficient energy (>70% of max)
        if (agent.energy === undefined || agent.maxEnergy === undefined) return 0;
        const energyRatio = agent.energy / agent.maxEnergy;
        if (energyRatio < 0.7) return 0;

        // Check for cooldown (just reproduced)
        if (agent.reproductionCooldown && agent.reproductionCooldown > 0) return 0;

        // Check for mate availability
        const hasMate = this.findMate(agent) !== null;
        if (!hasMate) return 0;

        // Desirability increases with surplus energy
        const surplusRatio = (energyRatio - 0.7) / 0.3; // 0-1 scale
        return 0.8 * surplusRatio; // High priority but below survival
    }

    /**
     * Set SeekMateGoal as current goal
     */
    setGoal(agent: any): void {
        const currentGoal = agent.brain?.currentSubgoal();

        if (!(currentGoal instanceof SeekMateGoal)) {
            agent.brain.clearSubgoals();
            agent.brain.addSubgoal(new SeekMateGoal(agent));
        }
    }

    /**
     * Find compatible mate
     */
    private findMate(agent: any): any | null {
        const entities = agent.manager?.entities || [];
        
        for (const entity of entities) {
            if (entity === agent) continue;
            if (entity.species !== agent.species) continue;
            if (!entity.canReproduce) continue;
            if (entity.reproductionCooldown && entity.reproductionCooldown > 0) continue;

            // Compatible mate found
            const distance = agent.position.distanceTo(entity.position);
            if (distance < 50) {
                return entity;
            }
        }

        return null;
    }
}

/**
 * SEEK MATE GOAL
 * 
 * Composite goal: Find mate → Approach → Reproduce
 */
export class SeekMateGoal extends Goal {
    owner: any;
    status: string;
    
    constructor(owner: any) {
        super(owner);
    }

    activate(): void {
        const owner = this.owner;

        // Find nearest compatible mate
        const mate = this.findMate(owner);

        if (mate) {
            owner.currentMate = mate;
        } else {
            this.status = Goal.STATUS.FAILED;
        }
    }

    execute(): void {
        if (!this.active()) return;

        const owner = this.owner;
        const mate = owner.currentMate;

        if (!mate || !mate.canReproduce) {
            this.status = Goal.STATUS.FAILED;
            return;
        }

        // Check if close enough to mate
        const distance = owner.position.distanceTo(mate.position);

        if (distance < 2.0) {
            // REPRODUCE!
            this.reproduce(owner, mate);
            this.status = Goal.STATUS.COMPLETED;
        } else {
            // Move toward mate
            const toMate = mate.position.clone().sub(owner.position).normalize();
            owner.velocity.add(toMate.multiplyScalar(0.1));
        }
    }

    terminate(): void {
        const owner = this.owner;
        owner.currentMate = null;
    }

    /**
     * Create offspring
     */
    private reproduce(parent1: any, parent2: any): void {
        const mass = parent1.mass || 10;
        const gestationTime = AllometricScaling.gestationTime(mass); // years

        // Energy cost (pregnancy is expensive!)
        const energyCost = parent1.maxEnergy * 0.3;
        parent1.energy = Math.max(0, parent1.energy - energyCost);

        // Set cooldown based on gestation time
        const cooldownSeconds = gestationTime * 365.25 * 24 * 3600; // years → seconds
        parent1.reproductionCooldown = cooldownSeconds;
        parent2.reproductionCooldown = cooldownSeconds;

        // Spawn offspring (callback to world manager)
        if (parent1.onReproduce) {
            parent1.onReproduce(parent1, parent2);
        }
    }

    /**
     * Find compatible mate
     */
    private findMate(agent: any): any | null {
        const entities = agent.manager?.entities || [];
        let nearest = null;
        let minDist = Infinity;

        for (const entity of entities) {
            if (entity === agent) continue;
            if (entity.species !== agent.species) continue;
            if (!entity.canReproduce) continue;
            if (entity.reproductionCooldown && entity.reproductionCooldown > 0) continue;

            const dist = agent.position.distanceTo(entity.position);
            if (dist < minDist) {
                minDist = dist;
                nearest = entity;
            }
        }

        return nearest;
    }
}

/**
 * REPRODUCTION SYSTEM
 * 
 * Updates cooldowns and offspring state.
 */
export class ReproductionSystem {
    /**
     * Update reproduction cooldown
     * 
     * @param agent - The agent
     * @param delta - Time delta (seconds)
     */
    static update(agent: any, delta: number): void {
        if (agent.reproductionCooldown !== undefined && agent.reproductionCooldown > 0) {
            agent.reproductionCooldown = Math.max(0, agent.reproductionCooldown - delta);
        }
    }
}

