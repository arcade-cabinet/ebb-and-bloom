import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { OrbitControls, Html } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useState, useRef, useMemo } from 'react';
import { World } from 'miniplex';
import { v4 as uuid } from 'uuid';
import { SDFEntityRenderer } from '../../engine/rendering/sdf/ecs/SDFEntityRenderer';
import { useSDFEntities } from '../../engine/ecs/hooks/useSDFEntities';
import { useSDFMaterials } from '../../engine/ecs/hooks/useSDFMaterials';
import type { SDFEntity } from '../../engine/ecs/components/SDFComponents';

const MATERIAL_IDS = [
  'element-h',
  'element-o',
  'element-c',
  'element-n',
  'element-fe',
  'element-cu',
  'element-au',
  'bond',
  'default'
];

function createH2OMolecule(position: [number, number, number]): SDFEntity[] {
  return [
    {
      entityId: uuid(),
      sdfShape: {
        primitiveType: 'sphere' as const,
        params: [0.3],
        position: { x: position[0], y: position[1], z: position[2] },
        operation: 'smooth-union' as const,
        operationStrength: 0.2
      },
      sdfMaterial: { materialId: 'element-o' },
      visible: true
    },
    {
      entityId: uuid(),
      sdfShape: {
        primitiveType: 'sphere' as const,
        params: [0.2],
        position: { x: position[0] - 0.6, y: position[1] + 0.5, z: position[2] },
        operation: 'smooth-union' as const,
        operationStrength: 0.2
      },
      sdfMaterial: { materialId: 'element-h' },
      visible: true
    },
    {
      entityId: uuid(),
      sdfShape: {
        primitiveType: 'sphere' as const,
        params: [0.2],
        position: { x: position[0] + 0.6, y: position[1] + 0.5, z: position[2] },
        operation: 'smooth-union' as const,
        operationStrength: 0.2
      },
      sdfMaterial: { materialId: 'element-h' },
      visible: true
    }
  ];
}

function createOrganism(position: [number, number, number], materialId: string): SDFEntity[] {
  return [
    {
      entityId: uuid(),
      sdfShape: {
        primitiveType: 'sphere' as const,
        params: [0.4],
        position: { x: position[0], y: position[1], z: position[2] },
        operation: 'smooth-union' as const,
        operationStrength: 0.3
      },
      sdfMaterial: { materialId },
      visible: true
    },
    {
      entityId: uuid(),
      sdfShape: {
        primitiveType: 'capsule' as const,
        params: [0, 0.3, 0, 0.1],
        position: { x: position[0] - 0.4, y: position[1], z: position[2] },
        rotation: { x: 0, y: 0, z: Math.PI / 4 },
        operation: 'smooth-union' as const,
        operationStrength: 0.2
      },
      sdfMaterial: { materialId },
      visible: true
    },
    {
      entityId: uuid(),
      sdfShape: {
        primitiveType: 'capsule' as const,
        params: [0, 0.3, 0, 0.1],
        position: { x: position[0] + 0.4, y: position[1], z: position[2] },
        rotation: { x: 0, y: 0, z: -Math.PI / 4 },
        operation: 'smooth-union' as const,
        operationStrength: 0.2
      },
      sdfMaterial: { materialId },
      visible: true
    }
  ];
}

function createRandomPrimitive(position: [number, number, number]): SDFEntity {
  const primitiveTypes = ['sphere', 'box', 'torus', 'octahedron', 'capsule'] as const;
  const randomType = primitiveTypes[Math.floor(Math.random() * primitiveTypes.length)];
  
  const params = {
    sphere: [0.3],
    box: [0.3, 0.3, 0.3],
    torus: [0.3, 0.1],
    octahedron: [0.3],
    capsule: [0, 0.3, 0, 0.1]
  }[randomType];
  
  return {
    entityId: uuid(),
    sdfShape: {
      primitiveType: randomType,
      params,
      position: { x: position[0], y: position[1], z: position[2] },
      operation: Math.random() > 0.5 ? 'smooth-union' : 'union',
      operationStrength: 0.2
    },
    sdfMaterial: { materialId: MATERIAL_IDS[Math.floor(Math.random() * MATERIAL_IDS.length)] },
    visible: true
  };
}

interface StatsDisplayProps {
  world: World<any>;
}

function StatsDisplay({ world }: StatsDisplayProps) {
  const entities = useSDFEntities(world);
  const materials = useSDFMaterials(world);
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
          bgcolor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          p: 2,
          borderRadius: 1,
          minWidth: 250,
        }}
      >
        <Stack spacing={1.5}>
          <Typography variant="h6">ECS Stats</Typography>
          
          <Box>
            <Typography variant="caption" color="grey.400">
              Performance
            </Typography>
            <Chip
              label={`${fps} FPS`}
              color={fps >= 60 ? 'success' : fps >= 30 ? 'warning' : 'error'}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>

          <Box>
            <Typography variant="caption" color="grey.400">
              Entity Count
            </Typography>
            <Typography variant="h5" data-testid="entity-count">
              {entities.length}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="grey.400">
              Material Usage
            </Typography>
            <Stack spacing={0.5} sx={{ mt: 0.5, maxHeight: 150, overflowY: 'auto' }}>
              {materials.map((usage) => (
                <Box
                  key={usage.materialId}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    p: 0.5,
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 0.5,
                  }}
                  data-testid={`material-${usage.materialId}`}
                >
                  <span>{usage.materialId}</span>
                  <Chip label={usage.count} size="small" sx={{ height: 16, fontSize: '0.65rem' }} />
                </Box>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Html>
  );
}

