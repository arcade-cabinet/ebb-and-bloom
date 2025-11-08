/**
 * GEN DATA LOADER - Loads generated archetype pools from packages/gen
 * Provides same interface as old VisualBlueprintGenerator but reads from JSON files
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import seedrandom from 'seedrandom';
import { extractSeedComponents as extractSeedComponentsFromManager, getGenerationSeed } from '../seed/seed-manager.js';
import type { GenerationScale } from '@ebb/gen/schemas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Archetype data is now in backend's own data directory
const GEN_DATA_PATH = join(__dirname, '../../data/archetypes');

/**
 * Type definitions from gen schemas (DRY - single source of truth)
 * Using types from @ebb/gen/schemas instead of duplicating
 */
type GenerationData = GenerationScale;

/**
 * Load generation data from JSON files
 */
async function loadGenerationData(gen: string): Promise<{ macro: GenerationData; meso: GenerationData; micro: GenerationData }> {
  const genPath = join(GEN_DATA_PATH, gen);
  
  try {
    const [macro, meso, micro] = await Promise.all([
      fs.readFile(join(genPath, 'macro.json'), 'utf8').then(JSON.parse) as Promise<GenerationData>,
      fs.readFile(join(genPath, 'meso.json'), 'utf8').then(JSON.parse) as Promise<GenerationData>,
      fs.readFile(join(genPath, 'micro.json'), 'utf8').then(JSON.parse) as Promise<GenerationData>,
    ]);

    return { macro, meso, micro };
  } catch (error: any) {
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
  const random = seedComponent;
  for (const weighted of cumulativeWeights) {
    if (random <= weighted.cumulative) {
      return weighted.option;
    }
  }
  
  // Fallback to last option
  return options[options.length - 1];
}

/**
 * Interpolate parameter value from range using seed component
 */
export function interpolateParameter(
  param: number | { min: number; max: number; default?: number },
  seedComponent: number
): number {
  if (typeof param === 'number') {
    // Backward compatibility: fixed value
    return param;
  }
  
  // Interpolate within range
  const { min, max, default: defaultValue } = param;
  if (defaultValue !== undefined && seedComponent < 0.1) {
    // Use default for very low seed values
    return defaultValue;
  }
  
  return min + (seedComponent * (max - min));
}

/**
 * Interpolate parameters from universal template (ranges) using seed components
 */
function interpolateArchetypeParameters(
  parameters: Record<string, number | { min: number; max: number; default?: number }> | undefined,
  seedComponents: { macro: number; meso: number; micro: number }
): Record<string, number> {
  if (!parameters) return {};
  
  const interpolated: Record<string, number> = {};
  let seedIndex = 0;
  const seeds = [seedComponents.macro, seedComponents.meso, seedComponents.micro];
  
  for (const [key, value] of Object.entries(parameters)) {
    if (typeof value === 'number') {
      // Fixed value - use as-is
      interpolated[key] = value;
    } else {
      // Range - interpolate using seed component
      const seed = seeds[seedIndex % seeds.length];
      seedIndex++;
      interpolated[key] = interpolateParameter(value, seed);
    }
  }
  
  return interpolated;
}

/**
 * Gen 0 Data Pool Loader - Uses biased selection and parameter interpolation
 * Uses generation seed (baseSeed-gen0) for deterministic chaining
 */
export async function generateGen0DataPools(baseSeed: string, context?: { metallicity?: string }): Promise<any> {
  // Use generation seed for Gen0
  const gen0Seed = getGenerationSeed(baseSeed, 0);
  const data = await loadGenerationData('gen0');
  const seedComponents = extractSeedComponents(gen0Seed);

  // Use biased selection with seed context (e.g., metallicity from previous analysis)
  const seedContext = context ? { ...context } : {};
  const macroArchetype = selectFromPoolBiased(data.macro.archetypes, seedComponents.macro, seedContext);
  const mesoArchetype = selectFromPoolBiased(data.meso.archetypes, seedComponents.meso, seedContext);
  const microArchetype = selectFromPoolBiased(data.micro.archetypes, seedComponents.micro, seedContext);

  // Interpolate parameters from ranges
  const macroParams = interpolateArchetypeParameters(macroArchetype.parameters, seedComponents);
  const mesoParams = interpolateArchetypeParameters(mesoArchetype.parameters, seedComponents);
  const microParams = interpolateArchetypeParameters(microArchetype.parameters, seedComponents);

  return {
    macro: {
      selectedContext: macroArchetype.name,
      archetypeId: macroArchetype.id,
      visualBlueprint: {
        description: macroArchetype.description,
        representations: {
          materials: macroArchetype.textureReferences || [],
          shaders: macroArchetype.visualProperties?.pbrProperties || {},
          proceduralRules: macroArchetype.visualProperties?.proceduralRules || '',
          colorPalette: macroArchetype.visualProperties?.colorPalette || [],
        },
      },
      parameters: macroParams,
      // Include formation guidance for Yuka AI
      formation: macroArchetype.formation,
      // Include adjacency for compatibility checks
      adjacency: macroArchetype.adjacency,
    },
    meso: {
      selectedAccretion: mesoArchetype.name,
      archetypeId: mesoArchetype.id,
      visualBlueprint: mesoArchetype.visualProperties || {},
      parameters: mesoParams,
      formation: mesoArchetype.formation,
      adjacency: mesoArchetype.adjacency,
    },
    micro: {
      selectedDistribution: microArchetype.name,
      archetypeId: microArchetype.id,
      visualBlueprint: {
        description: microArchetype.description,
        representations: {
          materials: microArchetype.textureReferences || [],
          shaders: microArchetype.visualProperties?.pbrProperties || {},
          proceduralRules: microArchetype.visualProperties?.proceduralRules || '',
          colorPalette: microArchetype.visualProperties?.colorPalette || [],
        },
      },
      parameters: microParams,
      formation: microArchetype.formation,
      adjacency: microArchetype.adjacency,
    },
  };
}

/**
 * Gen 1 Data Pool Loader - Uses biased selection and parameter interpolation
 * Uses generation seed (baseSeed-gen1) for deterministic chaining
 */
export async function generateGen1DataPools(baseSeed: string, _planet?: any, gen0Data?: any): Promise<any> {
  // Use generation seed for Gen1
  const gen1Seed = getGenerationSeed(baseSeed, 1);
  const data = await loadGenerationData('gen1');
  const seedComponents = extractSeedComponents(gen1Seed);

  // Build seed context from Gen0 (WARP flow)
  const seedContext: Record<string, any> = {};
  if (gen0Data?.macro?.parameters?.metallicity) {
    const metallicity = gen0Data.macro.parameters.metallicity;
    seedContext['high-metallicity'] = metallicity > 0.8;
    seedContext['low-metallicity'] = metallicity < 0.5;
  }

  const macroArchetype = selectFromPoolBiased(data.macro.archetypes, seedComponents.macro, seedContext);
  const mesoArchetype = selectFromPoolBiased(data.meso.archetypes, seedComponents.meso, seedContext);
  const microArchetype = selectFromPoolBiased(data.micro.archetypes, seedComponents.micro, seedContext);

  return {
    macro: {
      archetypeOptions: [macroArchetype].map(a => ({
        id: a.id,
        name: a.name,
        traits: a.description,
        visualBlueprint: {
          description: a.description,
          representations: {
            materials: a.textureReferences || [],
            shaders: a.visualProperties?.pbrProperties || {},
            proceduralRules: a.visualProperties?.proceduralRules || '',
            colorPalette: a.visualProperties?.colorPalette || [],
          },
        },
        parameters: interpolateArchetypeParameters(a.parameters, seedComponents),
        formation: a.formation,
        deconstruction: a.deconstruction,
        adjacency: a.adjacency,
      })),
    },
    meso: {
      populationOptions: [mesoArchetype].map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        parameters: interpolateArchetypeParameters(a.parameters, seedComponents),
        formation: a.formation,
        adjacency: a.adjacency,
      })),
    },
    micro: {
      physiologyOptions: [microArchetype].map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        parameters: interpolateArchetypeParameters(a.parameters, seedComponents),
        formation: a.formation,
        adjacency: a.adjacency,
      })),
    },
  };
}

