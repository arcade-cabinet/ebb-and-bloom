import { Box, Paper, Stack, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useState, useMemo } from 'react';
import { SDFPrimitive, BlendMode } from '../../engine/rendering/sdf/types';
import { SDFRenderer } from '../../engine/rendering/sdf/renderer/SDFRenderer';

type BlendModeType = 'replace' | 'mix' | 'add' | 'multiply';

const BLEND_MODE_DESCRIPTIONS: Record<BlendModeType, string> = {
  replace: 'Hard material boundary with no interpolation between materials',
  mix: 'Linear interpolation between materials for smooth transitions',
  add: 'Additive blending - useful for emissive and glowing materials',
  multiply: 'Multiplicative blending - creates darkening effects'
};

const MATERIAL_PAIRS = [
  { name: 'Gold + Copper', mat1: 'element-au', mat2: 'element-cu' },
  { name: 'Hydrogen + Oxygen', mat1: 'element-h', mat2: 'element-o' },
  { name: 'Iron + Carbon', mat1: 'element-fe', mat2: 'element-c' }
];

function getBlendConfig(mode: BlendModeType): BlendMode | undefined {
  switch (mode) {
    case 'replace':
      return undefined;
    case 'mix':
      return {
        type: 'linear',
        strength: 1.0,
        transitionDistance: 0.5
      };
    case 'add':
      return {
        type: 'smooth',
        strength: 1.5,
        transitionDistance: 0.8
      };
    case 'multiply':
      return {
        type: 'noise',
        strength: 0.7,
        transitionDistance: 0.4,
        noiseScale: 3.0
      };
  }
}

function Scene({ blendMode }: { blendMode: BlendModeType }) {
  const primitives = useMemo(() => {
    const prims: SDFPrimitive[] = [];
    const spacing = 3.5;
    const yOffset = -1.5;
    const blendConfig = getBlendConfig(blendMode);

    MATERIAL_PAIRS.forEach((pair, rowIndex) => {
      const y = yOffset + rowIndex * spacing;

      prims.push({
        type: 'sphere',
        position: [-1.2, y, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        params: [0.8],
        materialId: pair.mat1
      });

      prims.push({
        type: 'sphere',
        position: [0, y, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        params: [0.8],
        materialId: pair.mat1,
        blendMode: blendConfig
      });

      prims.push({
        type: 'sphere',
        position: [0, y, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        params: [0.8],
        materialId: pair.mat2,
        operation: 'smooth-union',
        operationStrength: 0.3
      });

      prims.push({
        type: 'sphere',
        position: [1.2, y, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        params: [0.8],
        materialId: pair.mat2
      });
    });

    return prims;
  }, [blendMode]);

  return (
    <SDFRenderer primitives={primitives} maxSteps={128} precision={0.001} maxDistance={50} />
  );
}

export function BlendingShowcase() {
  const [blendMode, setBlendMode] = useState<BlendModeType>('mix');

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
          maxWidth: 450,
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h5" data-testid="showcase-title">
            Material Blending Showcase
          </Typography>
          <Typography variant="body2" color="grey.400">
            Demonstrating shader-level material blending modes
          </Typography>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Blend Mode
            </Typography>
            <ToggleButtonGroup
              value={blendMode}
              exclusive
              onChange={(_, value) => value && setBlendMode(value)}
              fullWidth
              size="small"
              data-testid="blend-mode-toggle"
            >
              <ToggleButton value="replace" data-testid="replace-btn">
                Replace
              </ToggleButton>
              <ToggleButton value="mix" data-testid="mix-btn">
                Mix
              </ToggleButton>
              <ToggleButton value="add" data-testid="add-btn">
                Add
              </ToggleButton>
              <ToggleButton value="multiply" data-testid="multiply-btn">
                Multiply
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Paper
            sx={{
              p: 1.5,
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Typography variant="subtitle2" gutterBottom data-testid="current-mode">
              Current: {blendMode.toUpperCase()}
            </Typography>
            <Typography variant="caption" color="grey.400" data-testid="mode-description">
              {BLEND_MODE_DESCRIPTIONS[blendMode]}
            </Typography>
          </Paper>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Material Pairs
            </Typography>
            <Stack spacing={0.5}>
              {MATERIAL_PAIRS.map((pair, index) => (
                <Typography key={index} variant="caption" color="grey.500">
                  Row {index + 1}: {pair.name}
                </Typography>
              ))}
            </Stack>
          </Box>

          <Typography variant="caption" color="grey.600">
            Layout: Pure Mat 1 | Blended | Pure Mat 2
          </Typography>

          <Typography variant="caption" color="grey.600">
            Use mouse to orbit, scroll to zoom
          </Typography>
        </Stack>
      </Paper>

      <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
        <Suspense fallback={null}>
          <Scene blendMode={blendMode} />
        </Suspense>
        <OrbitControls enableDamping dampingFactor={0.05} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1.0} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#4444ff" />
      </Canvas>
    </Box>
  );
}

export default BlendingShowcase;
