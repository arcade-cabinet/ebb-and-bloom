/**
 * GOVERNOR-PREFAB INTEGRATION
 * 
 * Bridges governors and prefabs - allows governors to evolve prefabs based on laws.
 * 
 * Key insight: Prefabs should be composable/decomposable and law-aligned so governors
 * can intelligently evolve them based on natural laws.
 */

import { BuildingPrefab, BuildingPrefabRegistry, BuildingType } from './BuildingPrefab';
import { BuildingComponent } from './BuildingPrefab';

/**
 * Social Governor Integration
 * Uses social laws to decide which prefabs to use and how to compose them
 */
export class SocialGovernorPrefabIntegration {
    /**
     * Select prefab based on social hierarchy
     * Higher social value = more important buildings
     */
    static selectByHierarchy(population: number, governanceType: 'band' | 'tribe' | 'chiefdom' | 'state'): BuildingPrefab[] {
        const minSocialValue = governanceType === 'band' ? 0.3 :
                              governanceType === 'tribe' ? 0.5 :
                              governanceType === 'chiefdom' ? 0.7 : 0.8;

        return BuildingPrefabRegistry.queryByLaws({
            minSocialValue,
            maxCapacity: population * 2 // Don't build bigger than needed
        });
    }

    /**
     * Evolve prefab based on social context
     */
    static evolve(prefab: BuildingPrefab, context: {
        population?: number;
        governanceType?: 'band' | 'tribe' | 'chiefdom' | 'state';
        availableResources?: { wood?: number; stone?: number; metal?: number };
    }): BuildingPrefab {
        return GovernorPrefabIntegration.evolve(prefab, context);
    }

    /**
     * Compose buildings based on social needs
     * Governors decide how to combine prefabs
     */
    static composeForSettlement(
        settlementType: 'village' | 'town' | 'city',
        population: number
    ): BuildingPrefab[] {
        const basePrefabs = this.selectByHierarchy(population, this.getGovernanceType(population));
        const composed: BuildingPrefab[] = [];

        // Governors decide: Can we compose houses into larger structures?
        for (let i = 0; i < basePrefabs.length - 1; i++) {
            const composedPrefab = BuildingPrefabRegistry.compose(basePrefabs[i], basePrefabs[i + 1]);
            if (composedPrefab) {
                composed.push(composedPrefab);
            }
        }

        return composed.length > 0 ? composed : basePrefabs;
    }

    private static getGovernanceType(population: number): 'band' | 'tribe' | 'chiefdom' | 'state' {
        if (population < 50) return 'band';
        if (population < 500) return 'tribe';
        if (population < 5000) return 'chiefdom';
        return 'state';
    }
}

/**
 * Physics Governor Integration
 * Uses physics laws to validate structural integrity
 */
export class PhysicsGovernorPrefabIntegration {
    /**
     * Validate prefab structural integrity (physics law)
     * Returns true if prefab can support its own weight + load
     */
    static validateStructuralIntegrity(prefab: BuildingPrefab, load: number = 0): boolean {
        const totalLoad = (prefab.width * prefab.height * prefab.depth * 1000) + load; // Volume * density + load
        return prefab.maxLoad >= totalLoad && prefab.structuralIntegrity > 0.5;
    }

    /**
     * Evolve prefab based on physics laws
     * Strengthen weak structures
     */
    static evolveForStability(prefab: BuildingPrefab): BuildingPrefab {
        if (prefab.structuralIntegrity < 0.6) {
            // Physics law: Increase structural integrity by adding stone components
            const evolvedComponents = prefab.components.map(comp => {
                if (comp.structuralIntegrity && comp.structuralIntegrity < 0.6) {
                    return {
                        ...comp,
                        material: 'stone' as const,
                        structuralIntegrity: Math.min(1.0, comp.structuralIntegrity + 0.3),
                        resourceCost: (comp.resourceCost || 0) * 1.5
                    };
                }
                return comp;
            });

            return {
                ...prefab,
                structuralIntegrity: Math.min(1.0, prefab.structuralIntegrity + 0.2),
                resourceCost: {
                    ...prefab.resourceCost,
                    stone: (prefab.resourceCost.stone || 0) + 20
                },
                components: evolvedComponents
            };
        }
        return prefab;
    }
}

/**
 * Ecological Governor Integration
 * Uses ecological laws to check resource availability
 */
export class EcologicalGovernorPrefabIntegration {
    /**
     * Check if prefab can be built with available resources
     */
    static canBuild(
        prefab: BuildingPrefab,
        availableResources: { wood?: number; stone?: number; metal?: number }
    ): boolean {
        const required = prefab.resourceCost;
        return (!required.wood || (availableResources.wood || 0) >= required.wood) &&
               (!required.stone || (availableResources.stone || 0) >= required.stone) &&
               (!required.metal || (availableResources.metal || 0) >= required.metal);
    }

    /**
     * Evolve prefab to use less resources (ecological law: efficiency)
     */
    static evolveForEfficiency(prefab: BuildingPrefab): BuildingPrefab {
        // Reduce resource cost by optimizing components
        const optimizedComponents = prefab.components.map(comp => {
            if (comp.resourceCost && comp.resourceCost > 5) {
                return {
                    ...comp,
                    size: comp.size ? {
                        ...comp.size,
                        width: comp.size.width * 0.9,
                        height: comp.size.height * 0.9
                    } : comp.size,
                    resourceCost: comp.resourceCost * 0.8
                };
            }
            return comp;
        });

        const totalWoodReduction = prefab.components.reduce((sum, comp) => {
            const original = comp.resourceCost || 0;
            const optimized = optimizedComponents.find(c => c.type === comp.type)?.resourceCost || original;
            return sum + (original - optimized);
        }, 0);

        return {
            ...prefab,
            resourceCost: {
                ...prefab.resourceCost,
                wood: Math.max(0, (prefab.resourceCost.wood || 0) - totalWoodReduction)
            },
            components: optimizedComponents
        };
    }
}

/**
 * Main Integration Point
 * Governors use this to evolve prefabs intelligently
 */
export class GovernorPrefabIntegration {
    /**
     * Evolve prefab based on all applicable laws
     */
    static evolve(prefab: BuildingPrefab, context: {
        population?: number;
        availableResources?: { wood?: number; stone?: number; metal?: number };
        governanceType?: 'band' | 'tribe' | 'chiefdom' | 'state';
    }): BuildingPrefab {
        let evolved = prefab;

        // Physics: Ensure structural integrity
        if (!PhysicsGovernorPrefabIntegration.validateStructuralIntegrity(evolved)) {
            evolved = PhysicsGovernorPrefabIntegration.evolveForStability(evolved);
        }

        // Ecology: Optimize resource usage
        if (context.availableResources) {
            if (!EcologicalGovernorPrefabIntegration.canBuild(evolved, context.availableResources)) {
                evolved = EcologicalGovernorPrefabIntegration.evolveForEfficiency(evolved);
            }
        }

        // Social: Adjust social value based on context
        if (context.governanceType) {
            const governanceMultiplier = context.governanceType === 'state' ? 1.2 :
                                        context.governanceType === 'chiefdom' ? 1.1 :
                                        context.governanceType === 'tribe' ? 1.0 : 0.9;
            evolved = {
                ...evolved,
                socialValue: Math.min(1.0, evolved.socialValue * governanceMultiplier)
            };
        }

        return evolved;
    }
}

