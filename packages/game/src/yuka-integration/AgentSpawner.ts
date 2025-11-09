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

import { EntityManager, Think, Vector3, Vehicle } from 'yuka';
import { LEGAL_BROKER } from '../laws/core/LegalBroker';
import { UniverseState } from '../laws/core/UniversalLawCoordinator';
import { CreatureAgent } from './agents/CreatureAgent';
import { ReproductionEvaluator, SurvivalEvaluator } from './agents/evaluators/CreatureEvaluators';
import { ClimateEvaluator, LifeEvaluator } from './agents/evaluators/PlanetaryEvaluators';
import { FusionEvaluator, SupernovaEvaluator } from './agents/evaluators/StellarEvaluators';
import { PlanetaryAgent } from './agents/PlanetaryAgent';
import { StellarAgent } from './agents/StellarAgent';

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
 * 
 * CRITICAL: Uses ONE unified EntityManager so all agents can see each other!
 * This enables:
 * - Stars can see planets
 * - Planets can see creatures
 * - Message passing works across types
 * - Gravity behavior works between all agents
 */
export class AgentSpawner {
  private entityManager: EntityManager; // ONE manager for ALL agents!

  // Epoch callbacks (EntropyAgent triggers these)
  onStellarEpoch?: (state: any) => Promise<void>;
  onPlanetaryEpoch?: (state: any) => Promise<void>;
  onLifeEpoch?: (state: any) => Promise<void>;

  constructor() {
    // SINGLE unified EntityManager
    // All agents registered here can find each other via this.manager.entities
    this.entityManager = new EntityManager();

    console.log('[AgentSpawner] Initialized with UNIFIED entity manager');
    console.log('  All agents will be able to see each other!');
  }

  /**
   * Get total agent count
   */
  getTotalAgentCount(): number {
    return this.entityManager.entities.length;
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

    // Step 4: Add to unified entity manager
    console.log(`  Adding to unified entity manager...`);
    this.entityManager.add(agent);

    // Call start() hook (Yuka lifecycle pattern)
    if ('start' in agent && typeof (agent as any).start === 'function') {
      (agent as any).start();
    }

    console.log(`  🎯 Agent spawned: ${agent.name || agent['agentType']}`);

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
    let agent: Vehicle;

    // Create the appropriate agent class based on type
    switch (request.type) {
      case AgentType.STELLAR:
        agent = new StellarAgent(
          request.params?.mass || 1.0,
          request.params?.luminosity,
          request.params?.temperature
        ) as any as Vehicle;
        break;

      case AgentType.PLANETARY:
        agent = new PlanetaryAgent(
          request.params?.mass || 5.972e24,
          request.params?.radius || 6.371e6,
          request.params?.orbitalRadius || 1.0
        ) as any as Vehicle;
        break;

      case AgentType.CREATURE:
        agent = new CreatureAgent(
          request.params?.mass || 70,
          request.params?.speed || 1.5,
          request.params?.hungerThreshold || 0.3
        ) as any as Vehicle;
        break;

      case AgentType.GALACTIC:
      case AgentType.BIOSPHERE:
      default:
        // Fall back to basic vehicle for types not yet implemented
        agent = new Vehicle();
        break;
    }

    // Set position
    agent.position.copy(request.position);
    agent.name = `${request.type}-${Date.now()}`;
    agent['agentType'] = request.type; // Store type for later reference

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

    // Create and assign ACTUAL Yuka brain with evaluators
    // Evaluators will automatically select best goals based on agent state
    if (!agent.brain) {
      agent.brain = new Think(agent);
    }

    // Add evaluators based on agent type
    // Evaluators decide which goals to pursue (production-grade AI)
    switch (agentType) {
      case AgentType.STELLAR: {
        const star = agent as unknown as StellarAgent;

        // Add evaluators (not goals directly!)
        agent.brain.addEvaluator(new FusionEvaluator());
        agent.brain.addEvaluator(new SupernovaEvaluator());

        console.log(`  [StellarAgent] Evaluators: Fusion, Supernova`);
        break;
      }

      case AgentType.PLANETARY: {
        const planet = agent as unknown as PlanetaryAgent;

        // Add evaluators
        agent.brain.addEvaluator(new ClimateEvaluator());
        agent.brain.addEvaluator(new LifeEvaluator());

        console.log(`  [PlanetaryAgent] Evaluators: Climate, Life`);
        break;
      }

      case AgentType.CREATURE: {
        const creature = agent as unknown as CreatureAgent;

        // Add evaluators
        agent.brain.addEvaluator(new SurvivalEvaluator());
        agent.brain.addEvaluator(new ReproductionEvaluator());

        console.log(`  [CreatureAgent] Evaluators: Survival, Reproduction`);
        break;
      }

      default:
        // For unimplemented agent types, log what legal broker suggested
        console.log(`  [${agentType}] Evaluators (not yet implemented): ${JSON.stringify(response.value)}`);
    }
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
   * Despawn an agent
   * 
   * Removes agent from unified entity manager
   */
  despawn(agent: Vehicle): boolean {
    // Remove from manager
    this.entityManager.remove(agent);

    const agentType = agent['agentType'] as AgentType;
    console.log(`[AgentSpawner] Despawned ${agentType || 'unknown'} agent: ${agent.name || agent.uuid}`);

    return true;
  }

  /**
   * Update unified entity manager
   */
  update(delta: number): void {
    this.entityManager.update(delta);
  }

  /**
   * Get the unified entity manager
   */
  getManager(): EntityManager {
    return this.entityManager;
  }

  /**
   * Get all agents of a type
   */
  getAgents(type: AgentType): Vehicle[] {
    return this.entityManager.entities.filter(e => e['agentType'] === type) as Vehicle[];
  }

  /**
   * Get ALL agents (regardless of type)
   */
  getAllAgents(): Vehicle[] {
    return this.entityManager.entities as Vehicle[];
  }

  /**
   * Count agents
   */
  getAgentCount(type?: AgentType): number {
    if (type) {
      return this.getAgents(type).length;
    }

    // Total across all types
    return this.entityManager.entities.length;
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
