/**
 * UNIVERSAL LAW COORDINATOR
 *
 * The meta-system that governs WHEN and HOW laws apply.
 *
 * In our universe:
 * - Thermodynamics governs all spontaneous processes
 * - Quantum mechanics limits what's possible at small scales
 * - Relativity limits what's possible at high speeds
 * - Complexity determines when new laws "activate"
 *
 * This is that system for our simulated universe.
 */

import { LAWS } from '../index';

/**
 * Complexity levels (what exists at each threshold)
 */
export enum ComplexityLevel {
  VOID = 0, // Nothing (t < Big Bang)
  ENERGY = 1, // Pure energy (t < 10^-43s)
  PARTICLES = 2, // Quarks, leptons (t < 10^-6s)
  ATOMS = 3, // Hydrogen, helium (t < 380,000y)
  MOLECULES = 4, // H2O, CO2, organic (t > 100My)
  LIFE = 5, // Self-replicating systems
  MULTICELLULAR = 6, // Complex organisms
  COGNITIVE = 7, // Nervous systems, learning
  SOCIAL = 8, // Groups, cooperation
  TECHNOLOGICAL = 9, // Tools, fire, agriculture
  CIVILIZATION = 10, // Cities, writing, complex society
}

/**
 * State of the universe at a point in spacetime
 */
export interface UniverseState {
  // Time
  t: number; // Seconds since Big Bang
  localTime: number; // Local time (planet age, etc.)

  // Physical state
  temperature: number; // Kelvin
  pressure: number; // Pascals
  density: number; // kg/m³

  // Complexity
  complexity: ComplexityLevel;

  // Available elements
  elements: Record<string, number>; // Element → abundance

  // Emergent properties
  hasLife: boolean;
  hasCognition: boolean;
  hasSociety: boolean;
  hasTechnology: boolean;
}

/**
 * Law precedence (which laws override others)
 */
export enum LawPrecedence {
  FUNDAMENTAL = 0, // Laws of physics (ALWAYS apply)
  EMERGENT = 1, // Emergent laws (apply when complexity reached)
  STATISTICAL = 2, // Statistical laws (apply to populations)
  SOCIAL = 3, // Social laws (apply to groups)
}

/**
 * The Universal Law Coordinator
 *
 * Decides which laws apply when, resolves conflicts, tracks emergence.
 */
export class UniversalLawCoordinator {
  /**
   * Determine what complexity level exists at given state
   */
  static determineComplexity(state: UniverseState): ComplexityLevel {
    // Cosmic timeline determines base complexity (early universe)
    if (state.t < 1e-43) return ComplexityLevel.VOID;
    if (state.t < 1e-6) return ComplexityLevel.ENERGY;
    if (state.t < 380000 * 365.25 * 86400) return ComplexityLevel.PARTICLES;
    
    // Element abundance determines if atoms/molecules exist
    const totalElements = Object.values(state.elements).reduce((sum, n) => sum + n, 0);
    if (totalElements < 0.01) return ComplexityLevel.PARTICLES;
    
    // EMERGENT COMPLEXITY (highest level reached)
    // Check in REVERSE order (most complex first)
    if (state.hasTechnology) return ComplexityLevel.CIVILIZATION;
    if (state.hasSociety) return ComplexityLevel.SOCIAL;
    if (state.hasCognition) return ComplexityLevel.COGNITIVE;
    if (state.hasLife) return ComplexityLevel.LIFE;
    
    // No life yet - check if molecules possible
    // Temperature/pressure determine if molecules stable
    if (state.temperature > 10000) return ComplexityLevel.ATOMS; // Too hot for molecules
    if (state.temperature < 10) return ComplexityLevel.ATOMS; // Too cold for chemistry
    
    return ComplexityLevel.MOLECULES; // Default for planetary systems
  }

