/**
 * GEN DATA LOADER - Cross-platform archetype loading
 * Uses Capacitor Filesystem for web/iOS/Android compatibility
 */

import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import seedrandom from 'seedrandom';
import { extractSeedComponents as extractSeedComponentsFromManager } from '../seed/seed-manager.js';
import type { GenerationScale } from '@ebb/gen/schemas';

/**
 * Type definitions from gen schemas (DRY - single source of truth)
 */
type GenerationData = GenerationScale;

/**
 * Load generation data from JSON files using Capacitor
 * Works on web (fetch), iOS (native filesystem), Android (native filesystem)
 */
async function loadGenerationData(gen: string): Promise<{ macro: GenerationData; meso: GenerationData; micro: GenerationData }> {
  try {
    // Check if running in test environment (Node.js)
    const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
    
    if (isTest) {
      // Test environment: Use dynamic import with Node.js fs
      const { promises: fs } = await import('fs');
      const { join } = await import('path');
      const genPath = join(process.cwd(), 'data/archetypes', gen);
      
      const [macro, meso, micro] = await Promise.all([
        fs.readFile(join(genPath, 'macro.json'), 'utf8').then(JSON.parse) as Promise<GenerationData>,
        fs.readFile(join(genPath, 'meso.json'), 'utf8').then(JSON.parse) as Promise<GenerationData>,
        fs.readFile(join(genPath, 'micro.json'), 'utf8').then(JSON.parse) as Promise<GenerationData>,
      ]);

      return { macro, meso, micro };
    }
    // On web, use fetch from public directory
    // On native, files are bundled in app
    else if (Capacitor.getPlatform() === 'web') {
      // Browser: fetch from public/data/archetypes
      const baseUrl = `/data/archetypes/${gen}`;
      const [macroRes, mesoRes, microRes] = await Promise.all([
        fetch(`${baseUrl}/macro.json`),
        fetch(`${baseUrl}/meso.json`),
        fetch(`${baseUrl}/micro.json`),
      ]);

      if (!macroRes.ok || !mesoRes.ok || !microRes.ok) {
        throw new Error(`Failed to fetch ${gen} data from server`);
      }

      const [macro, meso, micro] = await Promise.all([
        macroRes.json() as Promise<GenerationData>,
        mesoRes.json() as Promise<GenerationData>,
        microRes.json() as Promise<GenerationData>,
      ]);

      return { macro, meso, micro };
    } else {
      // iOS/Android: Use Capacitor Filesystem to read bundled assets
      const basePath = `data/archetypes/${gen}`;
      
      const [macroFile, mesoFile, microFile] = await Promise.all([
        Filesystem.readFile({
          path: `${basePath}/macro.json`,
          directory: Directory.Data,
        }),
        Filesystem.readFile({
          path: `${basePath}/meso.json`,
          directory: Directory.Data,
        }),
        Filesystem.readFile({
          path: `${basePath}/micro.json`,
          directory: Directory.Data,
        }),
      ]);

      const macro = JSON.parse(macroFile.data as string) as GenerationData;
      const meso = JSON.parse(mesoFile.data as string) as GenerationData;
      const micro = JSON.parse(microFile.data as string) as GenerationData;

      return { macro, meso, micro };
    }
  } catch (error: any) {
    console.error(`Failed to load ${gen} data:`, error);
    throw new Error(`Failed to load ${gen} data: ${error.message}`);
  }
}

/**
 * Extract seed components for deterministic selection
 * Uses seed manager for consistency
 */
export function extractSeedComponents(seed: string): { macro: number; meso: number; micro: number } {
  // Use seed manager for consistency, but fallback to direct seedrandom if needed
  try {
    return extractSeedComponentsFromManager(seed);
  } catch {
    // Fallback for non-standard seeds
    const rng = seedrandom(seed);
    return {
      macro: rng(),
      meso: rng(),
      micro: rng(),
    };
  }
}

/**
 * Select from pool deterministically (simple version - equal weights)
 */
export function selectFromPool<T>(options: T[], seedComponent: number): T {
  const index = Math.floor(seedComponent * options.length);
  return options[index];
}

/**
 * Select from pool with BIASED selection (weighted by archetype selectionBias)
 * Supports seed-based probability modification
 */
export function selectFromPoolBiased<T extends { selectionBias?: { baseWeight?: number; seedModifiers?: Record<string, number> } }>(
  options: T[],
  seedComponent: number,
  seedContext?: Record<string, any> // Context for seed modifiers (e.g., { metallicity: 'high' })
): T {
  // Calculate weights for each option
  const weights = options.map((option, index) => {
    let weight = option.selectionBias?.baseWeight ?? (1.0 / options.length);
    
    // Apply seed modifiers if context provided
    if (seedContext && option.selectionBias?.seedModifiers) {
      for (const [key, modifier] of Object.entries(option.selectionBias.seedModifiers)) {
        if (seedContext[key]) {
          weight *= modifier;
        }
      }
    }
    
    return { option, weight, index };
  });
  
  // Normalize weights
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  const normalizedWeights = weights.map(w => ({ ...w, weight: w.weight / totalWeight }));
  
  // Cumulative distribution for weighted selection
  let cumulative = 0;
  const cumulativeWeights = normalizedWeights.map(w => {
    cumulative += w.weight;
    return { ...w, cumulative };
  });
  
  // Select based on seed component
  for (const w of cumulativeWeights) {
    if (seedComponent <= w.cumulative) {
      return w.option;
    }
  }
  
  // Fallback (should never reach here, but just in case)
  return options[options.length - 1];
}

