/**
 * BUILDING PREFAB
 * 
 * Daggerfall Unity-style building prefabs.
 * INTEGRATED with governors - prefabs are composable/decomposable and law-aligned.
 * 
 * Governors can evolve prefabs based on natural laws:
 * - Social laws → Settlement composition
 * - Physics laws → Structural integrity
 * - Ecological laws → Resource availability
 */

import * as THREE from 'three';

export enum BuildingType {
    HOUSE = 'house',
    SHOP = 'shop',
    WORKSHOP = 'workshop',
    WAREHOUSE = 'warehouse',
    TAVERN = 'tavern',
    TEMPLE = 'temple',
    GUARD_TOWER = 'guard_tower',
    CASTLE = 'castle'
}

/**
 * Building Component - composable piece that governors can evolve
 */
export interface BuildingComponent {
    type: 'door' | 'window' | 'chimney' | 'sign' | 'wall' | 'roof' | 'foundation';
    position: { x: number; y: number; z: number };
    rotation?: number;
    size?: { width: number; height: number; depth?: number };
    
    // Law-aligned properties (governors can evolve these)
    material?: 'wood' | 'stone' | 'brick' | 'metal';
    structuralIntegrity?: number; // Physics law: 0-1, affects stability
    resourceCost?: number; // Ecological law: materials needed
    socialValue?: number; // Social law: importance to community
}

/**
 * Building Prefab - composable template aligned with natural laws
 */
export interface BuildingPrefab {
    type: BuildingType;
    name: string;
    
    // Dimensions (physics-aligned)
    width: number;      // meters
    height: number;     // meters
    depth: number;      // meters
    floors: number;
    
    // Structural properties (physics laws)
    structuralIntegrity: number; // 0-1, affects stability
    maxLoad: number; // kg, physics law
    
    // Resource properties (ecological laws)
    resourceCost: {
        wood?: number;
        stone?: number;
        metal?: number;
    };
    
    // Social properties (social laws)
    socialValue: number; // 0-1, importance to community
    capacity: number; // people it can hold
    
    // Visual
    roofType: 'flat' | 'gabled' | 'pyramidal';
    materials: {
        wall: THREE.Color;
        roof: THREE.Color;
        door: THREE.Color;
    };
    
    // Composable components (governors can add/remove/evolve)
    components: BuildingComponent[];
    
    // Governor integration points
    canCompose?: (other: BuildingPrefab) => boolean; // Can combine with other prefab?
    canDecompose?: () => BuildingComponent[]; // Can break into components?
    evolve?: (laws: any) => BuildingPrefab; // Evolve based on laws
}

/**
 * Building Prefab Registry
 * Governors can query and evolve prefabs based on laws
 */
export class BuildingPrefabRegistry {
    private static prefabs: Map<BuildingType, BuildingPrefab> = new Map();

