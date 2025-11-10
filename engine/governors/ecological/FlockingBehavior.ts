/**
 * FLOCKING BEHAVIOR
 * 
 * Ecology + Social laws as Yuka steering behavior.
 * 
 * Implements:
 * - Alignment (move in same direction as neighbors)
 * - Cohesion (move toward center of neighbors)
 * - Separation (avoid crowding)
 * - Dunbar's Number (max ~150 neighbors tracked)
 * 
 * Based on:
 * - ecology.ts (group behavior)
 * - social.ts (Dunbar's number, Service typology)
 * 
 * Pattern: Composite of 3 Yuka behaviors (like examples/steering/flocking)
 */

import {
    AlignmentBehavior,
    CohesionBehavior,
    SeparationBehavior,
    Vehicle
} from 'yuka';

export interface FlockingConfig {
    alignmentWeight?: number;
    cohesionWeight?: number;
    separationWeight?: number;
    neighborhoodRadius?: number;
    maxNeighbors?: number; // Dunbar's number constraint
}

export class FlockingGovernor {
    alignment: AlignmentBehavior;
    cohesion: CohesionBehavior;
    separation: SeparationBehavior;

    /**
     * Create flocking behavior (ecology + social laws)
     * 
     * @param config - Flocking parameters
     */
    constructor(config: FlockingConfig = {}) {
        const {
            alignmentWeight = 1.0,
            cohesionWeight = 0.9,
            separationWeight = 0.3,
            neighborhoodRadius = 10,
            maxNeighbors = 150 // Dunbar's number!
        } = config;

        this.alignment = new AlignmentBehavior();
        this.alignment.weight = alignmentWeight;

        this.cohesion = new CohesionBehavior();
        this.cohesion.weight = cohesionWeight;

        this.separation = new SeparationBehavior();
        this.separation.weight = separationWeight;
    }

    /**
     * Apply flocking to a vehicle
     * 
     * Based on Dunbar's number: agents only track ~150 nearest neighbors
     */
    applyTo(vehicle: Vehicle, neighborhoodRadius: number = 10): void {
        vehicle.updateNeighborhood = true;
        vehicle.neighborhoodRadius = neighborhoodRadius;

        vehicle.steering.add(this.alignment);
        vehicle.steering.add(this.cohesion);
        vehicle.steering.add(this.separation);
    }

    /**
     * Update weights dynamically (e.g., based on threat level)
     */
    setWeights(alignment: number, cohesion: number, separation: number): void {
        this.alignment.weight = alignment;
        this.cohesion.weight = cohesion;
        this.separation.weight = separation;
    }
}

