#!/usr/bin/env node
/**
 * WORLD SIMULATOR - CLI Report Generator
 * 
 * Initializes a universe and traces its evolution through cycles.
 * Generates comprehensive reports showing advancement and decline.
 * NO RENDERING - Pure simulation and mathematics.
 * 
 * Usage:
 *   pnpm sim:world <seed> [cycles]
 *   pnpm sim:world my-world-42 100
 */

import { generateGameData } from '../src/gen-systems/loadGenData.js';
import { StochasticPopulationDynamics } from '../src/ecology/StochasticPopulation.js';
import { EnhancedRNG } from '../src/utils/EnhancedRNG.js';
import { LAWS } from '../src/laws/index.js';

// ============================================================================
// REPORT FORMATTING
// ============================================================================

function hr(char: string = '=', width: number = 80) {
  console.log(char.repeat(width));
}

function header(title: string) {
  console.log('\n');
  hr('█');
  console.log(`  ${title}`);
  hr('█');
  console.log('');
}

function section(title: string) {
  console.log('\n');
  hr('-', 60);
  console.log(`  ${title}`);
  hr('-', 60);
}

function subsection(title: string) {
  console.log(`\n${title}:`);
}

function bullet(text: string, indent: number = 2) {
  console.log(' '.repeat(indent) + '• ' + text);
}

function kv(key: string, value: string | number, indent: number = 4, unit: string = '') {
  const valueStr = typeof value === 'number' ? value.toFixed(2) : value;
  console.log(' '.repeat(indent) + `${key}: ${valueStr}${unit}`);
}

function bar(label: string, value: number, max: number, width: number = 40) {
  const filled = Math.round((value / max) * width);
  const empty = width - filled;
  const barStr = '█'.repeat(filled) + '░'.repeat(empty);
  const percent = ((value / max) * 100).toFixed(0);
  console.log(`  ${label.padEnd(20)} ${barStr} ${percent}% (${value.toFixed(0)}/${max.toFixed(0)})`);
}

// ============================================================================
// WORLD STATE TRACKING
// ============================================================================

interface WorldState {
  cycle: number;
  year: number;
  populations: Map<string, number>;
  extinctions: string[];
  socialStage: string;
  totalPopulation: number;
  carryingCapacity: number;
  productivity: number;
  temperature: number;
  events: string[];
}

class WorldSimulator {
  private seed: string;
  private gameData: any;
  private rng: EnhancedRNG;
  private state: WorldState;
  private populationDynamics: StochasticPopulationDynamics;
  
  constructor(seed: string) {
    this.seed = seed;
    this.rng = new EnhancedRNG(seed + '-simulation');
    this.populationDynamics = new StochasticPopulationDynamics(seed + '-population');
    
    this.state = {
      cycle: 0,
      year: 0,
      populations: new Map(),
      extinctions: [],
      socialStage: 'Pre-sapient',
      totalPopulation: 0,
      carryingCapacity: 0,
      productivity: 0,
      temperature: 0,
      events: [],
    };
  }
  
  /**
   * Initialize the world
   */
  async initialize() {
    header('WORLD INITIALIZATION');
    
    console.log(`Seed: "${this.seed}"`);
    console.log('Generating universe from laws...\n');
    
    const start = Date.now();
    this.gameData = await generateGameData(this.seed);
    const time = Date.now() - start;
    
    console.log(`✓ Generation complete (${time}ms)\n`);
    
    // Display universe report
    this.reportUniverse();
    this.reportPlanet();
    this.reportEcology();
    this.reportSpecies();
    this.reportResources();
    
    // Initialize populations
    this.gameData.creatures.forEach((c: any) => {
      // Initial population based on carrying capacity and trophic level
      const K = LAWS.ecology.carryingCapacity.calculate(
        this.gameData.ecology.productivity,
        c.trophicLevel,
        c.metabolism
      );
      const initialPop = K * 0.5; // Start at 50% of carrying capacity
      this.state.populations.set(c.name, initialPop);
    });
    
    this.state.productivity = this.gameData.ecology.productivity;
    this.state.temperature = this.gameData.ecology.temperature - 273.15;
    
    // Calculate total carrying capacity
    const herbivores = this.gameData.creatures.filter((c: any) => c.trophicLevel === 1);
    if (herbivores.length > 0) {
      this.state.carryingCapacity = herbivores.reduce((sum: number, c: any) => {
        return sum + LAWS.ecology.carryingCapacity.calculate(
          this.gameData.ecology.productivity,
          c.trophicLevel,
          c.metabolism
        );
      }, 0);
    }
    
    this.updateTotalPopulation();
  }
  
