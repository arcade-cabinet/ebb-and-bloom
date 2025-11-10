/**
 * Gen0 Renderer - Main Entry Point
 *
 * Coordinates macro (planet) + meso (moons) + micro (layers) rendering
 * Interprets WARP/WEFT archetype data from backend Protobuf
 */

export { PlanetRenderer } from './PlanetRenderer';
export { MoonRenderer } from './MoonRenderer';
export type { Gen0RenderData } from './PlanetRenderer';
export type { MoonData } from './MoonRenderer';

// TODO: Add LayerRenderer for micro level (hydrosphere, atmosphere, crust visualization)
