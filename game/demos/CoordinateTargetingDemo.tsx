/**
 * COORDINATE TARGETING DEMO - Phase 0.3
 * 
 * Interactive showcase of coordinate targeting for precise material application:
 * - Sphere with different materials on top/bottom hemispheres
 * - Box with materials on specific faces
 * - Smooth blending between regions
 * - Interactive region selector and blend radius control
 * - NEW: Surface, Volume, Edge, and Vertex targeting modes
 * - NEW: Left and Right region support
 */

import { Box, Button, Chip, Stack, Typography, Slider, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { OrbitControls, Html } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useState, useRef } from 'react';
import { SDFPrimitive } from '../../engine/rendering/sdf/SDFPrimitives';
import { SDFRenderer } from '../../engine/rendering/sdf/SDFRenderer';

type RegionType = 'all' | 'top' | 'bottom' | 'sides' | 'front' | 'back' | 'left' | 'right';
type TargetType = 'surface' | 'volume' | 'edge' | 'vertex';

const REGIONS: RegionType[] = ['all', 'top', 'bottom', 'sides', 'front', 'back', 'left', 'right'];
const TARGET_TYPES: TargetType[] = ['surface', 'volume', 'edge', 'vertex'];

interface FPSCounterProps {
  primitiveCount: number;
}

function FPSCounter({ primitiveCount }: FPSCounterProps) {
  const [fps, setFps] = useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useFrame(() => {
    frameCount.current++;
    const currentTime = performance.now();
    const elapsed = currentTime - lastTime.current;

    if (elapsed >= 1000) {
      setFps(Math.round((frameCount.current * 1000) / elapsed));
      frameCount.current = 0;
      lastTime.current = currentTime;
    }
  });

  return (
    <Html position={[0, 0, 0]} style={{ pointerEvents: 'none' }}>
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          p: 2,
          borderRadius: 1,
          minWidth: 200,
        }}
      >
        <Stack spacing={1}>
          <Typography variant="h6">Performance</Typography>
          <Chip
            label={`${fps} FPS`}
            color={fps >= 60 ? 'success' : fps >= 30 ? 'warning' : 'error'}
            size="small"
          />
          <Typography variant="body2">
            Primitives: {primitiveCount}
          </Typography>
        </Stack>
      </Box>
    </Html>
  );
}

interface SceneProps {
  demoMode: 'sphere' | 'box' | 'blending' | 'targeting';
  region1: RegionType;
  region2: RegionType;
  targetType: TargetType;
  blendRadius: number;
  enableRotation: boolean;
}

function Scene({ demoMode, region1, region2, targetType, blendRadius, enableRotation }: SceneProps) {
  const time = useRef(0);

  useFrame((_, delta) => {
    if (enableRotation) {
      time.current += delta * 0.5;
    }
  });

  const rotation = enableRotation ? [0, time.current, 0] as [number, number, number] : undefined;

  const primitives: SDFPrimitive[] = [];

  if (demoMode === 'sphere') {
    primitives.push(
      {
        type: 'sphere',
        position: [-1.5, 0, 0],
        params: [0.6],
        materialId: 'element-o',
        coordinateTarget: {
          type: 'surface',
          region: region1,
          blendRadius: blendRadius,
        },
        rotation,
      },
      {
        type: 'sphere',
        position: [0, 0, 0],
        params: [0.6],
        materialId: 'element-au',
        coordinateTarget: {
          type: 'surface',
          region: region2,
          blendRadius: blendRadius,
        },
        rotation,
      },
      {
        type: 'sphere',
        position: [-1.5, 0, 0],
        params: [0.6],
        materialId: 'element-c',
        coordinateTarget: {
          type: 'surface',
          region: region1 === 'top' ? 'bottom' : 'top',
          blendRadius: blendRadius,
        },
        rotation,
      },
      {
        type: 'sphere',
        position: [0, 0, 0],
        params: [0.6],
        materialId: 'element-fe',
        coordinateTarget: {
          type: 'surface',
          region: region2 === 'top' ? 'bottom' : 'top',
          blendRadius: blendRadius,
        },
        rotation,
      }
    );
  } else if (demoMode === 'box') {
    primitives.push(
      {
        type: 'box',
        position: [-1.5, 0, 0],
        params: [0.5, 0.5, 0.5],
        materialId: 'element-o',
        coordinateTarget: {
          type: 'surface',
          region: region1,
          blendRadius: blendRadius,
        },
        rotation,
      },
      {
        type: 'box',
        position: [0, 0, 0],
        params: [0.5, 0.5, 0.5],
        materialId: 'element-au',
        coordinateTarget: {
          type: 'surface',
          region: region2,
          blendRadius: blendRadius,
        },
        rotation,
      },
      {
        type: 'box',
        position: [-1.5, 0, 0],
        params: [0.5, 0.5, 0.5],
        materialId: 'element-c',
        coordinateTarget: {
          type: 'surface',
          region: 'bottom',
          blendRadius: blendRadius,
        },
        rotation,
      },
      {
        type: 'box',
        position: [0, 0, 0],
        params: [0.5, 0.5, 0.5],
        materialId: 'element-fe',
        coordinateTarget: {
          type: 'surface',
          region: 'bottom',
          blendRadius: blendRadius,
        },
        rotation,
      }
    );
  } else if (demoMode === 'blending') {
    primitives.push(
      {
        type: 'torus',
        position: [-1.5, 0, 0],
        params: [0.5, 0.2],
        materialId: 'element-o',
        coordinateTarget: {
          type: 'surface',
          region: region1,
          blendRadius: blendRadius,
        },
        rotation,
      },
      {
        type: 'torus',
        position: [-1.5, 0, 0],
        params: [0.5, 0.2],
        materialId: 'element-au',
        coordinateTarget: {
          type: 'surface',
          region: region2,
          blendRadius: blendRadius,
        },
        rotation,
      },
      {
        type: 'cylinder',
        position: [0, 0, 0],
        params: [0.5, 0.3],
        materialId: 'element-c',
        coordinateTarget: {
          type: 'surface',
          region: region1,
          blendRadius: blendRadius,
        },
        rotation,
      },
      {
        type: 'cylinder',
        position: [0, 0, 0],
        params: [0.5, 0.3],
        materialId: 'element-fe',
        coordinateTarget: {
          type: 'surface',
          region: 'sides',
          blendRadius: blendRadius,
        },
        rotation,
      }
    );
  } else {
    primitives.push(
      {
        type: 'box',
        position: [-1.5, 0, 0],
        params: [0.6, 0.6, 0.6],
        materialId: 'element-o',
        coordinateTarget: {
          type: targetType,
          region: region1,
          blendRadius: blendRadius,
          edgeWidth: 0.1,
          vertexRadius: 0.15,
        },
        rotation,
      },
      {
        type: 'box',
        position: [-1.5, 0, 0],
        params: [0.6, 0.6, 0.6],
        materialId: 'element-c',
        coordinateTarget: {
          type: targetType === 'surface' ? 'volume' : 'surface',
          region: 'all',
          blendRadius: 0.0,
        },
        rotation,
      },
      {
        type: 'sphere',
        position: [0.5, 0, 0],
        params: [0.6],
        materialId: 'element-au',
        coordinateTarget: {
          type: targetType,
          region: region2,
          blendRadius: blendRadius,
          edgeWidth: 0.1,
          vertexRadius: 0.15,
        },
        rotation,
      },
      {
        type: 'sphere',
        position: [0.5, 0, 0],
        params: [0.6],
        materialId: 'element-fe',
        coordinateTarget: {
          type: targetType === 'surface' ? 'volume' : 'surface',
          region: 'all',
          blendRadius: 0.0,
        },
        rotation,
      }
    );
  }

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <SDFRenderer primitives={primitives} />
      <FPSCounter primitiveCount={primitives.length} />
      <OrbitControls makeDefault />
    </>
  );
}

