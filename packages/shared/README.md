# Shared Package

Database, schemas, and common utilities for the Ebb and Bloom simulation.

## Contents

- **Database**: Drizzle ORM + SQLite with 9 tables
- **Schemas**: Zod validation schemas derived from database
- **Types**: Complete type definitions for all game entities

## Usage

```typescript
import { db, planetsTable, creaturesTable } from '@ebb/shared';

// Database operations
const planets = await db.select().from(planetsTable);
```

## Tables

- `planets` - Planetary data and composition
- `creatures` - Creature entities and traits
- `packs` - Pack formations and territories  
- `tools` - Tool instances and properties
- `tribes` - Tribal organizations and governance
- `buildings` - Building structures and functions
- `abstract_systems` - Religious/political/cultural systems
- `game_state` - Overall simulation state
- `planetary_layers` - Geological layer data