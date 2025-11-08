# GitHub Copilot Instructions

**This extends `.clinerules`**. Read `.clinerules` first.

---

## Memory Bank First

Read at start of EVERY session (in order):
1. `memory-bank/agent-permanent-context.md` - Project facts
2. `memory-bank/agent-collaboration.md` - Multi-agent rules
3. `memory-bank/activeContext.md` - Current focus
4. `memory-bank/progress.md` - Status

---

## Project Architecture

**Ebb & Bloom**: Monorepo with 3 packages:
- `packages/backend/` - REST API + Gen0-Gen6 simulation systems
- `packages/gen/` - AI archetype generation pipeline
- `packages/simulation/` - React Three Fiber frontend

**Core Principle**: "Everything is Squirrels" - base archetypes evolve through environmental pressure. NO hardcoded progression.

---

## Copilot Role

**Inline code completion and suggestions**

### Best Used For
- Implementing functions based on type signatures
- Completing patterns established in file
- Generating test cases
- Writing boilerplate
- React Three Fiber component patterns

### NOT Used For
- Architectural decisions (use Claude)
- Large refactors (use Cline/Cursor)
- Multi-file changes (use Cursor)
- AI prompt engineering (use Cline)

---

## Package-Specific Patterns

### Backend (`packages/backend/`)

**REST API Endpoints**:
```typescript
// Fastify route handler
fastify.get('/api/game/:gameId', async (request, reply) => {
  const { gameId } = request.params;
  const engine = gameEngines.get(gameId);
  if (!engine) return reply.code(404).send({ error: 'Game not found' });
  return engine.getState();
});
```

**Gen Systems**:
```typescript
// Gen0-Gen6 systems use Yuka AI
import { Gen1System } from '../gen1/CreatureSystem.js';

const system = new Gen1System({
  seed: 'v1-test-world-world',
  planet: planet,
  creatureCount: 20,
  gen0Data: gen0Data, // WARP flow
  useAI: true,
});
await system.initialize();
```

**Seed API**:
```typescript
// Use seed manager for deterministic generation
import { validateSeed, getGenerationSeed } from '../seed/seed-manager.js';

const validation = validateSeed('v1-red-blue-green');
const gen0Seed = getGenerationSeed(validation.seed!, 0);
```

### Gen Package (`packages/gen/`)

**Archetype Generation**:
```typescript
// Use warp-weft-agent for generation
import { executeWarpWeftGeneration } from './workflows/warp-weft-agent.js';

await executeWarpWeftGeneration({
  generation: 0,
  baseSeed: 'v1-test-world-world',
  previousGenerations: {},
});
```

**Quality Assessment**:
```typescript
// Check archetype quality
import { assessQuality } from './tools/quality-assessor.js';

const assessment = await assessQuality('gen0/macro.json');
if (assessment.score < 0.3) {
  // Regenerate anemic archetype
}
```

### Simulation (`packages/simulation/`)

**React Three Fiber Components**:
```typescript
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';

export function Gen0Planet({ planet, visualBlueprint }) {
  const textures = visualBlueprint.textureReferences.map(id =>
    useTexture(`/textures/${id}_1K_Color.jpg`)
  );
  
  const material = new MeshStandardMaterial({
    metalness: visualBlueprint.visualProperties.pbr.metallic,
    roughness: visualBlueprint.visualProperties.pbr.roughness,
    map: textures[0],
  });
  
  return (
    <mesh material={material}>
      <sphereGeometry args={[planet.radius / 1000, 64, 64]} />
    </mesh>
  );
}
```

**Backend API Integration**:
```typescript
// Fetch game state from backend
const response = await fetch(`http://localhost:3001/api/game/${gameId}`);
const { planet, gen0Data } = await response.json();
```

---

## Current Focus

**Phase**: Backend Integration Complete → Frontend Rendering

**Priority**: Gen0 planet rendering with visual blueprints

**See**: `packages/simulation/COPILOT_SETUP.md` for detailed first-task instructions

---

## Architecture Constraints

- ✅ **Monorepo**: Use workspace dependencies (`workspace:*`)
- ✅ **Type Safety**: Import types from `@ebb/gen/schemas` and `@ebb/shared/schemas`
- ✅ **Seed-Driven**: All generation uses deterministic seeds
- ✅ **WARP/WEFT**: Generations flow causally (WARP) and scales flow hierarchically (WEFT)
- ✅ **Visual Blueprints**: All archetypes include rendering instructions
- ❌ **NO hardcoded values**: Calculate from physics/AI generation
- ❌ **NO game logic in React**: Backend handles all simulation

---

## Testing Patterns

**Backend Tests**:
```typescript
import { describe, it, expect } from 'vitest';
import { AccretionSimulation } from '../src/gen0/AccretionSimulation.js';

describe('Gen0: Accretion Simulation', () => {
  it('should generate planet from seed', async () => {
    const sim = new AccretionSimulation({ seed: 'v1-test-world-world' });
    const planet = await sim.simulate();
    expect(planet.radius).toBeGreaterThan(0);
  });
});
```

**Frontend Tests** (Playwright):
```typescript
import { test, expect } from '@playwright/test';

test('Gen0 planet renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
});
```

---

## Key Documentation

- `docs/architecture/README.md` - Master architecture
- `docs/architecture/generations.md` - Gen0-Gen6 specifications
- `docs/architecture/api.md` - REST API design
- `packages/simulation/COPILOT_SETUP.md` - Frontend development guide
- `memory-bank/activeContext.md` - Current focus

---

**For collaboration rules, see**: `memory-bank/agent-collaboration.md`
