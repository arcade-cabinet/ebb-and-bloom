/**
 * FOREIGN BODY DEMO - Phase 0.4
 * 
 * Interactive showcase of foreign body attachment system with:
 * - Bacteria with flagella attachments
 * - Molecules with functional groups
 * - Interactive attachment controls
 * - Real-time attachment point visualization
 * - Performance monitoring
 */

import { Box, Button, Chip, Stack, Typography, Paper, Slider, Switch, FormControlLabel } from '@mui/material';
import { OrbitControls, Html } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useState, useRef, useMemo } from 'react';
import { SDFPrimitive } from '../../engine/rendering/sdf/SDFPrimitives';
import { SDFRenderer } from '../../engine/rendering/sdf/SDFRenderer';
import { HostPrimitive, ForeignBody, foreignBodySystem } from '../../engine/rendering/sdf/ForeignBodySystem';

interface FPSCounterProps {
  primitiveCount: number;
  compositeCount: number;
}

function FPSCounter({ primitiveCount, compositeCount }: FPSCounterProps) {
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
          minWidth: 220,
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
            Composites: {compositeCount}
          </Typography>
          <Typography variant="body2">
            Total Primitives: {primitiveCount}
          </Typography>
        </Stack>
      </Box>
    </Html>
  );
}

interface SceneProps {
  demoType: 'bacteria' | 'molecule' | 'squirrel' | 'all';
  flagellaCount: number;
  enableRotation: boolean;
  alignWithSurface: boolean;
  showAttachmentPoints: boolean;
}