interface SceneProps {
  world: World<any>;
}

function Scene({ world }: SceneProps) {
  return (
    <>
      <SDFEntityRenderer world={world} maxSteps={128} precision={0.001} />
      <StatsDisplay world={world} />
    </>
  );
}

export function ECSIntegrationShowcase() {
  const world = useMemo(() => new World<any>(), []);
  const [, setUpdateCounter] = useState(0);
  const forceUpdate = () => setUpdateCounter(c => c + 1);

  const initializeWorld = () => {
    world.clear();
    
    const h2o = createH2OMolecule([-2, 1, 0]);
    h2o.forEach(entity => world.add(entity));
    
    const organism1 = createOrganism([1, 1, 0], 'element-c');
    organism1.forEach(entity => world.add(entity));
    
    const organism2 = createOrganism([0, -1.5, 0], 'element-n');
    organism2.forEach(entity => world.add(entity));
    
    forceUpdate();
  };

  useMemo(() => {
    initializeWorld();
  }, []);

  const addRandomEntity = () => {
    const randomPos: [number, number, number] = [
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 2
    ];
    const entity = createRandomPrimitive(randomPos);
    world.add(entity);
    forceUpdate();
  };

  const removeRandomEntity = () => {
    const entities = Array.from(world.entities);
    if (entities.length > 0) {
      const randomEntity = entities[Math.floor(Math.random() * entities.length)];
      world.remove(randomEntity);
      forceUpdate();
    }
  };

  const cycleMaterials = () => {
    const entities = Array.from(world.entities);
    entities.forEach(entity => {
      if (entity.sdfMaterial) {
        const currentIndex = MATERIAL_IDS.indexOf(entity.sdfMaterial.materialId);
        const nextIndex = (currentIndex + 1) % MATERIAL_IDS.length;
        entity.sdfMaterial.materialId = MATERIAL_IDS[nextIndex];
      }
    });
    forceUpdate();
  };

  const addH2OMolecule = () => {
    const randomPos: [number, number, number] = [
      (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    ];
    const h2o = createH2OMolecule(randomPos);
    h2o.forEach(entity => world.add(entity));
    forceUpdate();
  };

  const addOrganism = () => {
    const randomPos: [number, number, number] = [
      (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    ];
    const materialId = MATERIAL_IDS[Math.floor(Math.random() * MATERIAL_IDS.length)];
    const organism = createOrganism(randomPos, materialId);
    organism.forEach(entity => world.add(entity));
    forceUpdate();
  };

  const clearAll = () => {
    world.clear();
    forceUpdate();
  };

  const reset = () => {
    initializeWorld();
  };

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
          <Typography variant="h5">ECS Integration Showcase</Typography>
          <Typography variant="body2" color="grey.400">
            Miniplex World + SDF Rendering
          </Typography>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Add Entities
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                onClick={addH2OMolecule}
                size="small"
                fullWidth
                data-testid="add-h2o-btn"
              >
                H₂O
              </Button>
              <Button
                variant="contained"
                onClick={addOrganism}
                size="small"
                fullWidth
                data-testid="add-organism-btn"
              >
                Organism
              </Button>
            </Stack>
            <Button
              variant="outlined"
              onClick={addRandomEntity}
              size="small"
              fullWidth
              sx={{ mt: 1 }}
              data-testid="add-random-btn"
            >
              Random Primitive
            </Button>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Entity Management
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={removeRandomEntity}
                size="small"
                fullWidth
                data-testid="remove-random-btn"
              >
                Remove Random
              </Button>
              <Button
                variant="outlined"
                onClick={clearAll}
                size="small"
                fullWidth
                data-testid="clear-all-btn"
              >
                Clear All
              </Button>
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Material Operations
            </Typography>
            <Button
              variant="contained"
              onClick={cycleMaterials}
              size="small"
              fullWidth
              color="secondary"
              data-testid="cycle-materials-btn"
            >
              Cycle All Materials
            </Button>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Reset
            </Typography>
            <Button
              variant="outlined"
              onClick={reset}
              size="small"
              fullWidth
              data-testid="reset-btn"
            >
              Reset to Initial State
            </Button>
          </Box>

          <Box sx={{ pt: 1, borderTop: 1, borderColor: 'grey.800' }}>
            <Typography variant="caption" color="grey.500">
              Features: useSDFEntities, useSDFMaterials, SDFEntityRenderer, reactive updates
            </Typography>
          </Box>

          <Typography variant="caption" color="grey.600">
            Use mouse to orbit, scroll to zoom
          </Typography>
        </Stack>
      </Paper>

      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <Suspense fallback={null}>
          <Scene world={world} />
        </Suspense>
        <OrbitControls enableDamping dampingFactor={0.05} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1.0} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#4444ff" />
        <pointLight position={[0, 0, 10]} intensity={0.5} color="#ff4444" />
      </Canvas>
    </Box>
  );
}

export default ECSIntegrationShowcase;
