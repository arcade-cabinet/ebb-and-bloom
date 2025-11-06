# Product Context - Ebb & Bloom

## What We're Building

**Ebb & Bloom** is a mobile-first procedural evolution game where you embody a modular pixel catalyst whose actions ripple through a living, breathing world. It's about intimate connection to a single world that remembers you, tidal rhythms of growth and decay, and evolutionary legacy through trait inheritance.

## Core Philosophy: "One-World Ache"

### The Experience
- **80% Single World**: Deep immersion in one procedurally generated world
- **Tidal Rhythm**: Ebb (pollution/decay) and Bloom (growth/harmony) cycles
- **Evolutionary Memory**: Your traits inherit into the ecosystem
- **Touch as Language**: Gestures are the primary interface
- **Intimate Scale**: Quality over quantity - one world that evolves WITH you

### Why Mobile-Only
- **Touch-First Design**: Not a port - designed from scratch for gestures
  - Swipe to stride and carve terrain
  - Pinch to zoom and siphon resources  
  - Hold to dispatch critter packs on quests
  - Gyro tilt for depth perception
- **Haptic Feedback**: Physical connection to world events
  - Light buzz for harmony blooms
  - Heavy rumble for combat lashes
  - Playstyle-aware patterns
- **Portrait Orientation**: One-handed play
- **60FPS Target**: Mid-range Android devices (Snapdragon 700+)

## Current Implementation State

### Fully Implemented (Stage 1 Complete)

#### ECS Architecture (BitECS)
- **10 Trait Components**: FlipperFeet, ChainsawHands, DrillArms, WingGliders, EchoSonar, BioLumGlow, StorageSacs, FiltrationGills, ShieldCarapace, ToxinSpines
- **Synergy Calculator**: Burr-tide, Vein Hunter, Purity Beacon
- **Movement System**: Velocity-based with friction
- **Crafting System**: Recipe matching and resource checks

#### Resource Snapping
- **Affinity-Based**: 8-bit flags (HEAT, FLOW, BIND, POWER, LIFE, METAL, VOID, WILD)
- **5 Core Recipes**: ore+water→alloy, wood+water→mud, alloy+power→circuit, ore+wood→tool, flower+water→potion
- **Procedural Haikus**: Generated for each snap event
- **Magnetic Proximity**: Resources snap when adjacent with matching affinities

#### Critter Pack System
- **Formation Mechanics**: 3-15 critters form packs via proximity + shared traits
- **Loyalty Tracking**: 0-1 scale, modified by player actions
- **Roles**: Leader, Specialist, Follower
- **Pack Schism**: Splits when loyalty < 0.3
- **Species**: Fish, Squirrel, Bird, Beaver

#### Pollution & Behavior
- **Pollution System**: 0-100% tracked, increases with crafting
- **3 Shock Types**: Whisper (40%), Tempest (70%), Collapse (90%)
- **Behavior Profiling**: Tracks Harmony/Conquest/Frolick playstyle
- **Rolling Window**: Last 100 actions analyzed
- **World Reactions**: Playstyle affects pollution impact

#### Mobile-Optimized Systems
- **Haptic System**: 20+ distinct patterns, playstyle-aware
- **Gesture System**: 7 gesture types with configurable thresholds
- **Haiku Scorer**: Jaro-Winkler similarity to prevent repetition (<20% overlap)

### World Generation
- **Perlin Noise**: Organic terrain generation
- **Chunk-Based**: 5x5 chunks, each 100x100 tiles
- **4 Biomes**: Water, Grass, Flowers, Ore
- **Seeded**: Reproducible worlds
- **Viewport Culling**: Efficient rendering

### Current Package Structure
```
src/
├── ecs/               # Entity-Component-System (BitECS)
│   ├── components/    # Position, Velocity, Inventory, Traits, Pack
│   ├── systems/       # Movement, Crafting, Pack, Pollution, Behavior, Snapping
│   ├── entities/      # Player, Critter creation
│   └── world.ts       # ECS world management
├── game/              # Phaser rendering layer
│   ├── core/          # World generation (Perlin noise)
│   ├── player/        # Player entity (deprecated - migrated to ECS)
│   └── GameScene.ts   # Main game loop
├── systems/           # Cross-cutting systems
│   ├── HaikuScorer.ts # Narrative diversity guard
│   ├── HapticSystem.ts # Touch feedback
│   └── GestureSystem.ts # Touch input
├── stores/            # Zustand state management
└── views/             # Vue UI overlays
```

## Development Targets

### Performance
- **60 FPS**: Steady on mid-range Android
- **< 15MB APK**: Target bundle size (currently ~4MB)
- **< 150MB RAM**: Active game state
- **< 3s Load**: Initial world generation