function Scene({ demoType, flagellaCount, enableRotation, alignWithSurface, showAttachmentPoints }: SceneProps) {
  const time = useRef(0);

  useFrame((_, delta) => {
    if (enableRotation) {
      time.current += delta * 0.5;
    }
  });

  const createBacteria = useMemo((): HostPrimitive => {
    const bacteriaBody: SDFPrimitive = {
      type: 'capsule',
      position: [-3, 0, 0],
      params: [0, 0, 0.8, 0.3],
      materialId: 'element-c',
      rotation: [0, time.current, 0]
    };

    const flagella: ForeignBody[] = [];
    for (let i = 0; i < flagellaCount; i++) {
      const angle = (i / flagellaCount) * Math.PI * 2;
      flagella.push({
        primitive: {
          type: 'cylinder',
          position: [0, 0, 0],
          params: [0.8, 0.03],
          materialId: 'element-h',
        },
        attachmentOffset: [
          Math.cos(angle) * 0.2,
          Math.sin(angle) * 0.2,
          0.8
        ],
        attachmentRotation: [Math.PI / 3, angle, 0],
        alignWithSurface
      });
    }

    return {
      primitive: bacteriaBody,
      attachedBodies: flagella
    };
  }, [flagellaCount, alignWithSurface]);

  const createMolecule = useMemo((): HostPrimitive => {
    const centralAtom: SDFPrimitive = {
      type: 'sphere',
      position: [0, 0, 0],
      params: [0.4],
      materialId: 'element-c',
      rotation: [0, time.current, 0]
    };

    const bonds: ForeignBody[] = [
      {
        primitive: {
          type: 'capsule',
          position: [0, 0, 0],
          params: [0, 0, 0.6, 0.05],
          materialId: 'bond',
        },
        attachmentOffset: [0, 0, 0.4],
        attachmentRotation: [0, 0, 0],
        alignWithSurface: true
      },
      {
        primitive: {
          type: 'capsule',
          position: [0, 0, 0],
          params: [0, 0, 0.6, 0.05],
          materialId: 'bond',
        },
        attachmentOffset: [0.35, 0, -0.2],
        attachmentRotation: [0, 0, Math.PI * 2 / 3],
        alignWithSurface: true
      },
      {
        primitive: {
          type: 'capsule',
          position: [0, 0, 0],
          params: [0, 0, 0.6, 0.05],
          materialId: 'bond',
        },
        attachmentOffset: [-0.35, 0, -0.2],
        attachmentRotation: [0, 0, -Math.PI * 2 / 3],
        alignWithSurface: true
      },
      {
        primitive: {
          type: 'sphere',
          position: [0, 0, 0],
          params: [0.2],
          materialId: 'element-h',
        },
        attachmentOffset: [0, 0, 1.0],
        attachmentRotation: [0, 0, 0],
        alignWithSurface: false
      },
      {
        primitive: {
          type: 'sphere',
          position: [0, 0, 0],
          params: [0.25],
          materialId: 'element-o',
        },
        attachmentOffset: [0.7, 0, -0.4],
        attachmentRotation: [0, 0, 0],
        alignWithSurface: false
      },
      {
        primitive: {
          type: 'sphere',
          position: [0, 0, 0],
          params: [0.25],
          materialId: 'element-o',
        },
        attachmentOffset: [-0.7, 0, -0.4],
        attachmentRotation: [0, 0, 0],
        alignWithSurface: false
      }
    ];

    return {
      primitive: centralAtom,
      attachedBodies: bonds
    };
  }, [alignWithSurface]);

  const createSquirrel = useMemo((): HostPrimitive => {
    const body: SDFPrimitive = {
      type: 'ellipsoid',
      position: [3, 0, 0],
      params: [0.4, 0.3, 0.6],
      materialId: 'element-cu',
      rotation: [0, time.current * 0.5, 0]
    };

    const parts: ForeignBody[] = [
      {
        primitive: {
          type: 'sphere',
          position: [0, 0, 0],
          params: [0.25],
          materialId: 'element-cu',
        },
        attachmentOffset: [0, 0.5, 0.3],
        attachmentRotation: [0, 0, 0],
        alignWithSurface: false
      },
      {
        primitive: {
          type: 'ellipsoid',
          position: [0, 0, 0],
          params: [0.08, 0.15, 0.08],
          materialId: 'element-cu',
        },
        attachmentOffset: [0.3, -0.2, 0.3],
        attachmentRotation: [0, 0, 0],
        alignWithSurface: true
      },
      {
        primitive: {
          type: 'ellipsoid',
          position: [0, 0, 0],
          params: [0.08, 0.15, 0.08],
          materialId: 'element-cu',
        },
        attachmentOffset: [-0.3, -0.2, 0.3],
        attachmentRotation: [0, 0, 0],
        alignWithSurface: true
      },
      {
        primitive: {
          type: 'ellipsoid',
          position: [0, 0, 0],
          params: [0.08, 0.15, 0.08],
          materialId: 'element-cu',
        },
        attachmentOffset: [0.3, -0.2, -0.3],
        attachmentRotation: [0, 0, 0],
        alignWithSurface: true
      },
      {
        primitive: {
          type: 'ellipsoid',
          position: [0, 0, 0],
          params: [0.08, 0.15, 0.08],
          materialId: 'element-cu',
        },
        attachmentOffset: [-0.3, -0.2, -0.3],
        attachmentRotation: [0, 0, 0],
        alignWithSurface: true
      },
      {
        primitive: {
          type: 'ellipsoid',
          position: [0, 0, 0],
          params: [0.15, 0.15, 0.4],
          materialId: 'element-cu',
        },
        attachmentOffset: [0, 0.2, -0.8],
        attachmentRotation: [Math.PI / 3, 0, 0],
        alignWithSurface: true
      }
    ];

    return {
      primitive: body,
      attachedBodies: parts
    };
  }, [alignWithSurface]);

  const attachmentPointMarkers = useMemo(() => {
    if (!showAttachmentPoints) return [];

    const markers: SDFPrimitive[] = [];
    const bacteria = createBacteria;
    
    const points = foreignBodySystem.sampleSurfacePoints(bacteria.primitive, 20);
    
    points.forEach((point, index) => {
      markers.push({
        type: 'sphere',
        position: [
          bacteria.primitive.position[0] + point.position[0],
          bacteria.primitive.position[1] + point.position[1],
          bacteria.primitive.position[2] + point.position[2]
        ],
        params: [0.05],
        materialId: 'element-au'
      });
    });

    return markers;
  }, [showAttachmentPoints, createBacteria]);

  const hostPrimitives = useMemo(() => {
    const hosts: HostPrimitive[] = [];
    
    if (demoType === 'bacteria' || demoType === 'all') {
      hosts.push(createBacteria);
    }
    
    if (demoType === 'molecule' || demoType === 'all') {
      hosts.push(createMolecule);
    }
    
    if (demoType === 'squirrel' || demoType === 'all') {
      hosts.push(createSquirrel);
    }
    
    return hosts;
  }, [demoType, createBacteria, createMolecule, createSquirrel]);

  const totalPrimitiveCount = useMemo(() => {
    return hostPrimitives.reduce((count, host) => {
      return count + 1 + host.attachedBodies.length;
    }, 0) + attachmentPointMarkers.length;
  }, [hostPrimitives, attachmentPointMarkers]);

  return (
    <>
      <color attach="background" args={['#0a0a0a']} />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4080ff" />
      
      <SDFRenderer 
        hostPrimitives={hostPrimitives}
        primitives={attachmentPointMarkers}
        maxSteps={256}
        precision={0.001}
      />
      
      <FPSCounter primitiveCount={totalPrimitiveCount} compositeCount={hostPrimitives.length} />
      
      <OrbitControls 
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={15}
      />
    </>
  );
}

