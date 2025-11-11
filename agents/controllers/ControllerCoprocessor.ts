/**
 * CONTROLLER COPROCESSOR
 * 
 * Abstraction layer between governors and their controllers.
 * Ensures Player and YUKA governors:
 * 1. Use identical action spaces
 * 2. Have identical energy constraints
 * 3. Obey identical law validations
 * 
 * This is WHERE parity is enforced.
 */

import type { 
  GovernorActionPort, 
  GovernorActionId, 
  ActionContext, 
  GovernorIntent 
} from './GovernorActionPort';
import type { ControllerAdapter } from './ControllerAdapter';
import { GOVERNOR_ACTION_COSTS } from './GovernorActionPort';
import { GovernorEnergyLedger } from './GovernorEnergyLedger';

export interface ControllerCoprocessorConfig {
  adapter: ControllerAdapter;
  energyLedger: GovernorEnergyLedger;
  lawValidator?: LawValidator;  // Optional for now, can add later
}

/**
 * Law validation interface (placeholder for future integration)
 */
export interface LawValidator {
  validateAction(actionId: GovernorActionId, context: ActionContext): boolean;
  getViolationReason(): string;
}

/**
 * Controller coprocessor - ensures fair governor competition
 */
export class ControllerCoprocessor implements GovernorActionPort {
  private adapter: ControllerAdapter;
  private energyLedger: GovernorEnergyLedger;
  private lawValidator?: LawValidator;
  
  constructor(config: ControllerCoprocessorConfig) {
    this.adapter = config.adapter;
    this.energyLedger = config.energyLedger;
    this.lawValidator = config.lawValidator;
  }
  
  /**
   * Request an action (core parity enforcement point)
   */
  async requestAction(
    actionId: GovernorActionId,
    context: ActionContext
  ): Promise<GovernorIntent> {
    // 1. Validate law constraints (future)
    if (this.lawValidator && !this.lawValidator.validateAction(actionId, context)) {
      throw new Error(
        `Law violation: ${this.lawValidator.getViolationReason()}`
      );
    }
    
    // 2. Check energy budget
    const cost = GOVERNOR_ACTION_COSTS[actionId];
    if (!this.energyLedger.canAfford(cost)) {
      throw new Error(
        `Insufficient energy: ${actionId} costs ${cost}, ` +
        `but only ${this.energyLedger.getCurrent()} available`
      );
    }
    
    // 3. Telemetry hook
    this.adapter.onActionStart?.(actionId, context);
    
    // 4. Delegate to adapter (AI or Player)
    const intent = await this.adapter.provideInput(actionId, context);
    
    // 5. Deduct energy
    this.energyLedger.spend(actionId, cost);
    
    // 6. Telemetry hook
    this.adapter.onActionComplete?.(intent);
    
    // 7. Return normalized intent
    return intent;
  }
  
  /**
   * Get current energy status
   */
  getEnergyStatus(): { current: number; max: number; percentage: number } {
    return {
      current: this.energyLedger.getCurrent(),
      max: this.energyLedger.getMax(),
      percentage: this.energyLedger.getPercentage(),
    };
  }
  
  /**
   * Get adapter type
   */
  getAdapterType(): 'ai' | 'player' | 'network' | 'replay' {
    return this.adapter.getType();
  }
  
  /**
   * Regenerate energy (called each generation)
   */
  regenerateEnergy(): void {
    this.energyLedger.regenerate();
  }
}
