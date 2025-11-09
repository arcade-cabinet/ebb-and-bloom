/**
 * AGENT SPAWNER
 * 
 * Determines WHAT, WHERE, HOW, WHY to spawn Yuka agents.
 * Works with Legal Broker to ensure spawns follow laws.
 * 
 * The missing piece between:
 * - Legal Brokers (understand laws) ✅
 * - Yuka Agents (make decisions) ❌
 */

import { Vector3, EntityManager, Vehicle } from 'yuka';
import { LEGAL_BROKER } from '../laws/core/LegalBroker';
import { UniverseState } from '../laws/core/UniversalLawCoordinator';

/**
 * Spawn request
 */
export interface SpawnRequest {
  type: AgentType;           // What kind of agent?
  position: Vector3;         // Where to spawn?
  reason: string;            // Why spawning? (for logging)
  state: UniverseState;      // Current universe state
  params?: Record<string, any>; // Additional parameters
}

/**
 * Agent types at different scales
 */
export enum AgentType {
  GALACTIC = 'galactic',     // Galaxy formation agent
  STELLAR = 'stellar',       // Star lifecycle agent
  PLANETARY = 'planetary',   // Planet/climate agent
  BIOSPHERE = 'biosphere',   // Ecosystem agent
  CREATURE = 'creature',     // Individual creature agent
}

/**
 * Spawn result
 */
export interface SpawnResult {
  success: boolean;
  agent?: Vehicle;
  reason?: string; // Why it succeeded/failed
}

/**
 * Agent Spawner
 * 
 * Mediates between Legal Broker (laws) and Entity Manager (agents).
 */
export class AgentSpawner {
  private entityManagers: Map<AgentType, EntityManager>;
  
  // Epoch callbacks (EntropyAgent triggers these)
  onStellarEpoch?: (state: any) => Promise<void>;
  onPlanetaryEpoch?: (state: any) => Promise<void>;
  onLifeEpoch?: (state: any) => Promise<void>;
  
  constructor() {
    // One EntityManager per scale
    this.entityManagers = new Map([
      [AgentType.GALACTIC, new EntityManager()],
      [AgentType.STELLAR, new EntityManager()],
      [AgentType.PLANETARY, new EntityManager()],
      [AgentType.BIOSPHERE, new EntityManager()],
      [AgentType.CREATURE, new EntityManager()],
    ]);
    
    console.log('[AgentSpawner] Initialized with 5 entity managers (one per scale)');
  }
  
  /**
   * Get total agent count across all managers
   */
  getTotalAgentCount(): number {
    let total = 0;
    for (const manager of this.entityManagers.values()) {
      total += manager.entities.length;
    }
    return total;
  }
  
  /**
   * Spawn an agent (asks legal broker first)
   */
  async spawn(request: SpawnRequest): Promise<SpawnResult> {
    console.log(`[AgentSpawner] Spawn request: ${request.type} at (${request.position.x.toFixed(1)}, ${request.position.y.toFixed(1)}, ${request.position.z.toFixed(1)})`);
    console.log(`  Reason: ${request.reason}`);
    
    // Step 1: Ask legal broker if spawn is allowed
    const legalCheck = await this.checkLegality(request);
    
    if (!legalCheck.allowed) {
      console.log(`  ❌ Spawn forbidden by laws: ${legalCheck.reason}`);
      return {
        success: false,
        reason: `Laws forbid: ${legalCheck.reason}`,
      };
    }
    
    console.log(`  ✅ Spawn approved by legal broker`);
    console.log(`  Creating agent...`);
    
    // Step 2: Create agent
    const agent = await this.createAgent(request);
    console.log(`  Agent created: ${agent.name}`);
    
    // Step 3: Assign goals (from legal broker)
    console.log(`  Assigning goals...`);
    await this.assignGoals(agent, request.state);
    console.log(`  Goals assigned`);
    
    // Step 4: Add to appropriate entity manager
    console.log(`  Adding to entity manager...`);
    const manager = this.entityManagers.get(request.type);
    if (!manager) {
      throw new Error(`No entity manager for type: ${request.type}`);
    }
    
    manager.add(agent);
    
    console.log(`  🎯 Agent spawned and added to ${request.type} manager`);
    
    return {
      success: true,
      agent,
    };
  }
  
