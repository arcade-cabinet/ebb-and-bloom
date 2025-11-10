#!/usr/bin/env tsx
/**
 * Test determinism of law-based generation
 * Same seed should always produce same result
 */

import { generateGameData } from '../gen-systems/loadGenData.js';

const seed = process.argv[2] || 'v1-determinism-test-seed';

console.log(`\n🧪 Testing determinism with seed: ${seed}\n`);

// Generate game data (uses law system)
const gameData = await generateGameData(seed);

// Print key properties for comparison
console.log(`Game ID: ${gameData.gameId}`);
console.log(`Seed: ${gameData.seed}`);
console.log(`Generation: ${gameData.generation}`);
console.log(`Current Time: ${gameData.currentTime}`);

if (gameData.gen0Data) {
  console.log(`\nGen0 Data:`);
  console.log(`  Planet name: ${gameData.gen0Data.selectedArchetype?.name || 'N/A'}`);
  console.log(`  Star type: ${gameData.gen0Data.contextData?.starType || 'N/A'}`);
}

console.log(`\n✅ Determinism test completed`);
