import { Box, Button, Stack, Typography, Paper } from '@mui/material';
import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useState, useMemo } from 'react';
import { SDFPrimitive } from '../../engine/rendering/sdf/types';
import { SDFRenderer } from '../../engine/rendering/sdf/renderer/SDFRenderer';

const OPERATION_EXAMPLES = [
  {
    id: 'union',
    name: 'Union',
    description: 'Combine two shapes together (A + B)',
    primitives: (): SDFPrimitive[] => [
      {
        type: 'sphere',
        position: [-0.3, 0, 0],
        params: [0.5],
        materialId: 'element-h',
        operation: 'union',
      },
      {
        type: 'box',
        position: [0.3, 0, 0],
        params: [0.4, 0.4, 0.4],
        materialId: 'element-o',
        operation: 'union',
      },
    ],
  },
  {
    id: 'subtract',
    name: 'Subtract',
    description: 'Cut one shape from another (A - B)',
    primitives: (): SDFPrimitive[] => [
      {
        type: 'sphere',
        position: [0, 0, 0],
        params: [0.6],
        materialId: 'element-fe',
        operation: 'union',
      },
      {
        type: 'cylinder',
        position: [0, 0, 0],
        rotation: [0, 0, Math.PI / 2],
        params: [1.5, 0.3],
        materialId: 'element-c',
        operation: 'subtract',
      },
    ],
  },
  {
    id: 'intersect',
    name: 'Intersect',
    description: 'Show only overlapping region (A ∩ B)',
    primitives: (): SDFPrimitive[] => [
      {
        type: 'sphere',
        position: [-0.2, 0, 0],
        params: [0.5],
        materialId: 'element-au',
        operation: 'union',
      },
      {
        type: 'box',
        position: [0.2, 0, 0],
        params: [0.5, 0.5, 0.5],
        materialId: 'element-cu',
        operation: 'intersect',
      },
    ],
  },
  {
    id: 'smooth-union',
    name: 'Smooth Union',
    description: 'Blend two shapes smoothly (organic molecules)',
    primitives: (): SDFPrimitive[] => [
      {
        type: 'sphere',
        position: [0, 0, 0],
        params: [0.4],
        materialId: 'element-o',
        operation: 'union',
      },
      {
        type: 'sphere',
        position: [-0.6, 0.4, 0],
        params: [0.25],
        materialId: 'element-h',
        operation: 'smooth-union',
        operationStrength: 0.3,
      },
      {
        type: 'sphere',
        position: [0.6, 0.4, 0],
        params: [0.25],
        materialId: 'element-h',
        operation: 'smooth-union',
        operationStrength: 0.3,
      },
    ],
  },
  {
    id: 'smooth-subtract',
    name: 'Smooth Subtract',
    description: 'Smooth boolean subtraction (organic cutting)',
    primitives: (): SDFPrimitive[] => [
      {
        type: 'sphere',
        position: [0, 0, 0],
        params: [0.6],
        materialId: 'element-ag',
        operation: 'union',
      },
      {
        type: 'sphere',
        position: [0.3, 0.3, 0],
        params: [0.4],
        materialId: 'element-c',
        operation: 'smooth-subtract',
        operationStrength: 0.2,
      },
    ],
  },
  {
    id: 'complex-molecule',
    name: 'Complex Molecule',
    description: 'H2O-like structure with smooth blending',
    primitives: (): SDFPrimitive[] => [
      {
        type: 'sphere',
        position: [0, 0, 0],
        params: [0.5],
        materialId: 'element-o',
        operation: 'union',
      },
      {
        type: 'sphere',
        position: [-0.7, 0.5, 0.3],
        params: [0.3],
        materialId: 'element-h',
        operation: 'smooth-union',
        operationStrength: 0.25,
      },
      {
        type: 'sphere',
        position: [0.7, 0.5, -0.3],
        params: [0.3],
        materialId: 'element-h',
        operation: 'smooth-union',
        operationStrength: 0.25,
      },
      {
        type: 'capsule',
        position: [-0.35, 0.25, 0.15],
        params: [0, 0.3, 0, 0.08],
        materialId: 'bond',
        operation: 'smooth-union',
        operationStrength: 0.1,
      },
      {
        type: 'capsule',
        position: [0.35, 0.25, -0.15],
        params: [0, 0.3, 0, 0.08],
        materialId: 'bond',
        operation: 'smooth-union',
        operationStrength: 0.1,
      },
    ],
  },
  {
    id: 'arch',
    name: 'Architectural Arch',
    description: 'Window/arch form using subtraction',
    primitives: (): SDFPrimitive[] => [
      {
        type: 'box',
        position: [0, 0, 0],
        params: [0.6, 0.8, 0.3],
        materialId: 'element-fe',
        operation: 'union',
      },
      {
        type: 'cylinder',
        position: [0, 0.1, 0],
        rotation: [Math.PI / 2, 0, 0],
        params: [0.8, 0.35],
        materialId: 'element-c',
        operation: 'subtract',
      },
      {
        type: 'box',
        position: [0, -0.3, 0],
        params: [0.35, 0.5, 0.4],
        materialId: 'element-c',
        operation: 'subtract',
      },
    ],
  },
  {
    id: 'organic',
    name: 'Organic Form',
    description: 'Complex organic shape with multiple blends',
    primitives: (): SDFPrimitive[] => [
      {
        type: 'sphere',
        position: [0, 0, 0],
        params: [0.4],
        materialId: 'element-cu',
        operation: 'union',
      },
      {
        type: 'sphere',
        position: [0.4, 0.4, 0],
        params: [0.35],
        materialId: 'element-au',
        operation: 'smooth-union',
        operationStrength: 0.3,
      },
      {
        type: 'sphere',
        position: [-0.4, 0.4, 0],
        params: [0.35],
        materialId: 'element-ag',
        operation: 'smooth-union',
        operationStrength: 0.3,
      },
      {
        type: 'sphere',
        position: [0, -0.4, 0],
        params: [0.3],
        materialId: 'element-fe',
        operation: 'smooth-union',
        operationStrength: 0.25,
      },
    ],
  },
];

