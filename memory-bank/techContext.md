# Technical Context - Ebb & Bloom

**Version**: 6.0.0  
**Date**: 2025-11-07  
**Status**: Complete 3D Evolutionary Ecosystem Foundation

---

## Technology Stack

### Core Framework
- **React 19.2.0**: Modern UI framework with React Three Fiber integration
- **TypeScript 5.7.2**: Type safety throughout entire codebase
- **Vite 6.0.3**: Fast dev server with HMR and optimized builds
- **Node >= 20.x**: Runtime requirement for build tools

### 3D Rendering & Game Engine  
- **React Three Fiber 9.4.0**: Declarative 3D rendering with React integration
- **@react-three/drei 10.7.6**: Helper components and utilities for R3F
- **Three.js 0.170.0**: Core 3D engine with WebGL2 support
- **Miniplex 2.0.0**: Modern ECS with React hooks integration
- **Yuka 0.7.8**: AI steering behaviors for creature intelligence

### Mobile Framework
- **Capacitor 6.1.2**: Native mobile bridge for iOS/Android
- **@capacitor/haptics 6.0.1**: Native haptic feedback integration
- **PWA Ready**: Progressive Web App capabilities for installation

### State Management & Data
- **Zustand 5.0.8**: Lightweight state management with persistence
- **Pino 10.1.0**: High-performance logging with browser support
- **localStorage**: Evolution data persistence and analysis

### Asset Pipeline
- **AmbientCG Integration**: 141 textures across 8 categories (Wood, Metal, etc.)
- **OpenAI 6.8.1**: AI-powered creature and UI asset generation  
- **Freesound API**: Procedural audio library integration
- **Axios 1.13.2**: HTTP client for asset downloading and API integration

### UI/UX Framework
- **Tailwind CSS 4.1.17**: Utility-first CSS framework
- **DaisyUI 5.4.7**: Component library with custom 'ebb-bloom' theme
- **Google Fonts**: Inter (UI), JetBrains Mono (code), Playfair Display (narrative)
- **Custom animations**: Evolutionary-themed motion patterns

### Build & Dev Tools
- **tsx 4.20.6**: TypeScript execution for build scripts
- **Commander 14.0.2**: CLI framework for dev tools
- **AI SDK 5.0.89**: Vercel AI integration for asset generation
- **Vitest 2.1.9**: Modern test runner with comprehensive mocking

### Testing Framework
- **React Testing Library 16.3.0**: Component testing with user behavior focus
- **@testing-library/jest-dom 6.9.1**: Extended Jest matchers
- **@playwright/test 1.56.1**: End-to-end testing for multi-platform validation
- **@react-three/test-renderer 9.1.0**: Three.js scene testing capabilities

---

## Architecture Pattern

### React Three Fiber + Miniplex ECS Architecture

