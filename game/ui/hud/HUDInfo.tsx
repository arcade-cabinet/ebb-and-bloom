/**
 * HUD INFO
 * 
 * Game info display (position, seed, etc.).
 * Positioned top-left like Daggerfall.
 * Uses Material UI components aligned with DESIGN.md.
 */

import { Typography, Paper } from '@mui/material';

interface HUDInfoProps {
  seed?: string;
  position?: { x: number; y: number; z: number };
}

export function HUDInfo({ seed, position }: HUDInfoProps) {
  return (
    <Paper
      data-testid="hud-info"
      elevation={4}
      sx={{
        position: 'absolute',
        top: { xs: 10, sm: 20 },
        left: { xs: 10, sm: 20 },
        p: 1.5,
        backgroundColor: 'background.paper',
        zIndex: 1000,
        maxWidth: { xs: 'calc(100vw - 20px)', sm: 'auto' },
      }}
    >
      <Typography 
        variant="body2" 
        sx={{ 
          fontWeight: 'bold', 
          mb: 0.75,
          color: 'primary.main',
        }}
      >
        Ebb & Bloom
      </Typography>
      {seed && (
        <Typography 
          variant="caption" 
          className="mono"
          sx={{ 
            opacity: 0.8, 
            display: 'block',
            color: 'text.secondary',
          }}
        >
          Seed: {seed}
        </Typography>
      )}
      {position && (
        <Typography 
          variant="caption" 
          className="mono"
          sx={{ 
            opacity: 0.8, 
            display: 'block', 
            mt: 0.75,
            color: 'text.secondary',
          }}
        >
          ({position.x.toFixed(0)}, {position.y.toFixed(0)}, {position.z.toFixed(0)})
        </Typography>
      )}
      <Typography 
        data-testid="hud-controls"
        variant="caption" 
        sx={{ 
          opacity: 0.7, 
          display: 'block', 
          mt: 0.75,
          fontSize: '10px',
          color: 'text.secondary',
        }}
      >
        Click to lock pointer<br />
        WASD - Move | Mouse - Look | Space - Jump | ESC - Pause
      </Typography>
    </Paper>
  );
}