export function CoordinateTargetingDemo() {
  const [demoMode, setDemoMode] = useState<'sphere' | 'box' | 'blending' | 'targeting'>('sphere');
  const [region1, setRegion1] = useState<RegionType>('top');
  const [region2, setRegion2] = useState<RegionType>('front');
  const [targetType, setTargetType] = useState<TargetType>('surface');
  const [blendRadius, setBlendRadius] = useState(0.1);
  const [enableRotation, setEnableRotation] = useState(true);

  return (
    <Box sx={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Stack spacing={2}>
          <Typography variant="h5">Coordinate Targeting Demo (Phase 0.3)</Typography>
          
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" sx={{ minWidth: 100 }}>Demo Mode:</Typography>
            <ToggleButtonGroup
              value={demoMode}
              exclusive
              onChange={(_, value) => value && setDemoMode(value)}
              size="small"
            >
              <ToggleButton value="sphere">Sphere</ToggleButton>
              <ToggleButton value="box">Box</ToggleButton>
              <ToggleButton value="blending">Blending</ToggleButton>
              <ToggleButton value="targeting">Target Types</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {demoMode === 'targeting' && (
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" sx={{ minWidth: 100 }}>Target Type:</Typography>
              <ToggleButtonGroup
                value={targetType}
                exclusive
                onChange={(_, value) => value && setTargetType(value)}
                size="small"
              >
                {TARGET_TYPES.map((t) => (
                  <ToggleButton key={t} value={t}>{t}</ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Stack>
          )}

          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" sx={{ minWidth: 100 }}>Region 1:</Typography>
            <ToggleButtonGroup
              value={region1}
              exclusive
              onChange={(_, value) => value && setRegion1(value)}
              size="small"
            >
              {REGIONS.map((r) => (
                <ToggleButton key={r} value={r}>{r}</ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" sx={{ minWidth: 100 }}>Region 2:</Typography>
            <ToggleButtonGroup
              value={region2}
              exclusive
              onChange={(_, value) => value && setRegion2(value)}
              size="small"
            >
              {REGIONS.map((r) => (
                <ToggleButton key={r} value={r}>{r}</ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" sx={{ minWidth: 100 }}>Blend Radius:</Typography>
            <Slider
              value={blendRadius}
              onChange={(_, value) => setBlendRadius(value as number)}
              min={0}
              max={0.5}
              step={0.01}
              valueLabelDisplay="auto"
              sx={{ flexGrow: 1, maxWidth: 300 }}
            />
            <Typography variant="body2">{blendRadius.toFixed(2)}</Typography>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button
              variant={enableRotation ? 'contained' : 'outlined'}
              onClick={() => setEnableRotation(!enableRotation)}
              size="small"
            >
              {enableRotation ? 'Stop' : 'Start'} Rotation
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
          <Suspense fallback={null}>
            <Scene
              demoMode={demoMode}
              region1={region1}
              region2={region2}
              targetType={targetType}
              blendRadius={blendRadius}
              enableRotation={enableRotation}
            />
          </Suspense>
        </Canvas>
      </Box>
    </Box>
  );
}

export default CoordinateTargetingDemo;
