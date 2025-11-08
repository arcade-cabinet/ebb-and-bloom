# FINAL DIRECTORY STRUCTURE - COMPLETE PLAN

**Date**: 2025-11-07  
**Status**: COMPLETE reorganization structure documented

## COMPLETE FINAL STRUCTURE

```
ebb-and-bloom/                          # PROJECT ROOT
├── package.json                        # Monorepo workspace root
├── pnpm-workspace.yaml                 # Workspace configuration
├── README.md                          # Updated backend-first architecture
│
├── packages/                          # MONOREPO PACKAGES
│   ├── shared/                        # DATABASE & COMMON RESOURCES
│   │   ├── package.json               # Drizzle ORM + SQLite dependencies
│   │   ├── drizzle.config.ts          # Database configuration
│   │   ├── shared.db                  # SQLite database file
│   │   ├── migrations/                # Database migrations
│   │   │   └── 0000_regular_captain_midlands.sql
│   │   └── src/
│   │       ├── index.ts               # Package exports
│   │       ├── db/
│   │       │   ├── index.ts           # Database exports
│   │       │   ├── schema.ts          # 9 Drizzle tables (planets, creatures, packs, tools, tribes, buildings, abstract_systems, game_state, planetary_layers)
│   │       │   └── connection.ts      # SQLite connection setup
│   │       └── schemas/
│   │           ├── index.ts           # Schema exports
│   │           └── data-pool-schemas.ts # Zod schemas for AI data
│   │
│   ├── gen/                           # AI GENERATION & ASSET MANAGEMENT
│   │   ├── package.json               # AI dependencies (Vercel AI, OpenAI, commander)
│   │   ├── src/
│   │   │   ├── index.ts               # Package exports
│   │   │   ├── cli.ts                 # Working CLI (archetypes, textures, status, validate)
│   │   │   ├── downloaders/
│   │   │   │   └── ambientcg.ts       # AmbientCG texture downloader (idempotent)
│   │   │   ├── textures/
│   │   │   │   ├── index.ts           # Texture utilities exports
│   │   │   │   ├── texture-manifest.ts # Original texture manifest manager
│   │   │   │   ├── real-manifest-generator.ts # Zod-validated manifest generator
│   │   │   │   └── textures/          # Downloaded textures (3.2GB, 135 files)
│   │   │   │       ├── manifest.json  # Generated texture catalog
│   │   │   │       ├── bricks/        # 20+ brick textures
│   │   │   │       ├── concrete/      # 15+ concrete textures  
│   │   │   │       ├── fabric/        # 25+ fabric textures
│   │   │   │       ├── grass/         # 8+ grass textures
│   │   │   │       ├── leather/       # 20+ leather textures
│   │   │   │       ├── metal/         # 25+ metal textures
│   │   │   │       ├── rock/          # 20+ rock textures
│   │   │   │       └── wood/          # 15+ wood textures
│   │   │   ├── schemas/
│   │   │   │   ├── weft-schema.ts     # WARP+WEFT formal Zod schemas
│   │   │   │   └── texture-manifest-schema.ts # Texture manifest validation
│   │   │   ├── tools/
│   │   │   │   └── texture-tool.ts    # Structured texture tool for AI agents
│   │   │   ├── workflows/
│   │   │   │   ├── index.ts           # Workflow exports
│   │   │   │   ├── ai-interface.ts    # AI workflow context interface
│   │   │   │   ├── agent-chain.ts     # Agent-to-agent handoff system
│   │   │   │   ├── all-generations.ts # Single workflow for all generations
│   │   │   │   ├── bash-ai-generator.ts # Bash tool AI generation
│   │   │   │   ├── manifest-loader.ts # JSON manifest-driven workflows
│   │   │   │   ├── real-archetype-generator.ts # Real AI archetype generation
│   │   │   │   ├── structured-warp-weft.ts # Structured WARP+WEFT execution
│   │   │   │   └── legacy/            # Archived workflows
│   │   │   │       ├── EvolutionaryAgentWorkflows.ts
│   │   │   │       ├── MasterEvolutionPipeline.ts
│   │   │   │       ├── ProductionAssetGenerator.ts
│   │   │   │       ├── CompleteDataPoolGenerator.ts
│   │   │   │       └── DataPoolGenerator.ts
│   │   │   └── meshy/                 # 3D model generation (from archive)
│   │   │       ├── index.ts
│   │   │       ├── base-client.ts
│   │   │       ├── text_to_3d.ts
│   │   │       ├── retexture.ts
│   │   │       ├── rigging.ts
│   │   │       └── animations.ts
│   │   └── data/
│   │       └── manifests/             # JSON configuration files
│   │           ├── archetype-generation.json # Complete Gen 0-6 breakdown (181 lines)
│   │           ├── assets.json        # Asset generation config
│   │           ├── generations.json   # WARP/WEFT config (8KB)
│   │           └── textures.json      # Texture manifest (38KB)
│   │
│   ├── backend/                       # SIMULATION LOGIC
│   │   ├── package.json               # Simulation dependencies (Yuka, FastifyAPI)
│   │   ├── src/
│   │   │   ├── server.ts              # REST API server
│   │   │   ├── gen0/                  # Planetary formation systems
│   │   │   │   └── AccretionSimulation.ts
│   │   │   ├── gen1/                  # Creature systems
│   │   │   │   └── CreatureSystem.ts
│   │   │   ├── gen2/                  # Pack systems
│   │   │   │   └── PackSystem.ts
│   │   │   ├── gen3/                  # Tool systems
│   │   │   │   └── ToolSystem.ts
│   │   │   ├── gen4/                  # Tribe systems
│   │   │   │   └── TribeSystem.ts
│   │   │   ├── gen5/                  # Building systems
│   │   │   │   └── BuildingSystem.ts
│   │   │   └── gen6/                  # Abstract social systems
│   │   │       └── ReligionDemocracySystem.ts
│   │   └── test/                      # Backend tests
│   │       ├── gen0-accretion.test.ts
│   │       ├── gen1-creatures.test.ts
│   │       ├── gen2-packs.test.ts
│   │       ├── GameEngine.test.ts
│   │       ├── observe-100-generations.test.ts
│   │       └── planetary-algorithms.test.ts
│   │
│   └── ai-generators/                 # LEGACY (to be removed)
│       └── [empty - content moved to gen/]
│
├── docs/                              # ARCHITECTURE DOCUMENTATION
│   ├── WORLD.md                       # Original game design (2,004 lines)
│   └── architecture/                  # Frozen architecture docs
│       ├── README.md                  # Architecture overview
│       ├── api.md                     # REST API package design
│       ├── simulation.md              # Mathematical simulation architecture
│       ├── generations.md             # Gen 0-6 specifications with macro/meso/micro
│       └── game.md                    # Player agency and victory conditions
│
├── memory-bank/                       # PROGRESS TRACKING & ARCHIVE
│   ├── last-agent-chat.md             # This session record
│   ├── activeContext.md               # Current development context
│   ├── progress.md                    # Historical progress tracking
│   ├── BEAST_MODE_COMPLETE.md         # Previous generation implementation
│   ├── INTEGRATION_FIX_REPORT.md      # AI data pool integration fixes
│   ├── REORGANIZATION_COMPLETE.md     # Reorganization documentation
│   ├── ARCHITECTURE_FREEZE_COMPLETE.md # Architecture freeze record
│   ├── FINAL_ARCHITECTURE_COMPLETE.md # Foundation completion
│   ├── COMPLETE_REORGANIZATION_SUMMARY.md # Complete reorganization summary
│   ├── COMPLETE_SESSION_RECORD.md     # Everything done this session
│   └── archived-code/                 # COMPLETE LEGACY CODE ARCHIVE
│       ├── ARCHIVE_INDEX.md           # Archive overview and rationale
│       ├── ARCHIVAL_MANIFEST.md       # Detailed file inventory
│       ├── legacy-frontend/           # Complete React Three Fiber frontend
│       │   ├── components/            # 12 React Three Fiber renderers
│       │   ├── systems/              # 17 ECS systems
│       │   ├── stores/               # EvolutionDataStore Zustand state
│       │   ├── hooks/                # usePlatformEvents, useResponsiveScene
│       │   ├── contexts/             # WorldContext React context
│       │   ├── world/                # ECS world definitions, CombatComponents
│       │   ├── utils/                # Logger, FreesoundClient utilities
│       │   ├── test/                 # 9 test files with coverage
│       │   ├── styles/               # CSS and styling
│       │   ├── audio/                # evoMorph.ts audio system
│       │   ├── config/               # ai-models.ts configuration
│       │   ├── App.tsx               # Main React application
│       │   └── main.tsx              # Application entry point
│       ├── dev-tools/                # Development toolchain
│       │   ├── dev/                  # AI workflows, asset generation
│       │   │   ├── meshy/            # 3D model generation integration
│       │   │   ├── EvolutionaryAgentWorkflows.ts
│       │   │   ├── MasterEvolutionPipeline.ts
│       │   │   ├── ProductionAssetGenerator.ts
│       │   │   ├── GameDevCLI.ts
│       │   │   ├── asset-manifest.ts
│       │   │   └── audio-manifest.ts
│       │   └── build-scripts/
│       │       └── ambientcg-downloader.ts (original version)
│       ├── build-config/             # Build configurations
│       │   ├── vite.config.js        # Vite build config
│       │   ├── capacitor.config.ts   # Mobile app config
│       │   ├── playwright.config.ts  # Testing config
│       │   └── tsconfig.json         # TypeScript config
│       └── documentation/
│           └── original-README.md    # Original project documentation
│
├── public/                            # STATIC ASSETS
│   ├── models/                        # 3D models (if any)
│   └── audio/                         # Audio assets (if any)
│
├── android/                           # MOBILE BUILD
│   └── [Capacitor Android build files]
│
├── scripts/                           # UTILITY SCRIPTS
│   ├── extract-grok-chat.js           # Utility for memory bank extraction
│   └── verify-yuka-evolution.ts       # Yuka verification script
│
├── logs/                              # LOG FILES
├── manifests/                         # GAME MANIFESTS (legacy)
├── justfile                           # Just command runner
├── process-compose.yml                # Process orchestration
├── renovate.json                      # Dependency management
├── mise.toml                          # Environment setup
├── LICENSE                            # MIT license
└── .github/                           # GITHUB CONFIGURATION
    └── [workflows, issue templates, etc.]
```

