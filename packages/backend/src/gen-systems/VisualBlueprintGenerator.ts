/**
 * Complete Visual Blueprint System
 * AI-generates rendering instructions, causal rules, and compatibility matrices
 * for EVERY generation at EVERY scale
 */

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import seedrandom from 'seedrandom';
import { z } from 'zod';
import { Planet } from '../schemas/index.js';

/**
 * Universal Visual Blueprint Structure
 * Used across ALL generations for consistent rendering instructions
 */
export interface VisualBlueprint {
  // Identity
  description: string;
  
  // Causal Rules (what this enables/prevents)
  canCreate: string[];
  cannotCreate: string[];
  
  // Visual Mapping (how to render)
  representations: {
    materials: string[];  // AmbientCG texture paths
    shaders: {
      metallic?: number;
      roughness?: number;
      translucency?: number;
      emissive?: string;
      [key: string]: any;
    };
    proceduralRules: string;  // Noise functions, distribution patterns
    colorPalette: string[];  // Hex codes
  };
  
  // Compatibility Matrix
  compatibleWith: string[];  // What this works with
  incompatibleWith: string[];  // What this conflicts with
  
  // Composition Rules (how to combine with other elements)
  compositionRules: string;
}

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
 * Deterministically select from AI-generated pool using seed component
 */
export function selectFromPool<T>(pool: T[], seedComponent: string): T {
  const rng = seedrandom(seedComponent);
  const index = Math.floor(rng() * pool.length);
  return pool[index];
}

// ============================================================================
// GEN 0: PLANETARY FORMATION WITH COMPLETE VISUAL BLUEPRINTS
// ============================================================================

export async function generateGen0DataPools(seed: string): Promise<{
  macro: {
    stellarContexts: string[];
    selectedContext: string;
    visualBlueprint: VisualBlueprint;
  };
  meso: {
    accretionDynamics: string[];
    selectedDynamics: string;
    visualBlueprint: VisualBlueprint;
  };
  micro: {
    elementDistributions: string[];
    selectedDistribution: string;
    visualBlueprint: VisualBlueprint;
  };
}> {
  const { macro, meso, micro } = extractSeedComponents(seed);

  const result = await generateObject({
    model: openai('gpt-4o'),
    prompt: `You are creating COMPLETE VISUAL BLUEPRINTS for planetary formation.

Generate 5 options for EACH scale with FULL rendering instructions:

**MACRO - Stellar System Context:**
For each of 5 stellar contexts, provide:
- Description: What makes this unique
- canCreate: ["magnetic fields", "tidal locking", "binary shadows"]
- cannotCreate: ["stable orbits" for binary, "thick atmosphere" for close orbits]
- representations.materials: Specific AmbientCG texture paths from /public/textures/
  Available: metal/Metal001-035.jpg, rock/Rock001-018.jpg, concrete/Concrete001-020.jpg, 
  grass/Grass001-008.jpg, fabric/Fabric001-019.jpg, leather/Leather001-020.jpg, 
  wood/Wood001-011.jpg, bricks/Bricks001-020.jpg
- representations.shaders: PBR values (metallic: 0-1, roughness: 0-1, emissive: hex)
- representations.proceduralRules: "PerlinNoise(seed, octaves=4, frequency=0.5) for crater distribution"
- representations.colorPalette: ["#FF6B35", "#004E89", "#1A1A1D"]
- compatibleWith: ["high gravity creatures", "tidally locked ecosystems"]
- incompatibleWith: ["complex orbital mechanics", "seasonal variations"]
- compositionRules: "Layer base metallic with rust overlay, blend with height map"

**MESO - Accretion Dynamics:**
For each of 5 accretion scenarios, provide same structure focusing on:
- Surface features (craters, flows, layering)
- Terrain generation rules
- Material blending instructions

**MICRO - Element Distributions:**
For each of 5 element profiles, provide same structure focusing on:
- Core/mantle/crust material assignments
- Depth-based shader transitions
- Chemical compatibility rules

Return COMPLETE, VISUALLY IMPLEMENTABLE blueprints.`,
    schema: {
      type: 'object',
      properties: {
        macro: {
          type: 'object',
          properties: {
            options: {
              type: 'array',
              minItems: 5,
              maxItems: 5,
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  visualBlueprint: {
                    type: 'object',
                    properties: {
                      description: { type: 'string' },
                      canCreate: { type: 'array', items: { type: 'string' } },
                      cannotCreate: { type: 'array', items: { type: 'string' } },
                      representations: {
                        type: 'object',
                        properties: {
                          materials: { type: 'array', items: { type: 'string' } },
                          shaders: { type: 'object' },
                          proceduralRules: { type: 'string' },
                          colorPalette: { type: 'array', items: { type: 'string' } },
                        },
                        required: ['materials', 'shaders', 'proceduralRules', 'colorPalette'],
                      },
                      compatibleWith: { type: 'array', items: { type: 'string' } },
                      incompatibleWith: { type: 'array', items: { type: 'string' } },
                      compositionRules: { type: 'string' },
                    },
                    required: ['description', 'canCreate', 'cannotCreate', 'representations', 'compatibleWith', 'incompatibleWith', 'compositionRules'],
                  },
                },
                required: ['name', 'visualBlueprint'],
              },
            },
          },
          required: ['options'],
        },
        meso: {
          type: 'object',
          properties: {
            options: {
              type: 'array',
              minItems: 5,
              maxItems: 5,
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  visualBlueprint: {
                    type: 'object',
                    properties: {
                      description: { type: 'string' },
                      canCreate: { type: 'array', items: { type: 'string' } },
                      cannotCreate: { type: 'array', items: { type: 'string' } },
                      representations: {
                        type: 'object',
                        properties: {
                          materials: { type: 'array', items: { type: 'string' } },
                          shaders: { type: 'object' },
                          proceduralRules: { type: 'string' },
                          colorPalette: { type: 'array', items: { type: 'string' } },
                        },
                        required: ['materials', 'shaders', 'proceduralRules', 'colorPalette'],
                      },
                      compatibleWith: { type: 'array', items: { type: 'string' } },
                      incompatibleWith: { type: 'array', items: { type: 'string' } },
                      compositionRules: { type: 'string' },
                    },
                    required: ['description', 'canCreate', 'cannotCreate', 'representations', 'compatibleWith', 'incompatibleWith', 'compositionRules'],
                  },
                },
                required: ['name', 'visualBlueprint'],
              },
            },
          },
          required: ['options'],
        },
        micro: {
          type: 'object',
          properties: {
            options: {
              type: 'array',
              minItems: 5,
              maxItems: 5,
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  visualBlueprint: {
                    type: 'object',
                    properties: {
                      description: { type: 'string' },
                      canCreate: { type: 'array', items: { type: 'string' } },
                      cannotCreate: { type: 'array', items: { type: 'string' } },
                      representations: {
                        type: 'object',
                        properties: {
                          materials: { type: 'array', items: { type: 'string' } },
                          shaders: { type: 'object' },
                          proceduralRules: { type: 'string' },
                          colorPalette: { type: 'array', items: { type: 'string' } },
                        },
                        required: ['materials', 'shaders', 'proceduralRules', 'colorPalette'],
                      },
                      compatibleWith: { type: 'array', items: { type: 'string' } },
                      incompatibleWith: { type: 'array', items: { type: 'string' } },
                      compositionRules: { type: 'string' },
                    },
                    required: ['description', 'canCreate', 'cannotCreate', 'representations', 'compatibleWith', 'incompatibleWith', 'compositionRules'],
                  },
                },
                required: ['name', 'visualBlueprint'],
              },
            },
          },
          required: ['options'],
        },
      },
      required: ['macro', 'meso', 'micro'],
    },
  });

  const macroOption = selectFromPool(result.object.macro.options, macro);
  const mesoOption = selectFromPool(result.object.meso.options, meso);
  const microOption = selectFromPool(result.object.micro.options, micro);

  return {
    macro: {
      stellarContexts: result.object.macro.options.map(o => o.name),
      selectedContext: macroOption.name,
      visualBlueprint: macroOption.visualBlueprint,
    },
    meso: {
      accretionDynamics: result.object.meso.options.map(o => o.name),
      selectedDynamics: mesoOption.name,
      visualBlueprint: mesoOption.visualBlueprint,
    },
    micro: {
      elementDistributions: result.object.micro.options.map(o => o.name),
      selectedDistribution: microOption.name,
      visualBlueprint: microOption.visualBlueprint,
    },
  };
}

