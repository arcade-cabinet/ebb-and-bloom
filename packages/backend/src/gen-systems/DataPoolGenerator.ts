/**
 * Data Pool Generator - AI-sourced parameter pools for each generation
 * Uses deterministic seed (macro/meso/micro) + OpenAI to generate GROUNDED data
 */

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import seedrandom from 'seedrandom';
import { Planet } from '../schemas/index.js';

/**
 * Extract macro/meso/micro components from deterministic seed
 */
export function extractSeedComponents(seed: string): {
  macro: string;
  meso: string;
  micro: string;
} {
  const hash = seed.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  return {
    macro: `macro-${Math.abs(hash) % 1000000}`,
    meso: `meso-${Math.abs(hash * 7) % 1000000}`,
    micro: `micro-${Math.abs(hash * 13) % 1000000}`,
  };
}

/**
 * Gen 1: Creature archetype parameter pools
 */
export async function generateCreatureDataPools(
  planet: Planet,
  seed: string
): Promise<{
  metabolismRates: number[];
  territorialRanges: number[];
  packSizeDistributions: number[];
  traitDerivations: {
    excavation: { from: string; formula: string };
    speed: { from: string; formula: string };
    social: { from: string; formula: string };
  };
}> {
  const { macro, meso, micro } = extractSeedComponents(seed);
  
  const result = await generateObject({
    model: openai('gpt-4o'),
    prompt: `You are a xenobiologist designing realistic creature parameters for an alien planet.

PLANET PARAMETERS (from Gen 0 accretion):
- Radius: ${planet.radius}km
- Mass: ${planet.mass.toExponential(2)}kg  
- Rotation Period: ${planet.rotationPeriod}h (day/night cycle)
- Surface Gravity: ${(planet.mass / (planet.radius * 1000) ** 2 * 6.674e-11).toFixed(2)} m/s²
- Crust Materials: ${planet.layers.find(l => l.name === 'crust')?.materials.map(m => m.element).join(', ')}

SEED COMPONENTS (for deterministic selection):
- Macro: ${macro} (system-level: territorial ranges based on planet size)
- Meso: ${meso} (population-level: pack sizes based on resource density)
- Micro: ${micro} (individual-level: metabolism based on day/night cycle)

Generate realistic biological parameter POOLS (not single values, but ranges to select from):

1. METABOLISM RATES (energy consumption per cycle):
   - Consider: rotation period ${planet.rotationPeriod}h dictates circadian rhythm
   - Faster rotation = faster metabolism needed
   - Generate 5 realistic rates (J/cycle) for different metabolic strategies

2. TERRITORIAL RANGES (km radius per individual):
   - Consider: planet radius ${planet.radius}km affects travel distances
   - Smaller planet = smaller viable territories
   - Surface area determines population density limits
   - Generate 5 realistic ranges for different ecological niches

3. PACK SIZE DISTRIBUTIONS (individuals per pack):
   - Consider: resource distribution from crust composition
   - Higher material diversity = larger sustainable packs
   - Generate 5 realistic pack size curves (min/mode/max)

4. TRAIT DERIVATIONS (formulas linking traits to planetary materials):
   - Excavation trait: Derive from bone composition (calcium from limestone depth)
   - Speed trait: Derive from muscle efficiency (available proteins/amino acids)
   - Social trait: Derive from neural complexity (trace elements for neurotransmitters)
   - Provide CAUSAL FORMULAS, not arbitrary numbers

Return GROUNDED, REALISTIC values based on actual planetary physics and biology.`,
    schema: {
      type: 'object',
      properties: {
        metabolismRates: {
          type: 'array',
          items: { type: 'number' },
          minItems: 5,
          maxItems: 5,
        },
        territorialRanges: {
          type: 'array',
          items: { type: 'number' },
          minItems: 5,
          maxItems: 5,
        },
        packSizeDistributions: {
          type: 'array',
          items: { type: 'number' },
          minItems: 5,
          maxItems: 5,
        },
        traitDerivations: {
          type: 'object',
          properties: {
            excavation: {
              type: 'object',
              properties: {
                from: { type: 'string' },
                formula: { type: 'string' },
              },
              required: ['from', 'formula'],
            },
            speed: {
              type: 'object',
              properties: {
                from: { type: 'string' },
                formula: { type: 'string' },
              },
              required: ['from', 'formula'],
            },
            social: {
              type: 'object',
              properties: {
                from: { type: 'string' },
                formula: { type: 'string' },
              },
              required: ['from', 'formula'],
            },
          },
          required: ['excavation', 'speed', 'social'],
        },
      },
      required: ['metabolismRates', 'territorialRanges', 'packSizeDistributions', 'traitDerivations'],
    },
  });

  return result.object;
}

