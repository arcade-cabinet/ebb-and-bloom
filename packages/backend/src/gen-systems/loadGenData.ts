/**
 * GEN DATA LOADER - Loads generated archetype pools from packages/gen
 * Provides same interface as old VisualBlueprintGenerator but reads from JSON files
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import seedrandom from 'seedrandom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve path to packages/gen from packages/backend
const GEN_DATA_PATH = join(__dirname, '../../../gen/data/archetypes');

/**
 * Archetype structure from JSON files
 */
interface Archetype {
  id: string;
  name: string;
  description: string;
  parameters?: Record<string, number>;
  visualProperties?: {
    primaryTextures: string[];
    colorPalette: string[];
    pbrProperties?: Record<string, any>;
    proceduralRules?: string;
  };
  textureReferences?: string[];
}

interface GenerationData {
  archetypes: Archetype[];
}

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
 */
export function extractSeedComponents(seed: string): { macro: number; meso: number; micro: number } {
  const rng = seedrandom(seed);
  return {
    macro: rng(),
    meso: rng(),
    micro: rng(),
  };
}

/**
 * Select from pool deterministically
 */
export function selectFromPool<T>(options: T[], seedComponent: number): T {
  const index = Math.floor(seedComponent * options.length);
  return options[index];
}

/**
 * Gen 0 Data Pool Loader
 */
export async function generateGen0DataPools(seed: string): Promise<any> {
  const data = await loadGenerationData('gen0');
  const { macro: macroSeed, meso: mesoSeed, micro: microSeed } = extractSeedComponents(seed);

  // Select archetypes from each scale
  const macroArchetype = selectFromPool(data.macro.archetypes, macroSeed);
  const mesoArchetype = selectFromPool(data.meso.archetypes, mesoSeed);
  const microArchetype = selectFromPool(data.micro.archetypes, microSeed);

  return {
    macro: {
      selectedContext: macroArchetype.name,
      visualBlueprint: {
        description: macroArchetype.description,
        representations: {
          materials: macroArchetype.textureReferences || [],
          shaders: macroArchetype.visualProperties?.pbrProperties || {},
          proceduralRules: macroArchetype.visualProperties?.proceduralRules || '',
          colorPalette: macroArchetype.visualProperties?.colorPalette || [],
        },
      },
      parameters: macroArchetype.parameters || {},
    },
    meso: {
      selectedAccretion: mesoArchetype.name,
      visualBlueprint: mesoArchetype.visualProperties || {},
      parameters: mesoArchetype.parameters || {},
    },
    micro: {
      selectedDistribution: microArchetype.name,
      visualBlueprint: {
        description: microArchetype.description,
        representations: {
          materials: microArchetype.textureReferences || [],
          shaders: microArchetype.visualProperties?.pbrProperties || {},
          proceduralRules: microArchetype.visualProperties?.proceduralRules || '',
          colorPalette: microArchetype.visualProperties?.colorPalette || [],
        },
      },
      parameters: microArchetype.parameters || {},
    },
  };
}

/**
 * Gen 1 Data Pool Loader
 */
export async function generateGen1DataPools(seed: string, planet?: any): Promise<any> {
  const data = await loadGenerationData('gen1');
  const { macro: macroSeed, meso: mesoSeed, micro: microSeed } = extractSeedComponents(seed);

  const macroArchetype = selectFromPool(data.macro.archetypes, macroSeed);
  const mesoArchetype = selectFromPool(data.meso.archetypes, mesoSeed);
  const microArchetype = selectFromPool(data.micro.archetypes, microSeed);

  return {
    macro: {
      archetypeOptions: [macroArchetype].map(a => ({
        name: a.name,
        traits: a.description, // Will be parsed by CreatureSystem
        visualBlueprint: {
          description: a.description,
          representations: {
            materials: a.textureReferences || [],
            shaders: a.visualProperties?.pbrProperties || {},
            proceduralRules: a.visualProperties?.proceduralRules || '',
            colorPalette: a.visualProperties?.colorPalette || [],
          },
        },
      })),
    },
    meso: {
      populationOptions: [mesoArchetype],
    },
    micro: {
      physiologyOptions: [microArchetype],
    },
  };
}

/**
 * Gen 2 Data Pool Loader
 */
