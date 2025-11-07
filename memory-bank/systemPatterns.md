# System Patterns

**Last Updated**: 2025-01-09

---

## Core Architecture Pattern

**"Everything is Squirrels"**: Base archetypes evolve through environmental pressure.

```
Seed → Gen 0 (Planetary Physics) → Gen 1 (ECS Archetypes) → Gen 2+ (Yuka Evolution)
```

---

## ECS Pattern (Miniplex)

**Game logic lives in ECS**, React Three Fiber ONLY renders:

```typescript
// Define components
world.add({
  transform: { position, rotation, scale },
  creature: { species, energy, traits },
  render: { mesh, material, visible }
});

// Query entities
const creatures = world.with('creature', 'transform');

// Systems update ECS
for (const entity of creatures.entities) {
  // Update logic
}
```

**Rule**: React components READ from ECS, NEVER write to it.

---

## Yuka Sphere Pattern

**After Gen 1, Yuka coordinates ALL evolution**:

```typescript
class YukaSphereCoordinator {
  triggerGenerationEvolution(generation) {
    // 1. Calculate environmental pressure
    const pressure = this.calculateEnvironmentalPressure();
    
    // 2. Each sphere makes decisions
    const creatureDecisions = this.creatureSphereDecisions(pressure, generation);
    const tool Decisions = this.toolSphereDecisions(pressure, generation);
    const materialDecisions = this.materialSphereDecisions(pressure, generation);
    const buildingDecisions = this.buildingSphereDecisions(pressure, generation);
    
    // 3. Spheres signal each other
    this.propagateSignals(decisions);
    
    // 4. Apply coordinated decisions to ECS
    this.applyDecisions(decisions, generation);
  }
}
```

---

## Property-Based Usage Pattern

**NO hardcoded logic**. Properties determine usage:

```typescript
// BAD - Hardcoded
if (item.name === 'shovel') {
  canDigDeep = true;
}

// GOOD - Property-based
if (item.properties.reach > 2.0 && item.archetype === EXTRACTOR) {
  canDigDeep = true;
}
```

---

## Evolutionary Pressure Pattern

**Pressure accumulates → Yuka responds**:

```
Physical Reality (immutable) + Player Actions (pressure source)
  ↓
Environmental Pressure Calculation
  ↓
Yuka Sphere Decisions
  ↓
Evolution Applied to ECS
  ↓
New Physical Reality
  ↓
LOOP
```

---

## Testing Pattern

**TDD**: Write tests first, implementation second.

```typescript
// Test defines expected behavior
test('Tool Sphere emerges EXTRACTOR when deep materials needed', () => {
  const planet = generatePlanet('test-seed');
  const pressure = { materialDepth: 7, toolReach: 3 };
  
  const decision = toolSphere.decide(pressure);
  
  expect(decision.archetype).toBe(ToolArchetype.EXTRACTOR);
});
```

---

## Key Rules

1. **Gen 0 before Gen 1** - Planetary physics creates ALL reality
2. **ECS for logic** - React for rendering only
3. **Properties, not names** - Usage derived from properties
4. **Pressure, not gates** - Evolution responds to need
5. **Yuka coordinates** - Spheres communicate and co-evolve
6. **NO hardcoding** - Everything emergent from seed

