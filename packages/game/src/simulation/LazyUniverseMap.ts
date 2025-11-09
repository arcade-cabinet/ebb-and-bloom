/**
 * LAZY UNIVERSE MAP
 * 
 * The SMART way (Daggerfall approach):
 * 1. Show universe IMMEDIATELY (empty grid)
 * 2. Generate ONLY visible regions
 * 3. Start with LOW detail (fast analytical)
 * 4. Full synthesis ONLY when zooming in
 * 
 * NOT:
 * - ❌ Pre-generate everything
 * - ❌ Wait 3 minutes before showing anything
 * - ❌ Sample 10,000 stars per region
 * 
 * YES:
 * - ✅ Show immediately
 * - ✅ Generate on-demand
 * - ✅ Use analytical solutions (fast!)
 * - ✅ Full detail only when needed
 */

import { EnhancedRNG } from '../utils/EnhancedRNG';
import { ComplexityLevel } from '../laws/core/UniversalLawCoordinator';

/**
 * Quick analytical estimate of region activity
 * (10-100ms instead of 1-2 seconds)
 */
export interface QuickEstimate {
  hasHeavyElements: boolean; // Did supernovae occur?
  hasPlanets: boolean; // Did planets form?
  hasLife: boolean; // Did life emerge?
  complexity: ComplexityLevel; // How far did it get?
  activity: number; // Brightness (0-10)
}

/**
 * Region of universe (generated on-demand)
 */
export interface LazyRegion {
  x: number;
  y: number;
  z: number;
  seed: string;
  
  // Quick estimate (ALWAYS available)
  estimate: QuickEstimate;
  
  // Full synthesis (ONLY if user zooms in)
  fullState?: any; // SynthesisState from GenesisSynthesisEngine
}

/**
 * Lazy Universe Map
 * 
 * Daggerfall-style: Generate on-demand, show immediately
 */
export class LazyUniverseMap {
  private regions: Map<string, LazyRegion>;
  private gridSize: number;
  private gridSpacing: number;
  
  constructor(gridSize: number = 10, gridSpacing: number = 100) {
    this.gridSize = gridSize;
    this.gridSpacing = gridSpacing;
    this.regions = new Map();
    
    // Initialize grid structure (instant - just coordinates)
    this.initializeGrid();
  }
  
  /**
   * Initialize grid (INSTANT - no synthesis yet!)
   */
  private initializeGrid(): void {
    const halfGrid = Math.floor(this.gridSize / 2);
    
    for (let x = -halfGrid; x < halfGrid; x++) {
      for (let y = -halfGrid; y < halfGrid; y++) {
        for (let z = -halfGrid; z < halfGrid; z++) {
          const xMpc = x * this.gridSpacing;
          const yMpc = y * this.gridSpacing;
          const zMpc = z * this.gridSpacing;
          
          const seed = `univ-${x}-${y}-${z}`;
          const key = `${x},${y},${z}`;
          
          // Region exists but NOT yet synthesized
          this.regions.set(key, {
            x: xMpc,
            y: yMpc,
            z: zMpc,
            seed,
            estimate: {
              hasHeavyElements: false,
              hasPlanets: false,
              hasLife: false,
              complexity: ComplexityLevel.VOID,
              activity: 0,
            },
          });
        }
      }
    }
    
    console.log(`[LazyUniverseMap] Initialized ${this.regions.size} regions (instant)`);
  }
  
  /**
   * Quick analytical estimate for a region
   * Uses MATH not simulation (10-100ms instead of 1-2 sec)
   */
  quickEstimate(region: LazyRegion): QuickEstimate {
    const rng = new EnhancedRNG(region.seed);
    
    // Step 1: Are there massive stars? (analytical, not Monte Carlo)
    const expectedMassiveStars = 100000 * 0.002; // 200 expected
    const massiveStars = rng.poisson(expectedMassiveStars);
    const hasHeavyElements = massiveStars > 0;
    
    if (!hasHeavyElements) {
      // Primordial universe (H/He only)
      return {
        hasHeavyElements: false,
        hasPlanets: false,
        hasLife: false,
        complexity: ComplexityLevel.ATOMS,
        activity: 1, // Dim (just hydrogen)
      };
    }
    
    // Step 2: Do planets form?
    const planetCount = rng.poisson(1.5);
    const hasPlanets = planetCount > 0;
    
    if (!hasPlanets) {
      // Heavy elements but no planets
      return {
        hasHeavyElements: true,
        hasPlanets: false,
        hasLife: false,
        complexity: ComplexityLevel.MOLECULES,
        activity: 3, // Medium (star system, no planets)
      };
    }
    
    // Step 3: Does life emerge? (probabilistic)
    // Depends on: water, organics, habitable zone
    const lifeChance = 0.8; // 80% if planets exist (we know heavy elements exist)
    const hasLife = rng.uniform() < lifeChance;
    
    if (!hasLife) {
      // Planets but no life
      return {
        hasHeavyElements: true,
        hasPlanets: true,
        hasLife: false,
        complexity: ComplexityLevel.MOLECULES,
        activity: 4, // Rocky planets
      };
    }
    
    // Step 4: How far does evolution go?
    // Analytical estimate (not full simulation)
    const evolutionRoll = rng.uniform();
    
    let complexity: ComplexityLevel;
    let activity: number;
    
    if (evolutionRoll < 0.1) {
      // Only bacteria
      complexity = ComplexityLevel.LIFE;
      activity = 5;
    } else if (evolutionRoll < 0.3) {
      // Multicellular
      complexity = ComplexityLevel.MULTICELLULAR;
      activity = 6;
    } else if (evolutionRoll < 0.6) {
      // Cognitive
      complexity = ComplexityLevel.COGNITIVE;
      activity = 7;
    } else if (evolutionRoll < 0.9) {
      // Social
      complexity = ComplexityLevel.SOCIAL;
      activity = 8;
    } else {
      // Technological
      complexity = ComplexityLevel.TECHNOLOGICAL;
      activity = 10;
    }
    
    return {
      hasHeavyElements: true,
      hasPlanets: true,
      hasLife: true,
      complexity,
      activity,
    };
  }
  
