# Ebb & Bloom

> Competitive evolution game: Guide YOUR species from protozoa to transcendence while competing against YUKA-controlled autonomous life

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.169-green)](https://threejs.org/)
[![Tests](https://img.shields.io/badge/Tests-87%25-green)](tests/)

---

## 🧬 What is this?

**You ARE a governor.** Guide ONE species (entire lineage) through primordial evolution by shaping their environment. YUKA governors guide all other species using the SAME law-constrained tools. Creatures respond autonomously - you can't control individuals directly.

**Core Loop:** Environmental manipulation (smite/nurture/pressure) → Species adaptation → YUKA response → Resource competition → Emergence

**Gameplay:** Like Populous meets Spore - indirect influence, not creature control. Energy budget prevents god-mode. 57 laws constrain both you AND YUKA.

**[📖 Read the Core Gameplay Vision](docs/CORE_GAMEPLAY_VISION.md)**

```typescript
import { WorldManager } from 'ebb-and-bloom-engine';

const world = new WorldManager();
world.initialize({ seed: 'v1-green-valley-breeze', scene, camera });

// Game loop
world.update(deltaTime); // Governors + synthesis handle everything
```

**Same seed = same world. Every time. Deterministic.**

---

## ✨ Architecture

**✅ DFU PARITY VERIFIED** - All core gameplay systems match Daggerfall Unity patterns:
- Player movement (PlayerMotor → PlayerController)
- World streaming (StreamingWorld → TerrainSystem)  
- Player positioning (PositionPlayerToLocation)
- Ground detection (FixStanding)
- 7x7 chunk grid (TerrainDistance=3)
- Vegetation spawning (steepness + clearance)
- Settlement spawning (outside edges)

**See:** `memory-bank/DFU_PARITY_VERIFICATION.md` for complete verification.

### Governors (15) - DECIDE
- **Physics (2)** - Gravity, Temperature
- **Biology (5)** - Metabolism, Lifecycle, Reproduction, Genetics, Cognition
- **Ecology (5)** - Flocking, PredatorPrey, Territory, Foraging, Migration
- **Social (3)** - Hierarchy, Warfare, Cooperation

### Synthesis (6) - CREATE
- **MolecularSynthesis** - Protein/calcium/chitin % → geometry
- **PigmentationSynthesis** - Diet + environment → coloring
- **StructureSynthesis** - Materials → tools/structures
- **BuildingArchitect** - Governance → architecture
- **InteriorGenerator** - Room layouts + furniture
- **WeaponSynthesis** - Materials → weapons

### Core (5) - MANAGE
- **WorldManager** - Central coordinator (like DFU GameManager)
- **TerrainSystem** - Chunk streaming (like DFU StreamingWorld)
- **PlayerController** - Movement + collision (like DFU PlayerMotor)
- **CreatureManager** - Spawn creatures with governors
- **CityPlanner** - Social governors → city layouts

---

## 🔬 The Pipeline

```
Three-Word Seed
    ↓
GOVERNORS DECIDE
├── What creatures exist (biology)
├── How they behave (ecology)
├── How they organize (social)
└── Physical constraints (physics)
    ↓
SYNTHESIS CREATES
├── Molecular structure (protein % → geometry)
├── Coloring (diet → pigments)
├── Tools & weapons (materials → forms)
└── Buildings (governance → architecture)
    ↓
WORLD EMERGES
└── Living, evolving, deterministic
```

**NO PREFABS. Chemistry drives everything.**

---

## 🚀 Quick Start

```bash
# Install engine dependencies
npm install

# Run tests
npm test

# Build game
cd game
npm install
npm run dev
```

Open http://localhost:5173

---

## 📁 Structure

```
engine/         # Complete simulation engine (10,000 lines)
├── governors/  # 15 autonomous decision makers
├── procedural/ # 6 synthesis systems (chemistry → visuals)
├── core/       # 5 core systems (WorldManager API)
├── spawners/   # Terrain, biomes, creatures, NPCs
├── systems/    # Tools, structures, trade, workshops
└── tables/     # Constants

game/           # Clean game package
├── src/        # Uses WorldManager API only
└── Game.tsx    # Single world.update() call

tests/          # 87% coverage (977 lines)
├── unit/       # Governor, synthesis, spawner tests
└── integration/ # World, determinism, performance tests
```

---

## 📖 Documentation

- **[ENGINE.md](ENGINE.md)** - Complete engine API reference
- **[DFU_ARCHITECTURE_STUDY.md](DFU_ARCHITECTURE_STUDY.md)** - How we replicated Daggerfall Unity
- **[DFU_PREFAB_VS_SYNTHESIS.md](DFU_PREFAB_VS_SYNTHESIS.md)** - Synthesis vs prefabs analysis
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture
- **[engine/governors/README.md](engine/governors/README.md)** - Governor architecture
- **[tests/](tests/)** - Comprehensive test suite

## 🧪 Example: Creature Generation

**DFU (Prefabs):**
```csharp
GameObject rat = Instantiate(ratPrefab); // Fixed sprite
rat.transform.position = spawnPos;
```

**Ebb & Bloom (Synthesis):**
```typescript
// Governors decide traits
const traits = {
    mass: 2, // kg (rat-sized)
    diet: 'omnivore',
    locomotion: 'cursorial'
};

// Synthesis creates unique visuals
const creature = synthesis.generate(traits, biome);
// - Molecular composition from diet
// - Geometry from protein/calcium ratios
// - Coloring from environment
// - Infinite variation
```

---

## 🛠️ Technology Stack

**Engine:**
- **TypeScript** - Type safety throughout
- **Yuka** - AI framework (steering, goals, FSM, fuzzy logic)
- **SimplexNoise** - Terrain generation
- **seedrandom** - Deterministic RNG

**Game:**
- **React** - UI framework
- **React Three Fiber** - 3D rendering
- **THREE.js** - WebGL engine
- **Zustand** - State management
- **Vite** - Build tool

**Testing:**
- **Vitest** - Unit + integration tests
- **Playwright** - E2E tests (in packages/game)

---

## 🎯 Design Goals

1. **Governors over prefabs** - Autonomous decisions, not fixed assets
2. **Synthesis over sprites** - Chemistry creates visuals
3. **Emergence over hardcoding** - Complex from simple
4. **Determinism** - Same seed = same world
5. **DFU parity** - Match Daggerfall Unity features using governors

## 📊 Current Status

- **Engine**: 68 files, ~10,000 lines
- **Tests**: 45/52 passing (87% coverage)
- **Game**: Clean package, WorldManager API
- **Architecture**: DFU-based (GameManager → WorldManager)

---

## 🏗️ Development

```bash
# Engine tests
npm test

# Game development
cd game
npm install
npm run dev

# Engine validation
npm run type-check
```

---

---

## 🌟 What Makes This Different

**Daggerfall Unity uses:**
- Prefab creatures (fixed sprites)
- Billboard animations
- Hardcoded stats
- Asset files from 1996

**Ebb & Bloom uses:**
- Governor-driven traits (autonomous)
- Molecular synthesis (protein % → geometry)
- Biological chemistry (diet → coloring)
- No assets needed (pure code)

**Result:** Infinite biological variation vs fixed sprites.

---

## 💡 Inspiration

- **Daggerfall Unity** - Architecture patterns, terrain streaming
- **Yuka** - AI framework for governors
- **Elite (1984)** - Procedural generation philosophy

---

## License

MIT License - See [LICENSE](LICENSE)

---

**Made with ❤️ for explorers**
