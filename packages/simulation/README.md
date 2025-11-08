# Simulation Frontend Package

**Purpose**: React Three Fiber rendering of Gen0-Gen6 visual blueprints  
**Status**: Scaffolded for Copilot development  
**Priority**: Gen0 visual blueprints first, then Gen1-Gen6

## Architecture

This package renders the AI-generated visual blueprints from `packages/gen` using React Three Fiber. It connects to the backend API at `http://localhost:3001` to fetch game state and visual blueprints.

## Development Setup

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
```

## Current Status

- ✅ Basic React + Vite setup
- ✅ React Three Fiber installed
- ⏳ Gen0 planet rendering (NEXT)
- ⏳ Gen1 creature visualization
- ⏳ Gen2-Gen6 rendering

## Copilot Development Notes

### Priority Order (from docs/VISUAL_BLUEPRINT_PRIORITIZATION.md)

1. **Gen0**: Planetary sphere with PBR materials, textures, color palettes
2. **Gen1**: Creature visualization with traits
3. **Gen2**: Pack formations and flocking
4. **Gen3**: Tool rendering
5. **Gen4**: Tribe territories
6. **Gen5**: Building structures
7. **Gen6**: Abstract systems visualization

### Key Files

- `src/App.tsx` - Main application entry
- `src/components/` - React Three Fiber components
- `src/hooks/` - Custom hooks for backend API

### Backend API

- `GET /api/game/:gameId` - Get game state
- `GET /api/game/:gameId/planet` - Get planet data with visual blueprints
- `GET /api/game/:gameId/gen0` - Get Gen0 data
- `GET /api/game/:gameId/gen1` - Get Gen1 creatures
- etc.

### Visual Blueprint Structure

Visual blueprints come from `packages/gen/data/archetypes/` and include:
- `textureReferences`: Array of AmbientCG texture IDs (e.g., "Metal049A")
- `visualProperties.pbr`: PBR material properties
- `visualProperties.colorPalette`: Color schemes
- `visualProperties.proceduralRules`: Procedural generation hints

### Texture Manifest

Textures are managed via `packages/gen/public/textures/manifest.json`. Use texture IDs directly, not file paths.

## Testing with Playwright MCP

Copilot can use Playwright MCP server for:
- Visual regression testing
- Snapshot comparisons
- E2E testing of rendering pipeline

See `playwright.config.ts` (to be created) for Playwright setup.

