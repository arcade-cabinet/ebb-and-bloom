/**
 * HUD COMPASS
 * 
 * Compass display (DFU HUDCompass.cs pattern).
 * Positioned bottom-right like Daggerfall.
 * Uses Material UI Box component.
 */

import { Box, Typography } from '@mui/material';
import { useRef, useEffect } from 'react';

interface HUDCompassProps {
  heading?: number; // 0-360 degrees
}

export function HUDCompass({ heading = 0 }: HUDCompassProps) {
  const compassRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (compassRef.current) {
      // Rotate compass to match heading
      compassRef.current.style.transform = `rotate(${-heading}deg)`;
    }
  }, [heading]);

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 128,
        height: 128,
        zIndex: 1000,
      }}
    >
      {/* Compass Box */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)',
          border: '2px solid rgba(255,255,255,0.5)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Compass Needle */}
        <Box
          ref={compassRef}
          sx={{
            position: 'absolute',
            width: '4px',
            height: '60px',
            backgroundColor: '#ff0000',
            transformOrigin: 'center bottom',
            transition: 'transform 0.1s ease',
          }}
        />
        
        {/* N/S/E/W Labels */}
        <Box
          sx={{
            position: 'absolute',
            color: 'text.primary',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              top: '5px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'primary.main',
              fontWeight: 700,
            }}
          >
            N
          </Typography>
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              bottom: '5px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'text.secondary',
              fontWeight: 600,
            }}
          >
            S
          </Typography>
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              left: '5px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'text.secondary',
              fontWeight: 600,
            }}
          >
            W
          </Typography>
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              right: '5px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'text.secondary',
              fontWeight: 600,
            }}
          >
            E
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

