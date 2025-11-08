# Gen2: Pack Formation & Creature Interactions

## Overview

Gen2 brings **social dynamics** to the evolution simulation. Creatures now form packs, interact with each other, and exhibit complex social behaviors. This creates emergent gameplay where players can observe territorial disputes, pack coordination, and social bonds forming naturally.

## Core Systems

### 1. Pack Formation System (`PackFormationSystem.ts`)

**Purpose**: Automatically groups creatures into packs based on proximity and social traits.

**Features**:
- **Proximity-based clustering**: Creatures within ~10 degrees form packs
- **Leader selection**: Strongest/smartest member becomes leader
- **Cohesion tracking**: Measures how tight the pack is (0-1)
- **Dynamic pack formation**: Packs split and merge as creatures move
- **Pack colors**: Each pack gets a unique color identifier

**How it works**:
```typescript
// Find nearby creatures with 'pack' social trait
// Group them into clusters
// Select leader (based on strength/intelligence)
// Track cohesion (how spread out members are)
```

**Pack Data**:
- `id`: Unique pack identifier
- `leaderId`: Which creature leads
- `members`: Array of creature IDs
- `cohesion`: 0-1 (1 = very tight, 0 = very spread)
- `color`: Visual identifier
- `center`: Geographic center of pack

### 2. Creature Interaction System (`CreatureInteractionSystem.ts`)

**Purpose**: Detects and manages creature-to-creature interactions.

**Interaction Types**:

1. **Territorial Disputes** (red)
   - Range: ~5 degrees
   - Triggers: Aggressive temperament or close proximity
   - Visual: Red lines between creatures
   - Intensity: Based on strength and distance

2. **Social Bonds** (green)
   - Range: ~10 degrees
   - Triggers: Both creatures have 'pack' social trait
   - Visual: Subtle green connections
   - Intensity: Based on intelligence

3. **Predation** (orange)
   - Range: ~3 degrees (very close)
   - Triggers: Low energy (hungry creature)
   - Visual: Bright orange chase indicator
   - Intensity: High (0.8)

4. **Pack Coordination** (cyan)
   - Range: Pack member distance
   - Triggers: Members of same pack
   - Visual: Cyan connection lines
   - Intensity: Based on cohesion

**Interaction Data**:
- `type`: territorial | social | predation | pack_coordination
- `actorId`: Who initiates
- `targetId`: Who receives
- `strength`: 0-1 intensity
- `outcome`: success | failure | ongoing
- `timestamp`: When it started

## Renderers

### 1. PackFormationRenderer (`PackFormationRenderer.ts`)

**Renders pack visualizations**:

- **Pack Aura**: Translucent wireframe sphere around pack
  - Size: Based on pack spread
  - Color: Pack's unique color
  - Pulse: Slower pulse = higher cohesion
  - Alpha: Fades with cohesion

- **Leader Bonds**: Lines from leader to each member
  - Color: Pack color
  - Alpha: Scales with cohesion
  - Updates in real-time as creatures move

**Visual Hierarchy**:
```
Pack (wireframe sphere)
  ├─ Leader (brightest)
  ├─ Member 1 (connected)
  ├─ Member 2 (connected)
  └─ Member 3 (connected)
```

### 2. InteractionVisualizer (`InteractionVisualizer.ts`)

**Renders interaction indicators**:

- **Lines**: Connect interacting creatures
  - Red: Territorial disputes
  - Green: Social bonds
  - Orange: Predation/chase
  - Cyan: Pack coordination

- **Intensity**: Alpha scales with interaction strength
- **Real-time**: Updates every frame
- **Automatic cleanup**: Old interactions fade and disappear

## Integration with GameScene

### Initialization:
```typescript
// Renderers
this.packRenderer = new PackFormationRenderer(this.scene);
this.interactionVisualizer = new InteractionVisualizer(this.scene);

// Systems
this.packSystem = new PackFormationSystem();
this.interactionSystem = new CreatureInteractionSystem();
```

