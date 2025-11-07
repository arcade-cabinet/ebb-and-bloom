#!/usr/bin/env tsx
/**
 * Ebb & Bloom - Simulation Mode
 * 
 * Non-blocking fast-forward through generations.
 * Outputs complete state reports to JSON.
 * 
 * Usage:
 *   tsx src/dev/simulate-game.ts <seed> <generations>
 * 
 * Output:
 *   ./simulations/<seed>-gen<N>.json
 * 
 * Each report contains:
 * - Planetary structure
 * - All creatures (traits, taxonomy, tools)
 * - Material discoveries
 * - Tool emergences
 * - Generation events
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { generateMockGen0 } from './MockGen0Data';
import { useCreatureEvolution } from '../stores/CreatureEvolutionStore';
import { usePlanetaryStructure } from '../stores/PlanetaryStructureStore';
import seedrandom from 'seedrandom';
import { createNoise2D } from 'simplex-noise';

/**
 * Simulation state report
 */
interface SimulationReport {
  generation: number;
  timestamp: string;
  seedPhrase: string;
  
  // Planetary state
  planetary: {
    name: string;
    coreName: string;
    coreTemp: number;
    corePressure: number;
    coreStability: number;
    fillMaterial: string;
    materials: {
      name: string;
      category: string;
      optimalDepth: number;
      hardness: number;
    }[];
  };
  
  // Creature state
  creatures: {
    id: string;
    generation: number;
    taxonomy: {
      class: string;
      order: string;
      family: string;
      genus: string;
      species: string;
    };
    traits: Record<string, number>;
    canUseTool: boolean;
    toolHardness: number;
    toolTypes: string[];
    mutations: number;
    evolutionHistory: string[];
  }[];
  
  // Tool state
  tools: {
    type: string;
    hardness: number;
    unlocksDepth: number;
    emergedGeneration: number;
  }[];
  
  // Environment state
  environment: {
    materialAccessibilityPressure: number;
    populationPressure: number;
    predationPressure: number;
  };
  
  // Events this generation
  events: string[];
}

/**
 * Game simulator
 */
class GameSimulator {
  private seedPhrase: string;
  private maxGenerations: number;
  private outputDir: string;
  private events: string[] = [];
  
  constructor(seedPhrase: string, maxGenerations: number) {
    this.seedPhrase = seedPhrase;
    this.maxGenerations = maxGenerations;
    this.outputDir = './simulations';
    
    // Ensure output directory exists
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }
  
  /**
   * Run simulation
   */
  async run() {
    console.log('\n╔═══════════════════════════════════════════╗');
    console.log('║     EBB & BLOOM - SIMULATION MODE        ║');
    console.log('╚═══════════════════════════════════════════╝\n');
    console.log(`Seed: ${this.seedPhrase}`);
    console.log(`Generations: ${this.maxGenerations}`);
    console.log(`Output: ${this.outputDir}/\n`);
    
    // Initialize
    console.log('⚙️  Initializing planetary system...');
    this.initializePlanet();
    
    console.log('🧬 Initializing creatures...');
    this.initializeCreatures();
    
    console.log('✅ Initialization complete\n');
    
    // Run generations
    for (let gen = 0; gen <= this.maxGenerations; gen++) {
      console.log(`\n⏭️  GENERATION ${gen}`);
      this.events = [];
      
      // Simulate this generation
      if (gen > 0) {
        this.simulateGeneration(gen);
      }
      
      // Generate report
      const report = this.generateReport(gen);
      this.saveReport(report);
      
      console.log(`   📊 Report saved: ${this.seedPhrase}-gen${gen}.json`);
      console.log(`   Events: ${this.events.length}`);
    }
    
    console.log('\n✅ Simulation complete!');
    console.log(`\n📁 Reports saved to: ${this.outputDir}/`);
  }
  
  /**
   * Initialize planet
   */
  private initializePlanet() {
    const planet = generateMockGen0(this.seedPhrase);
    usePlanetaryStructure.getState().initialize(planet.planetary);
    this.events.push('Planet generated');
  }
  
  /**
   * Initialize creatures
   */
  private initializeCreatures() {
    useCreatureEvolution.getState().initializeCreatures(this.seedPhrase, 5);
    this.events.push('5 base creatures spawned');
  }
  
