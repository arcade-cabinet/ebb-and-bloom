#!/usr/bin/env tsx
/**
 * COMPREHENSIVE GAME CLI - Full End-to-End Viability Proof
 * 
 * This is THE complete game simulation that proves Ebb & Bloom works
 * at a mathematical level before any 3D rendering is added.
 * 
 * TWO MODES:
 * 
 * 1. NON-BLOCKING (Human Interactive):
 *    - Holds session open
 *    - Reports each day/night cycle
 *    - Shows new events and spawn coordinates
 *    - Human can interact during simulation
 * 
 * 2. BLOCKING (Programmatic/Testing):
 *    - Fast-forward/rewind generations
 *    - Force specific events for debugging
 *    - Auto-run to completion
 *    - JSON output for testing
 * 
 * FULL GAME SYSTEMS:
 * - Planetary generation (Gen 0)
 * - Material accessibility
 * - Creature evolution
 * - Tool emergence
 * - Pack formation
 * - Tribal dynamics
 * - Building construction
 * - Combat events
 * - World score tracking
 * - Ending detection
 * 
 * This proves the ENTIRE game loop works before adding rendering.
 */

import * as readline from 'readline';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { generateMockGen0 } from './MockGen0Data';
import { usePlanetaryStructure } from '../stores/PlanetaryStructureStore';
import { useCreatureEvolution } from '../stores/CreatureEvolutionStore';
import type { CreatureTraits } from '../stores/CreatureEvolutionStore';
import type { GenerationZeroOutput } from '../core/generation-zero-types';
import seedrandom from 'seedrandom';

/**
 * Day/Night cycle phases
 */
type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

/**
 * Game event types
 */
interface GameEvent {
  generation: number;
  cycle: number;
  timeOfDay: TimeOfDay;
  type: 'discovery' | 'evolution' | 'tool_emerged' | 'pack_formed' | 'tribe_formed' | 'building_constructed' | 'combat' | 'extinction' | 'ending';
  description: string;
  coordinates?: { x: number; y: number; z: number };
  participants?: string[];
  data?: any;
}

/**
 * Pack entity (social creatures grouping)
 */
interface Pack {
  id: string;
  leaderId: string;
  memberIds: string[];
  territoryCenter: { x: number; y: number; z: number };
  territoryRadius: number;
  founded: number;
  cohesion: number;
}

/**
 * Tribe entity (evolved packs with buildings)
 */
interface Tribe {
  id: string;
  name: string;
  packIds: string[];
  population: number;
  buildings: Building[];
  territoryCenter: { x: number; y: number; z: number };
  founded: number;
  culture: 'peaceful' | 'aggressive' | 'neutral';
}

/**
 * Building entity
 */
interface Building {
  id: string;
  type: 'shelter' | 'workshop' | 'storage' | 'temple';
  location: { x: number; y: number; z: number };
  tribeId: string;
  constructed: number;
  health: number;
}

/**
 * World score metrics (determines ending)
 */
interface WorldScore {
  violence: number;        // Combat events, extinctions
  harmony: number;         // Alliances, coexistence
  exploitation: number;    // Resource depletion
  innovation: number;      // Tools, buildings, discoveries
  speed: number;          // Generations to milestones
}

/**
 * Game endings
 */
type EndingType = 'mutualism' | 'parasitism' | 'domination' | 'transcendence' | null;

/**
 * Complete game state
 */
interface GameState {
  // Core
  initialized: boolean;
  seedPhrase: string;
  planet: GenerationZeroOutput | null;
  
  // Time
  currentGeneration: number;
  currentCycle: number;      // Day/night cycles within generation
  currentPhase: TimeOfDay;
  
  // Entities
  packs: Map<string, Pack>;
  tribes: Map<string, Tribe>;
  buildings: Map<string, Building>;
  
  // History
  events: GameEvent[];
  discoveries: Set<string>;
  extinctions: Set<string>;
  
  // World score
  score: WorldScore;
  ending: EndingType;
  
