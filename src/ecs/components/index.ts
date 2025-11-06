/**
 * ECS Components - Data definitions
 * Pure data containers for entity properties
 */

import { defineComponent, Types } from 'bitecs';

// Position in world space
export const Position = defineComponent({
  x: Types.f32,
  y: Types.f32
});

// Velocity for movement
export const Velocity = defineComponent({
  x: Types.f32,
  y: Types.f32
});

// Player traits (Evo Points allocation)
export const Traits = defineComponent({
  flipper: Types.ui8,  // Flipper Feet level (0-3)
  chainsaw: Types.ui8  // Chainsaw Hands level (0-3)
});

// Resource inventory
export const Inventory = defineComponent({
  ore: Types.ui16,
  water: Types.ui16,
  alloy: Types.ui16
});

// Visual sprite data
export const Sprite = defineComponent({
  textureId: Types.ui8,  // Which sprite texture
  flipX: Types.ui8       // Horizontal flip
});

// Trail effect data
export const Trail = defineComponent({
  active: Types.ui8,
  maxLength: Types.ui8
});

// Player tag (for queries)
export const Player = defineComponent({
  isPlayer: Types.ui8
});

// Tile data (for world tiles)
export const Tile = defineComponent({
  type: Types.ui8,      // 0=water, 1=grass, 2=flower, 3=ore
  biomeValue: Types.f32 // Perlin noise value
});
