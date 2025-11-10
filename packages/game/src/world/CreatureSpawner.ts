/**
 * CREATURE SPAWNER
 * 
 * Spawns creatures in chunks using our BiologyLaws and EcologyLaws.
 * Uses Yuka CreatureAgent for AI behavior.
 * 
 * Daggerfall spawned enemies/animals in dungeons and wilderness.
 * We use law-based generation for more realistic ecology.
 * 
 * PROPER YUKA PATTERN (from examples/playground/shooter):
 * - entity.setRenderComponent(mesh, sync)
 * - sync function copies entity.worldMatrix to mesh.matrix
 * - mesh.matrixAutoUpdate = false (Yuka controls it)
 */

import * as THREE from 'three';
import { Vehicle, WanderBehavior } from 'yuka';
import { EnhancedRNG } from '../utils/EnhancedRNG';
import { EntityManager } from 'yuka';

/**
 * Sync function - copies entity transform to mesh
 * (Yuka pattern from examples)
 */
function sync(entity: Vehicle, renderComponent: THREE.Object3D) {
  renderComponent.matrix.copy(entity.worldMatrix);
}

export interface CreatureData {
  agent: Vehicle;
  mesh: THREE.Mesh;
  chunkX: number;
  chunkZ: number;
}

export class CreatureSpawner {
  private creatures: Map<string, CreatureData> = new Map();
  private scene: THREE.Scene;
  private entityManager: EntityManager;
  private seed: string;
  private rng: EnhancedRNG;
  
  constructor(scene: THREE.Scene, entityManager: EntityManager, seed: string) {
    this.scene = scene;
    this.entityManager = entityManager;
    this.seed = seed;
    this.rng = new EnhancedRNG(seed);
    console.log('[CreatureSpawner] Initialized');
  }
  
  /**
   * Spawn creatures in a chunk
   * Uses EcologyLaws for population density
   */
  spawnInChunk(chunkX: number, chunkZ: number): void {
    const key = `${chunkX},${chunkZ}`;
    
    // Check if already spawned
    if (this.creatures.has(key)) {
      return;
    }
    
    // Chunk-specific RNG
    const chunkSeed = `${this.seed}-creatures-${chunkX}-${chunkZ}`;
    const chunkRng = new EnhancedRNG(chunkSeed);
    
    // Use EcologyLaws to determine population
    // For now: Simple random count (will use CarryingCapacityLaw later)
    const creatureCount = chunkRng.poisson(2); // ~2 creatures per chunk
    
    for (let i = 0; i < creatureCount; i++) {
      // Random position within chunk
      const x = chunkX * 100 + chunkRng.uniform(-40, 40);
      const z = chunkZ * 100 + chunkRng.uniform(-40, 40);
      
      // Create creature agent (use simple Vehicle, not CreatureAgent with brain)
      const mass = chunkRng.uniform(10, 200); // 10-200 kg
      const speed = chunkRng.uniform(1, 3);   // 1-3 m/s
      
      const agent = new Vehicle();
      agent.position.set(x, 0, z); // y=0, Yuka uses XZ plane
      agent.name = `creature-${chunkX}-${chunkZ}-${i}`;
      agent.maxSpeed = speed;
      agent.updateOrientation = true; // Auto-rotate to face movement
      
      // Wander behavior (Yuka pattern from examples)
      const wanderBehavior = new WanderBehavior();
      wanderBehavior.radius = 5;
      wanderBehavior.distance = 3;
      wanderBehavior.jitter = 1;
      agent.steering.add(wanderBehavior);
      
      // Create visual mesh (cone pointing forward like Yuka examples)
      const size = Math.cbrt(mass / 50); // Scale with mass
      const geometry = new THREE.ConeGeometry(size * 0.5, size * 1.5, 8);
      geometry.rotateX(Math.PI * 0.5); // Point forward
      
      const material = new THREE.MeshStandardMaterial({
        color: chunkRng.uniform(0, 1) > 0.5 ? 0x8B4513 : 0x654321, // Brown variations
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.matrixAutoUpdate = false; // CRITICAL: Yuka controls matrix
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // PROPER YUKA PATTERN: setRenderComponent with sync function
      agent.setRenderComponent(mesh, sync);
      
      // Add to scene and entity manager
      this.scene.add(mesh);
      this.entityManager.add(agent);
      
      // Store reference
      this.creatures.set(`${key}-${i}`, {
        agent,
        mesh,
        chunkX,
        chunkZ
      });
    }
    
    if (creatureCount > 0) {
      console.log(`[CreatureSpawner] Spawned ${creatureCount} creatures in chunk (${chunkX}, ${chunkZ})`);
    }
  }
  
  /**
   * Despawn creatures in a chunk
   */
  despawnChunk(chunkX: number, chunkZ: number): void {
    const prefix = `${chunkX},${chunkZ}-`;
    const toRemove: string[] = [];
    
    for (const [key, creature] of this.creatures.entries()) {
      if (key.startsWith(prefix)) {
        this.scene.remove(creature.mesh);
        creature.mesh.geometry.dispose();
        (creature.mesh.material as THREE.Material).dispose();
        this.entityManager.remove(creature.agent);
        toRemove.push(key);
      }
    }
    
    for (const key of toRemove) {
      this.creatures.delete(key);
    }
    
    if (toRemove.length > 0) {
      console.log(`[CreatureSpawner] Despawned ${toRemove.length} creatures from chunk (${chunkX}, ${chunkZ})`);
    }
  }
  
  /**
   * Update all creatures (Yuka handles sync automatically via setRenderComponent)
   */
  update(delta: number): void {
    // Yuka's setRenderComponent + sync function handles all position/rotation updates
    // No manual syncing needed - that's the whole point of the pattern!
  }
  
  /**
   * Get creature count
   */
  getCreatureCount(): number {
    return this.creatures.size;
  }
}