export function ForeignBodyDemo() {
  const [demoType, setDemoType] = useState<'bacteria' | 'molecule' | 'squirrel' | 'all'>('bacteria');
  const [flagellaCount, setFlagellaCount] = useState(4);
  const [enableRotation, setEnableRotation] = useState(true);
  const [alignWithSurface, setAlignWithSurface] = useState(true);
  const [showAttachmentPoints, setShowAttachmentPoints] = useState(false);

  return (
    <Box sx={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 3, 8], fov: 50 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene
            demoType={demoType}
            flagellaCount={flagellaCount}
            enableRotation={enableRotation}
            alignWithSurface={alignWithSurface}
            showAttachmentPoints={showAttachmentPoints}
          />
        </Suspense>
      </Canvas>

      <Paper
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          p: 3,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          maxWidth: 380,
          zIndex: 1000,
        }}
      >
        <Stack spacing={3}>
          <Typography variant="h5" gutterBottom>
            Foreign Body Attachment Demo
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Demonstrates composite primitive construction using foreign body attachment system.
          </Typography>

          <Stack spacing={2}>
            <Typography variant="subtitle2" gutterBottom>
              Demo Type
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                variant={demoType === 'bacteria' ? 'contained' : 'outlined'}
                onClick={() => setDemoType('bacteria')}
                size="small"
              >
                Bacteria
              </Button>
              <Button
                variant={demoType === 'molecule' ? 'contained' : 'outlined'}
                onClick={() => setDemoType('molecule')}
                size="small"
              >
                Molecule
              </Button>
              <Button
                variant={demoType === 'squirrel' ? 'contained' : 'outlined'}
                onClick={() => setDemoType('squirrel')}
                size="small"
              >
                Squirrel
              </Button>
              <Button
                variant={demoType === 'all' ? 'contained' : 'outlined'}
                onClick={() => setDemoType('all')}
                size="small"
              >
                All
              </Button>
            </Stack>
          </Stack>

          {demoType === 'bacteria' && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Flagella Count: {flagellaCount}
              </Typography>
              <Slider
                value={flagellaCount}
                onChange={(_, value) => setFlagellaCount(value as number)}
                min={1}
                max={12}
                step={1}
                marks
                valueLabelDisplay="auto"
              />
            </Box>
          )}

          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={enableRotation}
                  onChange={(e) => setEnableRotation(e.target.checked)}
                />
              }
              label="Enable Rotation"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={alignWithSurface}
                  onChange={(e) => setAlignWithSurface(e.target.checked)}
                />
              }
              label="Align with Surface Normal"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showAttachmentPoints}
                  onChange={(e) => setShowAttachmentPoints(e.target.checked)}
                />
              }
              label="Show Attachment Points"
            />
          </Stack>

          <Box sx={{ bgcolor: 'rgba(0, 0, 0, 0.05)', p: 2, borderRadius: 1 }}>
            <Typography variant="caption" component="div">
              <strong>Instructions:</strong>
            </Typography>
            <Typography variant="caption" component="div">
              • Left click + drag to rotate camera
            </Typography>
            <Typography variant="caption" component="div">
              • Scroll to zoom in/out
            </Typography>
            <Typography variant="caption" component="div">
              • Toggle controls to explore different attachment modes
            </Typography>
          </Box>

          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              <strong>Bacteria:</strong> Capsule body with cylinder flagella
            </Typography>
            <Typography variant="caption" color="text.secondary">
              <strong>Molecule:</strong> Central atom with bonds and functional groups
            </Typography>
            <Typography variant="caption" color="text.secondary">
              <strong>Squirrel:</strong> Body + head + 4 legs + tail composite
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}

export default ForeignBodyDemo;
