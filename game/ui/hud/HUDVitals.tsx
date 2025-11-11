/**
 * HUD VITALS
 * 
 * Health/Fatigue/Magicka bars (DFU HUDVitals.cs pattern).
 * Positioned bottom-left like Daggerfall.
 * Uses Material UI Box component.
 */

import { Box } from '@mui/material';
import { useRef, useEffect } from 'react';

interface HUDVitalsProps {
  health?: number; // 0-1
  fatigue?: number; // 0-1
  magicka?: number; // 0-1
}

export function HUDVitals({ 
  health = 1.0, 
  fatigue = 1.0, 
  magicka = 1.0 
}: HUDVitalsProps) {
  const healthBarRef = useRef<HTMLDivElement>(null);
  const fatigueBarRef = useRef<HTMLDivElement>(null);
  const magickaBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Smooth animation for bar changes (DFU pattern)
    if (healthBarRef.current) {
      healthBarRef.current.style.height = `${health * 100}%`;
    }
    if (fatigueBarRef.current) {
      fatigueBarRef.current.style.height = `${fatigue * 100}%`;
    }
    if (magickaBarRef.current) {
      magickaBarRef.current.style.height = `${magicka * 100}%`;
    }
  }, [health, fatigue, magicka]);

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        display: 'flex',
        gap: 1,
        zIndex: 1000,
      }}
    >
      {/* Health Bar */}
      <Box
        sx={{
          width: 32,
          height: 128,
          backgroundColor: 'rgba(0,0,0,0.7)',
          border: '2px solid rgba(255,255,255,0.5)',
          borderRadius: 1,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          ref={healthBarRef}
          sx={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            backgroundColor: '#ff0000',
            transition: 'height 0.3s ease',
          }}
        />
      </Box>

      {/* Fatigue Bar */}
      <Box
        sx={{
          width: 32,
          height: 128,
          backgroundColor: 'rgba(0,0,0,0.7)',
          border: '2px solid rgba(255,255,255,0.5)',
          borderRadius: 1,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          ref={fatigueBarRef}
          sx={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            backgroundColor: '#ff8800',
            transition: 'height 0.3s ease',
          }}
        />
      </Box>

      {/* Magicka Bar */}
      <Box
        sx={{
          width: 32,
          height: 128,
          backgroundColor: 'rgba(0,0,0,0.7)',
          border: '2px solid rgba(255,255,255,0.5)',
          borderRadius: 1,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          ref={magickaBarRef}
          sx={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            backgroundColor: '#0088ff',
            transition: 'height 0.3s ease',
          }}
        />
      </Box>
    </Box>
  );
}