// ============================================================================
// GEN 1: CREATURES WITH VISUAL BLUEPRINTS
// ============================================================================

export async function generateGen1DataPools(
  planet: Planet,
  gen0Data: Awaited<ReturnType<typeof generateGen0DataPools>>,
  seed: string
): Promise<{
  macro: {
    biomeStructures: string[];
    selectedStructure: string;
    visualBlueprint: VisualBlueprint;
  };
  meso: {
    populationDynamics: string[];
    selectedDynamics: string;
    visualBlueprint: VisualBlueprint;
  };
  micro: {
    physiologyTypes: string[];
    selectedPhysiology: string;
    visualBlueprint: VisualBlueprint;
  };
}> {
  const { macro, meso, micro } = extractSeedComponents(seed);

  const result = await generateObject({
    model: openai('gpt-4o'),
    prompt: `You are creating COMPLETE VISUAL BLUEPRINTS for creature rendering.

PLANET CONTEXT (from Gen 0):
- Stellar: ${gen0Data.macro.selectedContext} → ${gen0Data.macro.visualBlueprint.description}
- Surface: ${gen0Data.meso.selectedDynamics} → ${gen0Data.meso.visualBlueprint.description}
- Elements: ${gen0Data.micro.selectedDistribution} → ${gen0Data.micro.visualBlueprint.description}
- Available materials: ${gen0Data.micro.visualBlueprint.representations.materials.join(', ')}
- Planet colors: ${gen0Data.macro.visualBlueprint.representations.colorPalette.join(', ')}

Generate 5 options for EACH scale with FULL creature rendering instructions:

**MACRO - Biome/Niche Structure:**
For each biome structure, provide:
- canCreate: ["camouflage patterns", "pack behaviors", "territorial markings"]
- cannotCreate: ["flight" if high gravity, "large size" if low resources]
- representations.materials: Creature skin/fur textures (use leather/Leather*.jpg, fabric/Fabric*.jpg)
- representations.shaders: Creature surface properties
- representations.proceduralRules: "Generate spots/stripes with FBM noise, size=trait.camouflage*10"
- representations.colorPalette: Creature color schemes (should complement OR contrast planet colors)
- compatibleWith: ["pack formations" if social niches, "tool use" if manipulation niches]
- incompatibleWith: ["solitary behavior" if cooperation-based]
- compositionRules: "Base body mesh + procedural texture + trait-based modifiers (size, limbs)"

**MESO - Population Dynamics:**
Focus on:
- How populations render (swarms vs individuals)
- Movement patterns (migration flows, territorial boundaries)
- Population density visualization

**MICRO - Individual Physiology:**
Focus on:
- Individual creature mesh requirements
- Animation skeleton needs
- Trait-based visual variations (speed → sleek body, strength → bulk)

Return blueprints that DERIVE FROM planetary conditions (${gen0Data.macro.selectedContext} creates ${gen0Data.macro.visualBlueprint.canCreate.join(', ')}).`,
    schema: {
      type: 'object',
      properties: {
        macro: {
          type: 'object',
          properties: {
            options: {
              type: 'array',
              minItems: 5,
              maxItems: 5,
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  visualBlueprint: {
                    type: 'object',
                    properties: {
                      description: { type: 'string' },
                      canCreate: { type: 'array', items: { type: 'string' } },
                      cannotCreate: { type: 'array', items: { type: 'string' } },
                      representations: {
                        type: 'object',
                        properties: {
                          materials: { type: 'array', items: { type: 'string' } },
                          shaders: { type: 'object' },
                          proceduralRules: { type: 'string' },
                          colorPalette: { type: 'array', items: { type: 'string' } },
                        },
                        required: ['materials', 'shaders', 'proceduralRules', 'colorPalette'],
                      },
                      compatibleWith: { type: 'array', items: { type: 'string' } },
                      incompatibleWith: { type: 'array', items: { type: 'string' } },
                      compositionRules: { type: 'string' },
                    },
                    required: ['description', 'canCreate', 'cannotCreate', 'representations', 'compatibleWith', 'incompatibleWith', 'compositionRules'],
                  },
                },
                required: ['name', 'visualBlueprint'],
              },
            },
          },
          required: ['options'],
        },
        meso: {
          type: 'object',
          properties: {
            options: {
              type: 'array',
              minItems: 5,
              maxItems: 5,
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  visualBlueprint: {
                    type: 'object',
                    properties: {
                      description: { type: 'string' },
                      canCreate: { type: 'array', items: { type: 'string' } },
                      cannotCreate: { type: 'array', items: { type: 'string' } },
                      representations: {
                        type: 'object',
                        properties: {
                          materials: { type: 'array', items: { type: 'string' } },
                          shaders: { type: 'object' },
                          proceduralRules: { type: 'string' },
                          colorPalette: { type: 'array', items: { type: 'string' } },
                        },
                        required: ['materials', 'shaders', 'proceduralRules', 'colorPalette'],
                      },
                      compatibleWith: { type: 'array', items: { type: 'string' } },
                      incompatibleWith: { type: 'array', items: { type: 'string' } },
                      compositionRules: { type: 'string' },
                    },
                    required: ['description', 'canCreate', 'cannotCreate', 'representations', 'compatibleWith', 'incompatibleWith', 'compositionRules'],
                  },
                },
                required: ['name', 'visualBlueprint'],
              },
            },
          },
          required: ['options'],
        },
        micro: {
          type: 'object',
          properties: {
            options: {
              type: 'array',
              minItems: 5,
              maxItems: 5,
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  visualBlueprint: {
                    type: 'object',
                    properties: {
                      description: { type: 'string' },
                      canCreate: { type: 'array', items: { type: 'string' } },
                      cannotCreate: { type: 'array', items: { type: 'string' } },
                      representations: {
                        type: 'object',
                        properties: {
                          materials: { type: 'array', items: { type: 'string' } },
                          shaders: { type: 'object' },
                          proceduralRules: { type: 'string' },
                          colorPalette: { type: 'array', items: { type: 'string' } },
                        },
                        required: ['materials', 'shaders', 'proceduralRules', 'colorPalette'],
                      },
                      compatibleWith: { type: 'array', items: { type: 'string' } },
                      incompatibleWith: { type: 'array', items: { type: 'string' } },
                      compositionRules: { type: 'string' },
                    },
                    required: ['description', 'canCreate', 'cannotCreate', 'representations', 'compatibleWith', 'incompatibleWith', 'compositionRules'],
                  },
                },
                required: ['name', 'visualBlueprint'],
              },
            },
          },
          required: ['options'],
        },
      },
      required: ['macro', 'meso', 'micro'],
    },
  });

  const macroOption = selectFromPool(result.object.macro.options, macro);
  const mesoOption = selectFromPool(result.object.meso.options, meso);
  const microOption = selectFromPool(result.object.micro.options, micro);

  return {
    macro: {
      biomeStructures: result.object.macro.options.map(o => o.name),
      selectedStructure: macroOption.name,
      visualBlueprint: macroOption.visualBlueprint,
    },
    meso: {
      populationDynamics: result.object.meso.options.map(o => o.name),
      selectedDynamics: mesoOption.name,
      visualBlueprint: mesoOption.visualBlueprint,
    },
    micro: {
      physiologyTypes: result.object.micro.options.map(o => o.name),
      selectedPhysiology: microOption.name,
      visualBlueprint: microOption.visualBlueprint,
    },
  };
}

