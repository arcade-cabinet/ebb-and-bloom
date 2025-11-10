#!/usr/bin/env tsx
/**
 * DIAGNOSE SPECIES DIVERSITY
 * 
 * Why are we only generating 1-2 creatures when we should get 5-20?
 */

import { generateGameData } from '../gen-systems/loadGenData';

async function diagnose() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          SPECIES DIVERSITY DIAGNOSTIC                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const seeds = ['test-1', 'test-2', 'test-3', 'rich-world', 'diverse-planet'];
  
  for (const seed of seeds) {
    const data = await generateGameData(seed, false);
    
    console.log(`${seed}:`);
    console.log(`  Creatures: ${data.creatures.length}`);
    console.log(`  Planet area: ${(4 * Math.PI * Math.pow(data.planet.radius, 2) / 1e12).toFixed(0)} (1000s km²)`);
    console.log(`  Productivity: ${data.ecology.productivity.toFixed(0)} kcal/m²/yr`);
    console.log(`  Biomes: ${data.ecology.biomes.length}`);
    
    if (data.creatures.length < 5) {
      console.warn(`  ⚠️  Low diversity (< 5 species)`);
    } else {
      console.log(`  ✅ Good diversity`);
    }
    
    console.log('');
  }
}

diagnose().catch(console.error);


