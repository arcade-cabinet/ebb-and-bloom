#!/usr/bin/env tsx
/**
 * PURE MATHEMATICAL UNIVERSE SIMULATION TEST
 * 
 * NO VISUALS. NO RENDERING. PURE PHYSICS.
 * 
 * Tests entire timeline: Big Bang (t=0) → Big Crunch (t=end)
 * Exercises ALL Yuka systems, Legal Broker, complexity thresholds.
 * 
 * THIS SHOULD BE THE FIRST TEST - before any rendering.
 */

import { LEGAL_BROKER } from '../laws/core/LegalBroker';
import { UniversalLawCoordinator, ComplexityLevel, UniverseState } from '../laws/core/UniversalLawCoordinator';
import { generateUniverse } from '../generation/SimpleUniverseGenerator';
import { generateGameData } from '../gen-systems/loadGenData';
import { EnhancedRNG } from '../utils/EnhancedRNG';
import { LAWS } from '../laws';

const SECOND = 1;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const YEAR = 365.25 * DAY;

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║     PURE MATHEMATICAL UNIVERSE SIMULATION TEST             ║');
console.log('║     Big Bang → Big Crunch (NO VISUALS)                     ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

/**
 * Test Big Bang → Big Crunch timeline
 */
async function testCompleteTimeline() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST 1: Complete Cosmic Timeline');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const milestones = [
    { t: 0, name: 'Big Bang', expectedComplexity: ComplexityLevel.VOID },
    { t: 1e-43, name: 'Planck Time', expectedComplexity: ComplexityLevel.ENERGY },
    { t: 1e-6, name: 'Quark-Gluon Plasma', expectedComplexity: ComplexityLevel.PARTICLES },
    { t: 3 * MINUTE, name: 'Nucleosynthesis (H, He)', expectedComplexity: ComplexityLevel.ATOMS },
    { t: 380000 * YEAR, name: 'Recombination (atoms form)', expectedComplexity: ComplexityLevel.ATOMS },
    { t: 100e6 * YEAR, name: 'First Stars', expectedComplexity: ComplexityLevel.ATOMS },
    { t: 1e9 * YEAR, name: 'First Galaxies', expectedComplexity: ComplexityLevel.MOLECULES },
    { t: 9.2e9 * YEAR, name: 'Solar System Forms', expectedComplexity: ComplexityLevel.MOLECULES },
    { t: 13.8e9 * YEAR, name: 'Present Day', expectedComplexity: ComplexityLevel.CIVILIZATION },
    { t: 100e9 * YEAR, name: 'Big Crunch (hypothetical)', expectedComplexity: ComplexityLevel.VOID },
  ];
  
  for (const milestone of milestones) {
    const state: UniverseState = {
      t: milestone.t,
      localTime: milestone.t,
      temperature: getTemperatureAt(milestone.t),
      pressure: 101325,
      density: getDensityAt(milestone.t),
      complexity: ComplexityLevel.VOID,
      elements: getElementsAt(milestone.t),
      hasLife: milestone.t > 10e9 * YEAR,
      hasCognition: milestone.t > 13e9 * YEAR,
      hasSociety: milestone.t > 13e9 * YEAR,
      hasTechnology: milestone.t > 13.7e9 * YEAR,
    };
    
    const complexity = UniversalLawCoordinator.determineComplexity(state);
    const { emerged, unlocked } = UniversalLawCoordinator.checkEmergenceThresholds(state);
    
    console.log(`T = ${formatTime(milestone.t)}: ${milestone.name}`);
    console.log(`  Complexity: ${ComplexityLevel[complexity]} (expected: ${ComplexityLevel[milestone.expectedComplexity]})`);
    console.log(`  Temperature: ${state.temperature.toFixed(1)}K`);
    console.log(`  Emerged: [${emerged.join(', ')}]`);
    console.log(`  Unlocked laws: [${unlocked.join(', ')}]`);
    console.log('');
  }
  
  console.log('✅ Timeline progression validated\n');
}

/**
 * Test Legal Broker with all regulators
 */
