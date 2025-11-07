# Ebb & Bloom - Design

**Version**: 2.0  
**Last Updated**: 2025-01-09

---

## Vision

Procedural evolution game where consciousness flows through living forms in an ever-changing ecosystem.

**Tagline**: "Shape Worlds. Traits Echo. Legacy Endures."

**Core Mechanic**: Touch shapes evolutionary destiny. Every action creates pressure that Yuka AI spheres respond to organically.

---

## Player Experience

### Touch as Language
- **Tap**: Observe creature (see traits)
- **Long-press**: Influence evolution (allocate Evo Points)
- **Swipe**: Navigate camera
- **Pinch**: Zoom

### Core Loop
1. Observe ecosystem evolving
2. Select creatures to inspect
3. Influence evolution with Evo Points
4. Watch tools/buildings emerge organically
5. Discover knowledge/culture systems

### Emergent Progression
- **Gen 1-2**: Basic creatures, simple traits
- **Gen 3-5**: Tools emerge, materials unlock
- **Gen 5-10**: Social complexity, RECORDER tools enable culture
- **Gen 10+**: Buildings, governance, religion, civilization

---

## Brand Identity

### Color Palette

**Primary**:
- **Ebb Indigo** (#4A5568) - Backgrounds, cards
- **Bloom Emerald** (#38A169) - Growth, success, primary actions
- **Trait Gold** (#D69E2E) - Highlights, evolution, discovery
- **Echo Silver** (#A0AEC0) - Text, secondary UI

**Environmental**:
- **Pollution Red** (#E53E3E) - Warnings, pressure
- **Mutation Purple** (#805AD5) - Genetic synthesis

**Interaction**:
- **Haptic Blue** (#3182CE) - Touch feedback
- **Success Green** (#48BB78) - Positive evolution
- **Warning Orange** (#ED8936) - Environmental alerts

### Typography

- **Playfair Display**: Titles, haikus, poetic text
- **Inter**: UI text, buttons, body copy
- **JetBrains Mono**: Numbers, data, technical info

### Voice

- **Poetic** for haikus and atmosphere
- **Technical** for data and systems
- **Playful** for onboarding
- **Evolutionary language**: "Trait emergence" not "mutation", "Ancestral echoes" not "inheritance"

---

## UI/UX Principles

### Information Hierarchy
1. **Evolution events** (highest priority) - Animated, haptic feedback
2. **Creature display** (primary) - Real-time morphological changes
3. **Environmental context** (supporting) - Pollution, materials, packs
4. **System information** (background) - Generation counter, data

### Progressive Disclosure
- Early game: Simple panels (generation, events)
- Mid game: Advanced panels (creature details, influence)
- Late game: Complex systems (world map, discoveries, governance)

### Cross-Platform (Mobile-Aware)
- Touch targets: 44px minimum (mobile), mouse-friendly (desktop)
- Haptic feedback: Mobile only, visual feedback for all platforms
- Responsive: Adapts to screen size (mobile/tablet/desktop)
- Input: Touch (mobile), mouse/keyboard (desktop)
- Platform: Capacitor (web, Android, iOS, desktop)

---

## Player Journey

```
Seed Input (3 words)
  ↓
Gen 0: Planetary genesis (loading screen)
  ↓
Splash Screen (2-3 seconds, random variant)
  ↓
Main Menu (Start New / Continue / Settings / Credits)
  ↓
Onboarding (4 steps: Welcome, Touch, Evolution, Catalyst)
  ↓
Catalyst Creator (Allocate 10 Evo Points)
  ↓
Game Scene (3D ecosystem)
  ↓
Gen 1: Archetypes spawn near Primordial Wells
  ↓
Gen 2+: Yuka evolution begins
  ↓
Player observes, influences, discovers
```

---

## UI Components

### HUD (Always Visible)
- Generation Display (top-right)
- Environmental Status (bottom-right)
- Mobile Controls (bottom, mobile only)

### Event-Driven
- Evolution Event Feed (top-left, when events occur)
- Particle Effects (synchronized with events)
- Narrative Haiku (center, significant events)

### Interaction-Driven
- Creature Display (bottom-left, when selected)
- Trait Influence Panel (center, when influencing)
- Journal (full-screen, when opened)

### System-Driven
- Pack Dynamics (when packs form)
- Tool Evolution notifications (when tools emerge)
- Building Construction (when structures appear)

### Progressive
- **World Map** (when > 5 chunks discovered)
  - Simple list (< 5 chunks): Location cards, fast travel buttons
  - Mercator projection (5-20 chunks): 2D map, clickable regions
  - Globe view (20+ chunks): Rotatable 3D globe, terrain projection
- **Discoveries** (when RECORDER tools emerge)
  - Categories: Tools, Governance, Religion, Information
  - Discovery tree showing dependencies
  - Links to related haikus
- **Consciousness Transfer** (always available)
  - Possess any creature
  - Release to Yuka (auto mode)
  - Current host indicator

---

## Visual Style

### Daggerfall + Spore Synthesis

**From Daggerfall**:
- Information-dense panels
- Functional, utilitarian design
- Multiple panels visible
- Rich data displays

**From Spore**:
- Rounded corners, soft shadows
- Vibrant colors
- Clean typography
- Smooth animations

**Ebb & Bloom Addition**:
- Mobile-first responsive
- Touch-optimized
- Collapsible panels
- Brand colors throughout

---

## Interaction Design

### Gestures
- **Tap**: Observe, focus
- **Long-press**: Deep inspection, influence
- **Swipe**: Navigate, dismiss
- **Pinch**: Zoom
- **Drag**: Move, transfer (advanced)

### Haptic Language
- **Trait Emergence**: Rising pulse (soft → strong)
- **Pack Formation**: Synchronized harmony
- **Environmental Shock**: Sharp impact + decay
- **Discovery**: Gentle tap
- **Crisis**: Urgent heartbeat

---

## Target Audience

Gamers (25-45) seeking meditative, discovery-focused experiences across platforms.

**Sessions**: 10-60 minutes  
**Platforms**: Web, Android, iOS, Desktop (via Capacitor)  
**Target**: 60 FPS on mid-range devices  
**Distribution**: Web (GitHub Pages), Google Play Store, App Store

---

## UIKit Integration

### Why UIKit

**@react-three/uikit** renders UI INSIDE the Canvas as 3D elements, not DOM overlays.

**Benefits**:
- 3D-aware positioning
- Mobile-optimized touch
- Performance-optimized
- Pre-styled components
- Easy theming

### Core Components

**From @react-three/uikit**:
- `Fullscreen` - Full-screen container for HUD
- `Container` - Flexbox layout container
- `Text` - MSDF font rendering
- `Image` - Image component
- `Portal` - Render 3D in UI panels

**From @react-three/uikit-default**:
- `Card`, `CardHeader`, `CardTitle`, `CardContent` - Panel containers
- `Button` - Interactive buttons
- `Progress` - Progress bars
- `Input`, `Textarea` - Text input
- `Slider` - Range sliders
- `Dialog` - Modal dialogs

### Responsive Design

**Breakpoints** (based on root width):
- `sm` - 640px
- `md` - 768px
- `lg` - 1024px
- `xl` - 1280px
- `2xl` - 1536px

**Usage**:
```tsx
<Container
  flexDirection="column"        // Mobile: stacked
  md={{ flexDirection: "row" }} // Tablet+: side-by-side
  lg={{ gap: 24 }}              // Desktop: larger gap
>
```

### Styling

**Props-based, NOT CSS**:
```tsx
<Container
  backgroundColor={0x1a202c}  // Hex colors
  padding={16}                // Pixels
  borderRadius={8}            // Pixels
  gap={12}                    // Flexbox gap
  opacity={0.9}               // 0-1
>
```

**Conditional states**:
```tsx
<Button
  hover={{ backgroundColor: 0x38A169 }}
  active={{ opacity: 0.8 }}
  dark={{ backgroundColor: 0x2d3748 }}
>
```

### Typography

**Custom fonts via MSDF**:
- Convert TTF → MSDF using `msdf-bmfont-xml`
- Load via `fontFamilies` prop
- Use `fontFamily`, `fontSize`, `fontWeight` props

**Default**: Inter font provided by uikit-default

### Positioning

**Absolute positioning**:
```tsx
<Card
  positionType="absolute"
  positionTop={20}
  positionRight={20}
  width={280}
>
```

**Centering**:
```tsx
<Card
  positionType="absolute"
  positionLeft="50%"
  positionTop="50%"
  transformTranslateX="-50%"
  transformTranslateY="-50%"
>
```

### HUD Pattern

```tsx
<Canvas>
  {/* 3D Scene */}
  <mesh />
  
  {/* UI Layer */}
  <Defaults>
    <Fullscreen distanceToCamera={100}>
      {/* All UI components here */}
      <Card positionType="absolute" positionTop={20} positionRight={20}>
        {/* Generation Display */}
      </Card>
    </Fullscreen>
  </Defaults>
</Canvas>
```

---

**All design specifications are in this document.**


