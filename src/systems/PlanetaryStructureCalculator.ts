/**
 * Planetary Structure Calculator
 * 
 * PURE MATH - No physics simulation needed.
 * 
 * The planet is a DATA STRUCTURE:
 * - Depth tables: material → final depth
 * - Density layers: depth → material density
 * - Permeability zones: depth → permeability factor
 * - Affinity maps: (x, z) → material probability
 * 
 * We CALCULATE planetary structure using:
 * 1. Core properties (temperature, pressure, stability)
 * 2. Material properties (density, affinity, cohesion)
 * 3. Mathematical stratification (heavy sinks, light rises)
 * 4. Permeability distribution (fill material flow)
 * 
 * Result: Queryable planetary structure in milliseconds.
 * No rendering until surface queries.
 */

import seedrandom from 'seedrandom';
import { createNoise2D } from 'simplex-noise';
import type { 
  PlanetaryManifest,
  PlanetaryCore,
  SharedMaterial,
  CoreSpecificMaterial,
  FillMaterial 
} from '../core/generation-zero-types';
import { log } from '../utils/Logger';

/**
 * Material stratification entry
 */
interface StratifiedMaterial {
  name: string;
  category: 'stone' | 'ore' | 'crystal' | 'organic' | 'liquid';
  
  // Calculated depth (emergent from physics principles)
  minDepth: number; // meters
  maxDepth: number; // meters
  optimalDepth: number; // Most abundant here
  
  // Physical properties
  density: number; // 0-10
  hardness: number; // 0-10
  cohesion: number; // 0-10 (clustering factor)
  
  // Distribution
  abundance: number; // 0-1 (how common in its layer)
  clusterSize: number; // meters (how large deposits are)
  
  // Affinity (what it clusters with)
  affinityTypes: string[];
}

/**
 * Planetary layer
 */
interface PlanetaryLayer {
  depth: number; // Starting depth in meters
  thickness: number; // meters
  dominantMaterials: string[]; // Most common materials
  density: number; // Average density
  permeability: number; // 0-10 (how easily things pass through)
  temperature: number; // 0-10 (heat from core)
  pressure: number; // 0-10 (compression)
}

/**
 * Complete planetary structure (pure data)
 */
export class PlanetaryStructure {
  // Core data
  seedPhrase: string;
  planetName: string;
  coreName: string;
  coreRadius: number = 5; // meters
  coreTemperature: number; // 0-10
  corePressure: number; // 0-10
  coreStability: number; // 0-10
  
  // Stratification
  layers: PlanetaryLayer[] = [];
  materials: StratifiedMaterial[] = [];
  
  // Fill material (occupies gaps)
  fillMaterial: FillMaterial;
  
  // Spatial distribution (noise-based)
  private noise2D: ReturnType<typeof createNoise2D>;
  private rng: seedrandom.PRNG;
  
  constructor(manifest: PlanetaryManifest) {
    this.seedPhrase = manifest.seedPhrase;
    this.planetName = manifest.planetaryName;
    this.coreName = manifest.cores[0].name;
    this.coreTemperature = manifest.cores[0].temperature;
    this.corePressure = manifest.cores[0].pressure;
    this.coreStability = manifest.cores[0].stability;
    this.fillMaterial = manifest.fillMaterial;
    
    this.rng = seedrandom(manifest.seedPhrase);
    this.noise2D = createNoise2D(this.rng);
    
    // CALCULATE planetary structure
    this.calculateStratification(manifest);
    this.calculateLayers();
    
    log.info('Planetary structure calculated', {
      planet: this.planetName,
      layers: this.layers.length,
      materials: this.materials.length,
    });
  }
  
