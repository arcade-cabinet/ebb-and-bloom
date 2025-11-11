# Governor UI Design - Daggerfall-Inspired

**Date:** November 11, 2025  
**Status:** Design Specification  
**Inspiration:** Daggerfall's information-dense panels meet Ebb & Bloom's brand identity

---

## Core Principle

**From Daggerfall:** Information-dense, utilitarian, multiple panels visible simultaneously  
**From DESIGN.md:** Rounded corners, Ebb & Bloom color palette, mobile-friendly  
**Result:** Governor control center showing species status, energy budget, available actions, YUKA threats

---

## Daggerfall UI Patterns We're Adapting

### 1. Character Sheet → Species Status Panel
**Daggerfall shows:** Name, Level, Class, Stats, Skills, Attributes  
**Ebb & Bloom shows:** Species Name, Generation, Population, Traits, Genome, Territory

```
┌─────────────────────────────────────┐
│ SPECIES STATUS                      │
├─────────────────────────────────────┤
│ Name: Homo Primalis                │
│ Generation: 5                       │
│ Population: 247 / 300 (capacity)    │
│                                     │
│ TRAITS:                             │
│ • Bipedal Locomotion    [████░] 80% │
│ • Tool Use              [███░░] 60% │
│ • Pack Behavior         [█████] 100%│
│ • Fire Resistance       [██░░░] 40% │
│                                     │
│ GENOME: ATCG-4729-XK3               │
│ TERRITORY: 4.2 km²                  │
└─────────────────────────────────────┘
```

### 2. Inventory → Resource Management Panel
**Daggerfall shows:** Gold, Items, Equipment slots, Weight  
**Ebb & Bloom shows:** Energy Budget, Materials Available, Tools Unlocked, Territory Resources

```
┌─────────────────────────────────────┐
│ GOVERNOR RESOURCES                  │
├─────────────────────────────────────┤
│ ENERGY: [████████░░] 800 / 1000    │
│ Regeneration: +50/generation        │
│                                     │
│ MATERIALS AVAILABLE:                │
│ ✓ SiO2 (Flint)      - Abundant     │
│ ✓ Wood              - Common       │
│ ✗ Iron Ore          - Locked       │
│ ✗ Copper            - Locked       │
│                                     │
│ TOOLS UNLOCKED:                     │
│ [🔪] Flint Knife                    │
│ [🪓] Stone Axe                      │
│ [🔥] Fire Making                    │
└─────────────────────────────────────┘
```

### 3. Spell Book → Governor Powers Panel
**Daggerfall shows:** Spell list, Magicka cost, Effects, Icons  
**Ebb & Bloom shows:** Governor actions, Energy cost, Law constraints, Effects

```
┌─────────────────────────────────────┐
│ GOVERNOR POWERS                     │
├─────────────────────────────────────┤
│ [⚡] SMITE PREDATORS                │
│     Cost: 1000 energy               │
│     Effect: Lightning strike        │
│     Law: Physics (thermodynamics)   │
│     Status: READY                   │
│                                     │
│ [🌱] NURTURE FOOD SUPPLY            │
│     Cost: 500 energy                │
│     Effect: +20% carrying capacity  │
│     Law: Ecology (K-capacity)       │
│     Status: READY                   │
│                                     │
│ [🏔️] SHAPE TERRAIN                  │
│     Cost: 2000 energy               │
│     Effect: Alter landscape         │
│     Law: Geology (plate tectonics)  │
│     Status: INSUFFICIENT ENERGY     │
│                                     │
│ [🔥] APPLY PRESSURE                 │
│     Cost: 750 energy                │
│     Effect: Environmental stress    │
│     Law: Biology (adaptation)       │
│     Status: READY                   │
└─────────────────────────────────────┘
```

### 4. Map → Territory & Competition View
**Daggerfall shows:** Region map, Fast travel, Locations  
**Ebb & Bloom shows:** Territory control, YUKA species positions, Resource distribution

```
┌─────────────────────────────────────┐
│ TERRITORIAL OVERVIEW                │
├─────────────────────────────────────┤
│                                     │
│    [Map visualization]              │
│                                     │
│    ████ Your Species (Homo P.)      │
│    ▓▓▓▓ YUKA Species A (Predator)   │
│    ░░░░ YUKA Species B (Herbivore)  │
│                                     │
│ COMPETITION STATUS:                 │
│ • Species A: HOSTILE (hunting you)  │
│ • Species B: NEUTRAL (coexist)      │
│                                     │
│ RESOURCES:                          │
│ • Food: HIGH (your territory)       │
│ • Water: MEDIUM                     │
│ • Minerals: LOW                     │
└─────────────────────────────────────┘
```

