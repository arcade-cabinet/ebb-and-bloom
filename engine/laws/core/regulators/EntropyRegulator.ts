/**
 * ENTROPY REGULATOR
 * 
 * The ULTIMATE ARBITER - enforces 2nd Law of Thermodynamics
 * 
 * ALL spawning must pass through this regulator.
 * Checks:
 * - Is universe cool enough? (temperature)
 * - Is universe old enough? (cosmic time)
 * - Is complexity appropriate? (epoch)
 * - Does entropy budget allow? (free energy)
 * 
 * This is what EntropyAgent SHOULD have been - a REGULATOR not an agent trying to orchestrate.
 */

import { DomainRegulator, LegalRequest, LegalResponse } from '../LegalBroker';

const YEAR = 365.25 * 86400;

export class EntropyRegulator implements DomainRegulator {
  domain = 'entropy';
  
  // Current universe state (updated by EntropyAgent)
  temperature: number = 1e32;
  density: number = 1e96;
  age: number = 0;
  scale: number = 1;
  freeEnergy: number = 1e69;
  
  canHandle(request: LegalRequest): boolean {
    // Entropy regulator ONLY handles its own domain
    // Other regulators check spawn conditions, THEN ask entropy if thermodynamically OK
    return request.domain === 'entropy';
  }
  
  process(request: LegalRequest): LegalResponse {
    console.log(`[EntropyRegulator] Processing: ${request.action}`);
    
    let value = null;
    let precedent = '';
    const confidence = 1.0; // Thermodynamics is certain
    
    switch (request.action) {
      case 'evaluate-spawn-conditions':
        value = this.canSpawn(request);
        precedent = value ? 'Thermodynamically allowed' : 'Thermodynamically forbidden';
        break;
        
      case 'update-state':
        // EntropyAgent updates regulator state
        if (request.params.temperature !== undefined) this.temperature = request.params.temperature;
        if (request.params.density !== undefined) this.density = request.params.density;
        if (request.params.age !== undefined) this.age = request.params.age;
        if (request.params.scale !== undefined) this.scale = request.params.scale;
        value = true;
        precedent = 'State updated';
        break;
    }
    
    return {
      value,
      authority: this.domain,
      confidence,
      precedents: precedent ? [precedent] : [],
    };
  }
  
  /**
   * Check if spawning is thermodynamically allowed
   */
  private canSpawn(request: LegalRequest): boolean {
    const agentType = request.params.agentType;
    
    // Stellar agents: Need universe cool enough
    if (agentType === 'stellar') {
      if (this.temperature > 1e4) {
        console.log(`  ❌ Too hot for stars (T=${this.temperature.toExponential(2)} K)`);
        return false;
      }
      
      if (this.age < 100e6 * YEAR) {
        console.log(`  ❌ Too early for stars (age=${(this.age/YEAR).toExponential(2)} yr)`);
        return false;
      }
      
      console.log(`  ✅ Conditions OK for stellar spawning`);
      return true;
    }
    
    // Planetary agents: Need stars to exist first
    if (agentType === 'planetary') {
      if (this.age < 1e9 * YEAR) {
        console.log(`  ❌ Too early for planets (age=${(this.age/(1e6*YEAR)).toFixed(0)} Myr)`);
        return false;
      }
      
      console.log(`  ✅ Conditions OK for planetary spawning`);
      return true;
    }
    
    // Creature agents: Need habitable planet
    if (agentType === 'creature') {
      // Biology regulator will handle detailed checks
      return true;
    }
    
    // Default: allow
    return true;
  }
  
  getLaws(): string[] {
    return [
      '2nd Law of Thermodynamics',
      'Energy conservation',
      'Cosmic timeline sequencing',
    ];
  }
}

