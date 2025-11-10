/**
 * BIOLOGY REGULATOR
 *
 * Domain-specific regulator for all biological laws.
 * Knows biology.ts, biomechanics.ts, growth-models.ts, etc.
 *
 * Like FDA (Food & Drug Administration) - regulates biology/medicine domain
 */

import { DomainRegulator, LegalRequest, LegalResponse } from '../LegalBroker';
import { LAWS } from '../../index';

export class BiologyRegulator implements DomainRegulator {
  domain = 'biology';

  canHandle(request: LegalRequest): boolean {
    // Can handle anything biology-related
    return (
      request.domain === 'biology' ||
      request.action.includes('metabolism') ||
      request.action.includes('growth') ||
      request.action.includes('lifespan') ||
      request.action.includes('allometry')
    );
  }

  process(request: LegalRequest): LegalResponse {
    console.log(`[BiologyRegulator] Processing: ${request.action}`);

    // Route to appropriate biology law
    let value = null;
    let precedent = '';
    let confidence = 1.0;

    switch (request.action) {
      case 'calculate-metabolism':
        if (LAWS.biology.allometry?.basalMetabolicRate) {
          value = LAWS.biology.allometry.basalMetabolicRate(request.params.mass);
          precedent = 'biology.allometry.basalMetabolicRate (Kleiber 1932)';
        }
        break;

      case 'calculate-lifespan':
        if (LAWS.biology.allometry?.maxLifespan) {
          value = LAWS.biology.allometry.maxLifespan(request.params.mass);
          precedent = 'biology.allometry.maxLifespan';
        }
        break;

      case 'calculate-home-range':
        if (LAWS.biology.allometry?.homeRange) {
          value = LAWS.biology.allometry.homeRange(
            request.params.mass,
            request.params.trophicLevel
          );
          precedent = 'biology.allometry.homeRange';
        }
        break;

      case 'check-structural-limits':
        if (LAWS.biology.structural?.maxMassForGravity) {
          value = LAWS.biology.structural.maxMassForGravity(request.params.gravity);
          precedent = 'biology.structural.maxMassForGravity';
        }
        break;

      // NEW: Goal suggestions for agents
      case 'get-default-goals':
        value = this.getDefaultGoalsForAgent(request.params.agentType);
        precedent = 'BiologyRegulator goal assignment';
        break;

      // NEW: Spawn condition checking
      case 'evaluate-spawn-conditions':
        value = this.canSpawnCreature(request.params, request.state);
        precedent = 'Biology laws spawn evaluation';
        break;

      // NEW: Analytical population advancement
      case 'advance-population-analytically':
        value = this.advancePopulations(request.params.populations, request.params.deltaTime);
        precedent = 'Lotka-Volterra analytical solution';
        break;

      default:
        console.warn(`[BiologyRegulator] Unknown action: ${request.action}`);
        confidence = 0;
    }

    // NaN guard
    if (typeof value === 'number' && isNaN(value)) {
      console.error(`[BiologyRegulator] NaN result for ${request.action}`);
      value = null;
      confidence = 0;
    }

    return {
      value,
      authority: this.domain,
      confidence,
      precedents: precedent ? [precedent] : [],
    };
  }

  /**
   * Get default goals for a creature agent
   */
  private getDefaultGoalsForAgent(agentType: string): string[] {
    if (agentType === 'creature') {
      return ['FindFood', 'AvoidPredator', 'Rest', 'Reproduce'];
    }
    return [];
  }
  
  /**
   * Check if creature can spawn at location
   */
  private canSpawnCreature(params: any, state: any): boolean {
    // Check basic requirements
    const hasSufficientComplexity = state.complexity >= 5; // LIFE level
    const hasAtmosphere = params.atmosphereMass > 0;
    const temperatureOk = params.temperature > 250 && params.temperature < 350;
    
    return hasSufficientComplexity && hasAtmosphere && temperatureOk;
  }
  
  /**
   * Advance populations analytically (without agents)
   */
  private advancePopulations(populations: Record<string, number>, deltaTime: number): Record<string, number> {
    const newPops: Record<string, number> = {};
    
    for (const [species, pop] of Object.entries(populations)) {
      // Logistic growth: dN/dt = rN(1 - N/K)
      const r = 0.1; // Growth rate (10% per year)
      const K = 10000; // Carrying capacity
      const dt = deltaTime / (365.25 * 86400); // Convert to years
      
      // Analytical solution
      const newPop = K / (1 + ((K - pop) / pop) * Math.exp(-r * dt));
      newPops[species] = Math.floor(newPop);
    }
    
    return newPops;
  }

  getLaws(): string[] {
    return [
      'biology.allometry.basalMetabolicRate',
      'biology.allometry.maxLifespan',
      'biology.allometry.homeRange',
      'biology.structural.maxMassForGravity',
      'biomechanics.locomotion.costOfTransport',
      'growth.vonBertalanffy',
      'growth.gompertz',
      'biology.spawn-conditions', // NEW
      'biology.goal-assignment', // NEW
      'biology.analytical-advancement', // NEW
    ];
  }
}
