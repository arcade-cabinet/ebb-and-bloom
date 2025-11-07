/**
 * Creative Director - Parent AI Workflow for Generation 0
 * 
 * Takes a seed phrase and designs the complete planetary system:
 * - 8 planetary core types
 * - Shared raw materials (elements across multiple cores)
 * - Planet fill material (soil/water/cork properties)
 * 
 * Spawns child workflows (CoreSpecialistWorkflow) for each core type.
 * 
 * Uses Vercel AI SDK for deterministic generation.
 */

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import seedrandom from 'seedrandom';
import { z } from 'zod';
import { AI_MODELS } from '../config/ai-models';
import { log } from '../utils/Logger';
import type { 
  PlanetaryManifest, 
  PlanetaryCore, 
  SharedMaterial, 
  FillMaterial 
} from '../core/generation-zero-types';

/**
 * Zod schemas for structured output validation
 */
const PlanetaryCoreSchema = z.object({
  name: z.string().describe('Core type name (e.g., "Ferrite Core", "Crystalline Core")'),
  description: z.string().describe('Geological and visual description'),
  color: z.string().describe('Hex color code for core visualization'),
  dominantElement: z.string().describe('Primary element this core contains'),
  temperature: z.number().min(0).max(10).describe('Heat level (0-10)'),
  pressure: z.number().min(0).max(10).describe('Compression level (0-10)'),
  stability: z.number().min(0).max(10).describe('Geological stability (0-10)'),
  meshyPrompt: z.string().describe('Meshy AI prompt for 3D model generation'),
});

const SharedMaterialSchema = z.object({
  name: z.string().describe('Material name (e.g., "Iron", "Quartz")'),
  category: z.enum(['stone', 'ore', 'crystal', 'organic', 'liquid']),
  affinityTypes: z.array(z.string()).describe('Affinity flags (HEAT, FLOW, BIND, etc.)'),
  rarity: z.number().min(0).max(1).describe('Spawn probability (0-1)'),
  baseDepth: z.number().min(0).max(50).describe('Typical depth in meters'),
  hardness: z.number().min(0).max(10).describe('Extraction difficulty (0-10)'),
  description: z.string().describe('Visual and functional description'),
});

const FillMaterialSchema = z.object({
  name: z.string().describe('Fill material name (e.g., "Loamy Soil", "Saline Water")'),
  type: z.enum(['soil', 'water', 'cork', 'ash', 'sand']),
  density: z.number().min(0).max(10).describe('Mass per volume (0-10)'),
  permeability: z.number().min(0).max(10).describe('How easily materials pass through (0-10)'),
  oxygenation: z.number().min(0).max(10).describe('Air content (0-10)'),
  lightPenetration: z.number().min(0).max(10).describe('How deep light reaches (0-10)'),
  waterRetention: z.number().min(0).max(10).describe('How much water it holds (0-10)'),
  description: z.string().describe('Physical properties and behavior'),
});

const PlanetaryManifestSchema = z.object({
  seedPhrase: z.string(),
  planetaryName: z.string().describe('Procedurally generated planet name'),
  cores: z.array(PlanetaryCoreSchema).length(8).describe('8 planetary core types'),
  sharedMaterials: z.array(SharedMaterialSchema).min(5).max(10).describe('Materials found across multiple cores'),
  fillMaterial: FillMaterialSchema.describe('The fill material for this planet'),
  worldTheme: z.string().describe('Overall aesthetic and tone (e.g., "Volcanic Hellscape", "Crystalline Paradise")'),
});

/**
 * Creative Director Workflow
 * Parent workflow that designs the complete planetary system
 */
export class CreativeDirectorWorkflow {
  private seedPhrase: string;
  private rng: seedrandom.PRNG;

  constructor(seedPhrase: string) {
    this.seedPhrase = seedPhrase;
    this.rng = seedrandom(seedPhrase);
  }

  /**
   * Execute the Creative Director workflow
   * Designs complete planetary system from seed phrase
   */
  async execute(): Promise<PlanetaryManifest> {
    log.info('Creative Director workflow starting', { seedPhrase: this.seedPhrase });

    try {
      const systemPrompt = `You are the Creative Director for Ebb & Bloom, a procedural evolution game where planets are generated from seed phrases.

Your role is to design a COMPLETE planetary system that is:
- **Deterministic**: Same seed phrase = same planet every time
- **Diverse**: 8 distinct planetary core types with unique materials
- **Balanced**: Materials distributed to enable progression (not all at surface)
- **Thematic**: Coherent aesthetic based on seed phrase
- **Realistic**: Grounded in geological principles (heat, pressure, stability)

Design 8 planetary cores, shared materials found across multiple cores, and the planet's fill material (soil/water/cork).

**Critical**: Each core should feel UNIQUE with distinct visuals, materials, and creature potential.

**Examples of core types**: Ferrite Core, Crystalline Core, Magma Core, Frozen Core, Biomass Core, Void Core, Prismatic Core, Tectonic Core

**Shared materials**: Elements like Iron, Quartz, Carbon, Silicon that appear across multiple core types but at different depths/purities.

**Fill material**: The "medium" creatures dig through - soil (most common), water (aquatic worlds), cork (fungal worlds), ash (volcanic), sand (desert).`;

      const userPrompt = `Generate a complete planetary system from seed phrase: "${this.seedPhrase}"

Requirements:
1. 8 distinct planetary core types - make each feel unique
2. Each core has temperature (0-10), pressure (0-10), stability (0-10)
3. 5-10 shared materials found across multiple cores (like Iron, Quartz, etc.)
4. Each material has: depth (0-50m), hardness (0-10), rarity (0-1)
5. One fill material with detailed physical properties
6. Overall world theme that ties everything together
7. Meshy prompts for 3D model generation for each core

Think about how this planet formed geologically and design cores that reflect its history.`;

      // Generate planetary manifest using structured output
      const result = await generateObject({
        model: openai(AI_MODELS.SYSTEM_ARCHITECTURE),
        schema: PlanetaryManifestSchema,
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.7,
      });

      const manifest = result.object as PlanetaryManifest;

      log.info('Creative Director workflow complete', {
        planet: manifest.planetaryName,
        cores: manifest.cores.length,
        sharedMaterials: manifest.sharedMaterials.length,
        fillMaterial: manifest.fillMaterial.name,
        theme: manifest.worldTheme,
      });

      return manifest;
    } catch (error) {
      log.error('Creative Director workflow failed', { error });
      throw error;
    }
  }

  /**
   * Generate deterministic random values using seedrandom
   */
  getRandom(): number {
    return this.rng();
  }

  /**
   * Generate random integer in range
   */
  getRandomInt(min: number, max: number): number {
    return Math.floor(this.getRandom() * (max - min + 1)) + min;
  }

  /**
   * Generate random float in range
   */
  getRandomFloat(min: number, max: number): number {
    return this.getRandom() * (max - min) + min;
  }
}

/**
 * Execute Creative Director workflow (convenience function)
 */
export async function executeCreativeDirector(seedPhrase: string): Promise<PlanetaryManifest> {
  const workflow = new CreativeDirectorWorkflow(seedPhrase);
  return await workflow.execute();
}