### 5. Quest Log → Evolution History Panel
**Daggerfall shows:** Active quests, Completed quests, Time limits  
**Ebb & Bloom shows:** Generation history, Major adaptations, Extinction events

```
┌─────────────────────────────────────┐
│ EVOLUTION HISTORY                   │
├─────────────────────────────────────┤
│ GENERATION 5:                       │
│ ✓ Developed stone tools             │
│ ✓ Formed pack structure             │
│ ⚠ Predator pressure increased       │
│                                     │
│ GENERATION 4:                       │
│ ✓ Bipedalism emerged                │
│ ✗ Attempted fire use (failed)       │
│                                     │
│ GENERATION 3:                       │
│ ✓ First tool use                    │
│ ✓ Population boom (+150)            │
│                                     │
│ MAJOR MILESTONES:                   │
│ Gen 1: Abiogenesis                  │
│ Gen 3: Tool use                     │
│ Gen 5: Pack behavior                │
│ Goal: Civilization (Gen 10)         │
└─────────────────────────────────────┘
```

---

## Complete Governor HUD Layout

**Daggerfall-style multi-panel interface:**

```
┌──────────────────────────────────────────────────────────────┐
│ Generation: 5        Your Species: Homo Primalis    [⚙️ Menu] │
├──────────────────┬───────────────────────────┬────────────────┤
│                  │                           │                │
│  SPECIES STATUS  │   3D VIEWPORT             │  GOVERNOR      │
│                  │                           │  POWERS        │
│  Name: Homo P.   │   [Camera view of world]  │                │
│  Pop: 247/300    │                           │  [⚡] SMITE     │
│                  │   [Your species visible]  │  1000 energy   │
│  TRAITS:         │   [YUKA species visible]  │  READY         │
│  • Bipedal 80%   │                           │                │
│  • Tools 60%     │   [Environment]           │  [🌱] NURTURE  │
│  • Packs 100%    │                           │  500 energy    │
│                  │                           │  READY         │
├──────────────────┤                           │                │
│  RESOURCES       │                           │  [🏔️] SHAPE    │
│                  │                           │  2000 energy   │
│  ENERGY:         │                           │  LOCKED        │
│  [████░] 800     │                           │                │
│                  │                           ├────────────────┤
│  MATERIALS:      │                           │  COMPETITION   │
│  ✓ SiO2          │                           │                │
│  ✓ Wood          │                           │  Species A:    │
│  ✗ Iron          │                           │  HOSTILE       │
│                  │                           │  [Threat: High]│
│  TOOLS:          │                           │                │
│  🔪 🪓 🔥         │                           │  Species B:    │
│                  │                           │  NEUTRAL       │
├──────────────────┴───────────────────────────┴────────────────┤
│  EVOLUTION HISTORY                                            │
│  Gen 5: ✓ Stone tools  ✓ Pack structure  ⚠ Predator pressure │
└──────────────────────────────────────────────────────────────┘
```

---

## DESIGN.md Integration

### Color Mapping

