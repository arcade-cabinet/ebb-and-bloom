/**
 * Periodic Table Validation Script
 * 
 * Compares our periodic table data against the npm periodic-table package
 * to ensure accuracy of fundamental chemistry data.
 * 
 * Data sources:
 * - npm periodic-table: Basic chemistry data and CPK colors (chemistry standard)
 * - Our extensions: Bond energies, allotropes, visual properties, cosmic abundances
 */

import * as npmPT from 'periodic-table';
import { PERIODIC_TABLE } from './periodic-table.js';

interface ValidationResult {
  symbol: string;
  property: string;
  ourValue: any;
  npmValue: any;
  discrepancy: boolean;
  notes?: string;
}

const results: ValidationResult[] = [];

function parseAtomicMass(massString: string): number {
  // Extract numeric value from strings like "1.00794(4)"
  return parseFloat(massString.split('(')[0]);
}

function formatCPKColor(color: string | number): string {
  if (typeof color === 'number') {
    // Numbers in the npm package are already hex values stored as numbers
    // e.g., 909090 should become "909090", not converted from decimal
    return color.toString().toUpperCase().padStart(6, '0');
  }
  return color.toUpperCase();
}

function compareValues(
  symbol: string,
  property: string,
  ourValue: any,
  npmValue: any,
  tolerance: number = 0
): void {
  if (npmValue === '' || npmValue === undefined || npmValue === null) {
    return; // Skip missing npm data
  }

  let discrepancy = false;
  let notes = '';

  if (typeof ourValue === 'number' && typeof npmValue === 'number') {
    // Numeric comparison with tolerance
    const diff = Math.abs(ourValue - npmValue);
    const relativeDiff = diff / npmValue;
    discrepancy = relativeDiff > tolerance;
    if (discrepancy) {
      notes = `Relative difference: ${(relativeDiff * 100).toFixed(2)}%`;
    }
  } else {
    // String or other comparison
    discrepancy = String(ourValue) !== String(npmValue);
  }

  if (discrepancy) {
    results.push({
      symbol,
      property,
      ourValue,
      npmValue,
      discrepancy: true,
      notes,
    });
  }
}

console.log('='.repeat(80));
console.log('PERIODIC TABLE VALIDATION REPORT');
console.log('='.repeat(80));
console.log();

// Validate each element in our table
for (const [symbol, ourElement] of Object.entries(PERIODIC_TABLE)) {
  const npmElement = (npmPT as any).symbols[symbol];

  if (!npmElement) {
    console.log(`⚠️  Element ${symbol} not found in npm package`);
    continue;
  }

  // Compare atomic number
  compareValues(symbol, 'atomicNumber', ourElement.atomicNumber, npmElement.atomicNumber);

  // Compare name
  compareValues(symbol, 'name', ourElement.name, npmElement.name);

  // Compare atomic mass (with 1% tolerance due to isotope variations)
  if (npmElement.atomicMass) {
    const npmMass = parseAtomicMass(npmElement.atomicMass);
    compareValues(symbol, 'atomicMass', ourElement.atomicMass, npmMass, 0.01);
  }

  // Compare electronegativity (with small tolerance)
  if (npmElement.electronegativity) {
    compareValues(symbol, 'electronegativity', ourElement.electronegativity, npmElement.electronegativity, 0.02);
  }

  // Compare ionization energy (with small tolerance for rounding)
  if (npmElement.ionizationEnergy) {
    compareValues(symbol, 'ionizationEnergy', ourElement.ionizationEnergy, npmElement.ionizationEnergy, 0.02);
  }

  // Compare Van der Waals radius
  if (npmElement.vanDelWaalsRadius) {
    compareValues(symbol, 'vanDerWaalsRadius', ourElement.vanDerWaalsRadius, npmElement.vanDelWaalsRadius, 0.01);
  }

  // Compare CPK color
  if (npmElement.cpkHexColor) {
    const npmColor = formatCPKColor(npmElement.cpkHexColor);
    const ourColor = ourElement.color.replace('#', '').toUpperCase();
    compareValues(symbol, 'cpkColor', ourColor, npmColor);
  }

  // Compare atomic radius (informational, can vary by source)
  if (npmElement.atomicRadius) {
    compareValues(symbol, 'atomicRadius', ourElement.atomicRadius, npmElement.atomicRadius, 0.1);
  }

  // Compare melting/boiling points (with tolerance for unit conversions)
  if (npmElement.meltingPoint) {
    compareValues(symbol, 'meltingPoint', ourElement.meltingPoint, npmElement.meltingPoint, 0.02);
  }
  if (npmElement.boilingPoint) {
    compareValues(symbol, 'boilingPoint', ourElement.boilingPoint, npmElement.boilingPoint, 0.02);
  }
}

