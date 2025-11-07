import React, { useMemo } from 'react';
import { World } from 'miniplex';
import { SimplexNoise } from 'simplex-noise';

// ================================
// COMPREHENSIVE ECS SCHEMA 
// ================================

// Spatial Components
export interface Position {
  x: number;
  y: number; 
  z: number;
  chunk?: { x: number; z: number }; // Spatial partitioning
}

export interface Velocity {
  x: number;
  y: number;
  z: number;
  momentum: number; // For physics-based interactions
}

export interface Transform {
  scale: number;
  rotation: { x: number; y: number; z: number };
  bounds: { radius: number; height: number };
}

// Identity Components
export interface Identity {
  name: string;
  type: 'player' | 'creature' | 'resource' | 'structure' | 'phenomenon';
  subtype: string; // fish, ore_vein, village_center, etc.
  age: number; // In-world time existence
}

export interface Genetics {
  seed: number; // Deterministic generation
  generation: number; // Inheritance depth
  stability: number; // Resistance to mutation (0-1)
  expressedTraits: number[]; // Active trait values
  dormantTraits: number[]; // Inherited but unexpressed
  parentIds: string[]; // For genealogy tracking
}

// Player Trait System (The 10 core traits)
export interface PlayerTraits {
  flipperFeet: number;     // Water navigation, flow affinity
  chainsawHands: number;   // Resource harvest, scares creatures
  drillArms: number;       // Deep mining, vein revelation  
  wingGliders: number;     // Aerial movement, overview
  echoSonar: number;       // Detection radius, hidden resources
  bioLumGlow: number;      // Night vision, creature attraction
  storageSacs: number;     // Inventory expansion
  filtrationGills: number; // Pollution resistance
  shieldCarapace: number;  // Damage mitigation
  toxinSpines: number;     // Defensive counter-attack
}

// Resource & Crafting
export interface MaterialProperties {
  affinityMask: number;    // 8-bit flags (HEAT, FLOW, BIND, POWER, LIFE, METAL, VOID, WILD)
  purity: number;          // 0-1, affects combinations
  volatility: number;      // Reaction strength
  magnetism: number;       // Snap attraction radius
  rarity: number;          // Spawn probability modifier
  decayRate: number;       // Natural degradation
}

export interface Inventory {
  resources: Map<string, number>; // resource_id -> quantity
  capacity: number;
  magneticField: number;   // Attraction strength for snapping
  lastCraftTime: number;   // For cooldowns
}

// Creature Behavioral Components  
export interface CreatureBehavior {
  basePersonality: 'curious' | 'aggressive' | 'skittish' | 'social' | 'territorial';
  currentMood: number;     // -1 to 1 (fearful to content)
  loyaltyToPlayer: number; // -1 to 1 (hostile to devoted)
  packAffiliation: string | null; // Pack entity ID
  huntingTarget: string | null;
  homeLocation: Position;
  territoryRadius: number;
}

export interface CreatureNeeds {
  hunger: number;          // 0-1, drives foraging
  safety: number;          // 0-1, drives hiding/fleeing
  social: number;          // 0-1, drives pack formation
  curiosity: number;       // 0-1, drives exploration
  reproduction: number;    // 0-1, drives mating behaviors
}

export interface Pack {
  leaderId: string;        // Entity ID of alpha
  memberIds: string[];     // All pack members
  loyalty: number;         // Cohesion strength (0-1)
  territory: { center: Position; radius: number };
  sharedTraits: number[];  // Inherited from player proximity
  packType: 'family' | 'hunting' | 'migration' | 'territorial';
  reputation: number;      // How other packs view this one
}

// Player Behavior Tracking
export interface PlayerBehaviorProfile {
  harmonyScore: number;    // Cooperative, nurturing actions
  conquestScore: number;   // Aggressive, exploitative actions  
  frolickScore: number;    // Playful, experimental actions
  actionHistory: Array<{
    action: string;
    timestamp: number;
    context: any;
  }>;
  dominantStyle: 'harmony' | 'conquest' | 'frolick' | 'balanced';
  recentTrend: number;     // -1 to 1, behavioral shift
}

