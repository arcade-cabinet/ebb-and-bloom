/**
 * BIOME SYSTEM
 * 
 * Uses PlanetaryLaws and SimplexNoise to determine biome types.
 * Biomes are based on:
 * - Temperature (latitude-like, using noise)
 * - Moisture (rainfall, using different noise octave)
 * - Altitude (from terrain height)
 * 
 * Inspired by Minecraft's biome system and real-world climate zones.
 */

import * as THREE from 'three';
import { SimplexNoise } from './SimplexNoise';

export enum BiomeType {
  OCEAN = 'ocean',
  BEACH = 'beach',
  DESERT = 'desert',
  GRASSLAND = 'grassland',
  FOREST = 'forest',
  RAINFOREST = 'rainforest',
  SAVANNA = 'savanna',
  TAIGA = 'taiga',
  TUNDRA = 'tundra',
  SNOW = 'snow',
  MOUNTAIN = 'mountain'
}

export interface BiomeData {
  type: BiomeType;
  color: THREE.Color;
  roughness: number;
  temperature: number; // 0-1 (cold to hot)
  moisture: number;    // 0-1 (dry to wet)
}

export class BiomeSystem {
  private temperatureNoise: SimplexNoise;
  private moistureNoise: SimplexNoise;

  // Biome colors (SUPER VIBRANT - like a painted map)
  private static readonly BIOME_COLORS: Record<BiomeType, number> = {
    [BiomeType.OCEAN]: 0x0066FF,        // Bright ocean blue
    [BiomeType.BEACH]: 0xFFEE99,        // Bright sand
    [BiomeType.DESERT]: 0xFFCC66,       // Bright desert
    [BiomeType.GRASSLAND]: 0x44DD44,    // BRIGHT grass green
    [BiomeType.FOREST]: 0x228822,       // Forest green
    [BiomeType.RAINFOREST]: 0x115511,   // Dark jungle
    [BiomeType.SAVANNA]: 0xDDCC66,      // Golden savanna
    [BiomeType.TAIGA]: 0x336633,        // Pine green
    [BiomeType.TUNDRA]: 0x99BB99,       // Tundra green
    [BiomeType.SNOW]: 0xFFFFFF,         // Pure white
    [BiomeType.MOUNTAIN]: 0x999999      // Mountain gray
  };

  constructor(seed: string) {
    // Use different noise for temperature and moisture
    // (offset the seed so they're independent)
    this.temperatureNoise = new SimplexNoise(`${seed}-temp`);
    this.moistureNoise = new SimplexNoise(`${seed}-moisture`);
  }

  /**
   * Get biome at world coordinates
   */
  getBiome(x: number, z: number, altitude: number): BiomeData {
    // Temperature: Decreases with altitude and varies with noise
    // Scale: 0.005 = large temperature zones
    const tempNoise = this.temperatureNoise.octaveNoise(x, z, 3, 0.5, 2.0, 0.005);
    const baseTemp = (tempNoise + 1) / 2; // Map [-1,1] to [0,1]
    const altitudePenalty = Math.max(0, altitude / 50); // Colder at high altitude
    const temperature = Math.max(0, Math.min(1, baseTemp - altitudePenalty));

    // Moisture: Independent noise pattern
    // Scale: 0.007 = slightly smaller moisture zones
    const moistNoise = this.moistureNoise.octaveNoise(x, z, 3, 0.5, 2.0, 0.007);
    const moisture = (moistNoise + 1) / 2; // Map [-1,1] to [0,1]

    // Determine biome type based on temperature, moisture, and altitude
    const type = this.determineBiomeType(temperature, moisture, altitude);

    // Get color and properties
    const color = new THREE.Color(BiomeSystem.BIOME_COLORS[type]);
    const roughness = this.getBiomeRoughness(type);

    return {
      type,
      color,
      roughness,
      temperature,
      moisture
    };
  }

  /**
   * Determine biome type using temperature/moisture/altitude
   * Based on Whittaker biome diagram
   */
  private determineBiomeType(temperature: number, moisture: number, altitude: number): BiomeType {
    // Ocean/Beach (low altitude)
    if (altitude < 3) {
      return BiomeType.OCEAN;
    }
    if (altitude < 8) {
      return BiomeType.BEACH;
    }

    // Mountains (MUCH higher altitude - was too low at 20)
    if (altitude > 30) {
      if (temperature < 0.3) {
        return BiomeType.SNOW;
      }
      return BiomeType.MOUNTAIN;
    }

    // Cold biomes (low temperature)
    if (temperature < 0.2) {
      return BiomeType.SNOW;
    }
    if (temperature < 0.4) {
      if (moisture < 0.3) {
        return BiomeType.TUNDRA;
      }
      return BiomeType.TAIGA;
    }

    // Temperate biomes (mid temperature)
    if (temperature < 0.7) {
      if (moisture < 0.3) {
        return BiomeType.GRASSLAND;
      }
      if (moisture < 0.6) {
        return BiomeType.FOREST;
      }
      return BiomeType.RAINFOREST; // Temperate rainforest
    }

    // Hot biomes (high temperature)
    if (moisture < 0.2) {
      return BiomeType.DESERT;
    }
    if (moisture < 0.5) {
      return BiomeType.SAVANNA;
    }
    return BiomeType.RAINFOREST;
  }

  /**
   * Get terrain roughness for biome
   * Used for material shading
   */
  private getBiomeRoughness(type: BiomeType): number {
    switch (type) {
      case BiomeType.OCEAN:
      case BiomeType.BEACH:
        return 0.3; // Smooth water/sand
      case BiomeType.DESERT:
        return 0.7; // Sandy
      case BiomeType.SNOW:
        return 0.2; // Smooth snow
      case BiomeType.GRASSLAND:
      case BiomeType.SAVANNA:
        return 0.8; // Rough grass
      case BiomeType.FOREST:
      case BiomeType.RAINFOREST:
      case BiomeType.TAIGA:
        return 0.9; // Rough vegetation
      case BiomeType.TUNDRA:
        return 0.7; // Rocky
      case BiomeType.MOUNTAIN:
        return 1.0; // Very rough rock
      default:
        return 0.8;
    }
  }

  /**
   * Blend between biome colors for smooth transitions
   */
  blendBiomeColors(x: number, z: number, altitude: number, blendRadius: number = 5): THREE.Color {
    // Sample 4 points around the position (symmetric pattern)
    const samples = [
      this.getBiome(x, z, altitude),                    // Center
      this.getBiome(x + blendRadius, z, altitude),       // Right
      this.getBiome(x, z + blendRadius, altitude),       // Forward
      this.getBiome(x + blendRadius, z + blendRadius, altitude) // Forward-right
    ];

    // Average the colors
    let r = 0, g = 0, b = 0;
    for (const sample of samples) {
      r += sample.color.r;
      g += sample.color.g;
      b += sample.color.b;
    }

    return new THREE.Color(r / 4, g / 4, b / 4);
  }
}

