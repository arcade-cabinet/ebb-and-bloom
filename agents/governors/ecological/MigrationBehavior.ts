/**
 * MIGRATION BEHAVIOR
 * 
 * Seasonal movement patterns.
 */

import { SteeringBehavior, Vector3 } from 'yuka';

const toDestination = new Vector3();

export class MigrationBehavior extends SteeringBehavior {
    summerDestination: Vector3;
    winterDestination: Vector3;
    migrationThreshold: number = 0.7; // Trigger when resources < 70%

    constructor(summer: Vector3, winter: Vector3) {
        super();
        this.summerDestination = summer;
        this.winterDestination = winter;
    }

    calculate(vehicle: any, force: Vector3, delta: number): Vector3 {
        // Check resource availability
        const resourceLevel = vehicle.localResourceLevel || 1.0;
        
        if (resourceLevel < this.migrationThreshold) {
            // Migrate to better location
            const currentSeason = vehicle.season || 'summer';
            const destination = currentSeason === 'summer' ? this.winterDestination : this.summerDestination;

            toDestination.subVectors(destination, vehicle.position);
            const distance = toDestination.length();

            if (distance > 1.0) {
                force.copy(toDestination.normalize().multiplyScalar(vehicle.maxSpeed || 5));
            }
        }

        return force;
    }
}

