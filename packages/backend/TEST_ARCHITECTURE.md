# TEST ARCHITECTURE: PROVING THE SYSTEM WORKS

## The Goal

**Prove that Yuka-driven emergence works from Gen 0 to Gen 6.**

**NOT by scripting exact outcomes.**

**BY proving:**
1. Deterministic seeding produces identical starting structures
2. Yuka makes valid (but varied) decisions
3. Generation mechanics progress correctly
4. Emergence happens when conditions are met

---

## Test Layers

### Layer 1: Unit Tests (Pure Algorithms)

```typescript
describe('PerlinNoise', () => {
  it('produces deterministic output for same seed', () => {
    const noise1 = new PerlinNoise('seed123');
    const noise2 = new PerlinNoise('seed123');
    
    expect(noise1.noise3D(0, 0, 0)).toBe(noise2.noise3D(0, 0, 0));
    expect(noise1.noise3D(100, 200, 300)).toBe(noise2.noise3D(100, 200, 300));
  });
  
  it('produces different output for different seeds', () => {
    const noise1 = new PerlinNoise('seed123');
    const noise2 = new PerlinNoise('seed456');
    
    expect(noise1.noise3D(0, 0, 0)).not.toBe(noise2.noise3D(0, 0, 0));
  });
});

describe('FuzzyModule', () => {
  it('evaluates tool emergence correctly', () => {
    const fuzzy = new ToolEmergenceFuzzy();
    
    // High pressure → high desirability
    expect(fuzzy.evaluate(0.9, 0.3)).toBeGreaterThan(0.7);
    
    // Low pressure → low desirability
    expect(fuzzy.evaluate(0.1, 0.3)).toBeLessThan(0.3);
  });
});
```

**Proves:** Individual algorithms work correctly in isolation.

---

### Layer 2: Integration Tests (System Interactions)

```typescript
describe('Gen 0: Accretion Simulation', () => {
  it('produces identical planet structure for same seed', async () => {
    const planet1 = await AccretionSimulation.run({ seed: 'test-seed-1', cycles: 1000 });
    const planet2 = await AccretionSimulation.run({ seed: 'test-seed-1', cycles: 1000 });
    
    // Structure should be IDENTICAL
    expect(planet1.layers).toEqual(planet2.layers);
    expect(planet1.radius).toBe(planet2.radius);
    expect(planet1.compositionHistory.length).toBe(planet2.compositionHistory.length);
  });
  
  it('produces different planets for different seeds', async () => {
    const planet1 = await AccretionSimulation.run({ seed: 'test-seed-1', cycles: 1000 });
    const planet2 = await AccretionSimulation.run({ seed: 'test-seed-2', cycles: 1000 });
    
    // Structure should be DIFFERENT
    expect(planet1.layers).not.toEqual(planet2.layers);
  });
  
  it('produces realistic planetary composition', async () => {
    const planet = await AccretionSimulation.run({ seed: 'test-seed-1', cycles: 1000 });
    
    // Should have core, mantle, crust
    expect(planet.layers.length).toBeGreaterThan(3);
    
    // Core should be densest
    const core = planet.layers.find(l => l.name === 'core');
    const crust = planet.layers.find(l => l.name === 'crust');
    expect(core.density).toBeGreaterThan(crust.density);
    
    // Should have iron in core
    const coreMaterial = core.materials.find(m => m.type === 'iron');
    expect(coreMaterial).toBeDefined();
    expect(coreMaterial.percentage).toBeGreaterThan(0.5);
  });
});

describe('Gen 1: Creature Spawning', () => {
  it('spawns creatures deterministically from archetypes', () => {
    const planet = createTestPlanet('seed-1');
    const gen1 = new Gen1System(planet);
    
    const result1 = gen1.spawnCreatures({ seed: 'creature-seed-1', count: 10 });
    const result2 = gen1.spawnCreatures({ seed: 'creature-seed-1', count: 10 });
    
    // Same spawn locations
    expect(result1.creatures.map(c => c.position)).toEqual(result2.creatures.map(c => c.position));
    
    // Same archetypes
    expect(result1.creatures.map(c => c.archetype)).toEqual(result2.creatures.map(c => c.archetype));
  });
  
  it('creatures have valid composition from planet materials', () => {
    const planet = createTestPlanet('seed-1');
    const gen1 = new Gen1System(planet);
    
    const result = gen1.spawnCreatures({ seed: 'creature-seed-1', count: 10 });
    
    for (const creature of result.creatures) {
      // Composition should be non-zero
      expect(creature.composition.carbon).toBeGreaterThan(0);
      expect(creature.composition.water).toBeGreaterThan(0);
      
      // Materials should exist on planet
      const coord = planet.getCoordinate(creature.position);
      expect(coord.materials.some(m => m.type === 'carbon' || m.type === 'organic_matter')).toBe(true);
    }
  });
});
```

