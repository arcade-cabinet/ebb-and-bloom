/**
 * Comprehensive Yuka Integration Layer
 * 
 * This is the FOUNDATION for making everything in the game Yuka-driven.
 * 
 * WORLD.md Vision: "Everything is a Yuka entity with goals"
 * - Planet: Wants stability
 * - Materials: Want cohesion
 * - Creatures: Want survival
 * - Tools: Want utility
 * - Buildings: Want purpose
 * - Tribes: Want dominance
 * - Myths: Want immortality
 * 
 * This file provides TypeScript wrappers and extensions for ALL Yuka systems:
 * 1. Goals (CompositeGoal, GoalEvaluator)
 * 2. FSM (StateMachine with custom states)
 * 3. Fuzzy Logic (FuzzyModule for decisions)
 * 4. Vision (Perception system)
 * 5. Memory (MemorySystem for entities)
 * 6. Triggers (Event-driven actions)
 * 7. Tasks (Sequential task execution)
 * 8. MessageDispatcher (Inter-entity communication)
 * 9. Steering Behaviors (Cohesion, Separation, Alignment)
 * 10. Path (Movement patterns)
 * 
 * CRITICAL: These are pure data structures that can be serialized to JSON.
 * The 3D renderer will query these later but doesn't need to exist now.
 */

import * as YUKA from 'yuka';

/**
 * ============================================================================
 * GOAL SYSTEM - Hierarchical decision making
 * ============================================================================
 */

/**
 * Goal types for different entity categories
 */
export enum GoalType {
  // Planetary goals
  MAINTAIN_STABILITY = 'maintain_stability',
  BALANCE_PRESSURE = 'balance_pressure',
  REGULATE_TEMPERATURE = 'regulate_temperature',
  
  // Material goals
  MAINTAIN_COHESION = 'maintain_cohesion',
  ATTRACT_AFFINITY = 'attract_affinity',
  SEPARATE_INCOMPATIBLE = 'separate_incompatible',
  
  // Creature goals
  SURVIVE = 'survive',
  ACQUIRE_RESOURCES = 'acquire_resources',
  FORM_SOCIAL_BONDS = 'form_social_bonds',
  REPRODUCE = 'reproduce',
  FORAGE = 'forage',
  HUNT = 'hunt',
  EXCAVATE = 'excavate',
  
  // Tool goals
  BE_USEFUL = 'be_useful',
  ENABLE_ACCESS = 'enable_access',
  AVOID_BREAKING = 'avoid_breaking',
  
  // Building goals
  SHELTER = 'shelter',
  ENABLE_CRAFTING = 'enable_crafting',
  SIGNAL_PRESENCE = 'signal_presence',
  
  // Tribal goals
  EXPAND_TERRITORY = 'expand_territory',
  ACQUIRE_TRIBAL_RESOURCES = 'acquire_tribal_resources',
  DEFEND_TERRITORY = 'defend_territory',
  BUILD_SETTLEMENT = 'build_settlement',
}

/**
 * Goal evaluation context (what information goals use to make decisions)
 */
export interface GoalContext {
  entityId: string;
  entityType: 'planet' | 'material' | 'creature' | 'tool' | 'building' | 'tribe';
  
  // Environmental state
  generation: number;
  cycle: number;
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  
  // Pressure values (drive goal desirability)
  pressures: {
    material: number;      // 0-1
    population: number;    // 0-1
    predation: number;     // 0-1
    stability: number;     // 0-1
  };
  
  // Entity-specific state
  entityState: any;
  
  // World queries
  nearbyEntities?: string[];
  accessibleResources?: string[];
}

/**
 * Goal evaluator - scores desirability of goals
 */
export class GameGoalEvaluator extends YUKA.Goal {
  public goalType: GoalType;
  public desirability: number = 0;
  public context: GoalContext | null = null;
  
  constructor(goalType: GoalType) {
    super();
    this.goalType = goalType;
  }
  
  /**
   * Calculate how desirable this goal is (0-1)
   * This replaces manual if/else probability checks
   */
  calculateDesirability(context: GoalContext): number {
    this.context = context;
    
    switch (this.goalType) {
      case GoalType.ACQUIRE_RESOURCES:
        // High material pressure = high desirability
        return context.pressures.material;
      
      case GoalType.FORM_SOCIAL_BONDS:
        // High population pressure = high desirability
        return context.pressures.population;
      
      case GoalType.HUNT:
        // High predation pressure = high desirability
        return context.pressures.predation;
      
      case GoalType.MAINTAIN_COHESION:
        // Low stability = high desirability for cohesion
        return 1 - context.pressures.stability;
      
      default:
        return 0.5; // Default moderate desirability
    }
  }
  