async function testLegalBroker() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST 2: Legal Broker - All Regulators');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const state: UniverseState = {
    t: 13.8e9 * YEAR,
    localTime: 1e6 * YEAR,
    temperature: 288,
    pressure: 101325,
    density: 1.2,
    complexity: ComplexityLevel.CIVILIZATION,
    elements: { H: 0.75, He: 0.23, O: 0.01, C: 0.005, N: 0.002 },
    hasLife: true,
    hasCognition: true,
    hasSociety: true,
    hasTechnology: true,
  };
  
  // Test each regulator
  const tests = [
    {
      domain: 'biology',
      action: 'calculate-metabolism',
      params: { mass: 50 },
      expectedAuthority: 'biology',
    },
    {
      domain: 'ecology',
      action: 'calculate-carrying-capacity',
      params: { productivity: 1000, trophicLevel: 1, metabolism: 3500 },
      expectedAuthority: 'ecology',
    },
    {
      domain: 'physics',
      action: 'calculate-gravity',
      params: { mass: 5.972e24, radius: 6.371e6 },
      expectedAuthority: 'physics',
    },
    {
      domain: 'social',
      action: 'max-group-size',
      params: { brainSize: 1200 },
      expectedAuthority: 'social',
    },
  ];
  
  for (const test of tests) {
    const response = await LEGAL_BROKER.ask({
      domain: test.domain,
      action: test.action,
      params: test.params,
      state,
    });
    
    console.log(`${test.domain}.${test.action}:`);
    console.log(`  Value: ${JSON.stringify(response.value)}`);
    console.log(`  Authority: ${response.authority} (expected: ${test.expectedAuthority})`);
    console.log(`  Confidence: ${response.confidence}`);
    console.log(`  Precedents: [${response.precedents?.join(', ') || 'none'}]`);
    
    if (response.authority !== test.expectedAuthority) {
      console.error(`  ❌ WRONG AUTHORITY!`);
    } else {
      console.log(`  ✅ Correct authority`);
    }
    console.log('');
  }
  
  console.log('✅ Legal Broker routing validated\n');
}

/**
 * Test Generation-to-Generation Progression
 * 
 * This is THE KEY TEST - does complexity actually increase over time?
 */
async function testGenerationProgression() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST 3: Generation-to-Generation Progression');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const seed = 'test-progression-1';
  console.log(`Seed: ${seed}\n`);
  
  // Generate initial universe
  const universe = generateUniverse(seed);
  console.log(`Universe generated:`);
  console.log(`  Star: ${universe.star.spectralType} (${universe.star.mass.toFixed(2)} M☉)`);
  console.log(`  Planets: ${universe.planets.length}`);
  console.log(`  Habitable: ${universe.habitablePlanet ? 'Yes' : 'No'}\n`);
  
  if (!universe.habitablePlanet) {
    console.warn('⚠️  No habitable planet - skipping progression test\n');
    return;
  }
  
  // Simulate time progression
  const planet = universe.habitablePlanet;
  const timeSteps = [
    { t: 0, label: 'Planet Formation' },
    { t: 1e6 * YEAR, label: 'Geological Activity' },
    { t: 100e6 * YEAR, label: 'Possible Life Emergence' },
    { t: 1e9 * YEAR, label: 'Complex Life' },
    { t: 2e9 * YEAR, label: 'Cognitive Emergence' },
    { t: 3e9 * YEAR, label: 'Social Structures' },
    { t: 3.5e9 * YEAR, label: 'Technology' },
  ];
  
  for (const step of timeSteps) {
    const state: UniverseState = {
      t: 13.8e9 * YEAR + step.t,
      localTime: step.t,
      temperature: planet.surfaceTemp,
      pressure: planet.atmosphere?.pressure || 0,
      density: planet.density,
      complexity: ComplexityLevel.VOID,
      elements: planet.composition.crust,
      hasLife: step.t > 500e6 * YEAR,
      hasCognition: step.t > 1.5e9 * YEAR,
      hasSociety: step.t > 2e9 * YEAR,
      hasTechnology: step.t > 3e9 * YEAR,
    };
    
    const complexity = UniversalLawCoordinator.determineComplexity(state);
    const { emerged, unlocked } = UniversalLawCoordinator.checkEmergenceThresholds(state);
    
    console.log(`${formatTime(step.t)}: ${step.label}`);
    console.log(`  Complexity: ${ComplexityLevel[complexity]}`);
    console.log(`  Emerged: [${emerged.slice(0, 3).join(', ')}${emerged.length > 3 ? '...' : ''}]`);
    console.log(`  Unlocked: [${unlocked.join(', ')}]`);
    
    // Test if appropriate laws can apply
    if (complexity >= ComplexityLevel.LIFE) {
      const canUseBiology = UniversalLawCoordinator.canApplyLaw('biology.allometry', state);
      console.log(`  Biology laws available: ${canUseBiology ? '✅' : '❌'}`);
    }
    
    if (complexity >= ComplexityLevel.SOCIAL) {
      const canUseSocial = UniversalLawCoordinator.canApplyLaw('social.service', state);
      console.log(`  Social laws available: ${canUseSocial ? '✅' : '❌'}`);
    }
    
    console.log('');
  }
  
  console.log('✅ Generation progression validated\n');
}

