#!/usr/bin/env tsx
/**
 * 📊 Simulation Reports CLI
 * Run: tsx simulation-reports.tsx
 * 
 * Pure text output - validates the math, no graphics needed!
 */

import { generateGameData } from './src/gen-systems/loadGenData.js';
import { EnhancedRNG } from './src/utils/EnhancedRNG.js';

// Seed from CLI args or random
const seed = process.argv[2] || `world-${Date.now()}`;
const maxCycles = parseInt(process.argv[3] || '10');

console.clear();
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║          EBB & BLOOM - SIMULATION REPORTS                  ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log();
console.log(`Seed: ${seed}`);
console.log(`Max Cycles: ${maxCycles}`);
console.log();

async function runSimulation() {
  console.log('⏳ Generating universe from laws...');
  const startTime = Date.now();
  
  const data = await generateGameData(seed);
  const genTime = Date.now() - startTime;
  
  console.log(`✅ Generated in ${genTime}ms\n`);
  
  // Universe Report
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🌌 UNIVERSE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Star Type:      ${data.universe.star.spectralType}`);
  console.log(`Star Mass:      ${data.universe.star.mass.toFixed(2)} M☉`);
  console.log(`Luminosity:     ${data.universe.star.luminosity.toFixed(2)} L☉`);
  console.log(`Planets:        ${data.universe.planets.length}`);
  console.log();
  
  // Planet Report
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🌍 HABITABLE PLANET');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Name:           ${data.planet.name}`);
  console.log(`Radius:         ${data.planet.radius.toFixed(2)} R⊕`);
  console.log(`Mass:           ${data.planet.mass.toFixed(2)} M⊕`);
  console.log(`Temperature:    ${(data.planet.surfaceTemperature - 273).toFixed(1)}°C`);
  console.log(`Gravity:        ${data.planet.gravity.toFixed(2)} m/s²`);
  console.log(`Atmosphere:     ${data.planet.atmosphericPressure.toFixed(2)} atm`);
  console.log();
  
  // Ecology Report
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🌿 ECOLOGY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Biomes:         ${data.ecology.biomes.length}`);
  console.log(`Temperature:    ${data.ecology.averageTemperature.toFixed(1)}°C`);
  console.log(`Precipitation:  ${data.ecology.averagePrecipitation.toFixed(0)} mm/year`);
  console.log(`Primary Biome:  ${data.ecology.biomes[0].name}`);
  console.log();
  
  // Species Report
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🦎 SPECIES');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Total Species:  ${data.creatures.length}`);
  data.creatures.forEach((creature, i) => {
    console.log(`${i + 1}. ${creature.name} (${creature.archetype})`);
    console.log(`   Mass: ${creature.mass.toFixed(1)} kg | Diet: ${creature.diet}`);
  });
  console.log();
  
  // Population Dynamics
  if (data.populationDynamics) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📈 POPULATION DYNAMICS');
    console.log('═══════════════════════════════════════════════════════════');
    const pd = data.populationDynamics;
    
    if (pd.equilibria) {
      console.log(`Prey Equilibrium:     ${pd.equilibria.prey?.toFixed(0) || 'N/A'}`);
      console.log(`Predator Equilibrium: ${pd.equilibria.predator?.toFixed(0) || 'N/A'}`);
    }
    
    if (pd.oscillationPeriod) {
      console.log(`Oscillation Period:   ${pd.oscillationPeriod.toFixed(1)} years`);
    }
    
    if (pd.extinctionRisk !== undefined) {
      console.log(`Extinction Risk:      ${(pd.extinctionRisk * 100).toFixed(1)}%`);
    }
    console.log();
  }
  
  // Resource Report
  console.log('═══════════════════════════════════════════════════════════');
  console.log('⛏️  RESOURCES');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Total Resources: ${data.resources.length}`);
  data.resources.slice(0, 5).forEach((resource, i) => {
    console.log(`${i + 1}. ${resource.name} (${resource.type})`);
  });
  if (data.resources.length > 5) {
    console.log(`   ... and ${data.resources.length - 5} more`);
  }
  console.log();
  
  // Simulation Forward
  console.log('═══════════════════════════════════════════════════════════');
  console.log('⏱️  CYCLE SIMULATION');
  console.log('═══════════════════════════════════════════════════════════');
  
  const rng = new EnhancedRNG(seed);
  let preyPop = pd?.initialConditions?.prey || 10000;
  let predPop = pd?.initialConditions?.predator || 500;
  
  console.log('Year | Prey Pop | Predator Pop | Events');
  console.log('-----|----------|--------------|-------');
  
  for (let cycle = 0; cycle < maxCycles; cycle++) {
    const year = cycle * 100;
    
    // Simple Lotka-Volterra step
    const dt = 0.1;
    const alpha = 0.1;   // Prey growth
    const beta = 0.002;  // Predation rate
    const delta = 0.001; // Predator efficiency
    const gamma = 0.05;  // Predator death
    
    const dPrey = (alpha * preyPop - beta * preyPop * predPop) * dt;
    const dPred = (delta * preyPop * predPop - gamma * predPop) * dt;
    
    preyPop += dPrey;
    predPop += dPred;
    
    // Extinctions
    if (preyPop < 100) preyPop = 0;
    if (predPop < 10) predPop = 0;
    
    // Events
    let events = '';
    if (rng.uniform(0, 1) < 0.1) {
      events = '🌡️  Climate shift';
      preyPop *= 0.9;
    }
    if (rng.uniform(0, 1) < 0.05) {
      events = '💥 Catastrophe';
      preyPop *= 0.7;
      predPop *= 0.8;
    }
    if (preyPop === 0) events = '☠️  PREY EXTINCT';
    if (predPop === 0) events = '☠️  PREDATOR EXTINCT';
    
    console.log(
      `${year.toString().padStart(4)} | ` +
      `${Math.floor(preyPop).toString().padStart(8)} | ` +
      `${Math.floor(predPop).toString().padStart(12)} | ` +
      events
    );
    
    if (preyPop === 0 && predPop === 0) {
      console.log('\n💀 Total extinction - simulation ended');
      break;
    }
  }
  
  console.log();
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ Simulation Complete!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log();
  console.log('Try different seeds:');
  console.log('  tsx simulation-reports.tsx wild-ocean-glow 20');
  console.log('  tsx simulation-reports.tsx red-mountain-fire 50');
  console.log();
}

runSimulation().catch(console.error);