```
┌─────────────────────────────────────────┐
│          Capacitor Native               │
│  ┌───────────────────────────────────┐  │
│  │    React + DaisyUI (UI Layer)     │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  React Three Fiber (3D)     │  │  │
│  │  │                             │  │  │
│  │  │  Reads from Miniplex ECS ──┐│  │  │
│  │  └────────────────────────────┼┘  │  │
│  │                               │   │  │
│  │  ┌────────────────────────────▼┐  │  │
│  │  │   Miniplex ECS (Game Logic) │  │  │
│  │  │                             │  │  │
│  │  │  Systems:                   │  │  │
│  │  │  - TerrainSystem            │  │  │
│  │  │  - CreatureArchetypeSystem  │  │  │
│  │  │  - GeneticSynthesisSystem   │  │  │
│  │  │  - PackSocialSystem         │  │  │
│  │  │  - EnvironmentalPressure    │  │  │
│  │  │  - HaikuNarrativeSystem     │  │  │
│  │  │  - HapticGestureSystem      │  │  │
│  │  │  - PopulationDynamics       │  │  │
│  │  │  - BuildingSystem           │  │  │
│  │  └─────────────────────────────┘  │  │
│  │          ▲                         │  │
│  │  ┌───────┴──────────────────────┐  │  │
│  │  │  Zustand (UI State Sync)    │  │  │
│  │  │  - Reads from ECS           │  │  │
│  │  │  - Never writes to ECS      │  │  │
│  │  │  - Evolution data persistence│  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Data Flow Principles

1. **Miniplex ECS as Source of Truth**: All evolutionary state lives in ECS systems
2. **React Three Fiber Renders Only**: 3D layer never modifies game state
3. **Zustand for UI State**: Syncs ECS data to React UI components (read-only)
4. **Systems Modify State**: Only ECS systems can change component data
5. **Event-Driven Updates**: Evolution events propagate through all layers

---

## Current Implementation

### Evolutionary Systems (`src/systems/`)

#### Core Systems
- **GameClock.ts**: Time management, generation cycles, evolution event coordination
- **RawMaterialsSystem.ts**: Material archetypes with affinity-based evolution pressure
- **CreatureArchetypeSystem.ts**: Emergent taxonomy without predetermined species
- **GeneticSynthesisSystem.ts**: Trait compatibility matrix → morphological changes → emergent naming
- **PopulationDynamicsSystem.ts**: Breeding, death cycles, population pressure management

#### Social & Environmental Systems  
- **PackSocialSystem.ts**: Advanced pack dynamics with hierarchy, territory, loyalty
- **EnvironmentalPressureSystem.ts**: Pollution tracking, shock events, biome stress
- **BuildingSystem.ts**: Daggerfall-inspired functional architecture with crafting interiors

#### Experience Systems
- **HaikuNarrativeSystem.ts**: Procedural storytelling with Jaro-Winkler diversity guard
- **HapticGestureSystem.ts**: Mobile-first touch interaction with Capacitor haptics
- **SporeStyleCameraSystem.ts**: Dynamic third-person camera with evolution event response

#### Infrastructure Systems
- **TerrainSystem.ts**: Multi-octave noise heightmaps with texture integration
- **TextureSystem.ts**: AmbientCG material pipeline with React hooks
- **EcosystemFoundation.ts**: Master coordinator integrating all systems

### UI Framework (`src/styles/`, `tailwind.config.js`)

#### Design System
- **Brand Colors**: Ebb Indigo, Bloom Emerald, Trait Gold, Echo Silver
- **Typography**: Inter (UI), JetBrains Mono (code), Playfair Display (narrative)  
- **Animations**: Evolutionary-themed motion (trait-emerge, evolution-pulse, organic-breathe)
- **Components**: DaisyUI with custom evolutionary theme

#### Mobile Optimization
- **Touch Targets**: Minimum 44px for accessibility
- **Gesture Handling**: Custom touch events with haptic feedback
- **Performance**: 60 FPS targeting on mid-range Android
- **Responsive**: Mobile-first with tablet/desktop enhancement

### Development Tools (`src/dev/`, `src/build/`)

#### AI-Powered Pipeline
- **GameDevCLI.ts**: Manifest-driven asset generation with OpenAI integration
- **AmbientCG Downloader**: Production-quality texture acquisition (141 textures)
- **OpenAI Integration**: Creature asset generation from trait synthesis
- **Freesound Integration**: Audio library management with API integration

#### Asset Management
- **Texture Pipeline**: Automated download, organization, manifest generation
- **Model Generation**: AI-powered creature visuals based on evolutionary traits
- **Audio Library**: Procedural sound acquisition for environmental/evolution audio
- **UI Assets**: Generated icons, backgrounds, patterns with brand consistency

---

## Performance Optimizations

### Mobile Performance
- **React Three Fiber**: Hardware-accelerated WebGL2 rendering
- **Miniplex ECS**: Cache-friendly component architecture
- **Instanced Rendering**: Efficient vegetation and object rendering
- **LOD Systems**: Distance-based detail reduction
- **Memory Management**: Event history trimming, garbage collection optimization

### 3D Rendering Pipeline  
- **Spore-style camera**: Intelligent frustum culling and LOD
- **Texture streaming**: On-demand loading with caching
- **Geometry optimization**: Procedural generation over asset storage
- **Shader efficiency**: Minimal fragment shader complexity for mobile

### Evolution Simulation
- **Time acceleration**: 10x simulation speed for testing and development
- **Data persistence**: localStorage with export capabilities for analysis
- **System isolation**: Each system independently testable and optimizable
- **Cross-system coordination**: Efficient event propagation without performance impact

---

## Development Workflow

### Commands
```bash
# Development
pnpm dev              # Start dev server (0.0.0.0 for network access)
pnpm build           # Production build

# Testing
pnpm test            # Run all tests
pnpm test:watch      # Watch mode
pnpm test:ui         # Interactive test UI
pnpm test:coverage   # Coverage reports

