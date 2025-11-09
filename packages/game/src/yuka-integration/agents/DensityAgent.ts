/**
 * DENSITY AGENT
 * 
 * Represents a region of molecular cloud.
 * Decides WHETHER and WHEN to collapse into a star.
 * 
 * THIS is where star formation happens - NOT forced placement!
 * Agent asks Legal Broker: "Is my density sufficient for collapse?"
 * If yes → Forms star at THIS position
 * If no → Continues drifting
 */

import { Vehicle, Think, Goal, GoalEvaluator, Vector3 } from 'yuka';
import { LEGAL_BROKER } from '../../laws/core/LegalBroker';
import { UniverseState } from '../../laws/core/UniversalLawCoordinator';
import { AgentSpawner, AgentType } from '../AgentSpawner';

/**
 * Collapse Goal - Density agent tries to collapse into star
 */
export class CollapseGoal extends Goal {
  private collapseTime: number = 0;
  private collapseDuration: number = 1e6 * 365.25 * 86400; // 1 Myr to collapse
  
  activate(): void {
    const agent = this.owner as DensityAgent;
    console.log(`[${agent.name}] Goal: Collapse into star (ρ=${agent.density.toExponential(2)} kg/m³)`);
    this.collapseTime = 0;
  }
  
  execute(): void {
    const agent = this.owner as DensityAgent;
    
    this.collapseTime += agent.deltaTime;
    
    // Density increases as cloud contracts
    agent.density *= 1.0 + (agent.deltaTime / this.collapseDuration);
    agent.temperature *= 1.0 + (agent.deltaTime / (this.collapseDuration * 10)); // Heats up slower
    
    // When collapse completes
    if (this.collapseTime >= this.collapseDuration || agent.temperature > 1e7) {
      // Fusion ignition temperature reached!
      console.log(`[${agent.name}] 🌟 FUSION IGNITES! Becoming star...`);
      agent.formStar();
      this.status = Goal.STATUS.COMPLETED;
    }
  }
  
  terminate(): void {
    console.log(`[${this.owner.name}] Collapse complete`);
  }
}

/**
 * Drift Goal - Density agent drifts through space
 */
export class DriftGoal extends Goal {
  activate(): void {
    const agent = this.owner as DensityAgent;
    console.log(`[${agent.name}] Goal: Drift (ρ too low for collapse)`);
  }
  
  execute(): void {
    const agent = this.owner as DensityAgent;
    
    // Just drift slowly
    // Gravity steering will move agent toward dense regions
    // (GravityBehavior handles this)
    
    this.status = Goal.STATUS.ACTIVE;
  }
}

/**
 * Should Collapse Evaluator
 * 
 * Reads CACHED Jeans instability check from agent.
 * Agent pre-fetches this async result in update() before brain.arbitrate().
 */
export class ShouldCollapseEvaluator extends GoalEvaluator {
  calculateDesirability(agent: DensityAgent): number {
    // Read cached Jeans check (pre-fetched in agent.update())
    // This is SYNC - evaluators CANNOT be async!
    return agent.jeansCheckCache ? 1.0 : 0.0;
  }
  
  setGoal(agent: DensityAgent): void {
    if (!agent.brain) return;
    
    const currentSubgoal = agent.brain.currentSubgoal();
    
    if (!(currentSubgoal instanceof CollapseGoal)) {
      agent.brain.clearSubgoals();
      agent.brain.addSubgoal(new CollapseGoal(agent as any));
    }
  }
}

/**
 * Should Drift Evaluator
 * 
 * Default state - just drift
 */
export class ShouldDriftEvaluator extends GoalEvaluator {
  calculateDesirability(agent: DensityAgent): number {
    // Default behavior if not collapsing
    return 0.5;
  }
  
  setGoal(agent: DensityAgent): void {
    if (!agent.brain) return;
    
    const currentSubgoal = agent.brain.currentSubgoal();
    
    if (!(currentSubgoal instanceof DriftGoal)) {
      agent.brain.clearSubgoals();
      agent.brain.addSubgoal(new DriftGoal(agent as any));
    }
  }
}

/**
 * Density Agent
 * 
 * Represents a molecular cloud region.
 * Decides WHETHER to collapse into star based on Jeans mass criterion.
 */
export class DensityAgent extends Vehicle {
  // Physical properties
  density: number;       // kg/m³
  temperature: number;   // K
  mass: number;          // kg (total mass in this region)
  
  // Simulation
  deltaTime: number = 0;
  age: number = 0;
  
  // State
  hasCollapsed: boolean = false;
  
  // Cached Legal Broker results (pre-fetched for sync evaluators)
  jeansCheckCache: boolean = false;
  
  // Reference to spawner (for creating stars)
  spawner?: AgentSpawner;
  
