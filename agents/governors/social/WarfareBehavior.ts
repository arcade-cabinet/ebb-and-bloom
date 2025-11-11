/**
 * WARFARE BEHAVIOR
 * 
 * Group conflict based on resource scarcity and political complexity.
 */

import { SteeringBehavior, Vector3 } from 'yuka';

const toEnemy = new Vector3();

export class WarfareBehavior extends SteeringBehavior {
    aggressionThreshold: number = 0.7;
    
    calculate(vehicle: any, force: Vector3, delta: number): Vector3 {
        const resourceScarcity = vehicle.resourceScarcity || 0;
        const populationPressure = vehicle.populationPressure || 0;
        
        // Warfare probability increases with scarcity and pressure
        const warfareProbability = 0.3 + (resourceScarcity * 0.4) + (populationPressure * 0.3);
        
        if (warfareProbability > this.aggressionThreshold) {
            // Find enemy groups
            const entities = vehicle.manager?.entities || [];
            let nearest = null;
            let minDist = Infinity;

            for (const entity of entities) {
                if (entity.group && entity.group !== vehicle.group) {
                    const dist = vehicle.position.distanceTo(entity.position);
                    if (dist < minDist && dist < 50) {
                        minDist = dist;
                        nearest = entity;
                    }
                }
            }

            if (nearest) {
                toEnemy.subVectors(nearest.position, vehicle.position);
                force.copy(toEnemy.normalize().multiplyScalar(vehicle.maxSpeed || 5));
            }
        }

        return force;
    }
}

/**
 * Military participation based on society type
 */
export class MilitarySystem {
    static militaryRatio(societyType: string): number {
        const ratios: Record<string, number> = {
            band: 0.3,
            tribe: 0.2,
            chiefdom: 0.1,
            state: 0.05
        };
        return ratios[societyType] || 0.1;
    }

    static casualtyRate(weaponTech: number, warIntensity: number): number {
        return 0.05 * weaponTech * warIntensity;
    }
}

