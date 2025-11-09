# Gen3: Tools & Structures

## Overview

Gen3 introduces **technological emergence** - creatures discover, create, and use simple tools, then collaborate to build structures. This marks the transition from purely biological evolution to cultural/technological development.

**Core Philosophy**: Tools and structures emerge from **intelligence + environment + social learning**, not scripted events. Every playthrough creates unique technological paths.

## Core Systems

### 1. Tool System (`ToolSystem.ts`)

**Purpose**: Enable tool discovery, creation, use, and cultural transmission.

#### Tool Types (Archetype-Specific):

1. **Digging Stick** (Burrow Engineers)
   - Used for: Breaking ground, excavating burrows
   - Appearance: Brown wooden stick (cylinder, 0.4 units tall)
   - Created by: High-intelligence burrowing creatures

2. **Gathering Pole** (Arboreal Opportunists)
   - Used for: Reaching high food sources
   - Appearance: Green pole (cylinder, 0.6 units tall)
   - Created by: High-intelligence arboreal creatures

3. **Wading Spear** (Littoral Harvesters)
   - Used for: Fishing in shallow water
   - Appearance: Blue spear with point (cylinder + cone)
   - Created by: High-intelligence littoral creatures

4. **Striking Stone** (Cursorial Foragers)
   - Used for: Breaking hard resources
   - Appearance: Gray stone (sphere, 0.15 diameter)
   - Created by: High-intelligence cursorial creatures

#### Key Features:

**Tool Discovery**:
- Creatures find tools within ~2 degrees
- Discovery chance: 5-10% per frame (scales with intelligence)
- Smart creatures (intelligence > 0.7) discover faster

**Tool Creation**:
- Only high-intelligence creatures (> 0.7) create tools
- Creation chance: 0.1% per frame (scales with intelligence)
- Tools spawn at creature's position
- Automatic self-discovery on creation

**Cultural Transmission**:
- Pack creatures (social='pack') teach within ~3 degrees
- Teaching chance: 5% per frame
- Knowledge spreads: Teacher → nearby students
- Visual indicator: Yellow glowing ring above teachers
- Students learn tool proficiency (0.1-0.3 initial)

**Tool Degradation**:
- All tools degrade: 1% per second
- Durability: 1.0 (new) → 0 (broken)
- Visual feedback: Scale and alpha fade with durability
- Broken tools disappear

**Data Structures**:

```typescript
interface Tool {
  id: string;
  type: 'digging_stick' | 'gathering_pole' | 'wading_spear' | 'striking_stone';
  position: { lat: number; lon: number };
  createdBy: string | null;
  durability: number; // 0-1
  discoveredBy: Set<string>; // Creature IDs
}

interface ToolKnowledge {
  creatureId: string;
  knownTools: Map<string, number>; // type → proficiency
  learnedFrom: Map<string, string>; // type → teacher ID
  teaching: boolean;
}
```

---

### 2. Structure Building System (`StructureBuildingSystem.ts`)

**Purpose**: Enable collaborative construction of archetype-specific structures.

#### Structure Types:

1. **Burrow** (Burrow Engineers)
   - Description: Underground burrow complex
   - Visual: Circular entrance (dark disc) + raised mound (cylinder)
   - Capacity: 5 creatures
   - Benefits: Safety, energy recovery, food storage

2. **Platform** (Arboreal Opportunists)
   - Description: Elevated tree platform nest
   - Visual: Flat disc platform + 4 support branches
   - Capacity: 3 creatures
   - Benefits: Safety from ground threats, elevated rest

3. **Stiltwork** (Littoral Harvesters)
   - Description: Water platform on stilts
   - Visual: Flat platform + 6 stilt legs
   - Capacity: 4 creatures
   - Benefits: Water access, fishing platform

4. **Windbreak** (Cursorial Foragers)
   - Description: Ground shelter with angled wall
   - Visual: Angled wall + 3 support posts
   - Capacity: 3 creatures
   - Benefits: Wind protection, rest area

#### Building Process:

**1. Project Initiation**:
- Requirements: Intelligence > 0.6, has tool knowledge
- Initiation chance: 0.05% per frame (scales with intelligence)
- Only if no nearby projects (< 10 degrees)
- Creates ghosted preview (yellow wireframe)

**2. Collaborative Construction**:
- Work range: ~2 degrees from project
- Work rate: 1% per second base
- Multipliers:
  - Strength: 0.5-1.0x
  - Intelligence: 0.5-1.0x
  - Pack bonus: 1.2x (for pack creatures)
- Requires energy > 0.3

**3. Completion**:
- Threshold: 100% total work from all contributors
- Creates permanent structure
- Removes ghost preview

**4. Usage**:
- Auto-occupancy: Creatures within 1 degree
- Capacity limits enforced
- Benefits: Reduced fear, faster energy recovery
- Food storage (future feature)

