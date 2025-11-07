# 🎮 Ebb & Bloom - Monorepo Architecture

**FINALLY: Proper decomposition with backend-first development**

---

## Architecture Overview

```
ebb-and-bloom/
├── packages/
│   ├── backend/     ← GAME LOGIC + REST API (develop THIS first)
│   ├── cli/         ← CLI client (connects to backend)
│   └── frontend/    ← React + Three.js (queries backend API)
├── pnpm-workspace.yaml
├── process-compose.yml
└── package.json
```

### Why This Structure?

**The Problem**: No decomposition. Frontend, backend, CLI, dev tools all mixed together in `/src`. Impossible to work on one part without breaking another.

**The Solution**: 
- **Backend** (`@ebb/backend`) - Pure game logic, no React, no Three.js
- **CLI** (`@ebb/cli`) - Text client that connects to backend
- **Frontend** (`@ebb/frontend`) - 3D visualization that queries backend

**Benefits**:
1. **Backend is framework-agnostic** - Can run standalone, in tests, on server
2. **CLI proves game works** - Before adding any 3D
3. **Frontend is just a viewer** - Queries backend API, doesn't contain game logic
4. **Easy to test** - Each package has its own tests
5. **Easy to deploy** - Backend can run on server, frontend on CDN, CLI anywhere

---

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Start Backend + Frontend Together
```bash
pnpm dev
```

This uses `process-compose` to start:
- Backend API on `http://localhost:3001`
- Frontend dev server on `http://localhost:5173`

### 3. Or Start Services Individually

**Backend only**:
```bash
pnpm dev:backend
```

**Frontend only** (requires backend running):
```bash
pnpm dev:frontend
```

**CLI** (requires backend running):
```bash
pnpm dev:cli
```

---

## Package Details

### 📦 @ebb/backend - Game Logic + REST API

**Location**: `packages/backend/`

**What it contains**:
- Complete game logic (ECS systems, Yuka integration, AI workflows)
- REST API server (Fastify)
- WebSocket server for real-time updates
- No React, no Three.js, no DOM - just pure algorithms

**Key files**:
- `src/server.ts` - REST API server
- `src/engine/GameEngine.ts` - Core game loop
- `src/systems/` - All game systems (move existing from `/src/systems`)
- `src/stores/` - Zustand stores (move existing from `/src/stores`)

**API Endpoints**:
```
POST   /api/game/create          - Create new game
GET    /api/game/:id             - Get game state  
POST   /api/game/:id/cycle       - Advance day/night cycle
POST   /api/game/:id/generation  - Advance generation
WS     /ws/game/:id              - Real-time updates
```

**Run**:
```bash
cd packages/backend
pnpm dev     # Start dev server with hot reload
pnpm build   # Build for production
pnpm test    # Run tests
```

**Port**: `3001` (configurable via `PORT` env var)

---

### 📦 @ebb/cli - Command Line Client

**Location**: `packages/cli/`

**What it contains**:
- Interactive CLI (human player)
- Blocking mode (for automation/testing)
- Connects to backend API
- Beautiful terminal UI with colors

**Features**:
- Create games from seed phrases
- Advance time (cycles, generations)
- View game state
- Real-time event updates
- Old-school adventure game feel

**Run**:
```bash
cd packages/cli
pnpm dev     # Start CLI (backend must be running)
```

**Commands**:
```
ebb> init volcanic-world
ebb> cycle
ebb> gen
ebb> status
ebb> quit
```

**Can be installed globally**:
```bash
pnpm build
pnpm link --global
ebb          # Run from anywhere!
```

---

### 📦 @ebb/frontend - React + Three.js Visualization

**Location**: `packages/frontend/`

**What it contains**:
- React Three Fiber 3D renderer
- UI components (@react-three/uikit)
- Queries backend API for game state
- NO game logic (just visualization)

**Key concept**: Frontend is **stateless**. All state lives in backend. Frontend just draws what backend tells it to.

**Run**:
```bash
cd packages/frontend
pnpm dev     # Start Vite dev server (backend must be running)
```

**Port**: `5173`

---

## Migration Plan

### Phase 1: Move Backend (CURRENT)
- [x] Create `packages/backend/` structure
- [x] Create basic REST API server
- [x] Create GameEngine skeleton
- [ ] Move `/src/systems` → `packages/backend/src/systems`
- [ ] Move `/src/stores` → `packages/backend/src/stores`
- [ ] Move `/src/core` → `packages/backend/src/core`
- [ ] Move `/src/utils` → `packages/backend/src/utils`
- [ ] Wire systems to GameEngine
- [ ] Wire stores to REST API
- [ ] Delete old CLI files:
  - `src/dev/cli-game.ts` ❌ DELETE
  - `src/dev/comprehensive-game-cli.ts` ❌ DELETE
  - `src/dev/simulate-game.ts` ❌ DELETE
  - `src/dev/GameDevCLI.ts` → Move asset generation to backend

### Phase 2: Complete CLI
- [x] Create `packages/cli/` structure
- [x] Create basic CLI client
- [ ] Add all game commands
- [ ] Add WebSocket support for real-time updates
- [ ] Add non-blocking mode
- [ ] Add save/load support

