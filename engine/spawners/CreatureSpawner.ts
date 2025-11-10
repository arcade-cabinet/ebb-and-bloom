/**
 * CREATURE SPAWNER
 * 
 * Spawns creatures with governor-driven behaviors.
 * Governors decide: metabolism, movement, reproduction, hierarchy.
 */

import * as THREE from 'three';
import { Vehicle, WanderBehavior, EntityManager } from 'yuka';
import { EnhancedRNG } from '../utils/EnhancedRNG';
import { CreatureMeshGenerator, CreatureTraits } from '../procedural/CreatureMeshGenerator';
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
     * Spawn creatures in chunk
     */
    spawnInChunk(chunkX: number, chunkZ: number): void {
        const key = `${chunkX},${chunkZ}`;
        if (this.creatures.has(key)) return;

        const chunkSeed = `creature-${chunkX}-${chunkZ}`;
        const chunkRng = new EnhancedRNG(chunkSeed);

        // Spawn 2-5 creatures per chunk
        const count = chunkRng.uniform(2, 5);

        for (let i = 0; i < count; i++) {
            this.spawnCreature(chunkX, chunkZ, i, chunkRng);
        }
    }

    /**
     * Spawn single creature with governors
     */
    private spawnCreature(chunkX: number, chunkZ: number, index: number, rng: EnhancedRNG): void {
        // Generate traits
        const traits: CreatureTraits = {
            mass: rng.uniform(10, 200),
            locomotion: rng.choice(['cursorial', 'arboreal', 'burrowing', 'littoral']),
            diet: rng.choice(['herbivore', 'carnivore', 'omnivore']),
            socialBehavior: rng.uniform(0, 1) < 0.3 ? 'pack' : 'solitary'
        };

        // Create Yuka agent
        const agent = new Vehicle();
        agent.position.set(
            chunkX * 100 + rng.uniform(-40, 40),
            5, // Above ground
            chunkZ * 100 + rng.uniform(-40, 40)
        );
        agent.name = `creature-${chunkX}-${chunkZ}-${index}`;
        agent.maxSpeed = 5;
        agent.mass = traits.mass;
        agent.updateOrientation = true;

        // Agent properties for governors
        (agent as any).energy = 100;
        (agent as any).maxEnergy = 100;
        (agent as any).age = 0;
        (agent as any).role = traits.diet === 'carnivore' ? 'predator' : 'prey';
        (agent as any).species = traits.locomotion;
        (agent as any).socialRank = 0.5;

        // ADD GOVERNORS
        // Physics
        agent.steering.add(new GravityBehavior());

        // Ecological
        if (traits.socialBehavior === 'pack') {
            const flocking = new FlockingGovernor();
            flocking.applyTo(agent, 15);
        }
        agent.steering.add(new PredatorPreyBehavior());

        // Basic wander
        const wander = new WanderBehavior();
        wander.radius = 10;
        wander.distance = 5;
        wander.jitter = 2;
        agent.steering.add(wander);

        // Lifecycle
        (agent as any).stateMachine = new LifecycleStateMachine(agent);

        // Create mesh
        const mesh = this.meshGenerator.generate(traits);
        mesh.matrixAutoUpdate = false;
        agent.setRenderComponent(mesh, sync);

        // Add to world
        this.scene.add(mesh);
        this.entityManager.add(agent);

        // Store
        const key = `${chunkX},${chunkZ},${index}`;
        this.creatures.set(key, { agent, mesh, traits });
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
