#!/usr/bin/env tsx
/**
 * Ebb & Bloom - Pure CLI Game
 * 
 * NO GRAPHICS. JUST MATH AND TABLES.
 * 
 * This is the REAL GAME - graphics are just visualization.
 * 
 * Commands:
 * - planet <seed>     : Generate planet
 * - dig <x> <y> <z>   : Dig at coordinates
 * - scan <depth>      : Scan depth range
 * - tools             : Show available tools
 * - status            : Show player status
 * - help              : Show commands
 * - quit              : Exit
 */

import * as readline from 'readline';
import { generateMockGen0 } from './MockGen0Data';
import type { GenerationZeroOutput } from '../core/generation-zero-types';
import seedrandom from 'seedrandom';
import { createNoise2D } from 'simplex-noise';
import { useCreatureEvolution } from '../stores/CreatureEvolutionStore';
import type { CreatureTraits } from '../stores/CreatureEvolutionStore';

/**
 * Game state
 */
interface GameState {
  // Planetary structure
  planet: GenerationZeroOutput | null;
  seedPhrase: string;
  
  // Lookup tables
  materialTable: Map<string, MaterialData>;
  layerTable: LayerData[];
  noise2D: ReturnType<typeof createNoise2D> | null;
  
  // Player state
  playerX: number;
  playerY: number;
  playerZ: number;
  toolHardness: number;
  inventory: Map<string, number>; // material name → quantity
  
  // Game progress
  generation: number;
  discoveredMaterials: Set<string>;
  deepestDig: number;
}

interface MaterialData {
  name: string;
  category: string;
  minDepth: number;
  maxDepth: number;
  optimalDepth: number;
  hardness: number;
  abundance: number;
}

interface LayerData {
  depth: number;
  thickness: number;
  materials: string[];
  permeability: number;
  temperature: number;
}

/**
 * CLI Game Engine
 */
class CLIGame {
  private state: GameState;
  private rl: readline.Interface;
  
