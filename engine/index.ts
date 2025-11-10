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
// SIMULATION SYSTEMS
// ============================================================================

export { UniverseSimulator } from './simulation/UniverseSimulator';
export { UniverseActivityMap } from './simulation/UniverseActivityMap';
export { TimelineSimulator } from './simulation/TimelineSimulator';

// ============================================================================
// SYNTHESIS (Genesis Engine)
// ============================================================================

export { GenesisSynthesisEngine } from './synthesis/GenesisSynthesisEngine';

// ============================================================================
// CORE ENGINE
// ============================================================================

export { GameEngine } from './core/GameEngine';
export { GameEngineBackend } from './core/GameEngineBackend';

// ============================================================================
// GENERATION
// ============================================================================

export { EnhancedUniverseGenerator } from './generation/EnhancedUniverseGenerator';
export { SimpleUniverseGenerator } from './generation/SimpleUniverseGenerator';

// ============================================================================
// PHYSICS
// ============================================================================

export { MonteCarloAccretion } from './physics/MonteCarloAccretion';

// ============================================================================
// PLANETARY
// ============================================================================

export * from './planetary/composition';
export * from './planetary/layers';
export * from './planetary/noise';

// ============================================================================
// PROCEDURAL
// ============================================================================

export { YukaGuidedGeneration } from './procedural/YukaGuidedGeneration';
export { CreatureMeshGenerator } from './procedural/CreatureMeshGenerator';

// ============================================================================
// SYSTEMS
// ============================================================================

export { CreatureBehaviorSystem } from './systems/CreatureBehaviorSystem';
export { PackFormationSystem } from './systems/PackFormationSystem';
export { ToolSystem } from './systems/ToolSystem';
export { TradeSystem } from './systems/TradeSystem';
export { StructureBuildingSystem } from './systems/StructureBuildingSystem';

// ============================================================================
// AGENTS (Yuka Integration)
// ============================================================================

export { AgentSpawner } from './agents/AgentSpawner';
export { AgentLODSystem } from './agents/AgentLODSystem';
export { CreatureAgent } from './agents/CreatureAgent';
export { PlanetaryAgent } from './agents/PlanetaryAgent';
export { GravityBehavior } from './agents/behaviors/GravityBehavior';

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
