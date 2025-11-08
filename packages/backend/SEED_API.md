# Seed API Documentation

## Overview

Deterministic seed management system for Ebb & Bloom. Seeds are three-word hyphen-delimited strings (e.g., `v1-red-blue-green`) that ensure reproducible world generation.

## Seed Format

**Format**: `v{version}-{word1}-{word2}-{word3}`

**Example**: `v1-red-blue-green`

**Version**: Currently `v1` (allows future seed format changes without breaking existing seeds)

## API Endpoints

### Generate Seed

**POST** `/api/seed/generate`

Generate a new deterministic seed.

**Response**:
```json
{
  "seed": "v1-red-blue-green",
  "version": "v1",
  "components": {
    "macro": 0.123456789,
    "meso": 0.987654321,
    "micro": 0.555555555
  },
  "message": "Seed generated. Use x-seed header or seed cookie for subsequent requests.",
  "usage": {
    "header": "x-seed: v1-red-blue-green",
    "cookie": "Cookie: seed=v1-red-blue-green",
    "query": "?seed=v1-red-blue-green",
    "body": "{ \"seed\": \"v1-red-blue-green\" }"
  }
}
```

**Cookie**: Automatically sets `seed` cookie for session persistence.

---

### Validate Seed

**GET** `/api/seed/validate?seed=v1-red-blue-green`

Validate seed format.

**Response** (valid):
```json
{
  "valid": true,
  "seed": "v1-red-blue-green",
  "version": "v1",
  "components": {
    "macro": 0.123456789,
    "meso": 0.987654321,
    "micro": 0.555555555
  }
}
```

**Response** (invalid):
```json
{
  "valid": false,
  "error": "Invalid seed format. Expected: v1-word-word-word (e.g., \"v1-red-blue-green\")",
  "seed": "invalid-seed"
}
```

---

### Get Seed Info

**GET** `/api/seed/info?seed=v1-red-blue-green`

Get detailed seed information including generation-specific seeds.

**Response**:
```json
{
  "seed": "v1-red-blue-green",
  "version": "v1",
  "components": {
    "macro": 0.123456789,
    "meso": 0.987654321,
    "micro": 0.555555555
  },
  "generationSeeds": {
    "gen0": "v1-red-blue-green-gen0",
    "gen1": "v1-red-blue-green-gen1",
    "gen2": "v1-red-blue-green-gen2",
    "gen3": "v1-red-blue-green-gen3",
    "gen4": "v1-red-blue-green-gen4",
    "gen5": "v1-red-blue-green-gen5",
    "gen6": "v1-red-blue-green-gen6"
  }
}
```

---

## Seed Usage in API Requests

Seeds can be provided via multiple methods (priority order):

### 1. Header (Recommended for API clients)

```bash
curl -H "x-seed: v1-red-blue-green" \
  http://localhost:3000/api/game/create
```

### 2. Cookie (Automatic session persistence)

```bash
# Cookie is automatically set when generating seed
curl -b "seed=v1-red-blue-green" \
  http://localhost:3000/api/game/create
```

### 3. Query Parameter

```bash
curl "http://localhost:3000/api/game/create?seed=v1-red-blue-green"
```

### 4. Request Body

```bash
curl -X POST http://localhost:3000/api/game/create \
  -H "Content-Type: application/json" \
  -d '{"seed": "v1-red-blue-green"}'
```

---

## Seed Chaining Through Generations

The same base seed is chained through all generations:

- **Gen0**: `{seed}-gen0`
- **Gen1**: `{seed}-gen1`
- **Gen2**: `{seed}-gen2`
- **Gen3**: `{seed}-gen3`
- **Gen4**: `{seed}-gen4`
- **Gen5**: `{seed}-gen5`
- **Gen6**: `{seed}-gen6`

This ensures:
- Same seed → same world (deterministic)
- Each generation gets a unique but deterministic variant
- WARP flow is maintained (Gen0 influences Gen1, etc.)

---

## Example Workflow

```bash
# 1. Generate seed
curl -X POST http://localhost:3000/api/seed/generate
# Response: { "seed": "v1-red-blue-green", ... }

# 2. Create game with seed (cookie automatically set)
curl -X POST http://localhost:3000/api/game/create \
  -H "x-seed: v1-red-blue-green"
# Response: { "gameId": "game-123", "seed": "v1-red-blue-green", ... }

# 3. Subsequent requests use cookie automatically
curl http://localhost:3000/api/game/game-123
# Seed from cookie is automatically used

# 4. Or explicitly provide seed
curl http://localhost:3000/api/game/game-123 \
  -H "x-seed: v1-red-blue-green"
```

---

## Seed Components

Each seed produces three deterministic components:

- **macro**: Used for macro-scale selections (stellar context, ecological niches, etc.)
- **meso**: Used for meso-scale selections (accretion dynamics, population dynamics, etc.)
- **micro**: Used for micro-scale selections (element distributions, individual physiology, etc.)

These components are extracted using `seedrandom` for deterministic randomness.

---

## Versioning

Seed format is versioned (`v1`, `v2`, etc.) to allow future changes:

- **v1**: Three-word hyphen-delimited (`v1-word-word-word`)
- **Future versions**: May add timestamps, checksums, or other metadata

Invalid or unsupported versions return validation errors.

---

## Implementation

- **Seed Manager**: `packages/backend/src/seed/seed-manager.ts`
- **Seed Middleware**: `packages/backend/src/seed/seed-middleware.ts`
- **Seed Routes**: `packages/backend/src/seed/seed-routes.ts`

All seed operations are deterministic and reproducible.

