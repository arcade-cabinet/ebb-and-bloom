# GEN PACKAGE RESTRUCTURE PLAN

## CURRENT MESS
```
packages/gen/
├── src/ (scattered files, poor organization)
├── data/ (partially working)
└── package.json
```

## TARGET STRUCTURE
```
packages/gen/
├── package.json                   # Clean dependencies
├── cli.js                        # Main CLI entry point
├── src/
│   ├── index.ts                   # Package exports
│   ├── commands/                  # CLI command implementations
│   │   ├── textures.ts           # Texture downloading + manifest generation
│   │   ├── archetypes.ts         # Universal archetype generation
│   │   └── status.ts             # Package status checking
│   ├── generators/               # Content generators
│   │   ├── texture-manifest.ts   # Real texture manifest generator
│   │   ├── archetype-pools.ts    # Universal archetype pool generator
│   │   └── visual-blueprints.ts  # Visual blueprint generator
│   ├── downloaders/              # Asset downloaders
│   │   ├── ambientcg.ts         # AmbientCG texture downloader
│   │   └── index.ts             # Downloader exports
│   ├── schemas/                  # Validation schemas
│   │   ├── texture-schema.ts     # Texture manifest validation
│   │   ├── archetype-schema.ts   # Archetype validation
│   │   └── blueprint-schema.ts   # Visual blueprint validation
│   └── utils/                    # Utility functions
│       ├── file-operations.ts    # File I/O utilities
│       ├── validation.ts         # Schema validation helpers
│       └── seed-random.ts        # Seedrandom utilities
├── data/
│   ├── manifests/               # Configuration files
│   │   ├── generation-config.json # Complete generation configuration
│   │   └── texture-catalog.json  # Texture catalog
│   ├── archetypes/              # Generated universal pools
│   │   ├── gen0/
│   │   │   ├── macro.json       # 20 stellar context archetypes
│   │   │   ├── meso.json        # 15 accretion dynamic archetypes
│   │   │   └── micro.json       # 25 element distribution archetypes
│   │   ├── gen1/ ... gen6/      # Same structure for all generations
│   └── textures/                # Downloaded textures with manifest
│       ├── manifest.json        # Complete texture catalog
│       ├── bricks/             # 20 brick textures
│       ├── concrete/           # 20 concrete textures
│       ├── fabric/             # 19 fabric textures
│       ├── grass/              # 8 grass textures
│       ├── leather/            # 20 leather textures
│       ├── metal/              # 18 metal textures
│       ├── rock/               # 18 rock textures
│       └── wood/               # 11 wood textures
└── README.md                    # Package documentation
```

## RESTRUCTURE ACTIONS
1. Clean up src/ directory structure
2. Move files to proper organized locations
3. Create proper command implementations
4. Fix all broken imports
5. Create comprehensive package README