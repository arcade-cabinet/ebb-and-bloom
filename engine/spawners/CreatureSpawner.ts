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
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Vehicle, WanderBehavior, FollowPathBehavior, Path, Vector3 } from 'yuka';
import { EnhancedRNG } from '../utils/EnhancedRNG';
import { EntityManager } from 'yuka';
import { BIOLOGICAL_CONSTANTS } from '../tables/biological-constants';

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
      
      // Create visual mesh - procedural animal shape based on mass
      // Use Kleiber's Law for proportions
      const size = Math.cbrt(mass / 50); // Scale with mass
      const geometry = this.createCreatureGeometry(mass, chunkRng);
      
      // Color variation based on species
      const speciesHue = chunkRng.uniform(0, 360);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(speciesHue / 360, 0.6, 0.4),
        roughness: 0.8,
        metalness: 0.0
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
   * Create procedural creature geometry based on mass
   * Uses BiologyLaws for realistic proportions
   */
  private createCreatureGeometry(mass: number, rng: EnhancedRNG): THREE.BufferGeometry {
    // Use Kleiber's Law and allometric scaling
    const bodyLength = Math.cbrt(mass / 100) * 2; // Body length
    const bodyRadius = bodyLength * 0.4;
    const legLength = bodyLength * 0.6;
    const legRadius = bodyRadius * 0.15;
    const headRadius = bodyRadius * 0.7;
    
    // Determine body plan (quadruped, biped, etc.)
    const bodyPlan = rng.uniform(0, 1);
    
    if (bodyPlan < 0.6) {
      // Quadruped (most common - deer, wolves, etc.)
      return this.createQuadruped(bodyLength, bodyRadius, legLength, legRadius, headRadius);
    } else if (bodyPlan < 0.9) {
      // Biped (birds, smaller creatures)
      return this.createBiped(bodyLength, bodyRadius, legLength, legRadius, headRadius);
    } else {
      // Hexapod (insect-like)
      return this.createHexapod(bodyLength, bodyRadius, legLength, legRadius, headRadius);
    }
  }
  
  private createQuadruped(bodyLength: number, bodyRadius: number, legLength: number, legRadius: number, headRadius: number): THREE.BufferGeometry {
    const body = new THREE.CapsuleGeometry(bodyRadius, bodyLength, 8, 16);
    body.rotateZ(Math.PI / 2); // Horizontal
    
    const head = new THREE.SphereGeometry(headRadius, 8, 8);
    head.translate(bodyLength / 2 + headRadius, 0, 0);
    
    // Four legs
    const leg = new THREE.CylinderGeometry(legRadius, legRadius, legLength, 8);
    leg.translate(0, -legLength / 2 - bodyRadius, 0);
    
    const legFrontLeft = leg.clone();
    legFrontLeft.translate(bodyLength * 0.3, 0, -bodyRadius * 0.5);
    
    const legFrontRight = leg.clone();
    legFrontRight.translate(bodyLength * 0.3, 0, bodyRadius * 0.5);
    
    const legBackLeft = leg.clone();
    legBackLeft.translate(-bodyLength * 0.3, 0, -bodyRadius * 0.5);
    
    const legBackRight = leg.clone();
    legBackRight.translate(-bodyLength * 0.3, 0, bodyRadius * 0.5);
    
    // Merge all parts (modern Three.js way)
    const merged = mergeGeometries([body, head, legFrontLeft, legFrontRight, legBackLeft, legBackRight]);
    if (!merged) return body; // Fallback
    return merged;
  }
  
  private createBiped(bodyLength: number, bodyRadius: number, legLength: number, legRadius: number, headRadius: number): THREE.BufferGeometry {
    const body = new THREE.CapsuleGeometry(bodyRadius, bodyLength * 0.6, 8, 16);
    
    const head = new THREE.SphereGeometry(headRadius, 8, 8);
    head.translate(0, bodyLength * 0.3 + headRadius, 0);
    
    // Two legs
    const leg = new THREE.CylinderGeometry(legRadius, legRadius, legLength, 8);
    leg.translate(0, -bodyLength * 0.3 - legLength / 2, 0);
    
    const legLeft = leg.clone();
    legLeft.translate(0, 0, -bodyRadius * 0.5);
    
    const legRight = leg.clone();
    legRight.translate(0, 0, bodyRadius * 0.5);
    
    // Merge all parts (modern Three.js way)
    const merged = mergeGeometries([body, head, legLeft, legRight]);
    if (!merged) return body; // Fallback
    return merged;
  }
  
  private createHexapod(bodyLength: number, bodyRadius: number, legLength: number, legRadius: number, headRadius: number): THREE.BufferGeometry {
    const body = new THREE.CapsuleGeometry(bodyRadius * 0.6, bodyLength, 8, 16);
    body.rotateZ(Math.PI / 2);
    
    const head = new THREE.SphereGeometry(headRadius * 0.8, 8, 8);
    head.translate(bodyLength / 2 + headRadius, 0, 0);
    
    // Six legs (3 pairs)
    const leg = new THREE.CylinderGeometry(legRadius * 0.5, legRadius * 0.5, legLength * 0.8, 6);
    leg.translate(0, -legLength * 0.4 - bodyRadius * 0.6, 0);
    
    const parts = [body, head];
    
    // Add 6 legs at different positions along body
    for (let i = 0; i < 3; i++) {
      const xPos = (i - 1) * bodyLength * 0.3;
      
      const legLeft = leg.clone();
      legLeft.translate(xPos, 0, -bodyRadius * 0.6);
      parts.push(legLeft);
      
      const legRight = leg.clone();
      legRight.translate(xPos, 0, bodyRadius * 0.6);
      parts.push(legRight);
    }
    
    // Merge all parts (modern Three.js way)
    const merged = mergeGeometries(parts);
    if (!merged) return body; // Fallback
    return merged;
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

