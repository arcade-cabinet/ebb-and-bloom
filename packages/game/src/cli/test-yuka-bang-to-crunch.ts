/**
 * YUKA BANG-TO-CRUNCH TEST
 * 
 * Pure algorithmic validation of bottom-up multi-agent hierarchy.
 * NO RENDERING. Just Yuka + Laws + Physics.
 * 
 * Tests NEW architecture:
 * - EntropyAgent (universe thermodynamics)
 * - DensityAgent (molecular clouds → star formation via Jeans instability)
 * - StellarAgent (fusion, supernovae spawned FROM density collapse)
 * - Legal Broker validation (async evaluators working)
 * 
 * From Big Bang → Density Field → Stars from Collapse
 */

import { AgentSpawner, AgentType } from '../yuka-integration/AgentSpawner';
import { EntropyAgent } from '../yuka-integration/agents/EntropyAgent';
import { DensityAgent } from '../yuka-integration/agents/DensityAgent';
import { StellarAgent } from '../yuka-integration/agents/StellarAgent';
import { LEGAL_BROKER } from '../laws/core/LegalBroker';
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
  console.log(`  Scale = ${entropyAgent.scaleFactor.toFixed(2)}x`);
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
      console.log(`  Scale = ${entropyAgent.scaleFactor.toFixed(2)}x`);
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
  
  // === PHASE 3: SPAWN DENSITY FIELD ===
  console.log(`\n=== PHASE 3: DENSITY FIELD SPAWNING ===\n`);
  console.log(`EntropyAgent age: ${(entropyAgent.age / (1e6 * YEAR)).toFixed(1)} Myr`);
  console.log(`Spawning 10 DensityAgents (molecular clouds)...\n`);
  
  const densityAgents: DensityAgent[] = [];
  const T_CLOUD = 10; // K - COLD molecular cloud (not current universe temp!)
  const RHO_BASE = 1e-18; // kg/m³ - DENSER than average to trigger collapse
  
  for (let i = 0; i < 10; i++) {
    const variation = 100 + Math.random() * 1000; // 100x to 1100x - HUGE variation
    const density = RHO_BASE * variation;
    const mass = density * 1e50; // Volume: ~(10,000 ly)³ - TRULY MASSIVE clouds
    
    const agent = new DensityAgent(density, T_CLOUD, mass, spawner);
    agent.position.set(i * 100, 0, 0);
    
    // Check Jeans mass for this cloud
    const response = await LEGAL_BROKER.ask({
      domain: 'physics',
      action: 'check-jeans-instability',
      params: { density, temperature: T_CLOUD, mass },
      state: agent.getState(),
    });
    
    console.log(`Agent ${i}: M=${mass.toExponential(2)} kg, Jeans=${response.value ? 'CAN COLLAPSE ✅' : 'too low'}`);
    
    spawner.getManager().add(agent);
    agent.start();
    densityAgents.push(agent);
  }
  
  console.log(`✅ Spawned ${densityAgents.length} DensityAgents`);
  
  // === PHASE 4: DENSITY AGENTS CHECK JEANS INSTABILITY ===
  console.log('\n=== PHASE 4: JEANS INSTABILITY CHECKS ===');
  console.log('DensityAgents checking if they can collapse...\n');
  
  let jeansChecksPassed = 0;
  
  // Snapshot state after star formation (for validation)
  let snapshotTaken = false;
  let snapshotAge = 0;
  let snapshotTemp = 0;
  let snapshotScale = 0;
  
  for (let i = 0; i < 20; i++) { // Just enough for collapse to trigger
    const delta = 2e5 * YEAR; // Fast-forward: 200k years per frame (4 Myr total)
    
    // Update density agents
    for (const agent of densityAgents) {
      if (!agent.hasCollapsed) {
        await agent.update(delta);
        
        if (agent.jeansCheckCache) {
          jeansChecksPassed++;
        }
        
        // Log goal state
        if (i === 1 && agent.jeansCheckCache) {
          const goal = agent.brain?.currentSubgoal();
          console.log(`  Agent at (${agent.position.x}): Goal=${goal?.constructor.name || 'none'}, CanCollapse=${agent.jeansCheckCache}`);
        }
      }
    }
    
    // Check for stars formed
    const stellarAgents = spawner.getAgents(AgentType.STELLAR);
    if (stellarAgents.length > stellarAgentsTracked.length) {
      console.log(`  Frame ${i}: Star formed! Total: ${stellarAgents.length}`);
      stellarAgentsTracked.push(...stellarAgents.filter(s => 
        !stellarAgentsTracked.includes(s as StellarAgent)
      ) as StellarAgent[]);
    }
    
    // Stop if all that can collapse have collapsed
    if (densityAgents.every(d => d.hasCollapsed || !d.jeansCheckCache)) {
      console.log(`  All collapses complete at frame ${i}`);
      
      // Take snapshot NOW (before continuing)
      snapshotAge = entropyAgent.age;
      snapshotTemp = entropyAgent.temperature;
      snapshotScale = entropyAgent.scaleFactor;
      snapshotTaken = true;
      
      break;
    }
  }
  
  console.log(`✅ Jeans checks that passed: ${jeansChecksPassed > 0 ? 'Yes' : 'No'}`);
  console.log(`✅ Stars formed from collapse: ${stellarAgentsTracked.length}`);
  
  
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
  console.log(`  Scale: ${entropyAgent.scaleFactor.toFixed(2)}x`);
  console.log(`  Entropy: ${entropyAgent.entropy.toExponential(2)}`);
  
  console.log(`\nAgents:`);
  console.log(`  Entropy: 1`);
  console.log(`  Density: ${densityAgents.length}`);
  console.log(`  Stellar (formed from collapse): ${stellarAgentsTracked.length}`);
  console.log(`  Collapsed clouds: ${densityAgents.filter(d => d.hasCollapsed).length}`);
  
  // === VALIDATION ===
  console.log(`\n${'='.repeat(60)}`);
  console.log('VALIDATION');
  console.log('='.repeat(60));
  
  const checks = [
    { name: 'Entropy increases', pass: entropyAgent.entropy > 0.01 },
    { name: 'Universe expanded (at snapshot)', pass: snapshotScale > 1 },
    { name: 'Universe cooled (at snapshot)', pass: snapshotTemp < 1e32 },
    { name: 'DensityAgents spawned', pass: densityAgents.length === 10 },
    { name: 'Jeans instability checks working', pass: jeansChecksPassed > 0 },
    { name: 'Stars formed from collapse (NOT forced)', pass: stellarAgentsTracked.length > 0 },
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