/**
 * Gen 2 Data Pool Loader - Uses biased selection and parameter interpolation
 * Uses generation seed (baseSeed-gen2) for deterministic chaining
 */
export async function generateGen2DataPools(baseSeed: string, gen1Data?: any): Promise<any> {
  // Use generation seed for Gen2
  const gen2Seed = getGenerationSeed(baseSeed, 2);
  const data = await loadGenerationData('gen2');
  const seedComponents = extractSeedComponents(gen2Seed);

  // Build seed context from Gen1 (WARP flow)
  const seedContext: Record<string, any> = {};
  if (gen1Data?.macro?.archetypeOptions?.[0]?.parameters) {
    // Extract relevant context from Gen1 creature traits
    const gen1Params = gen1Data.macro.archetypeOptions[0].parameters;
    if (gen1Params.social !== undefined) {
      seedContext['high-social'] = gen1Params.social > 0.7;
    }
  }

  const macroArchetype = selectFromPoolBiased(data.macro.archetypes, seedComponents.macro, seedContext);
  const mesoArchetype = selectFromPoolBiased(data.meso.archetypes, seedComponents.meso, seedContext);
  const microArchetype = selectFromPoolBiased(data.micro.archetypes, seedComponents.micro, seedContext);

  return {
    macro: {
      packTypeOptions: [macroArchetype].map(a => ({
        id: a.id,
        name: a.name,
        traits: {},
        visualBlueprint: {
          description: a.description,
          representations: {
            materials: a.textureReferences || [],
            shaders: a.visualProperties?.pbrProperties || {},
            proceduralRules: a.visualProperties?.proceduralRules || '',
            colorPalette: a.visualProperties?.colorPalette || [],
          },
        },
        parameters: interpolateArchetypeParameters(a.parameters, seedComponents),
        formation: a.formation,
        deconstruction: a.deconstruction,
        adjacency: a.adjacency,
      })),
    },
    meso: {
      packSociologyOptions: [mesoArchetype].map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        parameters: interpolateArchetypeParameters(a.parameters, seedComponents),
        formation: a.formation,
        adjacency: a.adjacency,
      })),
    },
    micro: {
      packBehaviorOptions: [microArchetype].map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        parameters: interpolateArchetypeParameters(a.parameters, seedComponents),
        formation: a.formation,
        adjacency: a.adjacency,
      })),
    },
  };
}

