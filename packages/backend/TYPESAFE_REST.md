# TYPESAFE REST API (Backend → Frontend)

## The Pattern

**Backend:** Drizzle + Zod schemas
**Frontend:** Import those SAME Zod schemas
**Result:** Fully typesafe REST API

No code generation. No GraphQL. No tRPC. Just **shared Zod schemas**.

Reference: https://noahflk.com/blog/typesafe-rest-api

---

## How It Works

### 1. Backend Defines Schemas

```typescript
// packages/backend/src/api/schemas/world.ts
import { z } from 'zod';

export const tickRequestSchema = z.object({
  count: z.number().int().min(1).max(1000).default(1),
});

export const tickResponseSchema = z.object({
  cycle: z.number(),
  generation: z.number(),
  isDay: z.boolean(),
  events: z.array(z.object({
    type: z.string(),
    data: z.any(),
  })),
  state: z.any(), // Or full WorldState schema
});

export const getCycleParamsSchema = z.object({
  cycle: z.coerce.number(),
});

export const getCycleResponseSchema = z.object({
  cycle: z.number(),
  generation: z.number(),
  isDay: z.boolean(),
  creatures: z.array(z.object({
    id: z.string(),
    energy: z.number(),
    traits: z.object({
      excavation: z.number(),
      strength: z.number(),
      manipulation: z.number(),
      intelligence: z.number(),
      social: z.number(),
    }),
  })),
  materials: z.array(z.object({
    type: z.string(),
    remaining: z.number(),
    accessible: z.boolean(),
  })),
  // ... full state
});
```

### 2. Backend Uses Schemas for Validation

```typescript
// packages/backend/src/api/world/command.ts
import { tickRequestSchema, tickResponseSchema } from '../schemas/world.js';

export function registerWorldCommandRoutes(fastify: FastifyInstance) {
  fastify.post('/world/tick', async (request, reply) => {
    // Validate input
    const body = tickRequestSchema.parse(request.body);
    
    // Execute
    const result = await simulation.tick(body.count);
    
    // Validate output (ensures we match contract)
    const response = tickResponseSchema.parse({
      cycle: result.cycle,
      generation: result.generation,
      isDay: result.isDay,
      events: result.events,
      state: result.state,
    });
    
    return response;
  });
}
```

### 3. Export Schemas for Frontend

```typescript
// packages/backend/src/api/schemas/index.ts
export * from './world.js';
export * from './state.js';
export * from './analysis.js';

// Export types derived from schemas
export type TickRequest = z.infer<typeof tickRequestSchema>;
export type TickResponse = z.infer<typeof tickResponseSchema>;
export type GetCycleParams = z.infer<typeof getCycleParamsSchema>;
export type GetCycleResponse = z.infer<typeof getCycleResponseSchema>;
```

### 4. Frontend Imports Schemas

```typescript
// packages/cli/src/api/client.ts
import { 
  tickRequestSchema, 
  tickResponseSchema,
  type TickRequest,
  type TickResponse,
} from '@ebb/backend/api/schemas';

class GameClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  async tick(request: TickRequest): Promise<TickResponse> {
    // Request is typesafe
    const validatedRequest = tickRequestSchema.parse(request);
    
    const response = await fetch(`${this.baseUrl}/world/tick`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedRequest),
    });
    
    const data = await response.json();
    
    // Response is validated AND typesafe
    return tickResponseSchema.parse(data);
  }
  
  async getCycle(cycle: number): Promise<GetCycleResponse> {
    const response = await fetch(`${this.baseUrl}/state/cycle/${cycle}`);
    const data = await response.json();
    
    // Validate response
    return getCycleResponseSchema.parse(data);
  }
}

// Usage: Fully typesafe!
const client = new GameClient('http://localhost:3000');
const result = await client.tick({ count: 10 });

console.log(result.cycle);      // ✓ TypeScript knows this exists
console.log(result.generation); // ✓ TypeScript knows the type
console.log(result.foobar);     // ✗ TypeScript error!
```

---

## Package Structure for Sharing

### Option 1: Monorepo with Workspace References