  // Player (for interactive mode)
  playerPosition: { x: number; y: number; z: number };
  inventory: Map<string, number>;
  toolHardness: number;
}

/**
 * CLI Mode
 */
type CLIMode = 'interactive' | 'blocking';

/**
 * Comprehensive Game CLI
 */
class ComprehensiveGameCLI {
  private state: GameState;
  private mode: CLIMode;
  private rl: readline.Interface | null = null;
  private running: boolean = false;
  private autoAdvance: boolean = false;
  private targetGeneration: number = 0;
  
  constructor(mode: CLIMode = 'interactive') {
    this.mode = mode;
    this.state = this.createInitialState();
  }
  
  /**
   * Create initial game state
   */
  private createInitialState(): GameState {
    return {
      initialized: false,
      seedPhrase: '',
      planet: null,
      currentGeneration: 0,
      currentCycle: 0,
      currentPhase: 'dawn',
      packs: new Map(),
      tribes: new Map(),
      buildings: new Map(),
      events: [],
      discoveries: new Set(),
      extinctions: new Set(),
      score: {
        violence: 0,
        harmony: 0,
        exploitation: 0,
        innovation: 0,
        speed: 0,
      },
      ending: null,
      playerPosition: { x: 0, y: 0, z: 0 },
      inventory: new Map(),
      toolHardness: 0,
    };
  }
  
  /**
   * Start CLI
   */
  async start() {
    if (this.mode === 'interactive') {
      await this.startInteractiveMode();
    } else {
      await this.startBlockingMode();
    }
  }
  