/**
 * Gen 3 Data Pool Loader - Uses biased selection and parameter interpolation
 */
export async function generateGen3DataPools(_planet: any, _gen2Data: any, baseSeed: string): Promise<any> {
  // Use generation seed for Gen3
  const gen3Seed = getGenerationSeed(baseSeed, 3);
  const data = await loadGenerationData('gen3');
  const seedComponents = extractSeedComponents(gen3Seed);

  // Build seed context from Gen2 (WARP flow)
  const seedContext: Record<string, any> = {};

  const macroArchetype = selectFromPoolBiased(data.macro.archetypes, seedComponents.macro, seedContext);
  const mesoArchetype = selectFromPoolBiased(data.meso.archetypes, seedComponents.meso, seedContext);
  const microArchetype = selectFromPoolBiased(data.micro.archetypes, seedComponents.micro, seedContext);

  return {
    macro: {
      toolEcosystemOptions: [macroArchetype].map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        parameters: interpolateArchetypeParameters(a.parameters, seedComponents),
        formation: a.formation,
        adjacency: a.adjacency,
      })),
    },
    meso: {
      toolCategoryOptions: [mesoArchetype].map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        parameters: interpolateArchetypeParameters(a.parameters, seedComponents),
        formation: a.formation,
        adjacency: a.adjacency,
      })),
    },
    micro: {
      toolTypesOptions: [microArchetype].map(a => ({
        id: a.id,
        name: a.name,
        purpose: a.description.split(' ')[0],
        visualBlueprint: {
          description: a.description,
          representations: {
            materials: a.textureReferences || [],
            shaders: a.visualProperties?.pbrProperties || {},
            proceduralRules: a.visualProperties?.proceduralRules || '',
            colorPalette: a.visualProperties?.colorPalette || [],
          },
        },
        parameters: interpolateArchetypeParameters(a.parameters, seedComponents),
        formation: a.formation,
        deconstruction: a.deconstruction,
        adjacency: a.adjacency,
      })),
    },
  };
}

/**
 * Gen 4 Data Pool Loader - Uses biased selection and parameter interpolation
 * Uses generation seed (baseSeed-gen4) for deterministic chaining
 */
export async function generateGen4DataPools(_planet: any, _gen3Data: any, baseSeed: string): Promise<any> {
  // Use generation seed for Gen4
  const gen4Seed = getGenerationSeed(baseSeed, 4);
  const data = await loadGenerationData('gen4');
  const seedComponents = extractSeedComponents(gen4Seed);

  // Build seed context from Gen3 (WARP flow)
  const seedContext: Record<string, any> = {};

  const macroArchetype = selectFromPoolBiased(data.macro.archetypes, seedComponents.macro, seedContext);
  const mesoArchetype = selectFromPoolBiased(data.meso.archetypes, seedComponents.meso, seedContext);
  const microArchetype = selectFromPoolBiased(data.micro.archetypes, seedComponents.micro, seedContext);

  return {
    macro: {
      selectedStructure: macroArchetype.name,
      archetypeId: macroArchetype.id,
      visualBlueprint: {
        description: macroArchetype.description,
        representations: {
          materials: macroArchetype.textureReferences || [],
          shaders: macroArchetype.visualProperties?.pbrProperties || {},
          proceduralRules: macroArchetype.visualProperties?.proceduralRules || '',
          colorPalette: macroArchetype.visualProperties?.colorPalette || [],
        },
      },
      parameters: interpolateArchetypeParameters(macroArchetype.parameters, seedComponents),
      formation: macroArchetype.formation,
      adjacency: macroArchetype.adjacency,
    },
    meso: {
      selectedGovernance: mesoArchetype.name,
      archetypeId: mesoArchetype.id,
      parameters: interpolateArchetypeParameters(mesoArchetype.parameters, seedComponents),
      formation: mesoArchetype.formation,
      adjacency: mesoArchetype.adjacency,
    },
    micro: {
      selectedTradition: microArchetype.name,
      archetypeId: microArchetype.id,
      parameters: interpolateArchetypeParameters(microArchetype.parameters, seedComponents),
      formation: microArchetype.formation,
      adjacency: microArchetype.adjacency,
    },
  };
}

