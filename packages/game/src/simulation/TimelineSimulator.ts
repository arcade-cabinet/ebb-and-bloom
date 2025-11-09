/**
 * Universal Timeline Simulator
 * 
 * Simulates from Big Bang to present (or future).
 * No "generations" - just continuous time + emergent complexity.
 */

import { EnhancedRNG } from '../utils/EnhancedRNG';
import { CosmologyLaws } from '../laws/00-universal/cosmology';

interface UniverseState {
  // Absolute time
  t_universal: number; // Seconds since Big Bang
  
  // Local clocks (start at creation time)
  t_stellar?: number; // Age of star system
  t_planetary?: number; // Age of planet
  t_biosphere?: number; // Time since life began
  t_social?: number; // Time since first society
  
  // Current state
  star?: any;
  planets?: any[];
  biosphere?: any;
  society?: any;
  technology?: any;
  
  // Complexity metric (determines time-step size)
  complexity: number; // 0-1
}

/**
 * Timeline-Based Simulator
 * 
 * REPLACES the Gen0-6 system with continuous time
 */
export class TimelineSimulator {
  private state: UniverseState;
  private rng: EnhancedRNG;
  private seed: string;
  
  constructor(seed: string, startTime: number = 13.8e9 * 365.25 * 86400) {
    this.seed = seed;
    this.rng = new EnhancedRNG(seed);
    
    // Start at current age of universe (or earlier for full simulation)
    this.state = {
      t_universal: startTime,
      complexity: 0,
    };
  }
  
  /**
   * Advance time by deltaTime
   * Laws determine what exists
   */
  step(deltaTime_seconds: number): UniverseState {
    this.state.t_universal += deltaTime_seconds;
    
    // Update local clocks
    if (this.state.t_stellar !== undefined) {
      this.state.t_stellar += deltaTime_seconds;
    }
    if (this.state.t_planetary !== undefined) {
      this.state.t_planetary += deltaTime_seconds;
    }
    if (this.state.t_biosphere !== undefined) {
      this.state.t_biosphere += deltaTime_seconds;
    }
    if (this.state.t_social !== undefined) {
      this.state.t_social += deltaTime_seconds;
    }
    
    // Determine what SHOULD exist at this time
    this.updateState();
    
    // Update complexity metric
    this.calculateComplexity();
    
    return this.state;
  }
  
  /**
   * Fast-forward to target time
   */
  advanceTo(targetTime_seconds: number): UniverseState {
    while (this.state.t_universal < targetTime_seconds) {
      const dt = this.calculateOptimalTimeStep();
      this.step(dt);
    }
    return this.state;
  }
  
  /**
   * Rewind to earlier time (for exploration)
   * NOTE: This doesn't change seed, so same state at same time
   */
  rewindTo(targetTime_seconds: number): UniverseState {
    if (targetTime_seconds >= this.state.t_universal) {
      throw new Error('Use advanceTo for forward time');
    }
    
    // Recreate simulator at target time
    const newSim = new TimelineSimulator(this.seed, targetTime_seconds);
    this.state = newSim.state;
    this.updateState();
    
    return this.state;
  }
  
  /**
   * Determine what exists at current time
   */
  private updateState() {
    const t = this.state.t_universal;
    
    // Has stellar system formed yet?
    if (!this.state.star && t > CosmologyLaws.timeline.milestones.firstStars) {
      // Check if OUR star has formed (stochastic)
      const starFormationProb = CosmologyLaws.structure.starFormationRate(t / (365.25 * 86400));
      
      if (this.rng.uniform() < starFormationProb * 0.01) {
        // STAR FORMS NOW
        this.state.t_stellar = 0;
        this.state.star = this.generateStar();
      }
    }
    
    // Update existing systems
    if (this.state.star) {
      this.updateStellarSystem();
    }
    
    if (this.state.planets) {
      this.updatePlanets();
    }
    
    if (this.state.biosphere) {
      this.updateBiosphere();
    }
    
    if (this.state.society) {
      this.updateSociety();
    }
  }
  
  /**
   * Calculate complexity (determines time-step size)
   */
  private calculateComplexity() {
    let complexity = 0;
    
    // Stellar system adds complexity
    if (this.state.star) complexity += 0.1;
    
    // Planets add more
    if (this.state.planets) complexity += 0.2;
    
    // Life is complex
    if (this.state.biosphere) complexity += 0.3;
    
    // Society very complex
    if (this.state.society) complexity += 0.3;
    
    // Active events add complexity (need small timesteps)
    // TODO: Check for wars, disasters, etc.
    
    this.state.complexity = Math.min(1.0, complexity);
  }
  
  /**
   * Intelligent time-stepping
   * Fast when simple, slow when complex
   */
  private calculateOptimalTimeStep(): number {
    const YEAR = 365.25 * 86400;
    
    // Early universe: billion-year steps
    if (this.state.complexity < 0.1) {
      return 1e9 * YEAR;
    }
    
    // Star/planet formation: million-year steps
    if (this.state.complexity < 0.3) {
      return 1e6 * YEAR;
    }
    
    // Biological evolution: thousand-year steps
    if (this.state.complexity < 0.6) {
      return 1e3 * YEAR;
    }
    
    // Civilization: year steps
    if (this.state.complexity < 0.9) {
      return 1 * YEAR;
    }
    
    // Active events: day steps
    return 86400; // 1 day
  }
  
  /**
   * Placeholder update methods (to be implemented)
   */
  private generateStar() {
    // Use existing SimpleUniverseGenerator
    return { mass: this.rng.powerLaw(2.35, 0.08, 100) };
  }
  
  private updateStellarSystem() {
    // Star ages, luminosity changes
  }
  
  private updatePlanets() {
    // Geology, climate, etc.
  }
  
  private updateBiosphere() {
    // Evolution, speciation, extinction
  }
  
  private updateSociety() {
    // Population, technology, culture
  }
  
  /**
   * Get human-readable time description
   */
  getTimeDescription(): string {
    const t_years = this.state.t_universal / (365.25 * 86400);
    const age_Gyr = t_years / 1e9;
    
    if (age_Gyr < 0.001) return `${(t_years / 1e6).toFixed(1)} million years after Big Bang`;
    if (age_Gyr < 1) return `${(t_years / 1e6).toFixed(0)} Myr after Big Bang`;
    if (age_Gyr < 10) return `${age_Gyr.toFixed(2)} Gyr after Big Bang`;
    return `${age_Gyr.toFixed(1)} billion years after Big Bang`;
  }
}