  /**
   * Check if a law CAN apply at this state
   *
   * This is the GATEKEEPER - prevents applying laws before prerequisites met
   */
  static canApplyLaw(lawName: string, state: UniverseState): boolean {
    const complexity = this.determineComplexity(state);

    // FUNDAMENTAL PHYSICS - Always apply (if state allows)
    if (lawName.startsWith('physics.')) {
      // But some physics only relevant at certain scales
      if (lawName.includes('quantum') && state.density < 1e10) return false;
      if (lawName.includes('relativistic') && state.temperature < 1e9) return false;
      return true;
    }

    // STELLAR - Only after atoms exist
    if (lawName.startsWith('stellar.')) {
      return complexity >= ComplexityLevel.ATOMS;
    }

    // CHEMISTRY - Needs molecules
    if (lawName.startsWith('chemistry.') || lawName.startsWith('biochemistry.')) {
      return complexity >= ComplexityLevel.MOLECULES;
    }

    // BIOLOGY - Needs life
    if (lawName.startsWith('biology.') || lawName.startsWith('ecology.')) {
      return complexity >= ComplexityLevel.LIFE;
    }

    // COGNITION - Needs multicellular + nervous systems
    if (lawName.startsWith('cognitive.')) {
      return complexity >= ComplexityLevel.COGNITIVE;
    }

    // SOCIAL - Needs society
    if (lawName.startsWith('social.') || lawName.startsWith('economics.')) {
      return complexity >= ComplexityLevel.SOCIAL;
    }

    // TECHNOLOGY - Needs tool use
    if (lawName.startsWith('technology.') || lawName.startsWith('agriculture.')) {
      return complexity >= ComplexityLevel.TECHNOLOGICAL;
    }

    // Unknown law - default to allowing
    return true;
  }

  /**
   * Resolve conflict between two laws
   *
   * When laws give different answers, which takes precedence?
   */
  static resolveLawConflict(
    law1: string,
    value1: number,
    law2: string,
    value2: number,
    state: UniverseState
  ): number {
    const precedence1 = this.getLawPrecedence(law1);
    const precedence2 = this.getLawPrecedence(law2);

    // Lower precedence number = higher priority
    if (precedence1 < precedence2) return value1;
    if (precedence2 < precedence1) return value2;

    // Same precedence - use more restrictive (lower) value
    // (Thermodynamics: most restrictive constraint wins)
    return Math.min(value1, value2);
  }

  /**
   * Get law precedence
   */
  private static getLawPrecedence(lawName: string): LawPrecedence {
    if (lawName.startsWith('physics.')) return LawPrecedence.FUNDAMENTAL;
    if (lawName.startsWith('stellar.')) return LawPrecedence.FUNDAMENTAL;
    if (lawName.startsWith('chemistry.')) return LawPrecedence.FUNDAMENTAL;

    if (lawName.startsWith('biology.')) return LawPrecedence.EMERGENT;
    if (lawName.startsWith('ecology.')) return LawPrecedence.STATISTICAL;

    if (lawName.startsWith('cognitive.')) return LawPrecedence.EMERGENT;
    if (lawName.startsWith('social.')) return LawPrecedence.SOCIAL;

    return LawPrecedence.EMERGENT; // Default
  }

  /**
   * Check if thermodynamics allows a process
   *
   * The ULTIMATE arbiter - thermodynamics governs ALL spontaneous processes
   */
  static thermodynamicsAllows(
    deltaEntropy: number,
    deltaEnergy: number,
    temperature: number
  ): boolean {
    // Second Law: ΔS_universe ≥ 0
    // For spontaneous process: ΔG = ΔH - TΔS ≤ 0 (note: ≤ not <)
    
    const deltaG = deltaEnergy - temperature * deltaEntropy;
    
    // Negative or zero ΔG = allowed (spontaneous or equilibrium)
    // Positive ΔG = requires energy input (not spontaneous)
    return deltaG <= 0; // Changed from < to <=
  }

  /**
   * Determine what EMERGES at given complexity
   *
   * New properties that weren't present at lower levels
   */
  static determineEmergentProperties(state: UniverseState): string[] {
    const emergent: string[] = [];
    const complexity = this.determineComplexity(state);

    switch (complexity) {
      case ComplexityLevel.ATOMS:
        emergent.push('atomic-structure', 'electron-shells', 'chemical-bonding');
        break;

      case ComplexityLevel.MOLECULES:
        emergent.push('molecular-geometry', 'polarity', 'hydrogen-bonding');
        break;

      case ComplexityLevel.LIFE:
        emergent.push('metabolism', 'reproduction', 'evolution');
        break;

      case ComplexityLevel.MULTICELLULAR:
        emergent.push('cell-differentiation', 'tissues', 'organs');
        break;

      case ComplexityLevel.COGNITIVE:
        emergent.push('learning', 'memory', 'prediction', 'decision-making');
        break;

      case ComplexityLevel.SOCIAL:
        emergent.push('cooperation', 'communication', 'norms', 'hierarchy');
        break;

      case ComplexityLevel.TECHNOLOGICAL:
        emergent.push('tool-use', 'cumulative-culture', 'innovation');
        break;

      case ComplexityLevel.CIVILIZATION:
        emergent.push('writing', 'science', 'institutions', 'markets');
        break;
    }

    return emergent;
  }