// ============================================================================
// GEN 2: PACKS WITH VISUAL BLUEPRINTS
// ============================================================================

export async function generateGen2DataPools(
  planet: Planet,
  gen1Data: Awaited<ReturnType<typeof generateGen1DataPools>>,
  seed: string
): Promise<{
  macro: {
    territorialGeographies: string[];
    selectedGeography: string;
    visualBlueprint: VisualBlueprint;
  };
  meso: {
    packSociologies: string[];
    selectedSociology: string;
    visualBlueprint: VisualBlueprint;
  };
  micro: {
    individualBehaviors: string[];
    selectedBehavior: string;
    visualBlueprint: VisualBlueprint;
  };
}> {
  const { macro, meso, micro } = extractSeedComponents(seed);

  const result = await generateObject({
    model: openai('gpt-4o'),
    prompt: `You are creating COMPLETE VISUAL BLUEPRINTS for pack rendering.

CREATURE CONTEXT (from Gen 1):
- Biome: ${gen1Data.macro.selectedStructure}
- Creatures can create: ${gen1Data.macro.visualBlueprint.canCreate.join(', ')}
- Creature colors: ${gen1Data.micro.visualBlueprint.representations.colorPalette.join(', ')}

Generate 5 options for EACH scale with FULL pack rendering instructions:

**MACRO - Territorial Geography:**
For each territorial pattern, provide:
- canCreate: ["migration trails", "border markers", "shared hunting grounds"]
- cannotCreate: ["permanent structures" if nomadic, "isolated behavior" if cooperative]
- representations.materials: Territory marking visuals (use grass/Grass*.jpg for trails, rock/Rock*.jpg for markers)
- representations.proceduralRules: "Voronoi cells for territories, edges=contested zones, alpha=pack.cohesion"
- representations.colorPalette: Territory color overlays
- compatibleWith: ["tool caches" if fixed territories, "seasonal buildings" if migratory]
- compositionRules: "Overlay territory heatmap on terrain, blend based on pack activity"

**MESO - Pack Sociology:**
Focus on:
- Pack cohesion visual markers (proximity clustering, shared color tints)
- Leadership hierarchy indicators (size differentials, position in formation)
- Inter-pack relationship visualization (hostile=red edges, friendly=green)

**MICRO - Individual Pack Behavior:**
Focus on:
- Individual role visual cues (scouts=faster animation, defenders=larger size)
- Pack membership indicators (family groups share color family)
- Behavioral state visualization (hunting=alert posture, resting=relaxed)

Return blueprints that DERIVE FROM creature capabilities (${gen1Data.macro.visualBlueprint.canCreate.join(', ')} enables pack behaviors).`,
    schema: {
      type: 'object',
      properties: {
        macro: {
          type: 'object',
          properties: {
            options: {
              type: 'array',
              minItems: 5,
              maxItems: 5,
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  visualBlueprint: {
                    type: 'object',
                    properties: {
                      description: { type: 'string' },
                      canCreate: { type: 'array', items: { type: 'string' } },
                      cannotCreate: { type: 'array', items: { type: 'string' } },
                      representations: {
                        type: 'object',
                        properties: {
                          materials: { type: 'array', items: { type: 'string' } },
                          shaders: { type: 'object' },
                          proceduralRules: { type: 'string' },
                          colorPalette: { type: 'array', items: { type: 'string' } },
                        },
                        required: ['materials', 'shaders', 'proceduralRules', 'colorPalette'],
                      },
                      compatibleWith: { type: 'array', items: { type: 'string' } },
                      incompatibleWith: { type: 'array', items: { type: 'string' } },
                      compositionRules: { type: 'string' },
                    },
                    required: ['description', 'canCreate', 'cannotCreate', 'representations', 'compatibleWith', 'incompatibleWith', 'compositionRules'],
                  },
                },
                required: ['name', 'visualBlueprint'],
              },
            },
          },
          required: ['options'],
        },
        meso: {
          type: 'object',
          properties: {
            options: {
              type: 'array',
              minItems: 5,
              maxItems: 5,
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  visualBlueprint: {
                    type: 'object',
                    properties: {
                      description: { type: 'string' },
                      canCreate: { type: 'array', items: { type: 'string' } },
                      cannotCreate: { type: 'array', items: { type: 'string' } },
                      representations: {
                        type: 'object',
                        properties: {
                          materials: { type: 'array', items: { type: 'string' } },
                          shaders: { type: 'object' },
                          proceduralRules: { type: 'string' },
                          colorPalette: { type: 'array', items: { type: 'string' } },
                        },
                        required: ['materials', 'shaders', 'proceduralRules', 'colorPalette'],
                      },
                      compatibleWith: { type: 'array', items: { type: 'string' } },
                      incompatibleWith: { type: 'array', items: { type: 'string' } },
                      compositionRules: { type: 'string' },
                    },
                    required: ['description', 'canCreate', 'cannotCreate', 'representations', 'compatibleWith', 'incompatibleWith', 'compositionRules'],
                  },
                },
                required: ['name', 'visualBlueprint'],
              },
            },
          },
          required: ['options'],
        },
        micro: {
          type: 'object',
          properties: {
            options: {
              type: 'array',
              minItems: 5,
              maxItems: 5,
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  visualBlueprint: {
                    type: 'object',
                    properties: {
                      description: { type: 'string' },
                      canCreate: { type: 'array', items: { type: 'string' } },
                      cannotCreate: { type: 'array', items: { type: 'string' } },
                      representations: {
                        type: 'object',
                        properties: {
                          materials: { type: 'array', items: { type: 'string' } },
                          shaders: { type: 'object' },
                          proceduralRules: { type: 'string' },
                          colorPalette: { type: 'array', items: { type: 'string' } },
                        },
                        required: ['materials', 'shaders', 'proceduralRules', 'colorPalette'],
                      },
                      compatibleWith: { type: 'array', items: { type: 'string' } },
                      incompatibleWith: { type: 'array', items: { type: 'string' } },
                      compositionRules: { type: 'string' },
                    },
                    required: ['description', 'canCreate', 'cannotCreate', 'representations', 'compatibleWith', 'incompatibleWith', 'compositionRules'],
                  },
                },
                required: ['name', 'visualBlueprint'],
              },
            },
          },
          required: ['options'],
        },
      },
      required: ['macro', 'meso', 'micro'],
    },
  });

  const macroOption = selectFromPool(result.object.macro.options, macro);
  const mesoOption = selectFromPool(result.object.meso.options, meso);
  const microOption = selectFromPool(result.object.micro.options, micro);

  return {
    macro: {
      territorialGeographies: result.object.macro.options.map(o => o.name),
      selectedGeography: macroOption.name,
      visualBlueprint: macroOption.visualBlueprint,
    },
    meso: {
      packSociologies: result.object.meso.options.map(o => o.name),
      selectedSociology: mesoOption.name,
      visualBlueprint: mesoOption.visualBlueprint,
    },
    micro: {
      individualBehaviors: result.object.micro.options.map(o => o.name),
      selectedBehavior: microOption.name,
      visualBlueprint: microOption.visualBlueprint,
    },
  };
}