```json
// packages/backend/package.json
{
  "name": "@ebb/backend",
  "exports": {
    ".": "./dist/index.js",
    "./api/schemas": "./dist/api/schemas/index.js"
  }
}

// packages/cli/package.json
{
  "name": "@ebb/cli",
  "dependencies": {
    "@ebb/backend": "workspace:*"
  }
}

// packages/frontend/package.json
{
  "name": "@ebb/frontend",
  "dependencies": {
    "@ebb/backend": "workspace:*"
  }
}
```

**Frontend/CLI can import:**
```typescript
import { tickRequestSchema } from '@ebb/backend/api/schemas';
```

### Option 2: Separate Shared Package

```
packages/
├── backend/
├── cli/
├── frontend/
└── shared/           # New package
    ├── src/
    │   └── schemas/
    │       ├── world.ts
    │       ├── state.ts
    │       └── index.ts
    └── package.json
```

```json
// packages/shared/package.json
{
  "name": "@ebb/shared",
  "main": "./dist/index.js",
  "dependencies": {
    "zod": "^3.22.0"
  }
}

// Backend, CLI, Frontend all depend on @ebb/shared
```

---

## Full Type Safety Example

### Backend API Route

```typescript
// packages/backend/src/api/world/command.ts
import { z } from 'zod';

export const advanceGenerationRequestSchema = z.object({
  skipCycles: z.boolean().default(false),
});

export const advanceGenerationResponseSchema = z.object({
  fromCycle: z.number(),
  toCycle: z.number(),
  fromGeneration: z.number(),
  toGeneration: z.number(),
  cyclesRun: z.number(),
  events: z.array(z.object({
    cycle: z.number(),
    type: z.string(),
    data: z.any(),
  })),
  finalState: z.object({
    cycle: z.number(),
    generation: z.number(),
    creatures: z.array(z.any()),
    materials: z.array(z.any()),
    tools: z.array(z.string()),
  }),
});

export type AdvanceGenerationRequest = z.infer<typeof advanceGenerationRequestSchema>;
export type AdvanceGenerationResponse = z.infer<typeof advanceGenerationResponseSchema>;

export function registerWorldCommandRoutes(fastify: FastifyInstance) {
  fastify.post('/world/advance-generation', async (request) => {
    const body = advanceGenerationRequestSchema.parse(request.body);
    
    const result = await simulation.advanceGeneration(body.skipCycles);
    
    return advanceGenerationResponseSchema.parse({
      fromCycle: result.fromCycle,
      toCycle: result.toCycle,
      fromGeneration: result.fromGeneration,
      toGeneration: result.toGeneration,
      cyclesRun: result.cyclesRun,
      events: result.events,
      finalState: result.finalState,
    });
  });
}
```

### CLI Client

```typescript
// packages/cli/src/api/client.ts
import {
  advanceGenerationRequestSchema,
  advanceGenerationResponseSchema,
  type AdvanceGenerationRequest,
  type AdvanceGenerationResponse,
} from '@ebb/backend/api/schemas';

export class GameClient {
  async advanceGeneration(
    request: AdvanceGenerationRequest
  ): Promise<AdvanceGenerationResponse> {
    const validated = advanceGenerationRequestSchema.parse(request);
    
    const response = await fetch(`${this.baseUrl}/world/advance-generation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validated),
    });
    
    const data = await response.json();
    return advanceGenerationResponseSchema.parse(data);
  }
}

// Usage
const client = new GameClient('http://localhost:3000');

const result = await client.advanceGeneration({
  skipCycles: true,
});

// TypeScript knows all properties
console.log(`Advanced from gen ${result.fromGeneration} to ${result.toGeneration}`);
console.log(`Ran ${result.cyclesRun} cycles`);
console.log(`Events: ${result.events.length}`);

// TypeScript prevents errors
console.log(result.invalidProperty); // ✗ Compile error
```

---

## React Frontend Example

```typescript
// packages/frontend/src/hooks/useGameState.ts
import { useQuery } from '@tanstack/react-query';
import { getCycleResponseSchema, type GetCycleResponse } from '@ebb/backend/api/schemas';

export function useGameState(cycle: number) {
  return useQuery({
    queryKey: ['cycle', cycle],
    queryFn: async (): Promise<GetCycleResponse> => {
      const response = await fetch(`http://localhost:3000/state/cycle/${cycle}`);
      const data = await response.json();
      
      // Validate response
      return getCycleResponseSchema.parse(data);
    },
  });
}

