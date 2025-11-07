# DRIZZLE ORM + SQLITE + DRIZZLE-ZOD

## The Stack

```
Drizzle ORM:    Type-safe SQL queries
SQLite:         Database engine
drizzle-zod:    Zod schemas from Drizzle schemas
```

**Benefits:**
- Type safety everywhere
- Schema as code
- Automatic migrations
- Zod validation integrated
- No raw SQL strings

---

## Installation

```bash
cd packages/backend
pnpm add drizzle-orm better-sqlite3
pnpm add -D drizzle-kit @types/better-sqlite3
pnpm add drizzle-zod zod
```

---

## Schema Definition

```typescript
// src/state/schema.ts
import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Cycles table
export const cycles = sqliteTable('cycles', {
  cycle: integer('cycle').primaryKey(),
  generation: integer('generation').notNull(),
  isDay: integer('is_day', { mode: 'boolean' }).notNull(),
  timestamp: text('timestamp').notNull(),
  
  // Aggregated stats
  creatureCount: integer('creature_count'),
  avgEnergy: real('avg_energy'),
  avgExcavation: real('avg_excavation'),
  avgStrength: real('avg_strength'),
  avgManipulation: real('avg_manipulation'),
  
  // Material stats
  accessibleMaterials: integer('accessible_materials'),
  depletedMaterials: integer('depleted_materials'),
  totalConsumed: real('total_consumed'),
  
  // Emergence counts
  toolsCount: integer('tools_count'),
  buildingsCount: integer('buildings_count'),
  packsCount: integer('packs_count'),
  tribesCount: integer('tribes_count'),
  
  // Pressure
  depthPressure: real('depth_pressure'),
  scarcityPressure: real('scarcity_pressure'),
  
  // Full state (JSON)
  stateJson: text('state_json', { mode: 'json' }).$type<WorldState>(),
});

// Zod schemas (auto-generated from Drizzle schema)
export const insertCycleSchema = createInsertSchema(cycles);
export const selectCycleSchema = createSelectSchema(cycles);

// Events table
export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cycle: integer('cycle').notNull().references(() => cycles.cycle),
  generation: integer('generation').notNull(),
  type: text('type').notNull(),
  data: text('data', { mode: 'json' }).$type<Record<string, any>>(),
});

export const insertEventSchema = createInsertSchema(events);
export const selectEventSchema = createSelectSchema(events);

// Creatures table
export const creatures = sqliteTable('creatures', {
  id: text('id').primaryKey(),
  cycleCreated: integer('cycle_created').notNull().references(() => cycles.cycle),
  cycleDied: integer('cycle_died').references(() => cycles.cycle),
  parentId: text('parent_id'),
  
  // Traits
  excavation: real('excavation').notNull(),
  strength: real('strength').notNull(),
  manipulation: real('manipulation').notNull(),
  intelligence: real('intelligence').notNull(),
  social: real('social').notNull(),
});

export const insertCreatureSchema = createInsertSchema(creatures);
export const selectCreatureSchema = createSelectSchema(creatures);

// Materials table
export const materials = sqliteTable('materials', {
  type: text('type').primaryKey(),
  initialAmount: real('initial_amount').notNull(),
  hardness: real('hardness').notNull(),
  depth: real('depth').notNull(),
  category: text('category').notNull(),
  color: text('color').notNull(),
});

export const insertMaterialSchema = createInsertSchema(materials);
export const selectMaterialSchema = createSelectSchema(materials);

// Material state per cycle
export const materialState = sqliteTable('material_state', {
  cycle: integer('cycle').notNull().references(() => cycles.cycle),
  materialType: text('material_type').notNull().references(() => materials.type),
  remaining: real('remaining').notNull(),
  accessible: integer('accessible', { mode: 'boolean' }).notNull(),
}, (table) => ({
  pk: { columns: [table.cycle, table.materialType] },
}));

export const insertMaterialStateSchema = createInsertSchema(materialState);
export const selectMaterialStateSchema = createSelectSchema(materialState);

// Type exports
export type Cycle = typeof cycles.$inferSelect;
export type InsertCycle = typeof cycles.$inferInsert;
export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
export type Creature = typeof creatures.$inferSelect;
export type InsertCreature = typeof creatures.$inferInsert;
```

---

## Database Client

