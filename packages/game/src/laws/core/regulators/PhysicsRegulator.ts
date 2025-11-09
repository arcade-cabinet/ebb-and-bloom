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
      
      case 'check-jeans-instability':
        // Check if molecular cloud has sufficient mass to collapse (Jeans criterion)
        // M > M_J where M_J = (5 * k_B * T / (G * m_H))^(3/2) * (3 / (4 * π * ρ))^(1/2)
        const { density, temperature, mass } = request.params;
        
        // Constants
        const k_B = 1.38e-23;  // Boltzmann constant (J/K)
        const G = 6.674e-11;    // Gravitational constant (m³/kg/s²)
        const m_H = 1.67e-27;   // Hydrogen mass (kg)
        
        // Jeans mass calculation
        const tempFactor = Math.pow(5 * k_B * temperature / (G * m_H), 1.5);
        const densityFactor = Math.pow(3 / (4 * Math.PI * density), 0.5);
        const M_J = tempFactor * densityFactor;
        
        // Check if cloud mass exceeds Jeans mass
        const canCollapse = mass > M_J;
        
        value = canCollapse;
        precedent = `Jeans mass: M_J = ${M_J.toExponential(2)} kg, Cloud mass: ${mass.toExponential(2)} kg (Jeans 1902)`;
        
        if (canCollapse) {
          console.log(`  ✅ Jeans instability: M (${mass.toExponential(2)}) > M_J (${M_J.toExponential(2)})`);
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