interface SceneProps {
  operationIndex: number;
  enableRotation: boolean;
}

function Scene({ operationIndex, enableRotation }: SceneProps) {
  const [time, setTime] = useState(0);

  useFrame((_, delta) => {
    if (enableRotation) {
      setTime((t) => t + delta);
    }
  });

  const primitives = useMemo(() => {
    const example = OPERATION_EXAMPLES[operationIndex];
    const basePrimitives = example.primitives();

    if (enableRotation) {
      return basePrimitives.map((prim) => ({
        ...prim,
        rotation: [time * 0.2, time * 0.3, time * 0.1] as [number, number, number],
      }));
    }

    return basePrimitives;
  }, [operationIndex, enableRotation, time]);

  return <SDFRenderer primitives={primitives} maxSteps={128} precision={0.001} maxDistance={20} />;
}

export function JoiningShowcase() {
  const [operationIndex, setOperationIndex] = useState(0);
  const [enableRotation, setEnableRotation] = useState(false);

  const currentExample = OPERATION_EXAMPLES[operationIndex];

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
          <Typography variant="h5">SDF Joining Showcase</Typography>
          <Typography variant="body2" color="grey.400">
            Coordinate targeting & foreign body joining operations
          </Typography>

          <Box data-testid="operation-info">
            <Typography variant="h6" color="primary.main">
              {currentExample.name}
            </Typography>
            <Typography variant="body2" color="grey.300">
              {currentExample.description}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Operations
            </Typography>
            <Stack spacing={1}>
              {OPERATION_EXAMPLES.map((example, index) => (
                <Button
                  key={example.id}
                  variant={operationIndex === index ? 'contained' : 'outlined'}
                  onClick={() => setOperationIndex(index)}
                  size="small"
                  fullWidth
                  data-testid={`operation-${example.id}-btn`}
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  {example.name}
                </Button>
              ))}
            </Stack>
          </Box>

          <Box>
            <Button
              variant={enableRotation ? 'contained' : 'outlined'}
              onClick={() => setEnableRotation(!enableRotation)}
              size="small"
              fullWidth
              data-testid="toggle-rotation-btn"
            >
              {enableRotation ? 'Stop Rotation' : 'Enable Rotation'}
            </Button>
          </Box>

          <Typography variant="caption" color="grey.500">
            Use mouse to orbit, scroll to zoom
          </Typography>
        </Stack>
      </Paper>

      <Canvas camera={{ position: [0, 0, 3], fov: 60 }}>
        <Suspense fallback={null}>
          <Scene operationIndex={operationIndex} enableRotation={enableRotation} />
        </Suspense>
        <OrbitControls enableDamping dampingFactor={0.05} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1.0} />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#4444ff" />
        <pointLight position={[0, 0, 5]} intensity={0.5} color="#ff4444" />
      </Canvas>
    </Box>
  );
}

export default JoiningShowcase;
