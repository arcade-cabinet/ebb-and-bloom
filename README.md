# Ebb & Bloom Engine

> Law-based universe simulation engine with deterministic procedural generation

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.169-green)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## What is This?

**Ebb & Bloom Engine** generates infinite unique universes from three-word seeds using **57 scientific laws** instead of AI or hardcoded data.

```typescript
import { UniverseSimulator } from '@ebb-and-bloom/engine';

const sim = new UniverseSimulator({ seed: 'v1-green-valley-breeze' });
sim.advanceTime(13.8e9); // Simulate 13.8 billion years

console.log(sim.getState()); // Complete universe state
```

**Same seed = Same universe. Always.**

---

## Features

- ✅ **57 Scientific Laws** - Physics, biology, ecology, social
- ✅ **Deterministic** - Same seed = identical results
- ✅ **Multi-Scale** - Quantum → Cosmic
- ✅ **React Three Fiber** - Modern web rendering
- ✅ **Yuka AI** - Autonomous agent behaviors
- ✅ **SimplexNoise** - Superior terrain generation
- ✅ **Law-Based Spawning** - No hardcoded data
- ✅ **Mobile Support** - Responsive, touch-friendly

---

## Quick Start

```bash
# Install
npm install @ebb-and-bloom/engine

# Run demo
npm run dev
```

Then open http://localhost:5173

---

## Documentation

- **[ENGINE.md](ENGINE.md)** - Complete engine documentation
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture
- **[DFU_ASSESSMENT](memory-bank/sessions/)** - Daggerfall Unity analysis
- **[API Reference](docs/API.md)** - Full API documentation

---

## Architecture

```
engine/              # Core simulation engine
├── laws/           # 57 law files (8,500+ lines)
├── spawners/       # World generation (terrain, vegetation, settlements)
├── agents/         # Yuka-based AI
├── simulation/     # Timeline engine
└── utils/          # RNG, seed management

src/demo/           # Demo applications
├── terrain.tsx     # Terrain generation demo
├── universe.tsx    # Universe simulation demo
└── game.tsx        # Complete game demo
```

---

## Performance

**Benchmarks:**
- 120 FPS constant
- 49 chunks (7x7 grid, Daggerfall pattern)
- 286 trees (instanced, steepness + clearance filtered)
- 58 NPCs (daily schedules, Yuka AI)
- 100 creatures (Kleiber's Law)
- 2 settlements (law-based placement)

**vs Daggerfall Unity:**
- 23% code size (10k vs 43k lines)
- 60-70% feature parity
- Better algorithms (SimplexNoise, instancing, laws)
- Web platform (DFU is Unity exe)

---

## Examples

### Generate Terrain
```typescript
import { ChunkManager, BiomeSystem } from '@ebb-and-bloom/engine';

const chunks = new ChunkManager(scene, 'v1-terrain-seed');
chunks.update(0, 0); // Load 7x7 grid around origin

const height = chunks.getTerrainHeight(100, 200);
const settlement = chunks.getNearestSettlement(100, 200);
```

### Simulate Universe
```typescript
import { UniverseSimulator } from '@ebb-and-bloom/engine';

const sim = new UniverseSimulator({ seed: 'v1-cosmic-test' });
sim.advanceTime(1e9); // 1 billion years

const state = sim.getState();
console.log(`${state.stars.length} stars generated`);
```

### Use Laws Directly
```typescript
import { 
  calculateGravity,
  calculateMetabolicRate,
  lotkaVolterra
} from '@ebb-and-bloom/engine/laws';

const force = calculateGravity(mass1, mass2, distance);
const metabolicRate = calculateMetabolicRate(bodyMass); // Kleiber's Law
const [prey, pred] = lotkaVolterra(preyPop, predPop, alpha, beta);
```

---

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build

# Type check
npm run type-check
```

---

## Technology Stack

- **TypeScript** - Type safety
- **React** - UI framework
- **React Three Fiber** - 3D rendering
- **Drei** - R3F helpers
- **Three.js** - WebGL engine
- **Yuka** - AI/steering behaviors
- **SimplexNoise** - Terrain generation
- **Vite** - Build tool
- **Vitest** - Unit testing
- **Playwright** - E2E testing

---

## Inspiration

**Daggerfall (1996)** - Procedural generation pioneer  
**Daggerfall Unity (2009-2025)** - Community reimplementation  
**Elite (1984)** - Infinite universe in 22KB  
**No Man's Sky (2016)** - Modern procedural cosmos

---

## Status

**Current:** v1.0.0 - Engine Architecture Complete  
**Game:** Working at 120 FPS, all systems operational  
**Docs:** Comprehensive (2,235+ lines of analysis)  
**Tests:** 18/18 passing

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT License - See [LICENSE](LICENSE) file.

---

## Community

- **GitHub:** [github.com/ebb-and-bloom/engine](https://github.com/ebb-and-bloom/engine)
- **Docs:** [ebb-and-bloom.dev](https://ebb-and-bloom.dev)
- **Discord:** [discord.gg/ebb-bloom](https://discord.gg/ebb-bloom)

---

**Made with ❤️ by the Ebb & Bloom community**