/**
 * Master function: Generate complete WARP & WEFT with FULL visual blueprints
 */
export async function generateCompleteGameData(planet: Planet, seed: string) {
  console.log('🎨 Generating complete game data with visual blueprints...');
  
  const gen0 = await generateGen0DataPools(seed);
  console.log('✅ Gen 0: Planet visual blueprints generated');
  console.log(`   Stellar: ${gen0.macro.selectedContext}`);
  console.log(`   Materials: ${gen0.micro.visualBlueprint.representations.materials.join(', ')}`);
  
  const gen1 = await generateGen1DataPools(planet, gen0, seed);
  console.log('✅ Gen 1: Creature visual blueprints generated');
  console.log(`   Biome: ${gen1.macro.selectedStructure}`);
  console.log(`   Can create: ${gen1.macro.visualBlueprint.canCreate.join(', ')}`);
  
  const gen2 = await generateGen2DataPools(planet, gen1, seed);
  console.log('✅ Gen 2: Pack visual blueprints generated');
  console.log(`   Territory: ${gen2.macro.selectedGeography}`);
  console.log(`   Compatible with: ${gen2.macro.visualBlueprint.compatibleWith.join(', ')}`);
  
  // TODO: Gen 3-6 (continuing pattern)
  
  return {
    gen0,
    gen1,
    gen2,
    // gen3, gen4, gen5, gen6
  };
}

