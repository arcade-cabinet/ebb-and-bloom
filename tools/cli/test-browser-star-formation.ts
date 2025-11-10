/**
 * Test star formation in browser-like conditions
 * 
 * Simulates the CompleteBottomUpScene logic to verify stars will form
 */

import { EntropyAgent } from '../yuka-integration/agents/EntropyAgent';
import { AgentSpawner, AgentType } from '../yuka-integration/AgentSpawner';
import { DensityAgent } from '../yuka-integration/agents/DensityAgent';

const YEAR = 365.25 * 86400;

console.log('');
console.log('🌌 BROWSER STAR FORMATION TEST');
console.log('');
console.log('Simulating CompleteBottomUpScene logic:');
console.log('  1. EntropyAgent advances time with adaptive timeScale');
console.log('  2. At 380kyr: Spawn density field (1000 agents)');
console.log('  3. Agents collapse over 1 Myr (with scaled time)');
console.log('  4. Stars should form within reasonable frame count');
console.log('');

// Setup
const spawner = new AgentSpawner();
const entropyAgent = new EntropyAgent(spawner);
spawner.onStellarEpoch = async (state) => {
  console.log(`  🌟 STELLAR EPOCH! Age: ${(entropyAgent.age / YEAR / 1e6).toFixed(1)} Myr`);
};

// Simulate browser render loop
const browserDelta = 0.016; // 60 FPS
let frameCount = 0;
const maxFrames = 10000; // Reasonable limit
let densityFieldSpawned = false;
let starsFormed = false;

console.log('=== STARTING SIMULATION ===');
console.log('');

while (frameCount < maxFrames && !starsFormed) {
  frameCount++;
  
  // Update entropy agent (calculates adaptive timeScale)
  entropyAgent.update(browserDelta);
  
  // Update spawner with SCALED time
  const scaledDelta = browserDelta * entropyAgent.timeScale;
  await spawner.update(scaledDelta);
  
  // Check if we're in molecular era and need to spawn density field
  if (!densityFieldSpawned && entropyAgent.age >= 380000 * YEAR) {
    console.log(`\n🌫️  MOLECULAR ERA REACHED (age: ${(entropyAgent.age / YEAR / 1e6).toFixed(1)} Myr)`);
    console.log(`  Spawning density field (using browser scene mass values)...`);
    
    // Spawn density agents (browser scene spawns 1000, we'll test with 10 for speed)
    const count = 10;
    for (let i = 0; i < count; i++) {
      const baseDensity = 1e-16; // kg/m³ (FIXED value from scene)
      const variation = 1.0 + (Math.random() - 0.5);
      const density = baseDensity * variation;
      const temperature = 10 + Math.random() * 10; // 10-20 K
      const volume = 1e50; // m³ (FIXED value from scene)
      const mass = density * volume; // ~1e34 kg
      
      const agent = new DensityAgent(density, temperature, mass, spawner);
      agent.position.set(i * 100, 0, 0);
      spawner.getManager().add(agent);
      agent.start();
    }
    
    densityFieldSpawned = true;
    console.log(`  ✅ Spawned ${count} DensityAgents`);
    console.log(`  Mass range: ${(1e-16 * 0.5 * 1e50).toExponential(2)} - ${(1e-16 * 1.5 * 1e50).toExponential(2)} kg`);
    console.log(`  TimeScale: ${entropyAgent.timeScale.toExponential(2)}`);
    console.log(`  Scaled delta: ${scaledDelta.toExponential(2)} seconds/frame`);
    console.log(`  = ${(scaledDelta / YEAR / 1e6).toExponential(2)} Myr/frame`);
    console.log('');
  }
  
  // Check for star formation
  const stellarCount = spawner.getAgents(AgentType.STELLAR).length;
  if (stellarCount > 0) {
    starsFormed = true;
    console.log(`\n🎉 STARS FORMED!`);
    console.log(`  Frame: ${frameCount}`);
    console.log(`  Age: ${(entropyAgent.age / YEAR / 1e6).toFixed(1)} Myr`);
    console.log(`  Stars: ${stellarCount}`);
    console.log(`  TimeScale: ${entropyAgent.timeScale.toExponential(2)}`);
    console.log('');
  }
  
  // Progress log every 100 frames
  if (frameCount % 100 === 0) {
    const density = spawner.getAgents(AgentType.DENSITY);
    const stellar = spawner.getAgents(AgentType.STELLAR);
    console.log(`  Frame ${frameCount}: Age=${(entropyAgent.age / YEAR / 1e6).toFixed(1)} Myr, TimeScale=${entropyAgent.timeScale.toExponential(1)}, Density=${density.length}, Stars=${stellar.length}`);
  }
}

console.log('');
console.log('=== RESULTS ===');
console.log('');

if (starsFormed) {
  console.log(`✅ PASS: Stars formed in ${frameCount} frames`);
  console.log(`  Real time: ${(frameCount * 0.016).toFixed(1)} seconds at 60 FPS`);
  console.log(`  Universe age: ${(entropyAgent.age / YEAR / 1e6).toFixed(1)} Myr`);
  console.log('');
  console.log('🎉 Browser star formation SHOULD WORK!');
} else {
  console.log(`❌ FAIL: No stars formed in ${maxFrames} frames`);
  console.log(`  Universe age: ${(entropyAgent.age / YEAR / 1e6).toFixed(1)} Myr`);
  console.log(`  TimeScale: ${entropyAgent.timeScale.toExponential(2)}`);
  console.log('');
  console.log('⚠️  Stars may take too long to form in browser');
}

console.log('');

