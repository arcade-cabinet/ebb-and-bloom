/**
 * UNIVERSE ACTIVITY MAP
 * 
 * The default view: Entire cosmos with light tracers showing activity.
 * 
 * Concept:
 * - Sample many regions of universe (grid of seeds)
 * - Run GenesisSynthesisEngine for each
 * - Render as points of light (brightness = activity level)
 * - Fast-forward time, watch civilizations rise and fall
 * 
 * Zoom hierarchy:
 * Level 0: Universe (100 Mpc³) - Galaxy clusters
 * Level 1: Galaxy (100 kpc) - Stellar systems
 * Level 2: Star system (100 AU) - Planets
 * Level 3: Planet surface (100 km) - Game mode
 */

import { GenesisSynthesisEngine, SynthesisState } from '../synthesis/GenesisSynthesisEngine';
import { EnhancedRNG } from '../utils/EnhancedRNG';

/**
 * A region of spacetime with synthesized state
 */
export interface UniverseRegion {
  // Position in cosmic grid
  x: number; // Mpc
  y: number; // Mpc
  z: number; // Mpc
  
  // Seed for this region (coordinates → deterministic seed)
  seed: string;
  
  // Synthesis state at current time
  state: SynthesisState;
  
  // Activity level (0-10, determines brightness)
  activity: number;
  
  // Kardashev level (if civilized)
  kardashev?: number; // 0, 1, 2, 3
}

/**
 * Universe Activity Map
 * 
 * Samples cosmic grid and tracks activity
 */
export class UniverseActivityMap {
  private regions: Map<string, UniverseRegion>;
  private currentTime: number; // Seconds since Big Bang
  private gridSize: number; // Regions per dimension
  private gridSpacing: number; // Mpc between samples
  
  constructor(gridSize: number = 10, gridSpacing: number = 100) {
    this.regions = new Map();
    this.currentTime = 0;
    this.gridSize = gridSize;
    this.gridSpacing = gridSpacing;
    
    this.initializeGrid();
  }
  
  /**
   * Initialize cosmic grid
   * Sample universe at regular intervals
   */
  private initializeGrid(): void {
    console.log(`[UniverseActivityMap] Initializing ${this.gridSize}³ grid...`);
    console.log(`  Grid spacing: ${this.gridSpacing} Mpc`);
    console.log(`  Total volume: ${Math.pow(this.gridSize * this.gridSpacing, 3).toExponential(2)} Mpc³`);
    
    const halfGrid = Math.floor(this.gridSize / 2);
    
    for (let x = -halfGrid; x < halfGrid; x++) {
      for (let y = -halfGrid; y < halfGrid; y++) {
        for (let z = -halfGrid; z < halfGrid; z++) {
          const xMpc = x * this.gridSpacing;
          const yMpc = y * this.gridSpacing;
          const zMpc = z * this.gridSpacing;
          
          // Deterministic seed from coordinates
          const seed = `univ-${x}-${y}-${z}`;
          const key = this.regionKey(xMpc, yMpc, zMpc);
          
          this.regions.set(key, {
            x: xMpc,
            y: yMpc,
            z: zMpc,
            seed,
            state: null as any, // Will synthesize on demand
            activity: 0,
          });
        }
      }
    }
    
    console.log(`  Total regions: ${this.regions.size}`);
  }
  
  /**
   * Region key from coordinates
   */
  private regionKey(x: number, y: number, z: number): string {
    return `${Math.floor(x / this.gridSpacing)},${Math.floor(y / this.gridSpacing)},${Math.floor(z / this.gridSpacing)}`;
  }
  
  /**
   * Synthesize a single region
   */
  async synthesizeRegion(region: UniverseRegion): Promise<void> {
    const engine = new GenesisSynthesisEngine(region.seed);
    region.state = await engine.synthesizeUniverse();
    region.activity = engine.getActivityLevel();
    
    // Determine Kardashev level
    if (region.state.complexity >= 9) { // ComplexityLevel.TECHNOLOGICAL
      if (region.state.tools.length >= 10) {
        region.kardashev = 2; // Type II (many advanced technologies)
      } else if (region.state.tools.length >= 5) {
        region.kardashev = 1; // Type I (some technologies)
      } else {
        region.kardashev = 0; // Type 0 (primitive)
      }
    }
  }
  
