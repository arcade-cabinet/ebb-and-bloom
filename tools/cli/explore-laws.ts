#!/usr/bin/env tsx
/**
 * LAW EXPLORER
 *
 * Interactive tool for exploring all available laws and formulas.
 */

import { LAWS } from '../laws';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║              LAW LIBRARY EXPLORER                          ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

function exploreLaws(obj: any, prefix = '') {
  let count = 0;

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'function') {
      console.log(`  ${prefix}${key}()`);
      count++;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      if (prefix === '') {
        console.log(`\n📁 ${key.toUpperCase()}:`);
      }
      count += exploreLaws(value, prefix + '  ');
    }
  }

  return count;
}

const totalFormulas = exploreLaws(LAWS);

console.log(`\n═══════════════════════════════════════════════════════════`);
console.log(`TOTAL FORMULAS: ${totalFormulas}`);
console.log(`═══════════════════════════════════════════════════════════\n`);

console.log('Example usage:');
console.log('  LAWS.biology.allometry.basalMetabolicRate(50)');
console.log('  LAWS.stellar.mainSequence.luminosity(1.0)');
console.log('  LAWS.cognitive.encephalization.EQ(0.0014, 70)');
console.log('  LAWS.economics.supplyDemand.equilibriumPrice(100, 2, 20, 1.5)\n');

console.log('🔬 All laws accessible through LAWS object. 🔬\n');
