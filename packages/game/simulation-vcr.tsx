#!/usr/bin/env tsx
/**
 * 📊 Simulation Reports - Interactive VCR Controls! 📼
 * Run: tsx simulation-vcr.tsx
 * 
 * Controls:
 *   ⏮️  [Q] - Restart simulation
 *   ⏪ [A] - Step backward (10 cycles)
 *   ⏯️  [SPACE] - Play/Pause
 *   ⏩ [D] - Step forward (10 cycles)
 *   ⏭️  [E] - Jump to end
 *   🔄 [R] - New random seed
 *   ❌ [X] - Exit
 */

import { generateGameData } from './src/gen-systems/loadGenData.js';
import { EnhancedRNG } from './src/utils/EnhancedRNG.js';
import * as readline from 'readline';

// Terminal colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

interface SimulationState {
  cycle: number;
  year: number;
  preyPop: number;
  predPop: number;
  events: string[];
}

let seed = process.argv[2] || `world-${Date.now()}`;
let worldData: any = null;
let history: SimulationState[] = [];
let currentIndex = 0;
let isPlaying = false;
let playInterval: NodeJS.Timeout | null = null;

// Setup readline for key input
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

async function loadWorld() {
  console.clear();
  console.log(colors.cyan + '⏳ Generating universe...' + colors.reset);
  worldData = await generateGameData(seed);
  
  // Initialize history
  history = [];
  const pd = worldData.populationDynamics;
  let preyPop = pd?.initialConditions?.prey || 10000;
  let predPop = pd?.initialConditions?.predator || 500;
  
  const rng = new EnhancedRNG(seed);
  
  // Pre-generate 100 cycles
  for (let cycle = 0; cycle <= 100; cycle++) {
    const events: string[] = [];
    
    if (cycle > 0) {
      // Lotka-Volterra simulation
      const dt = 0.1;
      const alpha = 0.1;
      const beta = 0.002;
      const delta = 0.001;
      const gamma = 0.05;
      
      const dPrey = (alpha * preyPop - beta * preyPop * predPop) * dt;
      const dPred = (delta * preyPop * predPop - gamma * predPop) * dt;
      
      preyPop += dPrey;
      predPop += dPred;
      
      // Random events
      if (rng.uniform(0, 1) < 0.1) {
        events.push('🌡️  Climate shift (-10% prey)');
        preyPop *= 0.9;
      }
      if (rng.uniform(0, 1) < 0.05) {
        events.push('💥 Catastrophe (-30% all)');
        preyPop *= 0.7;
        predPop *= 0.8;
      }
      
      // Extinctions
      if (preyPop < 100) {
        preyPop = 0;
        events.push('☠️  PREY EXTINCT');
      }
      if (predPop < 10) {
        predPop = 0;
        events.push('☠️  PREDATOR EXTINCT');
      }
    }
    
    history.push({
      cycle,
      year: cycle * 100,
      preyPop: Math.max(0, preyPop),
      predPop: Math.max(0, predPop),
      events,
    });
    
    if (preyPop === 0 && predPop === 0) break;
  }
  
  currentIndex = 0;
  render();
}