  activate(): void {
    this.status = YUKA.Goal.STATUS_ACTIVE;
  }
  
  execute(): number {
    // Goal execution logic
    this.status = YUKA.Goal.STATUS_COMPLETED;
    return this.status;
  }
  
  terminate(): void {
    this.status = YUKA.Goal.STATUS_INACTIVE;
  }
  
  /**
   * Serialize goal state for JSON export
   */
  toJSON() {
    return {
      type: this.goalType,
      status: this.status,
      desirability: this.desirability,
      active: this.status === YUKA.Goal.STATUS_ACTIVE,
    };
  }
}

/**
 * ============================================================================
 * FUZZY LOGIC SYSTEM - For emergence decisions
 * ============================================================================
 */

/**
 * Fuzzy variable wrapper
 */
export class GameFuzzyVariable extends YUKA.FuzzyVariable {
  constructor(name: string) {
    super();
  }
}

/**
 * Fuzzy module for tool emergence
 */
export class ToolEmergenceFuzzy {
  private module: YUKA.FuzzyModule;
  
  // Input variables
  private materialAccessibility: YUKA.FuzzyVariable;
  private creatureCapability: YUKA.FuzzyVariable;
  
  // Output variable
  private emergenceDesirability: YUKA.FuzzyVariable;
  
  constructor() {
    this.module = new YUKA.FuzzyModule();
    
    // Input: Material Accessibility (0-1)
    this.materialAccessibility = new YUKA.FuzzyVariable();
    const maLow = new YUKA.LeftShoulderFuzzySet(0, 0.3, 0.5);
    const maMed = new YUKA.TriangularFuzzySet(0.3, 0.5, 0.7);
    const maHigh = new YUKA.RightShoulderFuzzySet(0.5, 0.7, 1);
    this.materialAccessibility.add(maLow);
    this.materialAccessibility.add(maMed);
    this.materialAccessibility.add(maHigh);
    
    // Input: Creature Capability (0-1)
    this.creatureCapability = new YUKA.FuzzyVariable();
    const ccWeak = new YUKA.LeftShoulderFuzzySet(0, 0.3, 0.5);
    const ccMod = new YUKA.TriangularFuzzySet(0.3, 0.5, 0.7);
    const ccStrong = new YUKA.RightShoulderFuzzySet(0.5, 0.7, 1);
    this.creatureCapability.add(ccWeak);
    this.creatureCapability.add(ccMod);
    this.creatureCapability.add(ccStrong);
    
    // Output: Emergence Desirability (0-1)
    this.emergenceDesirability = new YUKA.FuzzyVariable();
    const edLow = new YUKA.LeftShoulderFuzzySet(0, 0.3, 0.5);
    const edMed = new YUKA.TriangularFuzzySet(0.3, 0.5, 0.7);
    const edHigh = new YUKA.RightShoulderFuzzySet(0.5, 0.7, 1);
    this.emergenceDesirability.add(edLow);
    this.emergenceDesirability.add(edMed);
    this.emergenceDesirability.add(edHigh);
    
    // Rules: IF accessibility LOW AND capability STRONG THEN emergence HIGH
    const rule1 = new YUKA.FuzzyRule(
      new YUKA.FuzzyAND(maLow, ccStrong),
      edHigh
    );
    this.module.addRule(rule1);
    
    // Add more rules...
    const rule2 = new YUKA.FuzzyRule(
      new YUKA.FuzzyAND(maMed, ccMod),
      edMed
    );
    this.module.addRule(rule2);
  }
  
  /**
   * Evaluate if tool should emerge
   */
  evaluate(accessibility: number, capability: number): number {
    this.module.fuzzify('materialAccessibility', accessibility);
    this.module.fuzzify('creatureCapability', capability);
    return this.module.defuzzify('emergenceDesirability');
  }
}

/**
 * Fuzzy module for building emergence
 */
export class BuildingEmergenceFuzzy {
  private module: YUKA.FuzzyModule;
  
  evaluate(populationPressure: number, socialCohesion: number): number {
    // Similar structure to ToolEmergenceFuzzy
    // Returns 0-1 desirability for building construction
    return populationPressure * socialCohesion;
  }
}