  /**
   * Calculate material stratification using MATH
   */
  private calculateStratification(manifest: PlanetaryManifest): void {
    const allMaterials = [
      ...manifest.sharedMaterials,
      // Add core-specific materials (flattened)
      //...manifest.coreManifests.flatMap(cm => cm.materials),
    ];
    
    // For each material, CALCULATE its final depth based on:
    // 1. Density (heavy sinks)
    // 2. Core temperature (heat-resistant stays near core)
    // 3. Core pressure (pressure-resistant goes deep)
    // 4. Core stability (unstable cores eject materials)
    
    this.materials = allMaterials.map(mat => {
      const density = mat.hardness; // Use hardness as density proxy
      
      // FORMULA: Material depth based on planetary physics
      const depthFromDensity = density * 5; // 0-50m range
      const depthFromTemperature = this.calculateTemperatureEffect(mat.name, density);
      const depthFromPressure = this.calculatePressureEffect(density);
      const depthFromStability = this.calculateStabilityEffect(density);
      
      // Combine factors
      let optimalDepth = (
        depthFromDensity * 0.4 +
        depthFromTemperature * 0.3 +
        depthFromPressure * 0.2 +
        depthFromStability * 0.1
      );
      
      // Add variance based on seed
      optimalDepth += (this.rng() - 0.5) * 5;
      
      // Depth range (materials spread across depths)
      const minDepth = Math.max(0, optimalDepth - 10);
      const maxDepth = Math.min(50, optimalDepth + 10);
      
      return {
        name: mat.name,
        category: mat.category,
        minDepth,
        maxDepth,
        optimalDepth,
        density,
        hardness: mat.hardness,
        cohesion: density, // Higher density = stronger cohesion
        abundance: mat.rarity,
        clusterSize: 2 + this.rng() * 3, // 2-5m clusters
        affinityTypes: mat.affinityTypes,
      };
    });
    
    // Sort by optimal depth (deepest first)
    this.materials.sort((a, b) => b.optimalDepth - a.optimalDepth);
  }
  
  /**
   * Calculate temperature effect on depth
   */
  private calculateTemperatureEffect(materialName: string, density: number): number {
    // Heat-resistant materials (metals, crystals) can stay near hot core
    const heatResistant = materialName.toLowerCase().includes('iron') || 
                         materialName.toLowerCase().includes('crystal');
    
    if (heatResistant) {
      return this.coreTemperature * 5; // Deeper in hot cores
    } else {
      return (10 - this.coreTemperature) * 5; // Pushed away from hot cores
    }
  }
  
  /**
   * Calculate pressure effect on depth
   */
  private calculatePressureEffect(density: number): number {
    // High pressure compresses materials deeper
    return this.corePressure * density * 0.5;
  }
  
  /**
   * Calculate stability effect on depth
   */
  private calculateStabilityEffect(density: number): number {
    // Unstable cores eject dense materials upward
    if (this.coreStability < 5) {
      return (10 - this.coreStability) * -2; // Negative = pushed toward surface
    }
    return 0;
  }
  
  /**
   * Calculate planetary layers
   */
  private calculateLayers(): void {
    const layerThickness = 10; // meters per layer
    const maxDepth = 50; // meters
    const numLayers = Math.ceil(maxDepth / layerThickness);
    
    for (let i = 0; i < numLayers; i++) {
      const depth = i * layerThickness;
      
      // Find materials in this layer
      const layerMaterials = this.materials.filter(m => 
        m.minDepth <= depth + layerThickness && m.maxDepth >= depth
      );
      
      // Calculate average density
      const avgDensity = layerMaterials.length > 0
        ? layerMaterials.reduce((sum, m) => sum + m.density, 0) / layerMaterials.length
        : 5;
      
      // Calculate permeability (inverse of density + fill material permeability)
      const permeability = (10 - avgDensity) * (this.fillMaterial.permeability / 10);
      
      // Temperature decreases with distance from core
      const temperature = this.coreTemperature * (1 - depth / maxDepth);
      
      // Pressure decreases with distance from core
      const pressure = this.corePressure * (1 - depth / maxDepth);
      
      this.layers.push({
        depth,
        thickness: layerThickness,
        dominantMaterials: layerMaterials.map(m => m.name),
        density: avgDensity,
        permeability,
        temperature,
        pressure,
      });
    }
  }
  
