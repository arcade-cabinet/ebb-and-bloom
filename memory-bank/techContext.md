# Tech Context

**Last Updated**: 2025-01-09

---

## Stack

### Backend (`packages/backend/`)
- **Framework**: Fastify (REST API)
- **AI**: Yuka (GoalEvaluator, FuzzyModule, StateMachine, etc.)
- **Database**: SQLite + Drizzle ORM (future persistence)
- **State**: In-memory (Zustand for future frontend sync)
- **Seed**: seedrandom (deterministic RNG)
- **Testing**: Vitest

### Gen Pipeline (`packages/gen/`)
- **AI SDK**: OpenAI SDK (`@ai-sdk/openai`)
- **Validation**: Zod schemas
- **CLI**: Custom CLI (`pnpm cli archetypes`)
- **Textures**: AmbientCG manifest system

### Frontend (`packages/simulation/`)
- **Rendering**: React Three Fiber
- **Helpers**: @react-three/drei
- **Build**: Vite
- **Testing**: Playwright (future)

---

## Commands

### Monorepo
```bash
pnpm install              # Install all dependencies
pnpm -r test             # Test all packages
pnpm -r build            # Build all packages
pnpm -r exec tsc --noEmit  # Type check all
```

### Backend
```bash
cd packages/backend && pnpm dev      # Start API server (port 3001)
cd packages/backend && pnpm test     # Run tests
cd packages/backend && pnpm build    # Build
```

### Gen Pipeline
```bash
cd packages/gen && pnpm cli archetypes      # Generate all archetypes
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

### Backend
- **Unit**: `cd packages/backend && pnpm test`
- **Watch**: `cd packages/backend && pnpm test:watch`
- **Coverage**: `cd packages/backend && pnpm test:coverage`

**Current**: 76+ tests passing

### Frontend (Future)
- **E2E**: `cd packages/simulation && pnpm test:e2e` (Playwright)

---

## Key Constraints

- **Monorepo**: Use workspace dependencies (`workspace:*`)
- **Type Safety**: Import types from `@ebb/gen/schemas` and `@ebb/shared/schemas`
- **Seed-Driven**: All generation uses deterministic seeds (`v1-word-word-word`)
- **REST API**: Backend exposes simulation via HTTP endpoints
- **NO Hardcoding**: Calculate from physics/AI generation
- **TypeScript**: Strict mode
