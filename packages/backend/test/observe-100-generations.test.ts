/**
 * OBSERVE THE SIMULATION FOR 100 GENERATIONS
 * No player, no game layer, just pure math evolving
 */

import { PlanetaryComposition } from '../src/planetary/composition.js';
import { getAllMaterials } from '../src/planetary/layers.js';

console.log('='.repeat(80));
console.log('OBSERVING SIMULATION: 100 GENERATIONS');
console.log('='.repeat(80));
console.log();

const seed = 'observe-seed-' + Date.now();
const planet = new PlanetaryComposition(seed);

// Initial state
interface SimulationState {
  generation: number;
  creatures: Array<{
    id: string;
    traits: {
      excavation: number;
      strength: number;
      manipulation: number;
      intelligence: number;
      social: number;
    };
  }>;
  materials: Array<{
    type: string;
    remaining: number;
    accessible: boolean;
    depth: number;
    hardness: number;
  }>;
  tools: string[];
  maxReach: number;
  maxHardness: number;
}

// Initialize
const state: SimulationState = {
  generation: 0,
  creatures: [
    {
      id: 'creature-1',
      traits: {
        excavation: 0.1,
        strength: 0.1,
        manipulation: 0.1,
        intelligence: 0.1,
        social: 0.1,
      },
    },
  ],
  materials: getAllMaterials().map(m => ({
    type: m.type,
    remaining: 10000,
    accessible: m.hardness <= 1.5 && m.density < 2.0, // Only surface materials
    depth: 0, // Will calculate
    hardness: m.hardness,
  })),
  tools: [],
  maxReach: 1, // Can only reach 1m deep initially
  maxHardness: 1.5, // Can only break soft materials
};

console.log('INITIAL STATE (Generation 0)');
console.log('-'.repeat(80));
console.log(`Creatures: ${state.creatures.length}`);
console.log(`Materials accessible: ${state.materials.filter(m => m.accessible).length}/${state.materials.length}`);
console.log(`Tools: ${state.tools.length}`);
console.log(`Max reach: ${state.maxReach}m`);
console.log(`Max hardness: ${state.maxHardness}`);
console.log();

