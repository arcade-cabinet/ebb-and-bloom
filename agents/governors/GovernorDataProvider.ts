/**
 * GOVERNOR DATA PROVIDER INTERFACE
 * 
 * THE BRIDGE ARCHITECTURE (30 Years of Innovation)
 * ================================================
 * 
 * This interface defines how DFU spawners REQUEST data from governors.
 * 
 * OLD DFU APPROACH:
 * -----------------
 * population = MAPS.BSA.lookup(regionID)  [Hardcoded database]
 * temperature = CLIMATE.BSA.lookup(x, z)  [Static data]
 * settlement_type = LOCATION_TYPES[id]    [Predefined]
 * 
 * NEW APPROACH (Governor-Based):
 * ------------------------------
 * population = EcologyGovernor.calculateCarryingCapacity(terrain, climate) [Laws]
 * temperature = PhysicsGovernor.calculateTemperature(latitude, altitude)   [Laws]
 * settlement_type = SocialGovernor.determineGovernanceType(population)     [Laws]
 * 
 * CORE PRINCIPLE:
 * ---------------
 * DFU spawners are GOOD code - we keep their proven 30-year-old logic intact.
 * We DON'T replace spawners - they work perfectly!
 * We REPLACE their data source:
 *   MAPS.BSA (hardcoded) → Governors (scientific laws)
 * 
 * ARCHITECTURE:
 * ------------
 * Governors (Modern AI)          DFU Spawners (Proven Code)
 * --------------------           ------------------------
 * Use scientific laws       →    Receive intelligent data
 * Calculate from terrain    →    Spawn settlements/NPCs/creatures
 * No hardcoded data         →    Execute proven DFU logic
 * 
 * EXAMPLE USAGE:
 * -------------
 * In SettlementPlacer (DFU spawner):
 * 
 *   OLD: const population = MAPS.BSA.getPopulation(regionID);
 *   NEW: const population = governorDataProvider.calculateSettlementPopulation(terrain, climate);
 * 
 *   OLD: const schedule = NPC_SCHEDULES[npcRole];
 *   NEW: const schedule = governorDataProvider.generateNPCSchedule(role, settlement);
 * 
 * This is THE BRIDGE between governors and spawners.
 */

import { BiomeType } from '../../generation/spawners/BiomeSystem';

export interface TerrainContext {
  biome: BiomeType;
  elevation: number;
  slope: number;
  nearWater: boolean;
  temperature: number;
  moisture: number;
  x: number;
  z: number;
}

export interface ClimateContext {
  temperature: number;
  precipitation: number;
  seasonality: number;
  latitude: number;
}

export interface SettlementContext {
  population: number;
  governanceType: GovernanceType;
  resources: ResourceAvailability;
  location: { x: number; z: number };
}

export enum GovernanceType {
  BAND = 'band',           // 30-50 people (family groups)
  TRIBE = 'tribe',         // 50-500 people
  CHIEFDOM = 'chiefdom',   // 500-5000 people
  STATE = 'state'          // 5000+ people
}

export interface ResourceAvailability {
  wood: number;
  stone: number;
  metal: number;
  food: number;
}

export interface NPCSchedule {
  activities: Array<{
    time: number;
    duration: number;
    action: string;
    location: string;
  }>;
}

export interface GovernorDataProvider {
  calculateSettlementPopulation(terrain: TerrainContext, climate: ClimateContext): number;

  determineGovernanceType(population: number, culturalComplexity: number): GovernanceType;

  calculateCarryingCapacity(biome: BiomeType, area: number, temperature: number): number;

  generateNPCSchedule(role: string, settlement: SettlementContext): NPCSchedule;

  calculateResourceAvailability(terrain: TerrainContext, season: number): ResourceAvailability;

  determineBuildingMaterials(resources: ResourceAvailability, governanceType: GovernanceType): string[];

  calculateCreatureDensity(biome: BiomeType, carriyingCapacity: number): number;

  generateCreatureBehavior(species: string, biome: BiomeType): any;

  calculateMigrationPatterns(terrain: TerrainContext, season: number): any;
}
