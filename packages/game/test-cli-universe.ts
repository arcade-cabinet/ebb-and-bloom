#!/usr/bin/env node
/**
 * LAW-BASED UNIVERSE CLI TEST SUITE
 * 
 * Validates all mathematical systems WITHOUT rendering.
 * Tests determinism, statistical properties, population dynamics, and conservation laws.
 * 
 * Usage:
 *   npm run test:universe -- determinism
 *   npm run test:universe -- statistics --count 1000
 *   npm run test:universe -- population --seed my-seed --cycles 200
 *   npm run test:universe -- benchmark
 *   npm run test:universe -- full
 */

import { generateGameData } from '../src/gen-systems/loadGenData.js';
import { generateEnhancedUniverse } from '../src/generation/EnhancedUniverseGenerator.js';
import { StochasticPopulationDynamics } from '../src/ecology/StochasticPopulation.js';
import { MonteCarloAccretion } from '../src/physics/MonteCarloAccretion.js';
import { NBodySimulator } from '../src/physics/NBodySimulator.js';
import { EnhancedRNG } from '../src/utils/EnhancedRNG.js';
import { LAWS } from '../src/laws/index.js';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function log(msg: string) {
  console.log(msg);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(80));
  console.log(`  ${title}`);
  console.log('='.repeat(80) + '\n');
}

function logSubsection(title: string) {
  console.log('\n' + '-'.repeat(60));
  console.log(`  ${title}`);
  console.log('-'.repeat(60));
}

function formatNumber(num: number, decimals: number = 2): string {
  if (Math.abs(num) < 0.01 && num !== 0) {
    return num.toExponential(decimals);
  }
  return num.toFixed(decimals);
}

function renderHistogram(data: number[], bins: number = 20): void {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / bins;
  const histogram = new Array(bins).fill(0);
  
  data.forEach(val => {
    const binIndex = Math.min(Math.floor((val - min) / binWidth), bins - 1);
    histogram[binIndex]++;
  });
  
  const maxCount = Math.max(...histogram);
  const barWidth = 50;
  
  for (let i = 0; i < bins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    const count = histogram[i];
    const barLength = Math.round((count / maxCount) * barWidth);
    const bar = '█'.repeat(barLength);
    
    console.log(`${formatNumber(binStart, 1)}-${formatNumber(binEnd, 1)}: ${bar} (${count})`);
  }
}

function renderTimeSeries(data: { time: number; prey: number; predator: number }[], maxPoints: number = 50): void {
  // Sample data to fit width
  const step = Math.max(1, Math.floor(data.length / maxPoints));
  const sampled = data.filter((_, i) => i % step === 0);
  
  // Normalize to 0-20 range for display
  const preyValues = sampled.map(d => d.prey);
  const predValues = sampled.map(d => d.predator);
  const maxPrey = Math.max(...preyValues);
  const maxPred = Math.max(...predValues);
  
  const height = 20;
  const width = sampled.length;
  
  console.log(`\nPopulation Dynamics (${data.length} time steps, showing ${sampled.length})`);
  console.log(`Max prey: ${formatNumber(maxPrey, 0)}  Max predator: ${formatNumber(maxPred, 0)}\n`);
  
  // Draw grid
  for (let y = height; y >= 0; y--) {
    let line = '';
    for (let x = 0; x < width; x++) {
      const preyHeight = Math.round((preyValues[x] / maxPrey) * height);
      const predHeight = Math.round((predValues[x] / maxPred) * height);
      
      if (y === preyHeight && y === predHeight) {
        line += 'X'; // Both at this height
      } else if (y === preyHeight) {
        line += '●'; // Prey
      } else if (y === predHeight) {
        line += '○'; // Predator
      } else {
        line += ' ';
      }
    }
    console.log(line);
  }
  
  console.log('─'.repeat(width));
  console.log('● = Prey    ○ = Predator    X = Both');
}

// ============================================================================
// TEST 1: DETERMINISM
// ============================================================================

