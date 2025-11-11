/**
 * HUD CROSSHAIR
 * 
 * Crosshair display (DFU HUDCrosshair.cs pattern).
 * Centered on screen.
 * Uses Material UI Box component.
 */

import { Box } from '@mui/material';

export function HUDCrosshair() {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 20,
        height: 20,
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      {/* Horizontal line */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: '100%',
          height: '2px',
          backgroundColor: 'rgba(255,255,255,0.8)',
          transform: 'translateY(-50%)',
        }}
      />
      {/* Vertical line */}
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: 0,
          width: '2px',
          height: '100%',
          backgroundColor: 'rgba(255,255,255,0.8)',
          transform: 'translateX(-50%)',
        }}
      />
    </Box>
  );
}

