/**
 * ECOLOGY REGULATOR
 *
 * Domain-specific regulator for ecological laws.
 * Knows ecology.ts, behavioral-ecology.ts
 *
 * Like EPA (Environmental Protection Agency) - regulates ecosystems
 */

import { DomainRegulator, LegalRequest, LegalResponse } from '../LegalBroker';
import { LAWS } from '../../index';

export class EcologyRegulator implements DomainRegulator {
  domain = 'ecology';

  canHandle(request: LegalRequest): boolean {
    return (
      request.domain === 'ecology' ||
      request.action.includes('population') ||
      request.action.includes('carrying-capacity') ||
      request.action.includes('predator-prey') ||
      request.action.includes('competition')
    );
  }

  process(request: LegalRequest): LegalResponse {
    console.log(`[EcologyRegulator] Processing: ${request.action}`);

    let value = null;
    let precedent = '';
    let confidence = 0.9; // Ecological laws are statistical

    switch (request.action) {
      case 'calculate-carrying-capacity':
        if (LAWS.ecology.carryingCapacity?.calculate) {
          value = LAWS.ecology.carryingCapacity.calculate(
            request.params.productivity,
            request.params.trophicLevel,
            request.params.metabolism
          );
          precedent = 'ecology.carryingCapacity.calculate';
        }
        break;

      case 'population-growth':
        if (LAWS.ecology.carryingCapacity?.logisticGrowth) {
          value = LAWS.ecology.carryingCapacity.logisticGrowth(
            request.params.population,
            request.params.carryingCapacity,
            request.params.growthRate,
            request.params.dt
          );
          precedent = 'ecology.carryingCapacity.logisticGrowth (Verhulst 1838)';
        }
        break;

      case 'predator-prey-dynamics':
        // Use Lotka-Volterra directly
        const prey = request.params.prey;
        const predator = request.params.predator;
        const params = request.params.params;
        
        const dPrey = LAWS.ecology.predatorPrey.preyGrowth(
          prey, predator, params.alpha, params.beta, params.dt
        );
        const dPredator = LAWS.ecology.predatorPrey.predatorGrowth(
          prey, predator, params.delta, params.gamma, params.dt
        );
        
        value = { dPrey, dPredator };
        precedent = 'ecology.predatorPrey (Lotka-Volterra 1920s)';
        break;

      default:
        console.warn(`[EcologyRegulator] Unknown action: ${request.action}`);
        confidence = 0;
    }

    return {
      value,
      authority: this.domain,
      confidence,
      precedents: precedent ? [precedent] : [],
    };
  }

  getLaws(): string[] {
    return [
      'ecology.carryingCapacity.calculate',
      'ecology.carryingCapacity.logisticGrowth',
      'ecology.predatorPrey.lotkaVolterra',
      'ecology.competition.competitiveExclusion',
      'behavioral.optimalForaging',
    ];
  }
}
