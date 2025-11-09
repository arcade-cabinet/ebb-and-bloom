/**
 * Generate Game Data from Laws
 * 
 * This replaces the old AI-generated pool data system.
 * All data is now generated deterministically from laws.
 */

import { generateEnhancedUniverse } from '../generation/EnhancedUniverseGenerator.js';
import { EnhancedRNG } from '../utils/EnhancedRNG.js';
import { LAWS } from '../laws/index.js';
import { StochasticPopulationDynamics } from '../ecology/StochasticPopulation.js';

/**
 * Generate complete game data for a universe
 */
export async function generateGameData(seed: string) {
  console.log(`[Gen] Generating universe from seed: "${seed}"`);
  
  const rng = new EnhancedRNG(seed);
  const universe = generateEnhancedUniverse(seed);
  
  if (!universe.habitablePlanet) {
    console.warn('[Gen] No habitable planet found, using first planet');
    universe.habitablePlanet = universe.planets[0];
  }
  
  const planet = universe.habitablePlanet;
  
  // Generate ecological data from planet properties
  const ecology = generateEcology(planet, rng);
  
  // Generate creature archetypes from ecological niches
  const creatures = generateCreatureArchetypes(ecology, planet, rng);
  
  // Simulate population dynamics for creatures
  const populationDynamics = simulatePopulationDynamics(creatures, ecology, seed);
  
  // Generate resources from planet composition
  const resources = generateResources(planet, rng);
  
  console.log(`[Gen] Generated ${creatures.length} creature types, ${resources.length} resource types`);
  
  return {
    universe,
    planet,
    ecology,
    creatures,
    resources,
    populationDynamics,
    
    // Legacy structure for compatibility
    pools: {
      macro: { universe, planet },
      meso: { ecology, creatures, populationDynamics },
      micro: { resources },
    },
  };
}

/**
 * Generate ecological parameters from planet
 */
function generateEcology(planet: any, rng: EnhancedRNG) {
  const temperature = planet.surfaceTemperature;
  const gravity = planet.surfaceGravity;
  const atmosphere = planet.atmosphere;
  
  // Primary productivity from temperature and atmosphere
  const sunlight = 250; // W/m² (Earth-like for now)
  const rainfall = atmosphere ? rng.normal(1000, 500) : 0; // mm/year
  
  const productivity = LAWS.ecology.carryingCapacity.primaryProductivity(
    temperature,
    rainfall,
    sunlight
  );
  
  // Determine biomes from temperature and rainfall
  const biomes = determineBiomes(temperature, rainfall, rng);
  
  return {
    temperature,
    gravity,
    atmosphere: atmosphere?.composition || {},
    productivity,
    rainfall,
    biomes,
  };
}

/**
 * Determine biomes from environmental parameters
 */
function determineBiomes(temperature: number, rainfall: number, _rng: EnhancedRNG) {
  const biomes = [];
  
  const tempC = temperature - 273.15;
  
  if (tempC < -10) {
    biomes.push({ type: 'tundra', coverage: 0.3 });
    biomes.push({ type: 'ice', coverage: 0.4 });
  } else if (tempC < 10) {
    biomes.push({ type: 'taiga', coverage: 0.4 });
    biomes.push({ type: 'tundra', coverage: 0.2 });
  } else if (tempC < 20) {
    if (rainfall > 1000) {
      biomes.push({ type: 'temperate_forest', coverage: 0.5 });
    } else {
      biomes.push({ type: 'grassland', coverage: 0.5 });
    }
  } else {
    if (rainfall > 1500) {
      biomes.push({ type: 'tropical_rainforest', coverage: 0.4 });
    } else if (rainfall > 500) {
      biomes.push({ type: 'savanna', coverage: 0.4 });
    } else {
      biomes.push({ type: 'desert', coverage: 0.5 });
    }
  }
  
  // Always have some ocean/water
  biomes.push({ type: 'ocean', coverage: 0.3 });
  
  // Normalize coverage
  const total = biomes.reduce((sum, b) => sum + b.coverage, 0);
  biomes.forEach(b => b.coverage /= total);
  
  return biomes;
}

/**
 * Generate creature archetypes from ecological niches
 */