    static {
        // House prefab - law-aligned
        this.prefabs.set(BuildingType.HOUSE, {
            type: BuildingType.HOUSE,
            name: 'House',
            width: 8,
            height: 6,
            depth: 8,
            floors: 1,
            structuralIntegrity: 0.7, // Moderate stability
            maxLoad: 5000, // kg
            resourceCost: { wood: 50, stone: 20 },
            socialValue: 0.5, // Basic shelter
            capacity: 5,
            roofType: 'gabled',
            materials: {
                wall: new THREE.Color(0.8, 0.7, 0.6),
                roof: new THREE.Color(0.5, 0.2, 0.1),
                door: new THREE.Color(0.4, 0.3, 0.2)
            },
            components: [
                { 
                    type: 'door', 
                    position: { x: 0, y: 0, z: 4 }, 
                    size: { width: 1.5, height: 2.5 },
                    material: 'wood',
                    structuralIntegrity: 0.6,
                    resourceCost: 5,
                    socialValue: 0.3
                },
                { 
                    type: 'window', 
                    position: { x: -3, y: 1.5, z: 4 }, 
                    size: { width: 1, height: 1 },
                    material: 'wood',
                    structuralIntegrity: 0.4,
                    resourceCost: 2,
                    socialValue: 0.1
                },
                { 
                    type: 'window', 
                    position: { x: 3, y: 1.5, z: 4 }, 
                    size: { width: 1, height: 1 },
                    material: 'wood',
                    structuralIntegrity: 0.4,
                    resourceCost: 2,
                    socialValue: 0.1
                },
                { 
                    type: 'chimney', 
                    position: { x: 2, y: 6, z: 2 },
                    material: 'stone',
                    structuralIntegrity: 0.8,
                    resourceCost: 10,
                    socialValue: 0.2
                }
            ],
            // Governor integration: Can compose with workshop?
            canCompose: (other) => {
                return other.type === BuildingType.WORKSHOP || other.type === BuildingType.HOUSE;
            },
            // Governor integration: Can decompose into components
            canDecompose: () => {
                return this.prefabs.get(BuildingType.HOUSE)!.components;
            }
        });

        // Shop prefab - higher social value
        this.prefabs.set(BuildingType.SHOP, {
            type: BuildingType.SHOP,
            name: 'Shop',
            width: 10,
            height: 7,
            depth: 10,
            floors: 2,
            structuralIntegrity: 0.8, // Stronger (commerce needs stability)
            maxLoad: 8000,
            resourceCost: { wood: 80, stone: 40 },
            socialValue: 0.7, // Important for trade
            capacity: 20,
            roofType: 'gabled',
            materials: {
                wall: new THREE.Color(0.8, 0.7, 0.6),
                roof: new THREE.Color(0.5, 0.2, 0.1),
                door: new THREE.Color(0.4, 0.3, 0.2)
            },
            components: [
                { 
                    type: 'door', 
                    position: { x: 0, y: 0, z: 5 }, 
                    size: { width: 2, height: 2.5 },
                    material: 'wood',
                    structuralIntegrity: 0.7,
                    resourceCost: 8,
                    socialValue: 0.5
                },
                { 
                    type: 'window', 
                    position: { x: -4, y: 1.5, z: 5 }, 
                    size: { width: 2, height: 2 },
                    material: 'wood',
                    structuralIntegrity: 0.5,
                    resourceCost: 4,
                    socialValue: 0.3
                },
                { 
                    type: 'sign', 
                    position: { x: 0, y: 5, z: 5 }, 
                    size: { width: 3, height: 1 },
                    material: 'wood',
                    structuralIntegrity: 0.3,
                    resourceCost: 2,
                    socialValue: 0.4
                }
            ]
        });

        // Temple prefab - highest social value
        this.prefabs.set(BuildingType.TEMPLE, {
            type: BuildingType.TEMPLE,
            name: 'Temple',
            width: 15,
            height: 12,
            depth: 20,
            floors: 1,
            structuralIntegrity: 0.95, // Very stable (sacred spaces)
            maxLoad: 15000,
            resourceCost: { stone: 200, wood: 50 },
            socialValue: 0.95, // Highest importance
            capacity: 100,
            roofType: 'pyramidal',
            materials: {
                wall: new THREE.Color(0.9, 0.9, 0.85),
                roof: new THREE.Color(0.6, 0.5, 0.4),
                door: new THREE.Color(0.3, 0.2, 0.1)
            },
            components: [
                { 
                    type: 'door', 
                    position: { x: 0, y: 0, z: 10 }, 
                    size: { width: 3, height: 4 },
                    material: 'wood',
                    structuralIntegrity: 0.9,
                    resourceCost: 20,
                    socialValue: 0.8
                },
                { 
                    type: 'window', 
                    position: { x: -6, y: 3, z: 10 }, 
                    size: { width: 2, height: 3 },
                    material: 'stone',
                    structuralIntegrity: 0.7,
                    resourceCost: 10,
                    socialValue: 0.3
                }
            ]
        });

        // Tavern prefab - social gathering place
        this.prefabs.set(BuildingType.TAVERN, {
            type: BuildingType.TAVERN,
            name: 'Tavern',
            width: 12,
            height: 8,
            depth: 12,
            floors: 2,
            structuralIntegrity: 0.75,
            maxLoad: 10000,
            resourceCost: { wood: 100, stone: 30 },
            socialValue: 0.8, // High social value (community gathering)
            capacity: 50,
            roofType: 'gabled',
            materials: {
                wall: new THREE.Color(0.7, 0.6, 0.5),
                roof: new THREE.Color(0.5, 0.2, 0.1),
                door: new THREE.Color(0.4, 0.3, 0.2)
            },
            components: [
                { 
                    type: 'door', 
                    position: { x: 0, y: 0, z: 6 }, 
                    size: { width: 2, height: 2.5 },
                    material: 'wood',
                    structuralIntegrity: 0.7,
                    resourceCost: 10,
                    socialValue: 0.6
                },
                { 
                    type: 'window', 
                    position: { x: -5, y: 1.5, z: 6 }, 
                    size: { width: 2, height: 2 },
                    material: 'wood',
                    structuralIntegrity: 0.5,
                    resourceCost: 4,
                    socialValue: 0.3
                },
                { 
                    type: 'sign', 
                    position: { x: 0, y: 6, z: 6 }, 
                    size: { width: 4, height: 1.5 },
                    material: 'wood',
                    structuralIntegrity: 0.3,
                    resourceCost: 3,
                    socialValue: 0.5
                }
            ]
        });

        // Warehouse prefab - storage
        this.prefabs.set(BuildingType.WAREHOUSE, {
            type: BuildingType.WAREHOUSE,
            name: 'Warehouse',
            width: 20,
            height: 10,
            depth: 20,
            floors: 1,
            structuralIntegrity: 0.85, // Strong (needs to hold weight)
            maxLoad: 50000,
            resourceCost: { wood: 150, stone: 100 },
            socialValue: 0.6, // Functional but not prestigious
            capacity: 200, // Storage capacity
            roofType: 'flat',
            materials: {
                wall: new THREE.Color(0.6, 0.6, 0.6),
                roof: new THREE.Color(0.4, 0.4, 0.4),
                door: new THREE.Color(0.3, 0.3, 0.3)
            },
            components: [
                { 
                    type: 'door', 
                    position: { x: 0, y: 0, z: 10 }, 
                    size: { width: 3, height: 4 },
                    material: 'wood',
                    structuralIntegrity: 0.8,
                    resourceCost: 15,
                    socialValue: 0.2
                }
            ]
        });

        // Workshop prefab - crafting
        this.prefabs.set(BuildingType.WORKSHOP, {
            type: BuildingType.WORKSHOP,
            name: 'Workshop',
            width: 10,
            height: 6,
            depth: 10,
            floors: 1,
            structuralIntegrity: 0.7,
            maxLoad: 8000,
            resourceCost: { wood: 70, stone: 30 },
            socialValue: 0.65, // Important for production
            capacity: 15,
            roofType: 'gabled',
            materials: {
                wall: new THREE.Color(0.7, 0.65, 0.6),
                roof: new THREE.Color(0.5, 0.2, 0.1),
                door: new THREE.Color(0.4, 0.3, 0.2)
            },
            components: [
                { 
                    type: 'door', 
                    position: { x: 0, y: 0, z: 5 }, 
                    size: { width: 2, height: 2.5 },
                    material: 'wood',
                    structuralIntegrity: 0.6,
                    resourceCost: 8,
                    socialValue: 0.3
                },
                { 
                    type: 'window', 
                    position: { x: -4, y: 1.5, z: 5 }, 
                    size: { width: 2, height: 2 },
                    material: 'wood',
                    structuralIntegrity: 0.4,
                    resourceCost: 3,
                    socialValue: 0.2
                }
            ]
        });
    }