  /**
   * Apply laws in correct order with precedence
   *
   * This is the MASTER FUNCTION that orchestrates everything
   */
  static applyLaws(state: UniverseState, action: string, params: any): any {
    const results: Array<{ law: string; value: any; precedence: LawPrecedence }> = [];

    // 1. Check thermodynamics FIRST (ultimate arbiter)
    if (action.includes('chemical-reaction') || action.includes('biological-process')) {
      const allowed = this.thermodynamicsAllows(
        params.deltaEntropy || 0,
        params.deltaEnergy || 0,
        state.temperature
      );

      if (!allowed) {
        console.log(`[Laws] Thermodynamics FORBIDS: ${action}`);
        return null; // Process cannot occur
      }
    }

    // 2. Determine which laws are RELEVANT
    const relevantLaws = this.getRelevantLaws(action, state);

    // 3. Apply each law that CAN apply
    for (const lawName of relevantLaws) {
      if (this.canApplyLaw(lawName, state)) {
        const value = this.invokeLaw(lawName, params);
        const precedence = this.getLawPrecedence(lawName);

        results.push({ law: lawName, value, precedence });
      }
    }

    // 4. Resolve conflicts if multiple laws gave answers
    if (results.length === 0) {
      console.warn(`[Laws] No applicable laws for: ${action}`);
      return null;
    }

    if (results.length === 1) {
      return results[0].value;
    }

    // Multiple laws - resolve by precedence
    results.sort((a, b) => a.precedence - b.precedence);
    const winner = results[0];

    console.log(`[Laws] ${action}: ${winner.law} wins (precedence ${winner.precedence})`);
    return winner.value;
  }

  /**
   * Get relevant laws for an action
   */
  private static getRelevantLaws(action: string, state: UniverseState): string[] {
    const laws: string[] = [];

    // Map actions to law domains
    if (action.includes('metabolism')) {
      laws.push('biology.allometry.basalMetabolicRate');
    }

    if (action.includes('population-growth')) {
      laws.push('ecology.carryingCapacity.logisticGrowth');
    }

    if (action.includes('social-group')) {
      laws.push('social.dunbar.groupSize');
    }

    // Add more mappings as needed

    return laws;
  }

  /**
   * Invoke a specific law
   */
  private static invokeLaw(lawName: string, params: any): any {
    // Parse law name like "biology.allometry.basalMetabolicRate"
    const parts = lawName.split('.');

    // Navigate through LAWS object
    let current: any = LAWS;
    for (const part of parts) {
      if (current[part] === undefined) {
        console.warn(`[Laws] Law not found: ${lawName}`);
        return null;
      }
      current = current[part];
    }

    // Invoke if function
    if (typeof current === 'function') {
      return current(...Object.values(params));
    }

    return current;
  }

  /**
   * Check emergence thresholds
   *
   * Has complexity increased enough to unlock new laws?
   */
  static checkEmergenceThresholds(state: UniverseState): {
    emerged: string[];
    unlocked: string[];
  } {
    const emerged = this.determineEmergentProperties(state);
    const unlocked: string[] = [];

    // When life emerges, unlock biology laws
    if (state.hasLife && !state.hasCognition) {
      unlocked.push('biology', 'ecology', 'evolution');
    }

    // When cognition emerges, unlock cognitive laws
    if (state.hasCognition && !state.hasSociety) {
      unlocked.push('cognitive', 'learning', 'memory');
    }

    // When society emerges, unlock social laws
    if (state.hasSociety && !state.hasTechnology) {
      unlocked.push('social', 'economics', 'game-theory');
    }

    // When technology emerges, unlock technological laws
    if (state.hasTechnology) {
      unlocked.push('agriculture', 'metallurgy', 'combustion');
    }

    return { emerged, unlocked };
  }
}

/**
 * USAGE EXAMPLE:
 *
 * const state: UniverseState = {
 *   t: 13.8e9 * 365.25 * 86400,
 *   temperature: 288,
 *   pressure: 101325,
 *   density: 1.2,
 *   complexity: ComplexityLevel.LIFE,
 *   elements: { H: 0.75, He: 0.24, O: 0.01 },
 *   hasLife: true,
 *   hasCognition: false,
 *   hasSociety: false,
 *   hasTechnology: false,
 * };
 *
 * // Check if we can apply biology laws
 * const canUseBiology = UniversalLawCoordinator.canApplyLaw('biology.allometry', state);
 *
 * // Apply laws with automatic precedence
 * const metabolism = UniversalLawCoordinator.applyLaws(
 *   state,
 *   'calculate-metabolism',
 *   { mass: 50 }
 * );
 *
 * // Check what emerged
 * const { emerged, unlocked } = UniversalLawCoordinator.checkEmergenceThresholds(state);
 */
