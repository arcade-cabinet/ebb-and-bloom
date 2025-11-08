# Copilot Development Setup

This document guides Copilot on how to develop the frontend simulation package.

## Current State

- ✅ Basic React + Vite + React Three Fiber setup
- ✅ Backend API running at `http://localhost:3001`
- ✅ Visual blueprints available from `packages/gen/data/archetypes/`
- ⏳ Gen0 planet rendering (YOUR FIRST TASK)

## Your First Task: Gen0 Planet Rendering

### Goal
Render a 3D planetary sphere using Gen0 visual blueprints with:
- PBR materials from `visualProperties.pbr`
- AmbientCG textures from `textureReferences`
- Color palettes from `visualProperties.colorPalette`
- Procedural rules for surface variation

### Steps

1. **Fetch Gen0 Data**
   ```typescript
   // Use useGameState hook to fetch planet data
   const { planet, visualBlueprints } = useGameState(gameId);
   ```

2. **Create Planet Component**
   ```typescript
   // src/components/Gen0Planet.tsx
   // Use React Three Fiber to create sphere
   // Apply PBR materials from visualBlueprints
   // Map texture IDs to actual texture files
   ```

3. **Texture Loading**
   - Texture IDs are in `textureReferences` array (e.g., "Metal049A")
   - Load from `packages/gen/public/textures/{id}_1K_Color.jpg`
   - Use `useTexture` from `@react-three/drei`

4. **PBR Material Setup**
   - Use `MeshStandardMaterial` or `MeshPhysicalMaterial`
   - Apply properties from `visualProperties.pbr`:
     - `metallic`
     - `roughness`
     - `emissive`
     - `normalScale`
     - etc.

5. **Color Palette Application**
   - Use `visualProperties.colorPalette` for base colors
   - Apply procedural rules for variation

### Example Structure

```typescript
// src/components/Gen0Planet.tsx
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { MeshStandardMaterial } from 'three';

export function Gen0Planet({ planet, visualBlueprint }) {
  // Load textures
  const textures = visualBlueprint.textureReferences.map(id => 
    useTexture(`/textures/${id}_1K_Color.jpg`)
  );
  
  // Create PBR material
  const material = new MeshStandardMaterial({
    metalness: visualBlueprint.visualProperties.pbr.metallic,
    roughness: visualBlueprint.visualProperties.pbr.roughness,
    map: textures[0], // Primary texture
    // ... other PBR properties
  });
  
  return (
    <mesh material={material}>
      <sphereGeometry args={[planet.radius / 1000, 64, 64]} />
    </mesh>
  );
}
```

## Testing with Playwright

1. **Install Playwright**
   ```bash
   pnpm add -D @playwright/test
   ```

2. **Create Playwright Config**
   ```typescript
   // playwright.config.ts
   import { defineConfig } from '@playwright/test';
   
   export default defineConfig({
     testDir: './tests',
     use: {
       baseURL: 'http://localhost:5173',
     },
   });
   ```

3. **Write Visual Tests**
   ```typescript
   // tests/gen0-planet.spec.ts
   import { test, expect } from '@playwright/test';
   
   test('Gen0 planet renders correctly', async ({ page }) => {
     await page.goto('/');
     await expect(page.locator('canvas')).toBeVisible();
     await expect(page).toHaveScreenshot('gen0-planet.png');
   });
   ```

## File Structure

```
packages/simulation/
├── src/
│   ├── App.tsx                 # Main app (connect to backend)
│   ├── components/
│   │   ├── Gen0Planet.tsx     # YOUR FIRST COMPONENT
│   │   ├── Gen1Creatures.tsx  # Next
│   │   └── ...
│   ├── hooks/
│   │   └── useGameState.ts    # Backend API hook
│   └── utils/
│       └── textureLoader.ts   # Texture ID → file path mapping
├── tests/
│   └── gen0-planet.spec.ts    # Playwright tests
└── playwright.config.ts        # Playwright config
```

## Key Resources

- **Visual Blueprints**: `packages/gen/data/archetypes/gen0/`
- **Texture Manifest**: `packages/gen/public/textures/manifest.json`
- **Backend API**: `packages/backend/src/server.ts`
- **React Three Fiber Docs**: https://docs.pmnd.rs/react-three-fiber
- **Drei Hooks**: https://github.com/pmndrs/drei

## Development Workflow

1. Start backend: `cd packages/backend && pnpm dev`
2. Start frontend: `cd packages/simulation && pnpm dev`
3. Open browser: `http://localhost:5173`
4. Use Playwright MCP for visual testing

## Next Steps After Gen0

1. Gen1: Creature visualization
2. Gen2: Pack formations
3. Gen3: Tool rendering
4. Gen4-Gen6: Abstract systems

Each generation builds on the previous, using WARP/WEFT data flow.