async function testDeterminism() {
  logSection('TEST 1: DETERMINISM');
  
  const seed = 'determinism-test-42';
  log(`Generating universe twice with seed: "${seed}"`);
  
  const start1 = Date.now();
  const u1 = await generateGameData(seed);
  const time1 = Date.now() - start1;
  
  const start2 = Date.now();
  const u2 = await generateGameData(seed);
  const time2 = Date.now() - start2;
  
  log(`  Generation 1: ${time1}ms`);
  log(`  Generation 2: ${time2}ms`);
  
  logSubsection('Universe Properties');
  const checks = [
    { name: 'Star mass', v1: u1.universe.star.mass, v2: u2.universe.star.mass },
    { name: 'Star luminosity', v1: u1.universe.star.luminosity, v2: u2.universe.star.luminosity },
    { name: 'Planet count', v1: u1.universe.planets.length, v2: u2.universe.planets.length },
    { name: 'Habitable planet mass', v1: u1.planet.mass, v2: u2.planet.mass },
    { name: 'Habitable planet radius', v1: u1.planet.radius, v2: u2.planet.radius },
    { name: 'Creature count', v1: u1.creatures.length, v2: u2.creatures.length },
    { name: 'Resource count', v1: u1.resources.length, v2: u2.resources.length },
  ];
  
  let allMatch = true;
  checks.forEach(check => {
    const match = check.v1 === check.v2;
    const icon = match ? '✓' : '✗';
    allMatch = allMatch && match;
    log(`  ${icon} ${check.name}: ${formatNumber(check.v1)} === ${formatNumber(check.v2)}`);
  });
  
  if (u1.populationDynamics && u2.populationDynamics) {
    const popMatch = 
      u1.populationDynamics.equilibria.prey === u2.populationDynamics.equilibria.prey &&
      u1.populationDynamics.equilibria.predator === u2.populationDynamics.equilibria.predator;
    const icon = popMatch ? '✓' : '✗';
    allMatch = allMatch && popMatch;
    log(`  ${icon} Population equilibria match`);
  }
  
  logSubsection('Result');
  if (allMatch) {
    log('  ✅ PASS - All properties match (deterministic)');
  } else {
    log('  ❌ FAIL - Properties differ (non-deterministic)');
  }
  
  return allMatch;
}

// ============================================================================
// TEST 2: STATISTICAL PROPERTIES
// ============================================================================

async function testStatistics(count: number = 100) {
  logSection(`TEST 2: STATISTICAL PROPERTIES (${count} universes)`);
  
  const starMasses: number[] = [];
  const planetCounts: number[] = [];
  const creatureCounts: number[] = [];
  const temperatures: number[] = [];
  const productivities: number[] = [];
  
  log('Generating universes...');
  const startTime = Date.now();
  
  for (let i = 0; i < count; i++) {
    const seed = `stats-test-${i}`;
    const data = await generateGameData(seed);
    
    starMasses.push(data.universe.star.mass);
    planetCounts.push(data.universe.planets.length);
    creatureCounts.push(data.creatures.length);
    temperatures.push(data.planet.surfaceTemperature - 273.15); // Convert to Celsius
    productivities.push(data.ecology.productivity);
    
    if ((i + 1) % 10 === 0) {
      log(`  Progress: ${i + 1}/${count} (${((i + 1) / count * 100).toFixed(0)}%)`);
    }
  }
  
  const totalTime = Date.now() - startTime;
  log(`  Completed in ${(totalTime / 1000).toFixed(1)}s (avg ${(totalTime / count).toFixed(0)}ms per universe)`);
  
  // Calculate statistics
  const stats = (data: number[]) => ({
    mean: data.reduce((a, b) => a + b, 0) / data.length,
    min: Math.min(...data),
    max: Math.max(...data),
    median: data.sort((a, b) => a - b)[Math.floor(data.length / 2)],
  });
  
  logSubsection('Star Masses (Solar masses)');
  const starStats = stats(starMasses);
  log(`  Mean: ${formatNumber(starStats.mean)}  Min: ${formatNumber(starStats.min)}  Max: ${formatNumber(starStats.max)}`);
  log('  Distribution (should follow power-law IMF):');
  renderHistogram(starMasses, 15);
  
  logSubsection('Planet Counts');
  const planetStats = stats(planetCounts);
  log(`  Mean: ${formatNumber(planetStats.mean)}  Min: ${planetStats.min}  Max: ${planetStats.max}`);
  log('  Distribution (should be Poisson with λ≈2.5):');
  renderHistogram(planetCounts, 10);
  
  logSubsection('Creature Counts');
  const creatureStats = stats(creatureCounts);
  log(`  Mean: ${formatNumber(creatureStats.mean)}  Min: ${creatureStats.min}  Max: ${creatureStats.max}`);
  
  logSubsection('Surface Temperatures (°C)');
  const tempStats = stats(temperatures);
  log(`  Mean: ${formatNumber(tempStats.mean)}  Min: ${formatNumber(tempStats.min)}  Max: ${formatNumber(tempStats.max)}`);
  log('  Distribution:');
  renderHistogram(temperatures, 15);
  
  logSubsection('Primary Productivity (kcal/m²/year)');
  const prodStats = stats(productivities);
  log(`  Mean: ${formatNumber(prodStats.mean)}  Min: ${formatNumber(prodStats.min)}  Max: ${formatNumber(prodStats.max)}`);
  
  log('\n  ✅ Statistical analysis complete');
}

