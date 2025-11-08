# Generation Package

AI content generation, asset management, and universal archetype creation.

## Contents

- **AI Workflows**: Agent-to-agent WARP/WEFT generation system
- **Texture Management**: AmbientCG downloader with 134 textures
- **Archetype Generation**: Universal pools for seedrandom selection  
- **Visual Blueprints**: Complete rendering instruction generation

## Usage

```bash
# Generate universal archetype pools
npx tsx src/cli.ts archetypes

# Check package status  
npx tsx src/cli.ts status
```

## Architecture

- **WARP**: Agent-to-agent knowledge handoff through generations
- **WEFT**: Macro/meso/micro structured generation at each scale
- **Texture Integration**: Real texture catalog for visual blueprints
- **ZOD Validation**: Complete schema validation for all generation

## Generated Assets

- `data/archetypes/gen0-6/` - Universal archetype pools
- `public/textures/` - 134 AmbientCG textures across 8 categories
- `data/manifests/` - JSON configuration for generation workflows