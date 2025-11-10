# DFU Foundation Implementation Plan
**Date:** November 10, 2025  
**Status:** BEAST MODE ACTIVE  
**Goal:** Implement critical P0 systems from Daggerfall Unity

---

## PRIORITY ORDER (Based on DFU Analysis)

### 🔥 P0 - CRITICAL FOUNDATION (DO NOW)

#### 1. Fix Vegetation Steepness Check
**Problem:** Trees spawning on cliffs (looks terrible)  
**DFU Reference:** `TerrainNature.cs` line 117-119  
**File:** `VegetationSpawner.ts`  
**Complexity:** Low (30 min)  
**Impact:** High (visual quality)

**Implementation:**
```typescript
// Add to VegetationSpawner.spawnInChunk()
const steepness = this.getTerrainSteepness(worldX, worldZ);
if (steepness > 50) continue; // Skip steep slopes
```

#### 2. Fix Vegetation Settlement Clearance
**Problem:** Trees spawning inside cities (blocks buildings)  
**DFU Reference:** `TerrainNature.cs` line 121-125  
**File:** `VegetationSpawner.ts`  
**Complexity:** Low (30 min)  
**Impact:** Critical (gameplay)

**Implementation:**
```typescript
// Add to VegetationSpawner.spawnInChunk()
const nearestSettlement = this.settlements.getNearestSettlement(worldX, worldZ);
if (nearestSettlement && distance < settlementRadius + 20) continue;
```

#### 3. Create GameManager.ts
**Problem:** No central system management  
**DFU Reference:** `GameManager.cs` (1,138 lines)  
**File:** `src/core/GameManager.ts` (NEW)  
**Complexity:** Medium (2 hours)  
**Impact:** Critical (architecture)

**Implementation:**
```typescript
export class GameManager {
  private static instance: GameManager;
  
  private components: Map<string, any> = new Map();
  private state: GameState = GameState.SETUP;
  private isPaused: boolean = false;
  
  private constructor() {}
  
  static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }
  
  registerComponent(name: string, component: any) {
    this.components.set(name, component);
  }
  
  getComponent<T>(name: string): T | undefined {
    return this.components.get(name);
  }
  
  setState(state: GameState) {
    console.log(`[GameManager] State: ${this.state} → ${state}`);
    this.state = state;
  }
  
  pause() {
    this.isPaused = true;
    // Pause all systems
  }
  
  resume() {
    this.isPaused = false;
  }
}

enum GameState {
  SETUP,
  MENU,
  LOADING,
  PLAYING,
  PAUSED,
  INVENTORY,
  DIALOGUE,
  ERROR
}
```

---

### 🟡 P1 - IMPORTANT QUALITY (NEXT)

#### 4. Floating Origin
**Problem:** Precision breaks at >10km distance  
**DFU Reference:** `StreamingWorld.cs` line 88-89 (worldCompensation)  
**File:** `ChunkManager.ts`  
**Complexity:** High (4 hours)  
**Impact:** Critical for large worlds

**Implementation:**
```typescript
// Trigger every 1km from origin
if (player.position.length() > 1000) {
  const offset = player.position.clone();
  
  // Move player back to origin
  player.position.sub(offset);
  
  // Move all chunks
  for (const chunk of chunks.values()) {
    chunk.mesh.position.sub(offset);
  }
  
  // Track total offset
  worldOffset.add(offset);
}
```

#### 5. LOD System
**Problem:** All chunks same detail (performance)  
**DFU Reference:** `TerrainNature.cs` terrainDist parameter  
**Files:** `ChunkManager.ts`, `VegetationSpawner.ts`  
**Complexity:** Medium (3 hours)  
**Impact:** Performance

**Implementation:**
```typescript
enum ChunkLOD {
  HIGH = 64,    // Distance 0-1: Full detail
  MEDIUM = 32,  // Distance 2: Half detail
  LOW = 16      // Distance 3: Quarter detail
}

// In generateChunk()
const distance = Math.max(Math.abs(chunkX - playerChunkX), Math.abs(chunkZ - playerChunkZ));
const lod = distance <= 1 ? ChunkLOD.HIGH :
            distance == 2 ? ChunkLOD.MEDIUM :
                          ChunkLOD.LOW;

const geometry = new THREE.PlaneGeometry(
  this.chunkSize,
  this.chunkSize,
  lod,  // Segments based on distance
  lod
);
```

---

### 🟢 P2 - POLISH (LATER)

#### 6. Chunk Neighbor Stitching
**Problem:** Potential seams between chunks  
**File:** `ChunkManager.ts`  
**Complexity:** Medium (2 hours)

#### 7. Pause System
**Problem:** Can't pause game  
**File:** `GameManager.ts` + `game.html`  
**Complexity:** Low (1 hour)

#### 8. Threading (Web Workers)
**Problem:** Generation blocks main thread  
**File:** `ChunkManager.ts`  
**Complexity:** High (6 hours)

---

## IMPLEMENTATION ORDER (Today)

### Phase 1: Quick Wins (2 hours)
1. ✅ Fix vegetation steepness check (30 min)
2. ✅ Fix vegetation settlement clearance (30 min)
3. ✅ Create GameManager.ts skeleton (1 hour)

### Phase 2: Foundation (4 hours)
4. ✅ Implement GameManager state machine
5. ✅ Integrate GameManager into game.html
6. ✅ Add pause system

### Phase 3: Quality (4 hours)
7. ⏳ Implement LOD system
8. ⏳ Implement floating origin
9. ⏳ Test at large distances

---

## SUCCESS CRITERIA

**Phase 1 Complete:**
- ✅ No trees on cliffs (steepness < 50°)
- ✅ No trees in cities (clearance buffer)
- ✅ GameManager singleton exists

**Phase 2 Complete:**
- ✅ State machine working (Menu → Loading → Playing)
- ✅ Pause system working (ESC key)
- ✅ All systems registered with GameManager

**Phase 3 Complete:**
- ✅ LOD working (distant chunks lower detail)
- ✅ Floating origin working (travel >10km no precision loss)
- ✅ Performance maintained at all distances

---

## STARTING NOW (BEAST MODE)

**Current Status:** Game working, 121 FPS, all basic systems operational  
**Next:** Implement P0 fixes  
**ETA:** 10 hours total (2 + 4 + 4)

Let's go! 🚀