**Panel Backgrounds:**
- Main panels: Ebb Indigo (#4A5568) with 90% opacity
- Active panel: Ebb Indigo 100% + Trait Gold border (#D69E2E)
- Disabled actions: Echo Silver (#A0AEC0)

**Action Buttons:**
- Smite (destructive): Warning Orange (#ED8936)
- Nurture (growth): Success Green (#48BB78)
- Shape (neutral): Haptic Blue (#3182CE)
- Pressure (challenge): Pollution Red (#E53E3E)

**Status Indicators:**
- Ready: Bloom Emerald (#38A169)
- Locked: Echo Silver (#A0AEC0)
- Danger: Pollution Red (#E53E3E)
- Progress bars: Trait Gold (#D69E2E)

### Typography

```typescript
// DESIGN.md fonts
Panel Headers: Playfair Display, 18px, bold
Body Text: Inter, 14px, regular
Data/Numbers: JetBrains Mono, 14px, regular
Button Labels: Inter, 16px, semibold
```

---

## Mobile Adaptation

**Daggerfall = Desktop focus (mouse, keyboard)**  
**Ebb & Bloom = Mobile-first (touch, swipe)**

### Collapsible Panels
```
Desktop: All panels visible
Mobile: Tab-based navigation

[Species] [Powers] [Resources] [History]
   ↓ (tap to expand)
Currently showing: POWERS panel
```

### Touch Targets
```
Daggerfall: 16px buttons (mouse precision)
Ebb & Bloom: 44px minimum (finger touch)

Power buttons: 60px height
Panel headers: 48px height (collapsible)
```

### Gesture Support
```
- Swipe left/right: Switch panels
- Long-press power: See details
- Tap-hold on map: Select position for smite/nurture
- Pinch on species list: Zoom to creature view
```

---

## Visual Assets to Generate

### Icons (32x32px, transparent PNG)
1. ⚡ Lightning bolt (smite power) - Warning Orange glow
2. 🌱 Growing plant (nurture power) - Success Green leaves
3. 🏔️ Mountain/terrain (shape power) - Haptic Blue stone
4. 🔥 Pressure wave (pressure power) - Pollution Red aura
5. 🔪 Flint knife icon
6. 🪓 Stone axe icon
7. 🔥 Fire icon
8. ⚙️ Settings gear

### Panel Decorations
1. Ornate frame for governor powers panel (Trait Gold)
2. Energy bar container with decorative ends
3. Species status header decoration
4. Evolution timeline scroll background

### Splash Screen
1. Primordial soup → Civilization progression
   - Ebb Indigo dark background
   - Bloom Emerald highlights for life forms
   - Atmospheric glow effect
   - "Ebb & Bloom" title in Playfair Display

---

## Implementation with Material-UI

```typescript
import { Card, Typography, Button, LinearProgress, Chip, Grid } from '@mui/material';

const GovernorPowerPanel = () => (
  <Card sx={{
    background: '#4A5568',  // Ebb Indigo
    borderRadius: '12px',
    padding: '16px',
    minWidth: '300px',
  }}>
    <Typography variant="h6" sx={{ 
      fontFamily: 'Playfair Display',
      color: '#F7FAFC',
      marginBottom: '16px'
    }}>
      Governor Powers
    </Typography>
    
    {/* Energy Budget */}
    <Box sx={{ marginBottom: '16px' }}>
      <Typography variant="body2" sx={{ fontFamily: 'Inter', color: '#A0AEC0' }}>
        ENERGY
      </Typography>
      <LinearProgress 
        variant="determinate" 
        value={80}
        sx={{
          height: '10px',
          borderRadius: '5px',
          backgroundColor: '#2D3748',
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#D69E2E'  // Trait Gold
          }
        }}
      />
      <Typography variant="caption" sx={{ fontFamily: 'JetBrains Mono' }}>
        800 / 1000
      </Typography>
    </Box>
    
    {/* Action Buttons */}
    <Button
      fullWidth
      startIcon={<LightningIcon />}
      sx={{
        background: '#ED8936',  // Warning Orange
        color: '#F7FAFC',
        marginBottom: '8px',
        padding: '12px',
        borderRadius: '8px',
        justifyContent: 'space-between',
        '&:hover': { background: '#DD6B20' }
      }}
    >
      <span>Smite Predators</span>
      <Chip label="-1000" size="small" sx={{ background: '#C05621' }} />
    </Button>
    
    <Button
      fullWidth
      startIcon={<PlantIcon />}
      sx={{
        background: '#48BB78',  // Success Green
        color: '#F7FAFC',
        marginBottom: '8px',
        padding: '12px',
        borderRadius: '8px',
        justifyContent: 'space-between',
        '&:hover': { background: '#38A169' }
      }}
    >
      <span>Nurture Food</span>
      <Chip label="-500" size="small" sx={{ background: '#2F855A' }} />
    </Button>
    
    <Button
      fullWidth
      startIcon={<TerrainIcon />}
      disabled
      sx={{
        background: '#A0AEC0',  // Echo Silver (disabled)
        color: '#F7FAFC',
        padding: '12px',
        borderRadius: '8px',
        justifyContent: 'space-between',
      }}
    >
      <span>Shape Terrain</span>
      <Chip label="-2000" size="small" sx={{ background: '#718096' }} />
    </Button>
  </Card>
);
```

---

## Key Differences from Daggerfall

| Daggerfall (1996) | Ebb & Bloom (2025) |
|-------------------|-------------------|
| Desktop mouse/keyboard | Mobile touch-first |
| Static panels | Collapsible tabs |
| Medieval theme | Primordial evolution |
| Character stats | Species traits |
| Spell book | Governor powers |
| Quest log | Evolution history |
| Flat colors | Rounded, shadowed |
| 640x480 resolution | Responsive (mobile to 4K) |

**We keep:** Information density, multi-panel layout, utilitarian focus  
**We modernize:** Touch controls, responsive design, brand colors

---

**This is how we present governor information - Daggerfall's proven UI architecture with Ebb & Bloom's primordial aesthetic.**
