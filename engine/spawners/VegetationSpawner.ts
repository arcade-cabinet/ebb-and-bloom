/**
 * VEGETATION SPAWNER
 * 
 * Daggerfall-style vegetation placement using instanced meshes.
 * Like Daggerfall's TerrainNature.cs - places trees/grass based on biome.
 * 
 * Uses THREE.InstancedMesh for performance (1 draw call per tree type).
 * Vegetation placement is deterministic from chunk seed.
 * 
 * Key Daggerfall insights:
 * - Vegetation density varies by biome
 * - Trees clustered for realistic forests
 * - Grass/shrubs fill open areas
 * - Billboard rendering for distant vegetation (we use instancing instead)
 */

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { EnhancedRNG } from '../utils/EnhancedRNG';
import { BiomeType } from './BiomeSystem';

export interface VegetationConfig {
  biome: BiomeType;
  treeDensity: number;    // 0-1
  grassDensity: number;   // 0-1
  treeTypes: TreeType[];
}

export enum TreeType {
  OAK = 'oak',
  PINE = 'pine',
  PALM = 'palm',
  CACTUS = 'cactus',
  SHRUB = 'shrub'
}

interface TreeInstance {
  position: THREE.Vector3;
  scale: number;
  rotation: number;
}

export class VegetationSpawner {
  private scene: THREE.Scene;
  private seed: string;
  private rng: EnhancedRNG;
  
  // Instanced meshes (one per tree type for performance)
  private instancedTrees: Map<TreeType, THREE.InstancedMesh> = new Map();
  private maxInstances: number = 1000; // Per tree type
  private instanceCounts: Map<TreeType, number> = new Map();
  
  // Temporary matrix for instance transforms
  private tempMatrix = new THREE.Matrix4();
  private tempPosition = new THREE.Vector3();
  private tempQuaternion = new THREE.Quaternion();
  private tempScale = new THREE.Vector3();
  
  constructor(scene: THREE.Scene, seed: string) {
    this.scene = scene;
    this.seed = seed;
    this.rng = new EnhancedRNG(seed);
    
    this.initializeInstancedMeshes();
    console.log('[VegetationSpawner] Initialized with instanced rendering');
  }
  
  /**
   * Create instanced meshes for each tree type
   */
  private initializeInstancedMeshes(): void {
    const treeTypes: TreeType[] = [
      TreeType.OAK,
      TreeType.PINE,
      TreeType.PALM,
      TreeType.CACTUS,
      TreeType.SHRUB
    ];
    
    for (const type of treeTypes) {
      const geometry = this.createTreeGeometry(type);
      const material = this.createTreeMaterial(type);
      
      const mesh = new THREE.InstancedMesh(geometry, material, this.maxInstances);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.name = `vegetation-${type}`;
      
      // Hide all instances initially
      for (let i = 0; i < this.maxInstances; i++) {
        this.tempMatrix.makeScale(0, 0, 0); // Scale to 0 = invisible
        mesh.setMatrixAt(i, this.tempMatrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      
      this.scene.add(mesh);
      this.instancedTrees.set(type, mesh);
      this.instanceCounts.set(type, 0);
    }
  }
  
  /**
   * Create geometry for tree type
   */
  private createTreeGeometry(type: TreeType): THREE.BufferGeometry {
    switch (type) {
      case TreeType.OAK:
        // Round canopy on cylinder trunk
        return this.createBroadleafTree();
      
      case TreeType.PINE:
        // Conical shape
        return this.createConiferTree();
      
      case TreeType.PALM:
        // Tall thin trunk with top leaves
        return this.createPalmTree();
      
      case TreeType.CACTUS:
        // Cylinder with slight taper
        return this.createCactusGeometry();
      
      case TreeType.SHRUB:
        // Small bush
        return this.createShrubGeometry();
      
      default:
        return new THREE.CylinderGeometry(0.5, 0.5, 3, 8);
    }
  }
  
  private createBroadleafTree(): THREE.BufferGeometry {
    // Trunk + spherical canopy
    const trunk = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
    const canopy = new THREE.SphereGeometry(2, 8, 6);
    
    trunk.translate(0, 1.5, 0);
    canopy.translate(0, 4, 0);
    
    // Modern Three.js geometry merging
    const merged = mergeGeometries([trunk, canopy]);
    if (!merged) return canopy; // Fallback
    return merged;
  }
  
  private createConiferTree(): THREE.BufferGeometry {
    // Cone shape (pine/spruce)
    const cone = new THREE.ConeGeometry(1.5, 5, 8);
    cone.translate(0, 2.5, 0);
    return cone;
  }
  
  private createPalmTree(): THREE.BufferGeometry {
    // Tall cylinder with sphere on top
    const trunk = new THREE.CylinderGeometry(0.2, 0.3, 5, 8);
    const leaves = new THREE.SphereGeometry(1.5, 8, 6);
    
    trunk.translate(0, 2.5, 0);
    leaves.translate(0, 5.5, 0);
    leaves.scale(1, 0.3, 1); // Flatten for palm fronds
    
    // Modern Three.js geometry merging
    const merged = mergeGeometries([trunk, leaves]);
    if (!merged) return trunk; // Fallback
    return merged;
  }
  
  private createCactusGeometry(): THREE.BufferGeometry {
    const cactus = new THREE.CylinderGeometry(0.4, 0.5, 3, 8);
    cactus.translate(0, 1.5, 0);
    return cactus;
  }
  
  private createShrubGeometry(): THREE.BufferGeometry {
    const shrub = new THREE.SphereGeometry(0.8, 8, 6);
    shrub.translate(0, 0.8, 0);
    return shrub;
  }
  
  /**
   * Create material for tree type
   */
  private createTreeMaterial(type: TreeType): THREE.Material {
    let color: number;
    
    switch (type) {
      case TreeType.OAK:
        color = 0x2d5a2d; // Forest green
        break;
      case TreeType.PINE:
        color = 0x1a4d1a; // Dark pine green
        break;
      case TreeType.PALM:
        color = 0x3d6b3d; // Tropical green
        break;
      case TreeType.CACTUS:
        color = 0x4a7c4a; // Sage green
        break;
      case TreeType.SHRUB:
        color = 0x5a8c5a; // Lighter green
        break;
      default:
        color = 0x2d5a2d;
    }
    
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.9,
      metalness: 0.0,
      flatShading: true
    });
  }
  
