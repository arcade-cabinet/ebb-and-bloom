/**
 * Complete Generation Data Pool System
 * AI-generates MACRO/MESO/MICRO data pools for EVERY generation
 * Uses deterministic seed components to select strategies from pools
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
 * Deterministically select from AI-generated pool using seed component
 */
export function selectFromPool<T>(pool: T[], seedComponent: string): T {
  const rng = seedrandom(seedComponent);
  const index = Math.floor(rng() * pool.length);
  return pool[index];
}

// ============================================================================
// GEN 0: PLANETARY FORMATION
// ============================================================================

export async function generateGen0DataPools(seed: string): Promise<{
  macro: {
    stellarContexts: string[];  // Population I/II star, post-supernova, binary system
    selectedContext: string;
  };
  meso: {
    accretionDynamics: string[];  // Hot/cold zone, giant impacts, comet bombardment
    selectedDynamics: string;
  };
  micro: {
    elementDistributions: string[];  // Metal-rich, carbon-rich, volatile abundance
    selectedDistribution: string;
  };
}> {
  const { macro, meso, micro } = extractSeedComponents(seed);

  const result = await generateObject({
    model: openai('gpt-4o'),
    prompt: `You are an astrophysicist designing diverse planetary formation scenarios.

Generate VARIETY in planetary formation (not just Earth-like):

**MACRO - Stellar System Context:**
Generate 5 different stellar contexts that would create DIFFERENT planetary compositions:
- Population I star (metal-rich, like our Sun)
- Population II star (metal-poor, early universe)
- Post-supernova enrichment (heavy element rich)
- Binary star system (complex orbital dynamics)
- Red dwarf system (long-lived, tidally locked planets)

**MESO - Accretion Dynamics:**
Generate 5 different accretion scenarios:
- Hot accretion zone (close to star, volatiles burned off)
- Cold accretion zone (far from star, ices abundant)
- Giant impact phase (massive collisions, core mixing)
- Late heavy bombardment (water/organics delivery)
- Smooth accretion (gradual, layered composition)

**MICRO - Element Distributions:**
Generate 5 different element profiles (NOT just Earth's):
- Iron-rich (heavy metal core, magnetic field)
- Carbon-rich (diamond layers, hydrocarbon seas)
- Silicate-rich (rocky, low metals)
- Volatile-rich (thick atmosphere, subsurface oceans)
- Rare earth enriched (unusual chemistry, exotic materials)

Return CREATIVE but PHYSICALLY GROUNDED scenarios.`,
    schema: {
      type: 'object',
      properties: {
        macro: {
          type: 'object',
          properties: {
            stellarContexts: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 5 },
          },
          required: ['stellarContexts'],
        },
        meso: {
          type: 'object',
          properties: {
            accretionDynamics: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 5 },
          },
          required: ['accretionDynamics'],
        },
        micro: {
          type: 'object',
          properties: {
            elementDistributions: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 5 },
          },
          required: ['elementDistributions'],
        },
      },
      required: ['macro', 'meso', 'micro'],
    },
  });

  // Deterministically select from pools using seed components
  return {
    macro: {
      stellarContexts: result.object.macro.stellarContexts,
      selectedContext: selectFromPool(result.object.macro.stellarContexts, macro),
    },
    meso: {
      accretionDynamics: result.object.meso.accretionDynamics,
      selectedDynamics: selectFromPool(result.object.meso.accretionDynamics, meso),
    },
    micro: {
      elementDistributions: result.object.micro.elementDistributions,
      selectedDistribution: selectFromPool(result.object.micro.elementDistributions, micro),
    },
  };
}

// ============================================================================
// GEN 1: CREATURES
// ============================================================================

