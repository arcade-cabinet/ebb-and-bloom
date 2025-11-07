/**
 * Terrain System - Noise-based heightmaps inspired by Daggerfall Unity
 * Simple, working terrain generation without broken dependencies
 */

import * as THREE from 'three';
import { SimplexNoise } from 'simplex-noise';
import { log, measurePerformance } from '../utils/Logger';
import type { World, Entity } from 'miniplex';
import type { WorldSchema, TerrainChunk, Transform, RenderData } from '../world/ECSWorld';

interface HeightmapData {
  samples: Float32Array;
  dimension: number;
  averageHeight: number;
  maxHeight: number;
  scale: number;
}

class TerrainSystem {
  private world: World<WorldSchema>;
  private noise: SimplexNoise;
  private heightmapDimension = 256;
  private maxTerrainHeight = 60;
  private scale = 1.0;
  private terrainChunks = new Map<string, Entity<WorldSchema>>();
  
  constructor(world: World<WorldSchema>) {
    this.world = world;
    this.noise = new SimplexNoise();
    log.info('TerrainSystem initialized with noise-based heightmaps');
  }
  
  /**
   * Generate terrain chunk using noise-based approach
   */
  generateChunk(chunkX: number, chunkZ: number, size: number): Entity<WorldSchema> {
    const perf = measurePerformance(`Terrain Chunk ${chunkX},${chunkZ}`);
    const chunkKey = `${chunkX}_${chunkZ}`;
    
    log.terrain('Generating terrain chunk', { 
      chunkX, chunkZ, size, dimension: this.heightmapDimension 
    });
    
    // Generate heightmap using noise
    const heightmapData = this.generateHeightmapSamples(chunkX, chunkZ);
    
    // Create Three.js geometry from heightmap
    const geometry = this.createTerrainGeometry(heightmapData, size);
    
    // Apply basic material
    const material = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(chunkX * size, 0, chunkZ * size);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    
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
        heightData: heightmapData.samples,
        geometry,
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
    
    this.terrainChunks.set(chunkKey, entity);
    
    perf.end();
    
    log.terrain('Terrain chunk generated successfully', {
      chunkX, chunkZ,
      averageHeight: heightmapData.averageHeight.toFixed(2),
      maxHeight: heightmapData.maxHeight.toFixed(2),
      vertices: geometry.attributes.position.count
    });
    
    return entity;
  }
  
  /**
   * Generate heightmap samples using multi-octave noise
   */
  private generateHeightmapSamples(mapPixelX: number, mapPixelY: number): HeightmapData {
    const samples = new Float32Array(this.heightmapDimension * this.heightmapDimension);
    
    let averageHeight = 0;
    let maxHeight = -Infinity;
    
    for (let y = 0; y < this.heightmapDimension; y++) {
      for (let x = 0; x < this.heightmapDimension; x++) {
        // Continuous noise function to avoid gaps between tiles
        const noisex = mapPixelX * (this.heightmapDimension - 1) + x;
        const noisey = mapPixelY * (this.heightmapDimension - 1) + y;
        
        // Multi-octave noise for realistic terrain
        const height = this.getTerrainNoise(noisex, noisey, 0.01, 0.5, 0.1, 2) * this.scale;
        
        samples[y * this.heightmapDimension + x] = height;
        
        // Track statistics
        averageHeight += height;
        if (height > maxHeight) {
          maxHeight = height;
        }
      }
    }
    
    averageHeight /= this.heightmapDimension * this.heightmapDimension;
    
    return {
      samples,
      dimension: this.heightmapDimension,
      averageHeight,
      maxHeight,
      scale: this.scale
    };
  }
  
  /**
   * Multi-octave noise generation
   */
  private getTerrainNoise(
    x: number, 
    y: number, 
    frequency: number, 
    amplitude: number, 
    lacunarity: number, 
    octaves: number
  ): number {
    
    let value = 0;
    let currentAmplitude = amplitude;
    let currentFrequency = frequency;
    
    for (let i = 0; i < octaves; i++) {
      value += this.noise.noise2D(x * currentFrequency, y * currentFrequency) * currentAmplitude;
      currentAmplitude *= 0.5;
      currentFrequency *= lacunarity;
    }
    
    return (value + 1) * 0.5 * this.maxTerrainHeight;
  }
  
  /**
   * Create Three.js geometry from heightmap data
   */
  private createTerrainGeometry(heightmapData: HeightmapData, size: number): THREE.BufferGeometry {
    const geometry = new THREE.PlaneGeometry(
      size, 
      size, 
      this.heightmapDimension - 1, 
      this.heightmapDimension - 1
    );
    
    geometry.rotateX(-Math.PI / 2);
    
    // Apply height data to vertices
    const vertices = geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < vertices.length; i += 3) {
      const vertexIndex = Math.floor(i / 3);
      const height = heightmapData.samples[vertexIndex] || 0;
      vertices[i + 1] = height; // Y coordinate
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    return geometry;
  }
  
  /**
   * Get height at world position
   */
  getHeightAt(worldX: number, worldZ: number): number {
    const chunkSize = 1024;
    const chunkX = Math.floor(worldX / chunkSize);
    const chunkZ = Math.floor(worldZ / chunkSize);
    const chunkKey = `${chunkX}_${chunkZ}`;
    
    const terrainChunk = this.terrainChunks.get(chunkKey);
    if (!terrainChunk?.terrain) {
      // Generate chunk on demand
      this.generateChunk(chunkX, chunkZ, chunkSize);
      const newChunk = this.terrainChunks.get(chunkKey);
      if (!newChunk?.terrain) return 15; // Default height
      
      return this.sampleHeightFromChunk(newChunk.terrain.heightData, worldX, worldZ, chunkX, chunkZ);
    }
    
    return this.sampleHeightFromChunk(terrainChunk.terrain.heightData, worldX, worldZ, chunkX, chunkZ);
  }
  
  private sampleHeightFromChunk(
    heightData: Float32Array,
    worldX: number, 
    worldZ: number,
    chunkX: number,
    chunkZ: number
  ): number {
    
    const chunkSize = 1024;
    const localX = worldX - (chunkX * chunkSize);
    const localZ = worldZ - (chunkZ * chunkSize);
    
    const hx = Math.floor((localX / chunkSize) * this.heightmapDimension);
    const hz = Math.floor((localZ / chunkSize) * this.heightmapDimension);
    
    const clampedHx = Math.max(0, Math.min(this.heightmapDimension - 1, hx));
    const clampedHz = Math.max(0, Math.min(this.heightmapDimension - 1, hz));
    
    const index = clampedHz * this.heightmapDimension + clampedHx;
    return heightData[index] || 15;
  }
  
  update(deltaTime: number): void {
    // Terrain doesn't need regular updates
  }
}

export default TerrainSystem;