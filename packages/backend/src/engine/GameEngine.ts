/**
 * Game Engine - Core game loop and state management
 * 
 * This is the HEART of Ebb & Bloom. All game logic runs here.
 * The engine is a clean interface that:
 * - Manages game state
 * - Executes game commands
 * - Advances time (cycles, generations)
 * - Emits events
 * - Can be serialized/deserialized for save/load
 * 
 * The engine is FRAMEWORK-AGNOSTIC - no React, no Three.js, no DOM.
 * Just pure game logic that can run anywhere (server, CLI, tests).
 */

import { EventEmitter } from 'events';
import type { GenerationZeroOutput } from '../types/generation-zero.js';

/**
 * Game state interface
 */
export interface GameState {
  gameId: string;
  initialized: boolean;
  seedPhrase: string;
  
  // Time
  currentGeneration: number;
  currentCycle: number;
  currentPhase: 'dawn' | 'day' | 'dusk' | 'night';
  
  // World
  planet: any | null;
  
  // Entities (will be populated from stores)
  creatures: any[];
  packs: any[];
  tribes: any[];
  buildings: any[];
  tools: any[];
  
  // Progress
  discoveries: string[];
  extinctions: string[];
  events: GameEvent[];
  
  // Metrics
  score: {
    violence: number;
    harmony: number;
    exploitation: number;
    innovation: number;
    speed: number;
  };
  
  ending: string | null;
}

export interface GameEvent {
  generation: number;
  cycle: number;
  timeOfDay: string;
  type: string;
  description: string;
  coordinates?: { x: number; y: number; z: number };
  participants?: string[];
  data?: any;
}

/**
 * Game Engine
 */
export class GameEngine extends EventEmitter {
  private gameId: string;
  private state: GameState;
  
  constructor(gameId: string) {
    super();
    this.gameId = gameId;
    this.state = this.createInitialState(gameId);
  }
  
  /**
   * Create initial state
   */
  private createInitialState(gameId: string): GameState {
    return {
      gameId,
      initialized: false,
      seedPhrase: '',
      currentGeneration: 0,
      currentCycle: 0,
      currentPhase: 'dawn',
      planet: null,
      creatures: [],
      packs: [],
      tribes: [],
      buildings: [],
      tools: [],
      discoveries: [],
      extinctions: [],
      events: [],
      score: {
        violence: 0,
        harmony: 0,
        exploitation: 0,
        innovation: 0,
        speed: 0,
      },
      ending: null,
    };
  }
  
  /**
   * Initialize game world
   */
  async initialize(seedPhrase: string): Promise<void> {
    // TODO: Wire to actual game systems
    // For now, basic initialization
    
    this.state.initialized = true;
    this.state.seedPhrase = seedPhrase;
    
    this.emit('initialized', { gameId: this.gameId, seedPhrase });
  }
  
  /**
   * Advance day/night cycle
   */
  async advanceCycle(): Promise<void> {
    if (!this.state.initialized) {
      throw new Error('Game not initialized');
    }
    
    // Advance phase
    const phases: Array<'dawn' | 'day' | 'dusk' | 'night'> = ['dawn', 'day', 'dusk', 'night'];
    const currentIndex = phases.indexOf(this.state.currentPhase);
    const nextPhase = phases[(currentIndex + 1) % phases.length];
    
    this.state.currentPhase = nextPhase;
    
    // If back to dawn, increment cycle
    if (nextPhase === 'dawn') {
      this.state.currentCycle++;
    }
    
    // TODO: Process phase events
    
    this.emit('cycle', {
      generation: this.state.currentGeneration,
      cycle: this.state.currentCycle,
      phase: nextPhase,
    });
  }
  
  /**
   * Advance generation
   */
  async advanceGeneration(): Promise<void> {
    if (!this.state.initialized) {
      throw new Error('Game not initialized');
    }
    
    this.state.currentGeneration++;
    this.state.currentCycle = 0;
    this.state.currentPhase = 'dawn';
    
    // TODO: Process generation events
    
    this.emit('generation', {
      generation: this.state.currentGeneration,
    });
  }
  
  /**
   * Execute game command
   */
  async executeCommand(command: string, args: any[]): Promise<any> {
    if (!this.state.initialized) {
      throw new Error('Game not initialized');
    }
    
    // TODO: Implement command system
    
    switch (command) {
      case 'status':
        return this.getState();
      
      case 'dig':
        // TODO: Implement dig command
        return { success: true, message: 'Dig command not yet implemented' };
      
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }
  
  /**
   * Get current game state
   */
  getState(): Readonly<GameState> {
    return { ...this.state };
  }
  
  /**
   * Get recent events
   */
  getRecentEvents(count: number): GameEvent[] {
    return this.state.events.slice(-count);
  }
  
  /**
   * Serialize state for save/load
   */
  serialize(): string {
    return JSON.stringify(this.state);
  }
  
  /**
   * Deserialize state
   */
  static deserialize(gameId: string, data: string): GameEngine {
    const engine = new GameEngine(gameId);
    engine.state = JSON.parse(data);
    return engine;
  }
}