**Proves:** Systems interact correctly, deterministic seeding works, structures are valid.

---

### Layer 3: End-to-End Tests (Full Generation Progression)

```typescript
describe('Gen 0 → Gen 1 Progression', () => {
  it('advances from planet formation to creatures', async () => {
    // Gen 0: Create planet
    const planet = await AccretionSimulation.run({ seed: 'e2e-seed-1', cycles: 1000 });
    
    expect(planet.status).toBe('formed');
    expect(planet.layers.length).toBeGreaterThan(0);
    
    // Gen 1: Spawn creatures
    const gen1 = new Gen1System(planet);
    const result = gen1.spawnCreatures({ count: 100 });
    
    expect(result.creatures.length).toBe(100);
    expect(result.generation).toBe(1);
    
    // Creatures should have goals
    for (const creature of result.creatures) {
      expect(creature.brain.subgoals.length).toBeGreaterThan(0);
    }
  });
});

describe('Gen 1 → Gen 2 Progression', () => {
  it('advances from individuals to packs when beneficial', async () => {
    const game = await createTestGame('e2e-pack-formation');
    
    // Gen 1: Spawn creatures
    await game.advance({ generation: 1, cycles: 100 });
    
    const gen1State = game.getState();
    expect(gen1State.creatures.length).toBeGreaterThan(0);
    expect(gen1State.packs.length).toBe(0);
    
    // Run simulation with high scarcity (creates pack formation pressure)
    await game.setEnvironmentCondition('resource_scarcity', 0.8);
    await game.advance({ generation: 2, cycles: 500 });
    
    const gen2State = game.getState();
    
    // Packs should have formed
    expect(gen2State.packs.length).toBeGreaterThan(0);
    
    // Pack members should use flocking behaviors
    const pack = gen2State.packs[0];
    expect(pack.members.length).toBeGreaterThan(1);
    
    // Members should be near each other (cohesion)
    const positions = pack.members.map(m => m.position);
    const avgDistance = calculateAverageDistance(positions);
    expect(avgDistance).toBeLessThan(100); // meters
  });
  
  it('does NOT form packs when resources are abundant', async () => {
    const game = await createTestGame('e2e-no-pack-formation');
    
    // Gen 1: Spawn creatures
    await game.advance({ generation: 1, cycles: 100 });
    
    // Run simulation with LOW scarcity (no pressure for packs)
    await game.setEnvironmentCondition('resource_scarcity', 0.2);
    await game.advance({ generation: 2, cycles: 500 });
    
    const gen2State = game.getState();
    
    // Packs should NOT have formed (or very few)
    expect(gen2State.packs.length).toBeLessThan(5);
  });
});

describe('Gen 2 → Gen 3 Progression', () => {
  it('advances from packs to tools when material pressure is high', async () => {
    const game = await createTestGame('e2e-tool-emergence');
    
    // Setup: Create planet with 70% inaccessible materials
    const planet = await AccretionSimulation.run({ 
      seed: 'tool-pressure-seed',
      deepMaterialRatio: 0.7  // 70% of materials at depth > 50m
    });
    
    game.setPlanet(planet);
    
    // Gen 1-2: Creatures and packs
    await game.advance({ generation: 1, cycles: 100 });
    await game.advance({ generation: 2, cycles: 500 });
    
    const gen2State = game.getState();
    expect(gen2State.tools.length).toBe(0);
    
    // Gen 3: Tools should emerge due to pressure
    await game.advance({ generation: 3, cycles: 1000 });
    
    const gen3State = game.getState();
    
    // Tools should exist
    expect(gen3State.tools.length).toBeGreaterThan(0);
    
    // Tool emergence reason should be material pressure
    const toolEvent = gen3State.history.find(e => e.type === 'tool_emergence');
    expect(toolEvent).toBeDefined();
    expect(toolEvent.reason.materialPressure).toBeGreaterThan(0.6);
    
    // Creatures with tools should access previously inaccessible materials
    const creatureWithTool = gen3State.creatures.find(c => c.inventory.length > 0);
    expect(creatureWithTool).toBeDefined();
    
    const toolBoost = creatureWithTool.inventory[0].boost.excavation;
    expect(creatureWithTool.traits.excavation + toolBoost).toBeGreaterThan(creatureWithTool.traits.excavation);
  });
});
```

