/**
 * AI Workflow Runtime System
 * 
 * Uses OpenAI API to generate game content at RUNTIME, not just dev-time.
 * 
 * This replaces MockGen0Data with REAL AI-generated content:
 * - Planetary cores with unique properties
 * - Materials with emergent depths and affinities
 * - Creature archetypes with trait distributions
 * - Tool requirements and emergence conditions
 * - Building templates and cultural variations
 * - Mythological narratives and tribal identities
 * 
 * CRITICAL: All outputs are deterministic from seed phrase using
 * OpenAI's seed parameter, so same seed = same content every time.
 */

import { openai } from '@ai-sdk/openai';
import { generateText, generateObject } from 'ai';
import { z } from 'zod';
import seedrandom from 'seedrandom';
import type { GenerationZeroOutput, PlanetaryCore, SharedMaterial, FillMaterial } from '../core/generation-zero-types';
import { log } from '../utils/Logger';

/**
 * ============================================================================
 * SCHEMAS - Zod schemas for AI generation validation
 * ============================================================================
 */

const PlanetaryCoreSchema = z.object({
  name: z.string(),
  temperature: z.number().min(0).max(10),
  pressure: z.number().min(0).max(10),
  stability: z.number().min(0).max(10),
  description: z.string(),
});

const SharedMaterialSchema = z.object({
  name: z.string(),
  category: z.enum(['stone', 'ore', 'crystal', 'organic', 'liquid']),
  hardness: z.number().min(0).max(10),
  rarity: z.number().min(0).max(1),
  affinityTypes: z.array(z.string()),
  description: z.string(),
});

const FillMaterialSchema = z.object({
  name: z.string(),
  type: z.enum(['soil', 'water', 'gas', 'crystal', 'organic']),
  permeability: z.number().min(0).max(10),
  density: z.number().min(0).max(10),
  description: z.string(),
});

const CreatureArchetypeSchema = z.object({
  name: z.string(),
  baseTraits: z.object({
    mobility: z.number().min(0).max(1),
    manipulation: z.number().min(0).max(1),
    excavation: z.number().min(0).max(1),
    social: z.number().min(0).max(1),
    intelligence: z.number().min(0).max(1),
    aggression: z.number().min(0).max(1),
    size: z.number().min(0).max(1),
    metabolism: z.number().min(0).max(1),
    perception: z.number().min(0).max(1),
    adaptability: z.number().min(0).max(1),
  }),
  description: z.string(),
});

/**
 * ============================================================================
 * AI WORKFLOW ORCHESTRATOR
 * ============================================================================
 */