## VISUAL SCHEMA ADDITIONS NEEDED

### Missing Visual Blueprint Schemas
```typescript
// COMPLETE visual blueprint schema extensions needed:

// 1. PBR Material Properties Schema
export const PBRPropertiesSchema = z.object({
  baseColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/), // Hex color
  roughness: z.number().min(0).max(1),
  metallic: z.number().min(0).max(1),
  normalStrength: z.number().min(0).max(2),
  aoStrength: z.number().min(0).max(1),
  heightScale: z.number().min(0).max(0.1),
  emissive: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

// 2. Procedural Generation Rules Schema
export const ProceduralRulesSchema = z.object({
  blendMode: z.enum(['multiply', 'overlay', 'normal', 'additive']),
  noiseScale: z.number().min(0.1).max(10.0),
  heightVariation: z.number().min(0).max(1),
  colorVariation: z.number().min(0).max(1),
  weathering: z.number().min(0).max(1),
  ageEffect: z.number().min(0).max(1),
});

// 3. Animation Blueprint Schema
export const AnimationBlueprintSchema = z.object({
  idle: z.string().describe("Idle animation pattern"),
  movement: z.string().describe("Movement animation pattern"),
  interaction: z.string().describe("Interaction animation pattern"),
  death: z.string().describe("Death/decomposition animation"),
  birth: z.string().describe("Birth/emergence animation"),
  social: z.string().optional().describe("Social interaction animations"),
});

// 4. Spatial Behavior Schema  
export const SpatialBehaviorSchema = z.object({
  boundingBox: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    depth: z.number().positive(),
  }),
  collisionType: z.enum(['sphere', 'box', 'mesh', 'none']),
  movementPattern: z.enum(['static', 'wander', 'directed', 'flocking', 'orbital']),
  interactionRadius: z.number().positive(),
  visualScale: z.number().positive(),
});

// 5. COMPLETE Visual Blueprint Schema
export const CompleteVisualBlueprintSchema = z.object({
  // Core identity
  id: z.string(),
  name: z.string(),
  description: z.string(),
  generation: z.number().int().min(0).max(6),
  
  // Causal relationships
  canCreate: z.array(z.string()),
  cannotCreate: z.array(z.string()),
  compatibleWith: z.array(z.string()),
  incompatibleWith: z.array(z.string()),
  
  // Visual representation
  representations: z.object({
    primaryTextures: z.array(z.string()), // Main texture paths
    secondaryTextures: z.array(z.string()), // Detail/overlay textures
    colorPalette: z.array(z.string()), // Hex colors
    pbrProperties: PBRPropertiesSchema,
    proceduralRules: ProceduralRulesSchema,
  }),
  
  // 3D properties
  spatial: SpatialBehaviorSchema,
  animations: AnimationBlueprintSchema,
  
  // Composition rules
  compositionRules: z.string(),
  layeringOrder: z.number().int(),
  blendingMode: z.string(),
  
  // Metadata
  complexity: z.enum(['simple', 'moderate', 'complex', 'highly_complex']),
  renderingPriority: z.enum(['background', 'normal', 'important', 'critical']),
  lodLevels: z.array(z.string()), // Level of detail variations
  
  // Validation
  createdAt: z.string().datetime(),
  validatedAt: z.string().datetime().optional(),
  version: z.string(),
});
```

