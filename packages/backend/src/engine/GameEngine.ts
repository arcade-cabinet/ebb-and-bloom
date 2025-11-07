/**
 * SIMPLEST POSSIBLE GAME ENGINE
 * 
 * Prove the backend works with minimal functionality:
 * 1. Create game
 * 2. Store state
 * 3. Return state
 * 
 * That's IT. Nothing else.
 */

import { EventEmitter } from 'events';

export interface SimpleGameState {
  gameId: string;
  seedPhrase: string;
  generation: number;
  message: string;
}

export class GameEngine extends EventEmitter {
  private state: SimpleGameState;
  
  constructor(gameId: string) {
    super();
    this.state = {
      gameId,
      seedPhrase: '',
      generation: 0,
      message: 'Game not initialized',
    };
  }
  
  async initialize(seedPhrase: string): Promise<void> {
    this.state.seedPhrase = seedPhrase;
    this.state.message = `Game created with seed: ${seedPhrase}`;
    this.emit('initialized', { gameId: this.state.gameId, seedPhrase });
  }
  
  async advanceGeneration(): Promise<void> {
    this.state.generation++;
    this.state.message = `Advanced to generation ${this.state.generation}`;
    this.emit('generation', { generation: this.state.generation });
  }
  
  getState(): Readonly<SimpleGameState> {
    return { ...this.state };
  }
}