  /**
   * Advance simulation by N cycles
   */
  advanceCycles(cycles: number) {
    header(`SIMULATION: ${cycles} CYCLES`);
    
    for (let i = 0; i < cycles; i++) {
      this.state.cycle++;
      this.state.year += 100; // Each cycle = 100 years
      this.state.events = [];
      
      // Run population dynamics
      this.simulatePopulations();
      
      // Check for extinctions
      this.checkExtinctions();
      
      // Environmental changes (every 10 cycles)
      if (this.state.cycle % 10 === 0) {
        this.simulateEnvironment();
      }
      
      // Social development (based on population)
      this.updateSocialStage();
      
      // Report every 10 cycles or if major events
      if (this.state.cycle % 10 === 0 || this.state.events.length > 0) {
        this.reportCycle();
      }
    }
    
    // Final summary
    this.reportFinalSummary();
  }
  
  /**
   * Simulate population dynamics for one cycle
   */
  private simulatePopulations() {
    // Get prey and predator populations
    const herbivores = this.gameData.creatures.filter((c: any) => c.trophicLevel === 1);
    const carnivores = this.gameData.creatures.filter((c: any) => c.trophicLevel > 1);
    
    if (herbivores.length === 0 || carnivores.length === 0) return;
    
    const preySpecies = herbivores[0];
    const predSpecies = carnivores[0];
    
    const preyPop = this.state.populations.get(preySpecies.name) || 0;
    const predPop = this.state.populations.get(predSpecies.name) || 0;
    
    if (preyPop < 1 || predPop < 1) return;
    
    // Run stochastic Lotka-Volterra
    const params = {
      alpha: 0.5,      // Prey birth rate
      beta: 0.0001,    // Predation rate
      delta: 0.00005,  // Predator efficiency
      gamma: 0.3,      // Predator death rate
      sigmaEnv: 0.15 + this.rng.uniform() * 0.1,  // Environmental noise (varies)
      sigmaDemog: 0.05,
    };
    
    const dt = 0.1;
    const steps = 1000; // 1000 steps per cycle (100 years)
    
    let currentPrey = preyPop;
    let currentPred = predPop;
    
    for (let step = 0; step < steps; step++) {
      const result = this.populationDynamics.stepPredatorPrey(
        currentPrey,
        currentPred,
        params,
        dt
      );
      currentPrey = result.prey;
      currentPred = result.predator;
      
      // Check for extinction
      if (currentPrey < 1 || currentPred < 1) break;
    }
    
    // Update populations
    this.state.populations.set(preySpecies.name, currentPrey);
    this.state.populations.set(predSpecies.name, currentPred);
    
    // Other species have simpler dynamics
    this.gameData.creatures.forEach((c: any) => {
      if (c.name === preySpecies.name || c.name === predSpecies.name) return;
      
      const pop = this.state.populations.get(c.name) || 0;
      if (pop < 1) return;
      
      // Simple logistic growth
      const K = LAWS.ecology.carryingCapacity.calculate(
        this.state.productivity,
        c.trophicLevel,
        c.metabolism
      );
      const r = 0.1; // Growth rate
      const noise = this.rng.normal(0, 0.1 * pop);
      const newPop = Math.max(0, pop + LAWS.ecology.carryingCapacity.logisticGrowth(pop, K, r, 1) + noise);
      
      this.state.populations.set(c.name, newPop);
    });
    
    this.updateTotalPopulation();
  }
  
  /**
   * Check for extinctions
   */
  private checkExtinctions() {
    this.state.populations.forEach((pop, species) => {
      if (pop < 1 && !this.state.extinctions.includes(species)) {
        this.state.extinctions.push(species);
        this.state.events.push(`⚠️  EXTINCTION: ${species}`);
        this.state.populations.delete(species);
      }
    });
  }
  