export async function generateGen1DataPools(planet: Planet, seed: string): Promise<{
  macro: {
    biomeStructures: string[];
    selectedStructure: string;
  };
  meso: {
    populationDynamics: string[];
    selectedDynamics: string;
  };
  micro: {
    physiologyTypes: string[];
    selectedPhysiology: string;
  };
}> {
  const { macro, meso, micro } = extractSeedComponents(seed);

  const result = await generateObject({
    model: openai('gpt-4o'),
    prompt: `You are a xenobiologist designing creature evolution for an alien planet.

PLANET CONTEXT (from Gen 0):
- Radius: ${planet.radius}km
- Mass: ${planet.mass.toExponential(2)}kg
- Rotation: ${planet.rotationPeriod}h
- Gravity: ${(planet.mass / (planet.radius * 1000) ** 2 * 6.674e-11).toFixed(2)} m/s²
- Materials: ${planet.layers.find(l => l.name === 'crust')?.materials.map(m => m.element).join(', ')}

**MACRO - Biome/Niche Structure:**
Generate 5 different ecological niche structures:
- Predator-heavy (top-down pressure)
- Herbivore-dominated (bottom-up abundance)
- Scavenger-based (decay cycle dominant)
- Cooperative symbiotic (mutualism primary)
- Specialist micro-niches (extreme diversity)

**MESO - Population Dynamics:**
Generate 5 population dynamic patterns based on planet size and rotation:
- Fast turnover (short lives, rapid evolution)
- Stable equilibrium (long lives, slow change)
- Boom-bust cycles (resource-driven oscillation)
- Gradual expansion (frontier colonization)
- Territorial stasis (fixed carrying capacity)

**MICRO - Individual Physiology:**
Generate 5 physiology types based on gravity ${(planet.mass / (planet.radius * 1000) ** 2 * 6.674e-11).toFixed(2)} m/s² and day length ${planet.rotationPeriod}h:
- High metabolism (fast, short-lived, energy-intensive)
- Low metabolism (slow, long-lived, efficient)
- Adaptive metabolism (switches based on conditions)
- Extreme endurance (marathon not sprint)
- Burst activity (short intense periods)

Return GROUNDED biological strategies.`,
    schema: {
      type: 'object',
      properties: {
        macro: {
          type: 'object',
          properties: {
            biomeStructures: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 5 },
          },
          required: ['biomeStructures'],
        },
        meso: {
          type: 'object',
          properties: {
            populationDynamics: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 5 },
          },
          required: ['populationDynamics'],
        },
        micro: {
          type: 'object',
          properties: {
            physiologyTypes: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 5 },
          },
          required: ['physiologyTypes'],
        },
      },
      required: ['macro', 'meso', 'micro'],
    },
  });

  return {
    macro: {
      biomeStructures: result.object.macro.biomeStructures,
      selectedStructure: selectFromPool(result.object.macro.biomeStructures, macro),
    },
    meso: {
      populationDynamics: result.object.meso.populationDynamics,
      selectedDynamics: selectFromPool(result.object.meso.populationDynamics, meso),
    },
    micro: {
      physiologyTypes: result.object.micro.physiologyTypes,
      selectedPhysiology: selectFromPool(result.object.micro.physiologyTypes, micro),
    },
  };
}

// ============================================================================
// GEN 2: PACKS
// ============================================================================

