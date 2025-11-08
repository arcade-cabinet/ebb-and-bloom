# Ebb and Bloom - A Yuka-Driven Evolution Simulation

**Version**: 0.2.0 - Algorithm-First Architecture  
**Status**: Backend Complete - Gen 0-6 Systems Implemented

## Overview

Ebb and Bloom is a simulation where you guide the evolution of life from planetary formation to complex civilizations. Every entity—from planets to creatures to tools—is driven by Yuka AI making intelligent decisions based on deterministic mathematical models and AI-generated content pools.

The game asks fundamental questions about evolution, emergence, and what happens when life encounters constraints.

## Architecture

### Backend-First Design

This project uses a **backend-first architecture** where all game logic is implemented as RESTful APIs with pure mathematical algorithms, completely separate from any frontend rendering.

```
packages/
├── backend/           # Complete game simulation (Gen 0-6)
└── [future packages]  # Frontend, CLI, mobile apps
```

### Generation System

The simulation progresses through 7 generations of increasing complexity:

- **Gen 0**: Planetary Formation (Yuka CohesionBehavior physics)
- **Gen 1**: Creatures (Yuka Goals, traits, needs)
- **Gen 2**: Packs (Yuka FuzzyModule + Flocking)
- **Gen 3**: Tools (Yuka FuzzyModule emergence)
- **Gen 4**: Tribes (cooperation, territories)
- **Gen 5**: Buildings (construction, settlements)
- **Gen 6**: Religion & Democracy (cosmology, governance)

## Quick Start

### Development

```bash
# Install dependencies
pnpm install

# Start backend development server
pnpm dev

# Run tests
pnpm test

# Watch tests during development
pnpm test:watch
```

### Backend API

The backend exposes RESTful APIs for all game systems:

```bash
# Start a new game
POST /api/game/new { seed: "your-seed-phrase" }

# Query planetary composition
GET /api/planet/query?x=0&y=0&z=6371000

# Get current creatures
GET /api/creatures

# Get active events
GET /api/events
```

## Technical Details

### AI Integration

- **OpenAI Workflows**: Generate content pools for all parameters
- **Deterministic Selection**: Seed components select from AI-generated options
- **No Hardcoded Values**: Everything derived from physics or AI sources
- **Visual Blueprints**: Complete rendering instructions for future frontends

### Yuka AI Systems

Extensive use of Yuka's AI libraries:

- **GoalEvaluator**: Hierarchical decision making
- **FuzzyModule**: Fuzzy logic for emergence decisions
- **CohesionBehavior**: Planetary accretion, pack formation
- **StateMachine**: Creature states, governance transitions
- **MessageDispatcher**: Inter-system communication

### Testing

Comprehensive test coverage proving mathematical correctness:

```bash
# Backend tests (all generations)
cd packages/backend
pnpm test

# View test coverage
pnpm test:coverage
```

## Development Status

### ✅ Completed

- **Gen 0-6 Systems**: All generations implemented with real Yuka AI
- **AI Data Pools**: OpenAI integration for content generation  
- **Visual Blueprints**: Complete rendering instructions
- **Comprehensive Tests**: Mathematical correctness proven
- **REST API Foundation**: Backend architecture complete

### 🔄 In Progress

- **REST Endpoints**: Exposing game systems as HTTP APIs
- **Database Integration**: SQLite + Drizzle ORM for persistence

### 📋 Planned

- **Simple Frontend**: 3D sphere viewer for simulation
- **CLI Interface**: Command-line game client
- **Mobile Apps**: iOS/Android using Capacitor

## Architecture Philosophy

### WARP & WEFT System

- **WARP** (Vertical): Each generation causally influences the next
- **WEFT** (Horizontal): Macro/Meso/Micro scales at each generation
- **AI-Sourced**: OpenAI generates realistic parameter pools
- **Deterministic**: Seed ensures reproducible results

### Backend vs Frontend

- **Backend**: Pure algorithms, mathematical simulation, AI decision-making
- **Frontend**: Visualization only, queries backend via REST APIs
- **Separation**: Game logic never mixed with rendering concerns

## Legacy Architecture

The original React Three Fiber frontend has been archived to `memory-bank/archived-code/` during the transition to the backend-first approach. This archive contains:

- Complete ECS systems
- React Three Fiber components
- Comprehensive test suites
- Development tools and asset pipelines

See `memory-bank/archived-code/ARCHIVE_INDEX.md` for details.

## Contributing

This project uses a monorepo structure with pnpm workspaces:

```bash
# Work on backend
cd packages/backend
pnpm dev

# Run specific package tests
pnpm --filter backend test

# Add dependencies to specific package
pnpm --filter backend add [dependency]
```

## Documentation

- **Game Design**: `docs/WORLD.md` - Complete game philosophy and systems
- **Progress Tracking**: `memory-bank/` - Development history and decisions
- **Backend API**: `packages/backend/README.md` - Technical implementation details

## License

MIT License - See LICENSE file for details

---

*"If you give life enough time, constraints, and pressure... what will it become?"*