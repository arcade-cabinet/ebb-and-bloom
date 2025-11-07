# DATABASE, NOT ZUSTAND

## What Zustand Is For

**Zustand = Ephemeral UI state**

```typescript
// Good Zustand usage:
interface UIState {
  selectedCreature: string | null;
  cameraPosition: Vector3;
  modalOpen: boolean;
  filterSettings: FilterSettings;
}
```

**NOT for:**
- 9000 cycles of game data
- Historical queries
- Time-series analysis
- Persistent storage

---

## What We Actually Need

**Time-series database for game state**

```
Cycle 0 → State snapshot
Cycle 1 → State snapshot
Cycle 2 → State snapshot
...
Cycle 9000 → State snapshot

Total: 9000+ rows of state data
```

**Queries like:**
- "What was the state at cycle 1234?"
- "Show me all cycles where tools emerged"
- "Graph material depletion from cycle 0-1000"
- "Replay from cycle 500"

**Zustand can't do this efficiently.**

---

## Database Choice: SQLite

**Why SQLite:**
1. **Embedded** - No separate server
2. **Single file** - Easy to manage/backup
3. **Fast** - Millions of rows no problem
4. **SQL queries** - Powerful analysis
5. **Portable** - Works on all platforms
6. **Node.js support** - `better-sqlite3`

**Perfect for:**
- Storing every cycle
- Querying historical data
- Time-series analysis
- Replay functionality

---

## Schema Design

### Table: `cycles`
```sql
CREATE TABLE cycles (
  cycle INTEGER PRIMARY KEY,
  generation INTEGER NOT NULL,
  is_day BOOLEAN NOT NULL,
  timestamp TEXT NOT NULL,
  
  -- Creature stats (aggregated)
  creature_count INTEGER,
  avg_energy REAL,
  avg_excavation REAL,
  avg_strength REAL,
  
  -- Material stats (aggregated)
  accessible_materials INTEGER,
  depleted_materials INTEGER,
  total_consumed REAL,
  
  -- Emergence flags
  tools_count INTEGER,
  buildings_count INTEGER,
  packs_count INTEGER,
  tribes_count INTEGER,
  
  -- Pressure
  depth_pressure REAL,
  scarcity_pressure REAL,
  
  -- Full state blob (JSON)
  state_json TEXT
);

CREATE INDEX idx_generation ON cycles(generation);
CREATE INDEX idx_cycle ON cycles(cycle);
```

### Table: `events`
```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cycle INTEGER NOT NULL,
  generation INTEGER NOT NULL,
  type TEXT NOT NULL,
  data TEXT, -- JSON
  
  FOREIGN KEY (cycle) REFERENCES cycles(cycle)
);

CREATE INDEX idx_event_cycle ON events(cycle);
CREATE INDEX idx_event_type ON events(type);
```

### Table: `creatures`
```sql
CREATE TABLE creatures (
  id TEXT PRIMARY KEY,
  cycle_created INTEGER NOT NULL,
  cycle_died INTEGER,
  parent_id TEXT,
  
  -- Traits at creation
  excavation REAL,
  strength REAL,
  manipulation REAL,
  intelligence REAL,
  social REAL,
  
  FOREIGN KEY (cycle_created) REFERENCES cycles(cycle),
  FOREIGN KEY (cycle_died) REFERENCES cycles(cycle)
);
```

### Table: `materials`
```sql
CREATE TABLE materials (
  type TEXT PRIMARY KEY,
  initial_amount REAL,
  hardness REAL,
  depth REAL
);

CREATE TABLE material_state (
  cycle INTEGER NOT NULL,
  material_type TEXT NOT NULL,
  remaining REAL NOT NULL,
  accessible BOOLEAN NOT NULL,
  
  PRIMARY KEY (cycle, material_type),
  FOREIGN KEY (cycle) REFERENCES cycles(cycle),
  FOREIGN KEY (material_type) REFERENCES materials(type)
);
```

---

## The Architecture

```
┌─────────────────────────────────────────────┐
│              CLI / Frontend                 │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│              REST API                       │
├─────────────────────────────────────────────┤
│  POST /world/tick → Advance cycle           │
│  GET /state/cycle/:n → Query history        │
│  GET /state/cycles?from=0&to=100            │
│  GET /events?type=tool_emerged              │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│          World Simulation                   │
│         (Pure computation)                  │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│          SQLite Database                    │
│       (Persistent storage)                  │
│                                             │
│  - cycles table                             │
│  - events table                             │
│  - creatures table                          │
│  - material_state table                     │
└─────────────────────────────────────────────┘
```