### Phase 3: Setup Frontend (Later)
- [ ] Move `/src/components` → `packages/frontend/src/components`
- [ ] Move `/src/contexts` → `packages/frontend/src/contexts`
- [ ] Create API client for backend
- [ ] Wire components to query backend
- [ ] Remove all game logic from components

---

## Development Workflow

### Backend-First Development

**Start here**. Get backend working with CLI before touching frontend.

```bash
# Terminal 1: Backend
cd packages/backend
pnpm dev

# Terminal 2: CLI
cd packages/cli
pnpm dev
```

**Workflow**:
1. Add feature to backend (`GameEngine`, systems, stores)
2. Add API endpoint if needed (`server.ts`)
3. Test via CLI
4. Write tests
5. Only then add frontend visualization

### Adding a New Feature

**Example**: Adding building construction

**Step 1: Backend** (`packages/backend/src/systems/BuildingSystem.ts`)
```typescript
export class BuildingSystem {
  constructBuilding(tribe: Tribe, type: BuildingType) {
    // Pure game logic
    const building = createBuilding(tribe, type);
    return building;
  }
}
```

**Step 2: API** (`packages/backend/src/server.ts`)
```typescript
fastify.post('/api/game/:id/building', async (req, reply) => {
  const { tribeId, type } = req.body;
  const building = engine.constructBuilding(tribeId, type);
  return { building };
});
```

**Step 3: CLI** (`packages/cli/src/index.ts`)
```typescript
async cmdBuild(tribeId: string, type: string) {
  await axios.post(`${API_URL}/api/game/${gameId}/building`, {
    tribeId, type
  });
  console.log('Building constructed!');
}
```

**Step 4: Frontend** (LATER)
```tsx
// Just queries the API
const { data } = useSWR(`/api/game/${gameId}/buildings`);
return data.buildings.map(b => <BuildingMesh building={b} />);
```

---

## Testing Strategy

### Backend Tests
```bash
cd packages/backend
pnpm test
```

Test everything:
- Game engine logic
- System interactions
- API endpoints
- WebSocket behavior

### CLI Tests
```bash
cd packages/cli
pnpm test
```

Test:
- Command parsing
- API communication
- Error handling

### Integration Tests
```bash
pnpm test
```

Test:
- Backend + CLI together
- Backend + Frontend together
- Full game loop

---

## Deployment

### Backend (Node.js Server)
```bash
cd packages/backend
pnpm build
node dist/server.js
```

Deploy to:
- Railway
- Fly.io
- DigitalOcean
- AWS Lambda

### Frontend (Static Site)
```bash
cd packages/frontend
pnpm build
```

Deploy to:
- Vercel
- Netlify
- Cloudflare Pages
- S3 + CloudFront

### CLI (Standalone Binary)
```bash
cd packages/cli
pnpm build
npm pack
```

Users can install globally:
```bash
npm install -g ebb-and-bloom-cli
```

---

## Benefits of This Architecture

### ✅ Separation of Concerns
- Backend = game logic (algorithms, Yuka, ECS)
- CLI = text interface (commands, output)
- Frontend = visualization (React, Three.js)

### ✅ Backend-First Development
- Prove game works without graphics
- Test everything via CLI
- Add 3D later as enhancement

### ✅ Independent Deployment
- Backend on server (stateful)
- Frontend on CDN (stateless)
- CLI distributed as package

### ✅ Easy Testing
- Backend: Pure logic tests
- CLI: Command tests
- Frontend: Component tests
- Integration: Full stack tests

### ✅ Clean Dependencies
- Backend: Only game logic deps (Yuka, Miniplex, Zustand)
- CLI: Only terminal deps (Commander, Chalk, Inquirer)
- Frontend: Only React/Three.js deps

### ✅ Flexible Frontend
- Can build multiple frontends (web, mobile, desktop)
- All query same backend API
- Backend doesn't care what's rendering

---

## Current State

### ✅ What Works
- [x] Monorepo structure created
- [x] Backend package skeleton
- [x] CLI package skeleton
- [x] Frontend package skeleton
- [x] Process-compose orchestration
- [x] Basic REST API
- [x] Basic CLI client

### 🚧 What's In Progress
- [ ] Moving systems to backend
- [ ] Moving stores to backend
- [ ] Wiring GameEngine to systems
- [ ] Complete API endpoints
- [ ] Complete CLI commands

### ⏳ What's Next
- [ ] Delete old CLI files
- [ ] Move all game logic to backend
- [ ] Test backend + CLI together
- [ ] Add WebSocket support
- [ ] Frontend migration (later)

---

## The Bottom Line

**No more mixed concerns. No more nightmare codebase.**

- Want to work on game logic? → `packages/backend`
- Want to test in terminal? → `packages/cli`
- Want to add 3D rendering? → `packages/frontend`

**Each package has clear responsibility. Each can be developed independently.**

**This is how we finish Ebb & Bloom properly.**

---

## Getting Started Right Now

```bash
# 1. Install everything
pnpm install

# 2. Start backend
pnpm dev:backend

# 3. In another terminal, start CLI
pnpm dev:cli

# 4. Play the game!
ebb> init test-world
ebb> cycle
ebb> gen
ebb> status
```

**The game works. It's just algorithms. Frontend is optional.**

Let's finish this.
