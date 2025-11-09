#!/usr/bin/env tsx
/**
 * GENERATION-TO-GENERATION ITERATION TEST
 * 
 * Pure mathematical test of world progression over thousands of years.
 * NO VISUALS. Tests the actual simulation iteration.
 * 
 * Exposes issues in:
 * - Population dynamics
 * - Resource depletion
 * - Social emergence
 * - Technology progression
 * - Extinction cascades
 */

import { generateGameData } from '../gen-systems/loadGenData';
import { LAWS } from '../laws';
import { EnhancedRNG } from '../utils/EnhancedRNG';

const YEAR = 365.25 * 86400;

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║       GENERATION-TO-GENERATION ITERATION TEST              ║');
console.log('║       Pure Mathematics - 10,000 Year Simulation            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

interface SimulationState {
  year: number;
  populations: Map<string, number>;
  extinctions: string[];
  totalBiomass: number;
  complexity: number;
  events: string[];
}

async function runLongTermSimulation() {
  const seed = 'long-term-test';
  console.log(`Seed: ${seed}\n`);
  
  // Generate initial world
  const gameData = await generateGameData(seed, false);
  const rng = new EnhancedRNG(seed + '-iteration');
  
  console.log('Initial State:');
  console.log(`  Planet: ${gameData.planet.name}`);
  console.log(`  Temperature: ${(gameData.planet.surfaceTemp - 273).toFixed(1)}°C`);
  console.log(`  Gravity: ${gameData.planet.surfaceGravity.toFixed(2)} m/s²`);
  console.log(`  Productivity: ${gameData.ecology.productivity.toFixed(0)} kcal/m²/yr`);
  console.log(`  Species: ${gameData.creatures.length}\n`);
  
  // Initialize populations
  const state: SimulationState = {
    year: 0,
    populations: new Map(),
    extinctions: [],
    totalBiomass: 0,
    complexity: 0,
    events: [],
  };
  
  gameData.creatures.forEach((c: any) => {
    const K = LAWS.ecology.carryingCapacity.calculate(
      gameData.ecology.productivity,
      c.trophicLevel,
      c.metabolism
    );
    state.populations.set(c.scientificName, K * 0.5); // Start at 50% of K
  });
  
  updateTotalBiomass(state, gameData);
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('SIMULATION START (10,000 years)');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Simulate 10,000 years
  const timeStep = 100; // years per step
  const steps = 10000 / timeStep; // 100 steps
  
  for (let step = 0; step < steps; step++) {
    state.year += timeStep;
    state.events = [];
    
    // Population dynamics
    simulatePopulationDynamics(state, gameData, timeStep, rng);
    
    // Check extinctions
    checkExtinctions(state);
    
    // Environmental changes
    if (step % 10 === 0) {
      simulateEnvironmentalChange(state, gameData, rng);
    }
    
    // Social complexity emergence
    updateComplexity(state);
    
    // Log milestones
    if (step % 10 === 0 || state.events.length > 0) {
      logMilestone(state);
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('SIMULATION COMPLETE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Duration: 10,000 years (${steps} steps)`);
  console.log(`Final populations: ${state.populations.size} species alive`);
  console.log(`Extinctions: ${state.extinctions.length}`);
  console.log(`Final complexity: ${state.complexity.toFixed(2)}`);
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Validate results
  if (state.populations.size === 0) {
    console.error('❌ TOTAL EXTINCTION - All species died!');
    console.error('   Issue: Population dynamics too harsh or K too low');
  } else {
    console.log(`✅ ${state.populations.size} species survived 10,000 years`);
  }
  
  if (state.complexity < 0.1) {
    console.warn('⚠️  Complexity never increased from base level');
    console.warn('   Issue: Social/tech emergence conditions may be too strict');
  } else {
    console.log(`✅ Complexity increased to ${state.complexity.toFixed(2)}`);
  }
}

/**
 * Simulate population dynamics for one time step
 */
function simulatePopulationDynamics(
  state: SimulationState,
  gameData: any,
  dt_years: number,
  rng: EnhancedRNG
) {
  state.populations.forEach((pop, species) => {
    if (pop < 1) return; // Already extinct
    
    const creature = gameData.creatures.find((c: any) => c.scientificName === species);
    if (!creature) return;
    
    // Carrying capacity
    const K = LAWS.ecology.carryingCapacity.calculate(
      gameData.ecology.productivity,
      creature.trophicLevel,
      creature.metabolism
    );
    
    // Logistic growth with stochasticity
    const r = 0.1; // Intrinsic growth rate
    const deterministicGrowth = r * pop * (1 - pop / K);
    
    // Environmental stochasticity
    const envNoise = rng.normal(0, Math.sqrt(pop * 0.01));
    
    // Update population
    const newPop = Math.max(0, pop + deterministicGrowth + envNoise);
    state.populations.set(species, newPop);
    
    // Log significant changes
    if (pop > 100 && newPop < 50) {
      state.events.push(`⚠️  ${species} declining rapidly`);
    }
    if (pop < 100 && newPop > 200) {
      state.events.push(`📈 ${species} population boom`);
    }
  });
  
  updateTotalBiomass(state, gameData);
}

/**
 * Check for extinctions
 */
function checkExtinctions(state: SimulationState) {
  const toRemove: string[] = [];
  
  state.populations.forEach((pop, species) => {
    if (pop < 1 && !state.extinctions.includes(species)) {
      state.extinctions.push(species);
      toRemove.push(species);
      state.events.push(`💀 EXTINCTION: ${species}`);
    }
  });
  
  toRemove.forEach(species => state.populations.delete(species));
}

/**
 * Simulate environmental changes
 */
function simulateEnvironmentalChange(
  state: SimulationState,
  gameData: any,
  rng: EnhancedRNG
) {
  // Random environmental shock (climate change, catastrophe, etc.)
  if (rng.uniform(0, 1) < 0.05) { // 5% chance per 1000 years
    const severity = rng.uniform(0.1, 0.5);
    state.events.push(`💥 Environmental shock: ${(severity * 100).toFixed(0)}% loss`);
    
    state.populations.forEach((pop, species) => {
      state.populations.set(species, pop * (1 - severity));
    });
  }
}

/**
 * Update complexity (social/technological emergence)
 */
function updateComplexity(state: SimulationState) {
  const maxPop = Math.max(...Array.from(state.populations.values()));
  const speciesDiversity = state.populations.size;
  
  // Complexity from population size and diversity
  const popComplexity = Math.min(1, maxPop / 10000);
  const diversityComplexity = Math.min(1, speciesDiversity / 20);
  
  state.complexity = (popComplexity + diversityComplexity) / 2;
}

/**
 * Update total biomass
 */
function updateTotalBiomass(state: SimulationState, gameData: any) {
  let totalBiomass = 0;
  
  state.populations.forEach((pop, species) => {
    const creature = gameData.creatures.find((c: any) => c.scientificName === species);
    if (creature) {
      totalBiomass += pop * creature.mass;
    }
  });
  
  state.totalBiomass = totalBiomass;
}

/**
 * Log milestone
 */
function logMilestone(state: SimulationState) {
  console.log(`Year ${state.year}:`);
  console.log(`  Species: ${state.populations.size} alive, ${state.extinctions.length} extinct`);
  console.log(`  Total biomass: ${state.totalBiomass.toFixed(0)} kg`);
  console.log(`  Complexity: ${state.complexity.toFixed(2)}`);
  
  if (state.events.length > 0) {
    state.events.forEach(event => console.log(`  ${event}`));
  }
  
  console.log('');
}

// Run
runLongTermSimulation().catch(console.error);

