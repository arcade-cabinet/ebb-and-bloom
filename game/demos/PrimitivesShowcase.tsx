/**
 * PRIMITIVES SHOWCASE DEMO - Phase 0.1.5
 * 
 * Interactive showcase of all 21 SDF primitives with:
 * - Grid layout showing each primitive type
 * - Interactive camera controls (orbit, zoom)
 * - Material switching (cycle through element materials)
 * - Transform toggles (rotation, scaling)
 * - FPS counter and primitive count display
 * - Performance monitoring
 */

import { Box, Button, Chip, Stack, Typography, Paper } from '@mui/material';
import { OrbitControls, Html } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useState, useRef, useMemo } from 'react';
import { SDFPrimitive } from '../../engine/rendering/sdf/types';
import { SDFRenderer } from '../../engine/rendering/sdf/renderer/SDFRenderer';

// All 21 SDF primitives with their parameters
const PRIMITIVE_DEFINITIONS = [
  { name: 'sphere', params: [0.5], label: 'Sphere (r)' },
  { name: 'box', params: [0.4, 0.4, 0.4], label: 'Box (w,h,d)' },
  { name: 'cylinder', params: [0.5, 0.3], label: 'Cylinder (h,r)' },
  { name: 'cone', params: [0.8, 0.6, 0.5], label: 'Cone (sin,cos,h)' },
  { name: 'pyramid', params: [0.5], label: 'Pyramid (h)' },
  { name: 'torus', params: [0.4, 0.15], label: 'Torus (R,r)' },
  { name: 'octahedron', params: [0.5], label: 'Octahedron (s)' },
  { name: 'hexprism', params: [0.3, 0.5], label: 'Hex Prism (r,h)' },
  { name: 'capsule', params: [0, 0.5, 0, 0.15], label: 'Capsule (y,r)' },
  { name: 'porbital', params: [0.4], label: 'P-Orbital (s)' },
  { name: 'dorbital', params: [0.4], label: 'D-Orbital (s)' },
  { name: 'triPrism', params: [0.3, 0.5], label: 'Tri Prism (r,h)' },
  { name: 'ellipsoid', params: [0.5, 0.3, 0.2], label: 'Ellipsoid (rx,ry,rz)' },
  { name: 'roundedBox', params: [0.3, 0.3, 0.3, 0.1], label: 'Rounded Box (w,h,d,r)' },
  { name: 'cappedCylinder', params: [0.5, 0.3], label: 'Capped Cylinder (h,r)' },
  { name: 'plane', params: [0, 1, 0, -0.3], label: 'Plane (nx,ny,nz,d)' },
  { name: 'roundCone', params: [0.3, 0.15, 0.5], label: 'Round Cone (r1,r2,h)' },
  { name: 'mengerSponge', params: [0.4], label: 'Menger Sponge (s)' },
  { name: 'gyroid', params: [2.0, 0.05], label: 'Gyroid (scale,t)' },
  { name: 'superellipsoid', params: [0.5, 0.5, 0.4], label: 'Superellipsoid (e1,e2,s)' },
  { name: 'torusKnot', params: [2.0, 3.0, 0.5], label: 'Torus Knot (p,q,s)' }
] as const;

// Material IDs to cycle through
const MATERIAL_IDS = [
  'element-h',   // Hydrogen - white
  'element-o',   // Oxygen - red
  'element-c',   // Carbon - dark
  'element-fe',  // Iron - metallic
  'element-au',  // Gold
  'element-cu',  // Copper
  'element-ag',  // Silver
  'bond',        // Chemical bond
  'default'      // Default material
];

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
  materialId: string;
  enableRotation: boolean;
  enableScaling: boolean;
  showGrid: boolean;
  showSingle: number | null;
}

