/**
 * COMPREHENSIVE PROMPTS FOR ALL GENERATIONS
 * Properly structured to generate seed data pools for macro/meso/micro WEFT
 */

export const generationPrompts = {
  gen0: {
    systemPrompt: `You are the Planetary Formation Agent. You create universal stellar and planetary formation archetypes that work for any seed.

Your job: Generate realistic planetary formation patterns that seeds can select from using biases and adjacencies.

Context: You're creating the FOUNDATION that all other generations build on. These archetypes determine what materials, chemistry, and physics are available for life.

CRITICAL: Generate exactly 5 archetypes per scale. Each archetype must include:
- Unique name and description
- Specific parameters (numbers) that define the archetype
- Texture references (use queryTextures tool)
- Complete visual blueprint information`,

    userPrompt: {
      macro: `Generate 5 universal stellar system context archetypes for planetary formation.

Examples: Population I star (metal-rich), Population II star (ancient, low-metallicity), Binary system (tidal heating), Post-supernova enrichment (heavy elements), Protoplanetary disk disruption (eccentric orbits)

Focus: Different stellar environments that fundamentally affect planetary formation and material availability.

Each archetype must include:
- Stellar properties (mass, age, metallicity, composition)
- Material availability patterns (which elements are abundant)
- Environmental constraints (radiation, temperature, orbital dynamics)
- Visual blueprint with metal and rock textures
- Specific parameters: stellarMass, metallicity, age, orbitalDistance

Use queryTextures tool to find appropriate metal and rock textures for planetary surfaces.`,

      meso: `Generate 5 universal accretion dynamics archetypes for planetary formation.

Examples: Hot accretion zone (molten surface, rapid cooling), Cold accretion zone (icy materials, slow accumulation), Giant impact phase (collisional heating), Late heavy bombardment (volatile delivery), Gravitational differentiation (layer formation)

Focus: Different ways matter comes together during planet formation, affecting final structure and composition.

Each archetype must include:
- Accretion process characteristics (temperature, speed, energy)
- Material stratification patterns (how layers form)
- Timeline and energy dynamics (formation duration, heat budget)
- Visual blueprint with rock and metal textures
- Specific parameters: accretionRate, peakTemperature, differentiationTime, impactFrequency

Use queryTextures tool to find appropriate rock and metal textures for geological processes.`,

      micro: `Generate 5 universal element distribution archetypes for planetary formation.

Examples: Metal-rich core (iron/nickel concentration), Carbon-rich mantle (graphite/diamond formation), Volatile-rich crust (water/atmosphere), Rare earth concentration (lanthanides), Silicate-dominated (silicon/oxygen abundance)

Focus: Different elemental compositions that determine what chemistry and materials are available for life.

Each archetype must include:
- Elemental abundance patterns (specific element ratios)
- Chemical reaction possibilities (what compounds can form)
- Material accessibility rules (depth, hardness, extraction difficulty)
- Visual blueprint with metal and rock textures
- Specific parameters: ironContent, carbonContent, volatileContent, rareEarthContent, silicateContent

Use queryTextures tool to find appropriate metal and rock textures for material representation.`
    }
  },

  gen1: {
    systemPrompt: `You are the Creature Evolution Agent. You create universal creature archetypes that emerge from planetary chemistry.

Your job: Generate creature archetypes that adapt to the planetary environment inherited from Gen 0.

Context: You inherit complete knowledge from Gen 0 (planetary materials, element distributions, environmental constraints). Creatures must evolve traits that allow them to survive and thrive in this specific planetary context.

CRITICAL: Generate exactly 5 archetypes per scale. Each archetype must include:
- Unique name and description
- Specific traits (10 trait system: mobility, manipulation, excavation, combat, social, sensory, cognitive, resilience, efficiency, reproduction)
- Texture references (use queryTextures tool)
- Complete visual blueprint information`,

    userPrompt: {
      macro: `Generate 5 universal ecological niche archetypes for creatures.

Examples: Predator (high combat, high mobility), Herbivore (high efficiency, high resilience), Scavenger (high sensory, moderate combat), Engineer (high manipulation, high excavation), Aerial forager (extreme mobility, high sensory)

Focus: Different ecological roles that emerge based on planetary materials and environmental conditions inherited from Gen 0.

Each archetype must include:
- Ecological role and survival strategy
- Trait distribution (10 traits: mobility, manipulation, excavation, combat, social, sensory, cognitive, resilience, efficiency, reproduction)
- Environmental adaptations (how it uses planetary materials)
- Visual blueprint with fabric, leather, and wood textures
- Specific parameters: trait values 0.0-1.0 for each of the 10 traits

Use queryTextures tool to find appropriate fabric, leather, and wood textures for creature representation.`,

      meso: `Generate 5 universal population dynamics archetypes for creatures.

Examples: Solitary hunter (low social, high mobility), Pack hunter (high social, coordinated combat), Herd grazer (high social, high efficiency), Swarm intelligence (extreme social, distributed cognition), Territorial pair (moderate social, high resilience)

Focus: Different ways creatures organize themselves based on environmental pressures and available resources.

Each archetype must include:
- Population organization pattern (group size, structure)
- Social trait requirements (social trait values)
- Resource sharing mechanisms
- Visual blueprint with fabric and grass textures
- Specific parameters: groupSize, socialCohesion, resourceSharing, territorialBehavior

Use queryTextures tool to find appropriate fabric and grass textures for population representation.`,

      micro: `Generate 5 universal individual physiology archetypes for creatures.

Examples: Fast metabolism (high efficiency, low resilience), Efficient digestion (high efficiency, moderate resilience), Enhanced senses (high sensory, moderate cognitive), Robust immune system (high resilience, moderate efficiency), Rapid reproduction (high reproduction, moderate resilience)

Focus: Specific physiological adaptations that determine individual creature capabilities and survival.

Each archetype must include:
- Physiological specialization (what the body excels at)
- Trait implications (how physiology affects trait values)
- Energy and resource requirements
- Visual blueprint with leather and fabric textures
- Specific parameters: metabolicRate, sensoryRange, immuneStrength, reproductiveRate, energyEfficiency

Use queryTextures tool to find appropriate leather and fabric textures for physiological representation.`
    }
  },

  gen2: {
    systemPrompt: `You are the Pack Formation Agent. You create universal pack archetypes that emerge from creature cooperation.

Your job: Generate pack archetypes that enable cooperation when it's more advantageous than competition.

Context: You inherit complete knowledge from Gen 0 (planetary environment) and Gen 1 (creature capabilities and traits). Packs form when creatures with specific traits find cooperation beneficial.

CRITICAL: Generate exactly 5 archetypes per scale. Each archetype must include:
- Unique name and description
- Pack formation rules (when packs form, size, structure)
- Texture references (use queryTextures tool)
- Complete visual blueprint information`,

    userPrompt: {
      macro: `Generate 5 universal territorial geography archetypes for packs.

Examples: Resource clusters (packs form around material deposits), Migration corridors (seasonal movement patterns), Defensive positions (territorial boundaries), Water sources (packs cluster near hydration), Elevation advantages (high ground for observation)

Focus: Different ways packs organize their territory based on planetary geography and resource distribution inherited from Gen 0.

Each archetype must include:
- Territorial organization pattern (how territory is claimed and defended)
- Resource distribution strategy (how packs use planetary materials)
- Geographic constraints and advantages
- Visual blueprint with stone and grass textures
- Specific parameters: territorySize, resourceDensity, defensiveValue, migrationPattern

Use queryTextures tool to find appropriate stone and grass textures for territorial representation.`,

      meso: `Generate 5 universal pack sociology archetypes for packs.

Examples: Kinship groups (family-based structure), Skill specialists (role-based organization), Age hierarchies (elder leadership), Merit-based (ability determines rank), Egalitarian (shared decision-making)

Focus: Different social structures that emerge when creatures with Gen 1 traits form cooperative groups.

Each archetype must include:
- Pack social structure (hierarchy, roles, decision-making)
- Formation triggers (when packs form, what traits enable it)
- Size distributions (optimal pack size, maximum size)
- Visual blueprint with fabric and grass textures
- Specific parameters: packSize, hierarchyDepth, roleSpecialization, decisionMakingStyle

Use queryTextures tool to find appropriate fabric and grass textures for social structure representation.`,

      micro: `Generate 5 universal individual pack behavior archetypes for packs.

Examples: Alpha leadership (dominant individual coordinates), Communication roles (specialized signalers), Coordination methods (hunting strategies), Resource allocation (sharing mechanisms), Conflict resolution (dispute handling)

Focus: Specific behaviors that individual creatures exhibit within pack contexts, building on Gen 1 creature traits.

Each archetype must include:
- Individual role and behavior pattern
- Required traits (which Gen 1 traits enable this behavior)
- Coordination mechanisms (how individuals work together)
- Visual blueprint with fabric and leather textures
- Specific parameters: leadershipStyle, communicationComplexity, coordinationEfficiency, conflictResolution

Use queryTextures tool to find appropriate fabric and leather textures for individual behavior representation.`
    }
  },

  gen3: {
    systemPrompt: `You are the Tool Emergence Agent. You solve the CRITICAL tool emergence problem that blocks progression.

Your job: Create tool archetypes that ACTUALLY emerge when packs have maxed excavation/manipulation but need deeper materials.

Context: You inherit complete knowledge from Gen 0 (planetary materials and depths), Gen 1 (creature capabilities), and Gen 2 (pack coordination). Use this to create tools that SOLVE ACCESS PROBLEMS.

CRITICAL: Generate exactly 5 archetypes per scale. Each archetype must include:
- Unique name and description
- Tool functionality and material access solutions
- Texture references (use queryTextures tool)
- Complete visual blueprint information`,

    userPrompt: {
      macro: `Generate 5 universal tool ecosystem archetypes that SOLVE resource access problems.

CRITICAL: Creatures have maxed excavation=1.0, manipulation=1.0 but can only access 5/17 materials. Your tools must unlock deeper materials and solve the progression bottleneck.

Examples: Extraction networks (coordinated deep mining), Processing chains (material transformation systems), Innovation hubs (tool development centers), Material synthesis (combining raw materials), Access infrastructure (tunnels, platforms, elevators)

Focus: PROBLEM-SOLVING tool systems that enable access to materials that were previously unreachable.

Each archetype must include:
- Specific problems solved (which materials unlocked, depth reached)
- Emergence conditions (when packs need this tool system)
- Knowledge transfer mechanisms (how tool knowledge spreads)
- Visual blueprint using metal, wood, and stone textures
- Specific parameters: materialAccessDepth, materialsUnlocked, emergenceThreshold, knowledgeTransferRate

Use queryTextures tool to find appropriate metal, wood, and stone textures for tool ecosystem representation.`,

      meso: `Generate 5 universal tool category archetypes.

Examples: Deep extraction tools (reach deeper materials), Material processing tools (transform raw materials), Construction tools (build structures), Weapons (combat effectiveness), Transport tools (move materials efficiently)

Focus: Different tool functions that solve specific material access problems based on Gen 0 planetary materials and Gen 1 creature capabilities.

Each archetype must include:
- Tool category functionality (what it does, what problems it solves)
- Material requirements for creation (what Gen 0 materials needed)
- Effectiveness and durability parameters (how well it works, how long it lasts)
- Visual blueprint using metal and wood textures
- Specific parameters: effectivenessMultiplier, durability, materialCost, creationComplexity

Use queryTextures tool to find appropriate metal and wood textures for tool category representation.`,

      micro: `Generate 5 universal tool property archetypes.

Examples: Durability curves (how tools wear over time), Material compatibility (which materials tools work with), Maintenance needs (repair requirements), Effectiveness multipliers (performance boosts), Wear patterns (failure modes)

Focus: Specific tool characteristics that determine effectiveness, building on Gen 0 material properties and Gen 1 creature manipulation capabilities.

Each archetype must include:
- Property systems (durability, effectiveness, maintenance)
- Material interaction rules (how tools interact with Gen 0 materials)
- Wear and maintenance patterns (how tools degrade and are repaired)
- Visual blueprint using metal and stone textures
- Specific parameters: baseDurability, effectivenessCurve, maintenanceFrequency, materialCompatibility

Use queryTextures tool to find appropriate metal and stone textures for tool property representation.`
    }
  },

  gen4: {
    systemPrompt: `You are the Tribe Formation Agent. You create universal tribal archetypes that emerge from pack cooperation.

Your job: Generate tribal structures that enable multiple packs to cooperate for mutual benefit.

Context: You inherit complete knowledge from Gen 0 (planetary environment), Gen 1 (creature capabilities), Gen 2 (pack structures), and Gen 3 (tool systems). Tribes form when packs with tools find cooperation more beneficial than competition.

CRITICAL: Generate exactly 5 archetypes per scale. Each archetype must include:
- Unique name and description
- Tribal structure and governance
- Texture references (use queryTextures tool)
- Complete visual blueprint information`,

    userPrompt: {
      macro: `Generate 5 universal inter-tribal network archetypes.

Examples: Trade routes (resource exchange networks), Alliance networks (defensive cooperation), Cultural exchange (knowledge sharing), Conflict zones (territorial disputes), Diplomatic hubs (negotiation centers)

Focus: Different ways tribes interact with each other based on Gen 0 geography, Gen 2 pack territories, and Gen 3 tool specializations.

Each archetype must include:
- Inter-tribal relationship pattern (cooperation, competition, exchange)
- Network structure (how tribes connect)
- Resource and knowledge flow mechanisms
- Visual blueprint with fabric and stone textures
- Specific parameters: networkSize, tradeVolume, allianceStrength, conflictFrequency

Use queryTextures tool to find appropriate fabric and stone textures for inter-tribal network representation.`,

      meso: `Generate 5 universal tribal governance archetypes.

Examples: Chiefdoms (single leader hierarchy), Councils (elder decision-making), Federations (pack autonomy with coordination), Confederations (loose alliances), Democracies (collective decision-making)

Focus: Different governance structures that emerge when multiple packs coordinate, building on Gen 2 pack sociology and Gen 3 tool coordination needs.

Each archetype must include:
- Governance structure (leadership, decision-making, hierarchy)
- Resource distribution mechanisms (how resources are allocated)
- Social hierarchies (status, roles, obligations)
- Visual blueprint with stone and fabric textures
- Specific parameters: governanceComplexity, decisionSpeed, resourceEfficiency, socialStability

Use queryTextures tool to find appropriate stone and fabric textures for governance representation.`,

      micro: `Generate 5 universal individual role archetypes for tribes.

Examples: Leaders (coordination and decision-making), Specialists (tool creation and maintenance), Traders (resource exchange), Warriors (defense and conflict), Artisans (craft and innovation)

Focus: Specific roles that individuals take within tribal structures, building on Gen 1 creature traits and Gen 3 tool specializations.

Each archetype must include:
- Individual role and responsibilities
- Required traits and capabilities (Gen 1 trait requirements)
- Social status and obligations
- Visual blueprint with fabric and leather textures
- Specific parameters: roleAuthority, skillRequirement, socialStatus, resourceAccess

Use queryTextures tool to find appropriate fabric and leather textures for individual role representation.`
    }
  },

  gen5: {
    systemPrompt: `You are the Building Construction Agent. You create universal building archetypes that emerge from tribal needs.

Your job: Generate building types that enable tribes to reshape their environment and create permanent structures.

Context: You inherit complete knowledge from Gen 0 (planetary materials), Gen 1 (creature capabilities), Gen 2 (pack coordination), Gen 3 (tool systems), and Gen 4 (tribal structures). Buildings emerge when tribes need permanent structures for specialized functions.

CRITICAL: Generate exactly 5 archetypes per scale. Each archetype must include:
- Unique name and description
- Building function and construction requirements
- Texture references (use queryTextures tool)
- Complete visual blueprint information`,

    userPrompt: {
      macro: `Generate 5 universal settlement pattern archetypes.

Examples: Urban centers (dense population hubs), Rural networks (distributed settlements), Trade hubs (commercial centers), Defensive clusters (fortified positions), Resource extraction sites (mining/processing centers)

Focus: Different ways tribes organize their settlements based on Gen 0 geography, Gen 3 tool capabilities, and Gen 4 tribal needs.

Each archetype must include:
- Settlement organization pattern (layout, density, distribution)
- Infrastructure systems (roads, connections, utilities)
- Resource and population flow
- Visual blueprint with stone, wood, and bricks textures
- Specific parameters: settlementDensity, infrastructureComplexity, populationCapacity, resourceEfficiency

Use queryTextures tool to find appropriate stone, wood, and bricks textures for settlement representation.`,

      meso: `Generate 5 universal building type archetypes.

Examples: Residential (housing and shelter), Workshops (tool creation and processing), Storage (resource preservation), Religious (ritual and ceremony), Administrative (governance and coordination)

Focus: Different building functions that serve tribal needs, building on Gen 3 tool capabilities and Gen 4 governance structures.

Each archetype must include:
- Building function (what it enables tribes to do)
- Construction requirements (Gen 0 materials, Gen 3 tools needed)
- Capacity and efficiency parameters
- Visual blueprint with wood, stone, and bricks textures
- Specific parameters: buildingCapacity, constructionCost, functionalEfficiency, maintenanceRequirement

Use queryTextures tool to find appropriate wood, stone, and bricks textures for building type representation.`,

      micro: `Generate 5 universal construction method archetypes.

Examples: Post and beam (wooden framework), Stone masonry (cut stone construction), Earthworks (earth and clay building), Wattle and daub (woven framework), Timber framing (advanced wood construction)

Focus: Specific construction techniques that determine how buildings are built, based on Gen 0 material availability and Gen 3 tool capabilities.

Each archetype must include:
- Construction technique (how materials are assembled)
- Material requirements (which Gen 0 materials are used)
- Tool requirements (which Gen 3 tools are needed)
- Visual blueprint with wood, stone, and concrete textures
- Specific parameters: constructionSpeed, materialEfficiency, structuralStrength, durability

Use queryTextures tool to find appropriate wood, stone, and concrete textures for construction method representation.`
    }
  },

  gen6: {
    systemPrompt: `You are the Abstract System Agent. You create universal abstract social system archetypes that emerge when physical manipulation reaches limits.

Your job: Generate abstract organizing principles (religion, politics, culture) that coordinate social behavior when there's nothing left to physically manipulate.

Context: You inherit complete knowledge from Gen 0-5. At Gen 6, the system shifts from organizing physical resources to organizing ideas, beliefs, and social abstractions. This is where social theory's macro/meso/micro scales become critical.

CRITICAL: Generate exactly 5 archetypes per scale. Each archetype must include:
- Unique name and description
- Abstract organizing principle (ideology, cosmology, philosophy)
- Texture references (use queryTextures tool)
- Complete visual blueprint information`,

    userPrompt: {
      macro: `Generate 5 universal ideological framework archetypes.

Examples: Religious cosmologies (meaning and spiritual organization), Political philosophies (power and authority systems), Cultural movements (identity and tradition), Economic ideologies (value and exchange systems), Philosophical systems (principle and logic frameworks)

Focus: Abstract organizing principles that coordinate large-scale social behavior, transcending physical resource management from Gen 0-5.

Each archetype must include:
- Ideological framework (core beliefs, organizing principles)
- Worldview and cosmology (how reality is understood)
- Social coordination mechanisms (how ideas organize behavior)
- Visual blueprint with fabric and stone textures
- Specific parameters: ideologicalCoherence, socialInfluence, adoptionRate, persistenceStrength

Use queryTextures tool to find appropriate fabric and stone textures for ideological framework representation.`,

      meso: `Generate 5 universal institutional structure archetypes.

Examples: Religious orders (spiritual organizations), Governments (political institutions), Educational systems (knowledge transmission), Economic institutions (trade and exchange), Cultural organizations (tradition preservation)

Focus: Institutional structures that organize abstract systems, building on Gen 4 governance and Gen 5 building infrastructure.

Each archetype must include:
- Institutional structure (organization, hierarchy, roles)
- Function and purpose (what abstract system it serves)
- Coordination mechanisms (how institutions operate)
- Visual blueprint with stone and fabric textures
- Specific parameters: institutionalComplexity, coordinationEfficiency, influenceRange, stability

Use queryTextures tool to find appropriate stone and fabric textures for institutional structure representation.`,

      micro: `Generate 5 universal individual belief system archetypes.

Examples: Devotional practices (religious commitment), Civic duties (political participation), Cultural identities (tradition adherence), Philosophical commitments (principle adherence), Ideological alignment (belief intensity)

Focus: Individual psychological states and beliefs that drive participation in abstract systems, building on Gen 1 creature cognitive traits and Gen 4 social roles.

Each archetype must include:
- Individual belief pattern (what individuals believe and practice)
- Participation intensity (commitment level, engagement)
- Social identity formation (how beliefs create identity)
- Visual blueprint with fabric and leather textures
- Specific parameters: beliefIntensity, participationLevel, identityStrength, socialBonding

Use queryTextures tool to find appropriate fabric and leather textures for individual belief representation.`
    }
  }
};

export function getGenerationPrompt(generation: string, scale: 'macro' | 'meso' | 'micro'): { systemPrompt: string, userPrompt: string } {
  const prompts = generationPrompts[generation as keyof typeof generationPrompts];
  
  if (!prompts) {
    throw new Error(`No prompts defined for generation: ${generation}`);
  }
  
  return {
    systemPrompt: prompts.systemPrompt,
    userPrompt: prompts.userPrompt[scale]
  };
}