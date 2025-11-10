#!/usr/bin/env tsx
/**
 * DIAGNOSE CARRYING CAPACITY
 * 
 * Debug why creatures are going extinct so quickly
 */

import { generateGameData } from '../gen-systems/loadGenData';
import { LAWS } from '../laws';

async function diagnose() {
  const seed = 'diagnose-test';
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          CARRYING CAPACITY DIAGNOSTIC                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const data = await generateGameData(seed, false);
  
  console.log(`Planet: ${data.planet.name}`);
  console.log(`Productivity: ${data.ecology.productivity.toFixed(0)} kcal/m²/yr`);
  console.log(`Creatures generated: ${data.creatures.length}\n`);
  
  if (data.creatures.length === 0) {
    console.error('❌ NO CREATURES GENERATED!');
    console.error('   Issue: Creature generation failing\n');
    return;
  }
  
  data.creatures.forEach((c: any, i: number) => {
    const K = LAWS.ecology.carryingCapacity.calculate(
      data.ecology.productivity,
      c.trophicLevel,
      c.metabolism
    );
    
    const initialPop = K * 0.5;
    
    console.log(`${i + 1}. ${c.scientificName || c.name}`);
    console.log(`   Mass: ${c.mass.toFixed(1)}kg`);
    console.log(`   Metabolism: ${(c.metabolicRate || c.metabolism).toFixed(0)} kcal/day`);
    console.log(`   Trophic level: ${c.trophicLevel}`);
    console.log(`   Carrying capacity: ${K.toFixed(4)}`);
    console.log(`   Initial population: ${initialPop.toFixed(2)}`);
    
    // Check for problems
    if (isNaN(K)) {
      console.error(`   ❌ K is NaN!`);
    } else if (K < 1) {
      console.error(`   ❌ K < 1 (will go extinct immediately)`);
    } else if (K < 10) {
      console.warn(`   ⚠️  K < 10 (high extinction risk)`);
    } else {
      console.log(`   ✅ K sufficient for survival`);
    }
    
    console.log('');
  });
  
  // Diagnose carrying capacity formula
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('CARRYING CAPACITY FORMULA CHECK');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const testCases = [
    { productivity: 1000, trophic: 1, metabolism: 3500, expected: '> 100' },
    { productivity: 1000, trophic: 2, metabolism: 5000, expected: '> 10' },
    { productivity: 5000, trophic: 1, metabolism: 3500, expected: '> 500' },
    { productivity: 100, trophic: 1, metabolism: 3500, expected: '> 10' },
  ];
  
  for (const test of testCases) {
    const K = LAWS.ecology.carryingCapacity.calculate(
      test.productivity,
      test.trophic,
      test.metabolism
    );
    
    console.log(`P=${test.productivity} kcal/m²/yr, Trophic=${test.trophic}, Metabolism=${test.metabolism} kcal/day`);
    console.log(`  K = ${K.toFixed(4)} (expected: ${test.expected})`);
    console.log('');
  }
}

diagnose().catch(console.error);


