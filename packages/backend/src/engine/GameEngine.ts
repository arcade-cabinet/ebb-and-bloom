/**
 * GAME ENGINE - Integrates Gen0-Gen6 with Seed API
 * 
 * Properly chains seeds through generations using seed API
 */

import { EventEmitter } from 'events';
import { AccretionSimulation } from '../gen0/AccretionSimulation.js';
import { Gen1System } from '../gen1/CreatureSystem.js';
import { Gen2System } from '../gen2/PackSystem.js';
import { Gen3System } from '../gen3/ToolSystem.js';
import { Gen4System } from '../gen4/TribeSystem.js';
import { Gen5System } from '../gen5/BuildingSystem.js';
import { Gen6System } from '../gen6/ReligionDemocracySystem.js';
import type { Planet } from '../schemas/index.js';
import { getGenerationSeed, validateSeed } from '../seed/seed-manager.js';

export interface GameState {
  gameId: string;
  seed: string;
  generation: number;
  planet?: Planet;
  gen0Data?: any;
  gen1Data?: any;
  gen2Data?: any;
  gen3Data?: any;
  gen4Data?: any;
  gen5Data?: any;
  gen6Data?: any;
  message: string;
}

export class GameEngine extends EventEmitter {
  private state: GameState;
  private planet?: Planet;

  constructor(gameId: string) {
    super();
    this.state = {
      gameId,
      seed: '',
      generation: 0,
      message: 'Game not initialized',
    };
  }

  /**
   * Initialize game with validated seed
   */
  async initialize(seed: string): Promise<void> {
    // Validate seed format
    const validation = validateSeed(seed);
    if (!validation.valid) {
      throw new Error(`Invalid seed: ${validation.error}`);
    }

    this.state.seed = validation.seed!;
    this.state.message = `Game initialized with seed: ${this.state.seed}`;

    // Initialize Gen0 (Planetary Formation)
    await this.initializeGen0();

    this.emit('initialized', { gameId: this.state.gameId, seed: this.state.seed });
  }

  /**
   * Initialize Gen0: Planetary Formation
   */
  private async initializeGen0(): Promise<void> {
    const gen0Seed = getGenerationSeed(this.state.seed, 0);
    console.log(`[GAME] Initializing Gen0 with seed: ${gen0Seed}`);

    const simulation = new AccretionSimulation({ seed: gen0Seed });
    const planet = await simulation.simulate();

    // Store planet with moons
    this.planet = planet;
    this.state.planet = planet as any; // Include moons in state
    this.state.gen0Data = planet.visualBlueprints;
    this.state.generation = 0;
    const moonCount = (planet as any).moons?.length || 0;
    this.state.message = `Gen0 complete: Planet formed (${(planet.radius / 1000).toFixed(0)}km radius, ${moonCount} moon${moonCount !== 1 ? 's' : ''})`;

    this.emit('gen0', { planet, gen0Data: this.state.gen0Data });
  }

  /**
   * Advance to next generation
   */
  async advanceGeneration(): Promise<void> {
    if (this.state.generation >= 6) {
      this.state.message = 'Already at maximum generation (Gen6)';
      return;
    }

    const nextGen = this.state.generation + 1;
    const genSeed = getGenerationSeed(this.state.seed, nextGen);

    console.log(`[GAME] Advancing to Gen${nextGen} with seed: ${genSeed}`);

    switch (nextGen) {
      case 1:
        await this.initializeGen1();
        break;
      case 2:
        await this.initializeGen2();
        break;
      case 3:
        await this.initializeGen3();
        break;
      case 4:
        await this.initializeGen4();
        break;
      case 5:
        await this.initializeGen5();
        break;
      case 6:
        await this.initializeGen6();
        break;
    }

    this.state.generation = nextGen;
    this.emit('generation', { generation: nextGen });
  }