  /**
   * Interactive mode (human player)
   */
  private async startInteractiveMode() {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║  EBB & BLOOM - Comprehensive Game Simulation      ║');
    console.log('║  INTERACTIVE MODE (Non-Blocking)                  ║');
    console.log('╚════════════════════════════════════════════════════╝\n');
    console.log('Type "help" for commands\n');
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'ebb> ',
    });
    
    this.rl.prompt();
    
    this.rl.on('line', async (input) => {
      await this.processCommand(input.trim());
      if (this.rl) this.rl.prompt();
    });
    
    this.rl.on('close', () => {
      console.log('\n🎮 Game session ended.');
      process.exit(0);
    });
  }
  
  /**
   * Blocking mode (programmatic control)
   */
  private async startBlockingMode() {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║  EBB & BLOOM - Comprehensive Game Simulation      ║');
    console.log('║  BLOCKING MODE (Programmatic)                     ║');
    console.log('╚════════════════════════════════════════════════════╝\n');
    
    // Blocking mode is controlled via API calls
    return this;
  }
  
  /**
   * Process command (interactive mode)
   */
  private async processCommand(input: string) {
    const [cmd, ...args] = input.split(' ');
    
    switch (cmd.toLowerCase()) {
      case 'init':
      case 'planet':
        await this.cmdInitialize(args[0] || 'default-world');
        break;
      case 'cycle':
        await this.cmdAdvanceCycle();
        break;
      case 'generation':
      case 'gen':
        await this.cmdAdvanceGeneration();
        break;
      case 'auto':
        await this.cmdAutoAdvance(parseInt(args[0]) || 10);
        break;
      case 'status':
        this.cmdStatus();
        break;
      case 'creatures':
        this.cmdCreatures();
        break;
      case 'packs':
        this.cmdPacks();
        break;
      case 'tribes':
        this.cmdTribes();
        break;
      case 'buildings':
        this.cmdBuildings();
        break;
      case 'events':
        this.cmdEvents(parseInt(args[0]) || 10);
        break;
      case 'score':
        this.cmdScore();
        break;
      case 'ending':
        this.cmdCheckEnding();
        break;
      case 'export':
        await this.cmdExport(args[0] || 'game-state.json');
        break;
      case 'help':
        this.cmdHelp();
        break;
      case 'quit':
      case 'exit':
        if (this.rl) this.rl.close();
        break;
      case '':
        break;
      default:
        console.log(`Unknown command: ${cmd}. Type "help" for commands.`);
    }
  }
  
  /**
   * Initialize game world
   */
  private async cmdInitialize(seedPhrase: string) {
    console.log(`\n🌍 Initializing world: "${seedPhrase}"\n`);
    
    const startTime = Date.now();
    
    // Generate planet
    const planet = generateMockGen0(seedPhrase);
    usePlanetaryStructure.getState().initialize(planet.planetary);
    
    // Initialize creatures
    useCreatureEvolution.getState().initializeCreatures(seedPhrase, 8);
    
    // Set state
    this.state.initialized = true;
    this.state.seedPhrase = seedPhrase;
    this.state.planet = planet;
    this.state.currentGeneration = 0;
    this.state.currentCycle = 0;
    this.state.currentPhase = 'dawn';
    
    const elapsed = Date.now() - startTime;
    
    console.log(`✅ World initialized in ${elapsed}ms\n`);
    console.log(`Planet: ${planet.planetary.planetaryName}`);
    console.log(`Theme: ${planet.planetary.worldTheme}`);
    console.log(`Core: ${planet.planetary.cores[0].name}`);
    console.log(`Materials: ${planet.planetary.sharedMaterials.length}`);
    console.log(`Creatures: ${useCreatureEvolution.getState().creatures.size}`);
    console.log(`\n🌅 Dawn of Generation 0, Cycle 0`);
    console.log(`Type "cycle" to advance time, "help" for more commands`);
  }
  
  /**
   * Advance one day/night cycle
   */
  private async cmdAdvanceCycle() {
    if (!this.state.initialized) {
      console.log('❌ No world initialized. Use "init <seed>" first.');
      return;
    }
    
    // Advance phase
    const phases: TimeOfDay[] = ['dawn', 'day', 'dusk', 'night'];
    const currentIndex = phases.indexOf(this.state.currentPhase);
    const nextPhase = phases[(currentIndex + 1) % phases.length];
    
    this.state.currentPhase = nextPhase;
    
    // If back to dawn, increment cycle
    if (nextPhase === 'dawn') {
      this.state.currentCycle++;
    }
    
    console.log(`\n⏰ ${this.getPhaseEmoji(nextPhase)} ${nextPhase.toUpperCase()} - Generation ${this.state.currentGeneration}, Cycle ${this.state.currentCycle}\n`);
    
    // Process events for this phase
    await this.processPhaseEvents(nextPhase);
  }
  
  /**
   * Advance one generation
   */
  private async cmdAdvanceGeneration() {
    if (!this.state.initialized) {
      console.log('❌ No world initialized.');
      return;
    }
    
    console.log(`\n⏭️  ADVANCING TO GENERATION ${this.state.currentGeneration + 1}\n`);
    
    // Advance creature evolution
    useCreatureEvolution.getState().advanceGeneration();
    
    // Reset cycle
    this.state.currentGeneration++;
    this.state.currentCycle = 0;
    this.state.currentPhase = 'dawn';
    
    // Check for major events
    await this.checkGenerationEvents();
    
    console.log(`\n🌅 Dawn of Generation ${this.state.currentGeneration}, Cycle 0`);
  }
  
  /**
   * Auto-advance to target generation
   */
  private async cmdAutoAdvance(targetGen: number) {
    if (!this.state.initialized) {
      console.log('❌ No world initialized.');
      return;
    }
    
    console.log(`\n⚡ Auto-advancing to Generation ${targetGen}...\n`);
    
    this.autoAdvance = true;
    this.targetGeneration = targetGen;
    
    while (this.state.currentGeneration < targetGen && this.autoAdvance) {
      await this.cmdAdvanceGeneration();
      
      // Brief pause to allow interrupt
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.autoAdvance = false;
    console.log(`\n✅ Reached Generation ${this.state.currentGeneration}`);
  }
  
  /**
   * Process events for current phase
   */
  private async processPhaseEvents(phase: TimeOfDay) {
    const creatureState = useCreatureEvolution.getState();
    const rng = seedrandom(`${this.state.seedPhrase}-${this.state.currentGeneration}-${this.state.currentCycle}-${phase}`);
    
    // Dawn: Creature spawning and movement
    if (phase === 'dawn') {
      const creatures = Array.from(creatureState.creatures.values());
      
      // Check for new pack formation
      const socialCreatures = creatures.filter(c => c.traits.social > 0.6);
      if (socialCreatures.length >= 3 && rng() > 0.7) {
        await this.formPack(socialCreatures.slice(0, 3 + Math.floor(rng() * 3)));
      }
    }
    
    // Day: Resource gathering and tool use
    if (phase === 'day') {
      // Creatures explore and discover materials
      if (rng() > 0.5) {
        const x = Math.floor(rng() * 100 - 50);
        const z = Math.floor(rng() * 100 - 50);
        const depth = Math.floor(rng() * 30);
        
        const material = usePlanetaryStructure.getState().getMaterialAt(x, -depth, z);
        if (material && !this.state.discoveries.has(material.name)) {
          this.state.discoveries.add(material.name);
          this.addEvent({
            type: 'discovery',
            description: `Discovered ${material.name} at depth ${depth}m`,
            coordinates: { x, y: -depth, z },
          });
          this.state.score.innovation += 0.1;
          console.log(`  🔍 DISCOVERY: ${material.name} at (${x}, ${-depth}, ${z})`);
        }
      }
    }
    
    // Dusk: Social interactions and tribal formation
    if (phase === 'dusk') {
      // Check if packs should merge into tribes
      if (this.state.packs.size >= 2 && rng() > 0.8) {
        await this.formTribe();
      }
    }
    
    // Night: Rest and building construction
    if (phase === 'night') {
      // Tribes may construct buildings
      if (this.state.tribes.size > 0 && rng() > 0.7) {
        await this.constructBuilding();
      }
    }
  }
  
  /**
   * Check for generation-level events
   */
  private async checkGenerationEvents() {
    const creatureState = useCreatureEvolution.getState();
    
    // Check for extinctions
    const previousCreatures = this.state.events
      .filter(e => e.type === 'evolution' && e.generation === this.state.currentGeneration - 1)
      .flatMap(e => e.participants || []);
    
    const currentCreatures = Array.from(creatureState.creatures.keys());
    
    previousCreatures.forEach(id => {
      if (!currentCreatures.includes(id)) {
        this.state.extinctions.add(id);
        this.addEvent({
          type: 'extinction',
          description: `Creature ${id} went extinct`,
          participants: [id],
        });
        this.state.score.violence += 0.2;
        console.log(`  ☠️  EXTINCTION: ${id}`);
      }
    });
    
    // Check for tool emergence
    if (creatureState.availableTools.length > this.state.events.filter(e => e.type === 'tool_emerged').length) {
      const newTools = creatureState.availableTools.filter(t => t.emergedGeneration === this.state.currentGeneration);
      newTools.forEach(tool => {
        this.addEvent({
          type: 'tool_emerged',
          description: `Tool emerged: ${tool.type} (hardness: ${tool.hardness})`,
          data: tool,
        });
        this.state.score.innovation += 0.5;
        console.log(`  🔧 TOOL EMERGED: ${tool.type} (hardness: ${tool.hardness})`);
      });
    }
    
    // Update speed score
    this.state.score.speed = 1 / (this.state.currentGeneration + 1);
  }
  
  /**
   * Form a pack
   */
  private async formPack(creatures: any[]) {
    const packId = `pack-${this.state.packs.size}`;
    const rng = seedrandom(`${packId}-${this.state.currentGeneration}`);
    
    const pack: Pack = {
      id: packId,
      leaderId: creatures[0].id,
      memberIds: creatures.map(c => c.id),
      territoryCenter: {
        x: Math.floor(rng() * 100 - 50),
        y: 0,
        z: Math.floor(rng() * 100 - 50),
      },
      territoryRadius: 20 + Math.floor(rng() * 30),
      founded: this.state.currentGeneration,
      cohesion: creatures.reduce((sum, c) => sum + c.traits.social, 0) / creatures.length,
    };
    
    this.state.packs.set(packId, pack);
    
    this.addEvent({
      type: 'pack_formed',
      description: `Pack ${packId} formed with ${creatures.length} members`,
      coordinates: pack.territoryCenter,
      participants: pack.memberIds,
    });
    
    this.state.score.harmony += 0.3;
    
    console.log(`  🐾 PACK FORMED: ${packId} at (${pack.territoryCenter.x}, ${pack.territoryCenter.y}, ${pack.territoryCenter.z})`);
    console.log(`     Members: ${pack.memberIds.join(', ')}`);
  }
  
  /**
   * Form a tribe from packs
   */
  private async formTribe() {
    const packs = Array.from(this.state.packs.values()).slice(0, 2);
    if (packs.length < 2) return;
    
    const tribeId = `tribe-${this.state.tribes.size}`;
    const rng = seedrandom(`${tribeId}-${this.state.currentGeneration}`);
    
    const cultures: ('peaceful' | 'aggressive' | 'neutral')[] = ['peaceful', 'aggressive', 'neutral'];
    
    const tribe: Tribe = {
      id: tribeId,
      name: `Tribe ${tribeId.split('-')[1]}`,
      packIds: packs.map(p => p.id),
      population: packs.reduce((sum, p) => sum + p.memberIds.length, 0),
      buildings: [],
      territoryCenter: packs[0].territoryCenter,
      founded: this.state.currentGeneration,
      culture: cultures[Math.floor(rng() * cultures.length)],
    };
    
    this.state.tribes.set(tribeId, tribe);
    
    this.addEvent({
      type: 'tribe_formed',
      description: `${tribe.name} formed from ${packs.length} packs (${tribe.culture})`,
      coordinates: tribe.territoryCenter,
      participants: tribe.packIds,
    });
    
    if (tribe.culture === 'peaceful') {
      this.state.score.harmony += 0.5;
    } else if (tribe.culture === 'aggressive') {
      this.state.score.violence += 0.3;
    }
    
    console.log(`  🏛️  TRIBE FORMED: ${tribe.name} (${tribe.culture})`);
    console.log(`     Population: ${tribe.population}`);
  }
  
  /**
   * Construct building
   */
  private async constructBuilding() {
    const tribes = Array.from(this.state.tribes.values());
    if (tribes.length === 0) return;
    
    const tribe = tribes[Math.floor(Math.random() * tribes.length)];
    const buildingTypes: Building['type'][] = ['shelter', 'workshop', 'storage', 'temple'];
    const rng = seedrandom(`${tribe.id}-building-${tribe.buildings.length}`);
    
    const buildingId = `${tribe.id}-building-${tribe.buildings.length}`;
    const building: Building = {
      id: buildingId,
      type: buildingTypes[Math.floor(rng() * buildingTypes.length)],
      location: {
        x: tribe.territoryCenter.x + Math.floor(rng() * 20 - 10),
        y: 0,
        z: tribe.territoryCenter.z + Math.floor(rng() * 20 - 10),
      },
      tribeId: tribe.id,
      constructed: this.state.currentGeneration,
      health: 100,
    };
    
    tribe.buildings.push(building);
    this.state.buildings.set(buildingId, building);
    
    this.addEvent({
      type: 'building_constructed',
      description: `${tribe.name} constructed ${building.type}`,
      coordinates: building.location,
      participants: [tribe.id],
    });
    
    this.state.score.innovation += 0.4;
    
    console.log(`  🏗️  BUILDING: ${tribe.name} built ${building.type} at (${building.location.x}, ${building.location.y}, ${building.location.z})`);
  }
  
  /**
   * Add event to history
   */
  private addEvent(event: Omit<GameEvent, 'generation' | 'cycle' | 'timeOfDay'>) {
    this.state.events.push({
      ...event,
      generation: this.state.currentGeneration,
      cycle: this.state.currentCycle,
      timeOfDay: this.state.currentPhase,
    });
  }
  
  /**
   * Get phase emoji
   */
  private getPhaseEmoji(phase: TimeOfDay): string {
    switch (phase) {
      case 'dawn': return '🌅';
      case 'day': return '☀️';
      case 'dusk': return '🌇';
      case 'night': return '🌙';
    }
  }
  
  /**
   * Show status
   */
  private cmdStatus() {
    if (!this.state.initialized) {
      console.log('❌ No world initialized.');
      return;
    }
    
    console.log(`\n📊 WORLD STATUS\n`);
    console.log(`Planet: ${this.state.planet?.planetary.planetaryName}`);
    console.log(`Seed: ${this.state.seedPhrase}`);
    console.log(`Generation: ${this.state.currentGeneration}`);
    console.log(`Cycle: ${this.state.currentCycle} (${this.state.currentPhase})`);
    console.log(`\n🧬 Creatures: ${useCreatureEvolution.getState().creatures.size}`);
    console.log(`🐾 Packs: ${this.state.packs.size}`);
    console.log(`🏛️  Tribes: ${this.state.tribes.size}`);
    console.log(`🏗️  Buildings: ${this.state.buildings.size}`);
    console.log(`\n📈 Discoveries: ${this.state.discoveries.size}`);
    console.log(`☠️  Extinctions: ${this.state.extinctions.size}`);
    console.log(`📜 Events: ${this.state.events.length}`);
  }
  
  /**
   * Show creatures
   */
  private cmdCreatures() {
    const creatures = Array.from(useCreatureEvolution.getState().creatures.values());
    
    console.log(`\n🧬 CREATURES (${creatures.length})\n`);
    
    creatures.slice(0, 5).forEach(c => {
      console.log(`${c.id} (Gen ${c.generation})`);
      console.log(`  Taxonomy: ${c.taxonomy.class} / ${c.taxonomy.order}`);
      console.log(`  Tool use: ${c.canUseTool ? `✓ (hardness: ${c.toolHardness})` : '✗'}`);
      console.log(`  Key traits: manipulation=${(c.traits.manipulation * 100).toFixed(0)}%, social=${(c.traits.social * 100).toFixed(0)}%`);
      console.log();
    });
    
    if (creatures.length > 5) {
      console.log(`... and ${creatures.length - 5} more`);
    }
  }
  
  /**
   * Show packs
   */
  private cmdPacks() {
    console.log(`\n🐾 PACKS (${this.state.packs.size})\n`);
    
    this.state.packs.forEach(pack => {
      console.log(`${pack.id}`);
      console.log(`  Leader: ${pack.leaderId}`);
      console.log(`  Members: ${pack.memberIds.length}`);
      console.log(`  Territory: (${pack.territoryCenter.x}, ${pack.territoryCenter.y}, ${pack.territoryCenter.z}) radius ${pack.territoryRadius}m`);
      console.log(`  Cohesion: ${(pack.cohesion * 100).toFixed(0)}%`);
      console.log();
    });
  }
  
  /**
   * Show tribes
   */
  private cmdTribes() {
    console.log(`\n🏛️  TRIBES (${this.state.tribes.size})\n`);
    
    this.state.tribes.forEach(tribe => {
      console.log(`${tribe.name} (${tribe.culture})`);
      console.log(`  Packs: ${tribe.packIds.length}`);
      console.log(`  Population: ${tribe.population}`);
      console.log(`  Buildings: ${tribe.buildings.length}`);
      console.log(`  Territory: (${tribe.territoryCenter.x}, ${tribe.territoryCenter.y}, ${tribe.territoryCenter.z})`);
      console.log();
    });
  }
  
  /**
   * Show buildings
   */
  private cmdBuildings() {
    console.log(`\n🏗️  BUILDINGS (${this.state.buildings.size})\n`);
    
    this.state.buildings.forEach(building => {
      console.log(`${building.id}`);
      console.log(`  Type: ${building.type}`);
      console.log(`  Tribe: ${building.tribeId}`);
      console.log(`  Location: (${building.location.x}, ${building.location.y}, ${building.location.z})`);
      console.log(`  Health: ${building.health}%`);
      console.log();
    });
  }
  
  /**
   * Show recent events
   */
  private cmdEvents(count: number = 10) {
    const recentEvents = this.state.events.slice(-count);
    
    console.log(`\n📜 RECENT EVENTS (last ${count})\n`);
    
    recentEvents.forEach(event => {
      const icon = this.getEventIcon(event.type);
      console.log(`${icon} Gen ${event.generation}, Cycle ${event.cycle} (${event.timeOfDay}): ${event.description}`);
      if (event.coordinates) {
        console.log(`   Location: (${event.coordinates.x}, ${event.coordinates.y}, ${event.coordinates.z})`);
      }
    });
  }
  
  /**
   * Get event icon
   */
  private getEventIcon(type: GameEvent['type']): string {
    switch (type) {
      case 'discovery': return '🔍';
      case 'evolution': return '🧬';
      case 'tool_emerged': return '🔧';
      case 'pack_formed': return '🐾';
      case 'tribe_formed': return '🏛️';
      case 'building_constructed': return '🏗️';
      case 'combat': return '⚔️';
      case 'extinction': return '☠️';
      case 'ending': return '🏁';
      default: return '•';
    }
  }
  
  /**
   * Show world score
   */
  private cmdScore() {
    console.log(`\n📊 WORLD SCORE\n`);
    console.log(`Violence:     ${(this.state.score.violence * 100).toFixed(1)}%`);
    console.log(`Harmony:      ${(this.state.score.harmony * 100).toFixed(1)}%`);
    console.log(`Exploitation: ${(this.state.score.exploitation * 100).toFixed(1)}%`);
    console.log(`Innovation:   ${(this.state.score.innovation * 100).toFixed(1)}%`);
    console.log(`Speed:        ${(this.state.score.speed * 100).toFixed(1)}%`);
  }
  
  /**
   * Check for ending
   */
  private cmdCheckEnding() {
    const ending = this.detectEnding();
    
    if (ending) {
      console.log(`\n🏁 ENDING DETECTED: ${ending.toUpperCase()}\n`);
      console.log(this.getEndingDescription(ending));
      this.state.ending = ending;
      
      this.addEvent({
        type: 'ending',
        description: `World achieved ${ending} ending`,
        data: { ...this.state.score },
      });
    } else {
      console.log(`\n⏳ No ending yet. World still evolving...`);
    }
  }
  
  /**
   * Detect ending based on world score
   */
  private detectEnding(): EndingType {
    const { violence, harmony, exploitation, innovation } = this.state.score;
    
    // Mutualism: High harmony, low violence, balanced
    if (harmony > 2.0 && violence < 1.0 && exploitation < 1.5) {
      return 'mutualism';
    }
    
    // Parasitism: High exploitation, declining ecosystem
    if (exploitation > 3.0 && this.state.extinctions.size > 3) {
      return 'parasitism';
    }
    
    // Domination: One tribe supreme, high violence
    if (this.state.tribes.size === 1 && violence > 2.0 && this.state.buildings.size > 5) {
      return 'domination';
    }
    
    // Transcendence: High innovation, complex society
    if (innovation > 4.0 && this.state.buildings.size > 8 && this.state.tribes.size >= 2) {
      return 'transcendence';
    }
    
    return null;
  }
  
  /**
   * Get ending description
   */
  private getEndingDescription(ending: EndingType): string {
    switch (ending) {
      case 'mutualism':
        return '🌿 Your world achieved balance. Multiple tribes coexist peacefully,\nsharing resources and supporting each other. Life flourishes in diversity.';
      
      case 'parasitism':
        return '🦠 Your world consumed itself. Unsustainable exploitation led to\necosystem collapse. The strong devoured the weak until none remained.';
      
      case 'domination':
        return '👑 Your world bends to a singular will. One tribe eliminated all rivals\nand reshaped the planet in their image. Unity through conquest.';
      
      case 'transcendence':
        return '✨ Your world transcended its physical limits. Advanced societies\nbuilt wonders that will outlive the stone itself. Stories became legend.';
      
      default:
        return '';
    }
  }
  
  /**
   * Export game state
   */
  private async cmdExport(filename: string) {
    if (!this.state.initialized) {
      console.log('❌ No world initialized.');
      return;
    }
    
    const exportData = {
      metadata: {
        seedPhrase: this.state.seedPhrase,
        generation: this.state.currentGeneration,
        cycle: this.state.currentCycle,
        phase: this.state.currentPhase,
        exported: new Date().toISOString(),
      },
      world: {
        planet: this.state.planet?.planetary.planetaryName,
        core: this.state.planet?.planetary.cores[0].name,
      },
      creatures: Array.from(useCreatureEvolution.getState().creatures.values()),
      packs: Array.from(this.state.packs.values()),
      tribes: Array.from(this.state.tribes.values()),
      buildings: Array.from(this.state.buildings.values()),
      events: this.state.events,
      discoveries: Array.from(this.state.discoveries),
      extinctions: Array.from(this.state.extinctions),
      score: this.state.score,
      ending: this.state.ending,
    };
    
    const dir = './simulations';
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    
    const path = `${dir}/${filename}`;
    await writeFile(path, JSON.stringify(exportData, null, 2));
    
    console.log(`\n💾 Game state exported to ${path}`);
  }
  
  /**
   * Show help
   */
  private cmdHelp() {
    console.log(`
╔════════════════════════════════════════════════════╗
║                  COMMANDS                          ║
╚════════════════════════════════════════════════════╝

INITIALIZATION:
  init <seed>          Initialize world from seed phrase
  planet <seed>        Alias for init

TIME:
  cycle                Advance one day/night cycle
  gen                  Advance one generation
  auto <n>             Auto-advance to generation N

VIEW:
  status               Show world status
  creatures            Show all creatures
  packs                Show all packs
  tribes               Show all tribes
  buildings            Show all buildings
  events [n]           Show recent events (default: 10)
  score                Show world score metrics
  ending               Check for ending detection

MANAGEMENT:
  export [file]        Export game state to JSON
  help                 Show this help
  quit                 Exit game

EXAMPLE SESSION:
  init volcanic-world
  cycle                (advance through day/night)
  gen                  (advance generation)
  auto 10              (fast-forward to gen 10)
  tribes               (see tribal formations)
  ending               (check for ending)
  export my-game.json  (save state)
`);
  }
  
  /**
   * API: Initialize (blocking mode)
   */
  async initialize(seedPhrase: string): Promise<void> {
    await this.cmdInitialize(seedPhrase);
  }
  
  /**
   * API: Advance cycles (blocking mode)
   */
  async advanceCycles(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      await this.cmdAdvanceCycle();
    }
  }
  
  /**
   * API: Advance generations (blocking mode)
   */
  async advanceGenerations(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      await this.cmdAdvanceGeneration();
    }
  }
  
  /**
   * API: Get state (blocking mode)
   */
  getState(): Readonly<GameState> {
    return this.state;
  }
  
  /**
   * API: Force event (debugging)
   */
  async forceEvent(eventType: GameEvent['type']): Promise<void> {
    const creatureState = useCreatureEvolution.getState();
    const creatures = Array.from(creatureState.creatures.values());
    
    switch (eventType) {
      case 'pack_formed':
        if (creatures.length >= 3) {
          await this.formPack(creatures.slice(0, 3));
        }
        break;
      
      case 'tribe_formed':
        if (this.state.packs.size >= 2) {
          await this.formTribe();
        }
        break;
      
      case 'building_constructed':
        if (this.state.tribes.size > 0) {
          await this.constructBuilding();
        }
        break;
      
      case 'tool_emerged':
        creatureState.evaluateToolNeed();
        break;
    }
  }
  
  /**
   * API: Export to JSON (blocking mode)
   */
  async exportState(filename: string): Promise<string> {
    await this.cmdExport(filename);
    return `./simulations/${filename}`;
  }
}

/**
 * CLI Entry Point
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const mode = args.includes('--blocking') ? 'blocking' : 'interactive';
  
  const cli = new ComprehensiveGameCLI(mode);
  cli.start();
}

export { ComprehensiveGameCLI, type GameState, type GameEvent, type WorldScore, type EndingType };