  /**
   * Simulate environmental changes
   */
  private simulateEnvironment() {
    // Temperature fluctuations (climate change)
    const tempChange = this.rng.normal(0, 0.5); // ±0.5°C per 1000 years
    this.state.temperature += tempChange;
    
    if (Math.abs(tempChange) > 0.3) {
      const direction = tempChange > 0 ? 'warmer' : 'cooler';
      this.state.events.push(`🌡️  Climate shift: ${Math.abs(tempChange).toFixed(1)}°C ${direction}`);
    }
    
    // Productivity changes (follows temperature)
    const productivityChange = this.rng.normal(tempChange * 100, 50);
    this.state.productivity = Math.max(500, this.state.productivity + productivityChange);
    
    // Random catastrophes (low probability)
    if (this.rng.uniform() < 0.01) {
      const severity = this.rng.uniform() * 0.5; // 0-50% population loss
      this.state.events.push(`💥 CATASTROPHE: ${(severity * 100).toFixed(0)}% population loss`);
      
      this.state.populations.forEach((pop, species) => {
        const survivors = Math.floor(pop * (1 - severity));
        this.state.populations.set(species, survivors);
      });
      
      this.updateTotalPopulation();
    }
  }
  
  /**
   * Update social development stage
   */
  private updateSocialStage() {
    // Find most populous species
    let maxPop = 0;
    let dominantSpecies = '';
    
    this.state.populations.forEach((pop, species) => {
      if (pop > maxPop) {
        maxPop = pop;
        dominantSpecies = species;
      }
    });
    
    // Determine social stage based on population
    const oldStage = this.state.socialStage;
    
    if (maxPop < 100) {
      this.state.socialStage = 'Pre-sapient';
    } else if (maxPop < 1000) {
      this.state.socialStage = 'Band (25-100 individuals)';
    } else if (maxPop < 10000) {
      this.state.socialStage = 'Tribe (100-1000 individuals)';
    } else if (maxPop < 100000) {
      this.state.socialStage = 'Chiefdom (1000-10000 individuals)';
    } else {
      this.state.socialStage = 'State (10000+ individuals)';
    }
    
    if (oldStage !== this.state.socialStage && this.state.cycle > 0) {
      this.state.events.push(`📈 Social development: ${dominantSpecies} reached ${this.state.socialStage}`);
    }
  }
  
  /**
   * Update total population
   */
  private updateTotalPopulation() {
    this.state.totalPopulation = Array.from(this.state.populations.values()).reduce((sum, p) => sum + p, 0);
  }
  
  // ========================================================================
  // REPORTS
  // ========================================================================
  
  private reportUniverse() {
    section('STELLAR SYSTEM');
    
    const star = this.gameData.universe.star;
    kv('Spectral Type', star.spectralType);
    kv('Mass', star.mass, 4, ' M☉');
    kv('Luminosity', star.luminosity, 4, ' L☉');
    kv('Temperature', star.temperature, 4, ' K');
    kv('Age', (star.age / 1e9).toFixed(2), 4, ' Gyr');
    
    subsection('Planetary System');
    this.gameData.universe.planets.forEach((p: any, i: number) => {
      const habMarker = p === this.gameData.planet ? ' ⭐ HABITABLE' : '';
      bullet(`Planet ${i + 1}: ${p.name} (${(p.mass / 5.97e24).toFixed(2)} M⊕, ${p.orbitalRadius.toFixed(2)} AU)${habMarker}`);
    });
  }
  
  private reportPlanet() {
    section('HABITABLE PLANET');
    
    const p = this.gameData.planet;
    kv('Name', p.name);
    kv('Mass', (p.mass / 5.97e24).toFixed(2), 4, ' M⊕');
    kv('Radius', (p.radius / 6.371e6).toFixed(2), 4, ' R⊕');
    kv('Gravity', p.surfaceGravity.toFixed(2), 4, ' m/s²');
    kv('Temperature', (p.surfaceTemperature - 273.15).toFixed(1), 4, ' °C');
    kv('Day Length', (p.rotationPeriod / 3600).toFixed(1), 4, ' hours');
    
    if (p.atmosphere) {
      subsection('Atmosphere');
      Object.entries(p.atmosphere.composition).forEach(([gas, fraction]: [string, any]) => {
        if (fraction > 0.01) {
          kv(gas, (fraction * 100).toFixed(1), 6, '%');
        }
      });
    }
  }
  
