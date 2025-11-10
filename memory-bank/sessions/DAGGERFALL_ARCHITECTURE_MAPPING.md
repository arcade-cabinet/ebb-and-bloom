# Daggerfall Unity → Ebb & Bloom Architecture Mapping

**Date:** Nov 10, 2025  
**Purpose:** Map proven Daggerfall Unity patterns to our law-based agentic system

---

## Core Philosophy

**Daggerfall (1996):** Procedural generation, infinite world, modular systems  
**Ebb & Bloom (2025):** Same approach + Law-based + Yuka agents + Modern tech

---

## Architecture Mapping

### 1. State Management

**Daggerfall Unity:**
```csharp
public enum StateTypes {
    Setup, Start, Game, UI, Paused, Death
}
```

**Our Implementation:**
```typescript
// src/core/GameStateManager.ts
enum GameState {
    SETUP, MENU, LOADING, PLAYING, PAUSED, INVENTORY, DIALOGUE, DEATH
}
```

**Enhancement:** State transitions validated by laws (e.g., can't enter dungeon if encumbered)

---

### 2. Player Systems

**Daggerfall Unity Pattern:**
```
PlayerMotor.cs          → Movement & collision
PlayerMouseLook.cs      → Camera control
PlayerHealth.cs         → Vitals
PlayerActivate.cs       → Object interaction
PlayerEnterExit.cs      → Building/dungeon transitions
```

**Our Implementation:**
```typescript
// Modular like Daggerfall, enhanced with Yuka
FirstPersonControls.ts  → Movement (WASD + Yuka Vehicle)
VirtualJoystick.ts      → Mobile controls (NEW)
PlayerHealth.ts         → Vitals + BiologyLaws
PlayerInteraction.ts    → Raycast interaction + Physics
PlayerTransitions.ts    → Chunk streaming (NOT dungeon loading)
```

**Enhancement:** All player actions validated by Physical/BiologyLaws

---

### 3. World Streaming

**Daggerfall Unity:**
```csharp
StreamingWorld.cs
- TerrainDistance: 3 (7x7 grid)
- UpdatePlayerTerrain()
- LoadTerrainBlock()
- RecycleOldBlocks()
```

**Our Implementation:**
```typescript
// src/world/ChunkManager.ts
- renderDistance: 3 (7x7 grid)  // EXACT SAME
- update(playerX, playerZ)
- loadChunk(x, z)
- Recycle when > 81 chunks
```

**Enhancement:** Chunks use SimplexNoise + BiomeSystem (NOT Daggerfall's heightmaps)

---

### 4. Terrain Generation

**Daggerfall Unity:**
```csharp
// Fixed heightmap from MAPS.BSA
// Climate zones from CLIMATE.PAK
// Deterministic per map pixel
```

**Our Implementation:**
```typescript
// src/world/SimplexNoise.ts + BiomeSystem.ts
- Procedural heightmap (Simplex noise, NOT fixed data)
- Climate from temperature/moisture noise
- Deterministic per seed (NOT map pixel)
```

**Key Difference:** Daggerfall loads from files, we generate from laws

---

### 5. NPC System

**Daggerfall Unity:**
```csharp
MobilePersonNPC.cs      → AI + schedules
MobilePersonMotor.cs    → Movement
StaticNPC.cs            → Quest NPCs
```

**Our Implementation:**
```typescript
// src/yuka-integration/agents/NPCAgent.ts
class NPCAgent extends Vehicle {
    schedule: DailySchedule;  // Daggerfall pattern
    brain: Think;             // Yuka enhancement
    
    update(delta) {
        // Check schedule (Daggerfall)
        // Execute brain (Yuka)
        // Validate with SocialLaws
    }
}
```

**Enhancement:** NPCs use Yuka AI + law-based decision making

---

### 6. Building System

**Daggerfall Unity:**
```csharp
BuildingDirectory.cs    → Track all buildings
DaggerfallInterior.cs   → Interior scenes
StaticDoor.cs           → Transitions
```

**Our Implementation:**
```typescript
// src/world/SettlementManager.ts
class SettlementManager {
    // Use SocialLaws for placement
    // Procedural generation (NOT fixed RMB/RDB blocks)
    // InstancingSystem for performance
}
```

**Enhancement:** Buildings generated from ArchitectureLaws, NOT loaded from files

---

### 7. UI System

**Daggerfall Unity:**
```csharp
DaggerfallUI.cs                 → UI manager
UserInterfaceWindow.cs          → Base window
DaggerfallInventoryWindow.cs    → Inventory
```

**Our Implementation:**
```typescript
// src/ui/UIManager.ts
class UIManager {
    private windows: Map<string, UIWindow>;
    
    // Same event-driven pattern
    // Modern HTML/CSS instead of Unity GUI
    // Mobile-first (responsive)
}
```

**Enhancement:** Responsive HTML UI, NOT fixed resolution

---

### 8. Save/Load System

**Daggerfall Unity:**
```csharp
SaveLoadManager.cs
- Binary save format
- Position, quests, inventory
- Deterministic world doesn't save
```

**Our Implementation:**
```typescript
// src/core/SaveManager.ts
- JSON save format (easier debugging)
- Player state + seed
- World regenerates from seed
```

**Same Philosophy:** Don't save procedural world, just player state + seed

---

## Key Adaptations

### What We Keep from Daggerfall

1. ✅ **Modular systems** - Each system independent
2. ✅ **Event-driven** - Systems communicate via events
3. ✅ **Chunk streaming** - 7x7 grid, recycling
4. ✅ **State machine** - Clear game states
5. ✅ **Menu flow** - Title → New Game → Play
6. ✅ **Deterministic world** - Seed-based generation
7. ✅ **NPC schedules** - Time-based behaviors

### What We Enhance

1. 🚀 **Laws replace data files** - Generate, don't load
2. 🚀 **Yuka AI** - Smarter agents than Daggerfall's AI
3. 🚀 **Simplex noise** - Better terrain than heightmaps
4. 🚀 **Mobile support** - Virtual joysticks
5. 🚀 **Modern graphics** - Three.js PBR materials
6. 🚀 **Biomes** - Climate-based terrain colors
7. 🚀 **Instancing** - Better performance than Daggerfall

### What We Change

1. ❌ **No dungeons** (yet) - Focus on open world first
2. ❌ **No magic system** (yet) - Laws provide "magic"
3. ❌ **No quests** (yet) - Exploration-driven
4. ✅ **Creatures use Yuka** - NOT Daggerfall's finite state machine
5. ✅ **No fast travel** (yet) - Walk/run only

---

## Implementation Priority (Following Daggerfall)

### Phase 1: Core Systems (DONE)
- ✅ State management
- ✅ Player movement
- ✅ Chunk streaming
- ✅ Terrain generation
- ✅ Biomes

### Phase 2: World Population (CURRENT)
- ⏳ Trees/vegetation (like Daggerfall's TerrainNature.cs)
- ⏳ Water bodies (like Daggerfall's water planes)
- ⏳ Settlements (like Daggerfall's city placement)

### Phase 3: NPCs & Buildings
- ⏳ NPC spawning (like Daggerfall's MobilePersonNPC)
- ⏳ Buildings (like Daggerfall's RMB blocks, but procedural)
- ⏳ Schedules (like Daggerfall's time-based actions)

### Phase 4: Gameplay
- ⏳ Inventory system
- ⏳ Item interaction
- ⏳ Dialogue system
- ⏳ Save/load

---

## Code Organization (Daggerfall Pattern)

```
src/
├── core/               # Like Daggerfall's Game/
│   ├── GameStateManager.ts
│   ├── GameManager.ts
│   └── SaveManager.ts
├── player/             # Like Daggerfall's Game/Player/
│   ├── FirstPersonControls.ts
│   ├── VirtualJoystick.ts
│   └── PlayerInteraction.ts
├── world/              # Like Daggerfall's Terrain/
│   ├── ChunkManager.ts
│   ├── SimplexNoise.ts
│   ├── BiomeSystem.ts
│   └── SettlementManager.ts
├── yuka-integration/   # Our enhancement (NOT in Daggerfall)
│   └── agents/
│       ├── NPCAgent.ts
│       └── CreatureAgent.ts
├── laws/               # Our enhancement (replaces Daggerfall's data files)
│   ├── physics.ts
│   ├── biology.ts
│   └── social.ts
└── ui/                 # Like Daggerfall's UserInterface/
    ├── UIManager.ts
    └── windows/
```

---

## Success Criteria

**Daggerfall Unity proved:**
- Infinite world works (161,600 km² on 8MB RAM)
- Modular systems scale
- Event-driven architecture is maintainable
- Procedural + deterministic = infinite replayability

**We prove:**
- Laws generate richer worlds than data files
- Yuka agents are smarter than FSM AI
- Modern web tech can match Unity performance
- Mobile + desktop work from same codebase

---

## Next Steps

Following Daggerfall's proven approach:

1. **Trees** (like TerrainNature.cs) - Instanced vegetation
2. **Water** (like DaggerfallTerrain.cs water planes) - Blue quads
3. **Settlements** (like StreamingWorld.cs city placement) - SocialLaws
4. **Buildings** (like BuildingDirectory.cs) - Procedural from ArchitectureLaws
5. **NPCs** (like MobilePersonNPC.cs) - Yuka + schedules

**Philosophy:** If Daggerfall did it in 1996, we can do it better in 2025.


