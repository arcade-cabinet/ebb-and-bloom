/**
 * CREATURE MANAGER
 * 
 * Equivalent to DFU's EnemyMotor + spawning systems.
 * Manages all creatures, uses governors for behavior.
 * 
 * Based on:
 * - Assets/Scripts/Game/EnemyMotor.cs
 * - Governors replace prefabs
 */

import * as THREE from 'three';
import { EntityManager, Vehicle } from 'yuka';
import { CreatureMeshGenerator, CreatureTraits, BiomeContext } from '../procedural/CreatureMeshGenerator';
import { 
    MetabolismSystem,
    LifecycleStateMachine,
    FlockingGovernor,
    PredatorPreyBehavior
} from '../governors';
import { EnhancedRNG } from '../utils/EnhancedRNG';

export class CreatureManager {
    private scene: THREE.Scene;
    private entityManager: EntityManager;
    private meshGenerator: CreatureMeshGenerator;
    private rng: EnhancedRNG;
    private creatures: Map<string, { agent: Vehicle; mesh: THREE.Group; traits: CreatureTraits }> = new Map();
    
    constructor(scene: THREE.Scene, entityManager: EntityManager, seed: string) {
        this.scene = scene;
        this.entityManager = entityManager;
        this.meshGenerator = new CreatureMeshGenerator();
        this.rng = new EnhancedRNG(seed + '-creatures');
        
        console.log(`[CreatureManager] Initialized`);
    }
    
    /**
     * Spawn creature (governors + synthesis)
     */
    spawn(position: THREE.Vector3, biome: BiomeContext): Vehicle {
        // Generate traits
        const traits: CreatureTraits = {
            mass: this.rng.uniform(10, 200),
            locomotion: this.rng.choice(['cursorial', 'arboreal', 'burrowing', 'littoral']),
            diet: this.rng.choice(['herbivore', 'carnivore', 'omnivore']),
            socialBehavior: this.rng.uniform(0, 1) < 0.3 ? 'pack' : 'solitary',
            age: this.rng.uniform(0, 5),
            genetics: this.rng.uniform(0, 1)
        };
        
        // Create Yuka agent
        const agent = new Vehicle();
        agent.position.copy(position);
        agent.maxSpeed = 5;
        agent.mass = traits.mass;
        agent.updateOrientation = true;
        
        // Agent properties for governors
        (agent as any).energy = 100;
        (agent as any).maxEnergy = 100;
        (agent as any).age = traits.age;
        (agent as any).role = traits.diet === 'carnivore' ? 'predator' : 'prey';
        (agent as any).species = traits.locomotion;
        
        // ADD GOVERNORS (they decide behavior)
        if (traits.socialBehavior === 'pack') {
            const flocking = new FlockingGovernor();
            flocking.applyTo(agent, 15);
        }
        agent.steering.add(new PredatorPreyBehavior());
        (agent as any).stateMachine = new LifecycleStateMachine(agent);
        
        // SYNTHESIS: Create mesh from traits + biome
        const mesh = this.meshGenerator.generate(traits, biome);
        mesh.matrixAutoUpdate = false;
        
        function sync(entity: Vehicle, renderComponent: THREE.Object3D) {
            renderComponent.matrix.copy(entity.worldMatrix);
        }
        agent.setRenderComponent(mesh, sync);
        
        this.scene.add(mesh);
        this.entityManager.add(agent);
        
        const id = `creature-${this.creatures.size}`;
        this.creatures.set(id, { agent, mesh, traits });
        
        return agent;
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
     * Get all creatures
     */
    getCreatures(): Vehicle[] {
        return Array.from(this.creatures.values()).map(c => c.agent);
    }
}

