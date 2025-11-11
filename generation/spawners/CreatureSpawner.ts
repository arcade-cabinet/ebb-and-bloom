/**
 * CREATURE SPAWNER
 * 
 * Spawns creatures with governor-driven behaviors.
 * Governors decide: metabolism, movement, reproduction, hierarchy.
 */

import * as THREE from 'three';
import { Vehicle, WanderBehavior, EntityManager } from 'yuka';
import { EnhancedRNG } from '../../engine/utils/EnhancedRNG';
import { CreatureMeshGenerator, CreatureTraits, BiomeContext } from '../../engine/procedural/CreatureMeshGenerator';
import { BiomeType } from './BiomeSystem'; // BiomeSystem is in same directory
import { isCreatureGovernorsEnabled } from '../../engine/config/featureFlags';
// Agentic imports - only used if feature flag enabled
// import { 
//     GravityBehavior,
//     MetabolismSystem,
//     LifecycleStateMachine,
//     FlockingGovernor,
//     PredatorPreyBehavior,
// } from '../../agents';
// import { CreatureSpawnDecisionMaker } from '../../agents/governors/world-generation/CreatureSpawnDecision';

/**
 * Sync function - Yuka pattern
 */
function sync(entity: Vehicle, renderComponent: THREE.Object3D) {
    // Convert Yuka Matrix4 to THREE Matrix4
    const yukaMatrix = entity.worldMatrix;
    const threeMatrix = renderComponent.matrix;
    threeMatrix.set(
        yukaMatrix.elements[0], yukaMatrix.elements[1], yukaMatrix.elements[2], yukaMatrix.elements[3],
        yukaMatrix.elements[4], yukaMatrix.elements[5], yukaMatrix.elements[6], yukaMatrix.elements[7],
        yukaMatrix.elements[8], yukaMatrix.elements[9], yukaMatrix.elements[10], yukaMatrix.elements[11],
        yukaMatrix.elements[12], yukaMatrix.elements[13], yukaMatrix.elements[14], yukaMatrix.elements[15]
    );
}

export interface CreatureData {
    agent: Vehicle;
    mesh: THREE.Group;
    traits: CreatureTraits;
    biomeContext: BiomeContext;
}

export class CreatureSpawner {
    private creatures: Map<string, CreatureData> = new Map();
    private scene: THREE.Scene;
    private entityManager: EntityManager;
    private rng: EnhancedRNG;
    private meshGenerator: CreatureMeshGenerator;
    // Only used if feature flag enabled
    // private decisionMaker?: CreatureSpawnDecisionMaker;

    constructor(scene: THREE.Scene, entityManager: EntityManager, seed: string) {
        this.scene = scene;
        this.entityManager = entityManager;
        this.rng = new EnhancedRNG(seed);
        this.meshGenerator = new CreatureMeshGenerator();
        
        // Only initialize governor-based decision maker if feature flag enabled
        // if (isCreatureGovernorsEnabled()) {
        //     this.decisionMaker = new CreatureSpawnDecisionMaker(seed);
        //     console.log(`[CreatureSpawner] Initialized with governor-based decision making`);
        // } else {
        //     console.log(`[CreatureSpawner] Initialized in PURE ENGINE mode (no governors)`);
        // }
        console.log(`[CreatureSpawner] Initialized in PURE ENGINE mode (no governors)`);
    }

    /**
     * Spawn creatures in chunk (PURE ENGINE MODE - simple deterministic spawning)
     */
    spawnInChunk(chunkX: number, chunkZ: number, biome: BiomeType = BiomeType.GRASSLAND): void {
        const key = `${chunkX},${chunkZ}`;
        if (this.creatures.has(key)) return;

        const chunkSeed = `creature-${chunkX}-${chunkZ}`;
        const chunkRng = new EnhancedRNG(chunkSeed);
        
        // Get biome context for visual synthesis
        const biomeContext = this.getBiomeContext(biome);
        
        // PURE ENGINE: Simple deterministic spawning based on biome
        const carryingCapacity = this.getCarryingCapacity(biome);
        const count = Math.floor(carryingCapacity * chunkRng.uniform(0.5, 1.0)); // 50-100% of capacity
        
        for (let i = 0; i < count; i++) {
            this.spawnCreature(
                chunkX,
                chunkZ,
                i,
                chunkRng,
                biomeContext,
                1.0 // No global variation in pure engine mode
            );
        }
        
        console.log(`[CreatureSpawner] Spawned ${count} creatures in chunk (${chunkX}, ${chunkZ}) - Pure engine mode`);
    }
    
    /**
     * Get carrying capacity from ecology laws (biome-dependent)
     */
    private getCarryingCapacity(biome: BiomeType): number {
        // TODO: Use ecology governors to calculate carrying capacity
        // For now, biome-based estimates
        const capacities: Record<BiomeType, number> = {
            [BiomeType.GRASSLAND]: 8,
            [BiomeType.FOREST]: 6,
            [BiomeType.DESERT]: 3,
            [BiomeType.TUNDRA]: 4,
            [BiomeType.OCEAN]: 10,
            [BiomeType.BEACH]: 5,
            [BiomeType.SWAMP]: 7,
            [BiomeType.MOUNTAIN]: 4,
            [BiomeType.TAIGA]: 5,
            [BiomeType.SAVANNA]: 9,
            [BiomeType.ICE]: 2
        };
        return capacities[biome] || 5;
    }
    
