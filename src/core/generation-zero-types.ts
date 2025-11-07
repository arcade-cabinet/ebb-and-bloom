/**
 * Generation 0 Type Definitions
 * 
 * Core types for planetary genesis system.
 * These types define the structure of AI-generated planetary data.
 */

/**
 * Planetary core definition
 */
export interface PlanetaryCore {
  name: string;
  description: string;
  color: string;
  dominantElement: string;
  temperature: number; // 0-10
  pressure: number; // 0-10
  stability: number; // 0-10
  meshyPrompt: string;
}

/**
 * Shared material definition
 */
export interface SharedMaterial {
  name: string;
  category: 'stone' | 'ore' | 'crystal' | 'organic' | 'liquid';
  affinityTypes: string[];
  rarity: number; // 0-1
  baseDepth: number; // meters
  hardness: number; // 0-10
  description: string;
}

/**
 * Fill material definition
 */
export interface FillMaterial {
  name: string;
  type: 'soil' | 'water' | 'cork' | 'ash' | 'sand';
  density: number; // 0-10
  permeability: number; // 0-10
  oxygenation: number; // 0-10
  lightPenetration: number; // 0-10
  waterRetention: number; // 0-10
  description: string;
}

/**
 * Complete planetary manifest
 */
export interface PlanetaryManifest {
  seedPhrase: string;
  planetaryName: string;
  cores: PlanetaryCore[]; // Should be exactly 8
  sharedMaterials: SharedMaterial[];
  fillMaterial: FillMaterial;
  worldTheme: string;
}

/**
 * Core-specific material (unique to one core type)
 */
export interface CoreSpecificMaterial {
  name: string;
  coreName: string;
  category: 'stone' | 'ore' | 'crystal' | 'organic' | 'liquid';
  depth: number; // meters
  density: number; // 0-10
  attraction: number; // 0-10 (cohesion force)
  cohesion: number; // 0-10 (bonds to similar materials)
  mass: number; // 0-10
  size: number; // 0-10
  shape: 'spherical' | 'cubic' | 'irregular' | 'crystalline' | 'layered';
  description: string;
}

/**
 * Creature archetype definition
 */
export interface CreatureArchetype {
  name: string;
  coreName: string;
  category: 'terrestrial' | 'aquatic' | 'aerial' | 'subterranean';
  size: number; // 0-10
  mobility: number; // 0-10
  manipulation: number; // 0-10 (dexterity)
  intelligence: number; // 0-10
  socialTendency: number; // 0-10 (pack formation)
  aggression: number; // 0-10
  description: string;
  meshyPrompt: string;
}

/**
 * Core specialist manifest (child workflow output)
 */
export interface CoreSpecialistManifest {
  coreName: string;
  materials: CoreSpecificMaterial[];
  creatures: CreatureArchetype[];
}

/**
 * Complete Gen 0 output
 */
export interface GenerationZeroOutput {
  planetary: PlanetaryManifest;
  coreManifests: CoreSpecialistManifest[];
}
