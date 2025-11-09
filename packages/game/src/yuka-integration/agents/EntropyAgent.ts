/**
 * ENTROPY AGENT
 * 
 * The TOP-LEVEL agent governing the entire universe.
 * Manages thermodynamics, energy flow, expansion.
 * 
 * All other agents exist WITHIN the conditions set by this agent.
 * Second Law of Thermodynamics is the ultimate arbiter.
 */

import { Goal, GoalEvaluator, Think, Vector3, Vehicle } from 'yuka';
import { LEGAL_BROKER } from '../../laws/core/LegalBroker';
import { ComplexityLevel, UniverseState } from '../../laws/core/UniversalLawCoordinator';
import { MARKER_STORE } from '../../state/UniverseMarkers';

/**
 * Universe Evolution Goal
 * 
 * Combined goal: Expand + Maximize Entropy (both happen simultaneously)
 */
export class UniverseEvolutionGoal extends Goal {
  private expansionRate: number = 1.0; // Hubble parameter

  activate(): void {
    console.log('[EntropyAgent] Goal: Evolve universe (expansion + entropy)');
  }

  execute(): void {
    const universe = this.owner as EntropyAgent;
    const YEAR = 365.25 * 86400;

    // TIME SCALE DETERMINED BY UNIVERSE STATE (not hardcoded!)
    // Fast when universe is homogeneous, slow when structure forms
    const activityLevel = universe.calculateActivityLevel();
    const timeScale = universe.calculateTimeScale(activityLevel);
    
    // Store for external use (scene needs this!)
    universe.timeScale = timeScale;

    // Advance cosmic time (EntropyAgent determines pace!)
    universe.age += universe.deltaTime * timeScale;

    // Universe expands OR contracts based on phase
    if (universe.phase === 'expansion') {
      const hubbleRate = universe.calculateExpansionRate();
      
      // Scale advances with age (exponential but capped to avoid Infinity)
      const scaledDelta = universe.deltaTime * timeScale;
      const exponent = hubbleRate * scaledDelta;
      
      // Cap exponent to prevent Math.pow overflow
      if (exponent < 100) {
        universe.scaleFactor *= Math.pow(1 + hubbleRate, scaledDelta);
      } else {
        // For huge time jumps, use linear approximation
        universe.scaleFactor *= (1 + exponent);
      }

      // Physics: Ω_m + Ω_Λ ≈ 1 (flat) → Expands forever
      // Only contracts if Ω_m > 1 (closed universe)
      // Our universe: Ω_m=0.3, Ω_Λ=0.7 → EXPANDS FOREVER
      // No Big Crunch (unless we want fantasy mode)
      
      // For now: Just keep expanding (realistic physics)
      // Could add: if (universe.omegaMatter > 1) { contraction logic }
    }

    // Temperature follows scale (T ∝ 1/a during expansion, T ∝ a during contraction)
    if (universe.phase === 'expansion' || universe.phase === 'maximum') {
      universe.temperature = universe.initialTemperature / universe.scaleFactor;
    } else {
      universe.temperature = universe.initialTemperature * (1 / universe.scaleFactor); // Heats up!
    }

    // Entropy ALWAYS increases (2nd Law of Thermodynamics)
    universe.entropy += universe.deltaTime;

    // Ongoing goal (never completes)
    this.status = Goal.STATUS.ACTIVE;
  }
}

/**
 * Universe Evolution Evaluator
 * 
 * Determines when universe should evolve (answer: always!)
 * Required by Yuka's arbitrate system even though there's only one goal
 */
export class UniverseEvolutionEvaluator extends GoalEvaluator {
  calculateDesirability(universe: any): number {
    // Universe always wants to evolve
    return 1.0;
  }

