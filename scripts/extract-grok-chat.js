#!/usr/bin/env node

/**
 * Grok Chat Extraction Script
 * Parses Grok-Procedural_Pixel_World_Evolution_Game.md to extract:
 * - Documentation (vision, mechanics, dev stages)
 * - Code snippets (TypeScript, JavaScript, shell scripts)
 * - Memory Bank initialization content
 * 
 * Usage: node extract-grok-chat.js [input-file] [output-dir]
 */

const fs = require('fs');
const path = require('path');

class GrokExtractor {
  constructor(inputFile, outputDir = '.') {
    this.inputFile = inputFile;
    this.outputDir = outputDir;
    this.sections = {
      vision: [],
      mechanics: [],
      techStack: [],
      devStages: [],
      codeSnippets: [],
      pocs: []
    };
  }

  // Parse markdown file in chunks to avoid memory overflow
  parseInChunks(chunkSize = 10000) {
    console.log(`📖 Reading ${this.inputFile}...`);
    const content = fs.readFileSync(this.inputFile, 'utf8');
    const lines = content.split('\n');
    
    let currentSection = null;
    let currentCodeBlock = null;
    let codeLines = [];
    let blockMeta = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect section headers
      if (line.match(/^##?\s+(Vision|Mechanics|Tech Stack|Dev Stages?|POC|Core Loop)/i)) {
        currentSection = this.detectSection(line);
      }
      
      // Detect code blocks
      if (line.startsWith('```')) {
        if (!currentCodeBlock) {
          // Start of code block
          const lang = line.replace('```', '').trim();
          currentCodeBlock = lang || 'text';
          blockMeta = { lang, section: currentSection, lineStart: i };
          codeLines = [];
        } else {
          // End of code block
          this.sections.codeSnippets.push({
            language: currentCodeBlock,
            code: codeLines.join('\n'),
            section: blockMeta.section,
            lineRange: [blockMeta.lineStart, i]
          });
          currentCodeBlock = null;
          codeLines = [];
        }
      } else if (currentCodeBlock) {
        codeLines.push(line);
      }
      
      // Store section content
      if (currentSection && !currentCodeBlock) {
        this.sections[currentSection].push(line);
      }
    }
    
    console.log(`✅ Parsed ${lines.length} lines`);
    console.log(`📊 Found ${this.sections.codeSnippets.length} code snippets`);
  }
  
  detectSection(header) {
    const lower = header.toLowerCase();
    if (lower.includes('vision') || lower.includes('overview')) return 'vision';
    if (lower.includes('mechanics') || lower.includes('core loop')) return 'mechanics';
    if (lower.includes('tech') || lower.includes('stack')) return 'techStack';
    if (lower.includes('dev') || lower.includes('stage') || lower.includes('roadmap')) return 'devStages';
    if (lower.includes('poc')) return 'pocs';
    return 'vision';
  }
  
