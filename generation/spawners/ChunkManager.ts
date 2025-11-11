/**
 * CHUNK MANAGER
 * 
 * Daggerfall-style streaming system for infinite procedural terrain.
 * Loads/unloads chunks based on player position.
 * 
 * Key Daggerfall insights:
 * - TerrainDistance: Load NxN grid around player
 * - Recycling: Reuse terrain objects instead of create/destroy
 * - Neighbor tracking: Seamless chunk edges
 * - Map coordinates: Grid position for deterministic generation
 */

import * as THREE from 'three';
import { EnhancedRNG } from '../../engine/utils/EnhancedRNG';
import { SimplexNoise } from './SimplexNoise';
import { BiomeSystem, BiomeType } from './BiomeSystem';
import { VegetationSpawner } from './VegetationSpawner';
import { SettlementPlacer } from './SettlementPlacer';
import { NPCSpawner } from './NPCSpawner';
import { EntityManager } from 'yuka';

export interface ChunkCoord {
  x: number;
  z: number;
}

export interface ChunkData {
  coord: ChunkCoord;
  mesh: THREE.Mesh;
  active: boolean;
  lastUsed: number;
  vegetationSpawned: boolean;
}

export class ChunkManager {
  private chunks: Map<string, ChunkData> = new Map();
  private chunkSize: number = 100; // meters per chunk
  private renderDistance: number = 3; // Load 7x7 grid (3 in each direction)
  private seed: string;
  private scene: THREE.Scene;
  private maxChunks: number = 81; // 9x9 max (like Daggerfall maxTerrainArray)
  private simplex: SimplexNoise; // Simplex noise for terrain (better than Perlin!)
  private biomes: BiomeSystem;   // Biome system for terrain colors
  private vegetation: VegetationSpawner; // Vegetation spawning
  private settlements: SettlementPlacer; // Settlement placement
  private npcSpawner?: NPCSpawner; // NPC spawning (optional - needs EntityManager)
  private settlementsPlaced: Set<string> = new Set(); // Track which regions have settlements
  private npcsSpawned: Set<string> = new Set(); // Track which settlements have NPCs
  
  constructor(scene: THREE.Scene, seed: string, entityManager?: EntityManager) {
    this.scene = scene;
    this.seed = seed;
    this.simplex = new SimplexNoise(seed);
    this.biomes = new BiomeSystem(seed);
    this.vegetation = new VegetationSpawner(scene, seed);
    this.settlements = new SettlementPlacer(scene, seed);
    
    if (entityManager) {
      this.npcSpawner = new NPCSpawner(scene, entityManager, seed);
    }
    
    console.log(`[ChunkManager] Initialized - Distance: ${this.renderDistance}, Max chunks: ${this.maxChunks}`);
  }
  
  /**
   * Get chunk key from coordinates
   */
  private getKey(x: number, z: number): string {
    return `${x},${z}`;
  }
  
  /**
   * Get chunk coordinates from world position
   */
  getChunkCoord(worldX: number, worldZ: number): ChunkCoord {
    return {
      x: Math.floor(worldX / this.chunkSize),
      z: Math.floor(worldZ / this.chunkSize)
    };
  }
  