export async function generateGen2DataPools(
  planet: Planet,
  gen1Data: Awaited<ReturnType<typeof generateGen1DataPools>>,
  seed: string
): Promise<{
  macro: {
    territorialGeographies: string[];
    selectedGeography: string;
  };
  meso: {
    packSociologies: string[];
    selectedSociology: string;
  };
  micro: {
    individualBehaviors: string[];
    selectedBehavior: string;
  };
}> {
  const { macro, meso, micro } = extractSeedComponents(seed);

  const result = await generateObject({
    model: openai('gpt-4o'),
    prompt: `You are an ethologist studying pack formation dynamics.

CREATURE CONTEXT (from Gen 1):
- Biome Structure: ${gen1Data.macro.selectedStructure}
- Population Dynamics: ${gen1Data.meso.selectedDynamics}
- Physiology: ${gen1Data.micro.selectedPhysiology}

PLANET CONTEXT:
- Surface Area: ${(4 * Math.PI * (planet.radius * 1000) ** 2 / 1e6).toExponential(2)} km²
- Resource Distribution: ${gen1Data.macro.selectedStructure}

**MACRO - Territorial Geography:**
Generate 5 territorial patterns based on planet surface area and resource distribution:
- Nomadic migration corridors
- Fixed resource hotspot territories
- Seasonal rotation zones
- Contested border regions
- Cooperative shared territories

**MESO - Pack Sociology:**
Generate 5 pack formation strategies:
- Kinship-based (family groups)
- Performance-based (strongest lead)
- Cooperative specialists (role diversity)
- Temporary alliances (situational)
- Permanent hierarchies (stable structure)

**MICRO - Individual Pack Behavior:**
Generate 5 individual role types within packs:
- Dominant leaders (decision makers)
- Scouts/sentries (information gatherers)
- Hunters/foragers (resource providers)
- Defenders/warriors (security)
- Caregivers/teachers (knowledge transfer)

Return ETHOLOGICALLY GROUNDED pack dynamics.`,
    schema: {
      type: 'object',
      properties: {
        macro: {
          type: 'object',
          properties: {
            territorialGeographies: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 5 },
          },
          required: ['territorialGeographies'],
        },
        meso: {
          type: 'object',
          properties: {
            packSociologies: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 5 },
          },
          required: ['packSociologies'],
        },
        micro: {
          type: 'object',
          properties: {
            individualBehaviors: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 5 },
          },
          required: ['individualBehaviors'],
        },
      },
      required: ['macro', 'meso', 'micro'],
    },
  });

  return {
    macro: {
      territorialGeographies: result.object.macro.territorialGeographies,
      selectedGeography: selectFromPool(result.object.macro.territorialGeographies, macro),
    },
    meso: {
      packSociologies: result.object.meso.packSociologies,
      selectedSociology: selectFromPool(result.object.meso.packSociologies, meso),
    },
    micro: {
      individualBehaviors: result.object.micro.individualBehaviors,
      selectedBehavior: selectFromPool(result.object.micro.individualBehaviors, micro),
    },
  };
}

// ============================================================================
// GEN 3: TOOLS
// ============================================================================

export async function generateGen3DataPools(
  planet: Planet,
  gen2Data: Awaited<ReturnType<typeof generateGen2DataPools>>,
  seed: string
): Promise<{
  macro: {
    toolEcosystems: string[];
    selectedEcosystem: string;
  };
  meso: {
    toolCategories: string[];
    selectedCategory: string;
  };
  micro: {
    toolProperties: string[];
    selectedProperties: string;
  };
}> {
  const { macro, meso, micro } = extractSeedComponents(seed);

  const result = await generateObject({
    model: openai('gpt-4o'),
    prompt: `You are a technological anthropologist studying tool emergence.

PACK CONTEXT (from Gen 2):
- Territorial Pattern: ${gen2Data.macro.selectedGeography}
- Pack Sociology: ${gen2Data.meso.selectedSociology}
- Individual Roles: ${gen2Data.micro.selectedBehavior}

PLANET MATERIALS:
- Available: ${planet.layers.find(l => l.name === 'crust')?.materials.map(m => m.element).join(', ')}

**MACRO - Tool Ecosystems:**
Generate 5 tool ecosystem patterns (how tools spread/evolve):
- Centralized innovation (inventor → followers)
- Distributed experimentation (many parallel inventors)
- Cultural transmission (teaching chains)
- Trial-and-error convergence (independent discovery)
- Specialized guild systems (expert development)

**MESO - Tool Categories:**
Generate 5 tool category trees based on pack needs:
- Extraction tools (digging, mining, harvesting)
- Processing tools (cutting, grinding, refining)
- Construction tools (building, joining, shaping)
- Weapon tools (hunting, defense, warfare)
- Social tools (communication, trade, record-keeping)

**MICRO - Tool Properties:**
Generate 5 property profiles based on available materials:
- Durable heavy tools (stone, metal - long lasting)
- Light portable tools (wood, bone - easily carried)
- Composite tools (multiple materials - specialized)
- Expendable tools (single use, abundant materials)
- Precision tools (fine work, rare materials)

Return ANTHROPOLOGICALLY GROUNDED tool evolution.`,
    schema: {
      type: 'object',
      properties: {
        macro: {
          type: 'object',
          properties: {
            toolEcosystems: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 5 },
          },
          required: ['toolEcosystems'],
        },
        meso: {
          type: 'object',
          properties: {
            toolCategories: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 5 },
          },
          required: ['toolCategories'],
        },
        micro: {
          type: 'object',
          properties: {
            toolProperties: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 5 },
          },
          required: ['toolProperties'],
        },
      },
      required: ['macro', 'meso', 'micro'],
    },
  });

  return {
    macro: {
      toolEcosystems: result.object.macro.toolEcosystems,
      selectedEcosystem: selectFromPool(result.object.macro.toolEcosystems, macro),
    },
    meso: {
      toolCategories: result.object.meso.toolCategories,
      selectedCategory: selectFromPool(result.object.meso.toolCategories, meso),
    },
    micro: {
      toolProperties: result.object.micro.toolProperties,
      selectedProperties: selectFromPool(result.object.micro.toolProperties, micro),
    },
  };
}

