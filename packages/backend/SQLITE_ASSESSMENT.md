# SQLite Database Assessment

## Current State

### ✅ What EXISTS:
1. **Database Schema** (`packages/shared/src/db/schema.ts`):
   - Drizzle ORM schema with 9 tables (planets, creatures, packs, tools, tribes, buildings, abstract_systems, game_state, planetary_layers)
   - Zod schemas auto-generated from Drizzle
   - Type-safe database operations

2. **Database Connection** (`packages/shared/src/db/connection.ts`):
   - Creates SQLite database (`./shared.db`)
   - Sets up Drizzle ORM instance
   - Exports `db` and `sqlite` instances

3. **Documentation**:
   - `DATABASE_NOT_ZUSTAND.md` - Explains why SQLite over Zustand
   - `DRIZZLE_STACK.md` - Technical implementation details

### ❌ What's MISSING:
1. **NO ACTUAL USAGE**: 
   - No imports of `@ebb/shared/db` in backend code
   - No database saves after simulation cycles
   - No database queries for historical data
   - No integration with Gen0-Gen6 systems

2. **NO CYCLE TRACKING**:
   - Docs say "9000 cycles" but no cycle table exists
   - No time-series data storage
   - No replay functionality

3. **NO API INTEGRATION**:
   - No REST endpoints querying database
   - No state persistence between runs
   - Everything is in-memory only

## The Question: Do We Need SQLite?

### Arguments FOR SQLite:
1. **Time-series data**: Docs mention storing every cycle for replay/analysis
2. **Historical queries**: "What was state at cycle 1234?"
3. **Analytics**: Material depletion over time, tool emergence timeline
4. **Persistence**: Game state survives server restarts

### Arguments AGAINST SQLite:
1. **NOT CURRENTLY USED**: Zero integration, just sitting there
2. **Simulation is deterministic**: Can regenerate any cycle from seed
3. **No frontend yet**: Can't query historical data anyway
4. **Complexity**: Adds database layer for something that might not be needed

## Recommendation: **REMOVE SQLite (For Now)**

### Why:
1. **Simulation is seed-based**: Every cycle can be regenerated deterministically
2. **No persistence requirement yet**: No frontend, no user saves
3. **YAGNI**: We're not using it, and won't need it until we have:
   - Frontend that needs historical data
   - User saves/loads
   - Analytics dashboard
   - Replay functionality

### What to Keep:
- **Zustand for in-memory state**: Perfect for current simulation needs
- **Database schema as reference**: Keep docs, remove actual database code

### When to Re-add:
- When we have a frontend that needs historical queries
- When we need user saves/loads
- When we need analytics/replay functionality
- When we have actual persistence requirements

## Action Items:
1. ✅ Remove SQLite dependencies from `packages/shared`
2. ✅ Remove database connection code
3. ✅ Keep schema as reference documentation
4. ✅ Use Zustand for in-memory state management
5. ✅ Re-add SQLite when we actually need persistence

## Current Reality:
**The database is a ghost feature** - fully designed, never integrated, adds complexity without value.

**Better approach**: Use Zustand for now, add SQLite when we have real persistence needs.