**Proves:** Generation progression works, emergence happens under right conditions, doesn't happen when not needed.

---

### Layer 4: Non-Deterministic Behavior Tests

```typescript
describe('Yuka Decision Variance', () => {
  it('makes DIFFERENT decisions across runs with same seed', async () => {
    // Same seed → same structure
    // But Yuka decisions should vary (based on real-time evaluation)
    
    const runs = [];
    
    for (let i = 0; i < 10; i++) {
      const game = await createTestGame('variance-test');
      await game.advance({ generation: 1, cycles: 1000 });
      
      const state = game.getState();
      runs.push({
        totalEnergyConsumed: state.creatures.reduce((sum, c) => sum + c.energyConsumed, 0),
        totalDistanceTraveled: state.creatures.reduce((sum, c) => sum + c.distanceTraveled, 0),
        deathCount: state.history.filter(e => e.type === 'death').length
      });
    }
    
    // Outcomes should be DIFFERENT (Yuka made different decisions)
    const energyVariance = calculateVariance(runs.map(r => r.totalEnergyConsumed));
    const distanceVariance = calculateVariance(runs.map(r => r.totalDistanceTraveled));
    
    expect(energyVariance).toBeGreaterThan(0);
    expect(distanceVariance).toBeGreaterThan(0);
    
    // But all outcomes should be VALID
    for (const run of runs) {
      expect(run.totalEnergyConsumed).toBeGreaterThan(0);
      expect(run.totalDistanceTraveled).toBeGreaterThan(0);
    }
  });
  
  it('produces valid outcomes despite non-deterministic decisions', async () => {
    const runs = [];
    
    for (let i = 0; i < 10; i++) {
      const game = await createTestGame('validity-test');
      await game.advance({ generation: 3, cycles: 5000 });
      
      const state = game.getState();
      runs.push(state);
    }
    
    // All runs should reach Gen 3
    expect(runs.every(r => r.generation === 3)).toBe(true);
    
    // All runs should have tools (high pressure scenario)
    expect(runs.every(r => r.tools.length > 0)).toBe(true);
    
    // But number of tools should vary
    const toolCounts = runs.map(r => r.tools.length);
    const toolVariance = calculateVariance(toolCounts);
    expect(toolVariance).toBeGreaterThan(0);
  });
});
```

**Proves:** Yuka makes varied but valid decisions, system is non-deterministic but reliable.

---

### Layer 5: Long-Run Stability Tests

```typescript
describe('Gen 0 → Gen 6 Full Progression', () => {
  it('progresses from accretion to organized religion', async () => {
    const game = await createTestGame('full-progression');
    
    // Gen 0: Accretion
    await game.advance({ generation: 0, cycles: 1000 });
    const gen0 = game.getState();
    expect(gen0.planet.status).toBe('formed');
    
    // Gen 1: Creatures
    await game.advance({ generation: 1, cycles: 1000 });
    const gen1 = game.getState();
    expect(gen1.creatures.length).toBeGreaterThan(0);
    
    // Gen 2: Packs
    await game.advance({ generation: 2, cycles: 2000 });
    const gen2 = game.getState();
    expect(gen2.packs.length).toBeGreaterThan(0);
    
    // Gen 3: Tools
    await game.advance({ generation: 3, cycles: 3000 });
    const gen3 = game.getState();
    expect(gen3.tools.length).toBeGreaterThan(0);
    
    // Gen 4: Tribes
    await game.advance({ generation: 4, cycles: 5000 });
    const gen4 = game.getState();
    expect(gen4.tribes.length).toBeGreaterThan(0);
    
    // Gen 5: Buildings
    await game.advance({ generation: 5, cycles: 5000 });
    const gen5 = game.getState();
    expect(gen5.buildings.length).toBeGreaterThan(0);
    
    // Gen 6: Religion
    await game.advance({ generation: 6, cycles: 10000 });
    const gen6 = game.getState();
    expect(gen6.religions.length).toBeGreaterThan(0);
    
    // Religion should have believers, rituals, myths
    const religion = gen6.religions[0];
    expect(religion.followers.length).toBeGreaterThan(0);
    expect(religion.rituals.length).toBeGreaterThan(0);
    expect(religion.myths.length).toBeGreaterThan(0);
  }, 120000); // 2 minute timeout
  
  it('maintains valid state throughout progression', async () => {
    const game = await createTestGame('state-validity');
    
    for (let gen = 0; gen <= 6; gen++) {
      await game.advance({ generation: gen, cycles: 1000 * (gen + 1) });
      
      const state = game.getState();
      
      // No NaN values
      expect(hasNaNValues(state)).toBe(false);
      
      // No negative masses
      for (const creature of state.creatures) {
        expect(creature.composition.carbon).toBeGreaterThanOrEqual(0);
        expect(creature.composition.calcium).toBeGreaterThanOrEqual(0);
      }
      
      // All entities have valid positions
      for (const creature of state.creatures) {
        expect(isFinite(creature.position.lat)).toBe(true);
        expect(isFinite(creature.position.lon)).toBe(true);
        expect(creature.position.lat).toBeGreaterThanOrEqual(-90);
        expect(creature.position.lat).toBeLessThanOrEqual(90);
      }
      
      // Material conservation (roughly)
      const totalMass = calculateTotalMass(state);
      expect(totalMass).toBeGreaterThan(0);
      expect(isFinite(totalMass)).toBe(true);
    }
  }, 120000);
});
```