# Asset Pipeline
pnpm setup:textures  # Download AmbientCG library
pnpm dev:setup       # Setup complete dev environment
pnpm dev:creature    # Generate creature assets
pnpm dev:audio       # Download audio library  
pnpm dev:ui          # Generate UI elements

# Mobile Development
npx cap sync android # Sync to Android
npx cap open android # Open Android Studio
npx cap run android  # Run on device
```

### Environment Variables
```bash
OPENAI_API_KEY=      # Required for AI asset generation
FREESOUND_API_KEY=   # Required for audio library
```

---

## Testing Infrastructure

### Unit Testing (Vitest)
- **Core system validation**: GameClock, genetic synthesis, population dynamics
- **Evolution algorithm testing**: Trait inheritance, emergent naming, pack formation
- **Camera system testing**: Spore-style perspective and event response
- **Mock framework**: SimplexNoise, Yuka, Three.js, Capacitor for headless testing

### Integration Testing
- **ECS component interaction**: Cross-system evolution pressure and trait inheritance
- **React hooks integration**: Miniplex → React → UI state synchronization
- **Asset pipeline testing**: Texture loading, manifest generation, AI integration

### End-to-End Testing (Playwright)
- **Multi-platform validation**: Web, Android emulation, desktop
- **Evolution simulation**: Long-running ecosystem validation
- **Performance testing**: 60 FPS maintenance under load
- **Mobile interaction**: Touch gesture and haptic feedback validation

---

## Current Implementation Status

### ✅ Complete (Production Ready)
1. **ECS Architecture**: Miniplex + React Three Fiber integration
2. **All Evolutionary Systems**: Creatures, materials, packs, environment, narrative
3. **Camera System**: Spore-style dynamic third-person with evolution event response
4. **Texture Pipeline**: AmbientCG integration with 141 textures downloaded
5. **Brand Identity**: Complete design system with colors, typography, animations
6. **Dev Tools**: AI-powered asset generation pipeline with manifest management
7. **Testing Framework**: Comprehensive unit and integration test coverage
8. **Mobile Architecture**: Capacitor integration with haptic feedback

### 🎯 Next Implementation: Frontend UI
1. **Evolution Visualization Components**: Real-time creature display with trait emergence
2. **Generation Progress UI**: Clock, progress indicators, evolution event feed  
3. **Pack Dynamics Interface**: Social interaction visualization and territory display
4. **Environmental Dashboard**: Pollution indicators, shock event notifications
5. **Narrative Integration**: Haiku display with emotional context and timing
6. **Mobile Interaction**: Touch controls with haptic feedback integration
7. **Data Visualization**: Evolution analysis charts and ecosystem health metrics

---

## Key Technical Achievements

### Architecture Excellence
- **Zero technical debt**: Clean separation between systems  
- **Production quality**: Proper error handling, logging, state management
- **Mobile-first**: Touch controls, haptic feedback, performance optimization
- **Scalable foundation**: Unlimited expansion capability without architectural changes

### Innovation Implementation
- **Emergent taxonomy**: Creatures earn names through trait synthesis (cache_swimmer, deep_seeker)
- **Dynamic behavioral AI**: Yuka steering modified by evolutionary trait development
- **Environmental pressure**: Pollution and shock events driving ecosystem adaptation  
- **Procedural narrative**: Haiku generation with Jaro-Winkler diversity guard
- **AI-integrated dev tools**: Creature generation from evolutionary trait descriptions

### Performance Validation
- **Test coverage**: Core systems validated with comprehensive unit tests
- **Browser compatibility**: React Three Fiber + Miniplex working in modern browsers
- **Mobile readiness**: Capacitor integration tested and operational
- **Asset pipeline**: Production-quality texture and audio acquisition systems

---

## References & Documentation

### Implementation Guides
- `docs/EVOLUTIONARY_SYSTEMS.md` - Complete system architecture and integration
- `docs/CAMERA_SYSTEM.md` - Spore-style camera design and implementation
- `docs/BRAND_IDENTITY_2025.md` - Updated brand guidelines for 3D ecosystem

### Memory Bank Context
- `memory-bank/activeContext.md` - Current state and next steps
- `memory-bank/progress.md` - Detailed completion status
- `memory-bank/productContext.md` - Game vision and design

---

**Last Updated**: 2025-11-07  
**Architecture Version**: Complete 3D Evolutionary Ecosystem Foundation  
**Next Phase**: Frontend UI Implementation with evolutionary visualization