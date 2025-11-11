/**
 * FORAGING BEHAVIOR
 * 
 * Optimal foraging theory as Yuka Goal + Evaluator.
 * Based on Charnov's Marginal Value Theorem.
 */

import { Goal, GoalEvaluator, SteeringBehavior, Vector3 } from 'yuka';

const toTarget = new Vector3();

/**
 * FORAGING GOAL EVALUATOR
 * 
 * Decides when to forage based on energy state and food availability.
 */
export class ForagingEvaluator extends GoalEvaluator {
    calculateDesirability(agent: any): number {
        if (!agent.energy || !agent.maxEnergy) return 0;
        
        const energyRatio = agent.energy / agent.maxEnergy;
        
        // Forage when energy < 50%
        if (energyRatio < 0.3) return 1.0;
        if (energyRatio < 0.5) return 0.7;
        return 0.3; // Always some desire to forage
    }

    setGoal(agent: any): void {
        const currentGoal = agent.brain?.currentSubgoal();
        if (!(currentGoal instanceof ForageGoal)) {
            agent.brain.clearSubgoals();
            agent.brain.addSubgoal(new ForageGoal(agent));
        }
    }
}

/**
 * FORAGE GOAL
 * 
 * Find best patch → Exploit until marginal gains drop → Leave
 */
export class ForageGoal extends Goal {
    owner: any;
    status: string;
    active!: () => boolean;

    constructor(owner: any) {
        super(owner);
    }

    activate(): void {
        const patch = this.findBestPatch(this.owner);
        if (patch) {
            this.owner.currentPatch = patch;
            this.owner.patchGainRate = patch.gainRate || 10;
        } else {
            this.status = Goal.STATUS.FAILED;
        }
    }

    execute(): void {
        if (!this.active()) return;

        const owner = this.owner;
        const patch = owner.currentPatch;

        if (!patch) {
            this.status = Goal.STATUS.FAILED;
            return;
        }

        // Check if reached patch
        const distance = owner.position.distanceTo(patch.position);

        if (distance < 2.0) {
            // Exploit patch
            const gained = patch.exploit(owner);
            owner.energy = Math.min(owner.maxEnergy, owner.energy + gained);

            // Marginal Value Theorem: Leave when gain rate drops
            const avgGainRate = owner.averageGainRate || 5;
            if (patch.gainRate < avgGainRate) {
                this.status = Goal.STATUS.COMPLETED;
            }
        } else {
            // Move toward patch
            toTarget.subVectors(patch.position, owner.position).normalize();
            owner.velocity.add(toTarget.multiplyScalar(0.1));
        }
    }

    terminate(): void {
        this.owner.currentPatch = null;
    }

    private findBestPatch(agent: any): any | null {
        const entities = agent.manager?.entities || [];
        let best = null;
        let maxProfitability = -Infinity;

        for (const entity of entities) {
            if (entity.type === 'food_patch') {
                const distance = agent.position.distanceTo(entity.position);
                const travelTime = distance / (agent.maxSpeed || 5);
                const profitability = (entity.gainRate || 10) / (travelTime + 1);

                if (profitability > maxProfitability) {
                    maxProfitability = profitability;
                    best = entity;
                }
            }
        }

        return best;
    }
}

/**
 * DIET BREADTH BEHAVIOR
 * 
 * Decides which prey to pursue based on energy/handling time ratio.
 */
export class DietBreadthBehavior extends SteeringBehavior {
    minimumProfitability: number = 5; // J/s

    calculate(vehicle: any, force: Vector3, delta: number): Vector3 {
        const entities = vehicle.manager?.entities || [];
        let bestPrey = null;
        let maxProfitability = -Infinity;

        for (const entity of entities) {
            if (entity.type === 'prey' && entity !== vehicle) {
                const energy = entity.energyValue || 100;
                const handlingTime = entity.handlingTime || 10;
                const profitability = energy / handlingTime;

                // Only pursue if profitable enough
                if (profitability > this.minimumProfitability && profitability > maxProfitability) {
                    maxProfitability = profitability;
                    bestPrey = entity;
                }
            }
        }

        if (bestPrey) {
            toTarget.subVectors(bestPrey.position, vehicle.position);
            force.copy(toTarget.normalize().multiplyScalar(vehicle.maxSpeed || 5));
        }

        return force;
    }
}

