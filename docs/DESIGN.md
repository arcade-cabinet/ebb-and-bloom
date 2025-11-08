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

## BabylonJS GUI Integration

### Why BabylonJS GUI

**BabylonJS GUI** provides unified 3D rendering + UI system, rendering UI INSIDE the Canvas as 3D elements, not DOM overlays.

**Benefits**:
- Unified architecture (3D + UI in one library)
- Built-in raycasting for 3D interaction
- Procedural generation tools
- Mature, production-ready GUI system
- Better performance for complex 3D scenes
- Mobile-optimized touch support

### Core Components

**From @babylonjs/gui**:
- `AdvancedDynamicTexture` - Full-screen GUI container
- `Rectangle` - Panels, containers with styling
- `Button` - Interactive buttons with text
- `TextBlock` - Text rendering with proper fonts
- `Control` - Base class for all UI elements

**Styling Capabilities**:
- `background` - Colors (rgba, hex)
- `color` - Border/text colors
- `cornerRadius` - Rounded corners
- `thickness` - Border width
- `opacity` - Transparency
- `fontFamily`, `fontSize` - Typography (uses CSS fonts)

### Example Usage

```typescript
// Create fullscreen GUI
const guiTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI', true, scene);

// Panel with styling
const panel = new Rectangle('mainPanel');
panel.width = 0.6;
panel.height = 0.8;
panel.cornerRadius = 20;
panel.background = 'rgba(26, 32, 44, 0.9)'; // Deep background with transparency
panel.color = '#4A5568'; // Ebb indigo border
panel.thickness = 2;

// Button with text
const button = Button.CreateSimpleButton('observeButton', 'Observe');
button.width = '240px';
button.height = '60px';
button.background = '#38A169'; // Bloom emerald
button.color = '#F7FAFC'; // Text color
button.fontSize = 18;
button.fontFamily = 'Inter, sans-serif';
button.cornerRadius = 10;

// Text with typography
const title = new TextBlock('title', 'Ebb & Bloom');
title.fontSize = 48;
title.fontFamily = 'Lora, serif';
title.color = '#F7FAFC';
```

### Typography

**Uses CSS fonts** (loaded via `fonts.css`):
- `Lora` - Serif for titles, haikus
- `Inter` - Sans-serif for UI text
- `JetBrains Mono` - Monospace for data/technical

**No MSDF conversion needed** - BabylonJS GUI uses standard web fonts.

---

## UI Asset Generation Strategy

### Principle: Only Generate What Can't Be Rendered

**BabylonJS GUI can handle**:
- ✅ Panels/containers (Rectangle with styling)
- ✅ Buttons with text (Button.CreateSimpleButton)
- ✅ Text rendering (TextBlock with fonts)
- ✅ Basic shapes, colors, gradients
- ✅ Transparency, borders, rounded corners

**We only generate images for**:
- 🎨 **Iconography** - Trait icons, seed/DNA icons, creature/tool icons (symbolic, needs artistic interpretation)
- 🎨 **Stylized HUD Elements** - Scroll/parchment decorative elements (organic texture, can't be CSS'd)
- 🎨 **Ornate Frames** - Decorative borders for panels (artistic detail)
- 🎨 **Textured Backgrounds** - Artistic textures (not simple CSS gradients)
- 🎨 **Splash Screens** - Artistic scenes with atmosphere

### Asset Categories

1. **splash** - Artistic splash screens (1 asset)
2. **icon** - Iconography (trait icons, seed icons, etc.)
3. **hud** - Stylized HUD decorative elements (scrolls, parchment)
4. **frame** - Ornate decorative frames
5. **banner** - Textured artistic banners
6. **background** - Textured backgrounds

### Benefits

- **Performance** - Fewer images to load, faster rendering
- **Maintainability** - Dynamic styling, responsive, theme-switchable
- **Flexibility** - Text is selectable, scalable, localizable
- **Accessibility** - Screen-reader friendly, proper semantic structure

### Format

All UI assets use **WebP** format:
- 25-35% better compression than PNG
- Supports transparency (unlike JPEG)
- Better quality than JPEG at same file size
- Widely supported in modern browsers

---

**All design specifications are in this document.**


