import { Box, Button, Stack, Typography, Paper, Switch, FormControlLabel } from '@mui/material';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';
import { SDFPrimitive } from '../../engine/rendering/sdf/types';
import { SDFRenderer } from '../../engine/rendering/sdf/renderer/SDFRenderer';

const LIGHT_COLORS = {
  white: '#ffffff',
  red: '#ff4444',
  blue: '#4444ff',
  green: '#44ff44',
  yellow: '#ffff44',
  purple: '#ff44ff',
};

interface SceneProps {
  directionalEnabled: boolean;
  pointEnabled: boolean;
  spotEnabled: boolean;
  directionalColor: string;
  pointColor: string;
  spotColor: string;
}

function Scene({
  directionalEnabled,
  pointEnabled,
  spotEnabled,
  directionalColor,
  pointColor,
  spotColor,
}: SceneProps) {
  const primitives: SDFPrimitive[] = [
    {
      type: 'torus',
      position: [-2, 0, 0],
      rotation: [Math.PI / 4, Math.PI / 4, 0],
      scale: [1.5, 1.5, 1.5],
      params: [0.6, 0.2],
      materialId: 'element-au',
    },
    {
      type: 'sphere',
      position: [2, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      params: [0.8],
      materialId: 'element-ag',
    },
    {
      type: 'box',
      position: [0, -2, 0],
      rotation: [0, Math.PI / 4, 0],
      scale: [3, 0.2, 3],
      params: [1, 1, 1],
      materialId: 'element-fe',
    },
  ];

  return (
    <>
      <SDFRenderer primitives={primitives} maxSteps={128} precision={0.001} maxDistance={30} />
      
      <ambientLight intensity={0.1} />
      
      {directionalEnabled && (
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.0}
          color={directionalColor}
          castShadow
        />
      )}
      
      {pointEnabled && (
        <pointLight
          position={[0, 3, 2]}
          intensity={2.0}
          color={pointColor}
          distance={15}
          decay={2}
        />
      )}
      
      {spotEnabled && (
        <spotLight
          position={[-3, 3, 3]}
          angle={0.5}
          penumbra={0.3}
          intensity={2.0}
          color={spotColor}
          castShadow
        />
      )}
    </>
  );
}

export function LightingShowcase() {
  const [directionalEnabled, setDirectionalEnabled] = useState(true);
  const [pointEnabled, setPointEnabled] = useState(false);
  const [spotEnabled, setSpotEnabled] = useState(false);
  
  const [directionalColor, setDirectionalColor] = useState(LIGHT_COLORS.white);
  const [pointColor, setPointColor] = useState(LIGHT_COLORS.red);
  const [spotColor, setSpotColor] = useState(LIGHT_COLORS.blue);

  const lightingSetup = () => {
    const enabled = [];
    if (directionalEnabled) enabled.push('Directional');
    if (pointEnabled) enabled.push('Point');
    if (spotEnabled) enabled.push('Spot');
    return enabled.length > 0 ? enabled.join(' + ') : 'None (Ambient only)';
  };

  const presets = [
    { name: 'Directional Only', dir: true, point: false, spot: false },
    { name: 'Point Only', dir: false, point: true, spot: false },
    { name: 'Spot Only', dir: false, point: false, spot: true },
    { name: 'Combined', dir: true, point: true, spot: true },
  ];

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
          maxWidth: 350,
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h5">Lighting Showcase</Typography>
          <Typography variant="body2" color="grey.400">
            SDF Raymarch + R3F Lights Integration
          </Typography>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Active Setup: {lightingSetup()}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>Quick Presets</Typography>
            <Stack spacing={1}>
              {presets.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={() => {
                    setDirectionalEnabled(preset.dir);
                    setPointEnabled(preset.point);
                    setSpotEnabled(preset.spot);
                  }}
                  data-testid={`preset-${preset.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {preset.name}
                </Button>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>Light Controls</Typography>
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={directionalEnabled}
                    onChange={(e) => setDirectionalEnabled(e.target.checked)}
                    data-testid="toggle-directional"
                  />
                }
                label="Directional Light"
              />
              {directionalEnabled && (
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  {Object.entries(LIGHT_COLORS).map(([name, color]) => (
                    <Button
                      key={name}
                      size="small"
                      variant={directionalColor === color ? 'contained' : 'outlined'}
                      onClick={() => setDirectionalColor(color)}
                      sx={{ minWidth: 40, bgcolor: directionalColor === color ? color : 'transparent' }}
                      data-testid={`directional-color-${name}`}
                    >
                      {name}
                    </Button>
                  ))}
                </Stack>
              )}

              <FormControlLabel
                control={
                  <Switch
                    checked={pointEnabled}
                    onChange={(e) => setPointEnabled(e.target.checked)}
                    data-testid="toggle-point"
                  />
                }
                label="Point Light"
              />
              {pointEnabled && (
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  {Object.entries(LIGHT_COLORS).map(([name, color]) => (
                    <Button
                      key={name}
                      size="small"
                      variant={pointColor === color ? 'contained' : 'outlined'}
                      onClick={() => setPointColor(color)}
                      sx={{ minWidth: 40, bgcolor: pointColor === color ? color : 'transparent' }}
                      data-testid={`point-color-${name}`}
                    >
                      {name}
                    </Button>
                  ))}
                </Stack>
              )}

              <FormControlLabel
                control={
                  <Switch
                    checked={spotEnabled}
                    onChange={(e) => setSpotEnabled(e.target.checked)}
                    data-testid="toggle-spot"
                  />
                }
                label="Spot Light"
              />
              {spotEnabled && (
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  {Object.entries(LIGHT_COLORS).map(([name, color]) => (
                    <Button
                      key={name}
                      size="small"
                      variant={spotColor === color ? 'contained' : 'outlined'}
                      onClick={() => setSpotColor(color)}
                      sx={{ minWidth: 40, bgcolor: spotColor === color ? color : 'transparent' }}
                      data-testid={`spot-color-${name}`}
                    >
                      {name}
                    </Button>
                  ))}
                </Stack>
              )}
            </Stack>
          </Box>

          <Typography variant="caption" color="grey.500">
            Orbit camera • Scroll to zoom
          </Typography>
        </Stack>
      </Paper>

      <Canvas camera={{ position: [0, 3, 8], fov: 60 }}>
        <Suspense fallback={null}>
          <Scene
            directionalEnabled={directionalEnabled}
            pointEnabled={pointEnabled}
            spotEnabled={spotEnabled}
            directionalColor={directionalColor}
            pointColor={pointColor}
            spotColor={spotColor}
          />
        </Suspense>
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
    </Box>
  );
}

export default LightingShowcase;
