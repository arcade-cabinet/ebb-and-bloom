/**
 * CREATURE SPAWNER
 * 
 * Spawns creatures with governor-driven behaviors.
 * Governors decide: metabolism, movement, reproduction, hierarchy.
 */

import * as THREE from 'three';
import { Vehicle, WanderBehavior, EntityManager } from 'yuka';
import { EnhancedRNG } from '../utils/EnhancedRNG';
import { CreatureMeshGenerator, CreatureTraits, BiomeContext } from '../procedural/CreatureMeshGenerator';
import { BiomeType } from './BiomeSystem';
import { 
    GravityBehavior,
    MetabolismSystem,
    LifecycleStateMachine,
    FlockingGovernor,
    PredatorPreyBehavior,
    HierarchyBehavior
} from '../governors';

/**
 * Sync function - Yuka pattern
 */
function sync(entity: Vehicle, renderComponent: THREE.Object3D) {
    renderComponent.matrix.copy(entity.worldMatrix);
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

    constructor(scene: THREE.Scene, entityManager: EntityManager, seed: string) {
        this.scene = scene;
        this.entityManager = entityManager;
        this.rng = new EnhancedRNG(seed);
        this.meshGenerator = new CreatureMeshGenerator();
    }

    /**
     * Spawn creatures in chunk (with biome context for synthesis)
     */
    spawnInChunk(chunkX: number, chunkZ: number, biome: BiomeType = 'grassland'): void {
        const key = `${chunkX},${chunkZ}`;
        if (this.creatures.has(key)) return;

        const chunkSeed = `creature-${chunkX}-${chunkZ}`;
        const chunkRng = new EnhancedRNG(chunkSeed);

        // Get biome context for visual synthesis
        const biomeContext = this.getBiomeContext(biome);

        // Spawn 2-5 creatures per chunk
        const count = Math.floor(chunkRng.uniform(2, 5));

        for (let i = 0; i < count; i++) {
            this.spawnCreature(chunkX, chunkZ, i, chunkRng, biomeContext);
        }
    }

    /**
     * Spawn single creature with governors
     */
    private spawnCreature(
        chunkX: number, 
        chunkZ: number, 
        index: number, 
        rng: EnhancedRNG,
        biomeContext: BiomeContext
    ): void {
        // Generate traits (governors will refine these)
        const traits: CreatureTraits = {
            mass: rng.uniform(10, 200),
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

        // Agent properties for governors
        (agent as any).energy = 100;
        (agent as any).maxEnergy = 100;
        (agent as any).age = traits.age;
        (agent as any).genetics = traits.genetics;
        (agent as any).role = traits.diet === 'carnivore' ? 'predator' : 'prey';
        (agent as any).species = traits.locomotion;
        (agent as any).socialRank = rng.uniform(0, 1);
        (agent as any).diet = traits.diet;
        (agent as any).locomotion = traits.locomotion;

        // ADD GOVERNORS (they decide behavior)
        agent.steering.add(new GravityBehavior());

        if (traits.socialBehavior === 'pack') {
            const flocking = new FlockingGovernor();
            flocking.applyTo(agent, 15);
        }
        
        agent.steering.add(new PredatorPreyBehavior());

        const wander = new WanderBehavior();
        wander.radius = 10;
        wander.distance = 5;
        wander.jitter = 2;
        agent.steering.add(wander);

        (agent as any).stateMachine = new LifecycleStateMachine(agent);

        // SYNTHESIS: Create mesh from governors' traits + biome
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
     * Update all creatures (governors handle behavior)
     */
    update(delta: number): void {
        for (const { agent } of this.creatures.values()) {
            // Metabolism
            MetabolismSystem.update(agent as any, delta);

            // Lifecycle
            if ((agent as any).stateMachine) {
                (agent as any).stateMachine.update(delta);
            }
        }
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