function Scene({ materialId, enableRotation, enableScaling, showGrid, showSingle }: SceneProps) {
  const time = useRef(0);

  useFrame((_, delta) => {
    if (enableRotation) {
      time.current += delta;
    }
  });

  const primitives = useMemo(() => {
    const prims: SDFPrimitive[] = [];
    const gridSize = 5;
    const spacing = 2.0;

    const primitivesToShow = showSingle !== null 
      ? [PRIMITIVE_DEFINITIONS[showSingle]] 
      : PRIMITIVE_DEFINITIONS;

    primitivesToShow.forEach((def, index) => {
      const actualIndex = showSingle !== null ? showSingle : index;
      const row = Math.floor(actualIndex / gridSize);
      const col = actualIndex % gridSize;

      const x = (col - gridSize / 2) * spacing;
      const y = (row - Math.floor(PRIMITIVE_DEFINITIONS.length / gridSize) / 2) * spacing;
      const z = 0;

      const rotation = enableRotation
        ? [time.current * 0.3, time.current * 0.5, time.current * 0.2]
        : [0, 0, 0];

      const scale = enableScaling
        ? [
            1.0 + Math.sin(time.current + actualIndex) * 0.2,
            1.0 + Math.sin(time.current + actualIndex + 1) * 0.2,
            1.0 + Math.sin(time.current + actualIndex + 2) * 0.2,
          ]
        : [1, 1, 1];

      prims.push({
        type: def.name as any,
        position: [x, y, z],
        rotation: rotation as [number, number, number],
        scale: scale as [number, number, number],
        params: def.params as any,
        materialId: materialId,
      });
    });

    return prims;
  }, [materialId, enableRotation, enableScaling, showGrid, showSingle]);

  return (
    <>
      <SDFRenderer primitives={primitives} maxSteps={128} precision={0.001} maxDistance={50} />
      <FPSCounter primitiveCount={primitives.length} />
      
      {showGrid && primitives.map((prim, index) => {
        const def = showSingle !== null 
          ? PRIMITIVE_DEFINITIONS[showSingle]
          : PRIMITIVE_DEFINITIONS[index];
        
        return (
          <Html key={index} position={[prim.position[0], prim.position[1] - 0.8, prim.position[2]]}>
            <Paper
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                p: 0.5,
                fontSize: '0.7rem',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}
            >
              {def.label}
            </Paper>
          </Html>
        );
      })}
    </>
  );
}

export function PrimitivesShowcase() {
  const [materialIndex, setMaterialIndex] = useState(0);
  const [enableRotation, setEnableRotation] = useState(false);
  const [enableScaling, setEnableScaling] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showSingle, setShowSingle] = useState<number | null>(null);

  const currentMaterialId = MATERIAL_IDS[materialIndex];

  const cycleMaterial = () => {
    setMaterialIndex((prev) => (prev + 1) % MATERIAL_IDS.length);
  };

  return (
    <Box sx={{ width: '100vw', height: '100vh', bgcolor: '#0a0a0a', position: 'relative' }}>
      {/* Controls Panel */}
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
          <Typography variant="h5">SDF Primitives Showcase</Typography>
          <Typography variant="body2" color="grey.400">
            Interactive demo of all 21 SDF primitive types
          </Typography>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Material: {currentMaterialId}
            </Typography>
            <Button
              variant="contained"
              onClick={cycleMaterial}
              fullWidth
              size="small"
              data-testid="cycle-material-btn"
            >
              Cycle Material ({materialIndex + 1}/{MATERIAL_IDS.length})
            </Button>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Transforms
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant={enableRotation ? 'contained' : 'outlined'}
                onClick={() => setEnableRotation(!enableRotation)}
                size="small"
                fullWidth
                data-testid="toggle-rotation-btn"
              >
                Rotation
              </Button>
              <Button
                variant={enableScaling ? 'contained' : 'outlined'}
                onClick={() => setEnableScaling(!enableScaling)}
                size="small"
                fullWidth
                data-testid="toggle-scaling-btn"
              >
                Scaling
              </Button>
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Display
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant={showGrid ? 'contained' : 'outlined'}
                onClick={() => setShowGrid(!showGrid)}
                size="small"
                fullWidth
                data-testid="toggle-labels-btn"
              >
                Labels
              </Button>
              <Button
                variant={showSingle === null ? 'contained' : 'outlined'}
                onClick={() => setShowSingle(null)}
                size="small"
                fullWidth
                data-testid="show-all-btn"
              >
                Show All
              </Button>
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Individual Primitives
            </Typography>
            <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
              <Stack spacing={0.5}>
                {PRIMITIVE_DEFINITIONS.map((def, index) => (
                  <Button
                    key={index}
                    variant={showSingle === index ? 'contained' : 'outlined'}
                    onClick={() => setShowSingle(showSingle === index ? null : index)}
                    size="small"
                    fullWidth
                    data-testid={`show-${def.name}-btn`}
                    sx={{ justifyContent: 'flex-start', fontSize: '0.75rem' }}
                  >
                    {def.label}
                  </Button>
                ))}
              </Stack>
            </Box>
          </Box>

          <Typography variant="caption" color="grey.500">
            Use mouse to orbit, scroll to zoom
          </Typography>
        </Stack>
      </Paper>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <Suspense fallback={null}>
          <Scene
            materialId={currentMaterialId}
            enableRotation={enableRotation}
            enableScaling={enableScaling}
            showGrid={showGrid}
            showSingle={showSingle}
          />
        </Suspense>
        <OrbitControls enableDamping dampingFactor={0.05} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1.0} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#4444ff" />
        <pointLight position={[0, 0, 10]} intensity={0.5} color="#ff4444" />
      </Canvas>
    </Box>
  );
}

export default PrimitivesShowcase;