  /**
   * Synthesize all regions (SLOW - run once at start)
   * 
   * Yields to browser regularly to:
   * - Update progress bar
   * - Prevent "page unresponsive" warnings
   * - Allow animation to run
   */
  async synthesizeAll(onProgress?: (completed: number, total: number) => void): Promise<void> {
    console.log(`[UniverseActivityMap] Synthesizing ${this.regions.size} regions...`);
    console.log(`  This may take a while...`);
    
    let completed = 0;
    const total = this.regions.size;
    const startTime = Date.now();
    
    for (const region of this.regions.values()) {
      await this.synthesizeRegion(region);
      completed++;
      
      // Update progress callback (for UI)
      if (onProgress) {
        onProgress(completed, total);
      }
      
      // Log progress every 10 regions
      if (completed % 10 === 0) {
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = completed / elapsed;
        const remaining = (total - completed) / rate;
        console.log(`  Progress: ${completed}/${total} (${(completed/total*100).toFixed(1)}%) - ETA: ${remaining.toFixed(0)}s`);
      }
      
      // Yield to browser every 5 regions to keep UI responsive
      if (completed % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    const elapsed = (Date.now() - startTime) / 1000;
    console.log(`[UniverseActivityMap] Complete! (${elapsed.toFixed(1)}s)`);
    console.log(`  Active regions: ${this.getActiveRegions().length}`);
    console.log(`  Civilizations: ${this.getCivilizedRegions().length}`);
  }
  
  /**
   * Get all active regions (activity > 0)
   */
  getActiveRegions(): UniverseRegion[] {
    return Array.from(this.regions.values()).filter(r => r.activity > 0);
  }
  
  /**
   * Get civilized regions (Kardashev level > 0)
   */
  getCivilizedRegions(): UniverseRegion[] {
    return Array.from(this.regions.values()).filter(r => r.kardashev !== undefined);
  }
  
  /**
   * Get brightest regions (top N by activity)
   */
  getBrightestRegions(n: number = 10): UniverseRegion[] {
    return Array.from(this.regions.values())
      .sort((a, b) => b.activity - a.activity)
      .slice(0, n);
  }
  
  /**
   * Get all regions (for rendering)
   */
  getAllRegions(): UniverseRegion[] {
    return Array.from(this.regions.values());
  }
  
  /**
   * Update cosmic time and advance synthesis states
   */
  updateTime(dt: number): void {
    this.currentTime += dt;
    
    // Advance all region synthesis states forward in time
    // This is analytical (fast) - not full agent simulation
    for (const [coords, region] of this.regions) {
      if (region.synthesisState) {
        this.advanceSynthesisState(region.synthesisState, dt);
      }
    }
  }
  
  /**
   * Analytically advance synthesis state forward in time
   * Used when region is not actively simulated (zoomed out)
   */
  private advanceSynthesisState(state: SynthesisState, dt: number): void {
    // Age populations
    if (state.populations) {
      for (const pop of state.populations) {
        // Simple population dynamics (logistic growth)
        const birthRate = 0.02; // births per individual per year
        const deathRate = 0.01; // deaths per individual per year
        const carryingCapacity = 10000;
        
        const dt_years = dt / (365.25 * 86400);
        const growthRate = (birthRate - deathRate) * (1 - pop.count / carryingCapacity);
        pop.count = Math.max(0, pop.count + pop.count * growthRate * dt_years);
      }
    }
    
    // Advance complexity over time
    if (state.complexity < 9) {
      // Complexity can increase (very slowly)
      const complexityGrowth = dt / (1e8 * 365.25 * 86400); // 1 level per 100 Myr
      state.complexity = Math.min(9, state.complexity + complexityGrowth);
    }
    
    // Update activity based on populations
    if (state.populations && state.populations.length > 0) {
      const totalPopulation = state.populations.reduce((sum, p) => sum + p.count, 0);
      state.activity = Math.min(10, Math.log10(totalPopulation + 1));
    }
  }
}

/**
 * USAGE:
 * 
 * const map = new UniverseActivityMap(10, 100); // 10³ grid, 100 Mpc spacing
 * await map.synthesizeAll(); // Run once at startup
 * 
 * // Render as point cloud
 * const regions = map.getAllRegions();
 * for (const region of regions) {
 *   const brightness = region.activity / 10; // 0-1
 *   const color = activityToColor(region.activity);
 *   renderPoint(region.x, region.y, region.z, brightness, color);
 * }
 * 
 * // Find interesting regions
 * const civilizations = map.getCivilizedRegions();
 * const brightest = map.getBrightestRegions(10);
 */