  /**
   * Generate terrain mesh for a chunk
   * Uses Perlin-like noise (simplified for now)
   */
  private generateChunk(chunkX: number, chunkZ: number): THREE.Mesh {
    // Use chunk-specific RNG (deterministic per chunk)
    const chunkSeed = `${this.seed}-${chunkX}-${chunkZ}`;
    const chunkRng = new EnhancedRNG(chunkSeed);
    
    // Create plane geometry
    const segments = 64; // Higher detail for closer viewing
    const geometry = new THREE.PlaneGeometry(
      this.chunkSize,
      this.chunkSize,
      segments,
      segments
    );
    
    // Rotate geometry to horizontal FIRST (so Y becomes up)
    geometry.rotateX(-Math.PI / 2);
    
    // Apply heightmap using simplex noise
    const vertices = geometry.attributes.position.array;
    const colors: number[] = [];
    
    for (let i = 0; i < vertices.length; i += 3) {
      const localX = vertices[i];     // X is left-right
      const localZ = vertices[i + 2]; // Z is forward-back (after rotation)
      const worldX = localX + chunkX * this.chunkSize;
      const worldZ = localZ + chunkZ * this.chunkSize;
      
      // TERRAIN HEIGHT GENERATION - MATCHES DFU DefaultTerrainSampler EXACTLY
      // DFU values:
      // - MaxTerrainHeight = 1539m
      // - OceanElevation = 27.2m (minimum)
      // - baseHeightScale = 8f, noiseMapScale = 4f, extraNoiseScale = 10f
      // - Heights range from ~27m (ocean) to 1539m (peaks)
      
      // Layer 1: Base terrain elevation (low frequency, large scale)
      // DFU uses heightmap data scaled by baseHeightScale (8f)
      // We simulate with noise scaled to match DFU's typical ranges
      const baseNoise = this.simplex.octaveNoise(worldX, worldZ, 2, 0.5, 2.0, 0.002);
      const baseHeight = 27.2 + (baseNoise + 1) / 2 * 200; // Ocean level (27.2m) + 0-200m base variation
      
      // Layer 2: Noise mask for terrain features (medium frequency)
      // DFU uses noiseMapScale (4f) - adds detail variation
      const noiseMask = this.simplex.octaveNoise(worldX, worldZ, 4, 0.5, 2.0, 0.02);
      const noiseHeight = noiseMask * 50; // ±50m variation
      
      // Layer 3: Extra noise for small terrain features (high frequency)
      // DFU uses extraNoiseScale (10f) - adds fine detail
      const extraNoise = this.simplex.octaveNoise(worldX * 0.3, worldZ * 0.3, 1, 0.5, 2.0, 0.9);
      const extraHeight = extraNoise * 10; // ±10m fine detail
      
      // Combine all layers (matches DFU formula)
      let height = baseHeight + noiseHeight + extraHeight;
      
      // Clamp to ocean elevation minimum (DFU pattern)
      const oceanElevation = 27.2;
      if (height < oceanElevation) {
        height = oceanElevation;
      }
      
      // Clamp to max terrain height (DFU pattern)
      const maxTerrainHeight = 1539;
      if (height > maxTerrainHeight) {
        height = maxTerrainHeight;
      }
      
      // Add small random micro-variation for natural look
      const randomVariation = chunkRng.uniform(-0.5, 0.5);
      height += randomVariation;
      
      vertices[i + 1] = height; // Y is UP (after rotation)
      
      // Get biome color for this vertex
      const biome = this.biomes.getBiome(worldX, worldZ, height);
      colors.push(biome.color.r, biome.color.g, biome.color.b);
    }
    
    // Add vertex colors to geometry
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    
    // Material with vertex colors enabled
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true, // Use vertex colors for biome variation
      flatShading: false,
      side: THREE.DoubleSide,
      roughness: 0.8,
      metalness: 0.1
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    // No rotation needed - geometry already rotated
    mesh.position.x = chunkX * this.chunkSize;
    mesh.position.z = chunkZ * this.chunkSize;
    mesh.receiveShadow = true;
    mesh.castShadow = false; // Terrain doesn't cast shadows
    
    mesh.name = `chunk-${chunkX}-${chunkZ}`;
    
    return mesh;
  }
  
  /**
   * Update chunks based on player position
   * Daggerfall approach: Load grid around player, unload far chunks
   */
  update(playerX: number, playerZ: number): void {
    const playerChunk = this.getChunkCoord(playerX, playerZ);
    const now = Date.now();
    
    // Determine which chunks should be loaded
    const neededChunks = new Set<string>();
    
    for (let dx = -this.renderDistance; dx <= this.renderDistance; dx++) {
      for (let dz = -this.renderDistance; dz <= this.renderDistance; dz++) {
        const chunkX = playerChunk.x + dx;
        const chunkZ = playerChunk.z + dz;
        const key = this.getKey(chunkX, chunkZ);
        neededChunks.add(key);
        
        // Load chunk if not already loaded
        if (!this.chunks.has(key)) {
          this.loadChunk(chunkX, chunkZ);
        } else {
          // Mark as recently used
          const chunk = this.chunks.get(key)!;
          chunk.lastUsed = now;
          if (!chunk.active) {
            chunk.mesh.visible = true;
            chunk.active = true;
          }
        }
      }
    }
    
    // Unload chunks beyond render distance
    const chunksToUnload: string[] = [];
    
    for (const [key, chunk] of this.chunks.entries()) {
      if (!neededChunks.has(key)) {
        if (chunk.active) {
          chunk.mesh.visible = false;
          chunk.active = false;
        }
        
        // Recycle if too many chunks in memory
        if (this.chunks.size > this.maxChunks && now - chunk.lastUsed > 10000) {
          chunksToUnload.push(key);
        }
      }
    }
    
    // Remove old chunks (Daggerfall recycling)
    for (const key of chunksToUnload) {
      const chunk = this.chunks.get(key)!;
      this.scene.remove(chunk.mesh);
      chunk.mesh.geometry.dispose();
      (chunk.mesh.material as THREE.Material).dispose();
      this.chunks.delete(key);
    }
    
    if (chunksToUnload.length > 0) {
      console.log(`[ChunkManager] Recycled ${chunksToUnload.length} chunks`);
    }
  }
  