  setGoal(universe: any): void {
    if (!universe.brain) return;

    const currentSubgoal = universe.brain.currentSubgoal();

    // Only add if not already active
    if (!(currentSubgoal instanceof UniverseEvolutionGoal)) {
      universe.brain.clearSubgoals();
      universe.brain.addSubgoal(new UniverseEvolutionGoal(universe));
    }
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
  scaleFactor: number = 1.0;      // Universe scale factor (a(t)) - renamed to avoid Vehicle.scale conflict
  temperature: number = 1e32;     // Kelvin (starts very hot)
  initialTemperature: number = 1e32;
  density: number = 1e96;        // kg/m³ (starts very dense)
  entropy: number = 0;           // Total entropy (always increases)

  // Time
  age: number = 0;               // Seconds since Big Bang
  deltaTime: number = 0;
  timeScale: number = 1.0;       // Time scale multiplier (exposed for scene to use)

  // Cosmic evolution tracking
  phase: 'expansion' | 'maximum' | 'contraction' = 'expansion';
  maxScale: number = 1e30;       // For visualization bounds, NOT physics
  hasReachedMax: boolean = false;
  
  // Physics parameter (determines fate)
  omegaMatter: number = 0.3;     // Matter density parameter (Ω_m)
  omegaLambda: number = 0.7;     // Dark energy parameter (Ω_Λ)
  // Ω_m + Ω_Λ ≈ 1 → Flat universe, expands forever (no Big Crunch!)

  // Energy budget
  totalEnergy: number = 1e69;    // Joules (conserved)
  freeEnergy: number = 1e69;     // Available for work

  // State
  complexity: ComplexityLevel = ComplexityLevel.VOID;

  // Spawner reference (so EntropyAgent can trigger spawning)
  spawner?: any; // AgentSpawner

  // Spawn tracking
  private spawnedDensityField: boolean = false;
  private spawnedStellarAgents: boolean = false;
  private spawnedPlanetaryAgents: boolean = false;

  // Event tracking (for adaptive time scale)
  private lastAgentCount: number = 0;
  private recentEvents: string[] = [];
  private eventWindow: number = 10; // Track last 10 seconds

  constructor(spawner?: any) {
    super();

    this.name = 'Universe';
    this.position.set(0, 0, 0); // Origin (Big Bang location)
    this.spawner = spawner;

    // Goal-driven behavior with evaluator
    this.brain = new Think(this as any);

    // Add evaluator (required by Yuka's arbitrate system)
    this.brain.addEvaluator(new UniverseEvolutionEvaluator());

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
    if (this.brain) {
      this.brain.execute();
      this.brain.arbitrate(); // Evaluator will maintain the single goal
    }

    // Update density as universe expands (ρ ∝ 1/a³)
    this.density = this.density / Math.pow(this.scaleFactor, 3);

    // Determine current complexity (simple threshold checks)
    this.updateComplexity();

    // Check for universe-scale events (RARE)
    this.checkCosmicEvents();

    // Update EntropyRegulator state (so it can regulate spawning)
    // Only update every 100 frames to avoid spam
    if (Math.floor(this.age * 1000) % 100 === 0) {
      this.updateRegulatorState();
    }

    // Check if should trigger spawning (EntropyAgent orchestrates, Regulator validates)
    this.checkSpawnTriggers();

    super.update(delta);
  }

  /**
   * Update EntropyRegulator state
   * 
   * EntropyAgent feeds its state to the regulator.
   * Regulator REGULATES spawning decisions.
   */
  private updateRegulatorState(): void {
    // Update EntropyRegulator via Legal Broker
    LEGAL_BROKER.ask({
      domain: 'entropy',
      action: 'update-state',
      params: {
        temperature: this.temperature,
        density: this.density,
        age: this.age,
        scale: this.scaleFactor,
      },
      state: this.getState(),
    }).catch(err => {
      console.error('[EntropyAgent] Failed to update regulator:', err);
    });
  }

  /**
   * Check if should trigger spawning
   * 
   * EntropyAgent is AWARE and ORCHESTRATES
   * But validates through EntropyRegulator
   */
  private checkSpawnTriggers(): void {
    if (!this.spawner) return;

    const YEAR = 365.25 * 86400;
    const state = this.getState();

    // Debug
    const ageYears = this.age / YEAR;
    const ageMyr = ageYears / 1e6;

    // Stellar spawning (first stars form ~100-200 Myr after Big Bang)
    // Stars form in LOCAL cold clouds, not waiting for whole universe to cool
    if (ageMyr > 100 && ageMyr < 1000 && !this.spawnedStellarAgents) {
      console.log(`\n[EntropyAgent] 🌟 STELLAR EPOCH!`);
      console.log(`  Age: ${(this.age / (1e6 * YEAR)).toFixed(1)} Myr`);
      console.log(`  T_universe: ${this.temperature.toExponential(2)} K (cosmic background)`);
      console.log(`  Scale: ${this.scaleFactor.toExponential(2)}x`);
      console.log(`  Phase: ${this.phase}`);

      // Mark flag IMMEDIATELY (prevents re-trigger)
      this.spawnedStellarAgents = true;

      // Record event (slows down time to watch star formation)
      this.recordEvent('stellar-epoch');

      // Record marker in Zustand (where galaxy hearts form)
      this.recordStructureMarker('stellar-epoch', this.scaleFactor);

      // Trigger spawner callback (async but don't await - let it happen)
      console.log(`  Checking spawner callback: ${typeof this.spawner.onStellarEpoch}`);
      if (this.spawner.onStellarEpoch) {
        console.log(`  Calling spawner.onStellarEpoch...`);
        this.spawner.onStellarEpoch(state).catch((err: any) => {
          console.error('[EntropyAgent] Stellar spawn failed:', err);
        });
      } else {
        console.log(`  ⚠️ No onStellarEpoch callback registered!`);
      }
    }

    // Planetary spawning (planet formation era)
    if (this.age > 9.2e9 * YEAR && !this.spawnedPlanetaryAgents) {
      console.log(`\n[EntropyAgent] 🪐 PLANETARY EPOCH!`);

      // Mark flag IMMEDIATELY
      this.spawnedPlanetaryAgents = true;

      // Record event
      this.recordEvent('planetary-epoch');

      // Trigger spawner callback
      if (this.spawner.onPlanetaryEpoch) {
        this.spawner.onPlanetaryEpoch(state).catch((err: any) => {
          console.error('[EntropyAgent] Planetary spawn failed:', err);
        });
      }
    }
  }

  /**
   * Check for universe-scale events
   * (These are RARE - Big Bang, Accelerated Expansion, Big Crunch)
   */
  private checkCosmicEvents(): void {
    // Big Crunch detection (if universe recollapses)
    if (this.scaleFactor < 0.1) {
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
   * Calculate activity level (how much is happening)
   * 
   * ENTROPY AGENT IS AWARE:
   * - Tracks agent spawning rate
   * - Monitors events (supernovae, life, etc.)
   * - Detects phase transitions
   * 
   * Low activity = fast forward
   * High activity = slow down to watch
   */
  calculateActivityLevel(): number {
    let activity = 0.0;
    const YEAR = 365.25 * 86400;

    // ═══════════════════════════════════════════════════════════════
    // CINEMATIC ACTIVITY DETECTION
    // ═══════════════════════════════════════════════════════════════
    // Detect when AWESOME things are happening that players should see!
    // ═══════════════════════════════════════════════════════════════

    // PIVOTAL MOMENTS - Always high activity
    if (this.age < 1) {
      activity += 0.8; // BIG BANG - always dramatic!
    } else if (this.age < 380000 * YEAR) {
      activity += 0.6; // Particle/atom formation
    }

    // Check agent spawn rate (stars forming!)
    if (this.spawner && this.spawner.getTotalAgentCount) {
      const currentCount = this.spawner.getTotalAgentCount();
      const spawnRate = Math.abs(currentCount - this.lastAgentCount);
      this.lastAgentCount = currentCount;

      // ANY spawning during stellar era = HIGH ACTIVITY
      if (this.age > 100e6 * YEAR && this.age < 500e6 * YEAR) {
        if (spawnRate > 0) activity += 0.8; // SLOW DOWN - stars forming!
      } else {
        // Normal spawn rate activity
        if (spawnRate > 10) activity += 0.5;
        else if (spawnRate > 0) activity += 0.3;
      }
    }

    // Check recent events
    if (this.recentEvents.length > 5) {
      activity += 0.4; // Many events happening
    } else if (this.recentEvents.length > 0) {
      activity += 0.2; // Some events
    }

    // Check temperature change (rapid cooling = activity)
    const tempChangeRate = Math.abs(this.temperature - (this.initialTemperature / (this.scaleFactor - 1 || 1)));
    if (tempChangeRate > 1e10) {
      activity += 0.3;
    }

    return Math.min(1.0, activity); // Cap at 1.0
  }

  /**
   * Record event (for activity tracking)
   */
  recordEvent(event: string): void {
    this.recentEvents.push(event);

    // Keep only recent events
    if (this.recentEvents.length > 20) {
      this.recentEvents.shift();
    }
  }

  /**
   * Record structure marker (for Zustand state)
   * 
   * As universe EXPANDS, EntropyAgent marks where structures form
   * Later: zoom in → load markers → spawn agents at those locations
   */
  recordStructureMarker(type: string, scale: number): void {
    console.log(`[EntropyAgent] 📍 MARKER: ${type} at scale ${scale.toExponential(2)}x`);

    // Write to marker store
    const markerType = type as any; // Cast to MarkerType
    MARKER_STORE.addMarker(
      markerType,
      scale,
      new Vector3(0, 0, 0), // Galaxy heart at origin
      this.age,
      {
        temperature: this.temperature,
        density: this.density,
        complexity: this.complexity,
      }
    );
  }

  /**
   * Calculate time scale (how fast time flows)
   * 
   * EntropyAgent DETERMINES PACE based on activity
   */
  calculateTimeScale(activity: number): number {
    const YEAR = 365.25 * 86400;

    // ═══════════════════════════════════════════════════════════════
    // CINEMATIC PACING FOR PLAYER EXPERIENCE
    // ═══════════════════════════════════════════════════════════════
    // This is a SIMULATION for PLAYERS to watch, not just physics!
    // Make pivotal events SLOW and AWESOME to behold.
    // ═══════════════════════════════════════════════════════════════

    // PIVOTAL EVENTS - SLOW DOWN DRAMATICALLY
    // Big Bang → Recombination (first 380kyr)
    if (this.age < 380000 * YEAR) {
      // Player should see: Quantum foam → Particles → Atoms
      // Duration: ~30 seconds real-time for entire early universe
      return 1e4 * YEAR; // 10,000 years/second (380kyr takes ~38 seconds)
    }

    // MOLECULAR ERA - Watch clouds form
    // 380kyr → 100 Myr
    if (this.age < 100e6 * YEAR) {
      // Player should see: Atoms → Molecules → Clouds clustering
      // Duration: ~20 seconds real-time
      return 5e6 * YEAR; // 5 million years/second (100 Myr takes ~20 seconds)
    }

    // STELLAR FORMATION - DRAMATIC SLOWDOWN
    // This is THE most visually important moment!
    // Watch EACH STAR ignite, one by one
    if (this.age < 500e6 * YEAR) {
      // Player should see: Clouds collapse → Stars ignite → Light spreads
      
      // When stars actively forming (high activity) = SUPER SLOW
      if (activity > 0.5) {
        return 5e5 * YEAR; // 500k years/second (WATCH each star form!)
      }
      
      // When some activity (clouds collapsing) = SLOW
      if (activity > 0.1) {
        return 1e6 * YEAR; // 1 million years/second
      }
      
      // Otherwise still slower than later universe
      return 5e6 * YEAR; // 5 million years/second
    }

    // GALACTIC ASSEMBLY - Watch structure emerge
    // 500 Myr → 1 Gyr
    if (this.age < 1e9 * YEAR) {
      // Player should see: Stars cluster → Galaxies form → Cosmic web
      // Duration: ~30 seconds real-time
      return 20e6 * YEAR; // 20 million years/second
    }

    // MATURE UNIVERSE - Can speed up (less visually interesting)
    // But still slow enough to appreciate scale
    return 100e6 * YEAR; // 100 million years/second (13 Gyr takes ~130 seconds = 2 min)
  }

  /**
   * Calculate expansion rate (Hubble parameter)
   * 
   * EntropyAgent determines expansion based on age
   */
  calculateExpansionRate(): number {
    const YEAR = 365.25 * 86400;

    // Cosmic inflation (early universe)
    if (this.age < 1e-32) {
      return 100; // Doubles every 10^-35 seconds!
    }

    // Post-inflation expansion
    if (this.age < 1e6 * YEAR) {
      return 1.0; // Fast expansion until recombination
    }

    // Matter-dominated era
    if (this.age < 7e9 * YEAR) {
      return 0.1; // Slower
    }

    // Dark energy era (accelerated expansion)
    return 0.2; // Speeds up again
  }

  /**
   * Get current universe state (for Legal Broker queries)
   */
  getState(): UniverseState {
    return {
      t: this.age,
      localTime: this.age,
      complexity: this.complexity,
      temperature: this.temperature,
      pressure: 1e-15, // Near-vacuum
      density: this.density,
      elements: { H: 0.74, He: 0.24, O: 0.01, C: 0.005 },
      hasLife: this.complexity >= 4,
      hasCognition: this.complexity >= 6,
      hasSociety: this.complexity >= 7,
      hasTechnology: this.complexity >= 8,
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

