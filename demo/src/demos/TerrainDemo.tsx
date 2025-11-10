/**
 * TERRAIN DEMO
 * 
 * Full R3F port of the working game.html (120 FPS Daggerfall-style open world)
 * 
 * Features:
 * - SimplexNoise terrain (7x7 chunk streaming)
 * - 11 biomes (Whittaker diagram)
 * - Vegetation (instanced, steepness + clearance)
 * - Water system (animated shaders)
 * - Settlements (law-based placement)
 * - NPCs (58 with daily schedules)
 * - Creatures (100 with Yuka AI)
 * - First-person controls
 */

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, PointerLockControls, Stats } from '@react-three/drei';
import { useGameStore } from '../store/gameStore';
import { ChunkManager } from '../../../engine/spawners/ChunkManager';
import { EntityManager, Vehicle, Time as YukaTime } from 'yuka';
import { TerrainHUD } from '../components/TerrainHUD';
import { TerrainControls } from '../components/TerrainControls';
import './TerrainDemo.css';

const TerrainScene: React.FC<{ seed: string }> = ({ seed }) => {
  const { scene } = useThree();
  const chunkManagerRef = useRef<ChunkManager | null>(null);
  const entityManagerRef = useRef<EntityManager>(new EntityManager());
  const playerRef = useRef<Vehicle>(new Vehicle());
  const timeRef = useRef(new YukaTime());
  const { setPlayerPosition, world } = useGameStore();
  
  // Initialize chunk manager
  useEffect(() => {
    if (!chunkManagerRef.current) {
      chunkManagerRef.current = new ChunkManager(
        scene,
        seed,
        entityManagerRef.current
      );
      
      // Load initial chunks
      chunkManagerRef.current.update(0, 0);
      
      // Setup player
      const player = playerRef.current;
      player.maxSpeed = 10;
      player.position.set(0, 5, 0);
      entityManagerRef.current.add(player);
      
      console.log('[TerrainDemo] Initialized - ChunkManager + Player');
    }
  }, [scene, seed]);
  
  // Update loop
  useFrame((state, delta) => {
    if (!chunkManagerRef.current) return;
    
    const player = playerRef.current;
    
    // Update Yuka entities
    entityManagerRef.current.update(delta);
    
    // Update chunks based on player position
    chunkManagerRef.current.update(player.position.x, player.position.z);
    
    // Update NPCs
    chunkManagerRef.current.updateNPCs(delta);
    
    // Gravity & ground collision (DFU pattern)
    const terrainHeight = chunkManagerRef.current.getTerrainHeight(
      player.position.x,
      player.position.z
    );
    const eyeHeight = terrainHeight + 1.8;
    
    // Keep player on ground
    if (player.position.y < eyeHeight) {
      player.position.y = eyeHeight;
    }
    
    // Update store
    setPlayerPosition(player.position);
    
    // Sync camera to player
    state.camera.position.copy(player.position);
  });
  
  return (
    <>
      {/* Sky */}
      <Sky 
        distance={450000}
        sunPosition={[100, 50, 100]}
        inclination={0.6}
        azimuth={0.25}
      />
      
      {/* Lighting */}
      <directionalLight 
        position={[50, 100, 50]} 
        intensity={1.2}
        castShadow
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
        shadow-mapSize={[2048, 2048]}
      />
      <ambientLight intensity={0.6} />
      
      {/* Fog */}
      <fog attach="fog" args={['#87CEEB', 400, 1200]} />
    </>
  );
};

export const TerrainDemo: React.FC = () => {
  const { world } = useGameStore();
  
  return (
    <div className="terrain-demo">
      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 5, 0] }}
      >
        <TerrainScene seed={world.seed} />
        <PointerLockControls />
        <Stats />
      </Canvas>
      
      <TerrainHUD />
      <TerrainControls />
    </div>
  );
};