  constructor() {
    this.state = {
      planet: null,
      seedPhrase: '',
      materialTable: new Map(),
      layerTable: [],
      noise2D: null,
      playerX: 0,
      playerY: 0,
      playerZ: 0,
      toolHardness: 0,
      inventory: new Map(),
      generation: 0,
      discoveredMaterials: new Set(),
      deepestDig: 0,
    };
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'ebb> ',
    });
  }
  
  /**
   * Start game
   */
  start() {
    console.log('\n╔═══════════════════════════════════════════╗');
    console.log('║        EBB & BLOOM - CLI Edition         ║');
    console.log('║  Pure Math & Tables. No Graphics Needed. ║');
    console.log('╚═══════════════════════════════════════════╝\n');
    console.log('Type "help" for commands\n');
    
    this.rl.prompt();
    
    this.rl.on('line', (input) => {
      this.processCommand(input.trim());
      this.rl.prompt();
    });
    
    this.rl.on('close', () => {
      console.log('\nGoodbye!');
      process.exit(0);
    });
  }
  
  /**
   * Process command
   */
  private processCommand(input: string) {
    const [cmd, ...args] = input.split(' ');
    
    switch (cmd.toLowerCase()) {
      case 'planet':
        this.cmdPlanet(args[0] || 'default-world');
        break;
      case 'dig':
        this.cmdDig(
          parseFloat(args[0]) || 0,
          parseFloat(args[1]) || 0,
          parseFloat(args[2]) || 0
        );
        break;
      case 'scan':
        this.cmdScan(parseFloat(args[0]) || 5);
        break;
      case 'tools':
        this.cmdTools();
        break;
      case 'status':
        this.cmdStatus();
        break;
      case 'layers':
        this.cmdLayers();
        break;
      case 'materials':
        this.cmdMaterials();
        break;
      case 'creatures':
        this.cmdCreatures();
        break;
      case 'evolve':
        this.cmdEvolve();
        break;
      case 'generation':
        this.cmdGeneration();
        break;
      case 'help':
        this.cmdHelp();
        break;
      case 'quit':
      case 'exit':
        this.rl.close();
        break;
      case '':
        break;
      default:
        console.log(`Unknown command: ${cmd}. Type "help" for commands.`);
    }
  }
  
  /**
   * Generate planet
   */
  private cmdPlanet(seedPhrase: string) {
    console.log(`\n🌍 Generating planet from seed: "${seedPhrase}"...\n`);
    
    const startTime = Date.now();
    this.state.planet = generateMockGen0(seedPhrase);
    this.state.seedPhrase = seedPhrase;
    
    // Build lookup tables
    this.buildLookupTables();
    
    // Initialize creatures
    useCreatureEvolution.getState().initializeCreatures(seedPhrase, 5);
    
    const elapsed = Date.now() - startTime;
    console.log(`✅ Planet generated in ${elapsed}ms\n`);
    console.log(`Planet: ${this.state.planet.planetary.planetaryName}`);
    console.log(`Theme: ${this.state.planet.planetary.worldTheme}`);
    console.log(`Core: ${this.state.planet.planetary.cores[0].name}`);
    console.log(`  Temperature: ${this.state.planet.planetary.cores[0].temperature}/10`);
    console.log(`  Pressure: ${this.state.planet.planetary.cores[0].pressure}/10`);
    console.log(`  Stability: ${this.state.planet.planetary.cores[0].stability}/10`);
    console.log(`Fill: ${this.state.planet.planetary.fillMaterial.name} (${this.state.planet.planetary.fillMaterial.type})`);
    console.log(`  Permeability: ${this.state.planet.planetary.fillMaterial.permeability}/10`);
    console.log(`\nMaterials: ${this.state.materialTable.size}`);
    console.log(`Layers: ${this.state.layerTable.length}`);
    console.log(`Creatures: 5 (Generation 0)`);
    console.log(`\nYou are at surface (0, 0, 0). Type "help" for commands!`);
  }
  
  /**
   * Build lookup tables
   */
  private buildLookupTables() {
    if (!this.state.planet) return;
    
    const core = this.state.planet.planetary.cores[0];
    const rng = seedrandom(this.state.seedPhrase);
    this.state.noise2D = createNoise2D(rng);
    
    // Material table
    this.state.materialTable.clear();
    this.state.planet.planetary.sharedMaterials.forEach(mat => {
      const density = mat.hardness;
      const baseDepth = density * 5;
      const tempEffect = core.temperature > 7 ? (10 - density) * 2 : 0;
      const pressureEffect = core.pressure * density * 0.5;
      let optimalDepth = baseDepth + tempEffect + pressureEffect;
      optimalDepth += (rng() - 0.5) * 5;
      optimalDepth = Math.max(0, Math.min(50, optimalDepth));
      
      this.state.materialTable.set(mat.name, {
        name: mat.name,
        category: mat.category,
        minDepth: Math.max(0, optimalDepth - 10),
        maxDepth: Math.min(50, optimalDepth + 10),
        optimalDepth,
        hardness: mat.hardness,
        abundance: mat.rarity,
      });
    });
    
    // Layer table
    this.state.layerTable = [];
    for (let depth = 0; depth < 50; depth += 10) {
      const materialsInLayer = Array.from(this.state.materialTable.values()).filter(m =>
        m.minDepth <= depth + 10 && m.maxDepth >= depth
      );
      
      const permeability = this.state.planet.planetary.fillMaterial.permeability;
      const temperature = core.temperature * (1 - depth / 50);
      
      this.state.layerTable.push({
        depth,
        thickness: 10,
        materials: materialsInLayer.map(m => m.name),
        permeability,
        temperature,
      });
    }
  }
  
  /**
   * Dig at coordinates
   */
  private cmdDig(x: number, y: number, z: number) {
    if (!this.state.planet) {
      console.log('❌ No planet loaded. Use "planet <seed>" first.');
      return;
    }
    
    const depth = -y;
    
    if (depth < 0) {
      console.log('❌ Cannot dig above surface (y must be ≤ 0)');
      return;
    }
    
    if (depth > 50) {
      console.log('❌ Too deep! Maximum depth is 50m.');
      return;
    }
    
    console.log(`\n⛏️  Digging at (${x}, ${y}, ${z})...`);
    console.log(`   Depth: ${depth.toFixed(1)}m\n`);
    
    // Check accessibility
    if (!this.checkAccessibility(depth)) {
      console.log('❌ Cannot reach this depth. Need better tools!');
      return;
    }
    
    // Get material at position
    const material = this.getMaterialAt(x, y, z);
    
    if (!material) {
      console.log(`🕳️  Nothing but ${this.state.planet.planetary.fillMaterial.name} here.`);
      return;
    }
    
    // Check if can dig (tool hardness)
    if (material.hardness > this.state.toolHardness) {
      console.log(`❌ ${material.name} is too hard (hardness: ${material.hardness})!`);
      console.log(`   Your tool: ${this.state.toolHardness}`);
      console.log(`   Need: ${material.hardness}`);
      return;
    }
    
    // Success!
    console.log(`✅ Found ${material.name}!`);
    console.log(`   Category: ${material.category}`);
    console.log(`   Hardness: ${material.hardness}`);
    console.log(`   Optimal depth: ${material.optimalDepth.toFixed(1)}m`);
    
    // Add to inventory
    const current = this.state.inventory.get(material.name) || 0;
    this.state.inventory.set(material.name, current + 1);
    console.log(`   Inventory: ${material.name} x${current + 1}`);
    
    // Track discovery
    if (!this.state.discoveredMaterials.has(material.name)) {
      this.state.discoveredMaterials.add(material.name);
      console.log(`   🎉 NEW MATERIAL DISCOVERED!`);
    }
    
    // Track deepest dig
    if (depth > this.state.deepestDig) {
      this.state.deepestDig = depth;
      console.log(`   🏆 NEW DEPTH RECORD: ${depth.toFixed(1)}m`);
    }
  }
  
  /**
   * Get material at position (CORE QUERY)
   */
  private getMaterialAt(x: number, y: number, z: number): MaterialData | null {
    if (!this.state.noise2D) return null;
    
    const depth = -y;
    const candidates = Array.from(this.state.materialTable.values()).filter(m =>
      depth >= m.minDepth && depth <= m.maxDepth
    );
    
    if (candidates.length === 0) return null;
    
    const noiseValue = this.state.noise2D(x * 0.1, z * 0.1);
    const weights = candidates.map(m => {
      const depthProximity = 1 - Math.abs(depth - m.optimalDepth) / 20;
      return depthProximity * m.abundance;
    });
    
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const threshold = (noiseValue + 1) / 2;
    
    let accumulated = 0;
    for (let i = 0; i < candidates.length; i++) {
      accumulated += weights[i] / totalWeight;
      if (threshold <= accumulated) {
        return candidates[i];
      }
    }
    
    return candidates[0];
  }
  
  /**
   * Check if depth is accessible
   */
  private checkAccessibility(depth: number): boolean {
    // Sample materials above
    for (let d = 0; d < depth; d += 1) {
      const material = this.getMaterialAt(0, -d, 0);
      if (material && material.hardness > this.state.toolHardness) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Scan depth range
   */
  private cmdScan(maxDepth: number) {
    if (!this.state.planet) {
      console.log('❌ No planet loaded.');
      return;
    }
    
    console.log(`\n📡 Scanning 0-${maxDepth}m...\n`);
    
    const samples = 10;
    const materialsFound = new Map<string, number>();
    
    for (let i = 0; i < samples; i++) {
      const depth = (maxDepth / samples) * i;
      const material = this.getMaterialAt(0, -depth, 0);
      if (material) {
        materialsFound.set(material.name, (materialsFound.get(material.name) || 0) + 1);
      }
    }
    
    if (materialsFound.size === 0) {
      console.log('No materials detected.');
      return;
    }
    
    console.log('Materials detected:');
    Array.from(materialsFound.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => {
        const material = this.state.materialTable.get(name)!;
        console.log(`  ${name}: ${count}/${samples} samples (${material.minDepth.toFixed(0)}-${material.maxDepth.toFixed(0)}m)`);
      });
  }
  
  /**
   * Show tools
   */
  private cmdTools() {
    console.log(`\n🔧 Current Tool: Hardness ${this.state.toolHardness}`);
    console.log('\nAvailable upgrades:');
    console.log('  (Tool evolution not yet implemented)');
  }
  
  /**
   * Show status
   */
  private cmdStatus() {
    if (!this.state.planet) {
      console.log('❌ No planet loaded.');
      return;
    }
    
    console.log(`\n📊 Player Status\n`);
    console.log(`Position: (${this.state.playerX}, ${this.state.playerY}, ${this.state.playerZ})`);
    console.log(`Tool: Hardness ${this.state.toolHardness}`);
    console.log(`Generation: ${this.state.generation}`);
    console.log(`Deepest dig: ${this.state.deepestDig.toFixed(1)}m`);
    console.log(`Materials discovered: ${this.state.discoveredMaterials.size}/${this.state.materialTable.size}`);
    
    if (this.state.inventory.size > 0) {
      console.log(`\n💼 Inventory:`);
      Array.from(this.state.inventory.entries()).forEach(([name, count]) => {
        console.log(`  ${name}: ${count}`);
      });
    } else {
      console.log(`\n💼 Inventory: Empty`);
    }
  }
  
  /**
   * Show layers
   */
  private cmdLayers() {
    if (!this.state.planet) {
      console.log('❌ No planet loaded.');
      return;
    }
    
    console.log(`\n🗺️  Planetary Layers\n`);
    this.state.layerTable.forEach((layer, i) => {
      console.log(`Layer ${i + 1}: ${layer.depth}-${layer.depth + layer.thickness}m`);
      console.log(`  Permeability: ${layer.permeability.toFixed(1)}`);
      console.log(`  Temperature: ${layer.temperature.toFixed(1)}/10`);
      console.log(`  Materials: ${layer.materials.join(', ')}`);
      console.log();
    });
  }
  
  /**
   * Show materials
   */
  private cmdMaterials() {
    if (!this.state.planet) {
      console.log('❌ No planet loaded.');
      return;
    }
    
    console.log(`\n📋 Material Table\n`);
    const sorted = Array.from(this.state.materialTable.values())
      .sort((a, b) => a.optimalDepth - b.optimalDepth);
    
    sorted.forEach(mat => {
      const discovered = this.state.discoveredMaterials.has(mat.name) ? '✓' : ' ';
      console.log(`[${discovered}] ${mat.name.padEnd(15)} | ${mat.category.padEnd(8)} | ` +
        `${mat.minDepth.toFixed(0).padStart(2)}-${mat.maxDepth.toFixed(0).padEnd(2)}m | ` +
        `Hardness: ${mat.hardness}`);
    });
  }
  
  /**
   * Show creatures
   */
  private cmdCreatures() {
    const creatureState = useCreatureEvolution.getState();
    const creatures = Array.from(creatureState.creatures.values());
    
    if (creatures.length === 0) {
      console.log('❌ No planet loaded.');
      return;
    }
    
    console.log(`\n🧬 Creatures (Generation ${creatureState.currentGeneration})\n`);
    console.log(`Total: ${creatures.length} | Tool users: ${creatures.filter(c => c.canUseTool).length}`);
    console.log(`Available tools: ${creatureState.availableTools.map(t => t.type).join(', ') || 'none'}\n`);
    
    creatures.forEach(c => {
      console.log(`${c.id} (Gen ${c.generation})`);
      console.log(`  Taxonomy: ${c.taxonomy.class} / ${c.taxonomy.order} / ${c.taxonomy.family}`);
      console.log(`  Species: ${c.taxonomy.genus} ${c.taxonomy.species}`);
      console.log(`  Tool use: ${c.canUseTool ? `✓ (hardness: ${c.toolHardness})` : '✗'}`);
      console.log(`  Key traits:`);
      console.log(`    Manipulation: ${(c.traits.manipulation * 100).toFixed(0)}%`);
      console.log(`    Intelligence: ${(c.traits.intelligence * 100).toFixed(0)}%`);
      console.log(`    Excavation: ${(c.traits.excavation * 100).toFixed(0)}%`);
      console.log(`    Social: ${(c.traits.social * 100).toFixed(0)}%`);
      if (c.evolutionEvents.length > 1) {
        console.log(`  Evolution: ${c.evolutionEvents[c.evolutionEvents.length - 1]}`);
      }
      console.log();
    });
  }
  
  /**
   * Evolve creatures
   */
  private cmdEvolve() {
    const creatureState = useCreatureEvolution.getState();
    
    if (creatureState.creatures.size === 0) {
      console.log('❌ No creatures to evolve.');
      return;
    }
    
    console.log(`\n🧬 Evolution triggered by environmental pressure...\n`);
    
    // Set pressure based on game state
    const depthPressure = this.state.deepestDig / 50; // Normalized
    const discoveryPressure = this.state.discoveredMaterials.size / this.state.materialTable.size;
    
    useCreatureEvolution.setState({
      materialAccessibilityPressure: Math.min(1, depthPressure + discoveryPressure),
      populationPressure: 0.3,  // Moderate
      predationPressure: 0.2,   // Low
    });
    
    // Evolve each creature
    const creatureIds = Array.from(creatureState.creatures.keys());
    creatureIds.forEach(id => {
      creatureState.evolveCreature(id);
    });
    
    // Check for tool emergence
    creatureState.evaluateToolNeed();
    
    console.log(`\n✅ Evolution complete. Type "creatures" to see results.`);
  }
  
  /**
   * Advance generation
   */
  private cmdGeneration() {
    const creatureState = useCreatureEvolution.getState();
    
    if (creatureState.creatures.size === 0) {
      console.log('❌ No planet loaded.');
      return;
    }
    
    // Set pressure based on game state
    const depthPressure = this.state.deepestDig / 50;
    const discoveryPressure = this.state.discoveredMaterials.size / this.state.materialTable.size;
    
    useCreatureEvolution.setState({
      materialAccessibilityPressure: Math.min(1, depthPressure + discoveryPressure),
    });
    
    creatureState.advanceGeneration();
  }
  
  /**
   * Show help
   */
  private cmdHelp() {
    console.log(`
╔═══════════════════════════════════════════╗
║              COMMANDS                     ║
╚═══════════════════════════════════════════╝

PLANETARY:
  planet <seed>       Generate planet from seed phrase
  materials           Show all materials
  layers              Show planetary layers
  
EXPLORATION:
  dig <x> <y> <z>     Dig at coordinates (y≤0 is underground)
  scan <depth>        Scan for materials in depth range
  
CREATURES:
  creatures           Show all creatures and their evolution
  evolve              Trigger evolution (based on pressure)
  generation          Advance to next generation
  
PLAYER:
  tools               Show available tools
  status              Show player status
  help                Show this help
  quit                Exit game

EXAMPLE SESSION:
  planet volcanic-world
  creatures           (see base creatures)
  dig 0 -5 0          (dig 5m down)
  dig 0 -15 0         (try to dig deeper - might need tools!)
  evolve              (evolve creatures based on pressure)
  creatures           (see evolved traits)
  generation          (advance generation)
  creatures           (see taxonomical changes)
`);
  }
}

// Start game
const game = new CLIGame();
game.start();