// ============================================================================
// GEN 3: TOOL EMERGENCE WITH COMPLETE VISUAL BLUEPRINTS
// ============================================================================

export async function generateGen3DataPools(
  planet: Planet,
  gen2Data: any,
  seed: string
): Promise<{
  macro: { materialCategories: string[]; selectedCategory: string; visualBlueprint: VisualBlueprint };
  meso: { craftingMethods: string[]; selectedMethod: string; visualBlueprint: VisualBlueprint };
  micro: { toolTypesOptions: Array<{name: string; purpose: string; visualBlueprint: VisualBlueprint}>; selectedType: any };
}> {
  const { macro, meso, micro } = extractSeedComponents(seed + '-gen3');

  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: z.object({
      macro: z.object({
        options: z.array(z.object({
          name: z.string().describe('Material category'),
          visualBlueprint: z.object({
            description: z.string(),
            canCreate: z.array(z.string()),
            cannotCreate: z.array(z.string()),
            representations: z.object({
              materials: z.array(z.string()),
              shaders: z.object({
                metallic: z.number().optional(),
                roughness: z.number().optional(),
                translucency: z.number().optional(),
                emissive: z.string().optional(),
              }),
              proceduralRules: z.string(),
              colorPalette: z.array(z.string()),
            }),
            compatibleWith: z.array(z.string()),
            incompatibleWith: z.array(z.string()),
            compositionRules: z.string(),
          }),
        })).length(5),
      }),
      meso: z.object({
        options: z.array(z.object({
          name: z.string().describe('Crafting method'),
          visualBlueprint: z.object({
            description: z.string(),
            canCreate: z.array(z.string()),
            cannotCreate: z.array(z.string()),
            representations: z.object({
              materials: z.array(z.string()),
              shaders: z.object({
                metallic: z.number().optional(),
                roughness: z.number().optional(),
                translucency: z.number().optional(),
                emissive: z.string().optional(),
              }),
              proceduralRules: z.string(),
              colorPalette: z.array(z.string()),
            }),
            compatibleWith: z.array(z.string()),
            incompatibleWith: z.array(z.string()),
            compositionRules: z.string(),
          }),
        })).length(5),
      }),
      micro: z.object({
        options: z.array(z.object({
          name: z.string().describe('Tool type'),
          purpose: z.string(),
          visualBlueprint: z.object({
            description: z.string(),
            canCreate: z.array(z.string()),
            cannotCreate: z.array(z.string()),
            representations: z.object({
              materials: z.array(z.string()),
              shaders: z.object({
                metallic: z.number().optional(),
                roughness: z.number().optional(),
                translucency: z.number().optional(),
                emissive: z.string().optional(),
              }),
              proceduralRules: z.string(),
              colorPalette: z.array(z.string()),
            }),
            compatibleWith: z.array(z.string()),
            incompatibleWith: z.array(z.string()),
            compositionRules: z.string(),
          }),
        })).length(5),
      }),
    }),
    prompt: `Given pack behaviors: ${gen2Data.macro.selectedGeography}, generate tool emergence options.
    
MACRO - Material Categories (5 options):
Based on planet's crust materials, provide 5 material categories suitable for tool-making.
For each: complete VisualBlueprint with AmbientCG textures, PBR properties, causal rules.

MESO - Crafting Methods (5 options):
Based on creature intelligence and available materials, provide 5 crafting techniques.
For each: complete VisualBlueprint including procedural rules, compatibility.

MICRO - Tool Types (5 options):
Based on pack problems and material availability, provide 5 specific tool types.
For each: name, purpose, complete VisualBlueprint.

Use AmbientCG texture paths from ${gen2Data.macro.visualBlueprint.representations.materials.join(', ')}.`,
  });

  const macroOption = selectFromPool(result.object.macro.options, macro);
  const mesoOption = selectFromPool(result.object.meso.options, meso);
  const microOption = selectFromPool(result.object.micro.options, micro);

  return {
    macro: {
      materialCategories: result.object.macro.options.map(o => o.name),
      selectedCategory: macroOption.name,
      visualBlueprint: macroOption.visualBlueprint,
    },
    meso: {
      craftingMethods: result.object.meso.options.map(o => o.name),
      selectedMethod: mesoOption.name,
      visualBlueprint: mesoOption.visualBlueprint,
    },
    micro: {
      toolTypesOptions: result.object.micro.options,
      selectedType: microOption,
    },
  };
}

