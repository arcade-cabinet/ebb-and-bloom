/**
 * HIERARCHY BEHAVIOR
 * 
 * Social dominance as Yuka steering behavior.
 * 
 * Implements:
 * - Dominance interactions (approach/defer)
 * - Hierarchy establishment
 * - Resource priority
 * 
 * Based on: social.ts dominance hierarchies, Service typology
 * Pattern: Custom SteeringBehavior with rank tracking
 */

import { SteeringBehavior, Vector3 } from 'yuka';

const force = new Vector3();
const toOther = new Vector3();

export class HierarchyBehavior extends SteeringBehavior {
    /**
     * Strength of dominance interactions
     * @type {number}
     */
    dominanceWeight: number = 1.0;

    /**
     * Distance for dominance interactions
     * @type {number}
     */
    interactionRadius: number = 10;

    constructor() {
        super();
    }

    /**
     * Calculate dominance-based steering
     * 
     * Dominant individuals:
     * - Approach subordinates (assert dominance)
     * - Ignore equals
     * 
     * Subordinate individuals:
     * - Defer to dominants (avoid)
     * - Challenge equals
     * 
     * @param {Vehicle} vehicle - The agent
     * @param {Vector3} force - Force accumulator
     * @param {number} delta - Time delta
     * @returns {Vector3} - Accumulated force
     */
    calculate(vehicle: any, force: Vector3, delta: number): Vector3 {
        const myRank = vehicle.socialRank || 0;
        const entities = vehicle.manager?.entities || [];

        for (const other of entities) {
            if (other === vehicle) continue;
            if (other.socialRank === undefined) continue;

            const distance = vehicle.position.distanceTo(other.position);
            if (distance > this.interactionRadius) continue;

            const otherRank = other.socialRank;
            const rankDifference = myRank - otherRank;

            // Direction to/from other
            toOther.subVectors(other.position, vehicle.position);
            toOther.normalize();

            if (rankDifference > 0.2) {
                // I am DOMINANT - approach to assert dominance
                const approachForce = toOther.clone().multiplyScalar(this.dominanceWeight * 0.5);
                force.add(approachForce);

            } else if (rankDifference < -0.2) {
                // I am SUBORDINATE - defer (avoid)
                const deferForce = toOther.clone().multiplyScalar(-this.dominanceWeight);
                force.add(deferForce);

            } else {
                // EQUALS - competitive tension
                // Slight approach for dominance challenge
                const challengeForce = toOther.clone().multiplyScalar(this.dominanceWeight * 0.1);
                force.add(challengeForce);
            }
        }

        return force;
    }

    /**
     * Resolve dominance interaction
     * 
     * Called when two agents interact (fight, display, etc.)
     * Winner gains rank, loser loses rank
     * 
     * @param agent1 - First agent
     * @param agent2 - Second agent
     * @returns Winner
     */
    static resolveDominance(agent1: any, agent2: any): any {
        const rank1 = agent1.socialRank || 0;
        const rank2 = agent2.socialRank || 0;

        // Factors affecting dominance
        const size1 = agent1.mass || 1;
        const size2 = agent2.mass || 1;
        const age1 = agent1.age || 1;
        const age2 = agent2.age || 1;

        // Dominance score
        const score1 = rank1 + Math.log(size1) * 0.3 + Math.log(age1) * 0.1;
        const score2 = rank2 + Math.log(size2) * 0.3 + Math.log(age2) * 0.1;

        // Add randomness (sometimes underdog wins)
        const random1 = Math.random() * 0.2;
        const random2 = Math.random() * 0.2;

        const final1 = score1 + random1;
        const final2 = score2 + random2;

        if (final1 > final2) {
            // Agent1 wins
            agent1.socialRank = Math.min(1, rank1 + 0.05);
            agent2.socialRank = Math.max(0, rank2 - 0.05);
            return agent1;
        } else {
            // Agent2 wins
            agent2.socialRank = Math.min(1, rank2 + 0.05);
            agent1.socialRank = Math.max(0, rank1 - 0.05);
            return agent2;
        }
    }

    /**
     * Initialize ranks for a group
     * 
     * @param agents - Array of agents
     */
    static initializeHierarchy(agents: any[]): void {
        // Sort by size (larger = higher rank initially)
        const sorted = [...agents].sort((a, b) => (b.mass || 1) - (a.mass || 1));

        // Assign ranks (0 = lowest, 1 = highest)
        sorted.forEach((agent, index) => {
            agent.socialRank = index / Math.max(1, sorted.length - 1);
        });
    }

    /**
     * Get dominant individual in group
     */
    static getAlpha(agents: any[]): any | null {
        if (agents.length === 0) return null;
        return agents.reduce((alpha, agent) => {
            return (agent.socialRank || 0) > (alpha.socialRank || 0) ? agent : alpha;
        });
    }
}

