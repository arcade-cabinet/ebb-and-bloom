/**
 * Terrain Generation System
 * Handles procedural terrain with three-terrain library
 */

import * as THREE from 'three';
import * as terrain from 'three-terrain';
import { SimplexNoise } from 'simplex-noise';
import { log, measurePerformance } from '../utils/Logger';
import type { World, Entity } from 'miniplex';
import type { WorldSchema, TerrainChunk, Transform, RenderData } from '../world/ECSWorld';

export class TerrainSystem {
  private world: World<WorldSchema>;
  private noise = new SimplexNoise();
  private heightmapCache = new Map<string, Float32Array>();
  
  constructor(world: World<WorldSchema>) {
    this.world = world;
    log.info('TerrainSystem initialized');
  }
  
  generateChunk(chunkX: number, chunkZ: number, size: number, resolution: number): Entity<WorldSchema> {
    const perf = measurePerformance(`Terrain Chunk ${chunkX},${chunkZ}`);
    const chunkKey = `${chunkX}_${chunkZ}`;
    
    log.terrain('Generating terrain chunk', { chunkX, chunkZ, size, resolution });
    
    try {
      // Create geometry
      const geo = new THREE.PlaneGeometry(size, size, resolution - 1, resolution - 1);
      geo.rotateX(-Math.PI / 2);
      
      // Apply three-terrain algorithms
      terrain.DiamondSquare(geo, {
        restoreOnFail: true,
        frequency: 2.5,
        seed: chunkX * 1000 + chunkZ // Deterministic per chunk
      });
      
      terrain.Erosion(geo, {
        iterations: 3,
        rate: 0.05
      });
      
      // Height-based texturing
      terrain.HeightTexture(geo, {
        textureMap: [
          [0.0, 0x4A90E2], // Water
          [0.3, 0x7ED321], // Grass
          [0.7, 0x8B4513], // Dirt
          [1.0, 0x888888]  // Rock
        ]
      });
      
      // Extract heightmap
      const vertices = geo.attributes.position.array as Float32Array;
      const heightData = new Float32Array(resolution * resolution);
      
      for (let i = 0; i < vertices.length; i += 3) {
        const idx = Math.floor(i / 3);
        heightData[idx] = vertices[i + 1];
      }
      
      this.heightmapCache.set(chunkKey, heightData);
      
      // Create material
      const material = new THREE.MeshLambertMaterial({ 
        vertexColors: true,
        map: this.createDetailTexture(chunkX, chunkZ)
      });
      
      // Create mesh
      const mesh = new THREE.Mesh(geo, material);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      mesh.position.set(chunkX * size, 0, chunkZ * size);
      
      // Create ECS entity
      const entity = this.world.add({
        transform: {
          position: new THREE.Vector3(chunkX * size, 0, chunkZ * size),
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(1, 1, 1)
        },
        terrain: {
          chunkX,
          chunkZ,
          heightData,
          geometry: geo,
          loaded: true
        },
        render: {
          mesh,
          material,
          visible: true,
          castShadow: true,
          receiveShadow: true
        }
      });
      
      perf.end();
      log.terrain('Terrain chunk generated successfully', { 
        chunkX, 
        chunkZ, 
        vertexCount: vertices.length / 3 
      });
      
      return entity;
      
    } catch (error) {
      log.error('Failed to generate terrain chunk', error, { chunkX, chunkZ });
      throw error;
    }
  }
  
  getHeightAt(worldX: number, worldZ: number): number {
    try {
      // Determine which chunk this position belongs to
      const chunkSize = 1024; // Should match WORLD_SIZE
      const chunkX = Math.floor(worldX / chunkSize);
      const chunkZ = Math.floor(worldZ / chunkSize);
      const chunkKey = `${chunkX}_${chunkZ}`;
      
      const heightData = this.heightmapCache.get(chunkKey);
      if (!heightData) {
        log.warn('No heightmap data for position', { worldX, worldZ, chunkX, chunkZ });
        return 0;
      }
      
      // Sample heightmap
      const resolution = Math.sqrt(heightData.length);
      const localX = worldX - (chunkX * chunkSize);
      const localZ = worldZ - (chunkZ * chunkSize);
      
      const hx = Math.floor((localX / chunkSize) * resolution);
      const hz = Math.floor((localZ / chunkSize) * resolution);
      const idx = Math.max(0, Math.min(resolution - 1, hz)) * resolution + Math.max(0, Math.min(resolution - 1, hx));
      
      return heightData[idx] || 0;
      
    } catch (error) {
      log.error('Error sampling terrain height', error, { worldX, worldZ });
      return 0;
    }
  }
  
  private createDetailTexture(chunkX: number, chunkZ: number): THREE.Texture {
    // Create procedural detail texture for terrain variety
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Base grass color with noise variation
    const baseHue = 120 + (this.noise.noise2D(chunkX, chunkZ) * 20);
    ctx.fillStyle = `hsl(${baseHue}, 60%, 40%)`;
    ctx.fillRect(0, 0, 512, 512);
    
    // Add detail noise
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = 1 + Math.random() * 3;
      
      ctx.fillStyle = `hsl(${baseHue + (Math.random() - 0.5) * 40}, 70%, 30%)`;
      ctx.fillRect(x, y, size, size);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    
    return texture;
  }
  
  update(deltaTime: number): void {
    // Terrain doesn't need regular updates, but could handle streaming here
  }
}

export default TerrainSystem;