// ============================================================================
// GEN 4: TRIBE FORMATION WITH COMPLETE VISUAL BLUEPRINTS
// ============================================================================

export async function generateGen4DataPools(
  planet: Planet,
  gen3Data: any,
  seed: string
): Promise<{
  macro: { tribalStructures: string[]; selectedStructure: string; visualBlueprint: VisualBlueprint };
  meso: { governanceTypes: string[]; selectedGovernance: string; visualBlueprint: VisualBlueprint };
  micro: { tribalTraditions: string[]; selectedTradition: string; visualBlueprint: VisualBlueprint };
}> {
  const { macro, meso, micro } = extractSeedComponents(seed + '-gen4');

  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: z.object({
      macro: z.object({
        options: z.array(z.object({
          name: z.string().describe('Tribal structure'),
          visualBlueprint: z.object({
            description: z.string(),
            canCreate: z.array(z.string()),
            cannotCreate: z.array(z.string()),
            representations: z.object({
              materials: z.array(z.string()),
              shaders: z.object({
                metallic: z.number().optional(),
                roughness: z.number().optional(),
                translucency: z.number().optional(),
                emissive: z.string().optional(),
              }),
              proceduralRules: z.string(),
              colorPalette: z.array(z.string()),
            }),
            compatibleWith: z.array(z.string()),
            incompatibleWith: z.array(z.string()),
            compositionRules: z.string(),
          }),
        })).length(5),
      }),
      meso: z.object({
        options: z.array(z.object({
          name: z.string().describe('Governance type'),
          visualBlueprint: z.object({
            description: z.string(),
            canCreate: z.array(z.string()),
            cannotCreate: z.array(z.string()),
            representations: z.object({
              materials: z.array(z.string()),
              shaders: z.object({
                metallic: z.number().optional(),
                roughness: z.number().optional(),
                translucency: z.number().optional(),
                emissive: z.string().optional(),
              }),
              proceduralRules: z.string(),
              colorPalette: z.array(z.string()),
            }),
            compatibleWith: z.array(z.string()),
            incompatibleWith: z.array(z.string()),
            compositionRules: z.string(),
          }),
        })).length(5),
      }),
      micro: z.object({
        options: z.array(z.object({
          name: z.string().describe('Tribal tradition'),
          visualBlueprint: z.object({
            description: z.string(),
            canCreate: z.array(z.string()),
            cannotCreate: z.array(z.string()),
            representations: z.object({
              materials: z.array(z.string()),
              shaders: z.object({
                metallic: z.number().optional(),
                roughness: z.number().optional(),
                translucency: z.number().optional(),
                emissive: z.string().optional(),
              }),
              proceduralRules: z.string(),
              colorPalette: z.array(z.string()),
            }),
            compatibleWith: z.array(z.string()),
            incompatibleWith: z.array(z.string()),
            compositionRules: z.string(),
          }),
        })).length(5),
      }),
    }),
    prompt: `Given tool use: ${gen3Data.micro.selectedType.name}, generate tribal formation options.
    
Provide complete VisualBlueprints for:
MACRO - Tribal structures (hierarchical, egalitarian, etc)
MESO - Governance types (elder council, warrior leadership, etc)
MICRO - Tribal traditions (sharing, competition, etc)`,
  });

  const macroOption = selectFromPool(result.object.macro.options, macro);
  const mesoOption = selectFromPool(result.object.meso.options, meso);
  const microOption = selectFromPool(result.object.micro.options, micro);

  return {
    macro: {
      tribalStructures: result.object.macro.options.map(o => o.name),
      selectedStructure: macroOption.name,
      visualBlueprint: macroOption.visualBlueprint,
    },
    meso: {
      governanceTypes: result.object.meso.options.map(o => o.name),
      selectedGovernance: mesoOption.name,
      visualBlueprint: mesoOption.visualBlueprint,
    },
    micro: {
      tribalTraditions: result.object.micro.options.map(o => o.name),
      selectedTradition: microOption.name,
      visualBlueprint: microOption.visualBlueprint,
    },
  };
}