  constructor(density: number, temperature: number, mass: number, spawner?: AgentSpawner) {
    super();
    
    this.density = density;
    this.temperature = temperature;
    this.mass = mass;
    this.spawner = spawner;
    this.name = `Cloud-${density.toExponential(1)}`;
    
    // Brain with evaluators
    this.brain = new Think(this as any);
    this.brain.addEvaluator(new ShouldCollapseEvaluator());
    this.brain.addEvaluator(new ShouldDriftEvaluator());
    
    console.log(`[DensityAgent] Created ${this.name} at (${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)}, ${this.position.z.toFixed(1)})`);
  }
  
  /**
   * Start (called after added to EntityManager)
   */
  start(): this {
    // Query manager for nearby density agents
    const nearby = this.getNearbyDensityAgents();
    
    console.log(`[${this.name}] Started - ${nearby.length} nearby clouds`);
    
    return this;
  }
  
  /**
   * Update (called every frame)
   */
  async update(delta: number): Promise<this> {
    super.update(delta);
    
    this.deltaTime = delta;
    this.age += delta;
    
    // PRE-FETCH Legal Broker results (BEFORE brain.arbitrate())
    // This is async, but we do it BEFORE the sync evaluator reads it
    await this.preFetchLegalBrokerResults();
    
    // Execute brain (evaluators pick best goal)
    if (this.brain) {
      this.brain.execute();
      this.brain.arbitrate();
    }
    
    return this;
  }
  
  /**
   * Pre-fetch all Legal Broker results needed by evaluators
   * Called BEFORE brain.arbitrate() so evaluators can read cached values
   */
  private async preFetchLegalBrokerResults(): Promise<void> {
    // Check Jeans instability
    try {
      const response = await LEGAL_BROKER.ask({
        domain: 'physics',
        action: 'check-jeans-instability',
        params: {
          density: this.density,
          temperature: this.temperature,
          mass: this.mass,
        },
        state: this.getState(),
      });
      
      this.jeansCheckCache = response.value === true;
    } catch (error) {
      // If Legal Broker fails, default to false
      this.jeansCheckCache = false;
    }
  }
  
  /**
   * Get nearby density agents
   */
  private getNearbyDensityAgents(): DensityAgent[] {
    if (!this.manager) return [];
    
    const nearby: DensityAgent[] = [];
    const searchRadius = 100; // Game units
    
    for (const entity of this.manager.entities) {
      if (entity === this) continue;
      if (!(entity instanceof DensityAgent)) continue;
      
      const distance = this.position.distanceTo(entity.position);
      if (distance < searchRadius) {
        nearby.push(entity);
      }
    }
    
    return nearby;
  }
  
  /**
   * Form star (called when collapse conditions met)
   */
  async formStar(): Promise<void> {
    if (this.hasCollapsed) return;
    if (!this.spawner) {
      console.warn(`[${this.name}] No spawner available to create star!`);
      return;
    }
    
    this.hasCollapsed = true;
    
    console.log(`[${this.name}] 🌟 FORMING STAR at (${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)}, ${this.position.z.toFixed(1)})`);
    
    // Calculate stellar mass from cloud mass (efficiency ~30%)
    const stellarMass = this.mass * 0.3 / 2e30; // Convert to solar masses
    
    // Spawn stellar agent at THIS position (where collapse happened)
    const result = await this.spawner.spawn({
      type: AgentType.STELLAR,
      position: this.position.clone(),
      reason: `Molecular cloud collapse (Jeans instability)`,
      state: this.getState(),
      params: {
        mass: Math.max(0.1, Math.min(100, stellarMass)), // 0.1 to 100 M☉
      },
    });
    
    if (result.success) {
      console.log(`  ✅ Star formed: ${stellarMass.toFixed(2)} M☉`);
    }
    
    // Remove this density agent (it became a star)
    this.active = false;
  }
  
  /**
   * Get state for Legal Broker queries
   */
  getState(): UniverseState {
    return {
      t: this.age,
      localTime: this.age,
      temperature: this.temperature,
      pressure: 1e-15,
      density: this.density,
      complexity: 2, // Molecules
      elements: { H: 0.74, He: 0.24, O: 0.01 },
      hasLife: false,
      hasCognition: false,
      hasSociety: false,
      hasTechnology: false,
    };
  }
}

/**
 * USAGE:
 * 
 * // Create density field
 * const densityGrid = create3DDensityField(seed);
 * 
 * // Spawn density agent at each cell
 * for (const cell of densityGrid) {
 *   const agent = new DensityAgent(cell.density, cell.temperature, cell.mass, spawner);
 *   agent.position.set(cell.x, cell.y, cell.z);
 *   entityManager.add(agent);
 * }
 * 
 * // Agents decide where stars form!
 * // NO forcing positions
 * // Stars form WHERE physics dictates
 */