// Run 100 generations
for (let gen = 1; gen <= 100; gen++) {
  state.generation = gen;
  
  // 1. Creatures consume materials
  const accessible = state.materials.filter(m => m.accessible && m.remaining > 0);
  if (accessible.length > 0) {
    const consumeAmount = state.creatures.length * 10; // Each creature consumes 10 units
    const randomMaterial = accessible[Math.floor(Math.random() * accessible.length)];
    randomMaterial.remaining = Math.max(0, randomMaterial.remaining - consumeAmount);
  }
  
  // 2. Calculate evolutionary pressure
  const inaccessible = state.materials.filter(m => !m.accessible);
  const depthPressure = inaccessible.length / state.materials.length;
  const scarcityPressure = state.materials.filter(m => m.remaining < 1000).length / state.materials.length;
  
  // 3. Evolve creatures based on pressure
  for (const creature of state.creatures) {
    const mutation = (Math.random() - 0.5) * 0.02; // Random mutation ±0.01
    
    creature.traits.excavation = Math.min(1, Math.max(0, 
      creature.traits.excavation + depthPressure * 0.05 + mutation
    ));
    
    creature.traits.strength = Math.min(1, Math.max(0,
      creature.traits.strength + scarcityPressure * 0.03 + mutation
    ));
    
    creature.traits.manipulation = Math.min(1, Math.max(0,
      creature.traits.manipulation + (depthPressure + scarcityPressure) * 0.02 + mutation
    ));
    
    creature.traits.intelligence = Math.min(1, Math.max(0,
      creature.traits.intelligence + scarcityPressure * 0.02 + mutation
    ));
    
    creature.traits.social = Math.min(1, Math.max(0,
      creature.traits.social + (state.creatures.length > 3 ? 0.01 : 0) + mutation
    ));
  }
  
  // 4. Update capability
  const avgExcavation = state.creatures.reduce((sum, c) => sum + c.traits.excavation, 0) / state.creatures.length;
  const avgStrength = state.creatures.reduce((sum, c) => sum + c.traits.strength, 0) / state.creatures.length;
  
  state.maxReach = avgExcavation * 100; // 0-100m
  state.maxHardness = 1.5 + avgStrength * 8.5; // 1.5-10 Mohs
  
  // 5. Tool emergence (fuzzy logic simulation)
  const toolDesirability = depthPressure * 0.5 + scarcityPressure * 0.3 + 
    state.creatures[0].traits.manipulation * 0.2;
  
  if (toolDesirability > 0.6 && state.tools.length < 5 && Math.random() < 0.1) {
    const toolType = state.tools.length === 0 ? 'stone-digger' :
                     state.tools.length === 1 ? 'wood-cutter' :
                     state.tools.length === 2 ? 'metal-extractor' :
                     state.tools.length === 3 ? 'deep-drill' :
                     'core-borer';
    state.tools.push(toolType);
    
    // Tools increase capability
    state.maxReach *= 1.5;
    state.maxHardness += 1.0;
  }
  
  // 6. Update material accessibility
  for (const material of state.materials) {
    // Simplified depth calculation (materials stratified by hardness as proxy)
    const estimatedDepth = (material.hardness - 1) * 20; // Soft near surface, hard deep
    material.depth = estimatedDepth;
    
    material.accessible = 
      estimatedDepth <= state.maxReach && 
      material.hardness <= state.maxHardness;
  }
  
  // 7. Population dynamics
  if (accessible.length > 2 && state.creatures.length < 10 && gen % 10 === 0) {
    // Reproduce
    const parent = state.creatures[Math.floor(Math.random() * state.creatures.length)];
    state.creatures.push({
      id: `creature-${state.creatures.length + 1}`,
      traits: { ...parent.traits },
    });
  } else if (accessible.filter(m => m.remaining > 0).length === 0 && state.creatures.length > 1) {
    // Starvation
    state.creatures.pop();
  }
  
  // 8. Log every 10 generations
  if (gen % 10 === 0 || gen === 1) {
    console.log(`Generation ${gen}`);
    console.log('-'.repeat(80));
    
    const avgTraits = {
      excavation: state.creatures.reduce((s, c) => s + c.traits.excavation, 0) / state.creatures.length,
      strength: state.creatures.reduce((s, c) => s + c.traits.strength, 0) / state.creatures.length,
      manipulation: state.creatures.reduce((s, c) => s + c.traits.manipulation, 0) / state.creatures.length,
      intelligence: state.creatures.reduce((s, c) => s + c.traits.intelligence, 0) / state.creatures.length,
      social: state.creatures.reduce((s, c) => s + c.traits.social, 0) / state.creatures.length,
    };
    
    console.log(`Creatures: ${state.creatures.length}`);
    console.log(`Avg Traits: excavation=${avgTraits.excavation.toFixed(2)}, strength=${avgTraits.strength.toFixed(2)}, manipulation=${avgTraits.manipulation.toFixed(2)}`);
    console.log(`Capability: reach=${state.maxReach.toFixed(1)}m, hardness=${state.maxHardness.toFixed(1)}`);
    console.log(`Materials: ${state.materials.filter(m => m.accessible).length}/${state.materials.length} accessible`);
    console.log(`Materials depleted: ${state.materials.filter(m => m.remaining === 0).length}`);
    console.log(`Tools: [${state.tools.join(', ')}]`);
    console.log(`Pressure: depth=${(depthPressure * 100).toFixed(0)}%, scarcity=${(scarcityPressure * 100).toFixed(0)}%`);
    console.log();
  }
}

console.log('='.repeat(80));
console.log('OBSERVATION COMPLETE');
console.log('='.repeat(80));
console.log();

// Final analysis
const finalAccessible = state.materials.filter(m => m.accessible).length;
const finalDepleted = state.materials.filter(m => m.remaining === 0).length;
const finalCreatures = state.creatures.length;
const finalTools = state.tools.length;

console.log('FINAL STATE (Generation 100)');
console.log('-'.repeat(80));
console.log(`Creatures: ${finalCreatures} (${finalCreatures > 1 ? 'survived' : 'extinct'})`);
console.log(`Materials accessible: ${finalAccessible}/${state.materials.length} (${(finalAccessible / state.materials.length * 100).toFixed(0)}%)`);
console.log(`Materials depleted: ${finalDepleted}`);
console.log(`Tools emerged: ${finalTools}`);
console.log(`Max reach: ${state.maxReach.toFixed(1)}m`);
console.log(`Max hardness: ${state.maxHardness.toFixed(1)} Mohs`);
console.log();

// Determine emergent outcome
let outcome: string;
if (finalCreatures === 0) {
  outcome = 'EXTINCTION - Population collapsed';
} else if (finalAccessible === state.materials.length) {
  outcome = 'TRANSCENDENCE - Full material access achieved';
} else if (finalAccessible > state.materials.length * 0.7 && finalTools >= 3) {
  outcome = 'MASTERY - High material access with advanced tools';
} else if (finalAccessible < state.materials.length * 0.4 && state.generation >= 100) {
  outcome = 'STAGNATION - Slow progress, limited access';
} else {
  outcome = 'IN PROGRESS - Evolution ongoing';
}

console.log(`EMERGENT OUTCOME: ${outcome}`);
console.log();
console.log('This outcome emerged from pure mathematics.');
console.log('No player input. No game layer. Just algorithms evolving.');
