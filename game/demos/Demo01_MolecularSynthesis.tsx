import { useSearchParams, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box, Button, Typography } from '@mui/material';

export default function Demo01_MolecularSynthesis() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const seed = searchParams.get('seed') || 'default-seed';

  return (
    <Box sx={{ width: '100vw', height: '100vh', position: 'relative', bgcolor: '#1a1a1a' }}>
      <Box sx={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ color: '#7fb069' }}>Demo 01: Molecular Synthesis</Typography>
          <Typography variant="caption" sx={{ color: '#b0b0b0' }}>Seed: {seed}</Typography>
        </Box>
        <Button variant="outlined" size="small" onClick={() => navigate('/demos')} sx={{ color: '#7fb069', borderColor: '#7fb069' }}>
          Back to Demos
        </Button>
      </Box>

      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <mesh>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        <OrbitControls enableDamping />
      </Canvas>
    </Box>
  );
}