**Zustand is REMOVED.**

**Database handles ALL state persistence.**

---

## Implementation

### Database Client

```typescript
// src/state/database.ts
import Database from 'better-sqlite3';

export class GameDatabase {
  private db: Database.Database;
  
  constructor(filepath: string) {
    this.db = new Database(filepath);
    this.initialize();
  }
  
  private initialize() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS cycles (
        cycle INTEGER PRIMARY KEY,
        generation INTEGER NOT NULL,
        is_day BOOLEAN NOT NULL,
        timestamp TEXT NOT NULL,
        creature_count INTEGER,
        avg_energy REAL,
        accessible_materials INTEGER,
        state_json TEXT
      );
      
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cycle INTEGER NOT NULL,
        generation INTEGER NOT NULL,
        type TEXT NOT NULL,
        data TEXT
      );
    `);
  }
  
  public saveCycle(state: WorldState) {
    const stmt = this.db.prepare(`
      INSERT INTO cycles (
        cycle, generation, is_day, timestamp, 
        creature_count, avg_energy, accessible_materials, state_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      state.cycle,
      state.generation,
      state.isDay,
      new Date().toISOString(),
      state.creatures.length,
      avgEnergy(state.creatures),
      countAccessible(state.materials),
      JSON.stringify(state)
    );
  }
  
  public getCycle(cycle: number): WorldState | null {
    const stmt = this.db.prepare('SELECT state_json FROM cycles WHERE cycle = ?');
    const row = stmt.get(cycle);
    return row ? JSON.parse(row.state_json) : null;
  }
  
  public getCycleRange(from: number, to: number): WorldState[] {
    const stmt = this.db.prepare(
      'SELECT state_json FROM cycles WHERE cycle BETWEEN ? AND ? ORDER BY cycle'
    );
    const rows = stmt.all(from, to);
    return rows.map(r => JSON.parse(r.state_json));
  }
  
  public saveEvent(cycle: number, generation: number, type: string, data: any) {
    const stmt = this.db.prepare(`
      INSERT INTO events (cycle, generation, type, data)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(cycle, generation, type, JSON.stringify(data));
  }
  
  public getEvents(filter?: { type?: string; fromCycle?: number; toCycle?: number }) {
    let query = 'SELECT * FROM events WHERE 1=1';
    const params: any[] = [];
    
    if (filter?.type) {
      query += ' AND type = ?';
      params.push(filter.type);
    }
    if (filter?.fromCycle) {
      query += ' AND cycle >= ?';
      params.push(filter.fromCycle);
    }
    if (filter?.toCycle) {
      query += ' AND cycle <= ?';
      params.push(filter.toCycle);
    }
    
    query += ' ORDER BY cycle';
    
    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }
}
```

### Usage in Simulation

```typescript
// src/world/simulation.ts
import { GameDatabase } from '../state/database.js';

export class Simulation {
  private cycle: number = 0;
  private state: WorldState;
  private db: GameDatabase;
  
  constructor(gameId: string) {
    this.db = new GameDatabase(`./data/${gameId}.db`);
  }
  
  public tick(): CycleResult {
    // Compute next state
    this.state = computeCycle(this.cycle, this.state);
    this.cycle++;
    
    // Save to database
    this.db.saveCycle(this.state);
    
    // Save events
    for (const event of this.state.events) {
      this.db.saveEvent(this.cycle, this.state.generation, event.type, event.data);
    }
    
    return {
      cycle: this.cycle,
      state: this.state,
    };
  }
  
  public replay(targetCycle: number): WorldState {
    // Load from database
    const state = this.db.getCycle(targetCycle);
    if (state) {
      this.state = state;
      this.cycle = targetCycle;
      return state;
    }
    
    throw new Error(`Cycle ${targetCycle} not found`);
  }
}
```

---

## REST API Updated

```typescript
// src/api/state/query.ts
import { GameDatabase } from '../../state/database.js';

