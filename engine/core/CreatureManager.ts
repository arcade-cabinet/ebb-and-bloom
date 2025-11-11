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
// Agentic imports - only used if feature flag enabled
// import { 
//     MetabolismSystem,
//     LifecycleStateMachine,
//     FlockingGovernor,
//     PredatorPreyBehavior,
//     isCreatureGovernorsEnabled
// } from '../../agents';
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
        agent.position.set(position.x, position.y, position.z);
        agent.maxSpeed = 5;
        agent.mass = traits.mass;
        agent.updateOrientation = true;
        
        // PURE ENGINE: Simple agent properties (no governors if feature flag disabled)
        (agent as any).energy = 100;
        (agent as any).maxEnergy = 100;
        (agent as any).age = traits.age;
        (agent as any).role = traits.diet === 'carnivore' ? 'predator' : 'prey';
        (agent as any).species = traits.locomotion;
        
        // Only add governors if feature flag enabled
        // if (isCreatureGovernorsEnabled()) {
        //     if (traits.socialBehavior === 'pack') {
        //         const flocking = new FlockingGovernor();
        //         flocking.applyTo(agent, 15);
        //     }
        //     agent.steering.add(new PredatorPreyBehavior());
        //     (agent as any).stateMachine = new LifecycleStateMachine(agent);
        // }
        
        // SYNTHESIS: Create mesh from traits + biome
        const mesh = this.meshGenerator.generate(traits, biome);
        mesh.matrixAutoUpdate = false;
        
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
        agent.setRenderComponent(mesh, sync);
        
        this.scene.add(mesh);
        this.entityManager.add(agent);
        
        const id = `creature-${this.creatures.size}`;
        this.creatures.set(id, { agent, mesh, traits });
        
        return agent;
    }
    
    /**
     * Update all creatures (PURE ENGINE MODE - no governor updates)
     */
    update(_delta: number): void {
        // PURE ENGINE: No governor-based updates
        // Creatures just exist, Yuka handles basic movement
        // if (isCreatureGovernorsEnabled()) {
        //     for (const { agent } of this.creatures.values()) {
        //         MetabolismSystem.update(agent as any, _delta);
        //         if ((agent as any).stateMachine) {
        //             (agent as any).stateMachine.update(_delta);
        //         }
        //     }
        // }
    }
    
    /**
     * Get all creatures
     */
    getCreatures(): Vehicle[] {
        return Array.from(this.creatures.values()).map(c => c.agent);
    }
    
    /**
     * Dispose all creatures and their resources
     */
    dispose(): void {
        console.log(`[CreatureManager] Disposing ${this.creatures.size} creatures`);
        
        for (const { agent, mesh } of this.creatures.values()) {
            this.entityManager.remove(agent);
            this.scene.remove(mesh);
            
            mesh.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    if (child.geometry) {
                        child.geometry.dispose();
                    }
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                }
            });
        }
        
        this.creatures.clear();
        console.log('[CreatureManager] Disposal complete');
    }
}