  /**
   * Load a chunk
   */
  private loadChunk(chunkX: number, chunkZ: number): void {
    const key = this.getKey(chunkX, chunkZ);
    
    if (this.chunks.has(key)) {
      return; // Already loaded
    }
    
    const mesh = this.generateChunk(chunkX, chunkZ);
    this.scene.add(mesh);
    
    this.chunks.set(key, {
      coord: { x: chunkX, z: chunkZ },
      mesh,
      active: true,
      lastUsed: Date.now(),
      vegetationSpawned: false
    });
    
    // Spawn vegetation in this chunk
    this.spawnVegetation(chunkX, chunkZ);
    
    // Place settlements (in regions, not every chunk)
    // Use chunk center as approximate position for settlement placement
    const chunkCenterX = chunkX * this.chunkSize + this.chunkSize / 2;
    const chunkCenterZ = chunkZ * this.chunkSize + this.chunkSize / 2;
    this.placeSettlementsInRegion(chunkX, chunkZ, chunkCenterX, chunkCenterZ);
    
    // Log first few chunks (not spam)
    if (this.chunks.size <= 9) {
      console.log(`[ChunkManager] Loaded chunk (${chunkX}, ${chunkZ}) - Total: ${this.chunks.size}`);
    }
  }
  
  /**
   * Spawn vegetation in a chunk
   */
  private spawnVegetation(chunkX: number, chunkZ: number): void {
    const key = this.getKey(chunkX, chunkZ);
    const chunk = this.chunks.get(key);
    if (!chunk || chunk.vegetationSpawned) return;
    
    // Provide biome and height lookup functions
    const getBiome = (x: number, z: number): BiomeType => {
      const height = this.getTerrainHeight(x, z);
      return this.biomes.getBiome(x, z, height).type;
    };
    
    const getHeight = (x: number, z: number): number => {
      return this.getTerrainHeight(x, z);
    };
    
    // DFU Pattern: Provide settlement lookup for clearance check
    const getSettlement = (x: number, z: number) => {
      return this.getNearestSettlement(x, z);
    };
    
    this.vegetation.spawnInChunk(chunkX, chunkZ, getBiome, getHeight, getSettlement);
    chunk.vegetationSpawned = true;
  }
  
  /**
   * Place settlements in region (10x10 chunk areas)
   * Only place once per region
   */
  private placeSettlementsInRegion(chunkX: number, chunkZ: number, _playerX: number, _playerZ: number): void {
    // Group chunks into 10x10 regions
    const regionX = Math.floor(chunkX / 10);
    const regionZ = Math.floor(chunkZ / 10);
    const regionKey = `${regionX},${regionZ}`;
    
    // Use deterministic RNG for settlement placement in this region
    const regionSeed = `${this.seed}-region-${regionX}-${regionZ}`;
    const regionRng = new EnhancedRNG(regionSeed);
    
    // Already placed in this region?
    if (this.settlementsPlaced.has(regionKey)) {
      // Check if we need to spawn NPCs in existing settlements
      if (this.npcSpawner) {
        const settlements = this.settlements.getSettlements();
        for (const settlement of settlements) {
          if (!this.npcsSpawned.has(settlement.id)) {
            this.npcSpawner.spawnInSettlement(settlement);
            this.npcsSpawned.add(settlement.id);
            console.log(`[ChunkManager] ✅ Spawned NPCs in ${settlement.name}`);
          }
        }
      }
      return;
    }
    
    this.settlementsPlaced.add(regionKey);
    
    // Provide biome and height lookup functions
    const getBiome = (x: number, z: number): BiomeType => {
      const height = this.getTerrainHeight(x, z);
      return this.biomes.getBiome(x, z, height).type;
    };
    
    const getHeight = (x: number, z: number): number => {
      return this.getTerrainHeight(x, z);
    };
    
    // Use regionRng for settlement placement probability
    const shouldPlaceSettlement = regionRng.uniform(0, 1) < 0.3; // 30% chance per region
    if (shouldPlaceSettlement) {
        this.settlements.placeInRegion(regionX, regionZ, getBiome, getHeight);
    }
    
    // Spawn NPCs immediately in new settlements
    if (this.npcSpawner) {
      const settlements = this.settlements.getSettlements();
      console.log(`[ChunkManager] Spawning NPCs in ${settlements.length} settlements`);
      
      for (const settlement of settlements) {
        if (!this.npcsSpawned.has(settlement.id)) {
          this.npcSpawner.spawnInSettlement(settlement);
          this.npcsSpawned.add(settlement.id);
          console.log(`[ChunkManager] ✅ Spawned NPCs in ${settlement.name}`);
        }
      }
    }
  }
  
