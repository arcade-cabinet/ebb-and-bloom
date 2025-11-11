/**
 * GOVERNOR ENERGY LEDGER
 * 
 * Tracks energy budget for governors (both AI and Player).
 * Ensures fair competition through identical energy constraints.
 */

export interface EnergyLedgerConfig {
  maxEnergy: number;            // Maximum energy capacity
  initialEnergy: number;        // Starting energy
  regenPerGeneration: number;   // Energy regeneration rate
}

/**
 * Energy budget tracker for governors
 */
export class GovernorEnergyLedger {
  private currentEnergy: number;
  private maxEnergy: number;
  private regenPerGeneration: number;
  private totalSpent: number = 0;
  private actionHistory: Array<{ action: string; cost: number; timestamp: number }> = [];
  
  constructor(config: EnergyLedgerConfig) {
    this.currentEnergy = config.initialEnergy;
    this.maxEnergy = config.maxEnergy;
    this.regenPerGeneration = config.regenPerGeneration;
  }
  
  /**
   * Check if governor can afford an action
   */
  canAfford(cost: number): boolean {
    return this.currentEnergy >= cost;
  }
  
  /**
   * Spend energy on an action
   * @throws If insufficient energy
   */
  spend(actionId: string, cost: number): void {
    if (!this.canAfford(cost)) {
      throw new Error(
        `Insufficient energy: need ${cost}, have ${this.currentEnergy}`
      );
    }
    
    this.currentEnergy -= cost;
    this.totalSpent += cost;
    this.actionHistory.push({
      action: actionId,
      cost,
      timestamp: Date.now(),
    });
  }
  
  /**
   * Regenerate energy (called each generation)
   */
  regenerate(): void {
    this.currentEnergy = Math.min(
      this.currentEnergy + this.regenPerGeneration,
      this.maxEnergy
    );
  }
  
  /**
   * Get current energy
   */
  getCurrent(): number {
    return this.currentEnergy;
  }
  
  /**
   * Get maximum energy
   */
  getMax(): number {
    return this.maxEnergy;
  }
  
  /**
   * Get energy percentage (0-1)
   */
  getPercentage(): number {
    return this.currentEnergy / this.maxEnergy;
  }
  
  /**
   * Get total energy spent
   */
  getTotalSpent(): number {
    return this.totalSpent;
  }
  
  /**
   * Get action history
   */
  getHistory(): ReadonlyArray<{ action: string; cost: number; timestamp: number }> {
    return this.actionHistory;
  }
  
  /**
   * Reset energy to max (for testing)
   */
  reset(): void {
    this.currentEnergy = this.maxEnergy;
    this.totalSpent = 0;
    this.actionHistory = [];
  }
}
