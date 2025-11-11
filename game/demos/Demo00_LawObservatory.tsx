import { useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box, Button, Typography, FormControlLabel, Checkbox } from '@mui/material';
import { useEntities } from 'miniplex-react';
import { createAtomicWorld } from '@engine/ecs/AtomicWorld';
import { loadElementsIntoWorld } from '@engine/ecs/loaders/loadPeriodicTable';
import { gravitySystem, bondingSystem, bondPruningSystem } from '@engine/ecs/systems/AtomicSystems';
import type { World } from 'miniplex';
import type { AtomEntity } from '@engine/ecs/AtomicWorld';

function AtomRenderer({ world, enableGravity, enableBonding }: { world: World<AtomEntity>; enableGravity: boolean; enableBonding: boolean }) {
  const atoms = useEntities(world.with('element', 'position', 'visual'));
  const atomArray = Array.from(atoms);
  const lastTimeRef = useRef<number>(0);

  useFrame(({ clock }) => {
    const currentTime = clock.getElapsedTime();
    const delta = lastTimeRef.current === 0 ? 0.016 : currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    if (enableGravity) {
      gravitySystem(world, delta * 0.1);
    }

    if (enableBonding) {
      bondingSystem(world);
      bondPruningSystem(world);
    }
  });

  const atomMap = useMemo(() => {
    const map = new Map<number, AtomEntity>();
    atomArray.forEach(atom => {
      map.set(atom.id, atom);
    });
    return map;
  }, [atomArray]);

  return (
    <>
      {atomArray.map((atom, index) => (
        <mesh 
          key={`${atom.element.symbol}-${atom.element.atomicNumber}-${index}`} 
          position={[atom.position.x, atom.position.y, atom.position.z]}
        >
          <sphereGeometry args={[atom.visual.radius, 32, 32]} />
          <meshStandardMaterial
            color={atom.visual.color}
            metalness={atom.visual.metalness}
            roughness={atom.visual.roughness}
            transparent={atom.visual.opacity < 1}
            opacity={atom.visual.opacity}
            emissive={atom.visual.color}
            emissiveIntensity={atom.visual.emissive}
          />
        </mesh>
      ))}
      
      {atomArray.map((atom) => (
        atom.bonds?.map((bond, bondIndex) => {
          const target = atomMap.get(bond.targetId);
          if (!target) return null;
          
          const startX = atom.position.x;
          const startY = atom.position.y;
          const startZ = atom.position.z;
          const endX = target.position.x;
          const endY = target.position.y;
          const endZ = target.position.z;
          
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;
          const midZ = (startZ + endZ) / 2;
          
          const dx = endX - startX;
          const dy = endY - startY;
          const dz = endZ - startZ;
          const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          const bondColor = bond.bondType === 'ionic' ? '#ffaa00' : '#00aaff';
          const bondThickness = 0.02 * bond.bondOrder;
          
          return (
            <mesh 
              key={`bond-${atom.id}-${bondIndex}`}
              position={[midX, midY, midZ]}
            >
              <cylinderGeometry args={[bondThickness, bondThickness, length, 8]} />
              <meshStandardMaterial color={bondColor} />
            </mesh>
          );
        }) || []
      ))}
    </>
  );
}

export default function Demo00_LawObservatory() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const seed = searchParams.get('seed') || 'default-seed';
  
  const [enableGravity, setEnableGravity] = useState(false);
  const [enableBonding, setEnableBonding] = useState(true);

  const world = useMemo(() => {
    const atomicWorld = createAtomicWorld();
    const elementSymbols = ['H', 'He', 'C', 'N', 'O', 'F', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Fe', 'Cu', 'Au'];
    loadElementsIntoWorld(atomicWorld, elementSymbols, seed);
    return atomicWorld;
  }, [seed]);

  const atomCount = world.entities.length;

  return (
    <Box sx={{ width: '100vw', height: '100vh', position: 'relative', bgcolor: '#0a0a0a' }}>
      <Box sx={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ color: '#7fb069' }}>Demo 00: Law Observatory</Typography>
          <Typography variant="caption" sx={{ color: '#b0b0b0' }}>Seed: {seed} | Atoms: {atomCount}</Typography>
        </Box>
        <Button variant="outlined" size="small" onClick={() => navigate('/demos')} sx={{ color: '#7fb069', borderColor: '#7fb069' }}>
          Back to Demos
        </Button>
      </Box>

      <Box sx={{ position: 'absolute', bottom: 16, left: 16, zIndex: 10, bgcolor: 'rgba(0,0,0,0.7)', p: 2, borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ color: '#7fb069', mb: 1 }}>Physics Systems</Typography>
        <FormControlLabel
          control={
            <Checkbox 
              checked={enableGravity} 
              onChange={(e) => setEnableGravity(e.target.checked)}
              sx={{ color: '#7fb069', '&.Mui-checked': { color: '#7fb069' } }}
            />
          }
          label={<Typography variant="body2" sx={{ color: '#b0b0b0' }}>Gravity (F = G*m1*m2/r²)</Typography>}
        />
        <FormControlLabel
          control={
            <Checkbox 
              checked={enableBonding} 
              onChange={(e) => setEnableBonding(e.target.checked)}
              sx={{ color: '#7fb069', '&.Mui-checked': { color: '#7fb069' } }}
            />
          }
          label={<Typography variant="body2" sx={{ color: '#b0b0b0' }}>Bonding (Valence Electrons)</Typography>}
        />
      </Box>

      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#7fb069" />
        <AtomRenderer world={world} enableGravity={enableGravity} enableBonding={enableBonding} />
        <OrbitControls enableDamping />
        <gridHelper args={[20, 20, '#333333', '#1a1a1a']} />
      </Canvas>
    </Box>
  );
}