// ============================================================================
// TEST 3: POPULATION DYNAMICS
// ============================================================================

async function testPopulationDynamics(seed: string = 'population-test', cycles: number = 200) {
  logSection(`TEST 3: POPULATION DYNAMICS (${cycles} cycles)`);
  
  log(`Generating universe with seed: "${seed}"`);
  const data = await generateGameData(seed);
  
  if (!data.populationDynamics || !data.populationDynamics.trajectory) {
    log('  ⚠️  No population dynamics data available');
    return;
  }
  
  const dynamics = data.populationDynamics;
  
  logSubsection('Species');
  log(`  Prey: ${dynamics.species.prey}`);
  log(`  Predator: ${dynamics.species.predator}`);
  
  logSubsection('Parameters');
  log(`  Birth rate (α): ${formatNumber(dynamics.parameters.alpha)}`);
  log(`  Predation rate (β): ${formatNumber(dynamics.parameters.beta, 6)}`);
  log(`  Conversion efficiency (δ): ${formatNumber(dynamics.parameters.delta, 6)}`);
  log(`  Death rate (γ): ${formatNumber(dynamics.parameters.gamma)}`);
  log(`  Environmental noise (σ_env): ${formatNumber(dynamics.parameters.sigmaEnv)}`);
  log(`  Demographic noise (σ_demo): ${formatNumber(dynamics.parameters.sigmaDemog)}`);
  
  logSubsection('Equilibrium Populations');
  log(`  Prey: ${formatNumber(dynamics.equilibria.prey, 0)}`);
  log(`  Predator: ${formatNumber(dynamics.equilibria.predator, 0)}`);
  log(`  Ratio: ${formatNumber(dynamics.equilibria.prey / dynamics.equilibria.predator, 1)}:1`);
  
  logSubsection('Time Series Visualization');
  renderTimeSeries(dynamics.trajectory);
  
  // Check for extinctions
  const finalPrey = dynamics.trajectory[dynamics.trajectory.length - 1].prey;
  const finalPred = dynamics.trajectory[dynamics.trajectory.length - 1].predator;
  
  logSubsection('Final State');
  if (finalPrey < 1 || finalPred < 1) {
    log(`  ⚠️  EXTINCTION occurred`);
    log(`     Final prey: ${formatNumber(finalPrey, 0)}`);
    log(`     Final predator: ${formatNumber(finalPred, 0)}`);
  } else {
    log(`  ✓ Both populations survived`);
    log(`    Final prey: ${formatNumber(finalPrey, 0)}`);
    log(`    Final predator: ${formatNumber(finalPred, 0)}`);
  }
}

// ============================================================================
// TEST 4: CONSERVATION LAWS
// ============================================================================

