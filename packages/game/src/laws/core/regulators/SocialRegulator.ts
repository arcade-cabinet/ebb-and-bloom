/**
 * SOCIAL REGULATOR
 *
 * Domain-specific regulator for social laws.
 * Knows social.ts, economics.ts, game-theory.ts
 */

import { DomainRegulator, LegalRequest, LegalResponse } from '../LegalBroker';
import { LAWS } from '../../index';

export class SocialRegulator implements DomainRegulator {
  domain = 'social';

  canHandle(request: LegalRequest): boolean {
    return (
      request.domain === 'social' ||
      request.action.includes('group') ||
      request.action.includes('cooperation') ||
      request.action.includes('trade') ||
      request.action.includes('governance')
    );
  }

  process(request: LegalRequest): LegalResponse {
    console.log(`[SocialRegulator] Processing: ${request.action}`);

    let value = null;
    let precedent = '';
    let confidence = 0.8; // Social laws are emergent

    switch (request.action) {
      case 'max-group-size':
        // Dunbar's number: ~150 for humans, scales with brain
        value = 150 * Math.pow(request.params.brainSize / 1200, 0.76);
        precedent = 'social (Dunbar 1992)';
        break;
      
      case 'governance-type':
        value = LAWS.social.service.classify(
          request.params.population,
          request.params.density || 1,
          request.params.surplus || 0
        );
        precedent = 'social.service.classify (Service 1962)';
        break;

      default:
        console.warn(`[SocialRegulator] Unknown action: ${request.action}`);
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
      'social.dunbar.cognitiveGroupSize',
      'social.service.typology',
      'economics.comparativeAdvantage',
      'gameTheory.cooperationESS',
    ];
  }
}
