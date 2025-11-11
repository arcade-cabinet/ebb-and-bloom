/**
 * HUD (Heads-Up Display)
 * 
 * Based on Daggerfall Unity's DaggerfallHUD.cs pattern.
 * Main HUD component that contains all HUD sub-components.
 */

import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { useUIManager } from '../UIManager';
import { useWorld } from '../WorldContext';
import { HUDVitals } from './HUDVitals';
import { HUDCompass } from './HUDCompass';
import { HUDCrosshair } from './HUDCrosshair';
import { HUDInfo } from './HUDInfo';

export function HUD() {
  const { isHUDVisible } = useUIManager();
  const { world, seed } = useWorld();
  const [playerPosition, setPlayerPosition] = useState<{ x: number; y: number; z: number } | null>(null);
  const [heading, setHeading] = useState(0);

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
    </>
  );
}

