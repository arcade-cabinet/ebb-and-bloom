/**
 * EBB & BLOOM ENGINE
 * 
 * Law-based universe simulation engine with deterministic generation.
 * 
 * @packageDocumentation
 * @module ebb-and-bloom-engine
 */

// ============================================================================
// CORE UTILITIES
// ============================================================================

export { EnhancedRNG } from './utils/EnhancedRNG';
export { validateSeed, generateSeed } from './utils/seed/seed-manager';

// ============================================================================
// UNIVERSAL CONSTANTS
// ============================================================================

export * from './tables';

// ============================================================================
// LAWS ELIMINATED - See engine/governors instead
// ============================================================================
// The laws directory has been completely eliminated and replaced with
// Yuka-native governors. All law functionality is now in governors/

// ============================================================================
// SPAWNERS (World Generation)
// ============================================================================

export { ChunkManager } from './spawners/ChunkManager';
export { BiomeSystem } from './spawners/BiomeSystem';
export type { BiomeType, BiomeInfo } from './spawners/BiomeSystem';
export { SimplexNoise } from './spawners/SimplexNoise';
export { VegetationSpawner } from './spawners/VegetationSpawner';
export type { TreeType, VegetationConfig } from './spawners/VegetationSpawner';
export { SettlementPlacer } from './spawners/SettlementPlacer';
export type { Settlement, SettlementType, Building, BuildingType } from './spawners/SettlementPlacer';
export { NPCSpawner } from './spawners/NPCSpawner';
export { CreatureSpawner } from './spawners/CreatureSpawner';
export { WaterSystem } from './spawners/WaterSystem';

// ============================================================================
// CORE ENGINE (DFU-Based Architecture)
// ============================================================================

export { WorldManager } from './core/WorldManager';
export type { WorldConfig } from './core/WorldManager';
export { TerrainSystem } from './core/TerrainSystem';
export type { RaycastHit } from './core/TerrainSystem';
export { PlayerController } from './core/PlayerController';
export { CreatureManager } from './core/CreatureManager';
export { CityPlanner } from './core/CityPlanner';
export type { CityLayout, District } from './core/CityPlanner';

// ============================================================================
// PROCEDURAL (Governor-Driven Synthesis)
// ============================================================================

export { CreatureMeshGenerator } from './procedural/CreatureMeshGenerator';
export type { CreatureTraits, BiomeContext } from './procedural/CreatureMeshGenerator';
export { MolecularSynthesis } from './procedural/MolecularSynthesis';
export type { MolecularComposition, BodyPlan } from './procedural/MolecularSynthesis';
export { PigmentationSynthesis } from './procedural/PigmentationSynthesis';
export type { DietaryInput, Environment } from './procedural/PigmentationSynthesis';
export { StructureSynthesis } from './procedural/StructureSynthesis';
export type { MaterialAvailability } from './procedural/StructureSynthesis';
export { BuildingArchitect } from './procedural/BuildingArchitect';
export type { BuildingSpec, MaterialSet, BuildingLayout } from './procedural/BuildingArchitect';
export { InteriorGenerator } from './procedural/InteriorGenerator';
export type { InteriorLayout } from './procedural/InteriorGenerator';
export { WeaponSynthesis } from './procedural/WeaponSynthesis';
export type { WeaponType, WeaponMaterials, WeaponStats } from './procedural/WeaponSynthesis';

// ============================================================================
// SYSTEMS
// ============================================================================

export { CreatureBehaviorSystem } from './systems/CreatureBehaviorSystem';
export { PackFormationSystem } from './systems/PackFormationSystem';
export { ToolSystem } from './systems/ToolSystem';
export { TradeSystem } from './systems/TradeSystem';
export { StructureBuildingSystem } from './systems/StructureBuildingSystem';

// ============================================================================
// AGENTS (Creature AI)
// ============================================================================

export { CreatureAgent } from './agents/CreatureAgent';

// ============================================================================
// GOVERNORS (Yuka-Native Law Implementation)
// ============================================================================

export * from './governors';

// ============================================================================
// TYPES
// ============================================================================

export type * from './types/generation-zero';
export type * from './types/yuka';

// ============================================================================
// METADATA
// ============================================================================

/**
 * Engine version
 */
export const VERSION = '1.0.0';

/**
 * Engine information
 */
export const ENGINE_INFO = {
  name: 'Ebb & Bloom Engine',
  version: VERSION,
  description: 'Law-based universe simulation engine',
  features: [
    'Deterministic generation from seeds',
    '57 scientific laws (physics, biology, ecology, social)',
    'Multi-scale simulation (quantum → cosmic)',
    'Yuka-based autonomous agents',
    'SimplexNoise terrain generation',
    'DFU-proven chunk streaming (7x7 grid)',
    'React Three Fiber compatible',
    'Mobile & desktop support'
  ],
  algorithms: {
    terrain: 'SimplexNoise (O(n²), superior to Perlin)',
    rendering: 'Instanced meshes (1 draw call per type)',
    texturing: 'Vertex colors (no texture lookups)',
    streaming: 'DFU pattern (7x7 chunks, recycling)',
    ai: 'Yuka steering behaviors'
  },
  performance: {
    fps: '120+ constant',
    chunks: '49 (7x7 grid)',
    vegetation: 'Instanced (thousands with minimal overhead)',
    npcs: 'Yuka AI with daily schedules',
    mobile: 'Virtual joysticks, responsive UI'
  }
} as const;