// Print discrepancies
if (results.length > 0) {
  console.log('⚠️  DISCREPANCIES FOUND:');
  console.log();

  // Group by property
  const byProperty = results.reduce((acc, r) => {
    if (!acc[r.property]) acc[r.property] = [];
    acc[r.property].push(r);
    return acc;
  }, {} as Record<string, ValidationResult[]>);

  for (const [property, items] of Object.entries(byProperty)) {
    console.log(`\n${property.toUpperCase()}:`);
    console.log('-'.repeat(80));
    for (const item of items) {
      console.log(`  ${item.symbol.padEnd(4)} Our: ${String(item.ourValue).padEnd(20)} NPM: ${item.npmValue}`);
      if (item.notes) {
        console.log(`        ${item.notes}`);
      }
    }
  }
  console.log();
} else {
  console.log('✓ All validated properties match the npm package!');
  console.log();
}

// Data coverage comparison
console.log('='.repeat(80));
console.log('DATA COVERAGE COMPARISON');
console.log('='.repeat(80));
console.log();

console.log('NPM PERIODIC-TABLE PROVIDES:');
console.log('  • Basic chemistry data (atomic number, mass, name)');
console.log('  • CPK colors (chemistry standard for molecular visualization)');
console.log('  • Electronic configuration');
console.log('  • Electronegativity (Pauling scale)');
console.log('  • Atomic radius');
console.log('  • Van der Waals radius');
console.log('  • Ionization energy');
console.log('  • Electron affinity');
console.log('  • Oxidation states');
console.log('  • Standard state (solid/liquid/gas)');
console.log('  • Bonding type');
console.log('  • Melting/boiling points');
console.log('  • Density');
console.log('  • Group block classification');
console.log();

console.log('OUR EXTENSIONS (Critical for synthesis):');
console.log('  • Bond energies (element-specific pairs) - for chemical reaction modeling');
console.log('  • Allotropes (different structural forms) - for material diversity');
console.log('  • Cosmic abundances (solar system & universe) - for planet formation');
console.log('  • PBR visual properties (metallic, roughness, opacity, emissive) - for 3D rendering');
console.log('  • Thermal properties (heat capacity, thermal conductivity) - for physics simulation');
console.log('  • Phase information - for state transitions');
console.log('  • Radioactive properties - for element stability');
console.log();

// Generate CPK color update suggestions
console.log('='.repeat(80));
console.log('CPK COLOR UPDATES NEEDED');
console.log('='.repeat(80));
console.log();

const colorUpdates: Array<{ symbol: string; currentColor: string; cpkColor: string }> = [];

for (const [symbol, ourElement] of Object.entries(PERIODIC_TABLE)) {
  const npmElement = (npmPT as any).symbols[symbol];
  if (npmElement && npmElement.cpkHexColor) {
    const npmColor = formatCPKColor(npmElement.cpkHexColor);
    const ourColor = ourElement.color.replace('#', '').toUpperCase();
    
    if (ourColor !== npmColor) {
      colorUpdates.push({
        symbol,
        currentColor: `#${ourColor}`,
        cpkColor: `#${npmColor}`,
      });
    }
  }
}

if (colorUpdates.length > 0) {
  console.log('Elements needing CPK color updates:');
  console.log();
  for (const update of colorUpdates) {
    console.log(`  ${update.symbol.padEnd(4)} ${update.currentColor.padEnd(10)} → ${update.cpkColor}`);
  }
  console.log();
  console.log('CPK colors are the chemistry standard for molecular visualization.');
  console.log('They provide consistent, recognizable colors across scientific applications.');
} else {
  console.log('✓ All CPK colors are correct!');
}
console.log();

// Summary
console.log('='.repeat(80));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(80));
console.log();
console.log(`Total elements validated: ${Object.keys(PERIODIC_TABLE).length}`);
console.log(`Discrepancies found: ${results.length}`);
console.log(`CPK color updates needed: ${colorUpdates.length}`);
console.log();

if (results.length === 0 && colorUpdates.length === 0) {
  console.log('✓ Our periodic table is accurate and ready for synthesis!');
} else {
  console.log('⚠️  Updates recommended - see details above');
}
console.log();
console.log('='.repeat(80));
