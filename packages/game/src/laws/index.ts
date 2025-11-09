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

export { PhysicalLaws, StellarLaws, BiologicalLaws, EcologicalLaws, SocialLaws, TaxonomicLaws };

/**
 * The Complete Law System
 * 
 * This object contains all the laws of the universe.
 * Pass in properties, get deterministic results.
 */
export const LAWS = {
  physics: PhysicalLaws,
  stellar: StellarLaws,
  biology: BiologicalLaws,
  ecology: EcologicalLaws,
  social: SocialLaws,
  taxonomy: TaxonomicLaws,
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
