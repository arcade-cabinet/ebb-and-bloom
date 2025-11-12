import { useMemo, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { Box, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SDFRenderer } from '../../engine/rendering/sdf/renderer/SDFRenderer';
import { MarchingCubesRenderer, buildMolecule } from '../../engine/rendering/marching-cubes';
import { InstancedRenderer, RapierBonds } from '../../engine/rendering/instanced';
import type { InstanceData } from '../../engine/rendering/instanced';
import type { SDFPrimitive } from '../../engine/rendering/sdf/types';

function UnifiedScene() {
  const body1Ref = useRef<any>(null);
  const body2Ref = useRef<any>(null);

  const planetCore: SDFPrimitive[] = useMemo(() => [
    {
      type: 'sphere',
      position: [0, 0, 0],
      params: [0.8],
      materialId: 'element-fe',
    }
  ], []);

  const o2Molecule = useMemo(() => buildMolecule('O2'), []);

  const particleSwarm: InstanceData[] = useMemo(() => {
    const particles: InstanceData[] = [];
    const count = 50;
    
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2;
      const phi = Math.acos(2 * (i / count) - 1);
      const radius = 3;
      
      particles.push({
        position: [
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        ],
        scale: 0.08,
        materialId: i % 3 === 0 ? 'element-h' : i % 3 === 1 ? 'element-he' : 'element-c'
      });
    }
    
    return particles;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (body1Ref.current) {
        body1Ref.current.applyImpulse({ x: 0, y: 0.5, z: 0 }, true);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <color attach="background" args={['#0a0a0f']} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <pointLight position={[-3, 2, -3]} intensity={0.5} color="#4488ff" />
      
      <group>
        <SDFRenderer
          primitives={planetCore}
          maxSteps={64}
          precision={0.01}
          enableShadows={false}
        />
      </group>

      <group position={[-2.5, 0, 0]}>
        <MarchingCubesRenderer
          blobs={o2Molecule}
          resolution={32}
        />
      </group>

      <group position={[2.5, 0, 0]}>
        <RigidBody ref={body1Ref} position={[-0.6, 0, 0]} type="dynamic">
          <mesh>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#ff4444" roughness={0.3} metalness={0.7} />
          </mesh>
        </RigidBody>
        
        <RigidBody ref={body2Ref} position={[0.6, 0, 0]} type="dynamic">
          <mesh>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#ff4444" roughness={0.3} metalness={0.7} />
          </mesh>
        </RigidBody>

        <RapierBonds
          bonds={[
            {
              id: 'o2-bond-1',
              body1: body1Ref,
              body2: body2Ref,
              bondType: 'fixed',
              anchor1: [0, 0, 0],
              anchor2: [0, 0, 0]
            }
          ]}
        />
      </group>

      <InstancedRenderer
        instances={particleSwarm}
        geometry="sphere"
        geometryArgs={[0.05, 8, 6]}
      />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={15}
      />
    </>
  );
}

export default function UnifiedRenderingDemo() {
  const navigate = useNavigate();

  return (
    <Box sx={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/demos')}
          sx={{ mb: 2 }}
        >
          Back to Demos
        </Button>
        
        <Box sx={{ 
          bgcolor: 'rgba(0, 0, 0, 0.7)', 
          p: 2, 
          borderRadius: 1,
          maxWidth: 350
        }}>
          <Typography variant="h6" gutterBottom color="white">
            Unified Rendering Architecture
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2" color="white">
              <strong>Left (Center):</strong> SDF Planet Core (Fe)
            </Typography>
            <Typography variant="body2" color="white">
              <strong>Left:</strong> Marching Cubes O₂ Molecule
            </Typography>
            <Typography variant="body2" color="white">
              <strong>Right:</strong> Rapier-Bonded O₂ (Physics)
            </Typography>
            <Typography variant="body2" color="white">
              <strong>Orbiting:</strong> 50 Instanced Particles
            </Typography>
            <Typography variant="body2" color="white" sx={{ mt: 1, fontStyle: 'italic' }}>
              ⚡ Impulse force applied to bonded O₂ every 2s
            </Typography>
          </Stack>
          
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <Typography variant="caption" color="white" display="block">
              • Drag to rotate camera
            </Typography>
            <Typography variant="caption" color="white" display="block">
              • Scroll to zoom
            </Typography>
            <Typography variant="caption" color="white" display="block">
              • All systems use MaterialRegistry
            </Typography>
            <Typography variant="caption" color="white" display="block">
              • Both O₂ atoms should move together (joint test)
            </Typography>
          </Box>
        </Box>
      </Box>

      <Canvas
        camera={{ position: [5, 3, 5], fov: 50 }}
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <Physics gravity={[0, -0.5, 0]}>
          <UnifiedScene />
        </Physics>
      </Canvas>
    </Box>
  );
}