    /**
     * Get existing creature count in chunk
     */
    private getCreatureCountInChunk(chunkX: number, chunkZ: number): number {
        let count = 0;
        for (const [key] of this.creatures) {
            if (key.startsWith(`${chunkX},${chunkZ},`)) {
                count++;
            }
        }
        return count;
    }

    /**
     * Spawn single creature (PURE ENGINE MODE - simple deterministic spawning)
     */
    private spawnCreature(
        chunkX: number, 
        chunkZ: number, 
        index: number, 
        rng: EnhancedRNG,
        biomeContext: BiomeContext,
        globalVariation: number
    ): void {
        // Generate traits (governors will refine these)
        // Use chunkRng for deterministic per-chunk variation, instance rng for global variation
        const traits: CreatureTraits = {
            mass: rng.uniform(10, 200) * globalVariation, // Apply global variation
            locomotion: rng.choice(['cursorial', 'arboreal', 'burrowing', 'littoral']),
            diet: rng.choice(['herbivore', 'carnivore', 'omnivore']),
            socialBehavior: rng.uniform(0, 1) < 0.3 ? 'pack' : 'solitary',
            age: rng.uniform(0, 5), // Start at various ages
            genetics: rng.uniform(0, 1) // Genetic variation
        };

        // Create Yuka agent
        const agent = new Vehicle();
        agent.position.set(
            chunkX * 100 + rng.uniform(-40, 40),
            5,
            chunkZ * 100 + rng.uniform(-40, 40)
        );
        agent.name = `creature-${chunkX}-${chunkZ}-${index}`;
        agent.maxSpeed = 5;
        agent.mass = traits.mass;
        agent.updateOrientation = true;

        // PURE ENGINE: Simple agent properties (no governors)
        (agent as any).energy = 100;
        (agent as any).maxEnergy = 100;
        (agent as any).age = traits.age;
        (agent as any).genetics = traits.genetics;
        (agent as any).role = traits.diet === 'carnivore' ? 'predator' : 'prey';
        (agent as any).species = traits.locomotion;
        (agent as any).socialRank = rng.uniform(0, 1);
        (agent as any).diet = traits.diet;
        (agent as any).locomotion = traits.locomotion;

        // PURE ENGINE: Simple wander behavior only (no governors)
        const wander = new WanderBehavior();
        wander.radius = 10;
        wander.distance = 5;
        wander.jitter = 2;
        agent.steering.add(wander);

        // SYNTHESIS: Create mesh from traits + biome
        const mesh = this.meshGenerator.generate(traits, biomeContext);
        mesh.matrixAutoUpdate = false;
        agent.setRenderComponent(mesh, sync);

        this.scene.add(mesh);
        this.entityManager.add(agent);

        const key = `${chunkX},${chunkZ},${index}`;
        this.creatures.set(key, { agent, mesh, traits, biomeContext });
    }

    /**
     * Get biome context for visual synthesis
     */
    private getBiomeContext(biome: BiomeType): BiomeContext {
        const contexts: Record<BiomeType, BiomeContext> = {
            ocean: { vegetation: 0.0, rockColor: 0.2, uvIntensity: 0.3, temperature: 283 },
            beach: { vegetation: 0.1, rockColor: 0.9, uvIntensity: 0.9, temperature: 295 },
            desert: { vegetation: 0.05, rockColor: 0.8, uvIntensity: 1.0, temperature: 305 },
            grassland: { vegetation: 0.4, rockColor: 0.3, uvIntensity: 0.6, temperature: 290 },
            forest: { vegetation: 0.8, rockColor: 0.2, uvIntensity: 0.3, temperature: 285 },
            rainforest: { vegetation: 0.95, rockColor: 0.1, uvIntensity: 0.4, temperature: 298 },
            savanna: { vegetation: 0.3, rockColor: 0.6, uvIntensity: 0.8, temperature: 300 },
            taiga: { vegetation: 0.6, rockColor: 0.3, uvIntensity: 0.2, temperature: 270 },
            tundra: { vegetation: 0.2, rockColor: 0.4, uvIntensity: 0.5, temperature: 265 },
            snow: { vegetation: 0.0, rockColor: 0.95, uvIntensity: 0.7, temperature: 260 },
            mountain: { vegetation: 0.1, rockColor: 0.7, uvIntensity: 0.6, temperature: 275 }
        };

        return contexts[biome] || contexts.grassland;
    }

    /**
     * Update all creatures (PURE ENGINE MODE - no governor updates)
     */
    update(delta: number): void {
        // PURE ENGINE: No governor-based updates
        // Creatures just wander using Yuka's built-in behaviors
    }

    /**
     * Despawn creatures in chunk
     */
    despawnInChunk(chunkX: number, chunkZ: number): void {
        const toRemove: string[] = [];

        for (const [key, data] of this.creatures) {
            if (key.startsWith(`${chunkX},${chunkZ}`)) {
                this.scene.remove(data.mesh);
                this.entityManager.remove(data.agent);
                toRemove.push(key);
            }
        }

        for (const key of toRemove) {
            this.creatures.delete(key);
        }
    }

    getCreatures(): CreatureData[] {
        return Array.from(this.creatures.values());
    }
}
