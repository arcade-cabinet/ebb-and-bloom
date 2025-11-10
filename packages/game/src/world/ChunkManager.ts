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
import { EnhancedRNG } from '../utils/EnhancedRNG';

export interface ChunkCoord {
  x: number;
  z: number;
}

export interface ChunkData {
  coord: ChunkCoord;
  mesh: THREE.Mesh;
  active: boolean;
  lastUsed: number;
}

export class ChunkManager {
  private chunks: Map<string, ChunkData> = new Map();
  private chunkSize: number = 100; // meters per chunk
  private renderDistance: number = 3; // Load 7x7 grid (3 in each direction)
  private seed: string;
  private rng: EnhancedRNG;
  private scene: THREE.Scene;
  private maxChunks: number = 81; // 9x9 max (like Daggerfall maxTerrainArray)
  
  constructor(scene: THREE.Scene, seed: string) {
    this.scene = scene;
    this.seed = seed;
    this.rng = new EnhancedRNG(seed);
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
    
    // Apply heightmap
    const vertices = geometry.attributes.position.array;
    const maxHeight = 15;
    
    for (let i = 0; i < vertices.length; i += 3) {
      const localX = vertices[i];
      const localZ = vertices[i + 1];
      const worldX = localX + chunkX * this.chunkSize;
      const worldZ = localZ + chunkZ * this.chunkSize;
      
      // Multi-octave noise (Perlin-like)
      const height = 
        Math.sin(worldX * 0.02) * 5 +
        Math.cos(worldZ * 0.02) * 5 +
        Math.sin(worldX * 0.05) * 2 +
        Math.cos(worldZ * 0.05) * 2 +
        chunkRng.uniform(-0.5, 0.5);
      
      vertices[i + 2] = height;
    }
    
    geometry.computeVertexNormals();
    
    // Material (grass for now, will use BiomeLaws later)
    const material = new THREE.MeshStandardMaterial({
      color: 0x2d8b3d,
      flatShading: false,
      side: THREE.DoubleSide,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
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
      lastUsed: Date.now()
    });
    
    // Log first few chunks (not spam)
    if (this.chunks.size <= 9) {
      console.log(`[ChunkManager] Loaded chunk (${chunkX}, ${chunkZ}) - Total: ${this.chunks.size}`);
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
}