// ============================================================================
// GEN 4: TRIBES
// ============================================================================

export async function generateGen4DataPools(
  planet: Planet,
  gen3Data: Awaited<ReturnType<typeof generateGen3DataPools>>,
  seed: string
): Promise<{
  macro: {
    tribalNetworks: string[];
    selectedNetwork: string;
  };
  meso: {
    tribalStructures: string[];
    selectedStructure: string;
  };
  micro: {
    individualRoles: string[];
    selectedRole: string;
  };
}> {
  const { macro, meso, micro } = extractSeedComponents(seed);

  const result = await generateObject({
    model: openai('gpt-4o'),
    prompt: `You are a sociologist studying tribal formation.

TOOL CONTEXT (from Gen 3):
- Tool Ecosystem: ${gen3Data.macro.selectedEcosystem}
- Tool Categories: ${gen3Data.meso.selectedCategory}
- Tool Properties: ${gen3Data.micro.selectedProperties}

**MACRO - Tribal Networks:**
Generate 5 inter-tribal relationship patterns:
- Isolated autonomy (no contact)
- Trade networks (resource exchange)
- Alliance confederations (mutual defense)
- Conquest hierarchies (dominant/subordinate)
- Cultural exchange zones (shared traditions)

**MESO - Tribal Structure:**
Generate 5 governance systems:
- Elder councils (age-based wisdom)
- Meritocratic leadership (skill-based)
- Hereditary dynasties (bloodline succession)
- Democratic assemblies (group consensus)
- Spiritual theocracies (religious authority)

**MICRO - Individual Roles:**
Generate 5 specialized tribal positions:
- Chieftains/leaders (authority)
- Shamans/healers (spiritual/medical)
- Craftsmen/artisans (production)
- Warriors/defenders (security)
- Merchants/traders (exchange)

Return SOCIOLOGICALLY GROUNDED tribal dynamics.`,
    schema: {
      type: 'object',
      properties: {
        macro: {
          type: 'object',
          properties: {
            tribalNetworks: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 5 },
          },
          required: ['tribalNetworks'],
        },
        meso: {
          type: 'object',
          properties: {
            tribalStructures: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 5 },
          },
          required: ['tribalStructures'],
        },
        micro: {
          type: 'object',
          properties: {
            individualRoles: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 5 },
          },
          required: ['individualRoles'],
        },
      },
      required: ['macro', 'meso', 'micro'],
    },
  });

  return {
    macro: {
      tribalNetworks: result.object.macro.tribalNetworks,
      selectedNetwork: selectFromPool(result.object.macro.tribalNetworks, macro),
    },
    meso: {
      tribalStructures: result.object.meso.tribalStructures,
      selectedStructure: selectFromPool(result.object.meso.tribalStructures, meso),
    },
    micro: {
      individualRoles: result.object.micro.individualRoles,
      selectedRole: selectFromPool(result.object.micro.individualRoles, micro),
    },
  };
}

