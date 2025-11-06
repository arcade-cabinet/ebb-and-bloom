# Ebb & Bloom - Project Brief

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


