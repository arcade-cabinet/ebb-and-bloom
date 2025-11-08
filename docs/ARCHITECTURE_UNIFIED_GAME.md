# Unified Game Package Architecture

**Status**: PROPOSAL  
**Date**: 2025-01-09  
**Rationale**: Simplify deployment, improve performance, align with cross-platform Capacitor build

---

## Problem Statement

**Current Architecture Issues**:
1. **Three separate servers** (backend + 2 frontend services) for development
2. **HTTP REST API overhead** for local communication
3. **Complex deployment** - multiple services to coordinate
4. **Not aligned with Capacitor** - mobile apps need single bundle

**Why This Matters**:
- For a **game** (cross-platform: web, mobile, desktop), we don't need microservices
- REST API makes sense for **development/testing** but not for **production game**
- Capacitor builds need a **single unified package** for cross-platform deployment

---

## Proposed Architecture

### Unified `packages/game` Package

```
packages/
├── backend/        # Pure simulation logic (library, not server)
├── gen/            # AI archetype generation (unchanged)
├── shared/         # Shared schemas/types (unchanged)
└── game/           # UNIFIED GAME PACKAGE
    ├── src/
    │   ├── simulation/    # Import from @ebb/backend (simulation logic)
    │   ├── scenes/        # BabylonJS scenes (main menu, game scene)
    │   ├── engine/        # GameEngine wrapper (direct function calls)
    │   └── index.ts       # Single entry point
    ├── dist/              # Single build artifact
    └── capacitor.config.ts # Capacitor config for mobile
```

### Communication Strategy

**Option 1: Direct Function Calls (Recommended)**
```typescript
// packages/game/src/engine/GameEngine.ts
import { GameEngine as BackendGameEngine } from '@ebb/backend/engine/GameEngine';

export class GameEngine {
  private backend: BackendGameEngine;
  
  // Direct function calls - no HTTP overhead
  async createGame(seed: string) {
    return this.backend.initializeGen0(seed);
  }
  
  async getRenderData(gameId: string) {
    return this.backend.getGen0RenderData(gameId);
  }
}
```

**Option 2: Protobuf/WebSocket (For Real-time Updates)**
```typescript
// If we need real-time updates (future)
// Use WebSocket with protobuf messages
// More efficient than REST for frequent updates
```

**Option 3: Hybrid (Development vs Production)**
```typescript
// Development: Use REST API (current setup)
// Production: Direct function calls (unified package)
const USE_API = process.env.NODE_ENV === 'development' && process.env.USE_API === 'true';
```

---

## Migration Path

### Phase 1: Create `packages/game` Structure
1. Create `packages/game/` directory
2. Move frontend scenes to `packages/game/src/scenes/`
3. Import backend as library (`@ebb/backend`)
4. Create `GameEngine` wrapper with direct function calls

### Phase 2: Update Build Process
1. Single Vite build for `packages/game`
2. Bundle backend simulation logic into game package
3. Update Capacitor config to point to `packages/game/dist`

### Phase 3: Remove Separate Servers
1. Keep `packages/backend` as **library** (not server)
2. Remove separate frontend servers
3. Single `packages/game` dev server

---

## Benefits

1. **Simpler Architecture**: One package, one build, one deployment
2. **Better Performance**: Direct function calls vs HTTP overhead
3. **Cross-Platform**: Aligns with Capacitor single-bundle model (web, mobile, desktop)
4. **Easier Development**: Single dev server, no service coordination
5. **Type Safety**: Direct imports = better TypeScript inference

---

## Trade-offs

**Lost**:
- Separate frontend/backend development (but can use library imports)
- REST API for external access (but can add API layer if needed)

**Gained**:
- Simpler architecture
- Better performance
- Cross-platform ready (web, mobile, desktop)
- Single deployment unit

---

## Implementation Notes

### Backend as Library
```typescript
// packages/backend/src/index.ts
export { GameEngine } from './engine/GameEngine';
export { AccretionSimulation } from './gen0/AccretionSimulation';
// ... other exports
```

### Game Package Imports
```typescript
// packages/game/src/engine/GameEngine.ts
import { GameEngine as BackendGameEngine } from '@ebb/backend';
// Direct usage - no HTTP
```

### Development Mode
```typescript
// Can still use REST API for development if needed
// via environment variable
if (process.env.USE_API === 'true') {
  // Use fetch() to backend server
} else {
  // Direct function calls
}
```

---

## Next Steps

1. **Create `packages/game` structure**
2. **Move frontend code** to `packages/game/src/scenes/`
3. **Create GameEngine wrapper** with direct function calls
4. **Update build process** for single artifact
5. **Update Capacitor config** to use `packages/game`
6. **Test unified build** and mobile deployment

---

**This architecture aligns with the game's cross-platform, Capacitor-based deployment model while maintaining clean separation of concerns through library imports.**

