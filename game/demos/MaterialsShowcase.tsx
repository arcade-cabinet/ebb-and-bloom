import { Box, Paper, Stack, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { OrbitControls, Html } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';
import { SDFPrimitive } from '../../engine/rendering/sdf/types';
import { SDFRenderer } from '../../engine/rendering/sdf/renderer/SDFRenderer';
import { materialRegistry } from '../../engine/rendering/sdf/MaterialRegistry';

const ELEMENT_SYMBOLS = [
  'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
  'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca',
  'Fe', 'Cu', 'Zn', 'Ag', 'Au', 'Pt'
];

const BIOME_DATA = [
  { id: 'tundra', name: 'Tundra', color: [0.6, 0.73, 0.6] },
  { id: 'taiga', name: 'Taiga', color: [0.2, 0.4, 0.2] },
  { id: 'temperateRainforest', name: 'Temperate Rainforest', color: [0.07, 0.33, 0.07] },
  { id: 'temperateDeciduousForest', name: 'Temperate Forest', color: [0.13, 0.53, 0.13] },
  { id: 'temperateGrassland', name: 'Grassland', color: [0.27, 0.87, 0.27] },
  { id: 'woodland', name: 'Woodland', color: [0.4, 0.6, 0.3] },
  { id: 'tropicalRainforest', name: 'Tropical Rainforest', color: [0.07, 0.33, 0.07] },
  { id: 'tropicalSeasonalForest', name: 'Tropical Seasonal', color: [0.2, 0.5, 0.2] },
  { id: 'savanna', name: 'Savanna', color: [0.87, 0.8, 0.4] },
  { id: 'desert', name: 'Desert', color: [1.0, 0.8, 0.4] },
  { id: 'shrubland', name: 'Shrubland', color: [0.6, 0.7, 0.4] }
];

function registerBiomeMaterials() {
  BIOME_DATA.forEach(biome => {
    const id = `biome-${biome.id}`;
    if (!materialRegistry.has(id)) {
      materialRegistry.register({
        id,
        name: biome.name,
        baseColor: biome.color as [number, number, number],
        roughness: 0.7,
        metallic: 0.0,
        emission: 0.0,
        emissiveColor: [1.0, 1.0, 1.0],
        opacity: 1.0
      });
    }
  });
}

interface SceneProps {
  mode: 'elements' | 'biomes';
}

function Scene({ mode }: SceneProps) {
  const primitives: SDFPrimitive[] = [];
  const gridSize = 6;
  const spacing = 1.8;

  if (mode === 'elements') {
    ELEMENT_SYMBOLS.forEach((symbol, index) => {
      const materialId = `element-${symbol.toLowerCase()}`;
      if (materialRegistry.has(materialId)) {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        const x = (col - gridSize / 2 + 0.5) * spacing;
        const y = -(row - Math.floor(ELEMENT_SYMBOLS.length / gridSize) / 2) * spacing;

        primitives.push({
          type: 'sphere',
          position: [x, y, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          params: [0.5],
          materialId
        });
      }
    });
  } else {
    BIOME_DATA.forEach((biome, index) => {
      const materialId = `biome-${biome.id}`;
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      const x = (col - gridSize / 2 + 0.5) * spacing;
      const y = -(row - Math.floor(BIOME_DATA.length / gridSize) / 2) * spacing;

      primitives.push({
        type: 'sphere',
        position: [x, y, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        params: [0.5],
        materialId
      });
    });
  }

  return (
    <>
      <SDFRenderer primitives={primitives} maxSteps={128} precision={0.001} maxDistance={50} />
      {primitives.map((prim, index) => {
        const label = mode === 'elements' 
          ? ELEMENT_SYMBOLS[index]
          : BIOME_DATA[index].name;
        
        return (
          <Html key={index} position={[prim.position[0], prim.position[1] - 0.7, prim.position[2]]}>
            <Paper
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                px: 0.8,
                py: 0.3,
                fontSize: '0.7rem',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}
            >
              {label}
            </Paper>
          </Html>
        );
      })}
    </>
  );
}

export function MaterialsShowcase() {
  const [mode, setMode] = useState<'elements' | 'biomes'>('elements');

  registerBiomeMaterials();

  return (
    <Box sx={{ width: '100vw', height: '100vh', bgcolor: '#0a0a0a', position: 'relative' }}>
      <Paper
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          p: 2,
          bgcolor: 'rgba(0, 0, 0, 0.85)',
          color: 'white',
          zIndex: 1000,
          maxWidth: 400,
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h5">Material System Showcase</Typography>
          <Typography variant="body2" color="grey.400">
            MaterialRegistry with {mode === 'elements' ? 'chemical elements' : 'biome materials'}
          </Typography>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Material Type
            </Typography>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={(_, value) => value && setMode(value)}
              fullWidth
              size="small"
              data-testid="material-type-toggle"
            >
              <ToggleButton value="elements" data-testid="elements-btn">
                Elements ({ELEMENT_SYMBOLS.length})
              </ToggleButton>
              <ToggleButton value="biomes" data-testid="biomes-btn">
                Biomes ({BIOME_DATA.length})
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Typography variant="caption" color="grey.500">
            {mode === 'elements' 
              ? 'Showing periodic table elements with PBR materials'
              : 'Showing Whittaker biome diagram materials'}
          </Typography>

          <Typography variant="caption" color="grey.600">
            Use mouse to orbit, scroll to zoom
          </Typography>
        </Stack>
      </Paper>

      <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
        <Suspense fallback={null}>
          <Scene mode={mode} />
        </Suspense>
        <OrbitControls enableDamping dampingFactor={0.05} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1.0} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#4444ff" />
      </Canvas>
    </Box>
  );
}

export default MaterialsShowcase;