  private reportEcology() {
    section('ECOLOGY');
    
    const e = this.gameData.ecology;
    kv('Temperature', (e.temperature - 273.15).toFixed(1), 4, ' °C');
    kv('Productivity', e.productivity.toFixed(0), 4, ' kcal/m²/year');
    
    if (e.rainfall) {
      kv('Rainfall', e.rainfall.toFixed(0), 4, ' mm/year');
    }
    
    subsection('Biomes');
    e.biomes.forEach((b: any) => {
      bar(b.type.replace('_', ' '), b.coverage, 1);
    });
  }
  
  private reportSpecies() {
    section('SPECIES');
    
    console.log(`  ${this.gameData.creatures.length} species detected\n`);
    
    this.gameData.creatures.forEach((c: any) => {
      console.log(`  ${c.scientificName}`);
      kv('Common name', c.name, 6);
      kv('Mass', c.mass.toFixed(1), 6, ' kg');
      kv('Diet', c.diet, 6);
      kv('Locomotion', c.locomotion, 6);
      kv('Social', c.sociality, 6);
      kv('Lifespan', c.lifespan.toFixed(0), 6, ' years');
      kv('Home range', (c.homeRange / 1e6).toFixed(2), 6, ' km²');
      console.log('');
    });
  }
  
  private reportResources() {
    section('RESOURCES');
    
    this.gameData.resources.forEach((r: any) => {
      bar(r.name, r.abundance, 1);
    });
  }
  
  private reportCycle() {
    section(`CYCLE ${this.state.cycle} (Year ${this.state.year})`);
    
    // Events
    if (this.state.events.length > 0) {
      subsection('Events');
      this.state.events.forEach(event => bullet(event));
    }
    
    // Environment
    subsection('Environment');
    kv('Temperature', this.state.temperature.toFixed(1), 6, ' °C');
    kv('Productivity', this.state.productivity.toFixed(0), 6, ' kcal/m²/year');
    
    // Populations
    subsection('Populations');
    const sortedPops = Array.from(this.state.populations.entries()).sort((a, b) => b[1] - a[1]);
    sortedPops.forEach(([species, pop]) => {
      const creature = this.gameData.creatures.find((c: any) => c.name === species);
      const K = creature ? LAWS.ecology.carryingCapacity.calculate(
        this.state.productivity,
        creature.trophicLevel,
        creature.metabolism
      ) : 1000;
      
      bar(species, pop, K);
    });
    
    kv('Total Population', this.state.totalPopulation.toFixed(0), 4);
    kv('Species Alive', this.state.populations.size, 4);
    kv('Extinctions', this.state.extinctions.length, 4);
    
    // Social
    subsection('Social Development');
    kv('Stage', this.state.socialStage, 6);
  }
  
  private reportFinalSummary() {
    header('SIMULATION COMPLETE');
    
    section('FINAL STATE');
    
    kv('Total Cycles', this.state.cycle);
    kv('Total Years', this.state.year);
    kv('Species Surviving', this.state.populations.size);
    kv('Species Extinct', this.state.extinctions.length);
    kv('Total Population', this.state.totalPopulation.toFixed(0));
    kv('Social Stage', this.state.socialStage);
    
    if (this.state.extinctions.length > 0) {
      subsection('Extinctions');
      this.state.extinctions.forEach(species => bullet(species));
    }
    
    subsection('Final Populations');
    const sortedPops = Array.from(this.state.populations.entries()).sort((a, b) => b[1] - a[1]);
    sortedPops.forEach(([species, pop]) => {
      kv(species, pop.toFixed(0), 6);
    });
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('\nWorld Simulator - CLI Report Generator');
    console.log('\nUsage: pnpm sim:world <seed> [cycles]');
    console.log('\nExamples:');
    console.log('  pnpm sim:world my-world-42 100');
    console.log('  pnpm sim:world test-extinction 500');
    console.log('');
    process.exit(1);
  }
  
  const seed = args[0];
  const cycles = parseInt(args[1] || '50');
  
  const simulator = new WorldSimulator(seed);
  
  try {
    await simulator.initialize();
    simulator.advanceCycles(cycles);
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
}

main();