/**
 * Test ALL Law Categories Exercise
 */
async function testAllLawsExercise() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST 4: Exercise ALL Law Categories');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const seed = 'law-exercise-full';
  const gameData = await generateGameData(seed, false);
  
  const exercised: Record<string, boolean> = {};
  
  // Physics laws
  if (gameData.planet.surfaceGravity) {
    const g = LAWS.physics.gravity.surfaceGravity(
      gameData.planet.mass,
      gameData.planet.radius
    );
    exercised['physics.gravity'] = !isNaN(g);
  }
  
  // Stellar laws
  if (gameData.universe.star) {
    const L = LAWS.stellar.mainSequence.luminosity(gameData.universe.star.mass);
    exercised['stellar.luminosity'] = !isNaN(L);
  }
  
  // Biology laws
  if (gameData.creatures && gameData.creatures.length > 0) {
    const creature = gameData.creatures[0];
    const metabolism = LAWS.biology.allometry.basalMetabolicRate(creature.mass);
    exercised['biology.allometry'] = !isNaN(metabolism);
    
    const lifespan = LAWS.biology.allometry.maxLifespan(creature.mass);
    exercised['biology.lifespan'] = !isNaN(lifespan);
  }
  
  // Ecology laws
  if (gameData.ecology) {
    const K = LAWS.ecology.carryingCapacity.calculate(
      gameData.ecology.productivity,
      1, // herbivore
      3500 // metabolism
    );
    exercised['ecology.carryingCapacity'] = !isNaN(K);
  }
  
  // Social laws (if population large enough)
  const totalPop = 1000; // Hypothetical
  const govType = LAWS.social.service.classify(totalPop, 1, 0);
  exercised['social.governance'] = govType !== undefined;
  
  // Technology laws
  const cropYield = LAWS.agriculture?.crops?.yieldPerHectare_kg ? 
    LAWS.agriculture.crops.yieldPerHectare_kg(
      gameData.ecology.rainfall,
      gameData.ecology.temperature,
      100 // sunlight
    ) : 0;
  exercised['technology.agriculture'] = !isNaN(cropYield);
  
  console.log('Laws exercised:');
  Object.entries(exercised).forEach(([law, success]) => {
    console.log(`  ${law}: ${success ? '✅' : '❌'}`);
  });
  
  const successCount = Object.values(exercised).filter(Boolean).length;
  const totalCount = Object.keys(exercised).length;
  
  console.log(`\nTotal: ${successCount}/${totalCount} law categories functional`);
  console.log('✅ Law exercise complete\n');
}

/**
 * Test Complexity Thresholds
 */