// World State Components
export interface PollutionState {
  local: number;           // Chunk-level pollution (0-1)
  global: number;          // World average (0-1)  
  sources: Array<{ type: string; intensity: number; position: Position }>;
  shockThreshold: number;  // When dramatic events trigger
  purificationRate: number; // Natural recovery
}

export interface BiomeProperties {
  type: 'plains' | 'forest' | 'wetlands' | 'mountains' | 'desert' | 'tundra';
  fertility: number;       // Resource generation rate
  hostility: number;       // Environmental danger
  stability: number;       // Resistance to change
  uniqueResources: string[]; // Biome-exclusive materials
  seasonalVariation: number; // How much it changes over time
}

// Emergent Content
export interface VillageState {
  population: number;
  prosperity: number;      // 0-1, affects available services
  specialization: 'trading' | 'crafting' | 'farming' | 'research' | 'military';
  relationshipWithPlayer: number; // -1 to 1
  availableQuests: Array<{
    type: string;
    difficulty: number;
    rewards: any;
    expires: number;
  }>;
  culturalTraits: string[]; // Influenced by player behavior
}

export interface Quest {
  id: string;
  type: 'gather' | 'explore' | 'craft' | 'protect' | 'investigate';
  description: string;
  objectives: Array<{
    type: string;
    target: any;
    progress: number;
    required: number;
  }>;
  rewards: Array<{ type: string; amount: number }>;
  timeLimit: number | null;
  difficulty: number;
  emergentContext: any;    // Why this quest emerged
}

// Haiku & Narrative
export interface HaikuJournal {
  entries: Array<{
    haiku: [string, string, string]; // Three lines
    context: string;
    timestamp: number;
    emotionalTone: number; // -1 to 1
    similarity: number;    // Jaro-Winkler to previous
  }>;
  recentThemes: string[];  // To avoid repetition
  poeticStyle: 'natural' | 'mystical' | 'technical' | 'playful';
}

// Rendering & Effects
export interface VisualEffects {
  traitEvolution: Array<{ trait: string; intensity: number; duration: number }>;
  magneticFields: Array<{ center: Position; radius: number; strength: number }>;
  pollutionHaze: { opacity: number; color: [number, number, number] };
  seasonalTinting: { hue: number; saturation: number };
}

export interface Audio {
  ambientLayers: string[];
  dynamicMusic: { theme: string; intensity: number };
  hapticPattern: string | null;
  spatialSounds: Array<{ source: Position; type: string; volume: number }>;
}

// ================================
// WORLD SCHEMA DEFINITION
// ================================

export type EntitySchema = {
  // Core Components (most entities have these)
  position?: Position;
  velocity?: Velocity; 
  transform?: Transform;
  identity?: Identity;
  genetics?: Genetics;
  
  // Specialized Player Components
  playerTraits?: PlayerTraits;
  playerBehavior?: PlayerBehaviorProfile;
  inventory?: Inventory;
  haikuJournal?: HaikuJournal;
  
  // Creature Components  
  creatureBehavior?: CreatureBehavior;
  creatureNeeds?: CreatureNeeds;
  pack?: Pack;
  
  // Resource Components
  materialProperties?: MaterialProperties;
  
  // Environmental Components
  pollutionState?: PollutionState;
  biomeProperties?: BiomeProperties;
  
  // Settlement Components
  villageState?: VillageState;
  quest?: Quest;
  
  // Rendering & Experience
  visualEffects?: VisualEffects;
  audio?: Audio;
  
  // Utility Tags
  player?: {}; // Marker for player entity
  resource?: {}; // Marker for harvestable
  structure?: {}; // Marker for buildings
  natural?: {}; // Marker for environment
  artificial?: {}; // Marker for player-created
};

// ================================
// WORLD CREATION & MANAGEMENT
// ================================

export const createEbbBloomWorld = (): World<EntitySchema> => {
  return new World<EntitySchema>();
};

