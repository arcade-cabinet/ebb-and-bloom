# SIMPLE TEST PLAN

## Goal
Prove the monorepo architecture works with the SIMPLEST possible test.

## What We're Testing
1. Backend starts
2. Backend creates game
3. Backend returns game state
4. CLI connects to backend
5. CLI creates game via API
6. CLI gets state via API

## Steps

### 1. Start Backend
```bash
cd packages/backend
pnpm dev
```

**Expected**: 
- Server starts on port 3001
- See "Backend running on http://0.0.0.0:3001"

### 2. Test Health Endpoint
```bash
curl http://localhost:3001/health
```

**Expected**: 
```json
{"status":"ok"}
```

### 3. Create Game via API
```bash
curl -X POST http://localhost:3001/api/game/create \
  -H "Content-Type: application/json" \
  -d '{"seedPhrase":"test-world"}'
```

**Expected**:
```json
{
  "gameId": "game-1234567890",
  "state": {
    "gameId": "game-1234567890",
    "seedPhrase": "test-world",
    "generation": 0,
    "message": "Game created with seed: test-world"
  }
}
```

### 4. Get Game State
```bash
curl http://localhost:3001/api/game/game-1234567890
```

**Expected**:
```json
{
  "state": {
    "gameId": "game-1234567890",
    "seedPhrase": "test-world",
    "generation": 0,
    "message": "Game created with seed: test-world"
  }
}
```

### 5. Test CLI (in another terminal)
```bash
cd packages/cli
pnpm dev
```

**Expected**:
- CLI starts
- Shows "Connected to backend"
- Shows prompt: `ebb>`

### 6. Create Game via CLI
```
ebb> init test-world
```

**Expected**:
```
🌍 Creating world: "test-world"...

✓ Game created!
  Game ID: game-1234567890
  Seed: test-world
  Generation: 0

🌅 Dawn of Generation 0, Cycle 0
```

### 7. Advance Generation via CLI
```
ebb> gen
```

**Expected**:
```
⏭️  GENERATION 1

🌅 Dawn of Generation 1, Cycle 0
```

### 8. Check Status
```
ebb> status
```

**Expected**:
```
📊 GAME STATUS

Game ID:    game-1234567890
Seed:       test-world
Generation: 1
```

## Success Criteria

✅ Backend runs without errors
✅ Health endpoint responds
✅ Can create game via curl
✅ Can get state via curl
✅ CLI connects to backend
✅ CLI can create game
✅ CLI can advance generation
✅ CLI can check status

## If This Works

THEN and ONLY THEN do we:
1. Add one system at a time
2. Add one endpoint at a time
3. Add one CLI command at a time

## If This Fails

Stop. Fix it. Don't add anything else.