```typescript
// src/state/database.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { eq, and, between, sql } from 'drizzle-orm';
import * as schema from './schema.js';

export class GameDatabase {
  public db: ReturnType<typeof drizzle>;
  private sqlite: Database.Database;
  
  constructor(filepath: string) {
    this.sqlite = new Database(filepath);
    this.db = drizzle(this.sqlite, { schema });
  }
  
  /**
   * Save cycle state
   */
  public async saveCycle(state: WorldState) {
    const cycleData = schema.insertCycleSchema.parse({
      cycle: state.cycle,
      generation: state.generation,
      isDay: state.isDay,
      timestamp: new Date().toISOString(),
      creatureCount: state.creatures.length,
      avgEnergy: avgEnergy(state.creatures),
      avgExcavation: avgTrait(state.creatures, 'excavation'),
      avgStrength: avgTrait(state.creatures, 'strength'),
      avgManipulation: avgTrait(state.creatures, 'manipulation'),
      accessibleMaterials: countAccessible(state.materials),
      depletedMaterials: countDepleted(state.materials),
      totalConsumed: totalConsumed(state.materials),
      toolsCount: state.tools.length,
      buildingsCount: state.buildings.length,
      packsCount: state.packs.length,
      tribesCount: state.tribes.length,
      depthPressure: state.pressure.depth,
      scarcityPressure: state.pressure.scarcity,
      stateJson: state,
    });
    
    await this.db.insert(schema.cycles).values(cycleData);
  }
  
  /**
   * Get cycle state
   */
  public async getCycle(cycle: number): Promise<WorldState | null> {
    const result = await this.db
      .select()
      .from(schema.cycles)
      .where(eq(schema.cycles.cycle, cycle))
      .limit(1);
    
    return result[0]?.stateJson ?? null;
  }
  
  /**
   * Get cycle range
   */
  public async getCycleRange(from: number, to: number): Promise<WorldState[]> {
    const results = await this.db
      .select()
      .from(schema.cycles)
      .where(between(schema.cycles.cycle, from, to))
      .orderBy(schema.cycles.cycle);
    
    return results.map(r => r.stateJson).filter(Boolean) as WorldState[];
  }
  
  /**
   * Save event
   */
  public async saveEvent(cycle: number, generation: number, type: string, data: any) {
    const eventData = schema.insertEventSchema.parse({
      cycle,
      generation,
      type,
      data,
    });
    
    await this.db.insert(schema.events).values(eventData);
  }
  
  /**
   * Get events with filter
   */
  public async getEvents(filter?: {
    type?: string;
    fromCycle?: number;
    toCycle?: number;
  }) {
    let query = this.db.select().from(schema.events);
    
    const conditions = [];
    if (filter?.type) {
      conditions.push(eq(schema.events.type, filter.type));
    }
    if (filter?.fromCycle) {
      conditions.push(sql`${schema.events.cycle} >= ${filter.fromCycle}`);
    }
    if (filter?.toCycle) {
      conditions.push(sql`${schema.events.cycle} <= ${filter.toCycle}`);
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(schema.events.cycle);
  }
  
  /**
   * Save creature
   */
  public async saveCreature(creature: InsertCreature) {
    const data = schema.insertCreatureSchema.parse(creature);
    await this.db.insert(schema.creatures).values(data);
  }
  
  /**
   * Analysis: Material depletion over time
   */
  public async getMaterialDepletionTimeline(materialType: string) {
    return await this.db
      .select({
        cycle: schema.materialState.cycle,
        remaining: schema.materialState.remaining,
      })
      .from(schema.materialState)
      .where(eq(schema.materialState.materialType, materialType))
      .orderBy(schema.materialState.cycle);
  }
  
  /**
   * Analysis: Creature evolution rate
   */
  public async getEvolutionTimeline() {
    return await this.db
      .select({
        generation: schema.cycles.generation,
        avgExcavation: sql<number>`AVG(${schema.cycles.avgExcavation})`,
        avgStrength: sql<number>`AVG(${schema.cycles.avgStrength})`,
      })
      .from(schema.cycles)
      .groupBy(schema.cycles.generation);
  }
  
  /**
   * Close database
   */
  public close() {
    this.sqlite.close();
  }
}
```

---

## Migrations

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/state/schema.ts',
  out: './drizzle/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './data/game.db',
  },
} satisfies Config;
```

```bash
# Generate migration
pnpm drizzle-kit generate:sqlite

# Run migration
pnpm drizzle-kit push:sqlite
```

---

## Usage in Simulation

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
  
  public async tick(): Promise<CycleResult> {
    // Compute next state
    this.state = computeCycle(this.cycle, this.state);
    this.cycle++;
    
    // Save to database (type-safe!)
    await this.db.saveCycle(this.state);
    
    // Save events (type-safe!)
    for (const event of this.state.events) {
      await this.db.saveEvent(
        this.cycle,
        this.state.generation,
        event.type,
        event.data
      );
    }
    
    return {
      cycle: this.cycle,
      state: this.state,
    };
  }
  
  public async replay(targetCycle: number): Promise<WorldState> {
    const state = await this.db.getCycle(targetCycle);
    if (!state) {
      throw new Error(`Cycle ${targetCycle} not found`);
    }
    
    this.state = state;
    this.cycle = targetCycle;
    return state;
  }
}
```

---

## REST API