// ============================================================================
// GEN 5: BUILDING CONSTRUCTION WITH COMPLETE VISUAL BLUEPRINTS
// ============================================================================

export async function generateGen5DataPools(
  planet: Planet,
  gen4Data: any,
  seed: string
): Promise<{
  macro: { buildingStyles: string[]; selectedStyle: string; visualBlueprint: VisualBlueprint };
  meso: { constructionTechniques: string[]; selectedTechnique: string; visualBlueprint: VisualBlueprint };
  micro: { buildingTypesOptions: Array<{name: string; purpose: string; visualBlueprint: VisualBlueprint}>; selectedType: any };
}> {
  const { macro, meso, micro } = extractSeedComponents(seed + '-gen5');

  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: z.object({
      macro: z.object({
        options: z.array(z.object({
          name: z.string().describe('Building style'),
          visualBlueprint: z.object({
            description: z.string(),
            canCreate: z.array(z.string()),
            cannotCreate: z.array(z.string()),
            representations: z.object({
              materials: z.array(z.string()),
              shaders: z.object({
                metallic: z.number().optional(),
                roughness: z.number().optional(),
                translucency: z.number().optional(),
                emissive: z.string().optional(),
              }),
              proceduralRules: z.string(),
              colorPalette: z.array(z.string()),
            }),
            compatibleWith: z.array(z.string()),
            incompatibleWith: z.array(z.string()),
            compositionRules: z.string(),
          }),
        })).length(5),
      }),
      meso: z.object({
        options: z.array(z.object({
          name: z.string().describe('Construction technique'),
          visualBlueprint: z.object({
            description: z.string(),
            canCreate: z.array(z.string()),
            cannotCreate: z.array(z.string()),
            representations: z.object({
              materials: z.array(z.string()),
              shaders: z.object({
                metallic: z.number().optional(),
                roughness: z.number().optional(),
                translucency: z.number().optional(),
                emissive: z.string().optional(),
              }),
              proceduralRules: z.string(),
              colorPalette: z.array(z.string()),
            }),
            compatibleWith: z.array(z.string()),
            incompatibleWith: z.array(z.string()),
            compositionRules: z.string(),
          }),
        })).length(5),
      }),
      micro: z.object({
        options: z.array(z.object({
          name: z.string().describe('Building type'),
          purpose: z.string(),
          visualBlueprint: z.object({
            description: z.string(),
            canCreate: z.array(z.string()),
            cannotCreate: z.array(z.string()),
            representations: z.object({
              materials: z.array(z.string()),
              shaders: z.object({
                metallic: z.number().optional(),
                roughness: z.number().optional(),
                translucency: z.number().optional(),
                emissive: z.string().optional(),
              }),
              proceduralRules: z.string(),
              colorPalette: z.array(z.string()),
            }),
            compatibleWith: z.array(z.string()),
            incompatibleWith: z.array(z.string()),
            compositionRules: z.string(),
          }),
        })).length(5),
      }),
    }),
    prompt: `Given tribal structure: ${gen4Data.macro.selectedStructure}, generate building options.
    
Provide complete VisualBlueprints for:
MACRO - Building styles (organic, geometric, defensive, etc)
MESO - Construction techniques (stacking, weaving, mortaring, etc)
MICRO - Building types (shelter, workshop, storage, gathering, etc) with purposes`,
  });

  const macroOption = selectFromPool(result.object.macro.options, macro);
  const mesoOption = selectFromPool(result.object.meso.options, meso);
  const microOption = selectFromPool(result.object.micro.options, micro);

  return {
    macro: {
      buildingStyles: result.object.macro.options.map(o => o.name),
      selectedStyle: macroOption.name,
      visualBlueprint: macroOption.visualBlueprint,
    },
    meso: {
      constructionTechniques: result.object.meso.options.map(o => o.name),
      selectedTechnique: mesoOption.name,
      visualBlueprint: mesoOption.visualBlueprint,
    },
    micro: {
      buildingTypesOptions: result.object.micro.options,
      selectedType: microOption,
    },
  };
}

