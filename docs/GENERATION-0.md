# Generation 0 (Planetary Genesis)

## What is Gen 0?

Generation 0 is the AI-driven planetary generation system that creates unique worlds from seed phrases. Every planet is procedurally generated with:

- **8 Planetary Cores**: Unique geological formations with distinct materials
- **Shared Materials**: Elements found across multiple cores (Iron, Quartz, etc.)
- **Fill Material**: The "medium" creatures dig through (soil, water, cork, ash, sand)
- **Core-Specific Materials**: Unique materials only found in specific cores
- **Creature Archetypes**: Species adapted to each core environment

## Architecture

Gen 0 uses a **parent-child AI workflow**:

1. **Creative Director** (parent): Designs complete planetary system
2. **Core Specialists** (children): Run in parallel, one per core

### Files

```
src/dev/
├── CreativeDirectorWorkflow.ts    # Parent AI workflow
├── CoreSpecialistWorkflow.ts       # Child AI workflow (per core)
├── GenerationZeroOrchestrator.ts   # Parallel execution manager
└── test-gen0.ts                    # Standalone test script

src/systems/
└── PlanetaryPhysicsSystem.ts       # Runtime orchestrator (integrates with ECS)

src/core/
└── generation-zero-types.ts        # TypeScript type definitions

src/config/
└── meshy-models.ts                 # Meshy AI integration for 3D models
```

## Running Gen 0

### Standalone Test (Recommended First)

Test Gen 0 independently of the game:

```bash
# Requires OPENAI_API_KEY environment variable
export OPENAI_API_KEY=your_key_here

# Generate a planet
pnpm gen0:test my-seed-phrase

# Output saved to: manifests/gen0/my-seed-phrase.json
```

This will:
- Execute Creative Director workflow (design cores + materials)
- Execute 8 Core Specialist workflows in parallel (materials + creatures per core)
- Display complete planetary summary
- Validate output structure
- Save manifest to disk

**First run takes 30-60 seconds** (AI generation). Subsequent runs with same seed phrase load from cache (instant).

### In-Game Integration

The `PlanetaryPhysicsSystem` integrates Gen 0 into the game runtime:

```typescript
// In EcosystemFoundation.initialize()
await this.planetarySystem.initialize(seedPhrase);

// Access planetary data
const cores = this.planetarySystem.getPlanetaryCores();
const materials = this.planetarySystem.getSharedMaterials();
const fillMaterial = this.planetarySystem.getFillMaterial();
const creatures = this.planetarySystem.getAllCreatureArchetypes();
```

## How It Works

### 1. Creative Director (Parent Workflow)

Uses Vercel AI SDK `generateObject` with structured output:

```typescript
const result = await generateObject({
  model: openai('gpt-4'),
  schema: PlanetaryManifestSchema,  // Zod schema
  system: systemPrompt,
  prompt: userPrompt,
  temperature: 0.7,
});
```

Generates:
- 8 planetary cores (name, description, temperature, pressure, stability, color, Meshy prompt)
- 5-10 shared materials (name, category, depth, hardness, rarity, affinities)
- 1 fill material (type, density, permeability, oxygenation, water retention)
- Overall world theme

### 2. Core Specialists (Child Workflows)

Spawned in parallel (one per core):

```typescript
const coreManifestPromises = planetaryManifest.cores.map(core => {
  const specialist = new CoreSpecialistWorkflow(core, seedPhrase);
  return specialist.execute();
});

const coreManifests = await Promise.all(coreManifestPromises);
```

Each generates:
- 2-5 unique materials for that core (depth, density, cohesion, shape)
- 1-3 creature archetypes adapted to core environment (size, mobility, intelligence, aggression)

### 3. Deterministic Randomness

Uses `seedrandom` for deterministic generation:

```typescript
import seedrandom from 'seedrandom';

const rng = seedrandom(seedPhrase);
const random = rng(); // Same seed = same value every time
```

**Same seed phrase = same planet every time** (critical for replayability).

## Output Structure

```json
{
  "planetary": {
    "seedPhrase": "test-planet-alpha",
    "planetaryName": "Ferros Prime",
    "worldTheme": "Volcanic Hellscape",
    "fillMaterial": {
      "name": "Volcanic Ash",
      "type": "ash",
      "density": 8,
      "permeability": 3,
      "oxygenation": 2,
      "lightPenetration": 1,
      "waterRetention": 4,
      "description": "..."
    },
    "cores": [ /* 8 cores */ ],
    "sharedMaterials": [ /* 5-10 materials */ ]
  },
  "coreManifests": [
    {
      "coreName": "Ferrite Core",
      "materials": [ /* 2-5 materials */ ],
      "creatures": [ /* 1-3 creatures */ ]
    },
    // ... 7 more cores
  ]
}
```

## Why Gen 0 Matters

**Before Gen 0**:
- Materials hardcoded (Copper at 10m, Tin at 30m, Iron at 50m)
- No planetary physics
- All values static
- No replayability

**After Gen 0**:
- Materials derived from planetary cores (dynamic depths based on geology)
- Creatures adapted to environment (high heat → heat-resistant)
- Tools emerge based on material accessibility (not hardcoded levels)
- Every seed phrase = unique planet
- Replayability through seed phrases

## Next Steps

After Gen 0 works:

1. **Refactor RawMaterialsSystem**: Consume Gen 0 data instead of hardcoded values
2. **Expand Yuka**: Add goals, fuzzy logic, FSM to creatures/materials/tools
3. **Inter-Sphere Messaging**: Materials → Tools, Tools → Buildings communication
4. **Player Feedback**: Event log showing discoveries, conflicts, alliances
5. **Endings**: Track playstyle metrics, trigger one of 4 endings

See `docs/WORLD.md` for complete vision (2,005 lines).

## Dependencies

- `seedrandom`: Deterministic random number generation
- `zod`: Schema validation for AI output
- `ai` + `@ai-sdk/openai`: Vercel AI SDK for workflows
- `openai`: OpenAI API client

Install:
```bash
pnpm add seedrandom @types/seedrandom zod
```

## Troubleshooting

### "OPENAI_API_KEY not set"
Set environment variable:
```bash
export OPENAI_API_KEY=your_key_here
pnpm gen0:test
```

### "Generation 0 timed out"
Increase timeout in orchestrator or check OpenAI API status.

### "Manifest validation failed"
Check AI responses - may need to adjust prompts in Creative Director / Core Specialist workflows.

### "No cached manifest, generating..."
First run with a seed phrase takes 30-60 seconds. Subsequent runs load from cache instantly.

## Testing

```bash
# Run Gen 0 test
pnpm gen0:test my-seed-phrase

# Test different seed phrases
pnpm gen0:test volcanic-world
pnpm gen0:test crystal-paradise
pnpm gen0:test frozen-wasteland
```

Each seed generates a completely different planet!