/**
 * Generate Gen0 data pools (macro/meso/micro scales)
 */
export async function generateGen0DataPools(baseSeed: string, _context?: any): Promise<{
  macro: { selectedContext: string; selectedDistribution: string; archetypeId: string; archetypeOptions: any[] };
  meso: { selectedLocation: string; archetypeId: string; archetypeOptions: any[] };
  micro: { selectedDistribution: string; visualBlueprint: any; archetypeId: string };
}> {
  const gen0Data = await loadGenerationData('gen0');
  const { macro: macroSeed, meso: mesoSeed, micro: microSeed } = extractSeedComponents(baseSeed);

  // Macro: Stellar context
  const macroArchetype = selectFromPool(gen0Data.macro.archetypes, macroSeed);
  
  // Meso: Geological structure
  const mesoArchetype = selectFromPool(gen0Data.meso.archetypes, mesoSeed);
  
  // Micro: Element distribution
  const microArchetype = selectFromPool(gen0Data.micro.archetypes, microSeed);

  return {
    macro: {
      selectedContext: (macroArchetype as any).context || macroArchetype.name,
      selectedDistribution: (macroArchetype as any).characteristics?.distribution || 'balanced',
      archetypeId: macroArchetype.id,
      archetypeOptions: gen0Data.macro.archetypes,
    },
    meso: {
      selectedLocation: (mesoArchetype as any).location || mesoArchetype.name,
      archetypeId: mesoArchetype.id,
      archetypeOptions: gen0Data.meso.archetypes,
    },
    micro: {
      selectedDistribution: (microArchetype as any).distribution || microArchetype.name,
      visualBlueprint: (microArchetype as any).visualBlueprint || {},
      archetypeId: microArchetype.id,
    },
  };
}

/**
 * Generate Gen1 data pools (creature archetypes)
 */
export async function generateGen1DataPools(_baseSeed: string, _planet?: any, _gen0Data?: any): Promise<{
  macro: { archetypeOptions: any[] };
  meso: { archetypeOptions: any[] };
  micro: { archetypeOptions: any[] };
}> {
  const gen1Data = await loadGenerationData('gen1');
  
  return {
    macro: {
      archetypeOptions: gen1Data.macro.archetypes,
    },
    meso: {
      archetypeOptions: gen1Data.meso.archetypes,
    },
    micro: {
      archetypeOptions: gen1Data.micro.archetypes,
    },
  };
}

/**
 * Generate Gen2 data pools (pack behaviors)
 */
export async function generateGen2DataPools(_baseSeed: string, _gen1Data?: any): Promise<{
  macro: { archetypeOptions: any[] };
  meso: { archetypeOptions: any[] };
  micro: { archetypeOptions: any[] };
}> {
  const gen2Data = await loadGenerationData('gen2');
  
  return {
    macro: {
      archetypeOptions: gen2Data.macro.archetypes,
    },
    meso: {
      archetypeOptions: gen2Data.meso.archetypes,
    },
    micro: {
      archetypeOptions: gen2Data.micro.archetypes,
    },
  };
}

/**
 * Generate Gen3 data pools (tool archetypes)
 */
export async function generateGen3DataPools(_baseSeed: string): Promise<{
  macro: { archetypeOptions: any[] };
  meso: { archetypeOptions: any[] };
  micro: { archetypeOptions: any[] };
}> {
  const gen3Data = await loadGenerationData('gen3');
  
  return {
    macro: {
      archetypeOptions: gen3Data.macro.archetypes,
    },
    meso: {
      archetypeOptions: gen3Data.meso.archetypes,
    },
    micro: {
      archetypeOptions: gen3Data.micro.archetypes,
    },
  };
}

/**
 * Generate Gen4 data pools (tribe structures)
 */
export async function generateGen4DataPools(_baseSeed: string): Promise<{
  macro: { archetypeOptions: any[] };
  meso: { archetypeOptions: any[] };
  micro: { archetypeOptions: any[] };
}> {
  const gen4Data = await loadGenerationData('gen4');
  
  return {
    macro: {
      archetypeOptions: gen4Data.macro.archetypes,
    },
    meso: {
      archetypeOptions: gen4Data.meso.archetypes,
    },
    micro: {
      archetypeOptions: gen4Data.micro.archetypes,
    },
  };
}

/**
 * Generate Gen5 data pools (building types)
 */
export async function generateGen5DataPools(_baseSeed: string): Promise<{
  macro: { archetypeOptions: any[] };
  meso: { archetypeOptions: any[] };
  micro: { archetypeOptions: any[] };
}> {
  const gen5Data = await loadGenerationData('gen5');
  
  return {
    macro: {
      archetypeOptions: gen5Data.macro.archetypes,
    },
    meso: {
      archetypeOptions: gen5Data.meso.archetypes,
    },
    micro: {
      archetypeOptions: gen5Data.micro.archetypes,
    },
  };
}

/**
 * Generate Gen6 data pools (religion/democracy)
 */
export async function generateGen6DataPools(_baseSeed: string): Promise<{
  macro: { archetypeOptions: any[] };
  meso: { archetypeOptions: any[] };
  micro: { archetypeOptions: any[] };
}> {
  const gen6Data = await loadGenerationData('gen6');
  
  return {
    macro: {
      archetypeOptions: gen6Data.macro.archetypes,
    },
    meso: {
      archetypeOptions: gen6Data.meso.archetypes,
    },
    micro: {
      archetypeOptions: gen6Data.micro.archetypes,
    },
  };
}
