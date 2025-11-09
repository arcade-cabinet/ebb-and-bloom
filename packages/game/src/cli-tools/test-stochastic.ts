#!/usr/bin/env tsx
/**
 * Test stochastic population dynamics
 * Lotka-Volterra with noise
 */

import { StochasticPopulationDynamics } from '../ecology/StochasticPopulation.js';

console.log('\n🦊🐰 Testing Stochastic Population Dynamics\n');

const simulator = new StochasticPopulationDynamics('stochastic-test-seed');

let prey = 100;
let predators = 10;

const params = {
  alpha: 0.5,      // Prey birth rate
  beta: 0.02,      // Predation rate
  delta: 0.01,     // Predator efficiency
  gamma: 0.4,      // Predator death rate
  sigmaEnv: 0.1,   // Environmental noise
  sigmaDemog: 0.05 // Demographic noise
};

console.log('Initial state:');
console.log(`  Prey: ${prey}`);
console.log(`  Predators: ${predators}`);

console.log('\nRunning 100 simulation steps...\n');

for (let i = 0; i < 100; i++) {
  const result = simulator.stepPredatorPrey(prey, predators, params, 1.0);
  prey = result.prey;
  predators = result.predator;
  
  if (i % 20 === 0) {
    console.log(`Step ${i}: Prey=${prey.toFixed(0)}, Predators=${predators.toFixed(0)}`);
  }
}

console.log('\nFinal state:');
console.log(`  Prey: ${prey.toFixed(0)}`);
console.log(`  Predators: ${predators.toFixed(0)}`);

if (prey > 0 || predators > 0) {
  console.log('\n✅ Simulation completed (some populations survived)');
} else {
  console.log('\n⚠️  Simulation completed (all populations extinct)');
}