**5. Degradation**:
- Rate: 0.01% per second
- Destroyed structures disappear

**Data Structures**:

```typescript
interface Structure {
  id: string;
  type: 'burrow' | 'platform' | 'stiltwork' | 'windbreak';
  position: { lat: number; lon: number };
  builders: string[]; // Contributors
  completionProgress: number; // Always 1.0 for complete
  durability: number; // 0-1
  capacity: number;
  occupants: Set<string>;
  foodStorage: number; // Future use
}

interface BuildingProject {
  structureId: string;
  targetType: Structure['type'];
  location: { lat: number; lon: number };
  contributors: Map<string, number>; // ID → work amount
  startTime: number;
}
```

---

## Renderers

### 1. ToolRenderer (`ToolRenderer.ts`)

**Renders physical tools and knowledge indicators**.

**Tool Meshes**:
- **Digging Stick**: Brown cylinder (0.05 diameter, 0.4 height)
- **Gathering Pole**: Green cylinder (0.04 diameter, 0.6 height)
- **Wading Spear**: Blue cylinder + cone point
- **Striking Stone**: Gray sphere (0.15 diameter, shiny)

**Visual Features**:
- Position: On planet surface at tool location
- Orientation: Aligned to surface normal
- Scale: 0.3-0.5 (scales with durability)
- Alpha: 0.5-1.0 (fades as tool wears)

**Knowledge Indicators**:
- Yellow glowing torus above teaching creatures
- Diameter: 0.3, thickness: 0.02
- Alpha: 0.6 (semi-transparent)
- Rotated flat (horizontal ring)

---

### 2. StructureRenderer (`StructureRenderer.ts`)

**Renders completed structures and building projects**.

**Complete Structure Visuals**:

1. **Burrow**:
   - Dark brown entrance disc (0.3 radius)
   - Raised dirt mound (0.8 diameter cylinder)
   - PBR material with earth colors

2. **Platform**:
   - Flat disc platform (0.5 radius)
   - 4 support branches (cylinders)
   - Wood material (brown, rough)
   - Elevated 0.3 units

3. **Stiltwork**:
   - Box platform (0.8x0.8x0.1)
   - 6 stilt legs (cylinders)
   - Reed/wood material
   - Elevated 0.5 units

4. **Windbreak**:
   - Angled wall box (1.2x0.6x0.1)
   - 3 support posts (cylinders)
   - Wood/grass material
   - Angled 30°

**Building Project Visuals**:
- Ghosted yellow wireframe box
- Alpha: 0.3 (translucent)
- Pulse animation (scales with progress)
- Preview of final location

**Occupancy Glow**:
- Glowing sphere around occupied structures
- Warm orange/yellow emissive color
- Scale: 0.5-1.0 (based on occupancy ratio)
- Alpha: 0.3

---

## Integration with GameScene

### Initialization:
```typescript
// Renderers
this.toolRenderer = new ToolRenderer(this.scene);
this.structureRenderer = new StructureRenderer(this.scene);

// Systems
this.toolSystem = new ToolSystem();
this.structureSystem = new StructureBuildingSystem();
```

### Update Loop (Every Frame):
```typescript
1. Update creature behaviors (movement, goals)
2. Update pack formations
3. Update creature interactions
4. **Update tools**:
   - Tool discovery
   - Tool degradation
   - Cultural transmission
   - Tool creation
5. **Update structures**:
   - Project initiation
   - Collaborative work
   - Project completion
   - Structure degradation
   - Structure usage
6. Render all (creatures, packs, interactions, **tools, structures**)
```

---

## Player Experience

### What Players See:

**Celestial/Planetary View** (zoomed out):
- Tools appear as tiny colored points
- Structures visible as small shapes
- Building projects as yellow glimmers

**Surface View** (zoomed in):
- **Tools**:
  - Digging sticks (brown), gathering poles (green), wading spears (blue), striking stones (gray)
  - Yellow rings above creatures actively teaching
  - Tools fade as they wear out
  
- **Structures**:
  - Fully detailed 3D models (burrows, platforms, stiltworks, windbreaks)
  - Ghosted yellow wireframes for projects under construction
  - Warm glow around occupied structures
  - Visible degradation (scaling)

- **Actions**:
  - Smart creatures create tools
  - Creatures discover and learn tools
  - Pack creatures teach each other
  - Coordinated building efforts
  - Structures used for rest/safety

### Emergent Behaviors:

1. **Tool Innovation**
   - High-intelligence creatures spontaneously create tools
   - Different archetypes create different tools
   - Tools suited to their lifestyle

2. **Cultural Diffusion**
   - Knowledge spreads through social networks
   - Pack creatures accelerate learning
   - Isolated creatures remain tool-less