function render() {
  console.clear();
  
  const state = history[currentIndex];
  const planet = worldData.planet;
  const creatures = worldData.creatures;
  
  // Header
  console.log(colors.bright + colors.cyan);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          EBB & BLOOM - SIMULATION VCR 📼                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);
  
  // Seed info
  console.log(colors.dim + `Seed: ${seed}` + colors.reset);
  console.log();
  
  // Current state header
  console.log(colors.bright + `═══ CYCLE ${state.cycle} | YEAR ${state.year} ═══` + colors.reset);
  console.log();
  
  // Planet info (compact)
  console.log(colors.blue + `🌍 ${planet.name}` + colors.reset + colors.dim + ` (${planet.radius.toFixed(1)} R⊕, ${(planet.surfaceTemperature - 273).toFixed(0)}°C)` + colors.reset);
  console.log();
  
  // Population
  console.log(colors.green + '📈 POPULATION' + colors.reset);
  console.log(`Prey:     ${colors.bright}${Math.floor(state.preyPop).toLocaleString().padStart(8)}${colors.reset} ${renderBar(state.preyPop, 15000, 40)}`);
  console.log(`Predator: ${colors.bright}${Math.floor(state.predPop).toLocaleString().padStart(8)}${colors.reset} ${renderBar(state.predPop, 1000, 40)}`);
  console.log();
  
  // Species count
  console.log(colors.yellow + `🦎 Species: ${creatures.length}` + colors.reset + colors.dim + ` (${creatures.map((c: any) => c.name).join(', ')})` + colors.reset);
  console.log();
  
  // Events
  if (state.events.length > 0) {
    console.log(colors.red + '📋 EVENTS:' + colors.reset);
    state.events.forEach(event => console.log('  ' + event));
    console.log();
  }
  
  // Mini timeline
  console.log(colors.dim + 'Timeline:' + colors.reset);
  console.log(renderTimeline());
  console.log();
  
  // VCR Controls
  console.log(colors.bright + '═══════════════════════════════════════════════════════════' + colors.reset);
  console.log(colors.cyan + '📼 VCR CONTROLS' + colors.reset);
  console.log(colors.bright + '═══════════════════════════════════════════════════════════' + colors.reset);
  console.log();
  console.log(`  ${colors.magenta}⏮️  [Q]${colors.reset} Restart   ${colors.magenta}⏪ [A]${colors.reset} -10 cycles   ${colors.magenta}${isPlaying ? '⏸️  [SPACE]' : '⏯️  [SPACE]'}${colors.reset} ${isPlaying ? 'Pause' : 'Play'}   ${colors.magenta}⏩ [D]${colors.reset} +10 cycles   ${colors.magenta}⏭️  [E]${colors.reset} End`);
  console.log();
  console.log(`  ${colors.yellow}🔄 [R]${colors.reset} New seed   ${colors.red}❌ [X]${colors.reset} Exit`);
  console.log();
  
  if (isPlaying) {
    console.log(colors.green + '  ▶️  PLAYING...' + colors.reset);
  }
}

function renderBar(value: number, max: number, width: number): string {
  const filled = Math.floor((value / max) * width);
  const bar = '█'.repeat(Math.max(0, filled)) + '░'.repeat(Math.max(0, width - filled));
  return colors.dim + bar + colors.reset;
}

function renderTimeline(): string {
  const width = 50;
  const progress = currentIndex / (history.length - 1);
  const pos = Math.floor(progress * width);
  
  let line = '';
  for (let i = 0; i < width; i++) {
    if (i === pos) {
      line += colors.bright + colors.cyan + '█' + colors.reset;
    } else if (i < pos) {
      line += colors.dim + '▓' + colors.reset;
    } else {
      line += colors.dim + '░' + colors.reset;
    }
  }
  
  return `[${line}] ${currentIndex}/${history.length - 1}`;
}

function stepForward(steps: number = 1) {
  currentIndex = Math.min(currentIndex + steps, history.length - 1);
  render();
}

function stepBackward(steps: number = 1) {
  currentIndex = Math.max(currentIndex - steps, 0);
  render();
}

function restart() {
  currentIndex = 0;
  render();
}

function jumpToEnd() {
  currentIndex = history.length - 1;
  render();
}

function togglePlay() {
  isPlaying = !isPlaying;
  
  if (isPlaying) {
    playInterval = setInterval(() => {
      if (currentIndex < history.length - 1) {
        stepForward(1);
      } else {
        togglePlay();
      }
    }, 200); // 5 FPS
  } else {
    if (playInterval) {
      clearInterval(playInterval);
      playInterval = null;
    }
    render();
  }
}

async function newSeed() {
  seed = `world-${Date.now()}`;
  await loadWorld();
}

// Key handler
process.stdin.on('keypress', async (_str, key) => {
  if (!key) return;
  
  if (key.name === 'x' || (key.ctrl && key.name === 'c')) {
    process.exit(0);
  }
  
  if (isPlaying && key.name !== 'space') return;
  
  switch (key.name) {
    case 'q':
      restart();
      break;
    case 'a':
      stepBackward(10);
      break;
    case 'd':
      stepForward(10);
      break;
    case 'e':
      jumpToEnd();
      break;
    case 'space':
      togglePlay();
      break;
    case 'r':
      if (playInterval) {
        clearInterval(playInterval);
        playInterval = null;
        isPlaying = false;
      }
      await newSeed();
      break;
    case 'left':
      stepBackward(1);
      break;
    case 'right':
      stepForward(1);
      break;
  }
});

// Start
loadWorld().catch(console.error);