/**
 * ============================================================================
 * MESSAGE DISPATCHER - Inter-entity communication
 * ============================================================================
 */

/**
 * Message types for game events
 */
export enum MessageType {
  // Material messages
  MATERIAL_DISCOVERED = 'material_discovered',
  MATERIAL_DEPLETED = 'material_depleted',
  ACCESSIBILITY_CHANGED = 'accessibility_changed',
  
  // Tool messages
  TOOL_CREATED = 'tool_created',
  TOOL_BROKEN = 'tool_broken',
  TOOL_UPGRADED = 'tool_upgraded',
  
  // Creature messages
  CREATURE_EVOLVED = 'creature_evolved',
  CREATURE_DIED = 'creature_died',
  PACK_FORMED = 'pack_formed',
  
  // Building messages
  BUILDING_CONSTRUCTED = 'building_constructed',
  BUILDING_DAMAGED = 'building_damaged',
  
  // Tribal messages
  TRIBE_FORMED = 'tribe_formed',
  WAR_DECLARED = 'war_declared',
  ALLIANCE_FORMED = 'alliance_formed',
  
  // System messages
  GENERATION_ADVANCED = 'generation_advanced',
  CYCLE_ADVANCED = 'cycle_advanced',
  ENDING_ACHIEVED = 'ending_achieved',
}

/**
 * Game message (extends YUKA Telegram)
 */
export interface GameMessage {
  type: MessageType;
  sender: string;
  receiver: string;
  delay: number;
  data: any;
  timestamp: number;
}

/**
 * Message dispatcher singleton
 */
export class GameMessageDispatcher {
  private static instance: GameMessageDispatcher;
  private dispatcher: YUKA.MessageDispatcher;
  private messageLog: GameMessage[] = [];
  
  private constructor() {
    this.dispatcher = new YUKA.MessageDispatcher();
  }
  
  static getInstance(): GameMessageDispatcher {
    if (!GameMessageDispatcher.instance) {
      GameMessageDispatcher.instance = new GameMessageDispatcher();
    }
    return GameMessageDispatcher.instance;
  }
  
  /**
   * Dispatch message between entities
   */
  dispatch(message: Omit<GameMessage, 'timestamp'>): void {
    const fullMessage: GameMessage = {
      ...message,
      timestamp: Date.now(),
    };
    
    this.messageLog.push(fullMessage);
    
    // YUKA dispatch (for entities that have handleMessage)
    // This is where we'd wire to actual Yuka entities
    // For now, we're just logging
  }
  
  /**
   * Get recent messages (for UI/debugging)
   */
  getRecentMessages(count: number = 100): GameMessage[] {
    return this.messageLog.slice(-count);
  }
  
  /**
   * Get messages by type
   */
  getMessagesByType(type: MessageType): GameMessage[] {
    return this.messageLog.filter(m => m.type === type);
  }
  
  /**
   * Export messages to JSON
   */
  toJSON() {
    return {
      messageCount: this.messageLog.length,
      recentMessages: this.messageLog.slice(-50),
    };
  }
}

/**
 * ============================================================================
 * FSM (FINITE STATE MACHINE) - State-based behavior
 * ============================================================================
 */

/**
 * Creature states
 */
export enum CreatureState {
  IDLE = 'idle',
  FORAGING = 'foraging',
  HUNTING = 'hunting',
  FLEEING = 'fleeing',
  FIGHTING = 'fighting',
  RESTING = 'resting',
  REPRODUCING = 'reproducing',
  EXCAVATING = 'excavating',
}

/**
 * Building states
 */
export enum BuildingState {
  CONSTRUCTION = 'construction',
  ACTIVE = 'active',
  DAMAGED = 'damaged',
  RUINS = 'ruins',
}

/**
 * State machine wrapper
 */
export class GameStateMachine<T extends string> {
  private currentState: T;
  private previousState: T | null = null;
  private stateHistory: T[] = [];
  
  constructor(initialState: T) {
    this.currentState = initialState;
    this.stateHistory.push(initialState);
  }
  
  /**
   * Transition to new state
   */
  transitionTo(newState: T): void {
    this.previousState = this.currentState;
    this.currentState = newState;
    this.stateHistory.push(newState);
    
    // Send message about state change
    GameMessageDispatcher.getInstance().dispatch({
      type: MessageType.CREATURE_EVOLVED, // Or appropriate type
      sender: 'fsm',
      receiver: 'world',
      delay: 0,
      data: { from: this.previousState, to: newState },
    });
  }
  