// ============================================================================
// GEN 5: BUILDINGS
// ============================================================================

export async function generateGen5DataPools(
  planet: Planet,
  gen4Data: Awaited<ReturnType<typeof generateGen4DataPools>>,
  seed: string
): Promise<{
  macro: {
    settlementPatterns: string[];
    selectedPattern: string;
  };
  meso: {
    buildingTypes: string[];
    selectedType: string;
  };
  micro: {
    buildingProperties: string[];
    selectedProperties: string;
  };
}> {
  const { macro, meso, micro } = extractSeedComponents(seed);

  const result = await generateObject({
    model: openai('gpt-4o'),
    prompt: `You are an architectural historian studying settlement evolution.

TRIBAL CONTEXT (from Gen 4):
- Tribal Network: ${gen4Data.macro.selectedNetwork}
- Governance: ${gen4Data.meso.selectedStructure}
- Specialized Roles: ${gen4Data.micro.selectedRole}

**MACRO - Settlement Patterns:**
Generate 5 urban/rural development patterns:
- Dispersed homesteads (rural, isolated)
- Clustered villages (small, connected)
- Urban centers with hinterlands (city-states)
- Linear networks (trade route settlements)
- Fortified strongholds (defensive positions)

**MESO - Building Types:**
Generate 5 building category priorities:
- Residential (housing, family structures)
- Industrial (workshops, processing facilities)
- Religious (temples, shrines)
- Administrative (governance, record-keeping)
- Commercial (markets, storage, trade)

**MICRO - Building Properties:**
Generate 5 construction characteristic profiles:
- Massive permanent (stone, generations-lasting)
- Modular adaptive (wood, easily modified)
- Organic integrated (living materials, sustainable)
- Defensive fortified (thick walls, strategic)
- Aesthetic symbolic (decorative, cultural identity)

Return ARCHITECTURALLY GROUNDED building evolution.`,
    schema: {
      type: 'object',
      properties: {
        macro: {
          type: 'object',
          properties: {
            settlementPatterns: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 5 },
          },
          required: ['settlementPatterns'],
        },
        meso: {
          type: 'object',
          properties: {
            buildingTypes: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 5 },
          },
          required: ['buildingTypes'],
        },
        micro: {
          type: 'object',
          properties: {
            buildingProperties: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 5 },
          },
          required: ['buildingProperties'],
        },
      },
      required: ['macro', 'meso', 'micro'],
    },
  });

  return {
    macro: {
      settlementPatterns: result.object.macro.settlementPatterns,
      selectedPattern: selectFromPool(result.object.macro.settlementPatterns, macro),
    },
    meso: {
      buildingTypes: result.object.meso.buildingTypes,
      selectedType: selectFromPool(result.object.meso.buildingTypes, meso),
    },
    micro: {
      buildingProperties: result.object.micro.buildingProperties,
      selectedProperties: selectFromPool(result.object.micro.buildingProperties, micro),
    },
  };
}

// ============================================================================
// GEN 6: RELIGION & DEMOCRACY
// ============================================================================

