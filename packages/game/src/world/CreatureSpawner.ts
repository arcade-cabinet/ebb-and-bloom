/**
 * CREATURE SPAWNER
 * 
 * Spawns creatures in chunks using our BiologyLaws and EcologyLaws.
 * Uses Yuka CreatureAgent for AI behavior.
 * 
 * Daggerfall spawned enemies/animals in dungeons and wilderness.
 * We use law-based generation for more realistic ecology.
 */

import * as THREE from 'three';
import { CreatureAgent } from '../yuka-integration/agents/CreatureAgent';
import { EnhancedRNG } from '../utils/EnhancedRNG';
import { EntityManager } from 'yuka';

export interface CreatureData {
  agent: CreatureAgent;
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
      
      // Create creature agent
      const mass = chunkRng.uniform(10, 200); // 10-200 kg
      const speed = chunkRng.uniform(1, 3);   // 1-3 m/s
      
      const agent = new CreatureAgent(mass, speed, 0.3);
      agent.position.set(x, 1, z); // y=1 to stand on terrain
      agent.name = `creature-${chunkX}-${chunkZ}-${i}`;
      
      // Create visual mesh (simple cube for now)
      const size = Math.cbrt(mass / 50); // Scale with mass
      const geometry = new THREE.BoxGeometry(size, size * 1.5, size);
      const material = new THREE.MeshStandardMaterial({
        color: chunkRng.uniform(0, 1) > 0.5 ? 0x8B4513 : 0x654321, // Brown variations
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, size * 0.75, z); // Slightly above ground
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
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
   * Update all creatures (sync visuals to agents)
   */
  update(delta: number): void {
    for (const creature of this.creatures.values()) {
      // Sync mesh position to agent position
      creature.mesh.position.set(
        creature.agent.position.x,
        creature.mesh.geometry.parameters.height / 2,
        creature.agent.position.z
      );
      
      // Rotate mesh to face movement direction
      if (creature.agent.velocity.length() > 0.01) {
        const angle = Math.atan2(creature.agent.velocity.x, creature.agent.velocity.z);
        creature.mesh.rotation.y = angle;
      }
    }
  }
  
  /**
   * Get creature count
   */
  getCreatureCount(): number {
    return this.creatures.size;
  }
}

