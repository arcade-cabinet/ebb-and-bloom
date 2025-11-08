/**
 * Zod schemas for all game data structures
 * These are the SINGLE SOURCE OF TRUTH for types
 * Used by: Database, REST API, CLI, Frontend
 */

import { z } from 'zod';

// ============================================================================
// PRIMITIVES
// ============================================================================

export const Vector3Schema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  z: z.number().finite(),
});

export const CoordinateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

export const ColorSchema = z.object({
  r: z.number().min(0).max(255),
  g: z.number().min(0).max(255),
  b: z.number().min(0).max(255),
  a: z.number().min(0).max(1).optional(),
});

// ============================================================================
// MATERIALS
// ============================================================================

export const MaterialTypeSchema = z.enum([
  'hydrogen',
  'helium',
  'carbon',
  'nitrogen',
  'oxygen',
  'iron',
  'calcium',
  'silicon',
  'magnesium',
  'water',
  'limestone',
  'basalt',
  'granite',
  'sandstone',
  'clay',
  'sand',
  'vegetation',
  'wood',
  'organic_matter',
  'bone',
]);

export const MaterialSchema = z.object({
  type: MaterialTypeSchema,
  quantity: z.number().min(0).finite(),
  depth: z.number().min(0).finite(),
  hardness: z.number().min(0).max(10).finite(),
  density: z.number().min(0).finite(),
  nutritionalValue: z.number().min(0).finite().optional(),
});

export const MaterialCompositionSchema = z.record(
  MaterialTypeSchema,
  z.number().min(0).finite()
);

// ============================================================================
// GEN 0: ACCRETION
// ============================================================================

export const DebrisObjectSchema = z.object({
  id: z.string(),
  type: z.enum(['asteroid', 'comet', 'dust', 'ice', 'rock']),
  mass: z.number().min(0).finite(),
  position: Vector3Schema,
  velocity: Vector3Schema,
  composition: MaterialCompositionSchema,
  temperature: z.number().finite(),
});

export const AccretionEventSchema = z.object({
  cycle: z.number().int().min(0),
  type: z.enum(['collision', 'accretion', 'ejection', 'fragmentation']),
  objects: z.array(z.string()), // IDs of debris objects
  result: z.object({
    newMass: z.number().min(0).finite().optional(),
    energyReleased: z.number().finite().optional(),
    materialsMerged: MaterialCompositionSchema.optional(),
  }),
});

export const PlanetaryLayerSchema = z.object({
  name: z.string(),
  minRadius: z.number().min(0).finite(),
  maxRadius: z.number().min(0).finite(),
  materials: z.array(MaterialSchema),
  density: z.number().min(0).finite(),
  temperature: z.number().finite(),
  pressure: z.number().min(0).finite(),
});

export const PlanetSchema = z.object({
  id: z.string(),
  seed: z.string(),
  radius: z.number().min(0).finite(),
  mass: z.number().min(0).finite(),
  rotationPeriod: z.number().min(0).finite(), // seconds
  layers: z.array(PlanetaryLayerSchema),
  compositionHistory: z.array(AccretionEventSchema),
  status: z.enum(['forming', 'formed', 'stable']),
});

// ============================================================================
// GEN 1: CREATURES
// ============================================================================

export const ArchetypeSchema = z.enum([
  'cursorial_forager',
  'arboreal_opportunist',
  'littoral_harvester',
  'burrow_engineer',
]);

export const TraitsSchema = z.object({
  locomotion: z.enum(['cursorial', 'arboreal', 'littoral', 'burrowing']),
  foraging: z.enum(['surface', 'arboreal', 'aquatic', 'underground']),
  social: z.enum(['solitary', 'pack', 'tribal']),
  excavation: z.number().min(0).max(1).finite(),
  maxReach: z.number().min(0).finite(),
  speed: z.number().min(0).finite(),
  strength: z.number().min(0).finite(),
  aggression: z.number().min(0).max(1).finite().optional(),
});

export const NeedSchema = z.object({
  type: MaterialTypeSchema,
  current: z.number().min(0).finite(),
  max: z.number().min(0).finite(),
  depletionRate: z.number().min(0).finite(),
  urgency: z.number().min(0).max(1).finite(),
});

export const CreatureSchema = z.object({
  id: z.string(),
  archetype: ArchetypeSchema,
  position: CoordinateSchema,
  traits: TraitsSchema,
  composition: MaterialCompositionSchema,
  needs: z.array(NeedSchema),
  energy: z.number().min(0).finite(),
  age: z.number().int().min(0),
  status: z.enum(['alive', 'sick', 'dying', 'dead']),
  stuck: z.boolean().optional(),
  stuckCycles: z.number().int().min(0).optional(),
});

// ============================================================================
// GEN 2: PACKS
// ============================================================================

export const PackSchema = z.object({
  id: z.string(),
  members: z.array(z.string()), // Creature IDs
  center: CoordinateSchema,
  cohesion: z.number().min(0).max(1).finite(),
  status: z.enum(['forming', 'stable', 'dispersing']),
});

// ============================================================================
// GEN 3: TOOLS
// ============================================================================

export const ToolTypeSchema = z.enum([
  'digging_stick',
  'stone_hammer',
  'bone_scraper',
  'wooden_spear',
]);

export const ToolBoostSchema = z.object({
  excavation: z.number().finite().optional(),
  speed: z.number().finite().optional(),
  strength: z.number().finite().optional(),
});

export const ToolSchema = z.object({
  id: z.string(),
  type: ToolTypeSchema,
  composition: MaterialCompositionSchema,
  boost: ToolBoostSchema,
  durability: z.number().min(0).max(100).finite(),
  owner: z.string().optional(), // Creature ID
  stuck: z.boolean().optional(),
});