## MISSING DIRECTORY STRUCTURE ADDITIONS

### Additional Required Directories
```
packages/gen/
├── data/
│   ├── archetypes/                    # MISSING - AI-generated universal pools
│   │   ├── gen0.json                 # Planetary formation archetypes
│   │   ├── gen1.json                 # Creature archetypes  
│   │   ├── gen2.json                 # Pack archetypes
│   │   ├── gen3.json                 # Tool archetypes
│   │   ├── gen4.json                 # Tribal archetypes
│   │   ├── gen5.json                 # Building archetypes
│   │   └── gen6.json                 # Abstract system archetypes
│   ├── generated/                     # MISSING - AI-generated content cache
│   │   ├── visual-blueprints/        # Generated visual blueprints
│   │   ├── warp-chains/              # Agent handoff results
│   │   └── seed-selections/          # Seedrandom selection results
│   └── cache/                         # MISSING - AI response caching
│       ├── openai-responses/         # Cached AI responses
│       └── texture-queries/          # Cached texture tool queries

packages/shared/
├── src/
│   ├── types/                         # MISSING - Complete type definitions
│   │   ├── visual-blueprints.ts      # Visual blueprint types
│   │   ├── generation-types.ts       # Generation-specific types
│   │   └── game-state-types.ts       # Game state types
│   ├── utils/                         # MISSING - Utility functions
│   │   ├── seed-random.ts            # Seedrandom utilities
│   │   ├── coordinate-math.ts        # 3D coordinate mathematics
│   │   └── validation.ts             # Data validation utilities
│   └── constants/                     # MISSING - Game constants
│       ├── generation-constants.ts   # Generation limits and thresholds
│       ├── material-constants.ts     # Material properties and relationships
│       └── yuka-constants.ts         # Yuka AI system constants
```