export async function generateGen6DataPools(
  planet: Planet,
  gen5Data: Awaited<ReturnType<typeof generateGen5DataPools>>,
  seed: string
): Promise<{
  macro: {
    ideologicalSystems: string[];
    selectedSystem: string;
  };
  meso: {
    institutions: string[];
    selectedInstitution: string;
  };
  micro: {
    individualBeliefs: string[];
    selectedBelief: string;
  };
}> {
  const { macro, meso, micro } = extractSeedComponents(seed);

  const result = await generateObject({
    model: openai('gpt-4o'),
    prompt: `You are a religious studies and political science scholar studying belief system emergence.

SETTLEMENT CONTEXT (from Gen 5):
- Settlement Pattern: ${gen5Data.macro.selectedPattern}
- Building Priorities: ${gen5Data.meso.selectedType}
- Construction Style: ${gen5Data.micro.selectedProperties}

**MACRO - Ideological Systems:**
Generate 5 belief system frameworks:
- Animistic cosmology (nature spirits, elemental forces)
- Ancestor worship (reverence for predecessors)
- Monotheistic revelation (single divine authority)
- Polytheistic pantheon (multiple specialized deities)
- Philosophical rationalism (logic-based ethics)

**MESO - Institutions:**
Generate 5 organizational structures:
- Priestly hierarchies (religious authority)
- Democratic assemblies (collective governance)
- Legal codices (rule of law)
- Educational academies (knowledge preservation)
- Charitable orders (social welfare)

**MICRO - Individual Beliefs:**
Generate 5 personal practice types:
- Devout practitioners (daily rituals, strict adherence)
- Pragmatic believers (situational faith)
- Skeptical participants (social conformity)
- Zealous converts (intense commitment)
- Syncretic blenders (multiple tradition mixing)

Return CULTURALLY GROUNDED ideological evolution.`,
    schema: {
      type: 'object',
      properties: {
        macro: {
          type: 'object',
          properties: {
            ideologicalSystems: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 5 },
          },
          required: ['ideologicalSystems'],
        },
        meso: {
          type: 'object',
          properties: {
            institutions: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 5 },
          },
          required: ['institutions'],
        },
        micro: {
          type: 'object',
          properties: {
            individualBeliefs: { type: 'array', items: { type: 'string' }, minItems: 5, maxItems: 5 },
          },
          required: ['individualBeliefs'],
        },
      },
      required: ['macro', 'meso', 'micro'],
    },
  });

  return {
    macro: {
      ideologicalSystems: result.object.macro.ideologicalSystems,
      selectedSystem: selectFromPool(result.object.macro.ideologicalSystems, macro),
    },
    meso: {
      institutions: result.object.meso.institutions,
      selectedInstitution: selectFromPool(result.object.meso.institutions, meso),
    },
    micro: {
      individualBeliefs: result.object.micro.individualBeliefs,
      selectedBelief: selectFromPool(result.object.micro.individualBeliefs, micro),
    },
  };
}

/**
 * Master function: Generate complete WARP & WEFT for entire game
 */
export async function generateCompleteGameData(planet: Planet, seed: string) {
  console.log('Generating complete game data pools...');
  
  const gen0 = await generateGen0DataPools(seed);
  console.log('✅ Gen 0 data pools generated');
  
  const gen1 = await generateGen1DataPools(planet, seed);
  console.log('✅ Gen 1 data pools generated');
  
  const gen2 = await generateGen2DataPools(planet, gen1, seed);
  console.log('✅ Gen 2 data pools generated');
  
  const gen3 = await generateGen3DataPools(planet, gen2, seed);
  console.log('✅ Gen 3 data pools generated');
  
  const gen4 = await generateGen4DataPools(planet, gen3, seed);
  console.log('✅ Gen 4 data pools generated');
  
  const gen5 = await generateGen5DataPools(planet, gen4, seed);
  console.log('✅ Gen 5 data pools generated');
  
  const gen6 = await generateGen6DataPools(planet, gen5, seed);
  console.log('✅ Gen 6 data pools generated');
  
  return {
    gen0,
    gen1,
    gen2,
    gen3,
    gen4,
    gen5,
    gen6,
  };
}
