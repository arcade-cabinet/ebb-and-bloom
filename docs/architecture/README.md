# Architecture Documentation - Ebb and Bloom

**Version**: 0.2.0  
**Architecture Frozen**: 2025-11-07  
**Based On**: Complete chat chronology + memory bank progress + WORLD.md analysis

This directory contains the definitive architectural documentation for Ebb and Bloom, representing the evolution from the original monolithic approach to the current package-based monorepo structure.

## Architecture Documents

### Core Architecture
- **[api.md](./api.md)** - REST API Package Architecture
- **[simulation.md](./simulation.md)** - Simulation Package Design  
- **[generations.md](./generations.md)** - Gen 0-6 System Breakdown
- **[game.md](./game.md)** - Game Layer Package Design

### Package Structure

The final architecture decomposes the original monolithic "world" approach into discrete, focused packages:

```
packages/
├── backend/           # Simulation + REST APIs
├── frontend/          # 3D sphere viewer + UI (future)
├── cli/              # Command-line interface (future) 
└── game/             # Game layer wrapper (future)
```

## Architectural Evolution

### From WORLD.md Vision
The original `docs/WORLD.md` described a comprehensive Yuka-driven ecosystem where everything is an AI entity with goals. This vision remains intact but is now properly decomposed.

### Through Development Reality  
The chat chronology revealed critical insights:
1. **ECS ≠ Backend Logic**: ECS is for rendering, not game simulation
2. **Yuka ≠ ECS**: Yuka is the decision layer, separate from data storage
3. **Backend = REST Resources**: Not continuous system loops
4. **Separation of Concerns**: Simulation logic separate from visualization

### To Package-Based Architecture
The frozen architecture represents the synthesis of original vision with architectural reality:

- **Simulation Package**: Pure mathematical simulation with Yuka AI
- **API Package**: RESTful exposure of simulation state
- **Frontend Package**: Rendering and visualization only  
- **Game Package**: Player interaction layer

## Key Architectural Principles

1. **Simulation First**: Build mathematical simulation as standalone module
2. **Package Decomposition**: Each package has single responsibility
3. **API-Driven**: All inter-package communication via REST APIs
4. **Yuka Integration**: Full use of AI systems for decision-making
5. **AI-Sourced Content**: OpenAI generates all game parameters
6. **Visual Blueprints**: Complete rendering instructions embedded in data

## Implementation Status

### ✅ Completed
- **Backend Package**: Complete Gen 0-6 systems with Yuka AI integration
- **AI Data Pools**: OpenAI workflows generating all content
- **Visual Blueprints**: Rendering instructions for all entities
- **Comprehensive Testing**: Mathematical correctness proven

### 🔄 Current Priority
- **REST API Layer**: Expose simulation via HTTP endpoints
- **Database Integration**: SQLite + Drizzle ORM for persistence

### 📋 Future Packages
- **Frontend Package**: Simple 3D sphere viewer
- **CLI Package**: Command-line interface  
- **Game Package**: Player interaction and victory conditions

## Documentation Usage

Each architecture document serves a specific purpose:

- **Read `api.md`** for REST API design and endpoints
- **Read `simulation.md`** for mathematical simulation architecture
- **Read `generations.md`** for detailed Gen 0-6 system specifications
- **Read `game.md`** for player interaction and game layer design

These documents represent the definitive architecture freeze and should guide all future development.