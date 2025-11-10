/**
 * EBB & BLOOM ENGINE
 * 
 * Law-based universe simulation engine with deterministic generation.
 * 
 * @packageDocumentation
 * @module @ebb-and-bloom/engine
 */

// Core Utilities
export { EnhancedRNG } from './utils/EnhancedRNG';
export { validateSeed, generateSeed } from './utils/seed-manager';

// Universal Constants
export * from './tables';

// All Laws
export * from './laws';

// Spawners (World Generation)
export { ChunkManager } from './spawners/ChunkManager';
export { BiomeSystem } from './spawners/BiomeSystem';
export { SimplexNoise } from './spawners/SimplexNoise';
export { VegetationSpawner } from './spawners/VegetationSpawner';
export { SettlementPlacer } from './spawners/SettlementPlacer';
export { NPCSpawner } from './spawners/NPCSpawner';
export { CreatureSpawner } from './spawners/CreatureSpawner';
export { WaterSystem } from './spawners/WaterSystem';

// Simulation Systems
export { UniverseSimulator } from './simulation/UniverseSimulator';
export { UniverseActivityMap } from './simulation/UniverseActivityMap';
export { TimelineSimulator } from './simulation/TimelineSimulator';

// Synthesis
export { GenesisSynthesisEngine } from './synthesis/GenesisSynthesisEngine';

// Types
export type * from './types/generation-zero';
export type * from './types/yuka';

/**
 * Engine version
 */
export const VERSION = '1.0.0';

/**
 * Engine info
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
    'Law-based world spawning',
    'React Three Fiber compatible'
  ]
} as const;

