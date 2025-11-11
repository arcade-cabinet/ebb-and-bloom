/**
 * GOVERNOR ACTION PORT
 * 
 * Interface contract between governors and their controllers.
 * Ensures Player and YUKA governors have identical action spaces.
 */

import type { Vector3 } from 'three';

/**
 * All available governor actions
 */
export type GovernorActionId = 
  | 'smitePredator'      // Lightning strike (costs 1000 energy)
  | 'nurtureFood'        // Increase food (costs 500 energy)
  | 'shapeTerrain'       // Alter landscape (costs 2000 energy)
  | 'applyPressure'      // Environmental stress (costs 750 energy)
  | 'selectPrey'         // Choose hunt target (free, but opportunity cost)
  | 'formAlliance'       // Mutualism with other species (costs 300 energy)
  | 'migrate';           // Move species (costs 1500 energy)

/**
 * Context provided to controllers when requesting actions
 */
export interface ActionContext {
  // Species info
  speciesId: string;
  population: number;
  territory: { x: number; z: number; radius: number };
  
  // Available targets/options
  availablePrey?: string[];
  nearbySpecies?: string[];
  validPositions?: Vector3[];
  
  // Law constraints
  carryingCapacityLimit?: number;
  energyAvailable: number;
  
  // Environmental data
  foodDensity?: number;
  predatorDensity?: number;
  temperature?: number;
}

/**
 * Standardized action intent returned by all controllers
 */
export interface GovernorIntent {
  type: GovernorActionId;
  target?: string | Vector3;  // Species ID or position
  magnitude?: number;         // Law-constrained intensity (0-1)
  duration?: number;          // How long effect lasts (seconds)
  metadata?: {
    reasoning?: string;       // AI: decision tree path, Player: user note
    confidence?: number;      // AI: certainty level (0-1)
  };
}

/**
 * Governor action costs (energy units)
 */
export const GOVERNOR_ACTION_COSTS: Record<GovernorActionId, number> = {
  smitePredator: 1000,
  nurtureFood: 500,
  shapeTerrain: 2000,
  applyPressure: 750,
  selectPrey: 0,        // Free but opportunity cost
  formAlliance: 300,
  migrate: 1500,
};

/**
 * Interface for requesting actions from controllers
 */
export interface GovernorActionPort {
  /**
   * Request an action from the controller (AI or Player)
   * 
   * @param actionId - The action to perform
   * @param context - Environmental and species context
   * @returns Promise resolving to the action intent
   * @throws If energy budget insufficient or laws violated
   */
  requestAction(
    actionId: GovernorActionId,
    context: ActionContext
  ): Promise<GovernorIntent>;
}