```typescript
// src/api/state/query.ts
import { GameDatabase } from '../../state/database.js';
import { z } from 'zod';

const getCycleParamsSchema = z.object({
  cycle: z.coerce.number(),
});

const getCycleRangeQuerySchema = z.object({
  from: z.coerce.number(),
  to: z.coerce.number(),
});

const getEventsQuerySchema = z.object({
  type: z.string().optional(),
  from: z.coerce.number().optional(),
  to: z.coerce.number().optional(),
});

export function registerStateQueryRoutes(fastify: FastifyInstance) {
  const db = new GameDatabase('./data/game.db');
  
  // Get single cycle
  fastify.get('/state/cycle/:cycle', async (request, reply) => {
    const { cycle } = getCycleParamsSchema.parse(request.params);
    const state = await db.getCycle(cycle);
    
    if (!state) {
      return reply.code(404).send({ error: 'Cycle not found' });
    }
    
    return state;
  });
  
  // Get cycle range
  fastify.get('/state/cycles', async (request) => {
    const { from, to } = getCycleRangeQuerySchema.parse(request.query);
    return await db.getCycleRange(from, to);
  });
  
  // Get events
  fastify.get('/state/events', async (request) => {
    const filter = getEventsQuerySchema.parse(request.query);
    return await db.getEvents({
      type: filter.type,
      fromCycle: filter.from,
      toCycle: filter.to,
    });
  });
  
  // Analysis: Material depletion
  fastify.get('/state/analysis/material-depletion/:type', async (request) => {
    const { type } = request.params as { type: string };
    return await db.getMaterialDepletionTimeline(type);
  });
  
  // Analysis: Evolution timeline
  fastify.get('/state/analysis/evolution', async () => {
    return await db.getEvolutionTimeline();
  });
}
```

---

## Zod Validation Throughout

```typescript
// Input validation
const createGameSchema = z.object({
  seedPhrase: z.string().min(1),
  planetRotation: z.number().min(1).max(10000),
});

fastify.post('/game/create', async (request, reply) => {
  // Validate input
  const body = createGameSchema.parse(request.body);
  
  // Create game
  const gameId = generateId();
  const db = new GameDatabase(`./data/${gameId}.db`);
  
  // Initialize with validated data
  const initialState = initializeGame(body.seedPhrase, body.planetRotation);
  
  // Save initial state (Drizzle validates against schema)
  await db.saveCycle(initialState);
  
  return { gameId, state: initialState };
});
```

**Validation at every layer:**
1. API input → Zod schema
2. Database insert → Drizzle-Zod schema
3. Database select → Drizzle-Zod schema
4. API output → Zod schema (if needed)

---

## Type Safety Example

```typescript
// This is type-safe throughout
const cycle = await db.getCycle(100);

if (cycle) {
  // TypeScript knows the shape of cycle
  console.log(cycle.creatures.length);        // ✓ Type-safe
  console.log(cycle.materials[0].remaining);  // ✓ Type-safe
  console.log(cycle.pressure.depth);          // ✓ Type-safe
  
  // TypeScript catches errors
  console.log(cycle.nonexistent);             // ✗ Compile error
}

// Inserting data is type-safe
await db.saveCycle({
  cycle: 1,
  generation: 0,
  isDay: true,
  timestamp: new Date().toISOString(),
  // TypeScript enforces all required fields
  // TypeScript validates types
});
```

---

## File Structure

```
packages/backend/
├── data/
│   └── *.db              # SQLite database files
├── drizzle/
│   └── migrations/       # Auto-generated migrations
├── src/
│   ├── state/
│   │   ├── schema.ts     # Drizzle schema + Zod
│   │   └── database.ts   # GameDatabase class
│   ├── world/
│   └── api/
├── drizzle.config.ts     # Drizzle config
└── package.json
```

---

## Package.json Scripts

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate:sqlite",
    "db:push": "drizzle-kit push:sqlite",
    "db:studio": "drizzle-kit studio"
  }
}
```

**Drizzle Studio:** Visual database explorer at `http://localhost:4983`

---

## Benefits Summary

**Drizzle ORM:**
- ✓ Type-safe queries
- ✓ Schema as code
- ✓ Automatic migrations
- ✓ SQL generation
- ✓ No string-based queries

**drizzle-zod:**
- ✓ Zod schemas auto-generated from Drizzle schema
- ✓ Runtime validation
- ✓ Input/output validation
- ✓ Single source of truth

**SQLite:**
- ✓ No separate server
- ✓ Single file per game
- ✓ Fast queries
- ✓ Portable

**Stack = Perfect for this use case.**

---

## Summary

```bash
pnpm add drizzle-orm better-sqlite3 drizzle-zod zod
pnpm add -D drizzle-kit @types/better-sqlite3
```

```
Schema (Drizzle) → Zod schemas → Validation
         ↓
   Migrations → SQLite database
         ↓
   Type-safe queries → API
```

**Type safety from database to API.**

**No Zustand. All database.**

**This is the way.**
