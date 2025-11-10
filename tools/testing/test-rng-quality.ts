#!/usr/bin/env tsx
/**
 * Test RNG quality - distributions should match expected statistics
 */

import { EnhancedRNG } from '../utils/EnhancedRNG.js';
import { mean, standardDeviation } from 'simple-statistics';

console.log('\n🎲 Testing RNG Quality (Mersenne Twister)\n');

const rng = new EnhancedRNG('rng-quality-test');
const sampleSize = 10000;

// Test uniform distribution [0, 1]
console.log('Testing uniform distribution [0, 1]...');
const uniformSamples = Array.from({ length: sampleSize }, () => rng.uniform());
const uniformMean = mean(uniformSamples);
const uniformStdDev = standardDeviation(uniformSamples);

console.log(`  Mean: ${uniformMean.toFixed(4)} (expected ~0.5)`);
console.log(`  StdDev: ${uniformStdDev.toFixed(4)} (expected ~0.289)`);

if (Math.abs(uniformMean - 0.5) < 0.02 && Math.abs(uniformStdDev - 0.289) < 0.05) {
  console.log('  ✅ Uniform distribution PASS');
} else {
  console.log('  ❌ Uniform distribution FAIL');
}

// Test normal distribution N(0, 1)
console.log('\nTesting normal distribution N(0, 1)...');
const normalSamples = Array.from({ length: sampleSize }, () => rng.normal(0, 1));
const normalMean = mean(normalSamples);
const normalStdDev = standardDeviation(normalSamples);

console.log(`  Mean: ${normalMean.toFixed(4)} (expected ~0)`);
console.log(`  StdDev: ${normalStdDev.toFixed(4)} (expected ~1)`);

if (Math.abs(normalMean) < 0.05 && Math.abs(normalStdDev - 1) < 0.05) {
  console.log('  ✅ Normal distribution PASS');
} else {
  console.log('  ❌ Normal distribution FAIL');
}

// Test exponential distribution (λ=1)
console.log('\nTesting exponential distribution (λ=1)...');
const expSamples = Array.from({ length: sampleSize }, () => rng.exponential(1));
const expMean = mean(expSamples);

console.log(`  Mean: ${expMean.toFixed(4)} (expected ~1)`);

if (Math.abs(expMean - 1) < 0.1) {
  console.log('  ✅ Exponential distribution PASS');
} else {
  console.log('  ❌ Exponential distribution FAIL');
}

// Test Poisson distribution (λ=5)
console.log('\nTesting Poisson distribution (λ=5)...');
const poissonSamples = Array.from({ length: sampleSize }, () => rng.poisson(5));
const poissonMean = mean(poissonSamples);

console.log(`  Mean: ${poissonMean.toFixed(4)} (expected ~5)`);

if (Math.abs(poissonMean - 5) < 0.2) {
  console.log('  ✅ Poisson distribution PASS');
} else {
  console.log('  ❌ Poisson distribution FAIL');
}

console.log('\n✅ RNG quality tests completed\n');