/**
 * Gen 2: Pack formation parameter pools
 */
export async function generatePackDataPools(
  planet: Planet,
  seed: string,
  creaturePools: Awaited<ReturnType<typeof generateCreatureDataPools>>
): Promise<{
  formationThresholds: number[];
  cohesionFactors: number[];
  dispersalTriggers: number[];
  derivations: {
    proximity: { from: string; formula: string };
    scarcity: { from: string; formula: string };
  };
}> {
  const { macro, meso, micro } = extractSeedComponents(seed);

  const result = await generateObject({
    model: openai('gpt-4o'),
    prompt: `You are an ethologist studying pack formation dynamics on an alien world.

CREATURE PARAMETERS (from Gen 1):
- Territorial Ranges: ${creaturePools.territorialRanges.join(', ')} km
- Metabolism Rates: ${creaturePools.metabolismRates.join(', ')} J/cycle
- Pack Size Distributions: ${creaturePools.packSizeDistributions.join(', ')} individuals

PLANET CONTEXT:
- Surface Area: ${(4 * Math.PI * (planet.radius * 1000) ** 2 / 1e6).toExponential(2)} km²
- Resource Density: ${planet.layers.find(l => l.name === 'crust')?.materials.reduce((sum, m) => sum + m.quantity, 0)} kg/km³

SEED COMPONENTS:
- Macro: ${macro} (system: when do packs form vs stay solo?)
- Meso: ${meso} (group: optimal pack sizes for survival)
- Micro: ${micro} (individual: proximity thresholds for pack membership)

Generate realistic pack formation parameter POOLS:

1. FORMATION THRESHOLDS (survival rate improvement needed):
   - When does pack formation increase survival enough to offset coordination costs?
   - Generate 5 thresholds (0-1 scale) for different resource scarcities

2. COHESION FACTORS (force keeping packs together):
   - Predation pressure, resource sharing, reproductive success
   - Generate 5 cohesion strength values (0-1 scale)

3. DISPERSAL TRIGGERS (when packs break apart):
   - Resource depletion, overpopulation, genetic diversity needs
   - Generate 5 dispersal threshold values (0-1 scale)

4. DERIVATIONS (formulas linking pack behavior to environment):
   - Proximity threshold: Derive from territorial range + resource density
   - Scarcity threshold: Derive from metabolism + available food supply
   - Provide CAUSAL FORMULAS

Return GROUNDED values based on actual ethology and ecology.`,
    schema: {
      type: 'object',
      properties: {
        formationThresholds: { type: 'array', items: { type: 'number' }, minItems: 5, maxItems: 5 },
        cohesionFactors: { type: 'array', items: { type: 'number' }, minItems: 5, maxItems: 5 },
        dispersalTriggers: { type: 'array', items: { type: 'number' }, minItems: 5, maxItems: 5 },
        derivations: {
          type: 'object',
          properties: {
            proximity: {
              type: 'object',
              properties: {
                from: { type: 'string' },
                formula: { type: 'string' },
              },
              required: ['from', 'formula'],
            },
            scarcity: {
              type: 'object',
              properties: {
                from: { type: 'string' },
                formula: { type: 'string' },
              },
              required: ['from', 'formula'],
            },
          },
          required: ['proximity', 'scarcity'],
        },
      },
      required: ['formationThresholds', 'cohesionFactors', 'dispersalTriggers', 'derivations'],
    },
  });

  return result.object;
}

/**
 * Deterministically select from AI-generated pool using seed component
 */
export function selectFromPool<T>(pool: T[], seedComponent: string): T {
  const rng = seedrandom(seedComponent);
  const index = Math.floor(rng() * pool.length);
  return pool[index];
}
