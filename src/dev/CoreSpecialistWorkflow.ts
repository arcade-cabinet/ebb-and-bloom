/**
 * Core Specialist - Child AI Workflow for Generation 0
 * 
 * Receives a planetary core manifest from Creative Director (parent workflow)
 * and designs:
 * - Unique raw materials for that specific core type
 * - Unique creature archetypes adapted to that core environment
 * 
 * Multiple instances run in parallel (one per core).
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
  PlanetaryCore,
  CoreSpecificMaterial,
  CreatureArchetype,
  CoreSpecialistManifest 
} from '../core/generation-zero-types';

/**
 * Zod schemas for structured output validation
 */
const CoreSpecificMaterialSchema = z.object({
  name: z.string().describe('Material name unique to this core'),
  coreName: z.string().describe('Which core this material belongs to'),
  category: z.enum(['stone', 'ore', 'crystal', 'organic', 'liquid']),
  depth: z.number().min(0).max(50).describe('Depth in meters where this is found'),
  density: z.number().min(0).max(10).describe('Physical density (0-10)'),
  attraction: z.number().min(0).max(10).describe('Magnetic/gravitational attraction (0-10)'),
  cohesion: z.number().min(0).max(10).describe('How strongly it bonds to similar materials (0-10)'),
  mass: z.number().min(0).max(10).describe('Mass per unit (0-10)'),
  size: z.number().min(0).max(10).describe('Typical size of deposits (0-10)'),
  shape: z.enum(['spherical', 'cubic', 'irregular', 'crystalline', 'layered']),
  description: z.string().describe('Visual and functional description'),
});

const CreatureArchetypeSchema = z.object({
  name: z.string().describe('Creature archetype name'),
  coreName: z.string().describe('Which core this creature evolved in'),
  category: z.enum(['terrestrial', 'aquatic', 'aerial', 'subterranean']),
  size: z.number().min(0).max(10).describe('Physical size (0-10)'),
  mobility: z.number().min(0).max(10).describe('Movement capability (0-10)'),
  manipulation: z.number().min(0).max(10).describe('Tool use dexterity (0-10)'),
  intelligence: z.number().min(0).max(10).describe('Problem solving ability (0-10)'),
  socialTendency: z.number().min(0).max(10).describe('Pack formation tendency (0-10)'),
  aggression: z.number().min(0).max(10).describe('Combat propensity (0-10)'),
  description: z.string().describe('Visual and behavioral description'),
  meshyPrompt: z.string().describe('Meshy AI prompt for 3D model generation'),
});

const CoreSpecialistManifestSchema = z.object({
  coreName: z.string(),
  materials: z.array(CoreSpecificMaterialSchema).min(2).max(5).describe('2-5 unique materials for this core'),
  creatures: z.array(CreatureArchetypeSchema).min(1).max(3).describe('1-3 creature archetypes for this core'),
});

/**
 * Core Specialist Workflow
 * Child workflow that designs unique content for one planetary core
 */
export class CoreSpecialistWorkflow {
  private core: PlanetaryCore;
  private seedPhrase: string;
  private rng: seedrandom.PRNG;

  constructor(core: PlanetaryCore, seedPhrase: string) {
    this.core = core;
    this.seedPhrase = seedPhrase;
    // Combine seed phrase with core name for deterministic but unique randomness
    this.rng = seedrandom(`${seedPhrase}-${core.name}`);
  }

  /**
   * Execute the Core Specialist workflow
   * Designs unique materials and creatures for this specific core
   */
  async execute(): Promise<CoreSpecialistManifest> {
    log.info('Core Specialist workflow starting', { 
      core: this.core.name,
      seedPhrase: this.seedPhrase 
    });

    try {
      const systemPrompt = `You are a Core Specialist for Ebb & Bloom, designing unique materials and creatures for a specific planetary core type.

Your role is to create content that is:
- **Core-Specific**: Materials and creatures ONLY found in this core type
- **Environmentally Adapted**: Creatures evolved for this core's conditions
- **Mechanically Unique**: Materials with distinct properties (depth, cohesion, shape)
- **Balanced**: Not too easy or too hard to access
- **Thematic**: Fits the core's temperature, pressure, and stability

Design 2-5 unique materials and 1-3 creature archetypes specifically adapted to this core environment.`;

      const userPrompt = `Design unique content for: ${this.core.name}

**Core Properties**:
- Description: ${this.core.description}
- Dominant Element: ${this.core.dominantElement}
- Temperature: ${this.core.temperature}/10
- Pressure: ${this.core.pressure}/10
- Stability: ${this.core.stability}/10

**Requirements**:
1. Design 2-5 unique materials ONLY found in this core type
   - Consider temperature/pressure effects on material formation
   - Deeper materials should be harder to extract
   - Use cohesion/attraction for Yuka steering behaviors
2. Design 1-3 creature archetypes adapted to this environment
   - High temperature cores → heat-resistant creatures
   - High pressure cores → compact, dense creatures
   - Low stability cores → mobile, adaptive creatures
3. Materials should enable creature survival (e.g., water sources, food)
4. Creatures should have varied capabilities (some social, some solitary, etc.)

Make materials and creatures feel native to this specific core environment.`;

      // Generate core specialist manifest using structured output
      const result = await generateObject({
        model: openai(AI_MODELS.SYSTEM_ARCHITECTURE),
        schema: CoreSpecialistManifestSchema,
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.7,
      });

      const manifest = result.object as CoreSpecialistManifest;
      
      // Ensure coreName is set correctly on all items
      manifest.coreName = this.core.name;
      manifest.materials.forEach(m => m.coreName = this.core.name);
      manifest.creatures.forEach(c => c.coreName = this.core.name);

      log.info('Core Specialist workflow complete', {
        core: manifest.coreName,
        materials: manifest.materials.length,
        creatures: manifest.creatures.length,
      });

      return manifest;
    } catch (error) {
      log.error('Core Specialist workflow failed', { 
        core: this.core.name,
        error 
      });
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
 * Execute Core Specialist workflow (convenience function)
 */
export async function executeCoreSpecialist(
  core: PlanetaryCore, 
  seedPhrase: string
): Promise<CoreSpecialistManifest> {
  const workflow = new CoreSpecialistWorkflow(core, seedPhrase);
  return await workflow.execute();
}