    /**
     * Get building prefab by type
     */
    static get(type: BuildingType): BuildingPrefab {
        const prefab = this.prefabs.get(type);
        if (!prefab) {
            throw new Error(`Building prefab not found: ${type}`);
        }
        return prefab;
    }

    /**
     * Get all building prefabs
     */
    static getAll(): BuildingPrefab[] {
        return Array.from(this.prefabs.values());
    }

    /**
     * Query prefabs by law-aligned properties (governor integration)
     */
    static queryByLaws(criteria: {
        minSocialValue?: number;
        maxResourceCost?: number;
        minStructuralIntegrity?: number;
        maxCapacity?: number;
    }): BuildingPrefab[] {
        return Array.from(this.prefabs.values()).filter(prefab => {
            if (criteria.minSocialValue && prefab.socialValue < criteria.minSocialValue) return false;
            if (criteria.maxResourceCost) {
                const totalCost = (prefab.resourceCost.wood || 0) + 
                                 (prefab.resourceCost.stone || 0) + 
                                 (prefab.resourceCost.metal || 0);
                if (totalCost > criteria.maxResourceCost) return false;
            }
            if (criteria.minStructuralIntegrity && prefab.structuralIntegrity < criteria.minStructuralIntegrity) return false;
            if (criteria.maxCapacity && prefab.capacity > criteria.maxCapacity) return false;
            return true;
        });
    }

    /**
     * Compose two prefabs (governor integration)
     * Returns new prefab that combines both
     */
    static compose(prefab1: BuildingPrefab, prefab2: BuildingPrefab): BuildingPrefab | null {
        if (!prefab1.canCompose || !prefab1.canCompose(prefab2)) {
            return null;
        }

        // Combine properties based on laws
        return {
            ...prefab1,
            name: `${prefab1.name}-${prefab2.name}`,
            width: prefab1.width + prefab2.width,
            height: Math.max(prefab1.height, prefab2.height),
            depth: Math.max(prefab1.depth, prefab2.depth),
            floors: Math.max(prefab1.floors, prefab2.floors),
            structuralIntegrity: Math.min(prefab1.structuralIntegrity, prefab2.structuralIntegrity), // Weakest link
            maxLoad: prefab1.maxLoad + prefab2.maxLoad,
            resourceCost: {
                wood: (prefab1.resourceCost.wood || 0) + (prefab2.resourceCost.wood || 0),
                stone: (prefab1.resourceCost.stone || 0) + (prefab2.resourceCost.stone || 0),
                metal: (prefab1.resourceCost.metal || 0) + (prefab2.resourceCost.metal || 0)
            },
            socialValue: Math.max(prefab1.socialValue, prefab2.socialValue),
            capacity: prefab1.capacity + prefab2.capacity,
            components: [...prefab1.components, ...prefab2.components]
        };
    }

    /**
     * Decompose prefab into components (governor integration)
     */
    static decompose(prefab: BuildingPrefab): BuildingComponent[] {
        if (prefab.canDecompose) {
            return prefab.canDecompose();
        }
        return prefab.components;
    }
}