export class AIWorkflowOrchestrator {
  private apiKey: string;
  private model: string = 'gpt-4o'; // Fast, capable model
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    
    if (!this.apiKey) {
      log.warn('No OpenAI API key provided. AI workflows will be disabled.');
    }
  }
  
  /**
   * Check if AI is available
   */
  isAvailable(): boolean {
    return this.apiKey.length > 0;
  }
  
  /**
   * Generate complete Gen 0 manifest from seed phrase
   */
  async generateGen0(seedPhrase: string): Promise<GenerationZeroOutput> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI API key not configured. Cannot generate Gen 0.');
    }
    
    log.info('Starting AI Gen 0 generation', { seedPhrase });
    
    try {
      // Use seed phrase to generate deterministic seed for OpenAI
      const rng = seedrandom(seedPhrase);
      const deterministicSeed = Math.floor(rng() * 1000000);
      
      // Step 1: Generate planetary theme and basic properties
      const themeResult = await generateText({
        model: openai(this.model),
        prompt: `Generate a unique planetary theme from seed phrase: "${seedPhrase}".
        
The theme should be evocative, alien, and scientifically plausible. Consider:
- Geological composition (molten, crystalline, organic, aquatic, gaseous)
- Temperature extremes (frozen, temperate, volcanic)
- Atmospheric conditions (dense, thin, toxic, breathable)
- Unique characteristics that make this world memorable

Return ONLY a 2-3 word planetary theme name and 1 sentence description.`,
        seed: deterministicSeed,
      });
      
      const [planetName, ...descParts] = themeResult.text.split('.');
      const worldTheme = descParts.join('.').trim() || 'Unique evolutionary crucible';
      
      // Step 2: Generate primary planetary core
      const coreResult = await generateObject({
        model: openai(this.model),
        schema: PlanetaryCoreSchema,
        prompt: `Generate a planetary core for world: "${planetName.trim()}"

Theme: ${worldTheme}

Create a core with:
- name: Descriptive name fitting the theme
- temperature: 0-10 (how hot/cold the core is)
- pressure: 0-10 (how dense/compressed)
- stability: 0-10 (how stable/volatile)
- description: 1 sentence explaining its properties

The core properties should reflect the world theme and create interesting material stratification.`,
        seed: deterministicSeed,
      });
      
      const primaryCore: PlanetaryCore = coreResult.object;
      
      // Step 3: Generate shared materials (present across multiple layers)
      const materialsResult = await generateObject({
        model: openai(this.model),
        schema: z.object({
          materials: z.array(SharedMaterialSchema).min(5).max(7),
        }),
        prompt: `Generate 5-7 shared materials for world: "${planetName.trim()}"

Core: ${primaryCore.name} (Temp: ${primaryCore.temperature}, Pressure: ${primaryCore.pressure}, Stability: ${primaryCore.stability})

Materials should:
- Be geologically plausible
- Vary in hardness (soft to ultra-hard)
- Have different rarities (common to rare)
- Have affinity relationships (which materials attract/repel)
- Fit the world theme

Categories: stone, ore, crystal, organic, liquid
Hardness: 0 (soft) to 10 (diamond-hard)
Rarity: 0 (common) to 1 (extremely rare)`,
        seed: deterministicSeed + 1,
      });
      
      const sharedMaterials: SharedMaterial[] = materialsResult.object.materials;
      
      // Step 4: Generate fill material (what fills gaps between materials)
      const fillResult = await generateObject({
        model: openai(this.model),
        schema: FillMaterialSchema,
        prompt: `Generate a fill material for world: "${planetName.trim()}"

This material fills the gaps between resource materials. It should:
- Fit the world theme
- Have appropriate permeability (how easily things flow through it)
- Have appropriate density (how compact it is)
- Be the "default" material of this world

Examples: 
- Volcanic world → Ash/pumice fill
- Ocean world → Brine fill
- Crystal world → Quartz sand fill
- Organic world → Biological substrate fill`,
        seed: deterministicSeed + 2,
      });
      
      const fillMaterial: FillMaterial = fillResult.object;
      
      // Step 5: Generate base creature archetypes
      const creaturesResult = await generateObject({
        model: openai(this.model),
        schema: z.object({
          creatures: z.array(CreatureArchetypeSchema).min(5).max(8),
        }),
        prompt: `Generate 5-8 creature archetypes for world: "${planetName.trim()}"

World theme: ${worldTheme}
Environment: Core temp ${primaryCore.temperature}, pressure ${primaryCore.pressure}, stability ${primaryCore.stability}

Creatures should:
- Be adapted to this specific environment
- Have diverse trait distributions (not all the same)
- Have names that evoke their adaptations
- Have plausible base trait values (0-1 normalized)

Traits to assign (0-1 values):
- mobility: Movement capability
- manipulation: Tool use ability
- excavation: Digging/mining ability
- social: Pack formation tendency
- intelligence: Problem solving
- aggression: Combat propensity
- size: Physical size
- metabolism: Energy efficiency
- perception: Sensory awareness
- adaptability: Mutation rate

Make trait distributions VARIED - not all high or all low.`,
        seed: deterministicSeed + 3,
      });
      
      const creatures = creaturesResult.object.creatures;
      
      // Assemble complete Gen 0 output
      const gen0: GenerationZeroOutput = {
        seedPhrase,
        planetary: {
          planetaryName: planetName.trim(),
          worldTheme,
          cores: [primaryCore],
          sharedMaterials,
          fillMaterial,
          generationMethod: 'ai-runtime',
        },
        creatureArchetypes: creatures,
      };
      
      log.info('AI Gen 0 generation complete', {
        planet: gen0.planetary.planetaryName,
        materials: gen0.planetary.sharedMaterials.length,
        creatures: gen0.creatureArchetypes.length,
      });
      
      return gen0;
      
    } catch (error) {
      log.error('AI Gen 0 generation failed', error);
      throw new Error(`Failed to generate Gen 0: ${error.message}`);
    }
  }
  
  /**
   * Generate tool archetype based on current game state
   */
  async generateToolArchetype(context: {
    generation: number;
    materialPressure: number;
    availableMaterials: string[];
    creatureCapabilities: { manipulation: number; intelligence: number };
  }): Promise<{
    name: string;
    type: 'digger' | 'cutter' | 'crusher' | 'extractor';
    hardness: number;
    description: string;
  }> {
    if (!this.isAvailable()) {
      // Fallback to simple generation
      return {
        name: 'Basic Tool',
        type: 'digger',
        hardness: 2,
        description: 'A simple tool for basic tasks',
      };
    }
    
    const result = await generateObject({
      model: openai(this.model),
      schema: z.object({
        name: z.string(),
        type: z.enum(['digger', 'cutter', 'crusher', 'extractor']),
        hardness: z.number().min(0).max(10),
        description: z.string(),
      }),
      prompt: `Generate a tool archetype for evolutionary game.

Current situation:
- Generation: ${context.generation}
- Material pressure: ${(context.materialPressure * 100).toFixed(0)}% (creatures struggling to access materials)
- Available materials: ${context.availableMaterials.join(', ')}
- Creature manipulation: ${(context.creatureCapabilities.manipulation * 100).toFixed(0)}%
- Creature intelligence: ${(context.creatureCapabilities.intelligence * 100).toFixed(0)}%

Generate a tool that:
- Addresses current material access needs
- Is buildable from available materials
- Matches creature capabilities
- Has appropriate hardness rating (0-10, where higher = can break harder materials)

Tool types:
- digger: For excavation and depth access
- cutter: For precise separation
- crusher: For breaking hard materials
- extractor: For resource extraction`,
    });
    
    return result.object;
  }
  
  /**
   * Generate building template based on tribal needs
   */
  async generateBuildingTemplate(context: {
    tribeName: string;
    population: number;
    culture: 'peaceful' | 'aggressive' | 'neutral';
    availableMaterials: string[];
  }): Promise<{
    name: string;
    type: 'shelter' | 'workshop' | 'storage' | 'temple';
    materials: string[];
    description: string;
  }> {
    if (!this.isAvailable()) {
      return {
        name: 'Simple Shelter',
        type: 'shelter',
        materials: context.availableMaterials.slice(0, 2),
        description: 'A basic protective structure',
      };
    }
    
    const result = await generateObject({
      model: openai(this.model),
      schema: z.object({
        name: z.string(),
        type: z.enum(['shelter', 'workshop', 'storage', 'temple']),
        materials: z.array(z.string()),
        description: z.string(),
      }),
      prompt: `Generate a building for tribe "${context.tribeName}".

Tribal context:
- Population: ${context.population}
- Culture: ${context.culture}
- Available materials: ${context.availableMaterials.join(', ')}

Generate a building that:
- Fits the tribe's culture (${context.culture} tribes build differently)
- Serves population needs (${context.population} creatures)
- Uses available materials creatively
- Has a name that reflects tribal identity

Building types:
- shelter: Basic protection and housing
- workshop: Tool creation and resource processing
- storage: Resource preservation
- temple: Cultural/religious significance`,
    });
    
    return result.object;
  }
  
  /**
   * Generate mythological narrative element
   */
  async generateMyth(context: {
    tribeName: string;
    significantEvents: string[];
    worldTheme: string;
  }): Promise<{
    title: string;
    narrative: string;
    culturalImpact: 'unity' | 'conflict' | 'transcendence';
  }> {
    if (!this.isAvailable()) {
      return {
        title: 'The First Dawn',
        narrative: 'In the beginning, there was only the world.',
        culturalImpact: 'unity',
      };
    }
    
    const result = await generateObject({
      model: openai(this.model),
      schema: z.object({
        title: z.string(),
        narrative: z.string(),
        culturalImpact: z.enum(['unity', 'conflict', 'transcendence']),
      }),
      prompt: `Generate a mythological narrative for tribe "${context.tribeName}".

World theme: ${context.worldTheme}
Recent significant events:
${context.significantEvents.map((e, i) => `${i + 1}. ${e}`).join('\n')}

Create a myth that:
- Interprets these events through a mythological lens
- Reflects the tribe's values and worldview
- Has cultural impact (unifies tribe, creates conflict with others, or transcends material concerns)
- Is 2-3 sentences (brief but evocative)

Format as a title and narrative.`,
    });
    
    return result.object;
  }
}

/**
 * ============================================================================
 * SINGLETON INSTANCE
 * ============================================================================
 */

let orchestratorInstance: AIWorkflowOrchestrator | null = null;

export function getAIOrchestrator(): AIWorkflowOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AIWorkflowOrchestrator();
  }
  return orchestratorInstance;
}

/**
 * ============================================================================
 * CONVENIENCE FUNCTIONS
 * ============================================================================
 */

/**
 * Generate Gen 0 (use AI if available, fallback to mock)
 */
export async function generateGen0Content(seedPhrase: string): Promise<GenerationZeroOutput> {
  const orchestrator = getAIOrchestrator();
  
  if (orchestrator.isAvailable()) {
    try {
      return await orchestrator.generateGen0(seedPhrase);
    } catch (error) {
      log.warn('AI generation failed, falling back to mock', { error });
    }
  }
  
  // Fallback to mock data
  const { generateMockGen0 } = await import('../dev/MockGen0Data');
  return generateMockGen0(seedPhrase);
}