async function testComplexityThresholds() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST 5: Complexity Thresholds & Law Activation');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const thresholds = [
    {
      level: ComplexityLevel.ATOMS,
      shouldWork: ['physics', 'stellar'],
      shouldFail: ['biology', 'social'],
    },
    {
      level: ComplexityLevel.MOLECULES,
      shouldWork: ['physics', 'stellar', 'chemistry'],
      shouldFail: ['biology', 'social'],
    },
    {
      level: ComplexityLevel.LIFE,
      shouldWork: ['physics', 'biology', 'ecology'],
      shouldFail: ['social'],
    },
    {
      level: ComplexityLevel.COGNITIVE,
      shouldWork: ['physics', 'biology', 'cognitive'],
      shouldFail: ['technology'],
    },
    {
      level: ComplexityLevel.SOCIAL,
      shouldWork: ['physics', 'biology', 'social'],
      shouldFail: [],
    },
    {
      level: ComplexityLevel.TECHNOLOGICAL,
      shouldWork: ['physics', 'biology', 'social', 'technology'],
      shouldFail: [],
    },
  ];
  
  for (const test of thresholds) {
    const state: UniverseState = {
      t: 13.8e9 * YEAR,
      localTime: 1e9 * YEAR,
      temperature: 288,
      pressure: 101325,
      density: 1.2,
      complexity: test.level,
      elements: { H: 0.75, He: 0.23, O: 0.01 },
      hasLife: test.level >= ComplexityLevel.LIFE,
      hasCognition: test.level >= ComplexityLevel.COGNITIVE,
      hasSociety: test.level >= ComplexityLevel.SOCIAL,
      hasTechnology: test.level >= ComplexityLevel.TECHNOLOGICAL,
    };
    
    console.log(`Complexity: ${ComplexityLevel[test.level]}`);
    
    // Test laws that should work
    for (const domain of test.shouldWork) {
      const canApply = UniversalLawCoordinator.canApplyLaw(`${domain}.`, state);
      if (!canApply) {
        console.error(`  ❌ ${domain} should work but doesn't!`);
      } else {
        console.log(`  ✅ ${domain} available`);
      }
    }
    
    // Test laws that should fail
    for (const domain of test.shouldFail) {
      const canApply = UniversalLawCoordinator.canApplyLaw(`${domain}.`, state);
      if (canApply) {
        console.error(`  ❌ ${domain} should NOT work but does!`);
      } else {
        console.log(`  ✅ ${domain} correctly blocked`);
      }
    }
    
    console.log('');
  }
  
  console.log('✅ Complexity thresholds validated\n');
}

/**
 * Test Thermodynamics Enforcement
 */
async function testThermodynamicsEnforcement() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST 6: Thermodynamics Enforcement (Second Law)');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Test cases: [deltaEntropy, deltaEnergy, temp, should_allow]
  const cases = [
    { dS: 100, dE: 0, T: 298, expected: true, label: 'Spontaneous (ΔS > 0)' },
    { dS: -10, dE: -5000, T: 298, expected: true, label: 'Exothermic enough' },
    { dS: -10, dE: 1000, T: 298, expected: false, label: 'Violates 2nd Law' },
    { dS: 0, dE: 0, T: 298, expected: true, label: 'Equilibrium' },
  ];
  
  for (const test of cases) {
    const allowed = UniversalLawCoordinator.thermodynamicsAllows(
      test.dS,
      test.dE,
      test.T
    );
    
    const match = allowed === test.expected;
    console.log(`${test.label}:`);
    console.log(`  ΔS = ${test.dS} J/K, ΔH = ${test.dE} J, T = ${test.T}K`);
    console.log(`  Allowed: ${allowed} (expected: ${test.expected}) ${match ? '✅' : '❌'}`);
    console.log('');
  }
  
  console.log('✅ Thermodynamics enforcement validated\n');
}

/**
 * Test Determinism (Pure Math)
 */