export function registerStateQueryRoutes(fastify: FastifyInstance) {
  const db = new GameDatabase('./data/game.db');
  
  // Get single cycle
  fastify.get('/state/cycle/:cycle', async (request) => {
    const { cycle } = request.params;
    const state = db.getCycle(parseInt(cycle));
    return state || { error: 'Cycle not found' };
  });
  
  // Get range of cycles
  fastify.get('/state/cycles', async (request) => {
    const { from, to } = request.query;
    return db.getCycleRange(parseInt(from), parseInt(to));
  });
  
  // Get events
  fastify.get('/state/events', async (request) => {
    const { type, from, to } = request.query;
    return db.getEvents({
      type: type as string,
      fromCycle: from ? parseInt(from) : undefined,
      toCycle: to ? parseInt(to) : undefined,
    });
  });
  
  // Analysis queries
  fastify.get('/state/analysis/material-depletion', async () => {
    // SQL query across all cycles
    const db = new GameDatabase('./data/game.db');
    const rows = db.db.prepare(`
      SELECT cycle, 
             SUM(remaining) as total_remaining
      FROM material_state
      GROUP BY cycle
      ORDER BY cycle
    `).all();
    
    return rows;
  });
}
```

---

## CLI Benefits

```bash
# Query any cycle instantly
$ ebb state --cycle 1234
Cycle 1234 (Gen 3, Day)
Creatures: 15, Avg excavation: 0.78
Materials accessible: 12/20
Tools: [stone-digger, metal-extractor]

# Query cycle range
$ ebb state --from 0 --to 100 --format csv
cycle,generation,creature_count,accessible_materials
0,0,1,2
1,0,1,2
2,0,1,2
...

# Query events
$ ebb events --type tool_emerged
Cycle 100: stone-digger
Cycle 523: metal-extractor
Cycle 1842: deep-drill

# Replay from any cycle
$ ebb replay --from-cycle 500
Loaded state from cycle 500
Continuing from Gen 3, Cycle 500...

# Export database
$ ebb export --format json --output game-history.json
Exported 9000 cycles to game-history.json
```

---

## Analytical Queries

```sql
-- Material depletion over time
SELECT cycle, material_type, remaining 
FROM material_state 
WHERE material_type = 'soil'
ORDER BY cycle;

-- Tool emergence timeline
SELECT cycle, data 
FROM events 
WHERE type = 'tool_emerged'
ORDER BY cycle;

-- Creature evolution rate
SELECT generation, AVG(excavation) as avg_excavation
FROM creatures
JOIN cycles ON creatures.cycle_created = cycles.cycle
GROUP BY generation;

-- Pressure correlation
SELECT 
  c.cycle,
  c.depth_pressure,
  COUNT(e.id) as event_count
FROM cycles c
LEFT JOIN events e ON c.cycle = e.cycle AND e.type = 'tool_emerged'
GROUP BY c.cycle;
```

---

## Performance

**SQLite can handle:**
- Millions of rows
- Complex queries
- Concurrent reads
- Fast writes (with transactions)

**9000 cycles:**
- 9000 rows in `cycles` table (trivial)
- ~50,000 rows in `events` table (easy)
- ~100 rows in `creatures` table (nothing)
- ~180,000 rows in `material_state` table (fine)

**Total: ~250k rows = no problem for SQLite**

---

## File Structure

```
packages/backend/
├── data/
│   ├── game-abc123.db    # SQLite database per game
│   ├── game-xyz789.db
│   └── backups/
├── src/
│   ├── state/
│   │   ├── database.ts   # GameDatabase class
│   │   └── schema.sql    # Database schema
│   ├── world/
│   └── api/
```

---

## Where Zustand Actually Goes (If Anywhere)

**Option 1: Remove entirely**
- Database handles ALL state
- API queries database directly
- No in-memory state store

**Option 2: Use for current game session only**
```typescript
// Zustand for current session (ephemeral)
interface SessionState {
  currentCycle: number;
  isPlaying: boolean;
  tickRate: number;
  selectedCreature: string | null;
}
```

**But historical data = database ONLY.**

---

## Summary

**Zustand is WRONG for this.**

**We need SQLite:**
- Persistent storage
- Time-series data
- Historical queries
- Replay functionality
- Analytical queries
- Export capabilities

**The database IS the state.**

**Not Zustand.**
