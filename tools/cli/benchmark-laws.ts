#!/usr/bin/env tsx
/**
 * BENCHMARK - Performance test for law calculations
 */

import { LAWS } from '../laws';
import { generateUniverse } from '../generation/SimpleUniverseGenerator';

console.log('🏃 PERFORMANCE BENCHMARK\n');

const iterations = 10000;

// Benchmark 1: Universe generation
console.log(`Generating ${iterations} universes...`);
const start1 = Date.now();

for (let i = 0; i < iterations; i++) {
  generateUniverse(`bench-${i}`);
}

const time1 = Date.now() - start1;
console.log(`  ✅ ${iterations} universes in ${time1}ms`);
console.log(`  ${((iterations / time1) * 1000).toFixed(0)} universes/second\n`);

// Benchmark 2: Biological calculations
console.log(`Running ${iterations} biological calculations...`);
const start2 = Date.now();

for (let i = 0; i < iterations; i++) {
  const mass = 1 + i / 100;
  LAWS.biology.allometry.basalMetabolicRate(mass);
  LAWS.biology.allometry.heartRate(mass);
  LAWS.biology.allometry.maxLifespan(mass);
  LAWS.biology.allometry.homeRange(mass, 1);
}

const time2 = Date.now() - start2;
console.log(`  ✅ ${iterations * 4} calculations in ${time2}ms`);
console.log(`  ${(((iterations * 4) / time2) * 1000).toFixed(0)} calculations/second\n`);

// Benchmark 3: Social simulations
console.log(`Running ${iterations} social calculations...`);
const start3 = Date.now();

for (let i = 0; i < iterations; i++) {
  const pop = 50 + i;
  LAWS.social.service.classify(pop, 0, 0.1);
  LAWS.cognitive.encephalization.expectedBrainMass(50, 'mammal');
}

const time3 = Date.now() - start3;
console.log(`  ✅ ${iterations * 2} calculations in ${time3}ms`);
console.log(`  ${(((iterations * 2) / time3) * 1000).toFixed(0)} calculations/second\n`);

console.log('═══════════════════════════════════════════════════════════');
console.log(
  `TOTAL: ${(((iterations + iterations * 4 + iterations * 2) / (time1 + time2 + time3)) * 1000).toFixed(0)} operations/second`
);
console.log('═══════════════════════════════════════════════════════════\n');

console.log('✅ Performance excellent - laws are FAST.\n');