  /**
   * Query: What material is at position (x, y, z)?
   */
  getMaterialAt(x: number, y: number, z: number): StratifiedMaterial | null {
    const depth = -y; // Y=0 is surface, negative Y is underground
    
    if (depth < 0 || depth > 50) return null;
    
    // Get materials at this depth
    const candidateMaterials = this.materials.filter(m => 
      depth >= m.minDepth && depth <= m.maxDepth
    );
    
    if (candidateMaterials.length === 0) return null;
    
    // Use noise to determine which material (spatial distribution)
    const noiseValue = this.noise2D(x * 0.1, z * 0.1);
    
    // Weight by abundance and proximity to optimal depth
    const weights = candidateMaterials.map(m => {
      const depthFactor = 1 - Math.abs(depth - m.optimalDepth) / 20; // Closer = higher
      const abundanceFactor = m.abundance;
      return depthFactor * abundanceFactor;
    });
    
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const normalized = weights.map(w => w / totalWeight);
    
    // Select material based on noise + weights
    let accumulated = 0;
    const threshold = (noiseValue + 1) / 2; // Normalize to 0-1
    
    for (let i = 0; i < candidateMaterials.length; i++) {
      accumulated += normalized[i];
      if (threshold <= accumulated) {
        return candidateMaterials[i];
      }
    }
    
    return candidateMaterials[0];
  }
  
  /**
   * Query: What is the permeability at depth?
   */
  getPermeabilityAtDepth(depth: number): number {
    const layer = this.getLayerAtDepth(depth);
    return layer?.permeability || 0;
  }
  
  /**
   * Query: What layer is at depth?
   */
  getLayerAtDepth(depth: number): PlanetaryLayer | null {
    return this.layers.find(l => 
      depth >= l.depth && depth < l.depth + l.thickness
    ) || null;
  }
  
  /**
   * Query: Is material accessible at depth?
   * (Based on materials above it)
   */
  isAccessible(depth: number, toolHardness: number = 0): boolean {
    // Check all layers above
    for (let d = 0; d < depth; d += 1) {
      const material = this.getMaterialAt(0, -d, 0); // Sample center
      if (material && material.hardness > toolHardness) {
        return false; // Blocked by harder material
      }
    }
    return true;
  }
  
  /**
   * Query: Get all materials at depth range
   */
  getMaterialsInDepthRange(minDepth: number, maxDepth: number): StratifiedMaterial[] {
    return this.materials.filter(m => 
      m.maxDepth >= minDepth && m.minDepth <= maxDepth
    );
  }
  
  /**
   * Query: Get surface materials (depth < 5m)
   */
  getSurfaceMaterials(): StratifiedMaterial[] {
    return this.getMaterialsInDepthRange(0, 5);
  }
  
  /**
   * Debug: Print planetary structure
   */
  printStructure(): void {
    log.info('=== PLANETARY STRUCTURE ===');
    log.info(`Planet: ${this.planetName}`);
    log.info(`Core: ${this.coreName} (T:${this.coreTemperature}, P:${this.corePressure}, S:${this.coreStability})`);
    log.info(`Fill: ${this.fillMaterial.name} (permeability: ${this.fillMaterial.permeability})`);
    log.info('\nLayers:');
    
    this.layers.forEach((layer, i) => {
      log.info(`  ${i + 1}. ${layer.depth}-${layer.depth + layer.thickness}m: ` +
        `density=${layer.density.toFixed(1)}, perm=${layer.permeability.toFixed(1)}, ` +
        `materials=[${layer.dominantMaterials.slice(0, 3).join(', ')}]`);
    });
    
    log.info('\nMaterials (by depth):');
    this.materials.forEach(m => {
      log.info(`  ${m.name}: ${m.minDepth.toFixed(1)}-${m.maxDepth.toFixed(1)}m ` +
        `(optimal: ${m.optimalDepth.toFixed(1)}m, density: ${m.density})`);
    });
  }
}

/**
 * Calculate planetary structure from manifest (PURE MATH)
 */
export function calculatePlanetaryStructure(manifest: PlanetaryManifest): PlanetaryStructure {
  const startTime = Date.now();
  const structure = new PlanetaryStructure(manifest);
  const elapsed = Date.now() - startTime;
  
  log.info(`Planetary structure calculated in ${elapsed}ms (PURE MATH)`);
  
  return structure;
}
