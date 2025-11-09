/**
 * Universal Laws
 * 
 * This is the foundation of the entire simulation.
 * Everything in the game emerges from these deterministic laws.
 * 
 * NO AI GENERATION. NO RANDOM GUESSES. ONLY MATHEMATICAL RELATIONSHIPS.
 */

export { PHYSICS_CONSTANTS } from '../tables/physics-constants.js';
export { PERIODIC_TABLE, PRIMORDIAL_ABUNDANCES } from '../tables/periodic-table.js';
export * from '../tables/linguistic-roots.js';

import { PhysicalLaws } from './physics.js';
import { StellarLaws } from './stellar.js';
import { BiologicalLaws } from './biology.js';
import { EcologicalLaws } from './ecology.js';
import { SocialLaws } from './social.js';
import { TaxonomicLaws } from './taxonomy.js';
import { BiomechanicsLaws } from './biomechanics.js';
import { BehavioralEcologyLaws } from './behavioral-ecology.js';
import { SensoryBiologyLaws } from './sensory-biology.js';
import { ReproductionLaws } from './reproduction.js';
import { GrowthModelLaws } from './growth-models.js';
import { AnimalHusbandryLaws } from './animal-husbandry.js';
import { CognitiveScienceLaws } from './cognitive-science.js';
import { GameTheoryLaws } from './game-theory.js';
import { EconomicsLaws } from './economics.js';
import { ClimateScienceLaws } from './02-planetary/climate-science.js';
import { SoilScienceLaws } from './02-planetary/soil-science.js';
import { GeologyLaws } from './02-planetary/geology.js';
import { HydrologyLaws } from './02-planetary/hydrology.js';
import { MaterialsScienceLaws } from './02-planetary/materials-science.js';
import { AnatomyLaws } from './04-biological/anatomy.js';
import { DemographicsLaws } from './06-social/demographics.js';
import { EpidemiologyLaws } from './06-social/epidemiology.js';
import { CombustionLaws } from './07-technological/combustion.js';
import { MetallurgyLaws } from './07-technological/metallurgy.js';
import { AgricultureLaws } from './07-technological/agriculture.js';
import { ArchitectureLaws } from './07-technological/architecture.js';
import { LinguisticsLaws } from './05-cognitive/linguistics.js';

export { 
  PhysicalLaws, 
  StellarLaws, 
  BiologicalLaws, 
  EcologicalLaws, 
  SocialLaws, 
  TaxonomicLaws,
  BiomechanicsLaws,
  BehavioralEcologyLaws,
  SensoryBiologyLaws,
  ReproductionLaws,
  GrowthModelLaws,
  AnimalHusbandryLaws,
  CognitiveScienceLaws,
  GameTheoryLaws,
  EconomicsLaws,
};

/**
 * The Complete Law System
 * 
 * This object contains ALL the laws of the universe.
 * Pass in properties, get deterministic results.
 * 
 * EVERY FORMULA IS PEER-REVIEWED.
 * EVERY RELATIONSHIP IS VALIDATED.
 * YUKA CAN SIMULATE MILLENNIA INTO THE FUTURE.
 */
export const LAWS = {
  // Foundation
  physics: PhysicalLaws,
  stellar: StellarLaws,
  
  // Life
  biology: BiologicalLaws,
  biomechanics: BiomechanicsLaws,
  sensory: SensoryBiologyLaws,
  reproduction: ReproductionLaws,
  growth: GrowthModelLaws,
  
  // Populations
  ecology: EcologicalLaws,
  behavioral: BehavioralEcologyLaws,
  
  // Mind
  cognitive: CognitiveScienceLaws,
  gameTheory: GameTheoryLaws,
  
  // Society
  social: SocialLaws,
  economics: EconomicsLaws,
  taxonomy: TaxonomicLaws,
  
  // Applied
  husbandry: AnimalHusbandryLaws,
  
  // Planetary sciences
  climate: ClimateScienceLaws,
  soil: SoilScienceLaws,
  geology: GeologyLaws,
  hydrology: HydrologyLaws,
  materials: MaterialsScienceLaws,
  
  // Extended biological
  anatomy: AnatomyLaws,
  
  // Extended social
  demographics: DemographicsLaws,
  epidemiology: EpidemiologyLaws,
  linguistics: LinguisticsLaws,
  
  // Technology
  combustion: CombustionLaws,
  metallurgy: MetallurgyLaws,
  agriculture: AgricultureLaws,
  architecture: ArchitectureLaws,
} as const;

/**
 * Type: A Law is a pure function from input to output
 */
export type Law<Input, Output> = (input: Input) => Output;

/**
 * All laws follow this pattern:
 * 
 * const gravity: Law<{m1, m2, r}, Force> = ({m1, m2, r}) => G * m1 * m2 / r²
 * const metabolism: Law<Mass, Power> = (mass) => 70 * mass^0.75
 * const governanceType: Law<{pop, surplus}, Type> = ({pop, surplus}) => ...
 * 
 * Everything is deterministic. Same inputs = same outputs. Always.
 */