3. **Collaborative Construction**
   - Multiple creatures work together
   - Pack creatures build faster (20% bonus)
   - Strong/smart creatures contribute more

4. **Resource Networks**
   - Structures become gathering points
   - Pack territories form around structures
   - Safe zones for rest and recovery

---

## Technical Details

### Performance:
- **Tool discovery**: O(n * m) where n = creatures, m = tools (~20-30 each)
- **Tool creation**: O(n) where n = creatures
- **Structure initiation**: O(n) where n = creatures
- **Building work**: O(n * p) where n = creatures, p = projects
- **Frame time**: <2ms for typical counts

### Coordinate System:
- Lat/lon for positions
- Converts to 3D for rendering
- Handles longitude wrapping correctly

### Cultural Transmission Algorithm:
```
For each teacher (has tool knowledge, social='pack'):
  Find students within 3 degrees
  5% chance per frame:
    Pick random known tool
    Teach to student (initial proficiency 0.1-0.3)
    Track teacher ID in student's learnedFrom
    Mark teacher as "teaching" (visual indicator)
```

### Building Algorithm:
```
For each project:
  For each nearby creature (< 2 degrees):
    If has tools AND energy > 0.3:
      Calculate work rate:
        = base (1%/sec) * strength * intelligence * social_bonus
      Add work to project
      Consume energy
  
  If total work >= 100%:
    Create structure
    Remove project
```

---

## Files Changed

### New Systems:
- `/packages/game/src/systems/ToolSystem.ts` (330 lines)
- `/packages/game/src/systems/StructureBuildingSystem.ts` (350 lines)

### New Renderers:
- `/packages/game/src/renderers/gen3/ToolRenderer.ts` (240 lines)
- `/packages/game/src/renderers/gen3/StructureRenderer.ts` (400 lines)
- `/packages/game/src/renderers/gen3/index.ts` (exports)

### Updated:
- `/packages/game/src/scenes/GameScene.ts`:
  - Added tool and structure system initialization
  - Added update loops for tools and structures
  - Added rendering for tools and structures
  - Added dispose for new renderers
- `/packages/game/src/systems/index.ts`:
  - Exported ToolSystem and StructureBuildingSystem

---

## What's Next

### Immediate Enhancements (Gen3+):
1. **Tool Upgrades**: Better tools (sharper, stronger, longer-lasting)
2. **Structure Upgrades**: Multi-room complexes, workshops
3. **Resource Storage**: Food reserves in structures
4. **Tool Specialization**: Different tool types for different tasks
5. **Repair Mechanics**: Creatures maintain tools/structures

### Future Features (Gen4):
1. **Advanced Tools**: Composite tools (rope, handles, multiple materials)
2. **Complex Structures**: Multi-story buildings, defensive walls
3. **Crafting Stations**: Dedicated workshops for tool creation
4. **Trade**: Tool/resource exchange between packs
5. **Territoriality**: Structures define pack territories

---

## Design Philosophy

Gen3 embodies: **Technology emerges from intelligence + social learning + environment**.

- No scripted "ages" or "eras"
- No predetermined tech trees
- No forced progression
- Everything emerges from:
  - **Intelligence** (smart creatures innovate)
  - **Social structure** (packs share knowledge)
  - **Environment** (archetype-specific tools)
  - **Collaboration** (building requires teamwork)
  - **Time** (degradation forces renewal)

This creates a **living technological ecosystem** where every playthrough develops unique cultural patterns, and players observe authentic technological emergence.

---

## Testing

To see Gen3 features:
1. Launch game
2. Advance to Gen1 (creates creatures)
3. Wait ~30-60 seconds for packs to form
4. Watch for high-intelligence creatures (intelligence > 0.7)
5. Tools appear first (smart creatures create them)
6. Wait for knowledge to spread (yellow rings = teaching)
7. Watch for yellow wireframes (building projects starting)
8. Multiple creatures gather at project site
9. Project completes → permanent structure appears
10. Zoom in to see:
    - Individual tools on ground
    - Creatures teaching (yellow rings)
    - Building progress (wireframe pulsing)
    - Completed structures (detailed 3D models)
    - Occupancy glow (creatures using structures)

**Typical Timeline**:
- t=0s: Gen1 starts, creatures spawn
- t=10s: Packs form
- t=30s: First tool created
- t=60s: Tool knowledge spreading
- t=120s: First building project
- t=300s: First structure completed

---

## Statistics

- **Code added**: ~1,320 lines (4 new files)
- **Systems**: 2 new (ToolSystem, StructureBuildingSystem)
- **Renderers**: 2 new (ToolRenderer, StructureRenderer)
- **Tool types**: 4 (archetype-specific)
- **Structure types**: 4 (archetype-specific)
- **Frame budget**: ~2ms (within limits)