  /**
   * Get vegetation config for biome
   */
  private getBiomeVegetation(biome: BiomeType): VegetationConfig {
    switch (biome) {
      case BiomeType.FOREST:
        return {
          biome,
          treeDensity: 0.8,
          grassDensity: 0.5,
          treeTypes: [TreeType.OAK]
        };
      
      case BiomeType.RAINFOREST:
        return {
          biome,
          treeDensity: 1.0,
          grassDensity: 0.8,
          treeTypes: [TreeType.OAK, TreeType.PALM]
        };
      
      case BiomeType.TAIGA:
        return {
          biome,
          treeDensity: 0.7,
          grassDensity: 0.2,
          treeTypes: [TreeType.PINE]
        };
      
      case BiomeType.SAVANNA:
        return {
          biome,
          treeDensity: 0.2,
          grassDensity: 0.6,
          treeTypes: [TreeType.OAK, TreeType.SHRUB]
        };
      
      case BiomeType.DESERT:
        return {
          biome,
          treeDensity: 0.05,
          grassDensity: 0.1,
          treeTypes: [TreeType.CACTUS]
        };
      
      case BiomeType.GRASSLAND:
        return {
          biome,
          treeDensity: 0.1,
          grassDensity: 0.8,
          treeTypes: [TreeType.OAK, TreeType.SHRUB]
        };
      
      case BiomeType.TUNDRA:
        return {
          biome,
          treeDensity: 0.1,
          grassDensity: 0.3,
          treeTypes: [TreeType.SHRUB]
        };
      
      default:
        return {
          biome,
          treeDensity: 0,
          grassDensity: 0,
          treeTypes: []
        };
    }
  }
  