// Usage in component
function GameView({ cycle }: { cycle: number }) {
  const { data, isLoading } = useGameState(cycle);
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Cycle {data.cycle}, Generation {data.generation}</h1>
      <p>Creatures: {data.creatures.length}</p>
      <p>Materials accessible: {data.materials.filter(m => m.accessible).length}</p>
      
      {/* TypeScript knows all properties and types */}
      <CreatureList creatures={data.creatures} />
    </div>
  );
}
```

---

## Benefits

### 1. No Code Generation
- No build step for types
- No generated files to ignore
- Schemas ARE the source of truth

### 2. Runtime + Compile-Time Safety
```typescript
// Compile time: TypeScript checks types
const result: TickResponse = await client.tick({ count: 10 });

// Runtime: Zod validates actual data
tickResponseSchema.parse(apiResponse); // Throws if invalid
```

### 3. Single Source of Truth
```
Backend defines schema →
  Frontend imports schema →
    Same types everywhere
```

### 4. Automatic Documentation
```typescript
// Schema documents itself
export const tickRequestSchema = z.object({
  count: z.number()
    .int()
    .min(1, 'Must advance at least 1 cycle')
    .max(1000, 'Cannot advance more than 1000 cycles at once')
    .default(1)
    .describe('Number of cycles to advance'),
});

// TypeScript shows documentation in IDE
```

### 5. Refactoring Safety
```typescript
// Backend: Add new field
export const tickResponseSchema = z.object({
  cycle: z.number(),
  generation: z.number(),
  isDay: z.boolean(),
  newField: z.string(), // ← Added
});

// Frontend: TypeScript immediately shows error everywhere newField is missing
const result = await client.tick({ count: 1 });
console.log(result.newField); // ✓ Now required
```

---

## API Client Builder Pattern

```typescript
// packages/cli/src/api/client.ts
import * as schemas from '@ebb/backend/api/schemas';

type APIRoute = {
  method: 'GET' | 'POST';
  path: string;
  requestSchema?: z.ZodSchema;
  responseSchema: z.ZodSchema;
};

const routes = {
  tick: {
    method: 'POST',
    path: '/world/tick',
    requestSchema: schemas.tickRequestSchema,
    responseSchema: schemas.tickResponseSchema,
  },
  getCycle: {
    method: 'GET',
    path: '/state/cycle/:cycle',
    responseSchema: schemas.getCycleResponseSchema,
  },
  // ... all routes
} as const;

class TypesafeClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  private async request<T>(
    route: APIRoute,
    params?: Record<string, any>,
    body?: any
  ): Promise<T> {
    let url = this.baseUrl + route.path;
    
    // Replace path params
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url = url.replace(`:${key}`, String(value));
      }
    }
    
    // Validate request body
    if (route.requestSchema && body) {
      route.requestSchema.parse(body);
    }
    
    const response = await fetch(url, {
      method: route.method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate response
    return route.responseSchema.parse(data) as T;
  }
  
  // Type-safe methods
  async tick(request: z.infer<typeof schemas.tickRequestSchema>) {
    return this.request<z.infer<typeof schemas.tickResponseSchema>>(
      routes.tick,
      undefined,
      request
    );
  }
  
  async getCycle(cycle: number) {
    return this.request<z.infer<typeof schemas.getCycleResponseSchema>>(
      routes.getCycle,
      { cycle }
    );
  }
}
```

---

## Error Handling

```typescript
try {
  const result = await client.tick({ count: 10 });
} catch (error) {
  if (error instanceof z.ZodError) {
    // Response didn't match schema
    console.error('Invalid response from API:', error.errors);
  } else {
    // Network or other error
    console.error('API request failed:', error);
  }
}
```

---

## Summary

**Pattern:**
1. Backend defines Zod schemas
2. Backend validates requests/responses
3. Frontend imports SAME schemas
4. Frontend validates + gets TypeScript types
5. Shared schemas = single source of truth

**Benefits:**
- ✓ End-to-end type safety
- ✓ Runtime validation
- ✓ No code generation
- ✓ Refactoring safety
- ✓ Self-documenting
- ✓ Works with any frontend (CLI, React, Vue, etc.)

**Stack:**
```
Backend: Drizzle + Zod
Frontend: Zod (same schemas)
Connection: Plain HTTP REST
Result: Typesafe like tRPC, simple like REST
```

**This is the way.**
