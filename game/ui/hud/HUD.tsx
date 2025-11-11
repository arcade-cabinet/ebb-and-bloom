/**
 * HUD (Heads-Up Display)
 * 
 * Based on Daggerfall Unity's DaggerfallHUD.cs pattern.
 * Main HUD component that contains all HUD sub-components.
 */

/// <reference types="vite/client" />

import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import { useUIManager } from '../UIManager';
import { useWorld } from '../WorldContext';
import { HUDVitals } from './HUDVitals';
import { HUDCompass } from './HUDCompass';
import { HUDCrosshair } from './HUDCrosshair';
import { HUDInfo } from './HUDInfo';

export function HUD() {
  const { isHUDVisible } = useUIManager();
  const { world, seed } = useWorld();
  const navigate = useNavigate();
  const [playerPosition, setPlayerPosition] = useState<{ x: number; y: number; z: number } | null>(null);
  const [heading, setHeading] = useState(0);
  
  // Check if we're in development mode (Vite provides import.meta.env.DEV)
  const isDev = import.meta.env.DEV;

  // Update player position and heading from world
  useEffect(() => {
    if (!world || !isHUDVisible) return;

    const updateHUD = () => {
      if (world.isReady) {
        const pos = world.getPlayerPosition();
        setPlayerPosition({ x: pos.x, y: pos.y, z: pos.z });

        // Get camera heading (yaw) from camera rotation
        // Camera yaw is stored in player controller, but we can derive from camera
        // For now, use a simple calculation based on camera forward direction
        if (world.camera) {
          const forward = new THREE.Vector3();
          world.camera.getWorldDirection(forward);
          const angle = Math.atan2(forward.x, forward.z);
          const degrees = (angle * 180) / Math.PI;
          setHeading((degrees + 360) % 360);
        }
      }
    };

    const interval = setInterval(updateHUD, 100); // Update 10 times per second
    updateHUD(); // Initial update

    return () => clearInterval(interval);
  }, [world, isHUDVisible]);

  if (!isHUDVisible) {
    return null;
  }

  return (
    <>
      <HUDVitals />
      <HUDCompass heading={heading} />
      <HUDCrosshair />
      <HUDInfo seed={seed || undefined} position={playerPosition || undefined} />
      
      {/* DEV-ONLY: Demos menu button for testing isolated features */}
      {isDev && (
        <Button
          variant="contained"
          startIcon={<ScienceIcon />}
          onClick={() => navigate('/demos')}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            bgcolor: '#7fb069',
            color: '#1a1a1a',
            fontWeight: 'bold',
            minHeight: '44px',
            zIndex: 1000,
            '&:hover': { bgcolor: '#6a9557' },
          }}
        >
          Demos Lab
        </Button>
      )}
    </>
  );
}