### Testing
- **57/57 Tests Passing**: Full coverage of core systems
- **CI/CD**: Automated builds on every commit
- **Test Suites**:
  - Components (4 tests)
  - Movement System (3 tests)
  - Crafting System (3 tests)
  - Haiku Scorer (8 tests)
  - Snapping System (6 tests)
  - Pollution & Behavior (15 tests)
  - Pack System (18 tests)

## Player Experience Pillars

### Harmony Players (Cozy Zen)
- Slow symbiotic evolution
- Pack gifting and cooperation
- Pollution mitigation through purity
- Serenity point accumulation
- Meditative stride gameplay

### Conquest Players (Grinders)
- Fast resource yields
- Grudge-based combat
- Abyss reclamation
- Pack raids and turf wars
- Risk/reward optimization

### Frolick Players (Poet Nomads)
- Whimsy detours and warps
- Low-stakes exploration
- Haiku journal focus
- Cosmetic trait collection
- Narrative discovery

## What Makes This Special

### Innovation: Magnetic Resource Snapping
Unlike traditional crafting menus, resources "snap" together based on proximity and affinity. Ore + Water = Alloy happens naturally when you place them adjacent. Scales infinitely through procedural permutations.

### Trait Inheritance System
Your creature's traits don't just affect you - they influence the ecosystem:
- **Proximity-Based**: Creatures near you evolve similar traits
- **Dilution Mechanics**: Traits weaken by 50% each generation  
- **Hybrid Emergence**: flow + void = tidal scar
- **Behavioral Mirroring**: Your playstyle shapes creature AI

### Procedural Haikus
Every significant action generates a procedural haiku that captures the moment:
- Jaro-Winkler similarity prevents repetition
- Narrative diversity guard (<20% overlap)
- Journal persists across nova cycles
- Metaphor bank procedurally generates phrases

## Future Vision (Stage 2+)

### Not Yet Implemented
- **Combat System**: Wisp clashes, momentum-based gestures
- **Ritual Mechanics**: Ceremonial abyss reclamation
- **Nova Cycles**: 45-90min world resets with journal persistence
- **Stardust Hops**: Rare travel to 5-10 sibling worlds
- **Audio System**: Procedural soundscapes
- **Visual Effects**: Shaders for pollution haze, water flow
- **Catalyst Creator**: Modular pixel editor (8x8 atlas)
- **Terraform Gestures**: Swipe to carve, pinch to infuse

## Technical Foundation

### Architecture Strengths
- **ECS Separation**: BitECS for logic, Phaser for rendering, Zustand for UI state
- **No Technical Debt**: Proper architecture from day one
- **Test Coverage**: 57 tests, all passing
- **CI/CD Pipeline**: Automated builds and quality checks
- **Modern Tooling**: pnpm, Renovate, TypeScript 5.7

### Dependencies (Auto-Updated)
- **Core**: Phaser 3.87, BitECS 0.3.40, Zustand 5.0.2
- **Mobile**: Capacitor 6.1, Ionic Vue 8.7
- **AI**: Yuka 0.7.8 (prepared for Stage 2)
- **Dev**: Vitest 2.1, Vite 6.0

## Balance Philosophy

### Intimate Pull
- 80% one-world immersion with depth strata
- 20% stardust breaths (earned, scar-tied hops)
- Most play time in single world evolution

### Style Skew
- **Harmony**: Slow symbiotes, +serenity, gift loops
- **Conquest**: Fast yields, grudge snowball, raid chains
- **Frolick**: Whimsy detours, low stakes, cosmetic focus

### Risk Ache
- Pollution as tidal debt (mendable vs. abyss creeps)
- Nova resets persist lore (Outer Wilds-style wisdom)
- Shock types scale consequences

### Mobile Flow
- Gestures build momentum (combo haptics)
- Idle pings tease without grind
- 70% linger rate target (via playtesting)

## Known Limitations

### Current POC State
- APK only 4MB (very lean, good for mobile)
- UI/UX flow needs polish
- Limited content variety (5 recipes, 10 traits)
- No combat/ritual implementation yet
- No audio system
- Placeholder visual effects

### Documentation Sprawl (Being Addressed)
- 60+ extracted files from Grok conversations
- Mix of vision, mechanics, and implementation notes
- Conversation format (not structured reference docs)
- Needs consolidation into proper architecture bible

---

**Last Updated**: 2025-11-06
**Current Phase**: Stage 1 Complete, Moving to Documentation & Architecture Organization
**Next**: Stage 2 implementation (Combat, Rituals, Nova Cycles)
