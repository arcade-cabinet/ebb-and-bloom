# Ebb & Bloom

> Explore infinite procedurally generated worlds from three-word seeds

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.169-green)](https://threejs.org/)

---

## 🌍 What is this?

Explore living, evolving worlds powered by autonomous governors. Each world is unique, deterministic, and infinite.

```typescript
import { GameEngine } from 'ebb-and-bloom-engine';

const world = new GameEngine({ seed: 'v1-green-valley-breeze' });
// Infinite terrain, creatures, NPCs, settlements
// Same seed = same world every time
```

**Same seed = same world. Share seeds with friends.**

---

## ✨ Features

- 🌍 **Infinite Worlds** - Procedural terrain from three-word seeds
- 🦌 **Living Creatures** - 15 governors power biology, ecology, behavior
- 🏘️ **Settlements** - Villages, towns, cities with NPCs
- 🌲 **11 Biomes** - Desert, forest, tundra, rainforest, etc.
- 🎮 **First-Person** - Explore on foot (Daggerfall-style)
- 📱 **Cross-Platform** - Web, iOS, Android

---

## 15 Autonomous Governors

Create living, evolving worlds:
- **Physics (2)** - Gravity, Weather
- **Biology (5)** - Metabolism, Aging, Reproduction, Genetics, Cognition
- **Ecology (5)** - Flocking, Predation, Territory, Foraging, Migration
- **Social (3)** - Hierarchy, Warfare, Cooperation

Same seed = same world. Share seeds with friends.

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/ebb-and-bloom/engine.git
cd engine

# Install
npm install

# Run
cd demo
npm run dev
```

Open http://localhost:5173

---

## 📁 Structure

```
engine/         # World simulation engine
├── governors/ # 15 autonomous governors (biology, ecology, social)
├── spawners/  # Terrain, biomes, creatures, NPCs, settlements
├── agents/    # Creature AI (Yuka)
├── tables/    # Constants
└── core/      # GameEngine

demo/          # React Three Fiber demos
└── terrain/   # Main game (world exploration)
```

---

## 🎮 Gameplay

### Exploration
- First-person movement
- Infinite procedural terrain
- 7x7 chunk streaming (Daggerfall pattern)
- 11 distinct biomes

### Creatures
- Autonomous AI (Yuka steering)
- Metabolism & energy systems
- Lifecycle (juvenile → adult → elder)
- Predator-prey dynamics
- Flocking behaviors

### Settlements
- Procedurally placed cities
- Daily NPC schedules
- Social hierarchies
- Resource-based growth

---

## 🛠️ Technology

- **TypeScript** - Type safety
- **React Three Fiber** - 3D rendering
- **Yuka** - AI behaviors
- **SimplexNoise** - Terrain (O(n²), superior to Perlin)
- **Zustand** - State management
- **Vite** - Build tool

---

## 📊 Performance

- 120 FPS constant
- 49 chunks loaded (7x7 grid)
- Instanced vegetation (1 draw call per type)
- Efficient memory (~15MB for full world)

---

## 🎯 Status

**Current:** v1.1 - Governors Complete  
**Engine:** 15 planetary governors operational  
**Game:** Working at 120 FPS  
**Mobile:** Responsive, touch-friendly

---

## 📖 Documentation

- **[ENGINE.md](ENGINE.md)** - Engine documentation
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture
- **[memory-bank/](memory-bank/)** - Development context

---

## Inspiration

**Daggerfall (1996)** - Procedural generation pioneer  
**Daggerfall Unity** - 16 years of proven patterns  
**Elite (1984)** - Infinite universe in 22KB

---

## License

MIT License - See [LICENSE](LICENSE)

---

**Made with ❤️ for explorers**
