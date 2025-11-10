/**
 * GAME COMPONENT
 * 
 * Main game using ONLY WorldManager API.
 * No engine internals touched.
 */

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, PointerLockControls, Stats } from '@react-three/drei';
import { WorldManager } from 'ebb-and-bloom-engine';

function World() {
  const { scene, camera } = useThree();
  const worldRef = useRef<WorldManager | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize world using ENGINE API
    const world = new WorldManager();
    world.initialize({
      seed: 'v1-green-valley-breeze',
      scene,
      camera,
      chunkDistance: 3
    });
    
    worldRef.current = world;
    setIsReady(true);
    
    console.log('🌍 World initialized using WorldManager API');
  }, [scene, camera]);

  useFrame((state, delta) => {
    if (!worldRef.current) return;
    
    // ENGINE API: Single update call
    worldRef.current.update(delta);
    
    // Camera follows player automatically (PlayerController handles this)
  });

  return (
    <>
      <Sky sunPosition={[100, 50, 100]} />
      <directionalLight position={[50, 100, 50]} intensity={1.2} castShadow />
      <ambientLight intensity={0.6} />
      <fog attach="fog" args={['#87CEEB', 400, 1200]} />
    </>
  );
}

export function Game() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        shadows
        camera={{ fov: 90, near: 0.1, far: 1500 }}
      >
        <World />
        <PointerLockControls />
        <Stats />
      </Canvas>
      
      {/* HUD Overlay */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: 'white',
        fontFamily: 'monospace',
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <div>Ebb & Bloom</div>
        <div style={{ fontSize: '12px', marginTop: '5px' }}>
          WASD - Move | Mouse - Look | Space - Jump
        </div>
      </div>
    </div>
  );
}

