/**
 * ENTROPY AGENT
 * 
 * The TOP-LEVEL agent governing the entire universe.
 * Manages thermodynamics, energy flow, expansion.
 * 
 * All other agents exist WITHIN the conditions set by this agent.
 * Second Law of Thermodynamics is the ultimate arbiter.
 */

import { Vehicle, Think, Goal } from 'yuka';
import { LEGAL_BROKER } from '../../laws/core/LegalBroker';
import { UniverseState, ComplexityLevel } from '../../laws/core/UniversalLawCoordinator';

/**
 * Expand Universe Goal
 */
export class ExpandUniverseGoal extends Goal {
  private expansionRate: number = 1.0; // Hubble parameter
  
  activate(): void {
    console.log('[EntropyAgent] Goal: Expand universe (Hubble flow)');
  }
  
  execute(): void {
    const universe = this.owner as EntropyAgent;
    
    // Universe expands (Hubble's Law)
    universe.scale += this.expansionRate * universe.deltaTime;
    
    // Temperature drops as universe expands
    universe.temperature = universe.initialTemperature / Math.pow(universe.scale, 1);
    
    // Ongoing goal (never completes)
    this.status = Goal.STATUS.ACTIVE;
  }
}

/**
 * Maximize Entropy Goal
 */
export class MaximizeEntropyGoal extends Goal {
  activate(): void {
    console.log('[EntropyAgent] Goal: Maximize entropy (2nd Law of Thermodynamics)');
  }
  
  execute(): void {
    const universe = this.owner as EntropyAgent;
    
    // Entropy always increases
    universe.entropy += universe.deltaTime * 1e-10; // Slow increase
    
    // Check if conditions allow structure formation
    // (Paradox: Local entropy DECREASES when stars/life form, but TOTAL increases)
    
    // Ongoing goal
    this.status = Goal.STATUS.ACTIVE;
  }
}

/**
 * Entropy Agent - Governs Entire Universe
 * 
 * This is the "god" agent - doesn't control directly,
 * but sets the CONDITIONS under which all other agents operate.
 */
export class EntropyAgent extends Vehicle {
  // Cosmological parameters
  scale: number = 1.0;           // Universe scale factor (a(t))
  temperature: number = 1e32;     // Kelvin (starts very hot)
  initialTemperature: number = 1e32;
  density: number = 1e96;        // kg/m³ (starts very dense)
  entropy: number = 0;           // Total entropy (always increases)
  
  // Time
  age: number = 0;               // Seconds since Big Bang
  deltaTime: number = 0;
  
  // Energy budget
  totalEnergy: number = 1e69;    // Joules (conserved)
  freeEnergy: number = 1e69;     // Available for work
  
  // State
  complexity: ComplexityLevel = ComplexityLevel.VOID;
  
  constructor() {
    super();
    
    this.name = 'Universe';
    this.position.set(0, 0, 0); // Origin (Big Bang location)
    
    // Goal-driven behavior
    this.brain = new Think(this);
    
    // Primary goals (never-ending)
    this.brain.addSubgoal(new ExpandUniverseGoal(this));
    this.brain.addSubgoal(new MaximizeEntropyGoal(this));
    
    console.log('[EntropyAgent] Universe initialized');
    console.log(`  t=0 | T=${this.temperature.toExponential(2)}K | ρ=${this.density.toExponential(2)}kg/m³`);
  }
  
  /**
   * Update (called every frame)
   * 
   * LIGHTWEIGHT - just updates global parameters:
   * - Expansion rate (Hubble flow)
   * - Temperature (cooling)
   * - Density (dilution)
   * 
   * No heavy computation unless universe-scale event
   * (Big Bang, Big Crunch, Accelerated Expansion, etc.)
   */
  update(delta: number): void {
    this.deltaTime = delta;
    this.age += delta;
    
    // Execute goals (expand, maximize entropy)
    // These are SIMPLE updates (scale *= factor, temp /= scale)
    this.brain.execute();
    
    // Update density as universe expands (ρ ∝ 1/a³)
    this.density = this.density / Math.pow(this.scale, 3);
    
    // Determine current complexity (simple threshold checks)
    this.updateComplexity();
    
    // Check for universe-scale events (RARE)
    this.checkCosmicEvents();
    
    super.update(delta);
  }
  