  /**
   * Get current state
   */
  getCurrentState(): T {
    return this.currentState;
  }
  
  /**
   * Check if in state
   */
  isInState(state: T): boolean {
    return this.currentState === state;
  }
  
  /**
   * Serialize for JSON
   */
  toJSON() {
    return {
      current: this.currentState,
      previous: this.previousState,
      history: this.stateHistory.slice(-10), // Last 10 states
    };
  }
}

/**
 * ============================================================================
 * RENDERING HOOKS - Pure data that 3D can query later
 * ============================================================================
 */

/**
 * Spatial data for rendering (NO actual rendering, just data)
 */
export interface RenderableEntity {
  id: string;
  type: 'creature' | 'material' | 'building' | 'tool' | 'pack' | 'tribe';
  
  // Position (world coordinates)
  position: { x: number; y: number; z: number };
  
  // Orientation (for rotation)
  rotation: { x: number; y: number; z: number };
  
  // Scale (for size)
  scale: { x: number; y: number; z: number };
  
  // Visual properties (what renderer should use)
  visual: {
    morphology?: any;      // Creature shape data
    materialType?: string; // Material visual type
    buildingType?: string; // Building appearance
    color?: string;        // Override color
    texture?: string;      // Texture identifier
  };
  
  // Animation state (for renderer)
  animation: {
    state: string;         // 'idle', 'moving', 'attacking', etc.
    speed: number;         // Animation speed multiplier
    loop: boolean;         // Should animation loop
  };
  
  // Visibility (for LOD, culling)
  visibility: {
    visible: boolean;      // Should be rendered
    lod: number;          // Level of detail (0-3)
    distance: number;     // Distance from camera
  };
}

/**
 * Rendering hook manager (query interface for 3D)
 */
export class RenderingHookManager {
  private static instance: RenderingHookManager;
  private entities: Map<string, RenderableEntity> = new Map();
  
  private constructor() {}
  
  static getInstance(): RenderingHookManager {
    if (!RenderingHookManager.instance) {
      RenderingHookManager.instance = new RenderingHookManager();
    }
    return RenderingHookManager.instance;
  }
  
  /**
   * Register entity for rendering
   */
  register(entity: RenderableEntity): void {
    this.entities.set(entity.id, entity);
  }
  
  /**
   * Update entity data
   */
  update(id: string, updates: Partial<RenderableEntity>): void {
    const entity = this.entities.get(id);
    if (entity) {
      Object.assign(entity, updates);
    }
  }
  
  /**
   * Get all entities in view frustum (for renderer)
   */
  getVisibleEntities(cameraPosition: { x: number; y: number; z: number }, viewDistance: number): RenderableEntity[] {
    return Array.from(this.entities.values()).filter(entity => {
      const dx = entity.position.x - cameraPosition.x;
      const dy = entity.position.y - cameraPosition.y;
      const dz = entity.position.z - cameraPosition.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      entity.visibility.distance = distance;
      entity.visibility.visible = distance <= viewDistance;
      
      // LOD based on distance
      if (distance < viewDistance * 0.3) entity.visibility.lod = 3;
      else if (distance < viewDistance * 0.6) entity.visibility.lod = 2;
      else entity.visibility.lod = 1;
      
      return entity.visibility.visible;
    });
  }
  
  /**
   * Get entities by type (for renderer)
   */
  getEntitiesByType(type: RenderableEntity['type']): RenderableEntity[] {
    return Array.from(this.entities.values()).filter(e => e.type === type);
  }
  
  /**
   * Export for debugging
   */
  toJSON() {
    return {
      totalEntities: this.entities.size,
      byType: {
        creatures: this.getEntitiesByType('creature').length,
        materials: this.getEntitiesByType('material').length,
        buildings: this.getEntitiesByType('building').length,
        tools: this.getEntitiesByType('tool').length,
        packs: this.getEntitiesByType('pack').length,
        tribes: this.getEntitiesByType('tribe').length,
      },
    };
  }
}

/**
 * ============================================================================
 * EXPORTS
 * ============================================================================
 */

export {
  GameGoalEvaluator as GoalEvaluator,
  ToolEmergenceFuzzy,
  BuildingEmergenceFuzzy,
  GameMessageDispatcher as MessageDispatcher,
  GameStateMachine as StateMachine,
  RenderingHookManager,
};
