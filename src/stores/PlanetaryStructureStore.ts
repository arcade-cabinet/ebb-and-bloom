/**
 * Planetary Structure Store
 * 
 * THE PLANET IS JUST LOOKUP TABLES.
 * 
 * When player digs at (x, y, z), we query:
 * - What material? (lookup table + noise)
 * - How hard? (material hardness)
 * - Can I reach it? (check layers above)
 * - What's the permeability? (fill material + depth)
 * 
 * NO SIMULATION. NO PHYSICS. JUST MATH AND TABLES.
 * 
 * It's literally:
 * "How hot/dense/gooey/sticky/wet is the core?"
 * → Build everlasting gobstopper outward
 * → Player digs at (x, y, z)
 * → Query tables
 * → Return material
 */

import { create } from 'zustand';
import { createNoise2D } from 'simplex-noise';
import seedrandom from 'seedrandom';
import type { PlanetaryManifest, FillMaterial } from '../core/generation-zero-types';

/**
 * Material entry in depth table
 */
interface MaterialEntry {
  name: string;
  category: 'stone' | 'ore' | 'crystal' | 'organic' | 'liquid';
  minDepth: number;
  maxDepth: number;
  optimalDepth: number;
  density: number;
  hardness: number;
  abundance: number;
  affinityTypes: string[];
}

/**
 * Layer entry in stratification table
 */
interface LayerEntry {
  depth: number;
  thickness: number;
  materials: string[]; // Material names
  avgDensity: number;
  permeability: number;
  temperature: number;
  pressure: number;
}

/**
 * Planetary structure state
 */
interface PlanetaryStructureState {
  // Basic info
  initialized: boolean;
  seedPhrase: string;
  planetName: string;
  
  // Core properties (the gobstopper center)
  coreTemperature: number; // 0-10 (how hot)
  corePressure: number; // 0-10 (how dense)
  coreStability: number; // 0-10 (how gooey/stable)
  coreName: string;
  
  // Fill material (what fills the gaps - wet/sticky/etc)
  fillMaterial: FillMaterial | null;
  
  // Lookup tables
  materialTable: MaterialEntry[];
  layerTable: LayerEntry[];
  
  // Noise function for spatial distribution
  noiseFunction: ReturnType<typeof createNoise2D> | null;
  
  // Actions
  initialize: (manifest: PlanetaryManifest) => void;
  getMaterialAt: (x: number, y: number, z: number) => MaterialEntry | null;
  getLayerAtDepth: (depth: number) => LayerEntry | null;
  isAccessible: (depth: number, toolHardness: number) => boolean;
  getPermeabilityAt: (x: number, y: number, z: number) => number;
}

/**
 * Planetary Structure Store
 */