async function testConservationLaws() {
  logSection('TEST 4: CONSERVATION LAWS (N-Body)');
  
  // Generate a simple 3-body system
  const rng = new EnhancedRNG('conservation-test');
  const SOLAR_MASS = 1.989e30;
  const AU = 1.496e11;
  
  log('Creating 3-body system (star + 2 planets)');
  
  const bodies = [
    {
      mass: SOLAR_MASS,
      position: [0, 0, 0],
      velocity: [0, 0, 0],
      radius: 6.96e8,
    },
    {
      mass: 5.97e24, // Earth-like
      position: [AU, 0, 0],
      velocity: [0, 29800, 0], // Circular orbit
      radius: 6.37e6,
    },
    {
      mass: 6.42e23, // Mars-like
      position: [1.5 * AU, 0, 0],
      velocity: [0, 24100, 0],
      radius: 3.39e6,
    },
  ];
  
  const sim = new NBodySimulator(bodies);
  
  // Initial quantities
  const initial = sim.getConservedQuantities();
  log(`  Initial energy: ${formatNumber(initial.totalEnergy, 2)} J`);
  log(`  Initial angular momentum: ${formatNumber(initial.totalAngularMomentum, 2)} kg⋅m²/s`);
  
  // Run simulation for 1 Earth year (100 steps)
  const dt = (365.25 * 86400) / 100;
  log(`\n  Running simulation (1 Earth year, 100 steps)...`);
  
  for (let i = 0; i < 100; i++) {
    sim.step(dt);
  }
  
  // Final quantities
  const final = sim.getConservedQuantities();
  log(`  Final energy: ${formatNumber(final.totalEnergy, 2)} J`);
  log(`  Final angular momentum: ${formatNumber(final.totalAngularMomentum, 2)} kg⋅m²/s`);
  
  // Check conservation
  const energyError = Math.abs((final.totalEnergy - initial.totalEnergy) / initial.totalEnergy);
  const momentumError = Math.abs((final.totalAngularMomentum - initial.totalAngularMomentum) / initial.totalAngularMomentum);
  
  logSubsection('Conservation Errors');
  log(`  Energy: ${(energyError * 100).toExponential(2)}% (should be < 1e-4%)`);
  log(`  Angular momentum: ${(momentumError * 100).toExponential(2)}% (should be < 1e-6%)`);
  
  const energyPass = energyError < 1e-6;
  const momentumPass = momentumError < 1e-8;
  
  if (energyPass && momentumPass) {
    log('\n  ✅ PASS - Conservation laws hold');
  } else {
    log('\n  ⚠️  WARNING - Conservation errors exceed threshold');
  }
}

// ============================================================================
// TEST 5: BENCHMARK
// ============================================================================

async function testBenchmark() {
  logSection('TEST 5: PERFORMANCE BENCHMARK');
  
  const iterations = 10;
  const times: number[] = [];
  
  log(`Running ${iterations} universe generations...`);
  
  for (let i = 0; i < iterations; i++) {
    const seed = `benchmark-${i}`;
    const start = Date.now();
    await generateGameData(seed);
    const time = Date.now() - start;
    times.push(time);
    log(`  Run ${i + 1}: ${time}ms`);
  }
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  logSubsection('Results');
  log(`  Average: ${formatNumber(avgTime, 0)}ms`);
  log(`  Min: ${minTime}ms`);
  log(`  Max: ${maxTime}ms`);
  log(`  Target: < 10,000ms (10 seconds)`);
  
  if (avgTime < 10000) {
    log('\n  ✅ PASS - Performance acceptable');
  } else {
    log('\n  ⚠️  WARNING - Performance below target');
  }
}

// ============================================================================
// MAIN CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'full';
  
  console.log('\n' + '█'.repeat(80));
  console.log('  LAW-BASED UNIVERSE - CLI TEST SUITE');
  console.log('█'.repeat(80));
  
  try {
    switch (command) {
      case 'determinism':
        await testDeterminism();
        break;
      
      case 'statistics':
        const count = parseInt(args.find(a => a.startsWith('--count='))?.split('=')[1] || '100');
        await testStatistics(count);
        break;
      
      case 'population':
        const seed = args.find(a => a.startsWith('--seed='))?.split('=')[1] || 'population-test';
        const cycles = parseInt(args.find(a => a.startsWith('--cycles='))?.split('=')[1] || '200');
        await testPopulationDynamics(seed, cycles);
        break;
      
      case 'conservation':
        await testConservationLaws();
        break;
      
      case 'benchmark':
        await testBenchmark();
        break;
      
      case 'full':
        await testDeterminism();
        await testStatistics(50); // Reduced for speed
        await testPopulationDynamics();
        await testConservationLaws();
        await testBenchmark();
        break;
      
      default:
        log('\nUnknown command. Available commands:');
        log('  determinism   - Test that same seed produces same universe');
        log('  statistics    - Generate many universes, show distributions');
        log('  population    - Run population dynamics simulation');
        log('  conservation  - Test N-body conservation laws');
        log('  benchmark     - Performance test');
        log('  full          - Run all tests\n');
        log('Options:');
        log('  --count=N     - Number of universes for statistics (default: 100)');
        log('  --seed=S      - Seed for population test');
        log('  --cycles=N    - Number of cycles for population test');
        process.exit(1);
    }
    
    console.log('\n' + '█'.repeat(80));
    console.log('  TEST SUITE COMPLETE');
    console.log('█'.repeat(80) + '\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  }
}

main();