  /**
   * Update NPCs (call from game loop)
   */
  updateNPCs(delta: number): void {
    if (this.npcSpawner) {
      this.npcSpawner.update(delta);
    }
  }
  
  /**
   * Get current chunk count
   */
  getChunkCount(): number {
    return this.chunks.size;
  }
  
  /**
   * Get active chunk count
   */
  getActiveChunkCount(): number {
    let count = 0;
    for (const chunk of this.chunks.values()) {
      if (chunk.active) count++;
    }
    return count;
  }
  
  /**
   * Get vegetation count
   */
  getVegetationCount(): number {
    return this.vegetation.getVegetationCount();
  }
  
  /**
   * Get settlement count
   */
  getSettlementCount(): number {
    return this.settlements.getSettlementCount();
  }
  
  /**
   * Get NPC count
   */
  getNPCCount(): number {
    return this.npcSpawner ? this.npcSpawner.getNPCCount() : 0;
  }
  
  /**
   * Get game time (hour)
   */
  getGameTime(): number {
    return this.npcSpawner ? this.npcSpawner.getGameTime() : 0;
  }
  
  /**
   * Get terrain height at world position (for collision/gravity)
   * Returns the Y coordinate of the terrain at (x, z)
   * MUST match generateChunk formula exactly for proper collision
   */
  getTerrainHeight(worldX: number, worldZ: number): number {
    // MUST match generateChunk formula EXACTLY (DFU DefaultTerrainSampler pattern)
    const oceanElevation = 27.2;
    const maxTerrainHeight = 1539;
    
    // Layer 1: Base terrain elevation
    const baseNoise = this.simplex.octaveNoise(worldX, worldZ, 2, 0.5, 2.0, 0.002);
    const baseHeight = oceanElevation + (baseNoise + 1) / 2 * 200;
    
    // Layer 2: Noise mask for terrain features
    const noiseMask = this.simplex.octaveNoise(worldX, worldZ, 4, 0.5, 2.0, 0.02);
    const noiseHeight = noiseMask * 50;
    
    // Layer 3: Extra noise for small terrain features
    const extraNoise = this.simplex.octaveNoise(worldX * 0.3, worldZ * 0.3, 1, 0.5, 2.0, 0.9);
    const extraHeight = extraNoise * 10;
    
    // Combine all layers
    let height = baseHeight + noiseHeight + extraHeight;
    
    // Clamp to DFU ranges
    if (height < oceanElevation) height = oceanElevation;
    if (height > maxTerrainHeight) height = maxTerrainHeight;
    
    return height;
  }
  
  /**
   * Get all NPC meshes for raycasting (dialogue system)
   */
  getAllNPCMeshes(): THREE.Mesh[] {
    return this.npcSpawner ? this.npcSpawner.getAllMeshes() : [];
  }
  
  /**
   * Get NPC data by mesh (dialogue system)
   */
  getNPCByMesh(mesh: THREE.Mesh): import('./NPCSpawner').NPCData | undefined {
    return this.npcSpawner ? this.npcSpawner.getNPCByMesh(mesh) : undefined;
  }
  
  /**
   * Get nearest settlement to a position (for spawn location)
   */
  getNearestSettlement(x: number, z: number): import('./SettlementPlacer').Settlement | undefined {
    return this.settlements.getNearestSettlement(x, z);
  }
  
  /**
   * Dispose all chunk resources
   */
  dispose(): void {
    console.log(`[ChunkManager] Disposing ${this.chunks.size} chunks`);
    
    for (const chunk of this.chunks.values()) {
      this.scene.remove(chunk.mesh);
      chunk.mesh.geometry.dispose();
      
      if (Array.isArray(chunk.mesh.material)) {
        chunk.mesh.material.forEach(m => m.dispose());
      } else {
        chunk.mesh.material.dispose();
      }
    }
    
    this.chunks.clear();
    
    if (this.vegetation) {
      this.vegetation.dispose();
    }
    
    if (this.settlements) {
      this.settlements.dispose();
    }
    
    if (this.npcSpawner) {
      this.npcSpawner.dispose();
    }
    
    this.settlementsPlaced.clear();
    this.npcsSpawned.clear();
    
    console.log('[ChunkManager] Disposal complete');
  }
}