export const usePlanetaryStructure = create<PlanetaryStructureState>((set, get) => ({
  // Initial state
  initialized: false,
  seedPhrase: '',
  planetName: '',
  coreTemperature: 5,
  corePressure: 5,
  coreStability: 5,
  coreName: '',
  fillMaterial: null,
  materialTable: [],
  layerTable: [],
  noiseFunction: null,
  
  /**
   * Initialize planetary structure from manifest
   */
  initialize: (manifest: PlanetaryManifest) => {
    const core = manifest.cores[0]; // Primary core
    const rng = seedrandom(manifest.seedPhrase);
    const noise2D = createNoise2D(rng);
    
    // Build material table (calculate depths using MATH)
    const materialTable: MaterialEntry[] = manifest.sharedMaterials.map(mat => {
      const density = mat.hardness;
      
      // FORMULAS for depth based on core properties
      const baseDepth = density * 5; // 0-50m
      const tempEffect = core.temperature > 7 ? (10 - density) * 2 : 0; // Hot core pushes light materials up
      const pressureEffect = core.pressure * density * 0.5; // High pressure pushes dense materials down
      const stabilityEffect = core.stability < 5 ? (5 - core.stability) * -3 : 0; // Unstable ejects upward
      
      let optimalDepth = baseDepth + tempEffect + pressureEffect + stabilityEffect;
      optimalDepth += (rng() - 0.5) * 5; // Variance
      optimalDepth = Math.max(0, Math.min(50, optimalDepth)); // Clamp
      
      return {
        name: mat.name,
        category: mat.category,
        minDepth: Math.max(0, optimalDepth - 10),
        maxDepth: Math.min(50, optimalDepth + 10),
        optimalDepth,
        density,
        hardness: mat.hardness,
        abundance: mat.rarity,
        affinityTypes: mat.affinityTypes,
      };
    });
    
    // Sort by optimal depth (deepest first)
    materialTable.sort((a, b) => b.optimalDepth - a.optimalDepth);
    
    // Build layer table (10m layers)
    const layerTable: LayerEntry[] = [];
    for (let depth = 0; depth < 50; depth += 10) {
      const materialsInLayer = materialTable.filter(m =>
        m.minDepth <= depth + 10 && m.maxDepth >= depth
      );
      
      const avgDensity = materialsInLayer.length > 0
        ? materialsInLayer.reduce((sum, m) => sum + m.density, 0) / materialsInLayer.length
        : 5;
      
      const permeability = (10 - avgDensity) * (manifest.fillMaterial.permeability / 10);
      const temperature = core.temperature * (1 - depth / 50);
      const pressure = core.pressure * (1 - depth / 50);
      
      layerTable.push({
        depth,
        thickness: 10,
        materials: materialsInLayer.map(m => m.name),
        avgDensity,
        permeability,
        temperature,
        pressure,
      });
    }
    
    set({
      initialized: true,
      seedPhrase: manifest.seedPhrase,
      planetName: manifest.planetaryName,
      coreTemperature: core.temperature,
      corePressure: core.pressure,
      coreStability: core.stability,
      coreName: core.name,
      fillMaterial: manifest.fillMaterial,
      materialTable,
      layerTable,
      noiseFunction: noise2D,
    });
    
    console.log(`🌍 Planetary structure initialized: ${manifest.planetaryName}`);
    console.log(`   Core: ${core.name} (T:${core.temperature}, P:${core.pressure}, S:${core.stability})`);
    console.log(`   Materials: ${materialTable.length}`);
    console.log(`   Layers: ${layerTable.length}`);
  },
  
  /**
   * Get material at position (x, y, z)
   * This is the MAIN QUERY - called when player digs
   */
  getMaterialAt: (x: number, y: number, z: number) => {
    const state = get();
    if (!state.initialized || !state.noiseFunction) return null;
    
    const depth = -y; // Y=0 is surface, negative Y is down
    if (depth < 0 || depth > 50) return null;
    
    // Get candidate materials at this depth
    const candidates = state.materialTable.filter(m =>
      depth >= m.minDepth && depth <= m.maxDepth
    );
    
    if (candidates.length === 0) return null;
    
    // Use noise for spatial distribution
    const noiseValue = state.noiseFunction(x * 0.1, z * 0.1);
    
    // Weight by abundance + proximity to optimal depth
    const weights = candidates.map(m => {
      const depthProximity = 1 - Math.abs(depth - m.optimalDepth) / 20;
      return depthProximity * m.abundance;
    });
    
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const threshold = (noiseValue + 1) / 2; // 0-1
    
    let accumulated = 0;
    for (let i = 0; i < candidates.length; i++) {
      accumulated += weights[i] / totalWeight;
      if (threshold <= accumulated) {
        return candidates[i];
      }
    }
    
    return candidates[0];
  },
  
  /**
   * Get layer at depth
   */
  getLayerAtDepth: (depth: number) => {
    const state = get();
    return state.layerTable.find(l =>
      depth >= l.depth && depth < l.depth + l.thickness
    ) || null;
  },
  
  /**
   * Check if material at depth is accessible
   * (Checks if player can dig through materials above)
   */
  isAccessible: (depth: number, toolHardness: number = 0) => {
    const state = get();
    
    // Sample materials above in 1m increments
    for (let d = 0; d < depth; d += 1) {
      const material = state.getMaterialAt(0, -d, 0);
      if (material && material.hardness > toolHardness) {
        return false; // Blocked by harder material
      }
    }
    
    return true;
  },
  
  /**
   * Get permeability at position
   * (How easily water/fill material flows)
   */
  getPermeabilityAt: (x: number, y: number, z: number) => {
    const state = get();
    const depth = -y;
    const layer = state.getLayerAtDepth(depth);
    
    if (!layer) return 0;
    
    // Material reduces permeability
    const material = state.getMaterialAt(x, y, z);
    const materialDensity = material?.density || 0;
    
    return layer.permeability * (1 - materialDensity / 20);
  },
}));

/**
 * Hook to get planetary info (for UI)
 */
export function usePlanetaryInfo() {
  return usePlanetaryStructure(state => ({
    planetName: state.planetName,
    coreName: state.coreName,
    coreTemperature: state.coreTemperature,
    corePressure: state.corePressure,
    coreStability: state.coreStability,
    fillMaterial: state.fillMaterial,
  }));
}

/**
 * Hook to query material at player position
 */
export function useMaterialQuery(x: number, y: number, z: number) {
  return usePlanetaryStructure(state => ({
    material: state.getMaterialAt(x, y, z),
    layer: state.getLayerAtDepth(-y),
    permeability: state.getPermeabilityAt(x, y, z),
  }));
}

/**
 * Hook to check if depth is accessible with tool
 */
export function useAccessibilityCheck(depth: number, toolHardness: number) {
  return usePlanetaryStructure(state =>
    state.isAccessible(depth, toolHardness)
  );
}
