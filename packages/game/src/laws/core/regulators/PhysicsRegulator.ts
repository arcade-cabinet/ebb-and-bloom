/**
 * PHYSICS REGULATOR
 *
 * Domain-specific regulator for all physics laws.
 * Knows physics.ts, stellar.ts, etc.
 *
 * Like laws of thermodynamics - ALWAYS apply, highest precedence
 */

import { DomainRegulator, LegalRequest, LegalResponse } from '../LegalBroker';
import { LAWS } from '../../index';

export class PhysicsRegulator implements DomainRegulator {
  domain = 'physics';

  canHandle(request: LegalRequest): boolean {
    return (
      request.domain === 'physics' ||
      request.action.includes('gravity') ||
      request.action.includes('orbital') ||
      request.action.includes('stellar') ||
      request.action.includes('thermodynamics')
    );
  }

  process(request: LegalRequest): LegalResponse {
    console.log(`[PhysicsRegulator] Processing: ${request.action}`);

    let value = null;
    let precedent = '';
    const confidence = 1.0; // Physics laws are always certain

    switch (request.action) {
      case 'calculate-gravity':
        if (LAWS.physics.gravity?.surfaceGravity) {
          value = LAWS.physics.gravity.surfaceGravity(request.params.mass, request.params.radius);
          precedent = 'physics.gravity.surfaceGravity (Newton 1687)';
        }
        break;

      case 'calculate-orbital-period':
        // Use Kepler's third law directly
        const a = request.params.semiMajorAxis;
        const M = request.params.centralMass;
        value = 2 * Math.PI * Math.sqrt(Math.pow(a, 3) / (39.476 * M));
        precedent = 'physics.gravity (Kepler 1619)';
        break;

      case 'calculate-stellar-luminosity':
        if (LAWS.stellar.mainSequence?.luminosity) {
          value = LAWS.stellar.mainSequence.luminosity(request.params.mass);
          precedent = 'stellar.mainSequence.luminosity';
        }
        break;

      case 'evaluate-spawn-conditions':
        // Check if physics allows agent spawning
        const agentType = request.params.agentType;
        
        // Stellar agents: Always OK from physics perspective (entropy regulates timing)
        if (agentType === 'stellar') {
          value = true;
          precedent = 'Physics allows stellar formation';
        } else {
          value = true; // Other types OK by default
        }
        break;

      case 'get-default-goals':
        // Return goals for stellar agents
        if (request.params.agentType === 'stellar') {
          value = ['FusionGoal', 'SupernovaGoal'];
          precedent = 'Stellar evolution lifecycle';
        }
        break;

      default:
        console.warn(`[PhysicsRegulator] Unknown action: ${request.action}`);
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
      'physics.gravity.surfaceGravity',
      'physics.orbits.orbitalPeriod',
      'physics.thermodynamics',
      'stellar.mainSequence.luminosity',
      'stellar.mainSequence.radius',
      'stellar.mainSequence.temperature',
    ];
  }
}