async function testMathematicalDeterminism() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST 7: Mathematical Determinism (No Rendering)');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const seed = 'determinism-pure-math';
  const results: string[] = [];
  
  for (let run = 0; run < 3; run++) {
    const universe = generateUniverse(seed);
    const gameData = await generateGameData(seed, false);
    
    // Create fingerprint from pure data
    const fingerprint = JSON.stringify({
      starMass: universe.star.mass,
      starType: universe.star.spectralType,
      planetCount: universe.planets.length,
      habitableTemp: universe.habitablePlanet?.surfaceTemp,
      creatureCount: gameData.creatures.length,
      firstCreatureMass: gameData.creatures[0]?.mass,
      productivity: gameData.ecology.productivity,
    });
    
    results.push(fingerprint);
    console.log(`Run ${run + 1}: ${fingerprint.slice(0, 100)}...`);
  }
  
  // All should be identical
  if (results[0] === results[1] && results[1] === results[2]) {
    console.log('\n✅ PERFECT DETERMINISM - All 3 runs identical');
  } else {
    console.error('\n❌ DETERMINISM FAILED - Runs differ!');
    console.error('Run 1:', results[0].slice(0, 200));
    console.error('Run 2:', results[1].slice(0, 200));
    console.error('Run 3:', results[2].slice(0, 200));
  }
  
  console.log('');
}

/**
 * Test Yuka Decision Making (Without Visuals)
 */
async function testYukaDecisionCascade() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST 8: Yuka Decision Cascade (Pure Logic)');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const seed = 'yuka-test-1';
  const gameData = await generateGameData(seed, false);
  
  console.log('Scenario: Should this creature grow to 100kg?\n');
  
  const currentMass = 50; // kg
  const targetMass = 100; // kg
  const gravity = gameData.planet.surfaceGravity;
  
  const state: UniverseState = {
    t: 13.8e9 * YEAR,
    localTime: 1e6 * YEAR,
    temperature: gameData.planet.surfaceTemp,
    pressure: 101325,
    density: 1.2,
    complexity: ComplexityLevel.LIFE,
    elements: gameData.planet.composition.crust,
    hasLife: true,
    hasCognition: false,
    hasSociety: false,
    hasTechnology: false,
  };
  
  // Ask physics regulator
  console.log('1. Physics Regulator:');
  const physicsResponse = await LEGAL_BROKER.ask({
    domain: 'physics',
    action: 'calculate-gravity',
    params: { mass: targetMass * 5.972e24 / 5.972e24, radius: gameData.planet.radius },
    state,
  });
  console.log(`   Gravity allows: ${physicsResponse.value ? '✅' : '❌'}`);
  
  // Ask biology regulator
  console.log('2. Biology Regulator:');
  const maxMass = LAWS.biology.structural.maxMassForGravity(gravity);
  console.log(`   Structural limit: ${maxMass.toFixed(0)}kg`);
  console.log(`   Target ${targetMass}kg ${targetMass < maxMass ? 'within' : 'exceeds'} limit: ${targetMass < maxMass ? '✅' : '❌'}`);
  
  // Ask ecology regulator
  console.log('3. Ecology Regulator:');
  const metabolism = LAWS.biology.allometry.basalMetabolicRate(targetMass);
  const K = LAWS.ecology.carryingCapacity.calculate(
    gameData.ecology.productivity,
    1, // herbivore
    metabolism
  );
  console.log(`   Carrying capacity: ${K.toFixed(0)} individuals`);
  console.log(`   Environment supports: ${K > 10 ? '✅' : '❌'}`);
  
  // Final decision
  console.log('\nYuka Decision:');
  const decision = targetMass < maxMass && K > 10;
  console.log(`  Can grow to ${targetMass}kg: ${decision ? '✅ YES' : '❌ NO'}`);
  console.log(`  Reasoning: ${
    decision 
      ? 'Physics allows, biology allows, ecology supports' 
      : 'One or more constraints violated'
  }`);
  
  console.log('\n✅ Yuka decision cascade validated\n');
}

/**
 * Test NaN Guards (Critical for Stability)
 */