  /**
   * Simulate one generation
   */
  private simulateGeneration(generation: number) {
    const creatureState = useCreatureEvolution.getState();
    
    // Calculate environmental pressure
    const materialPressure = Math.min(1, generation * 0.1); // Increases over time
    const populationPressure = 0.3 + (generation * 0.05); // Increases slowly
    const predationPressure = 0.2;
    
    useCreatureEvolution.setState({
      materialAccessibilityPressure: materialPressure,
      populationPressure,
      predationPressure,
    });
    
    this.events.push(`Pressure: material=${materialPressure.toFixed(2)}, pop=${populationPressure.toFixed(2)}`);
    
    // Evolve creatures
    const creatureIds = Array.from(creatureState.creatures.keys());
    let evolved = 0;
    
    creatureIds.forEach(id => {
      const before = creatureState.creatures.get(id);
      creatureState.evolveCreature(id);
      const after = Array.from(creatureState.creatures.values()).find(c => c.parentId === id);
      
      if (after && hasSignificantChange(before?.traits, after.traits)) {
        evolved++;
        this.events.push(`${id} → ${after.id} (significant evolution)`);
      }
    });
    
    if (evolved > 0) {
      this.events.push(`${evolved} creatures evolved significantly`);
    }
    
    // Check for tool emergence
    const toolsBefore = creatureState.availableTools.length;
    creatureState.evaluateToolNeed();
    const toolsAfter = creatureState.availableTools.length;
    
    if (toolsAfter > toolsBefore) {
      const newTool = creatureState.availableTools[toolsAfter - 1];
      this.events.push(`🔧 TOOL EMERGED: ${newTool.type} (hardness: ${newTool.hardness})`);
    }
    
    // Update generation
    useCreatureEvolution.setState({ currentGeneration: generation });
  }
  
  /**
   * Generate report
   */
  private generateReport(generation: number): SimulationReport {
    const planetState = usePlanetaryStructure.getState();
    const creatureState = useCreatureEvolution.getState();
    
    // Planetary state
    const planetary = {
      name: planetState.planetName,
      coreName: planetState.coreName,
      coreTemp: planetState.coreTemperature,
      corePressure: planetState.corePressure,
      coreStability: planetState.coreStability,
      fillMaterial: planetState.fillMaterial?.name || 'none',
      materials: Array.from(planetState.materialTable.values()).map(m => ({
        name: m.name,
        category: m.category,
        optimalDepth: parseFloat(m.optimalDepth.toFixed(1)),
        hardness: m.hardness,
      })),
    };
    
    // Creature state
    const creatures = Array.from(creatureState.creatures.values()).map(c => ({
      id: c.id,
      generation: c.generation,
      taxonomy: {
        class: c.taxonomy.class,
        order: c.taxonomy.order,
        family: c.taxonomy.family,
        genus: c.taxonomy.genus,
        species: c.taxonomy.species,
      },
      traits: Object.fromEntries(
        Object.entries(c.traits).map(([k, v]) => [k, parseFloat(v.toFixed(2))])
      ),
      canUseTool: c.canUseTool,
      toolHardness: c.toolHardness,
      toolTypes: c.toolTypes,
      mutations: c.mutations,
      evolutionHistory: c.evolutionEvents,
    }));
    
    // Tool state
    const tools = creatureState.availableTools.map(t => ({
      type: t.type,
      hardness: t.hardness,
      unlocksDepth: t.unlocksDepth,
      emergedGeneration: t.emergedGeneration,
    }));
    
    // Environment state
    const environment = {
      materialAccessibilityPressure: creatureState.materialAccessibilityPressure,
      populationPressure: creatureState.populationPressure,
      predationPressure: creatureState.predationPressure,
    };
    
    return {
      generation,
      timestamp: new Date().toISOString(),
      seedPhrase: this.seedPhrase,
      planetary,
      creatures,
      tools,
      environment,
      events: this.events,
    };
  }
  
  /**
   * Save report to JSON
   */
  private saveReport(report: SimulationReport) {
    const filename = `${this.seedPhrase}-gen${report.generation}.json`;
    const filepath = join(this.outputDir, filename);
    writeFileSync(filepath, JSON.stringify(report, null, 2));
  }
}

/**
 * Check if traits changed significantly
 */
function hasSignificantChange(oldTraits: any, newTraits: any): boolean {
  if (!oldTraits || !newTraits) return false;
  
  return Object.keys(oldTraits).some(key => {
    const diff = Math.abs(newTraits[key] - oldTraits[key]);
    return diff > 0.05;
  });
}

// Run simulation
const seedPhrase = process.argv[2] || 'simulation-world';
const generations = parseInt(process.argv[3]) || 10;

const simulator = new GameSimulator(seedPhrase, generations);
simulator.run().catch(console.error);
