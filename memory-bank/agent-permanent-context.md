# Agent Permanent Context

**For**: All AI agents (Cline, Cursor, Claude, Copilot)  
**Purpose**: Critical permanent information that should never be lost

---

## Project

**Ebb & Bloom**: Mobile-first procedural evolution game with seed-driven planetary physics.

**Core Principle**: "Everything is Squirrels" - base archetypes evolve through environmental pressure. NO hardcoded progression.

---

## Architecture

**Monorepo Structure**:
- `packages/backend/` - REST API + Gen0-Gen6 simulation systems (Fastify, Yuka AI)
- `packages/gen/` - AI archetype generation pipeline (OpenAI workflows)
- `packages/simulation/` - React Three Fiber frontend (rendering only)

**Generational System**:
- **Gen 0**: Planetary genesis from seed (gravity, materials, climate)
- **Gen 1**: Creature archetypes spawn (Yuka AI decision-making)
- **Gen 2+**: Yuka AI spheres coordinate evolution

**Technology Stack**:
- **Backend**: Fastify (REST API), Yuka (AI systems), seedrandom (deterministic RNG)
- **Gen Pipeline**: OpenAI SDK (archetype generation), Zod (validation)
- **Frontend**: React Three Fiber (3D rendering), @react-three/drei (helpers)
- **State**: Zustand (in-memory, syncs FROM backend)
- **Platform**: Capacitor (mobile, future)
- **Seed**: Three-word hyphen-delimited (`v1-word-word-word`)

---

## Critical Architectural Rules

1. **Monorepo**: Each package has single responsibility
2. **Type Safety**: DRY types from `@ebb/gen/schemas` and `@ebb/shared/schemas`
3. **Seed-Driven**: All generation uses deterministic seeds
4. **WARP/WEFT Flow**: 
   - **WARP (Vertical)**: Gen N → Gen N+1 causal influence
   - **WEFT (Horizontal)**: Macro → Meso → Micro scales within each generation
5. **Visual Blueprints**: All archetypes include rendering instructions (PBR, textures, colors)
6. **Yuka AI**: Gen0-Gen6 systems use appropriate Yuka systems (GoalEvaluator, FuzzyModule, StateMachine, etc.)
7. **REST API**: Backend exposes simulation via HTTP endpoints (not continuous loops)
8. **NO Hardcoded Values**: Calculate from physics/AI generation
9. **Quality Assurance**: Automatic regeneration of anemic archetypes
10. **Idempotency**: Repeated runs do not regenerate existing valid data

---

## Key Documentation

**Read these for architectural decisions**:
- `docs/architecture/README.md` - Master architecture overview
- `docs/architecture/generations.md` - Gen0-Gen6 system specifications
- `docs/architecture/api.md` - REST API design
- `docs/architecture/simulation.md` - Simulation package architecture
- `packages/simulation/COPILOT_SETUP.md` - Frontend development guide
- `packages/gen/README.md` - Generation pipeline documentation

---

## File Structure

```
packages/
├── backend/           # REST API + Gen0-Gen6 systems
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
│   ├── README.md     # Master architecture
│   ├── generations.md # Gen0-Gen6 specs
│   ├── api.md        # REST API design
│   └── simulation.md # Simulation architecture
└── GENERATION_REVIEW.md # Generated archetype review

memory-bank/
├── activeContext.md         # Current focus (ephemeral)
├── progress.md              # Status (ephemeral)
├── agent-permanent-context.md  # This file (permanent)
├── agent-collaboration.md   # Shared collaboration rules (permanent)
└── systemPatterns.md        # Architecture patterns (permanent)
```

---

## Development Commands

```bash
# Monorepo
pnpm install              # Install all dependencies
pnpm -r test             # Test all packages
pnpm -r build            # Build all packages

# Backend
cd packages/backend && pnpm dev      # Start API server
cd packages/backend && pnpm test     # Run tests

# Gen Pipeline
cd packages/gen && pnpm cli archetypes      # Generate all archetypes
cd packages/gen && pnpm cli quality         # Quality assessment
cd packages/gen && pnpm cli documentation  # Generate docs

# Frontend
cd packages/simulation && pnpm dev   # Start dev server
cd packages/simulation && pnpm build # Build
```

---

## Testing

**All tests must pass before commit**: `pnpm -r test`

**Backend**: Vitest for unit/integration tests
**Frontend**: Playwright for E2E tests (future)

**Target**: 80%+ coverage

---

## Current Status

**Backend**: ✅ Complete - All Gen0-Gen6 systems integrated with WARP/WEFT data, seed API functional
**Gen Pipeline**: ✅ Complete - 125 archetypes generated, quality assessed, 89.4% average quality
**Frontend**: ⏳ Ready for Copilot - Scaffolded, needs Gen0 planet rendering

**See**: `memory-bank/activeContext.md` for current focus