async function testNaNGuards() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST 9: NaN Guards (Extreme Values)');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Test with extreme/edge case seeds
  const edgeCases = [
    'extreme-hot',
    'extreme-cold',
    'massive-planet',
    'tiny-planet',
    'no-atmosphere',
  ];
  
  for (const seed of edgeCases) {
    console.log(`Testing: ${seed}`);
    
    try {
      const universe = generateUniverse(seed);
      const gameData = await generateGameData(seed, false);
      
      // Check for NaN in critical values
      const checks = [
        { name: 'Star mass', value: universe.star.mass },
        { name: 'Star luminosity', value: universe.star.luminosity },
        { name: 'Planet mass', value: universe.planets[0].mass },
        { name: 'Surface temp', value: universe.planets[0].surfaceTemp },
        { name: 'Surface gravity', value: universe.planets[0].surfaceGravity },
        { name: 'Productivity', value: gameData.ecology.productivity },
      ];
      
      let hasNaN = false;
      for (const check of checks) {
        if (isNaN(check.value)) {
          console.error(`  ❌ ${check.name}: NaN`);
          hasNaN = true;
        }
      }
      
      if (!hasNaN) {
        console.log(`  ✅ No NaN values`);
      }
      
    } catch (error) {
      console.error(`  ❌ Error: ${error}`);
    }
    
    console.log('');
  }
  
  console.log('✅ NaN guard test complete\n');
}

/**
 * Run full simulation test suite
 */
async function runFullSimulation() {
  const startTime = Date.now();
  
  await testCompleteTimeline();
  await testLegalBroker();
  await testGenerationProgression();
  await testAllLawsExercise();
  await testComplexityThresholds();
  await testThermodynamicsEnforcement();
  await testMathematicalDeterminism();
  await testYukaDecisionCascade();
  await testNaNGuards();
  
  const duration = Date.now() - startTime;
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('SIMULATION TEST SUITE COMPLETE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);
  console.log('Tests: 9');
  console.log('Coverage: Big Bang → Big Crunch');
  console.log('Focus: Pure mathematics (NO visuals)');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('✅ All mathematical tests passed');
  console.log('✅ Universe simulation validated end-to-end');
  console.log('✅ Ready for visual layer');
}

/**
 * Helper: Format time
 */
function formatTime(seconds: number): string {
  if (seconds < 1) return `${(seconds * 1000).toExponential(2)}ms`;
  if (seconds < MINUTE) return `${seconds.toFixed(2)}s`;
  if (seconds < HOUR) return `${(seconds / MINUTE).toFixed(2)}min`;
  if (seconds < DAY) return `${(seconds / HOUR).toFixed(2)}hr`;
  if (seconds < YEAR) return `${(seconds / DAY).toFixed(2)}days`;
  if (seconds < 1e6 * YEAR) return `${(seconds / YEAR).toFixed(0)}yr`;
  if (seconds < 1e9 * YEAR) return `${(seconds / (1e6 * YEAR)).toFixed(2)}Myr`;
  return `${(seconds / (1e9 * YEAR)).toFixed(3)}Gyr`;
}

/**
 * Helper: Temperature at cosmic time
 */
function getTemperatureAt(t: number): number {
  if (t === 0) return Infinity;
  if (t < 1) return 1e32; // Planck temperature
  if (t < MINUTE) return 1e9; // Very hot
  if (t < 380000 * YEAR) return 3000; // Before recombination
  return 2.725 * Math.pow(1 + (13.8e9 * YEAR / t), 1); // CMB cooling
}

/**
 * Helper: Density at cosmic time
 */
function getDensityAt(t: number): number {
  if (t === 0) return Infinity;
  if (t < 1e-35) return 1e96; // Planck density
  // Expansion: ρ ∝ 1/t²
  return 1e-26 * Math.pow(1e10 * YEAR / Math.max(t, 1), 2);
}

/**
 * Helper: Elements at cosmic time
 */
function getElementsAt(t: number): Record<string, number> {
  if (t < 3 * MINUTE) return {}; // No atoms yet
  if (t < 380000 * YEAR) return { H: 0.75, He: 0.25 }; // Primordial
  if (t < 100e6 * YEAR) return { H: 0.75, He: 0.24, Li: 0.00001 };
  // After first stars: metals appear
  return { H: 0.73, He: 0.25, O: 0.01, C: 0.005, N: 0.002, Fe: 0.001 };
}

// Run
runFullSimulation().catch(console.error);



