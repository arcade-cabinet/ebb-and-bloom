/**
 * Backend Schema Re-exports
 * Re-exports types from @ebb/shared/schemas for convenience
 * This keeps types DRY - single source of truth in shared package
 */

export type {
  // Primitives
  Vector3,
  Coordinate,
  Color,
  
  // Materials
  MaterialType,
  Material,
  MaterialComposition,
  
  // Gen 0: Accretion
  DebrisObject,
  AccretionEvent,
  PlanetaryLayer,
  Planet,
  
  // Gen 1: Creatures
  Archetype,
  Traits,
  Need,
  Creature,
  
  // Gen 2: Packs
  Pack,
  
  // Gen 3: Tools
  ToolType,
  ToolBoost,
  Tool,
  
  // Gen 4: Tribes
  Territory,
  Tribe,
  
  // Gen 5: Buildings
  BuildingType,
  Building,
  
  // Gen 6: Religion
  Ritual,
  Myth,
  Religion,
  
  // Game State
  GameState,
  
  // API Types
  CreateGameRequest,
  CreateGameResponse,
  AdvanceGameRequest,
  QueryMaterialsRequest,
  QueryMaterialsResponse,
} from '@ebb/shared/schemas';