  /**
   * Check for universe-scale events
   * (These are RARE - Big Bang, Accelerated Expansion, Big Crunch)
   */
  private checkCosmicEvents(): void {
    // Big Crunch detection (if universe recollapses)
    if (this.scale < 0.1) {
      console.log('[EntropyAgent] 🌀 BIG CRUNCH DETECTED');
      // Universe-scale decision needed
      this.handleBigCrunch();
    }
    
    // Accelerated expansion (dark energy kicks in)
    if (this.age > 7e9 * 365.25 * 86400) { // 7 billion years
      if (!this['acceleratedExpansion']) {
        console.log('[EntropyAgent] 🚀 ACCELERATED EXPANSION BEGINS');
        this.handleAcceleratedExpansion();
        this['acceleratedExpansion'] = true;
      }
    }
  }
  
  /**
   * Handle Big Crunch (universe-scale event)
   */
  private handleBigCrunch(): void {
    // This is where EntropyAgent ACTS
    // Rare, universe-scale decision
    console.log('[EntropyAgent] Reversing expansion...');
    // Notify all other agents (universe is ending)
  }
  
  /**
   * Handle accelerated expansion (dark energy)
   */
  private handleAcceleratedExpansion(): void {
    console.log('[EntropyAgent] Dark energy dominates, accelerating expansion');
    // Increase expansion rate
    (this.brain.subgoals[0] as any).expansionRate *= 1.5;
  }
  
  /**
   * Determine complexity based on temperature
   */
  private updateComplexity(): void {
    if (this.temperature > 1e13) {
      this.complexity = ComplexityLevel.PARTICLES;
    } else if (this.temperature > 1e9) {
      this.complexity = ComplexityLevel.ATOMS;
    } else if (this.temperature > 10000) {
      this.complexity = ComplexityLevel.VOID; // Too hot for molecules
    } else {
      this.complexity = ComplexityLevel.MOLECULES;
    }
  }
  
  /**
   * Get current universe state (for Legal Broker queries)
   */
  getState(): UniverseState {
    return {
      t: this.age,
      complexity: this.complexity,
      temperature: this.temperature,
      density: this.density,
    };
  }
  
  /**
   * Check if conditions allow agent spawning
   * (Other agents ask this before spawning)
   */
  async allowsSpawn(agentType: string, position: any): Promise<boolean> {
    const state = this.getState();
    
    // Ask Legal Broker if conditions allow this spawn type
    const response = await LEGAL_BROKER.ask({
      domain: 'physics',
      action: 'evaluate-spawn-conditions',
      params: {
        agentType,
        position,
        temperature: this.temperature,
        density: this.density,
      },
      state,
    });
    
    return response.value === true;
  }
  
  /**
   * Allocate energy for a process
   * (Other agents ask for energy budget)
   */
  allocateEnergy(amount: number): boolean {
    if (this.freeEnergy >= amount) {
      this.freeEnergy -= amount;
      return true;
    }
    return false; // Not enough free energy
  }
}

/**
 * USAGE:
 * 
 * const universe = new EntropyAgent();
 * entityManager.add(universe);
 * 
 * // Every frame:
 * entityManager.update(delta);
 * 
 * // Universe agent:
 * - Expands (Hubble flow)
 * - Cools (T ∝ 1/a)
 * - Maximizes entropy
 * 
 * // Other agents ask permission:
 * const canSpawn = await universe.allowsSpawn('stellar', position);
 * if (canSpawn) {
 *   // Conditions allow star formation
 *   spawnStellarAgent();
 * }
 * 
 * // Energy allocation:
 * const hasEnergy = universe.allocateEnergy(fusionEnergy);
 * if (hasEnergy) {
 *   // Can perform fusion
 * }
 * 
 * EVERYTHING is governed by EntropyAgent.
 * Nothing spawns without checking conditions.
 * All subject to thermodynamics.
 */