function generateCreatureArchetypes(ecology: any, planet: any, rng: EnhancedRNG) {
  const creatures = [];
  const gravity = planet.surfaceGravity;
  
  // Number of species from productivity (island biogeography)
  const area = 4 * Math.PI * Math.pow(planet.radius, 2) / 1e12; // 1000s of km²
  const speciesCount = LAWS.ecology.island.speciesRichness(area, 0.1, 0.25);
  const actualCount = Math.min(speciesCount, 20); // Cap at 20 for performance
  
  // Generate species for each niche
  for (let i = 0; i < actualCount; i++) {
    // Determine niche
    const biome: any = rng.choice(ecology.biomes, ecology.biomes.map((b: any) => b.coverage));
    const diet = rng.choice(['herbivore', 'carnivore', 'omnivore'], [0.5, 0.3, 0.2]);
    const trophicLevel = diet === 'herbivore' ? 1 : diet === 'carnivore' ? 2 : 1.5;
    
    // Mass from allometric constraints and gravity
    const maxMass = LAWS.biology.structural.maxMassForGravity(gravity);
    const typicalMass = rng.logNormal(Math.log(50), 1.5); // Log-normal around 50kg
    const mass = Math.min(typicalMass, maxMass * 0.1); // Don't exceed 10% of max
    
    // Metabolism from Kleiber's Law
    const metabolism = LAWS.biology.allometry.basalMetabolicRate(mass);
    
    // Determine locomotion from biome
    const locomotion = determineLocomotion(biome.type, rng);
    
    // Social structure from diet and mass
    const sociality = determineSociality(diet, mass, rng);
    
    // Generate taxonomic name
    const sizeCategory = mass < 1 ? 'parvo' : mass < 10 ? 'meso' : mass < 100 ? 'macro' : 'mega';
    const scientificName = generateScientificName(locomotion, diet, sizeCategory, biome.type);
    
    creatures.push({
      id: `creature-${i}`,
      name: scientificName.common,
      scientificName: scientificName.binomial,
      
      // Physical
      mass,
      metabolism,
      locomotion,
      
      // Ecological
      diet,
      trophicLevel,
      biome: biome.type,
      
      // Social
      sociality,
      groupSize: sociality === 'pack' ? rng.poisson(8) + 2 : 1,
      
      // Derived properties
      lifespan: LAWS.biology.allometry.maxLifespan(mass),
      homeRange: LAWS.biology.allometry.homeRange(mass, trophicLevel),
    });
  }
  
  return creatures;
}

/**
 * Determine locomotion from biome
 */
function determineLocomotion(biome: string, rng: EnhancedRNG): string {
  const options: Record<string, string[]> = {
    tropical_rainforest: ['arboreal', 'cursorial', 'aerial'],
    temperate_forest: ['arboreal', 'cursorial'],
    taiga: ['cursorial'],
    grassland: ['cursorial'],
    savanna: ['cursorial'],
    desert: ['cursorial', 'fossorial'],
    tundra: ['cursorial'],
    ocean: ['aquatic'],
  };
  
  const possible = options[biome] || ['cursorial'];
  return rng.choice(possible);
}

/**
 * Determine sociality from diet and mass
 */
function determineSociality(diet: string, mass: number, rng: EnhancedRNG): string {
  // Large herbivores tend to form herds
  if (diet === 'herbivore' && mass > 100) {
    return rng.choice(['herd', 'pack'], [0.7, 0.3]);
  }
  
  // Carnivores often hunt in packs
  if (diet === 'carnivore') {
    return rng.choice(['solitary', 'pack'], [0.6, 0.4]);
  }
  
  // Omnivores variable
  return rng.choice(['solitary', 'pack'], [0.5, 0.5]);
}

/**
 * Generate scientific name from traits
 */
function generateScientificName(locomotion: string, diet: string, size: string, biome: string) {
  const locoRoots: Record<string, string> = {
    cursorial: 'cursor',
    arboreal: 'dendro',
    fossorial: 'fossor',
    aquatic: 'hydro',
    aerial: 'aero',
  };
  
  const dietRoots: Record<string, string> = {
    herbivore: 'herbivor',
    carnivore: 'carnivor',
    omnivore: 'omnivor',
  };
  
  const habitatMods: Record<string, string> = {
    desert: 'xero',
    tropical_rainforest: 'silvo',
    grassland: 'prato',
    ocean: 'pelago',
  };
  
  const genus = (habitatMods[biome] || '') + (locoRoots[locomotion] || 'cursor');
  const species = size + (dietRoots[diet] || 'omnivor') + 'us';
  
  const binomial = `${capitalize(genus)} ${species}`;
  const common = `${capitalize(biome.replace('_', ' '))} ${locomotion}`;
  
  return { binomial, common };
}

/**
 * Generate resources from planet composition
 */
