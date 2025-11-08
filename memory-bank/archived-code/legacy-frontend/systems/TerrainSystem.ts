/**
 * Terrain System - FBM-based heightmap generation using SimplexNoise
 * 
 * Generates procedural terrain using Fractal Brownian Motion (FBM) with:
 * - Continuous noise functions to avoid gaps between terrain chunks
 * - Proper amplitude normalization for mathematically correct results
 * - Configurable frequency, amplitude, persistence, and octaves
 */

import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
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
  private noise: ReturnType<typeof createNoise2D>;
  private heightmapDimension = 256;
  private maxTerrainHeight = 60;
  private scale = 1.0;
  private terrainChunks = new Map<string, Entity<WorldSchema>>();
  
  // FBM (Fractal Brownian Motion) parameters for terrain generation
  private readonly fbmConfig = {
    frequency: 0.01,      // Base frequency (wavelength = 1/frequency)
    amplitude: 0.5,       // Base amplitude
    lacunarity: 2.0,      // Frequency multiplier per octave
    persistence: 0.1,     // Amplitude decay per octave (lower = smoother terrain)
    octaves: 4            // Number of noise layers (more = more detail)
  };
  
  constructor(world: World<WorldSchema>) {
    this.world = world;
    this.noise = createNoise2D();
    log.info('TerrainSystem initialized with FBM-based heightmaps', {
      fbmConfig: this.fbmConfig
    });
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
        
        // Multi-octave FBM noise for realistic terrain
        const height = this.getTerrainNoise(
          noisex, 
          noisey,
          this.fbmConfig.frequency,
          this.fbmConfig.amplitude,
          this.fbmConfig.lacunarity,
          this.fbmConfig.persistence,
          this.fbmConfig.octaves
        ) * this.scale;
        
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
   * Fractal Brownian Motion (FBM) - Multi-octave noise generation
   * 
   * Implements proper FBM following best practices:
   * - Multiple octaves at different frequencies
   * - Proper amplitude normalization to keep result in predictable range
   * - Configurable persistence (amplitude decay) and lacunarity (frequency scaling)
   * 
   * @param x - X coordinate in world space
   * @param y - Y coordinate in world space
   * @param frequency - Base frequency (wavelength = 1/frequency)
   * @param amplitude - Base amplitude
   * @param lacunarity - Frequency multiplier per octave (typically 2.0)
   * @param persistence - Amplitude decay per octave (typically 0.5)
   * @param octaves - Number of noise layers to combine
   * @returns Height value normalized to [0, maxTerrainHeight]
   */
  private getTerrainNoise(
    x: number, 
    y: number, 
    frequency: number, 
    amplitude: number, 
    lacunarity: number,
    persistence: number,
    octaves: number
  ): number {
    
    let value = 0;
    let currentAmplitude = amplitude;
    let currentFrequency = frequency;
    let amplitudeSum = 0; // Track sum of amplitudes for normalization
    
    // Generate multiple octaves of noise
    for (let i = 0; i < octaves; i++) {
      // SimplexNoise returns values in range [-1, 1]
      const noiseValue = this.noise(x * currentFrequency, y * currentFrequency);
      value += noiseValue * currentAmplitude;
      amplitudeSum += currentAmplitude;
      
      // Scale frequency and amplitude for next octave
      currentFrequency *= lacunarity;
      currentAmplitude *= persistence;
    }
    
    // Normalize by sum of amplitudes to keep result in predictable range
    // This prevents the sum from exceeding the expected range
    const normalizedValue = amplitudeSum > 0 ? value / amplitudeSum : 0;
    
    // Convert from [-1, 1] range to [0, 1] then scale to terrain height
    // Normalized value is already in a predictable range due to normalization
    const heightValue = (normalizedValue + 1) * 0.5;
    
    return heightValue * this.maxTerrainHeight;
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