// ============================================================================
// GEN 4: TRIBES
// ============================================================================

export const TerritorySchema = z.object({
  center: CoordinateSchema,
  radius: z.number().min(0).finite(),
  nodes: z.array(CoordinateSchema),
});

export const TribeSchema = z.object({
  id: z.string(),
  name: z.string(),
  members: z.array(z.string()), // Creature IDs
  territory: TerritorySchema,
  resources: MaterialCompositionSchema,
  morale: z.number().min(0).max(1).finite(),
  cohesion: z.number().min(0).max(1).finite(),
  status: z.enum(['forming', 'stable', 'expanding', 'declining', 'collapsed']),
});

// ============================================================================
// GEN 5: BUILDINGS
// ============================================================================

export const BuildingTypeSchema = z.enum([
  'shelter',
  'storage',
  'workshop',
  'temple',
]);

export const BuildingSchema = z.object({
  id: z.string(),
  type: BuildingTypeSchema,
  location: CoordinateSchema,
  composition: MaterialCompositionSchema,
  constructionProgress: z.number().min(0).max(1).finite(),
  benefits: z.record(z.string(), z.number()),
  owner: z.string().optional(), // Tribe ID
  stuck: z.boolean().optional(),
});

// ============================================================================
// GEN 6: RELIGION
// ============================================================================

export const RitualSchema = z.object({
  id: z.string(),
  name: z.string(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'event_based']),
  fearReduction: z.number().min(0).max(1).finite(),
  participants: z.array(z.string()), // Creature IDs
});

export const MythSchema = z.object({
  id: z.string(),
  name: z.string(),
  content: z.string(),
  believers: z.number().int().min(0),
  accuracy: z.enum(['accurate', 'garbled', 'false']).optional(),
});

export const ReligionSchema = z.object({
  id: z.string(),
  name: z.string(),
  followers: z.array(z.string()), // Tribe IDs
  rituals: z.array(RitualSchema),
  myths: z.array(MythSchema),
  holysite: CoordinateSchema.optional(),
  status: z.enum(['forming', 'established', 'declining', 'extinct']),
});

// ============================================================================
// GAME STATE
// ============================================================================

export const GameStateSchema = z.object({
  id: z.string(),
  seed: z.string(),
  generation: z.number().int().min(0).max(6),
  cycle: z.number().int().min(0),
  planet: PlanetSchema,
  creatures: z.array(CreatureSchema),
  packs: z.array(PackSchema),
  tools: z.array(ToolSchema),
  tribes: z.array(TribeSchema),
  buildings: z.array(BuildingSchema),
  religions: z.array(ReligionSchema),
});

// ============================================================================
// API REQUEST/RESPONSE
// ============================================================================

export const CreateGameRequestSchema = z.object({
  seed: z.string().optional(),
  startingGeneration: z.number().int().min(0).max(6).optional(),
});

export const CreateGameResponseSchema = z.object({
  gameId: z.string(),
  seed: z.string(),
  generation: z.number().int(),
});

export const AdvanceGameRequestSchema = z.object({
  cycles: z.number().int().min(1).max(10000),
  targetGeneration: z.number().int().min(0).max(6).optional(),
});

export const QueryMaterialsRequestSchema = z.object({
  coordinate: CoordinateSchema,
  radius: z.number().min(0).finite().optional(),
});

export const QueryMaterialsResponseSchema = z.object({
  coordinate: CoordinateSchema,
  materials: z.array(MaterialSchema),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Vector3 = z.infer<typeof Vector3Schema>;
export type Coordinate = z.infer<typeof CoordinateSchema>;
export type Color = z.infer<typeof ColorSchema>;
export type MaterialType = z.infer<typeof MaterialTypeSchema>;
export type Material = z.infer<typeof MaterialSchema>;
export type MaterialComposition = z.infer<typeof MaterialCompositionSchema>;
export type DebrisObject = z.infer<typeof DebrisObjectSchema>;
export type AccretionEvent = z.infer<typeof AccretionEventSchema>;
export type PlanetaryLayer = z.infer<typeof PlanetaryLayerSchema>;
export type Planet = z.infer<typeof PlanetSchema>;
export type Archetype = z.infer<typeof ArchetypeSchema>;
export type Traits = z.infer<typeof TraitsSchema>;
export type Need = z.infer<typeof NeedSchema>;
export type Creature = z.infer<typeof CreatureSchema>;
export type Pack = z.infer<typeof PackSchema>;
export type ToolType = z.infer<typeof ToolTypeSchema>;
export type ToolBoost = z.infer<typeof ToolBoostSchema>;
export type Tool = z.infer<typeof ToolSchema>;
export type Territory = z.infer<typeof TerritorySchema>;
export type Tribe = z.infer<typeof TribeSchema>;
export type BuildingType = z.infer<typeof BuildingTypeSchema>;
export type Building = z.infer<typeof BuildingSchema>;
export type Ritual = z.infer<typeof RitualSchema>;
export type Myth = z.infer<typeof MythSchema>;
export type Religion = z.infer<typeof ReligionSchema>;
export type GameState = z.infer<typeof GameStateSchema>;
export type CreateGameRequest = z.infer<typeof CreateGameRequestSchema>;
export type CreateGameResponse = z.infer<typeof CreateGameResponseSchema>;
export type AdvanceGameRequest = z.infer<typeof AdvanceGameRequestSchema>;
export type QueryMaterialsRequest = z.infer<typeof QueryMaterialsRequestSchema>;
export type QueryMaterialsResponse = z.infer<typeof QueryMaterialsResponseSchema>;