// ============================================================================
// GEN 6: RELIGION & DEMOCRACY WITH COMPLETE VISUAL BLUEPRINTS
// ============================================================================

export async function generateGen6DataPools(
  planet: Planet,
  gen5Data: any,
  seed: string
): Promise<{
  macro: { cosmologies: string[]; selectedCosmology: string; visualBlueprint: VisualBlueprint };
  meso: { ritualTypes: string[]; selectedRitualType: string; visualBlueprint: VisualBlueprint };
  micro: { beliefsOptions: Array<{name: string; domain: string; visualBlueprint: VisualBlueprint}>; selectedBelief: any };
}> {
  const { macro, meso, micro } = extractSeedComponents(seed + '-gen6');

  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: z.object({
      macro: z.object({
        options: z.array(z.object({
          name: z.string().describe('Cosmology type'),
          visualBlueprint: z.object({
            description: z.string(),
            canCreate: z.array(z.string()),
            cannotCreate: z.array(z.string()),
            representations: z.object({
              materials: z.array(z.string()),
              shaders: z.object({
                metallic: z.number().optional(),
                roughness: z.number().optional(),
                translucency: z.number().optional(),
                emissive: z.string().optional(),
              }),
              proceduralRules: z.string(),
              colorPalette: z.array(z.string()),
            }),
            compatibleWith: z.array(z.string()),
            incompatibleWith: z.array(z.string()),
            compositionRules: z.string(),
          }),
        })).length(5),
      }),
      meso: z.object({
        options: z.array(z.object({
          name: z.string().describe('Ritual type'),
          visualBlueprint: z.object({
            description: z.string(),
            canCreate: z.array(z.string()),
            cannotCreate: z.array(z.string()),
            representations: z.object({
              materials: z.array(z.string()),
              shaders: z.object({
                metallic: z.number().optional(),
                roughness: z.number().optional(),
                translucency: z.number().optional(),
                emissive: z.string().optional(),
              }),
              proceduralRules: z.string(),
              colorPalette: z.array(z.string()),
            }),
            compatibleWith: z.array(z.string()),
            incompatibleWith: z.array(z.string()),
            compositionRules: z.string(),
          }),
        })).length(5),
      }),
      micro: z.object({
        options: z.array(z.object({
          name: z.string().describe('Core belief'),
          domain: z.string(),
          visualBlueprint: z.object({
            description: z.string(),
            canCreate: z.array(z.string()),
            cannotCreate: z.array(z.string()),
            representations: z.object({
              materials: z.array(z.string()),
              shaders: z.object({
                metallic: z.number().optional(),
                roughness: z.number().optional(),
                translucency: z.number().optional(),
                emissive: z.string().optional(),
              }),
              proceduralRules: z.string(),
              colorPalette: z.array(z.string()),
            }),
            compatibleWith: z.array(z.string()),
            incompatibleWith: z.array(z.string()),
            compositionRules: z.string(),
          }),
        })).length(5),
      }),
    }),
    prompt: `Given building types: ${gen5Data.micro.selectedType.name}, generate religion/democracy options.
    
Provide complete VisualBlueprints for:
MACRO - Cosmologies (creation myths, cyclical time, etc)
MESO - Ritual types (seasonal, lifecycle, decision-making, etc)
MICRO - Core beliefs (afterlife, justice, nature spirits, etc) with domains`,
  });

  const macroOption = selectFromPool(result.object.macro.options, macro);
  const mesoOption = selectFromPool(result.object.meso.options, meso);
  const microOption = selectFromPool(result.object.micro.options, micro);

  return {
    macro: {
      cosmologies: result.object.macro.options.map(o => o.name),
      selectedCosmology: macroOption.name,
      visualBlueprint: macroOption.visualBlueprint,
    },
    meso: {
      ritualTypes: result.object.meso.options.map(o => o.name),
      selectedRitualType: mesoOption.name,
      visualBlueprint: mesoOption.visualBlueprint,
    },
    micro: {
      beliefsOptions: result.object.micro.options,
      selectedBelief: microOption,
    },
  };
}

// ============================================================================
// COMPLETE GAME GENERATION (UPDATED WITH ALL 6 GENS)
// ============================================================================

export async function generateCompleteGameData(planet: Planet, seed: string) {
  console.log('🎨 Generating complete game data with visual blueprints...');
  
  const gen0 = await generateGen0DataPools(seed);
  console.log('✅ Gen 0: Planet');
  
  const gen1 = await generateGen1DataPools(planet, gen0, seed);
  console.log('✅ Gen 1: Creatures');
  
  const gen2 = await generateGen2DataPools(planet, gen1, seed);
  console.log('✅ Gen 2: Packs');
  
  const gen3 = await generateGen3DataPools(planet, gen2, seed);
  console.log('✅ Gen 3: Tools');
  
  const gen4 = await generateGen4DataPools(planet, gen3, seed);
  console.log('✅ Gen 4: Tribes');
  
  const gen5 = await generateGen5DataPools(planet, gen4, seed);
  console.log('✅ Gen 5: Buildings');
  
  const gen6 = await generateGen6DataPools(planet, gen5, seed);
  console.log('✅ Gen 6: Religion & Democracy');
  
  return { gen0, gen1, gen2, gen3, gen4, gen5, gen6 };
}