  /**
   * Initialize Gen1: Creatures
   */
  private async initializeGen1(): Promise<void> {
    if (!this.state.planet) {
      throw new Error('Gen0 must be initialized before Gen1');
    }

    const gen1Seed = getGenerationSeed(this.state.seed, 1);
    const gen1System = new Gen1System({
      seed: gen1Seed,
      planet: this.state.planet,
      creatureCount: 20,
      gen0Data: this.state.gen0Data,
    });

    const creatures = await gen1System.initialize();
    this.state.gen1Data = creatures.visualBlueprints;
    this.state.message = `Gen1 complete: ${creatures.size} creatures spawned`;

    this.emit('gen1', { creatures, gen1Data: this.state.gen1Data });
  }

  /**
   * Initialize Gen2: Packs
   */
  private async initializeGen2(): Promise<void> {
    if (!this.state.gen1Data) {
      throw new Error('Gen1 must be initialized before Gen2');
    }

    const gen2Seed = getGenerationSeed(this.state.seed, 2);
    const gen2System = new Gen2System({
      seed: gen2Seed,
      gen1Data: this.state.gen1Data,
    });

    await gen2System.initialize();
    this.state.gen2Data = { initialized: true };
    this.state.message = 'Gen2 complete: Pack system initialized';

    this.emit('gen2', { gen2Data: this.state.gen2Data });
  }

  /**
   * Initialize Gen3: Tools
   */
  private async initializeGen3(): Promise<void> {
    if (!this.state.planet || !this.state.gen2Data) {
      throw new Error('Gen0 and Gen2 must be initialized before Gen3');
    }

    const gen3Seed = getGenerationSeed(this.state.seed, 3);
    const gen3System = new Gen3System(this.state.planet, gen3Seed);

    // Pass base seed to Gen3 (it will extract from planet.seed)
    await gen3System.initialize(this.state.gen2Data);
    this.state.gen3Data = { initialized: true };
    this.state.message = 'Gen3 complete: Tool system initialized';

    this.emit('gen3', { gen3Data: this.state.gen3Data });
  }

  /**
   * Initialize Gen4: Tribes
   */
  private async initializeGen4(): Promise<void> {
    if (!this.state.planet || !this.state.gen3Data) {
      throw new Error('Gen0 and Gen3 must be initialized before Gen4');
    }

    const gen4Seed = getGenerationSeed(this.state.seed, 4);
    const gen4System = new Gen4System(this.state.planet, gen4Seed);

    await gen4System.initialize(this.state.gen3Data);
    this.state.gen4Data = { initialized: true };
    this.state.message = 'Gen4 complete: Tribe system initialized';

    this.emit('gen4', { gen4Data: this.state.gen4Data });
  }

  /**
   * Initialize Gen5: Buildings
   */
  private async initializeGen5(): Promise<void> {
    if (!this.state.planet || !this.state.gen4Data) {
      throw new Error('Gen0 and Gen4 must be initialized before Gen5');
    }

    const gen5Seed = getGenerationSeed(this.state.seed, 5);
    const gen5System = new Gen5System(this.state.planet, gen5Seed);

    await gen5System.initialize(this.state.gen4Data);
    this.state.gen5Data = { initialized: true };
    this.state.message = 'Gen5 complete: Building system initialized';

    this.emit('gen5', { gen5Data: this.state.gen5Data });
  }

  /**
   * Initialize Gen6: Religion & Democracy
   */
  private async initializeGen6(): Promise<void> {
    if (!this.state.planet || !this.state.gen5Data) {
      throw new Error('Gen0 and Gen5 must be initialized before Gen6');
    }

    const gen6Seed = getGenerationSeed(this.state.seed, 6);
    const gen6System = new Gen6System(this.state.planet, gen6Seed);

    await gen6System.initialize(this.state.gen5Data);
    this.state.gen6Data = { initialized: true };
    this.state.message = 'Gen6 complete: Religion & Democracy system initialized';

    this.emit('gen6', { gen6Data: this.state.gen6Data });
  }

  getState(): Readonly<GameState> {
    return { ...this.state };
  }

  getPlanet(): Planet | undefined {
    return this.planet;
  }

  getSeed(): string {
    return this.state.seed;
  }

  getGenerationSeed(generation: number): string {
    return getGenerationSeed(this.state.seed, generation);
  }
}
