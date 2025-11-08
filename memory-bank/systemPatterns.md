# System Patterns

**Last Updated**: 2025-01-09

---

## Core Architecture Pattern

**"Everything is Squirrels"**: Base archetypes evolve through environmental pressure.

```
Seed → Gen 0 (Planetary Physics) → Gen 1 (Creatures) → Gen 2+ (Yuka Evolution)
```

---

## Monorepo Package Pattern

**Each package has single responsibility**:

```typescript
// packages/backend/ - REST API + Simulation
import { Gen1System } from './gen1/CreatureSystem.js';
import { generateGen1DataPools } from './gen-systems/loadGenData.js';

// packages/gen/ - AI Generation Pipeline
import { executeWarpWeftGeneration } from './workflows/warp-weft-agent.js';

// packages/simulation/ - React Three Fiber Rendering
import { useGameState } from './hooks/useGameState.js';
```

**Rule**: Packages communicate via workspace dependencies (`workspace:*`) and REST APIs.

---

## WARP/WEFT Flow Pattern

**WARP (Vertical)**: Causal flow between generations
**WEFT (Horizontal)**: Scale flow within each generation

```typescript
// WARP: Gen N → Gen N+1
const gen1Data = await generateGen1DataPools(baseSeed, planet, gen0Data);

// WEFT: Macro → Meso → Micro
const macro = await generateScale('gen0', 'macro', baseSeed, {});
const meso = await generateScale('gen0', 'meso', baseSeed, { macro });
const micro = await generateScale('gen0', 'micro', baseSeed, { macro, meso });
```

---

## Yuka AI Integration Pattern

**Gen0-Gen6 systems use appropriate Yuka systems**:

```typescript
// Gen0: CohesionBehavior, SeparationBehavior
class AccretionSimulation {
  private cohesionBehavior = new CohesionBehavior();
  private separationBehavior = new SeparationBehavior();
}

// Gen1: GoalEvaluator, CompositeGoal, StateMachine
class Gen1System {
  private evaluateGoals(creature: Creature): void {
    const mostUrgent = creature.needs.reduce((prev, curr) =>
      curr.urgency > prev.urgency ? curr : prev
    );
    if (mostUrgent.urgency > 0.6) {
      this.executeGoal(creature, mostUrgent);
    }
  }
}

// Gen2/Gen3: FuzzyModule
class PackFormationFuzzy {
  private fuzzy = new FuzzyModule();
  evaluate(scarcity: number, proximity: number): number {
    this.fuzzy.fuzzify('problem', scarcity * 100);
    this.fuzzy.fuzzify('capability', proximity * 100);
    return this.fuzzy.defuzzify('desirability') / 100;
  }
}
```

---

## Seed-Driven Deterministic Pattern

**All generation uses deterministic seeds**:

```typescript
import { validateSeed, getGenerationSeed } from '../seed/seed-manager.js';

const validation = validateSeed('v1-red-blue-green');
const gen0Seed = getGenerationSeed(validation.seed!, 0);
const gen1Seed = getGenerationSeed(validation.seed!, 1);

// Same seed → same results
const planet1 = await simulate(gen0Seed);
const planet2 = await simulate(gen0Seed);
expect(planet1.radius).toBe(planet2.radius);
```

---

## Universal Template Pattern

**Archetypes are templates with parameter ranges**:

```typescript
interface Archetype {
  parameters: {
    speed: { min: 0.5, max: 2.0, default: 1.0 },
    strength: { min: 0.3, max: 1.5, default: 0.8 }
  };
  selectionBias: {
    baseWeight: 0.5,
    seedModifiers: { 'red': 0.2, 'blue': -0.1 }
  };
}

// Interpolate parameters from seed
const speed = interpolateParameter(archetype.parameters.speed, seedComponent);

// Select archetype with bias
const archetype = selectFromPoolBiased(pool, seed, gen0Data);
```

---

## Visual Blueprint Pattern

**All archetypes include rendering instructions**:

```typescript
interface VisualBlueprint {
  textureReferences: ['Metal049A', 'Rock025'],
  visualProperties: {
    pbr: { metallic: 0.8, roughness: 0.3 },
    colorPalette: ['#FFBB33', '#FF6633'],
    proceduralRules: 'surface variation based on depth'
  }
}

// Frontend uses blueprints directly
const material = new MeshStandardMaterial({
  metalness: blueprint.visualProperties.pbr.metallic,
  roughness: blueprint.visualProperties.pbr.roughness,
  map: textures[blueprint.textureReferences[0]]
});
```

---

## REST API Pattern

**Backend exposes simulation via HTTP endpoints**:

```typescript
// Fastify route
fastify.get('/api/game/:gameId', async (request, reply) => {
  const engine = gameEngines.get(request.params.gameId);
  if (!engine) return reply.code(404).send({ error: 'Game not found' });
  return engine.getState();
});

// Frontend fetches
const response = await fetch(`http://localhost:3001/api/game/${gameId}`);
const { planet, gen0Data } = await response.json();
```

---

## Key Rules

1. **Monorepo**: Each package has single responsibility
2. **WARP/WEFT**: Generations flow causally, scales flow hierarchically
3. **Seed-Driven**: All generation uses deterministic seeds
4. **Yuka AI**: Appropriate Yuka systems for each generation
5. **Visual Blueprints**: All archetypes include rendering instructions
6. **REST API**: Backend exposes simulation via HTTP
7. **NO Hardcoding**: Everything emergent from seed + AI generation