function generateResources(planet: any, _rng: EnhancedRNG) {
  const resources = [];
  
  // Always have basic vegetation
  resources.push({
    id: 'vegetation',
    name: 'Vegetation',
    type: 'plant',
    abundance: 0.8,
    energyDensity: 1500, // kJ/kg
  });
  
  // Water if atmosphere present
  if (planet.atmosphere) {
    resources.push({
      id: 'water',
      name: 'Water',
      type: 'liquid',
      abundance: 0.9,
    });
  }
  
  // Minerals from crust composition
  const crust = planet.composition.crust;
  if (crust.Si > 0.2) {
    resources.push({
      id: 'stone',
      name: 'Stone',
      type: 'mineral',
      abundance: 0.7,
    });
  }
  
  if (crust.Fe > 0.03) {
    resources.push({
      id: 'iron_ore',
      name: 'Iron Ore',
      type: 'metal',
      abundance: 0.3,
    });
  }
  
  return resources;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Simulate stochastic population dynamics for ecosystem
 */
function simulatePopulationDynamics(creatures: any[], ecology: any, seed: string) {
  const dynamics = new StochasticPopulationDynamics(seed + '-population');
  
  // Separate herbivores and carnivores
  const herbivores = creatures.filter(c => c.diet === 'herbivore');
  const carnivores = creatures.filter(c => c.diet === 'carnivore');
  
  if (herbivores.length === 0 || carnivores.length === 0) {
    console.log('[Population] Not enough trophic levels for dynamics simulation');
    return { equilibria: [], trajectories: [] };
  }
  
  // Pick dominant species from each level
  const dominantHerbivore = herbivores.sort((a, b) => b.mass - a.mass)[0];
  const dominantCarnivore = carnivores.sort((a, b) => b.mass - a.mass)[0];
  
  // Calculate carrying capacity from productivity
  const area = 1e10; // m² (sample area)
  const K_prey = LAWS.ecology.carryingCapacity.calculate(
    ecology.productivity,
    dominantHerbivore.trophicLevel,
    dominantHerbivore.metabolism
  );
  
  // Initial populations (start at ~50% of carrying capacity)
  let preyPop = K_prey * 0.5;
  let predatorPop = preyPop * 0.1; // 10:1 prey:predator ratio
  
  // Calculate dynamics parameters
  const alpha = 0.5; // Prey birth rate (1/year)
  const beta = 0.0001; // Predation rate
  const delta = 0.00005; // Predator efficiency
  const gamma = 0.3; // Predator death rate
  
  // Stochastic parameters
  const sigmaEnv = 0.15; // 15% environmental noise
  const sigmaDemog = 0.05; // 5% demographic noise
  
  // Run simulation for 100 years
  const trajectory: { time: number; prey: number; predator: number }[] = [];
  const dt = 0.1; // 0.1 year steps
  
  for (let t = 0; t < 100; t += dt) {
    trajectory.push({
      time: t,
      prey: preyPop,
      predator: predatorPop,
    });
    
    const result = dynamics.stepPredatorPrey(
      preyPop,
      predatorPop,
      { alpha, beta, delta, gamma, sigmaEnv, sigmaDemog },
      dt
    );
    
    preyPop = result.prey;
    predatorPop = result.predator;
    
    // Extinction check
    if (preyPop < 1 || predatorPop < 1) {
      console.log(`[Population] Extinction at t=${t.toFixed(1)}`);
      break;
    }
  }
  
  // Calculate equilibrium (average of last 20 years)
  const equilibriumStart = trajectory.length - 200;
  const equilibriumData = trajectory.slice(Math.max(0, equilibriumStart));
  
  const avgPrey = equilibriumData.reduce((sum, p) => sum + p.prey, 0) / equilibriumData.length;
  const avgPredator = equilibriumData.reduce((sum, p) => sum + p.predator, 0) / equilibriumData.length;
  
  console.log(`[Population] Equilibrium: ${avgPrey.toFixed(0)} prey, ${avgPredator.toFixed(0)} predators`);
  
  return {
    species: {
      prey: dominantHerbivore.name,
      predator: dominantCarnivore.name,
    },
    equilibria: {
      prey: avgPrey,
      predator: avgPredator,
    },
    trajectory: trajectory.filter((_, i) => i % 10 === 0), // Sample every 1 year
    parameters: { alpha, beta, delta, gamma, sigmaEnv, sigmaDemog },
  };
}

/**
 * Legacy compatibility - load gen data
 */
export async function loadGenData(seed: string = 'default') {
  return generateGameData(seed);
}

// ============================================================================
// LEGACY COMPATIBILITY LAYER
// These functions exist for backwards compatibility with Gen0-6 systems
// They will be gradually phased out as those systems are refactored
// ============================================================================

/**
 * Extract seed components (legacy - now uses EnhancedRNG internally)
 */
export function extractSeedComponents(seed: string): { macro: string; meso: string; micro: string } {
  const rng = new EnhancedRNG(seed);
  return {
    macro: rng.uniform().toString(),
    meso: rng.uniform().toString(),
    micro: rng.uniform().toString(),
  };
}

/**
 * Select from pool (legacy - uses new RNG)
 */
export function selectFromPool<T>(pool: T[], seedComponent: string): T {
  const rng = new EnhancedRNG(seedComponent);
  return rng.choice(pool);
}

/**
 * Generate Gen0 data pools (legacy - returns law-based universe)
 */
export async function generateGen0DataPools(seed: string): Promise<any> {
  const data = await generateGameData(seed);
  return {
    macro: {
      selectedContext: `${data.universe.star.spectralType} star with ${data.universe.planets.length} planets`,
      universe: data.universe,
    },
    micro: {
      selectedDistribution: 'Silicate-rich', // Default for rocky planets
      visualProperties: {
        primaryTextures: ['rock', 'metal', 'ice'],
      },
    },
  };
}

/**
 * Generate Gen1 data pools (legacy - returns creature archetypes)
 */
export async function generateGen1DataPools(seed: string, _planet?: any, _gen0Data?: any): Promise<any> {
  const data = await generateGameData(seed);
  
  // Convert creatures to archetype format
  const archetypeOptions = data.creatures.map((c: any) => ({
    id: c.id,
    name: c.name,
    traits: {
      locomotion: c.locomotion,
      foraging: c.biome === 'ocean' ? 'aquatic' : 'surface',
      social: c.sociality === 'pack' ? 'pack' : 'solitary',
      excavation: 0.5,
      maxReach: 1.0,
      speed: 1.0,
      strength: 0.5,
    },
    visualBlueprint: {},
    parameters: { mass: c.mass, metabolism: c.metabolism },
    formation: {},
    deconstruction: {},
    adjacency: {},
  }));
  
  return {
    macro: { archetypeOptions },
    meso: {},
    micro: {},
  };
}

/**
 * Generate Gen2 data pools (legacy - returns pack dynamics)
 */
export async function generateGen2DataPools(seed: string): Promise<any> {
  const data = await generateGameData(seed);
  
  const packDynamics = data.creatures
    .filter((c: any) => c.sociality === 'pack')
    .map((c: any) => ({
      id: `pack-${c.id}`,
      name: `${c.name} Pack`,
      optimalSize: c.groupSize,
      hierarchy: 'dominance',
    }));
  
  return {
    macro: { packDynamics },
    meso: {},
    micro: {},
  };
}

/**
 * Generate Gen3 data pools (legacy - returns tool types)
 */
export async function generateGen3DataPools(_seed: string): Promise<any> {
  
  const toolTypes = [
    { id: 'stone-tool', name: 'Stone Tool', complexity: 0.1 },
    { id: 'bone-tool', name: 'Bone Tool', complexity: 0.2 },
    { id: 'wood-tool', name: 'Wood Tool', complexity: 0.15 },
  ];
  
  return {
    macro: { toolTypes },
    meso: {},
    micro: {},
  };
}

/**
 * Generate Gen4 data pools (legacy - returns tribe structures)
 */
export async function generateGen4DataPools(_seed: string): Promise<any> {
  
  const tribeStructures = [
    { id: 'band', name: 'Band', size: 25, type: 'band' },
    { id: 'tribe', name: 'Tribe', size: 150, type: 'tribe' },
  ];
  
  return {
    macro: { tribeStructures },
    meso: {},
    micro: {},
  };
}

/**
 * Generate Gen5 data pools (legacy - returns building types)
 */
export async function generateGen5DataPools(_seed: string): Promise<any> {
  
  const buildingTypes = [
    { id: 'hut', name: 'Hut', materials: ['wood', 'stone'], capacity: 4 },
    { id: 'longhouse', name: 'Longhouse', materials: ['wood'], capacity: 20 },
  ];
  
  return {
    macro: { buildingTypes },
    meso: {},
    micro: {},
  };
}

/**
 * Generate Gen6 data pools (legacy - returns social systems)
 */
export async function generateGen6DataPools(_seed: string): Promise<any> {
  
  const socialSystems = [
    { id: 'animism', name: 'Animism', type: 'religion' },
    { id: 'elder-council', name: 'Elder Council', type: 'governance' },
  ];
  
  return {
    macro: { socialSystems },
    meso: {},
    micro: {},
  };
}