  /**
   * Ask legal broker if spawn is allowed
   */
  private async checkLegality(request: SpawnRequest): Promise<{
    allowed: boolean;
    reason: string;
  }> {
    // Determine which domain to ask
    const domain = this.getDomainForAgentType(request.type);
    
    // Ask legal broker
    const response = await LEGAL_BROKER.ask({
      domain,
      action: 'evaluate-spawn-conditions',
      params: {
        position: request.position,
        temperature: request.state.temperature,
        density: request.state.density,
        complexity: request.state.complexity,
        ...request.params,
      },
      state: request.state,
    });
    
    return {
      allowed: response.value === true,
      reason: response.precedents?.[0] || 'No reason given',
    };
  }
  
  /**
   * Create agent instance (not yet added to manager)
   */
  private async createAgent(request: SpawnRequest): Promise<Vehicle> {
    // TODO: Import actual agent classes
    // For now, create basic vehicle
    const agent = new Vehicle();
    agent.position.copy(request.position);
    agent.name = `${request.type}-${Date.now()}`;
    agent['agentType'] = request.type; // Store type
    
    return agent;
  }
  
  /**
   * Assign goals to agent based on laws
   */
  private async assignGoals(agent: Vehicle, state: UniverseState): Promise<void> {
    const agentType = agent['agentType'] as AgentType;
    const domain = this.getDomainForAgentType(agentType);
    
    // Ask legal broker what goals this agent should have
    const response = await LEGAL_BROKER.ask({
      domain,
      action: 'get-default-goals',
      params: {
        agentType,
        position: agent.position,
      },
      state,
    });
    
    // TODO: Create and add goals to agent.brain
    // For now, log what goals were suggested
    console.log(`  Goals suggested: ${response.value || 'none'}`);
  }
  
  /**
   * Map agent type to legal domain
   */
  private getDomainForAgentType(type: AgentType): string {
    switch (type) {
      case AgentType.GALACTIC:
        return 'physics';
      case AgentType.STELLAR:
        return 'physics';
      case AgentType.PLANETARY:
        return 'planetary';
      case AgentType.BIOSPHERE:
        return 'ecology';
      case AgentType.CREATURE:
        return 'biology';
      default:
        return 'physics';
    }
  }
  
  /**
   * Update all entity managers
   */
  update(delta: number): void {
    for (const [type, manager] of this.entityManagers) {
      manager.update(delta);
    }
  }
  
  /**
   * Get entity manager for a scale
   */
  getManager(type: AgentType): EntityManager | undefined {
    return this.entityManagers.get(type);
  }
  
  /**
   * Get all agents of a type
   */
  getAgents(type: AgentType): Vehicle[] {
    const manager = this.entityManagers.get(type);
    return manager ? (manager.entities as Vehicle[]) : [];
  }
  
  /**
   * Count agents
   */
  getAgentCount(type?: AgentType): number {
    if (type) {
      return this.getAgents(type).length;
    }
    
    // Total across all scales
    let total = 0;
    for (const manager of this.entityManagers.values()) {
      total += manager.entities.length;
    }
    return total;
  }
}

/**
 * USAGE:
 * 
 * const spawner = new AgentSpawner();
 * 
 * // Spawn stellar agent
 * const result = await spawner.spawn({
 *   type: AgentType.STELLAR,
 *   position: new Vector3(100, 0, 0),
 *   reason: 'Star formation in molecular cloud',
 *   state: currentUniverseState,
 *   params: { mass: 1.0 }, // Solar mass
 * });
 * 
 * if (result.success) {
 *   console.log('Star agent spawned!', result.agent);
 * }
 * 
 * // Game loop
 * function update(delta) {
 *   spawner.update(delta); // Updates all agents at all scales
 * }
 */
