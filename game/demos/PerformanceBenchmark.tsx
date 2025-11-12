import { Box, Button, Stack, Typography, Paper } from '@mui/material';
import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useState, useRef, useMemo, useEffect } from 'react';
import { SDFPrimitive } from '../../engine/rendering/sdf/types';
import { SDFRenderer } from '../../engine/rendering/sdf/renderer/SDFRenderer';

const SCENARIOS = [
  { count: 10, name: '10 Primitives' },
  { count: 50, name: '50 Primitives' },
  { count: 100, name: '100 Primitives' },
  { count: 200, name: '200 Primitives' }
];

const PRIMITIVE_TYPES = ['sphere', 'box', 'cylinder', 'torus', 'octahedron', 'hexprism', 'capsule', 'pyramid'] as const;
const MATERIAL_IDS = ['element-h', 'element-o', 'element-c', 'element-fe', 'element-au', 'element-cu', 'bond', 'default'];

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  status: 'EXCELLENT' | 'GOOD' | 'POOR';
  color: string;
}

function PerformanceDisplay({ metrics, scenario }: { metrics: PerformanceMetrics; scenario: number }) {
  const TARGET_FPS = 60;

  return (
    <Paper
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        bgcolor: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        p: 2,
        borderRadius: 1,
        minWidth: 250,
        zIndex: 1000,
      }}
    >
      <Stack spacing={1.5}>
        <Typography variant="h6">Performance Metrics</Typography>
        <Box>
          <Typography variant="body2" color="grey.400">
            Scenario: {SCENARIOS[scenario].name}
          </Typography>
        </Box>
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 1.5, borderRadius: 1 }}>
          <Typography variant="h4" sx={{ color: metrics.color, fontWeight: 'bold' }}>
            {metrics.fps} FPS
          </Typography>
          <Typography variant="caption" color="grey.400">
            Target: {TARGET_FPS} FPS
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2">Frame Time: {metrics.frameTime.toFixed(2)}ms</Typography>
          <Typography variant="body2">Status: <span style={{ color: metrics.color }}>{metrics.status}</span></Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

interface SceneProps {
  primitiveCount: number;
  onMetricsUpdate: (metrics: PerformanceMetrics) => void;
}

function Scene({ primitiveCount, onMetricsUpdate }: SceneProps) {
  const time = useRef(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useFrame((_, delta) => {
    time.current += delta;
    frameCount.current++;

    const currentTime = performance.now();
    const elapsed = currentTime - lastTime.current;

    if (elapsed >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / elapsed);
      const frameTime = elapsed / frameCount.current;
      
      let status: 'EXCELLENT' | 'GOOD' | 'POOR';
      let color: string;
      
      if (fps > 55) {
        status = 'EXCELLENT';
        color = '#4caf50';
      } else if (fps >= 45) {
        status = 'GOOD';
        color = '#ff9800';
      } else {
        status = 'POOR';
        color = '#f44336';
      }

      onMetricsUpdate({ fps, frameTime, status, color });
      frameCount.current = 0;
      lastTime.current = currentTime;
    }
  });

  const primitives = useMemo(() => {
    const prims: SDFPrimitive[] = [];
    const gridSize = Math.ceil(Math.sqrt(primitiveCount));
    const spacing = 2.0;

    for (let i = 0; i < primitiveCount; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      const x = (col - gridSize / 2) * spacing;
      const y = (row - gridSize / 2) * spacing;
      const z = 0;

      const primitiveType = PRIMITIVE_TYPES[i % PRIMITIVE_TYPES.length];
      const materialId = MATERIAL_IDS[i % MATERIAL_IDS.length];

      const rotation: [number, number, number] = [
        time.current * 0.3 + i * 0.1,
        time.current * 0.5 + i * 0.2,
        time.current * 0.2 + i * 0.15
      ];

      let params: any;
      switch (primitiveType) {
        case 'sphere': params = [0.4]; break;
        case 'box': params = [0.3, 0.3, 0.3]; break;
        case 'cylinder': params = [0.4, 0.25]; break;
        case 'torus': params = [0.3, 0.12]; break;
        case 'octahedron': params = [0.4]; break;
        case 'hexprism': params = [0.25, 0.4]; break;
        case 'capsule': params = [0, 0.4, 0, 0.12]; break;
        case 'pyramid': params = [0.4]; break;
        default: params = [0.4];
      }

      prims.push({
        type: primitiveType as any,
        position: [x, y, z],
        rotation,
        scale: [1, 1, 1],
        params,
        materialId,
      });
    }

    return prims;
  }, [primitiveCount]);

  return <SDFRenderer primitives={primitives} maxSteps={128} precision={0.001} maxDistance={50} />;
}

export function PerformanceBenchmark() {
  const [scenario, setScenario] = useState(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    status: 'EXCELLENT',
    color: '#4caf50'
  });
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setScenario((prev) => (prev + 1) % SCENARIOS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRotate]);

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
          maxWidth: 300,
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h5">Performance Benchmark</Typography>
          <Typography variant="body2" color="grey.400">
            Testing SDF rendering performance
          </Typography>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Auto-Cycle: {autoRotate ? 'ON' : 'OFF'}
            </Typography>
            <Button
              variant={autoRotate ? 'contained' : 'outlined'}
              onClick={() => setAutoRotate(!autoRotate)}
              fullWidth
              size="small"
              data-testid="toggle-auto-rotate"
            >
              {autoRotate ? 'Disable' : 'Enable'} Auto-Cycle
            </Button>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Manual Selection
            </Typography>
            <Stack spacing={0.5}>
              {SCENARIOS.map((s, idx) => (
                <Button
                  key={idx}
                  variant={scenario === idx ? 'contained' : 'outlined'}
                  onClick={() => setScenario(idx)}
                  size="small"
                  fullWidth
                  data-testid={`scenario-${s.count}`}
                >
                  {s.name}
                </Button>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <PerformanceDisplay metrics={metrics} scenario={scenario} />

      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <Suspense fallback={null}>
          <Scene primitiveCount={SCENARIOS[scenario].count} onMetricsUpdate={setMetrics} />
        </Suspense>
        <OrbitControls enableDamping dampingFactor={0.05} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1.0} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      </Canvas>
    </Box>
  );
}

export default PerformanceBenchmark;