## CRITICAL MISSING IMPLEMENTATIONS

### 1. Real AI Generation (Not Stubs)
- ❌ `real-archetype-generator.ts` - Has schema errors, doesn't actually generate
- ❌ `bash-ai-generator.ts` - Tool execution fails  
- ❌ All individual gen workflows deleted but replacement doesn't work
- **NEED**: Working AI generation that creates actual archetype JSON files

### 2. Texture System Integration  
- ❌ Texture manifest shows empty arrays despite 134 texture files existing
- ❌ `real-manifest-generator.ts` not actually called or tested
- ❌ Zod validation of texture manifest not working
- **NEED**: Proper texture scanning and manifest generation with validation

### 3. Visual Blueprint Complete Schema
- ❌ Missing PBR properties, animation blueprints, spatial behavior schemas
- ❌ No 3D rendering integration planned
- ❌ No LOD (level of detail) system
- **NEED**: Complete visual blueprint schema for future 3D rendering

### 4. Database Integration
- ❌ Backend systems not using shared package schemas
- ❌ No actual data persistence (simulation runs in memory only)
- ❌ No migration from current backend to shared database
- **NEED**: Backend refactor to use shared database and schemas

### 5. Package Dependency Integration
- ❌ Backend still has duplicate dependencies (should use shared)
- ❌ AI generators not properly exported from gen package
- ❌ Circular dependency risks not addressed
- **NEED**: Clean dependency management and proper package boundaries

## WHAT ACTUALLY WORKS VS WHAT'S BROKEN

### ✅ WORKING
- Database schema definition and table creation
- Texture file downloading (idempotent, 135 files, 3.2GB)
- Package directory structure organization
- Legacy code archival (150+ files preserved)
- Architecture documentation (comprehensive and detailed)
- CLI command structure (proper argument parsing)

### ❌ BROKEN/INCOMPLETE
- AI generation (schema validation failures)
- Texture manifest population (empty arrays despite files existing)
- Backend integration with shared package
- Visual blueprint schema completeness
- Actual archetype pool generation
- Tool emergence solution (Level 3 bottleneck)

## NEXT PHASE REQUIREMENTS

### Immediate Fixes Required
1. **Fix texture manifest generation** - populate arrays with actual scanned files
2. **Fix AI generation schemas** - resolve Zod validation errors  
3. **Implement bash AI tool** - let AI create files using bash commands
4. **Integrate backend with shared** - remove duplicate schemas and use workspace dependencies
5. **Generate actual archetype pools** - create the 435 universal archetypes

### Architecture Completion Required
1. **Complete visual blueprint schemas** - add PBR, animation, spatial behavior
2. **Implement seedrandom selection** - deterministic picking from universal pools
3. **Build WARP continuance system** - agent-to-agent knowledge handoff
4. **Create complete WEFT system** - macro/meso/micro bias and adjacency selection
5. **Solve tool emergence** - prove Level 3 of progressive validation

---

**CURRENT STATUS**: Foundation organized but many implementations incomplete  
**CRITICAL ISSUES**: AI generation broken, texture manifest empty, backend not integrated  
**NEXT PRIORITY**: Fix broken implementations before building additional features