  // Extract all code files
  extractCodeFiles() {
    console.log('\n🔨 Extracting code files...');
    
    const fileMap = {};
    
    this.sections.codeSnippets.forEach((snippet, idx) => {
      const { language, code, section } = snippet;
      
      // Detect file paths in code comments or first line
      const pathMatch = code.match(/^\/\/\s*(.+?\.(?:ts|js|md|json|sh))/m) ||
                        code.match(/^#\s*(.+?\.(?:ts|js|md|json|sh))/m) ||
                        code.match(/^<!--\s*(.+?\.(?:ts|js|md|json|sh))\s*-->/m);
      
      if (pathMatch) {
        const filePath = pathMatch[1].trim();
        fileMap[filePath] = { code, language, section };
      } else {
        // Generic filename based on language and index
        const ext = this.getExtension(language);
        const name = `extracted-${section || 'misc'}-${idx}.${ext}`;
        fileMap[name] = { code, language, section };
      }
    });
    
    return fileMap;
  }
  
  getExtension(language) {
    const map = {
      typescript: 'ts',
      javascript: 'js',
      python: 'py',
      bash: 'sh',
      shell: 'sh',
      markdown: 'md',
      json: 'json'
    };
    return map[language.toLowerCase()] || 'txt';
  }
  
  // Write extracted files to disk
  writeFiles(fileMap) {
    console.log('\n📝 Writing extracted files...');
    
    const dirs = {
      docs: path.join(this.outputDir, 'docs'),
      src: path.join(this.outputDir, 'src'),
      scripts: path.join(this.outputDir, 'scripts'),
      memoryBank: path.join(this.outputDir, 'memory-bank')
    };
    
    // Create directories
    Object.values(dirs).forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // Write each file
    Object.entries(fileMap).forEach(([filePath, { code, language, section }]) => {
      let targetDir = dirs.docs;
      
      if (filePath.startsWith('src/')) targetDir = this.outputDir;
      else if (filePath.startsWith('docs/')) targetDir = this.outputDir;
      else if (filePath.includes('memory-bank')) targetDir = this.outputDir;
      else if (filePath.endsWith('.sh')) targetDir = dirs.scripts;
      else if (filePath.endsWith('.md')) targetDir = dirs.docs;
      else if (filePath.endsWith('.ts') || filePath.endsWith('.js')) targetDir = dirs.src;
      
      const fullPath = path.join(targetDir, path.basename(filePath));
      const dirPath = path.dirname(fullPath);
      
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      fs.writeFileSync(fullPath, code.trim(), 'utf8');
      console.log(`  ✓ ${path.relative(this.outputDir, fullPath)}`);
    });
  }
  
  // Generate memory bank files
  generateMemoryBank() {
    console.log('\n🏦 Generating memory bank...');
    
    const memoryBankDir = path.join(this.outputDir, 'memory-bank');
    if (!fs.existsSync(memoryBankDir)) {
      fs.mkdirSync(memoryBankDir, { recursive: true });
    }
    
    // Project Brief
    const projectBrief = this.buildProjectBrief();
    fs.writeFileSync(path.join(memoryBankDir, 'projectbrief.md'), projectBrief, 'utf8');
    
    // Product Context
    const productContext = this.buildProductContext();
    fs.writeFileSync(path.join(memoryBankDir, 'productContext.md'), productContext, 'utf8');
    
    // System Patterns
    const systemPatterns = this.buildSystemPatterns();
    fs.writeFileSync(path.join(memoryBankDir, 'systemPatterns.md'), systemPatterns, 'utf8');
    
    // Tech Context
    const techContext = this.buildTechContext();
    fs.writeFileSync(path.join(memoryBankDir, 'techContext.md'), techContext, 'utf8');
    
    // Active Context
    const activeContext = this.buildActiveContext();
    fs.writeFileSync(path.join(memoryBankDir, 'activeContext.md'), activeContext, 'utf8');
    
    // Progress
    const progress = this.buildProgress();
    fs.writeFileSync(path.join(memoryBankDir, 'progress.md'), progress, 'utf8');
    
    console.log('  ✓ memory-bank/projectbrief.md');
    console.log('  ✓ memory-bank/productContext.md');
    console.log('  ✓ memory-bank/systemPatterns.md');
    console.log('  ✓ memory-bank/techContext.md');
    console.log('  ✓ memory-bank/activeContext.md');
    console.log('  ✓ memory-bank/progress.md');
  }
  
  buildProjectBrief() {
    const visionText = this.sections.vision.join('\n');
    return `# Ebb & Bloom - Project Brief

## Project Name
**Ebb & Bloom**

## Core Vision
Mobile-only procedural odyssey where a modular catalyst strides and scars a single, persistent world. Players experience an intimate, tidal evolution loop grounded in exploration, crafting, and emergent narratives. Inspired by Subnautica's tidal memory, Outer Wilds' looping ache, and No Man's Sky's emergent discovery.

## Key Goals
1. **Stage 1 POC**: Generate 5x5 Perlin chunk world with raycast stride view
2. **Touch-First UX**: Swipe/joystick controls for catalyst movement, gesture-based crafting
3. **Modular Systems**: Core.js (world gen, raycast), player.js (gestures, movement)
4. **Basic Crafting**: Ore + Water = Alloy with haptic feedback
5. **Mobile Performance**: 60FPS Android APK target
6. **10-Minute Frolic Test**: Playable meadow exploration demo

## Technical Foundation
- **Mobile**: Capacitor + Ionic Vue
- **Engine**: Phaser 3 (rendering, scenes)
- **ECS**: BitECS (entity management)
- **AI**: Yuka (autonomous agents, pathfinding)
- **State**: Zustand (global state management)
- **World Gen**: Perlin noise chunks (5x5 grid, 100x100 macros)

## Success Metrics
- Smooth 60FPS on Android
- Touch controls feel responsive and intuitive
- World generation is deterministic and explorable
- Basic crafting system works with haptic feedback
- 10-minute gameplay loop is engaging

## Scope Boundaries
**In Scope (Stage 1)**:
- 5x5 chunk world generation
- Basic raycast rendering
- Touch/gesture controls
- Simple crafting (1 recipe)
- Haptic feedback
- Pollution tracking (basic)

**Out of Scope (Stage 1)**:
- Complex trait inheritance
- Multiple biomes
- Full evo system
- Combat mechanics
- Stardust travel
- Audio/music

## Project Status
Currently in extraction and setup phase. Full game development log exists in Grok chat, now being systematically extracted into structured documentation and codebase.

${visionText.slice(0, 1000)}
`;
  }
  
  buildProductContext() {
    return `# Product Context

## Why This Exists
Ebb & Bloom addresses the desire for mobile games that offer:
- **Meaningful progression** without predatory monetization
- **Intimate exploration** vs endless procedural sprawl
- **Emergent narratives** through player actions and evolution systems
- **Touch-native gameplay** designed for mobile, not ported

## Problems It Solves
1. **Mobile game fatigue**: Repetitive grind loops and pay-to-win mechanics
2. **Shallow procedural generation**: Infinite worlds without depth or consequence
3. **Disconnected gameplay**: No sense of world impact or evolutionary legacy
4. **Poor mobile UX**: Desktop games awkwardly ported to touch controls

## How It Works
### Core Loop (Stage 1)
1. **Stride & Explore**: Swipe to move catalyst through procedurally generated meadow chunks
2. **Gather Resources**: Tap to collect ore, water, and other materials
3. **Craft & Build**: Gesture-based crafting (drag ore + water = alloy)
4. **Leave Scars**: Your actions create persistent pollution/changes in the world
5. **Evolve**: Proximity-based trait inheritance system (future stages)

### User Experience Goals
- **First 30 seconds**: Smooth onboarding, immediately start exploring
- **First 5 minutes**: Collect first resource, craft first item
- **First 10 minutes**: Explore multiple chunks, see world variety
- **First 30 minutes**: Understand crafting combos, see world scarring effects

### Key Differentiators
- **One persistent world** vs infinite random worlds
- **Modular creature system** with visual trait inheritance
- **Gesture-driven interactions** built for touch
- **Haptic feedback integration** for tactile game feel
- **Deterministic world gen** (same seed = same world)

## Target Experience
Players should feel:
- **Curious**: What's in the next chunk?
- **Impactful**: My actions matter to this world
- **Creative**: Experimenting with crafting combinations
- **Connected**: Building relationship with catalyst and creatures
- **Contemplative**: Tidal rhythms and evolutionary ache

## Not This
- Endless runner or idle game
- Gacha/loot box mechanics
- PvP or competitive multiplayer
- Desktop-first design
- Purely survival/combat focused
`;
  }
  
  buildSystemPatterns() {
    return `# System Patterns

## Architecture Overview

### Modular Core Design
\`\`\`
/src
├── core/           # World generation, raycast system
│   ├── world.ts    # Perlin chunk generation
│   └── raycast.ts  # Stride view rendering
├── player/         # Player controls and state
│   ├── gestures.ts # Touch/swipe handlers
│   └── catalyst.ts # Player entity
├── crafting/       # Resource and crafting systems
│   └── recipes.ts  # Crafting logic
├── stores/         # Zustand state management
│   └── game.ts     # Global game state
└── scenes/         # Phaser scenes
    └── main.ts     # Main gameplay scene
\`\`\`

## Key Technical Decisions

### 1. Phaser + BitECS Hybrid
- **Phaser**: Handles rendering, input, scene management
- **BitECS**: Manages entity-component-system for game logic
- **Rationale**: Phaser's mobile performance + ECS scalability for evolution systems

### 2. Chunk-Based World Generation
- **5x5 Chunk Grid**: Manageable memory footprint for mobile
- **Perlin Noise**: Deterministic, seed-based generation
- **Lazy Loading**: Generate chunks as player approaches edges
- **Persistence**: Track pollution/changes per chunk

### 3. Raycast Stride View
- **POV Style**: First-person-ish view from behind catalyst
- **Performance**: 100 rays for FOV @ 60FPS target
- **Mobile Optimization**: Lower resolution, distance culling
- **Future**: Can expand to full 3D or maintain pixel aesthetic

### 4. Gesture-First Input
- **Swipe**: Movement direction and turning
- **Tap**: Interact/collect
- **Long Press**: Context actions (future: dispatch creatures)
- **Pinch**: Zoom/FOV adjustment (future)
- **Drag & Drop**: Crafting combinations

### 5. State Management Strategy
- **Zustand**: Global game state (resources, pollution, journal)
- **BitECS Components**: Entity-specific state
- **Local Storage**: Persistence for world state
- **Rationale**: Simple, performant, no prop-drilling hell

## Component Relationships

### World Generation Flow
\`\`\`
Seed → Perlin Noise → Chunk Grid → Raycast View → Render
                                    ↓
                              Player Position
\`\`\`

### Crafting Flow
\`\`\`
Gesture Input → Recipe Match → Resource Check → Craft Item → Haptic Feedback
                                                    ↓
                                              Update Pollution
\`\`\`

### Evolution Flow (Future)
\`\`\`
Proximity Event → Trait Roll → Inheritance Calc → Visual Morph → Audio/Haptic
\`\`\`

## Critical Implementation Paths

### Stage 1 POC Path
1. Initialize Ionic Vue + Capacitor project
2. Install Phaser, BitECS, dependencies
3. Create basic Phaser scene with placeholder graphics
4. Implement Perlin chunk generation (5x5 grid)
5. Build raycast system for stride view
6. Add touch gesture handlers
7. Create catalyst entity with movement
8. Implement one crafting recipe (ore+water=alloy)
9. Add haptic feedback hooks
10. Build Android APK and test on device

### Performance Guardrails
- Target 60FPS minimum
- Max 1000 entities on screen
- Chunk culling beyond 2 chunk radius
- Texture atlases for sprite batching
- Minimize garbage collection (object pooling)

## Design Patterns in Use

### 1. Entity Component System (BitECS)
\`\`\`typescript
// Components are simple data containers
const Position = defineComponent({ x: f32, y: f32 });
const Velocity = defineComponent({ x: f32, y: f32 });

// Systems operate on entities with specific components
const movementSystem = (world) => {
  const entities = query([Position, Velocity]);
  // Update positions based on velocity
};
\`\`\`

### 2. Command Pattern (Crafting)
\`\`\`typescript
interface CraftCommand {
  inputs: ResourceType[];
  output: ResourceType;
  execute: () => void;
}
\`\`\`

### 3. Observer Pattern (State Updates)
\`\`\`typescript
// Zustand automatically notifies subscribers
const useGameStore = create((set) => ({
  resources: { ore: 0, water: 0 },
  addResource: (type, amount) => 
    set((state) => ({ resources: { ...state.resources, [type]: state.resources[type] + amount }}))
}));
\`\`\`

### 4. Object Pool Pattern (Performance)
\`\`\`typescript
class EntityPool {
  private pool: Entity[] = [];
  acquire(): Entity { /* reuse or create */ }
  release(entity: Entity) { /* return to pool */ }
}
\`\`\`

## Testing Strategy
- **Unit Tests**: Core logic (world gen, crafting recipes)
- **Integration Tests**: System interactions (gesture → movement)
- **Device Testing**: Real Android devices for performance
- **10-Minute Frolic Test**: Playability validation
`;
  }
  
  buildTechContext() {
    return `# Tech Context

## Technology Stack

### Mobile Framework
- **Capacitor 5.x**: Native mobile bridge
- **Ionic Vue 7.x**: UI components and routing
- **Vue 3**: Composition API, reactive state

### Game Engine & Systems
- **Phaser 3.60+**: 2D game engine, rendering, input
- **BitECS 0.3+**: High-performance Entity-Component-System
- **Yuka 0.7+**: AI steering behaviors, pathfinding (future stages)

### State & Data
- **Zustand 4.x**: Lightweight state management
- **Pinia**: Vue-specific state (if needed for UI)
- **LocalStorage/IndexedDB**: World persistence

### Utilities
- **simplex-noise**: Perlin noise generation
- **TypeScript 5.x**: Type safety throughout

### Build & Dev Tools
- **Vite 4.x**: Fast dev server, HMR
- **Vitest**: Unit testing
- **ESLint + Prettier**: Code quality
- **Capacitor CLI**: Mobile builds

## Development Setup

### Prerequisites
\`\`\`bash
node >= 18.x
npm >= 9.x
Android Studio (for APK builds)
\`\`\`

### Installation
\`\`\`bash
npm install -g @ionic/cli @capacitor/cli
npm install
\`\`\`

### Development
\`\`\`bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run test         # Run unit tests
npm run lint         # Check code quality
\`\`\`

### Mobile Build
\`\`\`bash
npx cap add android
npx cap sync
npx cap open android  # Opens Android Studio
\`\`\`

## Technical Constraints

### Mobile Performance
- **60FPS Target**: Must maintain on mid-range Android devices
- **Memory Limit**: ~512MB active game state
- **Battery**: Optimize to prevent excessive drain
- **Screen Sizes**: Support 5-7 inch displays

### Platform-Specific
- **Android**: Minimum API 24 (Android 7.0)
- **Gestures**: Must work with various touch screen qualities
- **Haptics**: Use Capacitor Haptics API
- **Orientation**: Portrait primary, landscape optional

### Network
- **Offline-First**: Core gameplay works without internet
- **Cloud Save**: Optional backup (future)
- **No Real-Time MP**: Fully single-player

## Dependencies

### Core Dependencies
\`\`\`json
{
  "@capacitor/android": "^5.5.0",
  "@capacitor/core": "^5.5.0",
  "@capacitor/haptics": "^5.0.0",
  "@ionic/vue": "^7.5.0",
  "phaser": "^3.60.0",
  "bitecs": "^0.3.40",
  "yuka": "^0.7.8",
  "zustand": "^4.4.0",
  "simplex-noise": "^4.0.1",
  "vue": "^3.3.0"
}
\`\`\`

### Dev Dependencies
\`\`\`json
{
  "@vitejs/plugin-vue": "^4.4.0",
  "typescript": "^5.2.0",
  "vite": "^4.5.0",
  "vitest": "^0.34.0",
  "eslint": "^8.50.0",
  "prettier": "^3.0.0"
}
\`\`\`

## Tool Usage Patterns

### Phaser Scene Lifecycle
\`\`\`typescript
class MainScene extends Phaser.Scene {
  preload() {
    // Load assets
  }
  
  create() {
    // Initialize world, entities
    this.setupWorld();
    this.setupGestures();
  }
  
  update(time, delta) {
    // Run ECS systems
    // Update Phaser objects
  }
}
\`\`\`

### BitECS Integration
\`\`\`typescript
// Define ECS world
const world = createWorld();

// Add entities
const catalyst = addEntity(world);
addComponent(world, Position, catalyst);
addComponent(world, Velocity, catalyst);

// Run systems in Phaser update loop
update() {
  movementSystem(world);
  renderSystem(world, this); // Pass Phaser scene
}
\`\`\`

### Zustand Store Pattern
\`\`\`typescript
import create from 'zustand';

export const useGameStore = create((set, get) => ({
  // State
  resources: { ore: 0, water: 0, alloy: 0 },
  pollution: 0,
  
  // Actions
  addResource: (type, amount) => set((state) => ({
    resources: { ...state.resources, [type]: state.resources[type] + amount }
  })),
  
  craft: (recipe) => {
    const state = get();
    if (canCraft(state.resources, recipe)) {
      set({ resources: applyRecipe(state.resources, recipe) });
      return true;
    }
    return false;
  }
}));
\`\`\`

### Gesture Handling
\`\`\`typescript
// In Phaser scene
this.input.on('pointerdown', (pointer) => {
  this.gestureStart = { x: pointer.x, y: pointer.y, time: Date.now() };
});

this.input.on('pointerup', (pointer) => {
  const gesture = this.detectGesture(this.gestureStart, pointer);
  this.handleGesture(gesture);
});
\`\`\`

## Known Issues & Workarounds

### Issue: Phaser + Vue Reactivity Conflicts
- **Problem**: Vue reactivity can cause Phaser render loops to stutter
- **Solution**: Keep Phaser game state separate from Vue reactive state
- **Pattern**: Use Zustand for game logic, Vue only for UI overlays

### Issue: Mobile Touch Delay
- **Problem**: 300ms click delay on some mobile browsers
- **Solution**: Use Phaser's pointer events, not DOM events
- **Pattern**: \`scene.input.on('pointerdown')\` instead of \`@click\`

### Issue: BitECS + TypeScript Types
- **Problem**: BitECS types can be verbose
- **Solution**: Create type aliases and helper functions
- **Pattern**: \`type Entity = number; const createCatalyst = () => { /* ... */ }\`

## Future Tech Considerations
- **Shaders**: GLSL for visual effects (Stage 4+)
- **Web Audio**: Procedural audio synthesis (Stage 3+)
- **WebGL2**: Advanced rendering techniques (if needed)
- **Wasm**: Performance-critical world gen (if needed)
`;
  }
  
  buildActiveContext() {
    return `# Active Context

## Current Focus
**Extraction & Initialization Phase**

We're currently extracting the complete Ebb & Bloom game development log from the Grok chat conversation and initializing the project structure. This is a critical foundation phase that will:

1. Parse ~4800 lines of design documentation and code
2. Extract all valuable markdown and code snippets
3. Initialize memory bank for ongoing development
4. Set up modular project structure
5. Create build scripts and documentation

## Recent Changes
- Created extraction script (\`scripts/extract-grok-chat.js\`)
- Initialized memory bank structure per \`.clinerules\`
- Set up TODO tracking for extraction process

## Next Steps
1. Run extraction script on full Grok chat
2. Organize extracted files into proper directory structure
3. Review and consolidate documentation
4. Fix .clinerules mermaid diagram formatting issues
5. Begin Stage 1 POC implementation:
   - Initialize Ionic Vue + Capacitor project
   - Install core dependencies
   - Create basic Phaser scene
   - Implement Perlin chunk generation

## Active Decisions

### Extraction Strategy
- **Chunked parsing**: Process large file in 10k line chunks to avoid memory issues
- **Pattern matching**: Use regex to detect code blocks, sections, file paths
- **Smart organization**: Auto-detect file types and organize into correct directories
- **Memory bank alignment**: Extract content directly into memory bank structure

### Project Structure
Following modular architecture:
- \`/docs\` - All documentation and design specs
- \`/src\` - Source code organized by system
- \`/scripts\` - Build and utility scripts
- \`/memory-bank\` - Persistent AI context (per .clinerules)

## Important Patterns

### Code Extraction Pattern
Script uses regex pattern matching to detect file paths in code comments and organize them into appropriate directories.

### Memory Bank Updates
- Update after major extraction milestones
- Keep activeContext.md current with extraction progress
- Document patterns discovered in systemPatterns.md

## Learnings & Insights

### From Grok Chat Analysis
1. **Comprehensive vision**: Full 12-hour development session captured
2. **Modular code examples**: Ready-to-use TypeScript implementations
3. **Self-documenting**: Chat includes extraction instructions within itself
4. **Vision-driven**: Every technical decision tied back to core ache/intimacy goals

### .clinerules Integration
- Memory bank provides persistent context across sessions
- Flowchart diagrams need mermaid formatting fixes
- Clear hierarchy: projectbrief → productContext → activeContext → progress

### Next Session Preparation
When work resumes, the next developer (human or AI) should:
1. Read ALL memory bank files (per .clinerules requirement)
2. Review extracted documentation in \`/docs\`
3. Check progress.md for current status
4. Continue with Stage 1 POC implementation

## Context for Future Work
This extraction phase is critical because:
- The Grok chat contains the ENTIRE game design and development log
- Proper extraction ensures no valuable insights are lost
- Memory bank initialization enables smooth handoffs between sessions
- Modular structure supports iterative development

The goal is to go from a massive chat log to a structured, navigable, and actionable codebase ready for Stage 1 POC development.
`;
  }
  
  buildProgress() {
    return `# Progress

## Current Status
**Phase: Extraction & Setup**

### What Works ✅
- ✅ .clinerules memory bank structure defined
- ✅ Grok chat file available (~4844 lines)
- ✅ Extraction script created (scripts/extract-grok-chat.js)
- ✅ Memory bank files initialized (this file and others)
- ✅ Project structure planned

### What's Left to Build 🚧

#### Immediate (This Session)
- [ ] Fix .clinerules mermaid diagram formatting
- [ ] Run extraction script on full Grok chat
- [ ] Organize extracted files into directory structure
- [ ] Validate all code snippets extracted correctly
- [ ] Create comprehensive docs/vision.md from extracted content

#### Stage 1 POC (Next 1-2 Weeks)
- [ ] Initialize Ionic Vue + Capacitor project
- [ ] Install dependencies (Phaser, BitECS, Zustand, etc.)
- [ ] Create src/core/world.ts (Perlin chunk generation)
- [ ] Create src/core/raycast.ts (stride view rendering)
- [ ] Create src/player/gestures.ts (touch input handlers)
- [ ] Create src/player/catalyst.ts (player entity)
- [ ] Create src/crafting/recipes.ts (ore+water=alloy)
- [ ] Integrate Capacitor Haptics for feedback
- [ ] Add pollution tracking to game store
- [ ] Configure Android build
- [ ] Build and test 60FPS APK on device
- [ ] Conduct 10-minute frolic playtest

#### Stage 2-6 (Future Roadmap)
- [ ] Stage 2: Catalyst Touch (evo creator, terraform gestures)
- [ ] Stage 3: Ecosystem Kin (packs, inheritance, quests)
- [ ] Stage 4: Grudge Ache (combat, abyss rites, rivals)
- [ ] Stage 5: Stardust Breath (world hopping, constellation map)
- [ ] Stage 6: Nova Elegy (full cycle, shaders, polish)

## Known Issues

### .clinerules Formatting
- **Issue**: Flowchart diagrams not wrapped in mermaid code blocks
- **Impact**: Won't render properly in Markdown viewers
- **Fix**: Wrap all flowcharts in \`\`\`mermaid blocks
- **Priority**: Low (documentation only)

### Extraction Challenges
- **Issue**: Large file size (4844 lines) may cause parsing issues
- **Mitigation**: Implemented chunked reading approach
- **Status**: To be validated during extraction run

### Mobile Build Setup
- **Issue**: Android Studio and build tools not yet configured
- **Impact**: Can't test on device until setup complete
- **Priority**: High for Stage 1 completion
- **Status**: Planned for next phase

## Evolution of Decisions

### Initial Vision
- One-world procedural evolution game
- Inspired by Subnautica, Outer Wilds, NMS
- Touch-first mobile design

### Extraction Phase Addition
- Recognized need for systematic extraction from Grok chat
- Decided to use .clinerules memory bank for persistent context
- Created extraction script to automate process

### Tech Stack Refinement
- **Confirmed**: Capacitor + Ionic Vue (mobile-first)
- **Confirmed**: Phaser + BitECS (rendering + ECS)
- **Confirmed**: Zustand (state management)
- **Added**: Extraction scripts in Node.js for tooling

### Next Decision Points
1. **Ionic vs Pure Capacitor**: Will we need Ionic UI components or just Capacitor?
2. **State Management**: Zustand alone or combine with Pinia for Vue components?
3. **Graphics Style**: Pixel art, low-poly 3D, or stylized 2D?
4. **Persistence**: LocalStorage sufficient or need IndexedDB for larger worlds?

## Metrics & Validation

### Extraction Success Criteria
- [ ] All code blocks extracted (estimate ~20-30 files)
- [ ] All documentation sections captured
- [ ] Memory bank files complete and accurate
- [ ] No critical content lost from Grok chat

### Stage 1 POC Success Criteria
- [ ] 60FPS on mid-range Android device
- [ ] Touch controls feel responsive (<100ms latency)
- [ ] World generation creates explorable 5x5 chunks
- [ ] Crafting system works with haptic feedback
- [ ] 10-minute playtest shows engaging core loop
- [ ] APK builds without errors

### Long-Term Success Metrics
- Player retention: 70% return after first session
- Session length: 20+ minutes average
- Evo diversity: <0.2 similarity score between haikus
- Performance: Consistent 60FPS on target devices
- Feedback: "Intimate," "surprising," "ache" in player descriptions

## Next Session Checklist

When resuming work:
1. ✅ Read ALL memory bank files (required per .clinerules)
2. ✅ Review this progress.md for current status
3. ✅ Check activeContext.md for immediate focus
4. ⏭️ Continue extraction process or begin Stage 1 POC
5. ⏭️ Update memory bank after significant progress

---

**Last Updated**: Initial extraction phase (before first extraction run)
**Next Milestone**: Complete extraction and organize files
**Confidence Level**: High - clear path from chat log to structured codebase
`;
  }
  
  // Run extraction
  run() {
    console.log('🎮 Ebb & Bloom - Grok Chat Extractor\n');
    
    this.parseInChunks();
    const fileMap = this.extractCodeFiles();
    this.writeFiles(fileMap);
    this.generateMemoryBank();
    
    console.log('\n✨ Extraction complete!');
    console.log(`\n📁 Output directory: ${this.outputDir}`);
    console.log('\nNext steps:');
    console.log('  1. Review extracted files in /docs and /src');
    console.log('  2. Read memory-bank files to understand project context');
    console.log('  3. Begin Stage 1 POC implementation');
  }
}

// CLI execution
if (require.main === module) {
  const inputFile = process.argv[2] || 'Grok-Procedural_Pixel_World_Evolution_Game.md';
  const outputDir = process.argv[3] || '.';
  
  const extractor = new GrokExtractor(inputFile, outputDir);
  extractor.run();
}

module.exports = { GrokExtractor };
