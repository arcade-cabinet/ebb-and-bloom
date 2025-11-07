/**
 * Daggerfall-inspired Terrain System - Simple noise-based heightmaps
 * Based on Daggerfall Unity's NoiseTerrainSampler approach
 */

import * as THREE from 'three';
import FastSimplexNoise from 'fast-simplex-noise';
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

class DaggerfallTerrainSystem {
  private world: World<WorldSchema>;
  private noise: FastSimplexNoise;
  private heightmapDimension = 256;
  private maxTerrainHeight = 60;
  private scale = 1.0;
  private terrainChunks = new Map<string, Entity<WorldSchema>>();
  
  constructor(world: World<WorldSchema>) {
    this.world = world;
    this.noise = new FastSimplexNoise({ min: -1, max: 1, octaves: 4 });
    log.info('DaggerfallTerrainSystem initialized with noise-based heightmaps');
  }
  
  /**
   * Generate terrain chunk using Daggerfall Unity's approach
   */
  generateChunk(chunkX: number, chunkZ: number, size: number): Entity<WorldSchema> {
    const perf = measurePerformance(`Terrain Chunk ${chunkX},${chunkZ}`);
    const chunkKey = `${chunkX}_${chunkZ}`;
    
    log.terrain('Generating terrain chunk with Daggerfall approach', { 
      chunkX, chunkZ, size, dimension: this.heightmapDimension 
    });
    
    // Generate heightmap using Daggerfall's noise approach
    const heightmapData = this.generateHeightmapSamples(chunkX, chunkZ);
    
    // Create Three.js geometry from heightmap
    const geometry = this.createTerrainGeometry(heightmapData, size);
    
    // Apply height-based texturing (like Daggerfall Unity)
    const material = this.createHeightBasedMaterial(heightmapData);
    
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
   * Generate heightmap samples using Daggerfall Unity's noise approach
   */
  private generateHeightmapSamples(mapPixelX: number, mapPixelY: number): HeightmapData {
    const samples = new Float32Array(this.heightmapDimension * this.heightmapDimension);
    
    let averageHeight = 0;
    let maxHeight = -Infinity;
    
    for (let y = 0; y < this.heightmapDimension; y++) {
      for (let x = 0; x < this.heightmapDimension; x++) {
        // Daggerfall Unity approach: continuous noise function to avoid gaps between tiles
        const noisex = mapPixelX * (this.heightmapDimension - 1) + x;
        const noisey = mapPixelY * (this.heightmapDimension - 1) + y;
        
        // Daggerfall's GetNoise equivalent: TerrainHelper.GetNoise(x, y, 0.01f, 0.5f, 0.1f, 2)
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
   * Daggerfall Unity's TerrainHelper.GetNoise equivalent
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
      value += this.noise.get2D(x * currentFrequency, y * currentFrequency) * currentAmplitude;
      currentAmplitude *= 0.5; // Each octave has half the amplitude
      currentFrequency *= lacunarity; // Each octave has higher frequency
    }
    
    // Normalize and scale to terrain height range
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
   * Create height-based material like Daggerfall Unity
   */
  private createHeightBasedMaterial(heightmapData: HeightmapData): THREE.Material {
    // Create vertex colors based on height
    const geometry = new THREE.PlaneGeometry(1, 1, this.heightmapDimension - 1, this.heightmapDimension - 1);
    const colors: number[] = [];
    
    for (let i = 0; i < heightmapData.samples.length; i++) {
      const height = heightmapData.samples[i];
      const normalizedHeight = height / this.maxTerrainHeight;
      
      let color: THREE.Color;
      
      // Daggerfall-style height-based coloring
      if (normalizedHeight < 0.2) {
        color = new THREE.Color(0x4A90E2); // Water blue
      } else if (normalizedHeight < 0.5) {
        color = new THREE.Color(0x7ED321); // Grass green
      } else if (normalizedHeight < 0.8) {
        color = new THREE.Color(0x8B4513); // Brown hills
      } else {
        color = new THREE.Color(0xFFFFFF); // Snow peaks
      }
      
      colors.push(color.r, color.g, color.b);
    }
    
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    return new THREE.MeshLambertMaterial({ 
      vertexColors: true,
      flatShading: false
    });
  }
  
  /**
   * Get height at world position using Daggerfall approach
   */
  getHeightAt(worldX: number, worldZ: number): number {
    // Determine which chunk this position belongs to
    const chunkSize = 1024; // Standard chunk size
    const chunkX = Math.floor(worldX / chunkSize);
    const chunkZ = Math.floor(worldZ / chunkSize);
    const chunkKey = `${chunkX}_${chunkZ}`;
    
    const terrainChunk = this.terrainChunks.get(chunkKey);
    if (!terrainChunk?.terrain) {
      // Generate chunk on demand if needed
      this.generateChunk(chunkX, chunkZ, chunkSize);
      const newChunk = this.terrainChunks.get(chunkKey);
      if (!newChunk?.terrain) return 0;
      
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
    
    // Convert to heightmap coordinates
    const hx = Math.floor((localX / chunkSize) * this.heightmapDimension);
    const hz = Math.floor((localZ / chunkSize) * this.heightmapDimension);
    
    // Bounds checking
    const clampedHx = Math.max(0, Math.min(this.heightmapDimension - 1, hx));
    const clampedHz = Math.max(0, Math.min(this.heightmapDimension - 1, hz));
    
    const index = clampedHz * this.heightmapDimension + clampedHx;
    return heightData[index] || 0;
  }
  
  update(deltaTime: number): void {
    // Terrain system doesn't need regular updates
    // Could handle streaming world here (loading/unloading distant chunks)
  }
  
  // Analysis methods
  getTerrainAnalysis(): {
    totalChunks: number;
    averageHeight: number;
    maxHeight: number;
    heightVariation: number;
  } {
    let totalAverage = 0;
    let globalMax = 0;
    let chunkCount = 0;
    
    for (const chunk of this.terrainChunks.values()) {
      if (chunk.terrain) {
        // Would calculate actual averages from heightData
        chunkCount++;
      }
    }
    
    return {
      totalChunks: this.terrainChunks.size,
      averageHeight: totalAverage / Math.max(1, chunkCount),
      maxHeight: globalMax,
      heightVariation: 0 // Would calculate actual variation
    };
  }
}

export default DaggerfallTerrainSystem;
export type { HeightmapData };