  /**
   * Estimate ALL regions (FAST - 10-20ms per region)
   * ASYNC to prevent call stack explosion
   */
  async estimateAll(onProgress?: (completed: number, total: number) => void): Promise<void> {
    console.log(`[LazyUniverseMap] Estimating ${this.regions.size} regions (fast analytical)...`);
    
    const startTime = Date.now();
    let completed = 0;
    
    for (const region of this.regions.values()) {
      region.estimate = this.quickEstimate(region);
      completed++;
      
      if (onProgress) {
        onProgress(completed, this.regions.size);
      }
      
      // Yield to browser every 50 regions to prevent call stack explosion
      if (completed % 50 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    const elapsed = Date.now() - startTime;
    console.log(`[LazyUniverseMap] Complete! (${elapsed}ms)`);
    console.log(`  Active: ${this.getActiveRegions().length}`);
    console.log(`  Life-bearing: ${this.getLifeBearingRegions().length}`);
    console.log(`  Civilizations: ${this.getCivilizedRegions().length}`);
  }
  
  /**
   * Get region (returns estimate immediately, generates full state on-demand)
   */
  getRegion(x: number, y: number, z: number): LazyRegion | undefined {
    const key = `${Math.floor(x / this.gridSpacing)},${Math.floor(y / this.gridSpacing)},${Math.floor(z / this.gridSpacing)}`;
    return this.regions.get(key);
  }
  
  /**
   * Get all regions (for rendering - uses estimates)
   */
  getAllRegions(): LazyRegion[] {
    return Array.from(this.regions.values());
  }
  
  /**
   * Get active regions (activity > 0)
   */
  getActiveRegions(): LazyRegion[] {
    return Array.from(this.regions.values()).filter(r => r.estimate.activity > 0);
  }
  
  /**
   * Get life-bearing regions
   */
  getLifeBearingRegions(): LazyRegion[] {
    return Array.from(this.regions.values()).filter(r => r.estimate.hasLife);
  }
  
  /**
   * Get civilized regions (complexity >= TECHNOLOGICAL)
   */
  getCivilizedRegions(): LazyRegion[] {
    return Array.from(this.regions.values()).filter(r => 
      r.estimate.complexity >= ComplexityLevel.TECHNOLOGICAL
    );
  }
  
  /**
   * Get brightest regions
   */
  getBrightestRegions(n: number = 10): LazyRegion[] {
    return Array.from(this.regions.values())
      .sort((a, b) => b.estimate.activity - a.estimate.activity)
      .slice(0, n);
  }
}

/**
 * USAGE (THE DAGGERFALL WAY):
 * 
 * const map = new LazyUniverseMap(10, 100);
 * 
 * // INSTANT (no waiting!)
 * map.estimateAll((done, total) => {
 *   progressBar.style.width = `${(done/total)*100}%`;
 * });
 * // Takes 2-3 SECONDS not 2-3 MINUTES
 * 
 * // Render immediately
 * const regions = map.getAllRegions();
 * for (const region of regions) {
 *   renderPoint(region.x, region.y, region.z, region.estimate.activity);
 * }
 * 
 * // Full synthesis ONLY when user clicks a region:
 * onClick(region) {
 *   if (!region.fullState) {
 *     const engine = new GenesisSynthesisEngine(region.seed);
 *     region.fullState = await engine.synthesizeUniverse();
 *   }
 *   showDetails(region.fullState);
 * }
 */