// World Queries (for efficient system operations)
export const createWorldQueries = (world: World<EntitySchema>) => {
  return {
    // Spatial queries
    allEntitiesWithPosition: world.with('position'),
    movingEntities: world.with('position', 'velocity'),
    playersInWorld: world.with('position', 'player', 'playerTraits'),
    
    // Creature queries
    allCreatures: world.with('position', 'identity', 'creatureBehavior'),
    packedCreatures: world.with('position', 'creatureBehavior', 'pack'),
    wildCreatures: world.without('pack').with('position', 'creatureBehavior'),
    
    // Resource queries  
    harvestableResources: world.with('position', 'resource', 'materialProperties'),
    magneticResources: world.with('position', 'resource', 'materialProperties')
      .where(e => e.materialProperties!.magnetism > 0.3),
    
    // Environmental queries
    pollutedAreas: world.with('position', 'pollutionState')
      .where(e => e.pollutionState!.local > 0.2),
    activeBiomes: world.with('position', 'biomeProperties'),
    
    // Settlement queries
    activeVillages: world.with('position', 'villageState'),
    availableQuests: world.with('quest')
      .where(e => e.quest!.timeLimit === null || e.quest!.timeLimit > Date.now()),
    
    // Behavioral queries
    harmoniousCreatures: world.with('creatureBehavior')
      .where(e => e.creatureBehavior!.loyaltyToPlayer > 0.3),
    hostileCreatures: world.with('creatureBehavior')
      .where(e => e.creatureBehavior!.loyaltyToPlayer < -0.3),
  };
};

// Procedural World Generator
export const generateProceduralWorld = (
  world: World<EntitySchema>, 
  seed: number,
  centerChunk: { x: number; z: number },
  radius: number
) => {
  const noise = new SimplexNoise();
  const entities = [];
  
  // Generate terrain chunks with biomes
  for (let cx = centerChunk.x - radius; cx <= centerChunk.x + radius; cx++) {
    for (let cz = centerChunk.z - radius; cz <= centerChunk.z + radius; cz++) {
      const chunkSeed = seed + (cx * 1000) + cz;
      const biome = determineBiome(noise, cx, cz);
      
      // Create biome entity
      const biomeEntity = world.add({
        position: { x: cx * 100, y: 0, z: cz * 100, chunk: { x: cx, z: cz } },
        identity: { name: `${biome.type}_${cx}_${cz}`, type: 'phenomenon', subtype: 'biome', age: 0 },
        biomeProperties: biome,
        natural: {}
      });
      
      // Generate resources based on biome
      generateResourcesForChunk(world, noise, cx, cz, biome, chunkSeed);
      
      // Generate creatures based on biome and resources
      generateCreaturesForChunk(world, noise, cx, cz, biome, chunkSeed);
    }
  }
  
  return entities;
};

const determineBiome = (noise: SimplexNoise, cx: number, cz: number): BiomeProperties => {
  const temperature = noise.noise2D(cx * 0.01, cz * 0.01);
  const humidity = noise.noise2D(cx * 0.012, cz * 0.012);
  const elevation = noise.noise2D(cx * 0.008, cz * 0.008);
  
  // Biome logic based on environmental factors
  if (elevation > 0.6) return {
    type: 'mountains',
    fertility: 0.3,
    hostility: 0.7,
    stability: 0.9,
    uniqueResources: ['rare_metals', 'crystals'],
    seasonalVariation: 0.2
  };
  
  if (humidity > 0.4 && temperature > 0.2) return {
    type: 'forest', 
    fertility: 0.8,
    hostility: 0.3,
    stability: 0.6,
    uniqueResources: ['hardwood', 'herbs'],
    seasonalVariation: 0.7
  };
  
  // Default plains
  return {
    type: 'plains',
    fertility: 0.6,
    hostility: 0.2, 
    stability: 0.5,
    uniqueResources: ['grain', 'common_ore'],
    seasonalVariation: 0.5
  };
};

