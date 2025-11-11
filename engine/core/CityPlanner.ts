/**
 * CITY PLANNER
 * 
 * Uses social governors to plan city layouts.
 * Replaces DFU's fixed RMB block layouts with governor-driven planning.
 */

import * as THREE from 'three';
import { EnhancedRNG } from '../utils/EnhancedRNG';

export interface CityLayout {
    center: THREE.Vector2;
    radius: number;
    districts: District[];
    roads: Road[];
    plaza: Plaza;
}

export interface District {
    type: 'residential' | 'commercial' | 'religious' | 'administrative';
    center: THREE.Vector2;
    buildings: BuildingPlot[];
}

export interface BuildingPlot {
    position: THREE.Vector2;
    rotation: number;
    size: THREE.Vector2;
    type: string;
}

export interface Road {
    start: THREE.Vector2;
    end: THREE.Vector2;
    width: number;
}

export interface Plaza {
    center: THREE.Vector2;
    radius: number;
}

export class CityPlanner {
    /**
     * Plan city layout from population + governance
     */
    planCity(
        population: number,
        governanceType: 'band' | 'tribe' | 'chiefdom' | 'state',
        centerX: number,
        centerZ: number,
        rng: EnhancedRNG
    ): CityLayout {
        const center = new THREE.Vector2(centerX, centerZ);
        
        // City size from population (Dunbar-based scaling)
        const radius = Math.sqrt(population / 10) * 2;
        
        const layout: CityLayout = {
            center,
            radius,
            districts: [],
            roads: [],
            plaza: { center, radius: radius * 0.15 }
        };
        
        // Districts based on governance complexity
        if (governanceType === 'band') {
            // No districts, just scattered buildings
            layout.districts.push(this.generateDistrict('residential', center, radius, population, rng));
        } else if (governanceType === 'tribe') {
            // Simple residential + ritual area
            layout.districts.push(this.generateDistrict('residential', center, radius * 0.8, population * 0.9, rng));
            layout.districts.push(this.generateDistrict('religious', center, radius * 0.3, population * 0.1, rng));
        } else if (governanceType === 'chiefdom') {
            // Residential + commercial + religious
            layout.districts.push(this.generateDistrict('residential', center, radius * 0.7, population * 0.7, rng));
            layout.districts.push(this.generateDistrict('commercial', center, radius * 0.4, population * 0.2, rng));
            layout.districts.push(this.generateDistrict('religious', center, radius * 0.3, population * 0.1, rng));
        } else {
            // State: Full urban planning
            layout.districts.push(this.generateDistrict('residential', center, radius * 0.7, population * 0.6, rng));
            layout.districts.push(this.generateDistrict('commercial', center, radius * 0.5, population * 0.2, rng));
            layout.districts.push(this.generateDistrict('religious', center, radius * 0.3, population * 0.1, rng));
            layout.districts.push(this.generateDistrict('administrative', center, radius * 0.25, population * 0.1, rng));
            
            // Radial roads from center
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                layout.roads.push({
                    start: center,
                    end: new THREE.Vector2(
                        center.x + Math.cos(angle) * radius,
                        center.y + Math.sin(angle) * radius
                    ),
                    width: 3
                });
            }
        }
        
        return layout;
    }
    
    private generateDistrict(
        type: District['type'],
        cityCenter: THREE.Vector2,
        radius: number,
        population: number,
        rng: EnhancedRNG
    ): District {
        const buildings: BuildingPlot[] = [];
        
        // Building count from population
        const buildingCount = Math.ceil(population / 5); // ~5 people per building
        
        for (let i = 0; i < buildingCount; i++) {
            const angle = rng.uniform(0, Math.PI * 2);
            const dist = rng.uniform(0, radius);
            
            buildings.push({
                position: new THREE.Vector2(
                    cityCenter.x + Math.cos(angle) * dist,
                    cityCenter.y + Math.sin(angle) * dist
                ),
                rotation: rng.uniform(0, Math.PI * 2),
                size: new THREE.Vector2(
                    4 + rng.uniform(0, 3),
                    4 + rng.uniform(0, 3)
                ),
                type: this.getBuildingType(type, rng)
            });
        }
        
        return {
            type,
            center: cityCenter,
            buildings
        };
    }
    
    private getBuildingType(districtType: string, rng: EnhancedRNG): string {
        if (districtType === 'residential') return 'house';
        if (districtType === 'religious') return 'temple';
        if (districtType === 'administrative') return 'palace';
        
        // Commercial variety
        return rng.choice(['shop', 'tavern', 'workshop']);
    }
}