export async function generateGen2DataPools(seed: string, gen1Data?: any): Promise<any> {
  const data = await loadGenerationData('gen2');
  const { macro: macroSeed, meso: mesoSeed, micro: microSeed } = extractSeedComponents(seed);

  const macroArchetype = selectFromPool(data.macro.archetypes, macroSeed);
  const mesoArchetype = selectFromPool(data.meso.archetypes, mesoSeed);
  const microArchetype = selectFromPool(data.micro.archetypes, microSeed);

  return {
    macro: {
      packTypeOptions: [macroArchetype].map(a => ({
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
      })),
    },
    meso: {
      packSociologyOptions: [mesoArchetype],
    },
    micro: {
      packBehaviorOptions: [microArchetype],
    },
  };
}

/**
 * Gen 3 Data Pool Loader
 */
export async function generateGen3DataPools(planet: any, gen2Data: any, seed: string): Promise<any> {
  const data = await loadGenerationData('gen3');
  const { macro: macroSeed, meso: mesoSeed, micro: microSeed } = extractSeedComponents(seed);

  const macroArchetype = selectFromPool(data.macro.archetypes, macroSeed);
  const mesoArchetype = selectFromPool(data.meso.archetypes, mesoSeed);
  const microArchetype = selectFromPool(data.micro.archetypes, microSeed);

  return {
    micro: {
      toolTypesOptions: [microArchetype].map(a => ({
        name: a.name,
        purpose: a.description.split(' ')[0], // Simple extraction
        visualBlueprint: {
          description: a.description,
          representations: {
            materials: a.textureReferences || [],
            shaders: a.visualProperties?.pbrProperties || {},
            proceduralRules: a.visualProperties?.proceduralRules || '',
            colorPalette: a.visualProperties?.colorPalette || [],
          },
        },
      })),
    },
  };
}

/**
 * Gen 4 Data Pool Loader
 */
export async function generateGen4DataPools(planet: any, gen3Data: any, seed: string): Promise<any> {
  const data = await loadGenerationData('gen4');
  const { macro: macroSeed, meso: mesoSeed, micro: microSeed } = extractSeedComponents(seed);

  const macroArchetype = selectFromPool(data.macro.archetypes, macroSeed);
  const mesoArchetype = selectFromPool(data.meso.archetypes, mesoSeed);
  const microArchetype = selectFromPool(data.micro.archetypes, microSeed);

  return {
    macro: {
      selectedStructure: macroArchetype.name,
      visualBlueprint: {
        description: macroArchetype.description,
        representations: {
          materials: macroArchetype.textureReferences || [],
          shaders: macroArchetype.visualProperties?.pbrProperties || {},
          proceduralRules: macroArchetype.visualProperties?.proceduralRules || '',
          colorPalette: macroArchetype.visualProperties?.colorPalette || [],
        },
      },
    },
    meso: {
      selectedGovernance: mesoArchetype.name,
    },
    micro: {
      selectedTradition: microArchetype.name,
    },
  };
}

/**
 * Gen 5 Data Pool Loader
 */
export async function generateGen5DataPools(planet: any, gen4Data: any, seed: string): Promise<any> {
  const data = await loadGenerationData('gen5');
  const { macro: macroSeed, meso: mesoSeed, micro: microSeed } = extractSeedComponents(seed);

  const macroArchetype = selectFromPool(data.macro.archetypes, macroSeed);
  const mesoArchetype = selectFromPool(data.meso.archetypes, mesoSeed);
  const microArchetype = selectFromPool(data.micro.archetypes, microSeed);

  return {
    micro: {
      buildingTypesOptions: [microArchetype].map(a => ({
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
      })),
    },
  };
}

/**
 * Gen 6 Data Pool Loader
 */
export async function generateGen6DataPools(planet: any, gen5Data: any, seed: string): Promise<any> {
  const data = await loadGenerationData('gen6');
  const { macro: macroSeed, meso: mesoSeed, micro: microSeed } = extractSeedComponents(seed);

  const macroArchetype = selectFromPool(data.macro.archetypes, macroSeed);
  const mesoArchetype = selectFromPool(data.meso.archetypes, mesoSeed);
  const microArchetype = selectFromPool(data.micro.archetypes, microSeed);

  return {
    macro: {
      selectedCosmology: macroArchetype.name,
      visualBlueprint: {
        description: macroArchetype.description,
        representations: {
          materials: macroArchetype.textureReferences || [],
          shaders: macroArchetype.visualProperties?.pbrProperties || {},
          proceduralRules: macroArchetype.visualProperties?.proceduralRules || '',
          colorPalette: macroArchetype.visualProperties?.colorPalette || [],
        },
      },
    },
    meso: {
      selectedRitual: mesoArchetype.name,
    },
    micro: {
      selectedBelief: microArchetype.name,
    },
  };
}

// Export VisualBlueprint type for compatibility
export type VisualBlueprint = any;