/**
 * Gen 5 Data Pool Loader - Uses biased selection and parameter interpolation
 * Uses generation seed (baseSeed-gen5) for deterministic chaining
 */
export async function generateGen5DataPools(_planet: any, _gen4Data: any, baseSeed: string): Promise<any> {
  // Use generation seed for Gen5
  const gen5Seed = getGenerationSeed(baseSeed, 5);
  const data = await loadGenerationData('gen5');
  const seedComponents = extractSeedComponents(gen5Seed);

  // Build seed context from Gen4 (WARP flow)
  const seedContext: Record<string, any> = {};

  const macroArchetype = selectFromPoolBiased(data.macro.archetypes, seedComponents.macro, seedContext);
  const mesoArchetype = selectFromPoolBiased(data.meso.archetypes, seedComponents.meso, seedContext);
  const microArchetype = selectFromPoolBiased(data.micro.archetypes, seedComponents.micro, seedContext);

  return {
    macro: {
      settlementPatternOptions: [macroArchetype].map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        parameters: interpolateArchetypeParameters(a.parameters, seedComponents),
        formation: a.formation,
        adjacency: a.adjacency,
      })),
    },
    meso: {
      buildingTypeOptions: [mesoArchetype].map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        parameters: interpolateArchetypeParameters(a.parameters, seedComponents),
        formation: a.formation,
        adjacency: a.adjacency,
      })),
    },
    micro: {
      buildingTypesOptions: [microArchetype].map(a => ({
        id: a.id,
        name: a.name,
        purpose: a.description.split(' ')[0],
        visualBlueprint: {
          description: a.description,
          representations: {
            materials: a.textureReferences || [],
            shaders: a.visualProperties?.pbrProperties || {},
            proceduralRules: a.visualProperties?.proceduralRules || '',
            colorPalette: a.visualProperties?.colorPalette || [],
          },
        },
        parameters: interpolateArchetypeParameters(a.parameters, seedComponents),
        formation: a.formation,
        deconstruction: a.deconstruction,
        adjacency: a.adjacency,
      })),
    },
  };
}

/**
 * Gen 6 Data Pool Loader - Uses biased selection and parameter interpolation
 * Uses generation seed (baseSeed-gen6) for deterministic chaining
 */
export async function generateGen6DataPools(_planet: any, _gen5Data: any, baseSeed: string): Promise<any> {
  // Use generation seed for Gen6
  const gen6Seed = getGenerationSeed(baseSeed, 6);
  const data = await loadGenerationData('gen6');
  const seedComponents = extractSeedComponents(gen6Seed);

  // Build seed context from Gen5 (WARP flow)
  const seedContext: Record<string, any> = {};

  const macroArchetype = selectFromPoolBiased(data.macro.archetypes, seedComponents.macro, seedContext);
  const mesoArchetype = selectFromPoolBiased(data.meso.archetypes, seedComponents.meso, seedContext);
  const microArchetype = selectFromPoolBiased(data.micro.archetypes, seedComponents.micro, seedContext);

  return {
    macro: {
      selectedCosmology: macroArchetype.name,
      archetypeId: macroArchetype.id,
      visualBlueprint: {
        description: macroArchetype.description,
        representations: {
          materials: macroArchetype.textureReferences || [],
          shaders: macroArchetype.visualProperties?.pbrProperties || {},
          proceduralRules: macroArchetype.visualProperties?.proceduralRules || '',
          colorPalette: macroArchetype.visualProperties?.colorPalette || [],
        },
      },
      parameters: interpolateArchetypeParameters(macroArchetype.parameters, seedComponents),
      formation: macroArchetype.formation,
      adjacency: macroArchetype.adjacency,
    },
    meso: {
      selectedRitual: mesoArchetype.name,
      archetypeId: mesoArchetype.id,
      parameters: interpolateArchetypeParameters(mesoArchetype.parameters, seedComponents),
      formation: mesoArchetype.formation,
      adjacency: mesoArchetype.adjacency,
    },
    micro: {
      selectedBelief: microArchetype.name,
      archetypeId: microArchetype.id,
      parameters: interpolateArchetypeParameters(microArchetype.parameters, seedComponents),
      formation: microArchetype.formation,
      adjacency: microArchetype.adjacency,
    },
  };
}

// Export VisualBlueprint type for compatibility
export type VisualBlueprint = any;

