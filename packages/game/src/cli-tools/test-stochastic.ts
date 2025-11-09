#!/usr/bin/env tsx
/**
 * Test stochastic population dynamics
 * Lotka-Volterra with noise, Gillespie algorithm
 */

import { StochasticPopulationDynamics } from '../ecology/StochasticPopulation.js';

console.log('\n🦊🐰 Testing Stochastic Population Dynamics\n');

const params = {
  preyGrowthRate: 0.5,
  predationRate: 0.02,
  predatorDeathRate: 0.4,
  conversionEfficiency: 0.01,
  preyCapacity: 1000,
  environmentalNoise: 0.1,
};

const simulator = new StochasticPopulationDynamics(
  100, // initial prey
  10,  // initial predators
  params,
  'stochastic-test-seed'
);

console.log('Initial state:');
console.log(`  Prey: ${simulator.getState().prey}`);
console.log(`  Predators: ${simulator.getState().predators}`);

console.log('\nRunning 100 simulation steps...\n');

for (let i = 0; i < 100; i++) {
  simulator.step(1.0);
  
  if (i % 20 === 0) {
    const state = simulator.getState();
    console.log(`Step ${i}: Prey=${state.prey.toFixed(0)}, Predators=${state.predators.toFixed(0)}`);
  }
}

const finalState = simulator.getState();
console.log('\nFinal state:');
console.log(`  Prey: ${finalState.prey.toFixed(0)}`);
console.log(`  Predators: ${finalState.predators.toFixed(0)}`);

if (finalState.prey > 0 || finalState.predators > 0) {
  console.log('\n✅ Simulation completed (some populations survived)');
} else {
  console.log('\n⚠️  Simulation completed (all populations extinct)');
}