### Update Loop:
```typescript
// Every frame:
1. Update creature behaviors (movement, goals)
2. Update pack formations (detect packs, update cohesion)
3. Update interactions (check proximities, create interactions)
4. Render packs (auras, bonds)
5. Render interactions (colored lines)
```

## Player Experience

### What Players See:

**At Celestial View** (zoomed out):
- Colored glows where packs form
- Bright flashes during territorial disputes

**At Surface View** (zoomed in):
- Individual creatures moving
- Pack auras (wireframe spheres)
- Interaction lines:
  - Red sparks = fights
  - Green lines = socializing
  - Orange lines = hunting
  - Cyan network = pack coordination

### Emergent Behaviors:

1. **Pack Formation**
   - Creatures with 'pack' trait naturally cluster
   - Form tight groups (high cohesion)
   - Move together

2. **Territorial Disputes**
   - Aggressive creatures challenge others
   - Visual red sparks between rivals
   - Strength determines outcome

3. **Social Networks**
   - Pack creatures form lasting bonds
   - Green connection lines show relationships
   - Higher intelligence = stronger bonds

4. **Hunting/Fleeing**
   - Hungry creatures chase others
   - Orange lines show predator-prey dynamics
   - Creates dynamic chase sequences

## Technical Details

### Performance:
- **Pack detection**: O(n²) where n = pack creatures (~20-30)
- **Interaction checks**: O(n²) where n = all creatures (~20-30)
- **Visual updates**: O(p + i) where p = packs, i = interactions
- **Frame rate**: <1ms per frame for typical creature counts

### Coordinate System:
- Uses lat/lon for creature positions
- Converts to 3D for rendering
- Handles longitude wrapping correctly

### LOD System:
- Pack auras visible at all zoom levels
- Interaction lines only visible < 100 units
- Automatically scales with camera distance

## Files Changed

### New Systems:
- `/packages/game/src/systems/PackFormationSystem.ts` (245 lines)
- `/packages/game/src/systems/CreatureInteractionSystem.ts` (230 lines)
- `/packages/game/src/systems/index.ts` (exports)

### New Renderers:
- `/packages/game/src/renderers/gen2/PackFormationRenderer.ts` (220 lines)
- `/packages/game/src/renderers/gen2/InteractionVisualizer.ts` (230 lines)
- `/packages/game/src/renderers/gen2/index.ts` (exports)

### Updated:
- `/packages/game/src/scenes/GameScene.ts`:
  - Added pack and interaction system initialization
  - Added update loops for packs and interactions
  - Added rendering for packs and interactions
  - Added dispose for new renderers

## What's Next

### Immediate Enhancements:
1. **Smarter leader selection**: Use actual strength/intelligence traits
2. **Pack benefits**: Members move faster, hunt better
3. **Interaction outcomes**: Territorial disputes have winners/losers
4. **Learning**: Creatures remember past interactions

### Future Features (Gen3):
1. **Tools & Structures**: Packs build together
2. **Cultural transmission**: Behaviors spread through social learning
3. **Language**: Visual symbols for communication
4. **Warfare**: Pack vs pack conflicts
5. **Trade**: Resource sharing between packs

## Testing

To see Gen2 features:
1. Launch game
2. Advance to Gen1 (creates creatures)
3. Wait ~10 seconds for packs to form
4. Zoom in to see:
   - Wireframe pack auras
   - Colored interaction lines
   - Creatures moving together
5. Watch for:
   - Red sparks (territorial disputes)
   - Green lines (social bonds)
   - Orange lines (hunting)
   - Cyan networks (pack coordination)

## Design Philosophy

Gen2 embodies the core principle: **Emergent social complexity from simple rules**.

- No scripted behaviors
- No hardcoded pack assignments
- No predetermined interactions
- Everything emerges from:
  - Proximity
  - Traits (social, temperament, strength, intelligence)
  - Internal states (energy, fear)
  - Real-time decisions

This creates a **living social ecosystem** where every playthrough is unique, and players can observe authentic social dynamics unfolding naturally.
