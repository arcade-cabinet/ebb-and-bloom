/**
 * COOPERATION BEHAVIOR
 * 
 * Game theory and reciprocal altruism.
 */

import { SteeringBehavior, Vector3 } from 'yuka';

export class CooperationBehavior extends SteeringBehavior {
    cooperationProbability: number = 0.7;

    calculate(vehicle: any, force: Vector3, delta: number): Vector3 {
        const entities = vehicle.manager?.entities || [];
        
        for (const other of entities) {
            if (other === vehicle || !other.needsHelp) continue;

            const distance = vehicle.position.distanceTo(other.position);
            if (distance < 10) {
                // Reciprocal altruism: Help if they helped you before
                const hasHelpedBefore = vehicle.helpHistory?.[other.uuid] || 0;
                const willCooperate = hasHelpedBefore > 0 || Math.random() < this.cooperationProbability;

                if (willCooperate) {
                    // Move toward to help
                    const toOther = new Vector3().subVectors(other.position, vehicle.position);
                    force.add(toOther.normalize().multiplyScalar(0.5));

                    // Record cooperation
                    if (!vehicle.helpHistory) vehicle.helpHistory = {};
                    vehicle.helpHistory[other.uuid] = (vehicle.helpHistory[other.uuid] || 0) + 1;
                }
            }
        }

        return force;
    }
}

/**
 * Tit-for-tat strategy
 */
export class TitForTatBehavior {
    static shouldCooperate(agent: any, partner: any): boolean {
        // Start cooperative
        if (!agent.interactions) agent.interactions = {};
        if (!agent.interactions[partner.uuid]) return true;

        // Mirror partner's last move
        return agent.interactions[partner.uuid].lastMove === 'cooperate';
    }

    static recordInteraction(agent: any, partner: any, move: 'cooperate' | 'defect'): void {
        if (!agent.interactions) agent.interactions = {};
        agent.interactions[partner.uuid] = { lastMove: move };
    }
}