**Proves:** System is stable across full progression, no crashes, valid state maintained.

---

## Test Data Strategy

### Deterministic Seeding

```typescript
// Seeds produce IDENTICAL starting structures
const SEED_PRESETS = {
  'high-metal-planet': 'HMS-789-ALPHA',
  'water-rich-planet': 'WRP-123-BETA',
  'barren-planet': 'BRP-456-GAMMA',
  'tool-pressure-planet': 'TPP-999-DELTA',
  'abundant-resources': 'ARP-111-EPSILON'
};

// Each test uses appropriate seed for what it's testing
```

### Environment Conditions

```typescript
// Tests can set environment conditions to create specific pressures
game.setEnvironmentCondition('resource_scarcity', 0.8);  // High scarcity
game.setEnvironmentCondition('predator_density', 0.3);   // Moderate predators
game.setEnvironmentCondition('weather_severity', 0.6);   // Harsh weather
```

### Assertion Strategies

```typescript
// Don't assert exact values (non-deterministic)
// Assert RANGES and VALIDITY

// BAD:
expect(game.getState().tools.length).toBe(15);  // Too specific

// GOOD:
expect(game.getState().tools.length).toBeGreaterThan(0);  // Tools exist
expect(game.getState().tools.length).toBeLessThan(100);   // Reasonable count

// BETTER:
const toolCount = game.getState().tools.length;
expect(toolCount).toBeGreaterThan(0);
expect(toolCount / game.getState().creatures.length).toBeLessThan(0.5);  // Not everyone has tools
```

---

## Success Criteria

### ✅ Tests Pass If:

1. **Deterministic seeding works**
   - Same seed → identical planet structure
   - Same seed → identical spawn locations
   - Same seed → identical archetypes

2. **Yuka decisions are valid**
   - Goals evaluate correctly
   - Fuzzy logic produces reasonable outputs
   - Creatures make progress toward goals

3. **Generation mechanics progress**
   - Gen 0 → Gen 1 transition works
   - Each generation's systems function
   - Emergent properties appear under right conditions

4. **State remains valid**
   - No NaN values
   - No infinite loops
   - Material conservation
   - No crashes

5. **Emergence is reliable**
   - Tools emerge when pressure is high
   - Tools don't emerge when pressure is low
   - Tribes form when beneficial
   - Religion appears at late stages

### ❌ Tests Fail If:

1. Different seeds produce identical planets
2. Yuka gets stuck (no valid goals)
3. Emergence never happens (even under ideal conditions)
4. State becomes invalid (NaN, negative mass, etc.)
5. System crashes or hangs

---

## Implementation Order

1. ✅ **Layer 1: Unit Tests** - Test individual algorithms
2. ✅ **Layer 2: Integration Tests** - Test Gen 0 and Gen 1
3. ✅ **Layer 3: E2E Tests** - Test Gen 0→1→2→3 progression
4. ✅ **Layer 4: Non-Determinism Tests** - Prove Yuka variance
5. ✅ **Layer 5: Long-Run Tests** - Prove Gen 0→6 works

Each layer builds confidence in the next.

---

## Summary

**We prove the system works through TESTS, not through a CLI.**

**Tests prove:**
- Algorithms are correct
- Deterministic seeding works
- Yuka decisions are valid (but varied)
- Generation progression works
- Emergence happens reliably
- System is stable

**Once tests pass, we KNOW the game works end-to-end.**

**Then we can build the CLI, frontend, rendering, etc. on TOP of a PROVEN foundation.**

**Test-driven development for emergent systems.**

**That's how we do this RIGHT.**
