/**
 * GAME STATE MANAGER
 * 
 * Daggerfall Unity approach: Event-driven state machine
 * Our enhancement: Law-based state transitions
 * 
 * States:
 * - SETUP: Initial loading
 * - MENU: Title screen, character creation
 * - LOADING: World generation from seed
 * - PLAYING: Active gameplay
 * - PAUSED: Game paused
 * - INVENTORY: Inventory UI
 * - DIALOGUE: Talking to NPC
 */

export enum GameState {
  SETUP = 'setup',
  MENU = 'menu',
  LOADING = 'loading',
  PLAYING = 'playing',
  PAUSED = 'paused',
  INVENTORY = 'inventory',
  DIALOGUE = 'dialogue',
  DEATH = 'death'
}

export type StateChangeHandler = (newState: GameState, oldState: GameState) => void;

export class GameStateManager {
  private currentState: GameState = GameState.SETUP;
  private previousState: GameState = GameState.SETUP;
  private handlers: Map<GameState, StateChangeHandler[]> = new Map();
  
  constructor() {
    console.log('[GameStateManager] Initialized - Following Daggerfall Unity pattern');
  }
  
  /**
   * Get current state
   */
  getCurrentState(): GameState {
    return this.currentState;
  }
  
  /**
   * Get previous state
   */
  getPreviousState(): GameState {
    return this.previousState;
  }
  
  /**
   * Change to new state (Daggerfall Unity pattern)
   */
  changeState(newState: GameState): void {
    if (newState === this.currentState) {
      return; // No change
    }
    
    console.log(`[GameStateManager] State change: ${this.currentState} → ${newState}`);
    
    const oldState = this.currentState;
    this.previousState = oldState;
    this.currentState = newState;
    
    // Trigger handlers for this state
    this.triggerHandlers(newState, oldState);
  }
  
  /**
   * Register handler for state changes (Daggerfall event system)
   */
  onStateChange(state: GameState, handler: StateChangeHandler): void {
    if (!this.handlers.has(state)) {
      this.handlers.set(state, []);
    }
    this.handlers.get(state)!.push(handler);
  }
  
  /**
   * Trigger all handlers for a state
   */
  private triggerHandlers(newState: GameState, oldState: GameState): void {
    const handlers = this.handlers.get(newState);
    if (handlers) {
      for (const handler of handlers) {
        handler(newState, oldState);
      }
    }
  }
  
  /**
   * Check if game is actively playing
   */
  isPlaying(): boolean {
    return this.currentState === GameState.PLAYING;
  }
  
  /**
   * Check if UI is blocking gameplay
   */
  isUIBlocking(): boolean {
    return this.currentState === GameState.INVENTORY ||
           this.currentState === GameState.DIALOGUE ||
           this.currentState === GameState.PAUSED;
  }
}


