/**
 * Game Engine Backend (LAW-BASED ARCHITECTURE)
 *
 * Generates complete universes from LAWS - no more Gen0-6 systems!
 * Everything emerges from physics, biology, ecology, and social laws.
 */

import { EventEmitter } from '../utils/EventEmitter.js';
import { generateGameData } from '../gen-systems/loadGenData.js';
import { validateSeed } from '../seed/seed-manager.js';

export interface GameState {
  gameId: string;
  seed: string;
  generation: number;
  message: string;
  universe?: any;
  planet?: any;
  ecology?: any;
  creatures?: any[];
  resources?: any[];
  populationDynamics?: any;
  // Legacy gen data (for backward compat with old GameScene)
  gen0Data?: any;
  gen1Data?: any;
  gen2Data?: any;
  gen3Data?: any;
}

export class GameEngine extends EventEmitter {
  private state: GameState;
  private seed: string;
  private universe: any;
  private planet: any;
  private creatures: Map<string, any>;

  constructor(config: { seed: string; useAI?: boolean }) {
    super();

    // Validate seed
    const validation = validateSeed(config.seed);
    if (!validation.valid) {
      throw new Error(`Invalid seed: ${validation.error}`);
    }

    this.seed = validation.seed!;
    this.creatures = new Map();

    this.state = {
      gameId: `game-${this.seed}`,
      seed: this.seed,
      generation: 0,
      message: 'Initialized',
    };
  }

  /**
   * Initialize game - generate complete universe from laws
   */
  async initialize(): Promise<void> {
    console.log('[GameEngine] Generating law-based universe...');
    const gameData = await generateGameData(this.seed);

    this.universe = gameData.universe;
    this.planet = gameData.planet;

    // Update state
    this.state.universe = gameData.universe;
    this.state.planet = gameData.planet;
    this.state.ecology = gameData.ecology;
    this.state.creatures = gameData.creatures;
    this.state.resources = gameData.resources;
    this.state.populationDynamics = gameData.populationDynamics;

    // Store creatures
    gameData.creatures.forEach((creature: any) => {
      this.creatures.set(creature.id, creature);
    });

    this.state.generation = 1;
    this.state.message = `Universe generated: ${gameData.creatures.length} species, ${gameData.resources.length} resources`;

    console.log(`[GameEngine] Universe complete:`);
    console.log(
      `  Star: ${this.universe.star.spectralType} (${this.universe.star.mass.toFixed(2)} M☉)`
    );
    console.log(`  Planets: ${this.universe.planets.length}`);
    console.log(
      `  Habitable: ${this.planet.name} (${(this.planet.surfaceTemperature - 273).toFixed(1)}°C)`
    );
    console.log(`  Species: ${gameData.creatures.length}`);
    console.log(
      `  Population equilibrium: ${gameData.populationDynamics?.equilibria?.prey ?? 'N/A'} prey, ${gameData.populationDynamics?.equilibria?.predator ?? 'N/A'} predators`
    );

    this.emit('initialized', this.state);
  }

  /**
   * Get current game state
   */
  getState(): GameState {
    return { ...this.state };
  }

  /**
   * Get universe data for rendering
   */
  getUniverse() {
    return this.universe;
  }

  /**
   * Get planet data for rendering
   */
  getPlanet() {
    return this.planet;
  }

  /**
   * Get creatures
   */
  getCreatures() {
    return Array.from(this.creatures.values());
  }

  /**
   * Update game (placeholder for future time simulation)
   */
  update(deltaTime: number): void {
    // TODO: Update populations, evolve creatures, advance time
    this.emit('update', { deltaTime });
  }
}