const generateResourcesForChunk = (
  world: World<EntitySchema>, 
  noise: SimplexNoise, 
  cx: number, 
  cz: number, 
  biome: BiomeProperties,
  seed: number
) => {
  // Generate resource veins based on biome fertility and unique resources
  const resourceDensity = biome.fertility * (0.5 + noise.noise2D(cx * 0.1, cz * 0.1) * 0.5);
  const numResources = Math.floor(resourceDensity * 20);
  
  for (let i = 0; i < numResources; i++) {
    const localX = (cx * 100) + (noise.noise2D(seed + i, cx) * 45);
    const localZ = (cz * 100) + (noise.noise2D(seed + i, cz) * 45);
    const resourceType = biome.uniqueResources[i % biome.uniqueResources.length];
    
    world.add({
      position: { x: localX, y: 0, z: localZ, chunk: { x: cx, z: cz } },
      identity: { name: `${resourceType}_${i}`, type: 'resource', subtype: resourceType, age: 0 },
      materialProperties: generateMaterialProperties(noise, localX, localZ, resourceType),
      genetics: {
        seed: seed + i,
        generation: 0,
        stability: 0.8,
        expressedTraits: [],
        dormantTraits: [],
        parentIds: []
      },
      resource: {},
      natural: {}
    });
  }
};

const generateCreaturesForChunk = (
  world: World<EntitySchema>,
  noise: SimplexNoise,
  cx: number,
  cz: number, 
  biome: BiomeProperties,
  seed: number
) => {
  // Creature population based on biome hostility (inverse)
  const creatureDensity = (1 - biome.hostility) * biome.fertility;
  const numCreatures = Math.floor(creatureDensity * 15);
  
  for (let i = 0; i < numCreatures; i++) {
    const localX = (cx * 100) + (noise.noise2D(seed + i + 100, cx) * 45);
    const localZ = (cz * 100) + (noise.noise2D(seed + i + 100, cz) * 45);
    
    world.add({
      position: { x: localX, y: 0, z: localZ, chunk: { x: cx, z: cz } },
      identity: { name: `creature_${i}`, type: 'creature', subtype: 'wild', age: 0 },
      genetics: generateCreatureGenetics(noise, localX, localZ, seed + i),
      creatureBehavior: generateCreatureBehavior(noise, localX, localZ, biome),
      creatureNeeds: {
        hunger: 0.5,
        safety: 0.6,
        social: 0.4,
        curiosity: 0.3,
        reproduction: 0.2
      },
      natural: {}
    });
  }
};

const generateMaterialProperties = (noise: SimplexNoise, x: number, z: number, type: string): MaterialProperties => {
  return {
    affinityMask: 0, // Will be set based on type
    purity: Math.max(0, noise.noise2D(x * 0.01, z * 0.01) * 0.5 + 0.5),
    volatility: Math.max(0, noise.noise2D(x * 0.02, z * 0.02) * 0.5 + 0.3),
    magnetism: Math.max(0, noise.noise2D(x * 0.015, z * 0.015) * 0.5 + 0.4),
    rarity: Math.max(0, noise.noise2D(x * 0.005, z * 0.005) * 0.5 + 0.5),
    decayRate: Math.max(0.001, noise.noise2D(x * 0.03, z * 0.03) * 0.01 + 0.005)
  };
};

const generateCreatureGenetics = (noise: SimplexNoise, x: number, z: number, seed: number): Genetics => {
  return {
    seed,
    generation: 0,
    stability: Math.max(0.2, noise.noise2D(x * 0.01, z * 0.01) * 0.4 + 0.6),
    expressedTraits: Array(10).fill(0).map((_, i) => 
      Math.max(0, noise.noise2D(x * 0.02 + i, z * 0.02 + i) * 0.5 + 0.25)
    ),
    dormantTraits: [],
    parentIds: []
  };
};

const generateCreatureBehavior = (noise: SimplexNoise, x: number, z: number, biome: BiomeProperties): CreatureBehavior => {
  const personalityRoll = noise.noise2D(x * 0.03, z * 0.03);
  let personality: CreatureBehavior['basePersonality'];
  
  if (personalityRoll < -0.4) personality = 'aggressive';
  else if (personalityRoll < -0.2) personality = 'territorial';
  else if (personalityRoll < 0.2) personality = 'curious';
  else if (personalityRoll < 0.4) personality = 'social';
  else personality = 'skittish';
  
  return {
    basePersonality: personality,
    currentMood: noise.noise2D(x * 0.05, z * 0.05) * 0.6,
    loyaltyToPlayer: 0, // Neutral initially
    packAffiliation: null,
    huntingTarget: null,
    homeLocation: { x, y: 0, z },
    territoryRadius: Math.max(5, noise.noise2D(x * 0.01, z * 0.01) * 15 + 10)
  };
};

export default createEbbBloomWorld;