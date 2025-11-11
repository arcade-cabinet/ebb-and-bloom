# Agents Package

**ALL agentic logic lives here. Root level package.**

## Structure

```
agents/
├── governors/          # Yuka-native law implementations
│   ├── physics/       # Gravity, Temperature
│   ├── biological/    # Metabolism, Lifecycle, Reproduction
│   ├── ecological/    # Flocking, PredatorPrey, Territory
│   ├── social/        # Hierarchy, Warfare, Cooperation
│   └── world-generation/  # GenerationGovernor (spawn decisions)
│
├── agents-yuka/       # Yuka agent implementations
│   ├── CreatureAgent.ts
│   └── evaluators/
│
└── index.ts          # Main exports
```

## Philosophy

**Agents decide. Engine renders.**

- Governors make decisions based on natural laws
- Agents execute those decisions
- Engine renders the results

## Usage from Game Package

```typescript
import { GenerationGovernor } from '../agents';
import { WorldManager } from '../engine';

// Game summons GenerationGovernor to control engine
const governor = new GenerationGovernor(seed);
const world = new WorldManager();

// Governor controls what spawns
governor.loadChunk(chunkX, chunkZ, world.scene, world.entityManager);
```
