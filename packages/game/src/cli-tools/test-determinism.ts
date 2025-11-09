#!/usr/bin/env tsx
/**
 * Test determinism of universe generation
 * Same seed should always produce same result
 */

import { GameEngine } from '../engine/GameEngineBackend.js';

const seed = process.argv[2] || 'v1-determinism-test-seed';

console.log(`\n🧪 Testing determinism with seed: ${seed}\n`);

// Generate universe
const engine = new GameEngine({ seed });
const universe = engine.generateUniverse();

// Print key properties for comparison
console.log(`Star name: ${universe.star.name}`);
console.log(`Star mass: ${universe.star.mass.toFixed(6)} M☉`);
console.log(`Star luminosity: ${universe.star.luminosity.toFixed(6)} L☉`);
console.log(`Number of planets: ${universe.planets.length}`);

if (universe.planets.length > 0) {
  const planet = universe.planets[0];
  console.log(`First planet mass: ${planet.mass.toFixed(6)} M⊕`);
  console.log(`First planet temperature: ${planet.surfaceTemp.toFixed(2)} K`);
  console.log(`First planet habitable: ${planet.habitable}`);
}

if (universe.species && universe.species.length > 0) {
  const species = universe.species[0];
  console.log(`First species archetype: ${species.archetype}`);
  console.log(`First species mass: ${species.averageMass.toFixed(3)} kg`);
}

console.log(`\n✅ Determinism test completed`);
