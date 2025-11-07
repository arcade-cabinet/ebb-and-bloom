# Backend Testing Strategy

## Test Levels

### 1. Unit Tests (Fast, No Dependencies)
**Location**: `packages/backend/test/*.test.ts`

Tests individual components in isolation:
- GameEngine logic
- Individual systems
- Utility functions
- Pure functions

**Run**: `pnpm test`
**No server required**

Example:
```typescript
// test/GameEngine.test.ts
describe('GameEngine', () => {
  it('should initialize with seed phrase', async () => {
    const engine = new GameEngine('game-123');
    await engine.initialize('test-world');
    expect(engine.getState().seedPhrase).toBe('test-world');
  });
});
```

### 2. Integration Tests (Server Required)
**Location**: `packages/backend/test/*.integration.test.ts`

Tests API endpoints with real server:
- REST API endpoints
- Request/response format
- Error handling
- State persistence

**Run**: 
1. Terminal 1: `pnpm dev` (start server)
2. Terminal 2: `pnpm test:integration`

Example:
```typescript
// test/api.integration.test.ts
describe('Backend API', () => {
  it('should create game via API', async () => {
    const response = await axios.post('/api/game/create', {
      seedPhrase: 'test'
    });
    expect(response.status).toBe(200);
  });
});
```

### 3. E2E Tests (Full Stack)
**Location**: `test/e2e/*.test.ts` (workspace root)

Tests complete user flows:
- Backend + CLI together
- Backend + Frontend together
- Multi-user scenarios
- Real-world workflows

**Run**: `pnpm test:e2e` (starts all services)

Example:
```typescript
// test/e2e/game-flow.test.ts
describe('Complete Game Flow', () => {
  it('should play game from start to finish', async () => {
    // Create game via backend
    // Connect CLI
    // Advance generations
    // Check frontend updates
  });
});
```

---

## Current Test Commands

### Backend Tests Only
```bash
cd packages/backend

# Unit tests (no server needed)
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test -- --coverage
```

### Integration Tests
```bash
# Terminal 1: Start server
cd packages/backend
pnpm dev

# Terminal 2: Run integration tests
cd packages/backend
pnpm test:integration
```

### All Tests
```bash
# From workspace root
pnpm test           # All packages
pnpm test:backend   # Backend only
```

---

## What to Test Where

### Unit Tests (Backend)
✅ GameEngine state management
✅ System logic (when systems are added)
✅ Store operations
✅ Utility functions
✅ Pure calculations

❌ API endpoints
❌ HTTP requests
❌ Database connections
❌ External services

### Integration Tests (Backend)
✅ API endpoints
✅ Request/response format
✅ Error codes
✅ State persistence across requests
✅ CORS headers
✅ WebSocket connections

❌ UI interactions
❌ CLI commands
❌ Frontend rendering

### E2E Tests (Workspace Root)
✅ Complete user flows
✅ Backend + CLI together
✅ Backend + Frontend together
✅ Multi-service scenarios
✅ Real-world usage patterns

---

## Test File Naming

```
packages/backend/test/
  ├── GameEngine.test.ts              # Unit test
  ├── api.integration.test.ts         # Integration test
  └── stores/
      └── PlanetaryStructure.test.ts  # Unit test

test/e2e/
  ├── game-flow.test.ts               # E2E test
  └── cli-backend.test.ts             # E2E test
```

**Convention**:
- `*.test.ts` = Unit tests
- `*.integration.test.ts` = Integration tests
- E2E tests go in workspace root `/test/e2e/`

---

## Running Tests in CI

```yaml
# .github/workflows/test.yml
jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm install
      - run: pnpm test:backend  # Unit tests only
  
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm install
      - run: pnpm dev:backend &  # Start server in background
      - run: sleep 5             # Wait for server
      - run: pnpm test:integration
  
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm install
      - run: pnpm dev &          # Start all services
      - run: sleep 10
      - run: pnpm test:e2e
```

---

## Current Status

✅ **Unit tests**: Created (`GameEngine.test.ts`)
✅ **Integration tests**: Created (`api.integration.test.ts`)
✅ **Test config**: Created (`vitest.config.ts`)
⏳ **E2E tests**: TODO (workspace root)
⏳ **CLI tests**: TODO (`packages/cli/test/`)

---

## Next Steps

1. **Run unit tests**: Verify GameEngine works
2. **Run integration tests**: Verify API works
3. **Add CLI tests**: Test CLI commands (mock API)
4. **Add E2E tests**: Test full stack together

**But first**: Prove backend unit tests pass!