  /**
   * Spawn vegetation in a chunk
   * @param chunkX Chunk X coordinate
   * @param chunkZ Chunk Z coordinate
   * @param getBiome Function to get biome at world position
   * @param getHeight Function to get terrain height at world position
   * @param getNearestSettlement Optional function to check settlement proximity
   */
  spawnInChunk(
    chunkX: number,
    chunkZ: number,
    getBiome: (x: number, z: number) => BiomeType,
    getHeight: (x: number, z: number) => number,
    getNearestSettlement?: (x: number, z: number) => { position: {x: number, z: number}, population: number } | undefined
  ): void {
    const chunkSeed = `${this.seed}-vegetation-${chunkX}-${chunkZ}`;
    const chunkRng = new EnhancedRNG(chunkSeed);
    
    const chunkSize = 100;
    const chunkWorldX = chunkX * chunkSize;
    const chunkWorldZ = chunkZ * chunkSize;
    
    // Sample biome at chunk center
    const centerBiome = getBiome(chunkWorldX, chunkWorldZ);
    const config = this.getBiomeVegetation(centerBiome);
    
    if (config.treeDensity === 0) {
      return; // No vegetation in this biome
    }
    
    // Calculate tree count based on density
    const baseTreeCount = 20; // Per chunk at full density
    const treeCount = Math.floor(baseTreeCount * config.treeDensity);
    
    // Spawn trees
    for (let i = 0; i < treeCount; i++) {
      // Random position within chunk
      const localX = chunkRng.uniform(-40, 40);
      const localZ = chunkRng.uniform(-40, 40);
      const worldX = chunkWorldX + localX;
      const worldZ = chunkWorldZ + localZ;
      
      // Get terrain height at this position
      const y = getHeight(worldX, worldZ);
      
      // Don't place trees underwater
      if (y < 0.5) continue;
      
      // DFU Pattern 1: Steepness check (no trees on cliffs!)
      // Calculate slope by sampling nearby heights
      const steepness = this.calculateSteepness(worldX, worldZ, getHeight);
      if (steepness > 50) continue; // Reject if slope > 50° (like DFU)
      
      // DFU Pattern 2: Settlement clearance (no trees in cities!)
      if (getNearestSettlement) {
        const settlement = getNearestSettlement(worldX, worldZ);
        if (settlement) {
          const dx = settlement.position.x - worldX;
          const dz = settlement.position.z - worldZ;
          const distance = Math.sqrt(dx * dx + dz * dz);
          
          // Clearance radius based on population (larger cities = more clearance)
          const baseRadius = 50; // Base settlement radius
          const populationBonus = Math.sqrt(settlement.population) * 0.5; // Bigger cities clear more
          const clearanceBuffer = 20; // Extra buffer (like DFU's natureClearance)
          const totalClearance = baseRadius + populationBonus + clearanceBuffer;
          
          if (distance < totalClearance) continue; // Too close to settlement
        }
      }
      
      // Choose tree type
      const treeType = config.treeTypes[
        Math.floor(chunkRng.uniform(0, 1) * config.treeTypes.length)
      ];
      
      // Random scale variation
      const scale = chunkRng.uniform(0.8, 1.2);
      
      // Random rotation
      const rotation = chunkRng.uniform(0, Math.PI * 2);
      
      // Add instance
      this.addTreeInstance(treeType, worldX, y, worldZ, scale, rotation);
    }
  }
  
  /**
   * Calculate terrain steepness at a position
   * DFU Pattern: TerrainData.GetSteepness()
   * Samples nearby heights and calculates slope angle
   */
  private calculateSteepness(
    worldX: number,
    worldZ: number,
    getHeight: (x: number, z: number) => number
  ): number {
    const sampleDist = 2; // Sample 2m away in each direction
    
    // Get center height
    const centerH = getHeight(worldX, worldZ);
    
    // Sample 4 cardinal directions
    const northH = getHeight(worldX, worldZ + sampleDist);
    const southH = getHeight(worldX, worldZ - sampleDist);
    const eastH = getHeight(worldX + sampleDist, worldZ);
    const westH = getHeight(worldX - sampleDist, worldZ);
    
    // Calculate maximum height difference
    const maxDiff = Math.max(
      Math.abs(northH - centerH),
      Math.abs(southH - centerH),
      Math.abs(eastH - centerH),
      Math.abs(westH - centerH)
    );
    
    // Convert to degrees
    // tan(angle) = rise / run
    // angle = atan(rise / run)
    const angle = Math.atan(maxDiff / sampleDist) * (180 / Math.PI);
    
    return angle;
  }
  
  /**
   * Add a tree instance
   */
  private addTreeInstance(
    type: TreeType,
    x: number,
    y: number,
    z: number,
    scale: number,
    rotation: number
  ): void {
    const mesh = this.instancedTrees.get(type);
    if (!mesh) return;
    
    const currentCount = this.instanceCounts.get(type) || 0;
    if (currentCount >= this.maxInstances) {
      console.warn(`[VegetationSpawner] Max instances reached for ${type}`);
      return;
    }
    
    // Set transform
    this.tempPosition.set(x, y, z);
    this.tempQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotation);
    this.tempScale.set(scale, scale, scale);
    
    this.tempMatrix.compose(this.tempPosition, this.tempQuaternion, this.tempScale);
    mesh.setMatrixAt(currentCount, this.tempMatrix);
    mesh.instanceMatrix.needsUpdate = true;
    
    this.instanceCounts.set(type, currentCount + 1);
  }
  
  /**
   * Clear all vegetation (for chunk unloading)
   */
  clearAll(): void {
    for (const [type, mesh] of this.instancedTrees.entries()) {
      // Hide all instances
      for (let i = 0; i < this.maxInstances; i++) {
        this.tempMatrix.makeScale(0, 0, 0);
        mesh.setMatrixAt(i, this.tempMatrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      this.instanceCounts.set(type, 0);
    }
  }
  
  /**
   * Get total vegetation count
   */
  getVegetationCount(): number {
    let total = 0;
    for (const count of this.instanceCounts.values()) {
      total += count;
    }
    return total;
  }
}

