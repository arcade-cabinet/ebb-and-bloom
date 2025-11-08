# Tech Context

**Last Updated**: 2025-01-09

---

## Stack

### Current: Unified Package (`packages/game/`)
- **Framework**: None - Pure TypeScript + BabylonJS
- **Rendering**: BabylonJS 7.x (3D engine + GUI)
- **AI**: Yuka (physics, AI systems)
- **Cross-Platform**: Capacitor (web/iOS/Android)
- **Storage**: Capacitor Preferences API
- **Seed**: seedrandom (deterministic RNG)
- **Testing**: Vitest (unit/integration), Playwright (E2E)
- **Build**: Vite

### Gen Pipeline (`packages/gen/`)
- **AI SDK**: OpenAI SDK (`@ai-sdk/openai`)
- **Validation**: Zod schemas
- **CLI**: Custom CLI (`pnpm cli archetypes`)
- **Textures**: AmbientCG manifest system

### OLD STACK (ARCHIVED - DO NOT USE)
~~React Three Fiber~~ - Removed, replaced by BabylonJS
~~Fastify REST API~~ - Removed, replaced by direct function calls
~~packages/backend~~ - Merged into packages/game
~~packages/frontend~~ - Merged into packages/game

---

## Commands

### Game Package
```bash
cd packages/game && pnpm dev       # Start dev server (port 5173)
cd packages/game && pnpm test      # Run tests (Vitest)
cd packages/game && pnpm test:e2e  # Run E2E tests (Playwright - auto server)
cd packages/game && pnpm test:e2e:mcp  # Run E2E with manual server
cd packages/game && pnpm build     # Production build
cd packages/game && pnpm cap:sync  # Sync Capacitor (iOS/Android)
```

### Gen Pipeline
```bash
cd packages/gen && pnpm cli archetypes      # Generate all archetypes
cd packages/gen && pnpm cli textures        # Generate texture manifests
cd packages/gen && pnpm test               # Test generation
```

### Monorepo
```bash
pnpm install                    # Install all dependencies
pnpm -r test                   # Test all packages
pnpm exec tsc --noEmit         # Type check (root)
```
cd packages/gen && pnpm cli quality          # Quality assessment
cd packages/gen && pnpm cli documentation   # Generate docs
```

### Frontend
```bash
cd packages/simulation && pnpm dev   # Start dev server (port 5173)
cd packages/simulation && pnpm build # Build
```

---

## File Structure

```
packages/
├── backend/           # REST API + Gen0-Gen6 simulation
│   ├── src/
│   │   ├── gen0-6/   # Generation systems
│   │   ├── seed/     # Seed API
│   │   ├── engine/   # GameEngine
│   │   └── server.ts # Fastify server
│   └── test/         # Vitest tests
├── gen/              # AI archetype generation
│   ├── src/
│   │   ├── workflows/  # WARP/WEFT agent
│   │   ├── prompts/    # Generation prompts
│   │   ├── schemas/    # Zod schemas (exported)
│   │   └── tools/      # Quality assessor, texture tool
│   └── data/
│       └── archetypes/ # Generated archetypes (gen0-6/)
└── simulation/       # React Three Fiber frontend
    ├── src/
    │   ├── components/ # R3F components
    │   └── hooks/     # Backend API hooks
    └── COPILOT_SETUP.md

docs/
├── architecture/      # Architecture documentation
└── GENERATION_REVIEW.md # Generated archetype review

memory-bank/
├── activeContext.md    # Current focus
├── progress.md        # Status
└── archived-code/     # Legacy code preservation
```

---

## Development Setup

1. **Install**: `pnpm install`
2. **Start Backend**: `cd packages/backend && pnpm dev` (port 3001)
3. **Start Frontend**: `cd packages/simulation && pnpm dev` (port 5173)
4. **Generate Archetypes**: `cd packages/gen && pnpm cli archetypes`

---

## Testing

### Game Package
- **Unit/Integration**: `cd packages/game && pnpm test`
- **E2E**: `cd packages/game && pnpm test:e2e` (Playwright with auto-server)
- **E2E (MCP)**: `cd packages/game && pnpm test:e2e:mcp` (manual server control)
- **Watch**: `cd packages/game && pnpm test:watch`

**Current**: 35/46 passing (76%) - 11 failures likely archetype structure bugs

### Gen Package
- **Unit**: `cd packages/gen && pnpm test`

---

## Key Constraints

- **Monorepo**: Use workspace dependencies (`workspace:*`)
- **Type Safety**: Import types from `@ebb/gen/schemas` and `@ebb/shared/schemas`
- **Seed-Driven**: All generation uses deterministic seeds (`v1-word-word-word`)
- **Internal API**: Direct function calls via GameEngine (NO REST)
- **NO Hardcoding**: Calculate from physics/AI generation
- **TypeScript**: Strict mode
- **Cross-Platform**: Must work on web/iOS/Android via Capacitor

---

## Renderer Architecture (WARP/WEFT Separation)

**Critical Design**: Simulation logic is SEPARATE from visual rendering

### Backend (Protobuf + WARP/WEFT)
GameEngine provides archetype data via Protobuf:
- **WARP (through-line)**: Evolution over time (planetary cooling, trait changes, tool improvements)
- **WEFT (horizontal)**: Archetype synthesis (terrestrial+volcanic planet, burrow engineer+social forager hybrid)

### Frontend (Renderers)
Visual interpretation of archetype data:

```
packages/game/src/renderers/
├── gen0/
│   ├── PlanetRenderer.ts - Macro (planet sphere, PBR materials)
│   ├── MoonRenderer.ts - Meso (orbital mechanics)
│   └── LayerRenderer.ts - Micro (hydrosphere, atmosphere) [TODO]
├── gen1/
│   └── CreatureRenderer.ts - Interprets trait archetypes as visuals
├── gen2/ - Pack formations and social structures
├── gen3/ - Tool visuals from archetype synthesis
├── gen4/ - Tribe buildings and territory
├── gen5/ - Advanced structures
└── gen6/ - Civilization-scale rendering
```

### Key Principles
1. **Parameterization**: Visual ranges that Yuka can vary (size, color, roughness)
2. **WARP Handling**: Visual changes over evolutionary time
3. **WEFT Handling**: Archetype merging/synthesis as visual combinations
4. **Separation**: GameScene USES renderers, doesn't implement rendering logic

### Example Flow
```typescript
// Backend provides archetype data
const creatureData = gameEngine.getGen1Creatures();

// Frontend interprets visually
const renderer = new CreatureRenderer(scene);
const mesh = renderer.render(creatureData.archetype);

// WARP: Update visuals as traits evolve
renderer.updateEvolution(creatureId, newTraits);

// WEFT: Synthesize two archetypes
const hybridVisual = renderer.synthesize(archetype1, archetype2, ratio);
```

This structure allows Yuka to generate RANGES of variations at each Gen by navigating WARP (evolution) and WEFT (synthesis) dimensions.
