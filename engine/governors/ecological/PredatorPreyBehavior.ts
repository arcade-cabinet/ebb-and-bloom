/**
 * PREDATOR-PREY BEHAVIOR
 * 
 * Lotka-Volterra equations as Yuka steering behaviors.
 * 
 * Implements:
 * - Predators pursue prey (α, β coefficients)
 * - Prey flee from predators (δ, γ coefficients)
 * - Population-based intensity
 * 
 * Based on: ecology.ts PredatorPreyDynamics
 * Pattern: Custom SteeringBehavior with role detection
 * 
 * Lotka-Volterra:
 * - Prey: dN/dt = αN - βNP
 * - Predator: dN/dt = δNP - γP
 */

import { SteeringBehavior, Vector3, Vehicle } from 'yuka';

const force = new Vector3();
const toTarget = new Vector3();

export class PredatorPreyBehavior extends SteeringBehavior {
    /**
     * Prey birth rate (α)
     * @type {number}
     */
    alpha: number = 0.5;

    /**
     * Predation rate (β)
     * @type {number}
     */
    beta: number = 0.02;

    /**
     * Conversion efficiency (δ) - prey → predator biomass
     * @type {number}
     */
    delta: number = 0.01;

    /**
     * Predator death rate (γ)
     * @type {number}
     */
    gamma: number = 0.3;

    /**
     * Detection radius
     * @type {number}
     */
    detectionRadius: number = 50;

    constructor() {
        super();
    }

    /**
     * Calculate pursuit or flee force based on role
     * 
     * @param {Vehicle} vehicle - The agent
     * @param {Vector3} force - Force accumulator
     * @param {number} delta - Time delta
     * @returns {Vector3} - Accumulated force
     */
    calculate(vehicle: any, force: Vector3, delta: number): Vector3 {
        const role = vehicle.role || 'prey';
        const entities = vehicle.manager?.entities || [];

        if (role === 'predator') {
            // PREDATORS: Pursue nearest prey
            let nearest: any = null;
            let minDist = Infinity;

            for (const entity of entities) {
                if ((entity as any).role === 'prey' && entity !== vehicle) {
                    const dist = vehicle.position.distanceTo((entity as any).position);
                    if (dist < this.detectionRadius && dist < minDist) {
                        minDist = dist;
                        nearest = entity;
                    }
                }
            }

            if (nearest) {
                // Pursuit force (weighted by β - predation rate)
                toTarget.subVectors(nearest.position, vehicle.position);
                const distance = toTarget.length();
                
                if (distance > 0) {
                    // Desired velocity toward prey
                    const desiredVelocity = toTarget.normalize().multiplyScalar(vehicle.maxSpeed || 5);
                    
                    // Steering force
                    force.copy(desiredVelocity).sub(vehicle.velocity).multiplyScalar(this.beta * 10);
                }
            }

        } else if (role === 'prey') {
            // PREY: Flee from nearest predator
            let nearest: any = null;
            let minDist = Infinity;

            for (const entity of entities) {
                if ((entity as any).role === 'predator') {
                    const dist = vehicle.position.distanceTo((entity as any).position);
                    if (dist < this.detectionRadius && dist < minDist) {
                        minDist = dist;
                        nearest = entity;
                    }
                }
            }

            if (nearest) {
                // Flee force (weighted by α - birth rate gives urgency)
                toTarget.subVectors(vehicle.position, nearest.position);
                const distance = toTarget.length();
                
                if (distance > 0) {
                    // Panic increases as predator gets closer
                    const panicMultiplier = Math.max(1, (this.detectionRadius - distance) / distance);
                    
                    // Desired velocity away from predator
                    const desiredVelocity = toTarget.normalize().multiplyScalar(vehicle.maxSpeed || 5);
                    
                    // Steering force
                    force.copy(desiredVelocity).sub(vehicle.velocity).multiplyScalar(this.alpha * panicMultiplier);
                }
            }
        }

        return force;
    }

    /**
     * Update population dynamics (call this on manager level)
     * 
     * @param preyPopulation - Total prey count
     * @param predatorPopulation - Total predator count
     * @param dt - Time delta
     * @returns New populations
     */
    static updatePopulations(
        preyPopulation: number,
        predatorPopulation: number,
        alpha: number = 0.5,
        beta: number = 0.02,
        delta: number = 0.01,
        gamma: number = 0.3,
        dt: number = 1
    ): { prey: number; predator: number } {
        // Lotka-Volterra equations
        const dPrey = (alpha * preyPopulation - beta * preyPopulation * predatorPopulation) * dt;
        const dPredator = (delta * preyPopulation * predatorPopulation - gamma * predatorPopulation) * dt;

        return {
            prey: Math.max(0, preyPopulation + dPrey),
            predator: Math.max(0, predatorPopulation + dPredator)
        };
    }
}

