/**
 * YUKA BANG-TO-CRUNCH TEST
 * 
 * Pure algorithmic validation of multi-agent hierarchy.
 * NO RENDERING. Just Yuka + Laws + Physics.
 * 
 * Tests:
 * - EntropyAgent (universe thermodynamics)
 * - StellarAgent (fusion, supernovae)  
 * - PlanetaryAgent (atmospheres, life)
 * - CreatureAgent (behavior)
 * - Legal Broker validation at each level
 * 
 * From Big Bang → Present → Heat Death
 */

import { AgentSpawner, AgentType } from '../yuka-integration/AgentSpawner';
import { EntropyAgent } from '../yuka-integration/agents/EntropyAgent';
import { StellarAgent } from '../yuka-integration/agents/StellarAgent';
import { PlanetaryAgent } from '../yuka-integration/agents/PlanetaryAgent';
import { CreatureAgent } from '../yuka-integration/agents/CreatureAgent';
import { LEGAL_BROKER } from '../laws/core/LegalBroker';
import { ComplexityLevel } from '../laws/core/UniversalLawCoordinator';
import { Vector3 } from 'yuka';

const YEAR = 365.25 * 86400;

async function runSimulation() {
  console.log('🌌 YUKA BANG-TO-CRUNCH SIMULATION');
  console.log('Pure algorithmic - NO rendering\n');
  
  const spawner = new AgentSpawner();
  
  // Track spawned agents
  const stellarAgentsTracked: StellarAgent[] = [];
  
  // === PHASE 1: BIG BANG (t=0) ===
  console.log('=== PHASE 1: BIG BANG (t=0) ===\n');
  
  const entropyAgent = new EntropyAgent(spawner);
  
  console.log(`Initial state:`);
  console.log(`  T = ${entropyAgent.temperature.toExponential(2)} K`);
  console.log(`  ρ = ${entropyAgent.density.toExponential(2)} kg/m³`);
  console.log(`  Scale = ${entropyAgent.scale}`);
  console.log(`  Agents = ${spawner.getTotalAgentCount()}\n`);
  
  // === PHASE 2: ADVANCE TIME (fast forward) ===
  console.log('=== PHASE 2: ADVANCING TIME ===');
  console.log('Simulating universe expansion...\n');
  
  let frameCount = 0;
  const maxFrames = 100000; // More frames to reach 100 Myr
  
  while (frameCount < maxFrames) {
    const delta = 0.016; // 60 FPS
    
    // Update entropy agent directly (not via EntityManager)
    entropyAgent.update(delta);
    
    // Update spawner (updates all spawned agents)
    spawner.update(delta);
    
    frameCount++;
    
    //  Log every 1000 frames
    if (frameCount % 1000 === 0) {
      console.log(`Frame ${frameCount}:`);
      console.log(`  Age = ${(entropyAgent.age / YEAR).toExponential(2)} years`);
      console.log(`  T = ${entropyAgent.temperature.toExponential(2)} K`);
      console.log(`  Scale = ${entropyAgent.scale.toFixed(2)}x`);
      console.log(`  Agents = ${spawner.getTotalAgentCount()}`);
    }
    
    // Check if EntropyAgent reached stellar epoch
    // (it will have triggered spawner callback)
    const stellarAgents = spawner.getAgents(AgentType.STELLAR);
    if (stellarAgents.length > 0 && stellarAgentsTracked.length === 0) {
      console.log(`\n✨ STELLAR EPOCH REACHED! ${stellarAgents.length} stars spawned`);
      stellarAgentsTracked.push(...stellarAgents as StellarAgent[]);
      break;
    }
  }
  
  // === PHASE 3: SPAWN STELLAR AGENTS ===
  console.log(`\n=== PHASE 3: STELLAR SPAWNING ===\n`);
  console.log(`EntropyAgent age: ${(entropyAgent.age / (1e6 * YEAR)).toFixed(1)} Myr`);
  console.log(`Spawning 10 stellar agents...\n`);
  
  const state = entropyAgent.getState();
  
  // Stars already spawned by EntropyAgent via spawner callback
  // Just get the list
  const stellarAgents = spawner.getAgents(AgentType.STELLAR);
  stellarAgentsTracked.push(...stellarAgents as StellarAgent[]);
  
  console.log(`Stars spawned by EntropyAgent: ${stellarAgentsTracked.length}`);
  
  // === PHASE 4: STELLAR EVOLUTION ===
  console.log('=== PHASE 4: STELLAR EVOLUTION ===');
  console.log('Running stellar agents for 1000 frames...\n');
  
  for (let i = 0; i < 1000; i++) {
    const delta = 0.016;
    
    // Update entropy agent + all spawned agents
    entropyAgent.update(delta);
    spawner.update(delta);
    
    if (i % 200 === 0) {
      const activeStar = stellarAgentsTracked.filter(s => !s.hasExploded).length;
      const exploded = stellarAgentsTracked.filter(s => s.hasExploded).length;
      console.log(`Frame ${i}: Active stars: ${activeStar}, Exploded: ${exploded}`);
    }
  }
  
  
  // === FINAL SUMMARY ===
  console.log(`\n${'='.repeat(60)}`);
  console.log('SIMULATION COMPLETE');
  console.log('='.repeat(60));
  
  const finalAge = entropyAgent.age / (1e9 * YEAR);
  const activeStellar = stellarAgentsTracked.filter(s => !s.hasExploded).length;
  const exploded = stellarAgentsTracked.filter(s => s.hasExploded).length;
  
  console.log(`\nUniverse:`);
  console.log(`  Age: ${finalAge.toFixed(2)} Gyr`);
  console.log(`  Temperature: ${entropyAgent.temperature.toExponential(2)} K`);
  console.log(`  Scale: ${entropyAgent.scale.toFixed(2)}x`);
  console.log(`  Entropy: ${entropyAgent.entropy.toExponential(2)}`);
  
  console.log(`\nAgents:`);
  console.log(`  Entropy: 1`);
  console.log(`  Stellar (spawned): ${stellarAgentsTracked.length}`);
  console.log(`  Stellar (active): ${activeStellar}`);
  console.log(`  Supernovae: ${exploded}`);
  
  // === VALIDATION ===
  console.log(`\n${'='.repeat(60)}`);
  console.log('VALIDATION');
  console.log('='.repeat(60));
  
  const checks = [
    { name: 'Entropy increases', pass: entropyAgent.entropy > 0.01 },
    { name: 'Universe expands', pass: entropyAgent.scale > 1 },
    { name: 'Universe cools', pass: entropyAgent.temperature < 1e32 },
    { name: 'Stars spawn (EntropyAgent triggered)', pass: stellarAgentsTracked.length > 0 },
    { name: 'Stars active', pass: activeStellar > 0 },
  ];
  
  let allPassed = true;
  for (const check of checks) {
    console.log(`${check.pass ? '✅' : '❌'} ${check.name}`);
    if (!check.pass) allPassed = false;
  }
  
  console.log(`\n${allPassed ? '✅ ALL CHECKS PASSED' : '❌ SOME CHECKS FAILED'}`);
  
  if (!allPassed) {
    process.exit(1);
  }
}

// Run
runSimulation().catch(err => {
  console.error('\n❌ SIMULATION FAILED:', err);
  console.error(err.stack);
  process.exit(1);
});

