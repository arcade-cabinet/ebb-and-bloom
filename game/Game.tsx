/**
 * GAME COMPONENT
 * 
 * Main game using ONLY WorldManager API.
 * Game package summons GenerationGovernor from agents package to CONTROL the engine.
 * 
 * Uses proper UI system (DFU pattern):
 * - UIManager coordinates screens
 * - HUD components separate from game logic
 * - Screens (Menu, Pause, etc.) are separate components
 */

import { PointerLockControls, Stats } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { WorldManager } from '../engine/core/WorldManager';
// Game summons GenerationGovernor from agents package to control engine
// import { GenerationGovernor } from '../agents';
import { ScreenType, UIManagerProvider, useUIManager } from './ui/UIManager';
import { WorldProvider } from './ui/WorldContext';
import { HUD } from './ui/hud/HUD';
import { GameScreen } from './ui/screens/GameScreen';
import { MenuScreen } from './ui/screens/MenuScreen';
import { PauseScreen } from './ui/screens/PauseScreen';

// Seed is loaded from sessionStorage (set by MenuScreen)
const getWorldSeed = (): string => {
  const stored = sessionStorage.getItem('worldSeed');
  if (stored) {
    return stored;
  }
  // Fallback to default if no seed set (shouldn't happen in normal flow)
  return 'v1-green-valley-breeze';
};

const worldRef = { current: null as WorldManager | null };
// const governorRef = { current: null as GenerationGovernor | null }; // Game controls engine via governor

function World() {
  const { scene, camera } = useThree();
  const [isReady, setIsReady] = useState(false);
  const keysRef = useRef<Set<string>>(new Set());
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    // Get seed from sessionStorage (set by MenuScreen)
    const seed = getWorldSeed();
    console.log(`🌍 Initializing world with seed: ${seed}`);

    // Initialize ENGINE (game engine only) - uses THREE-WORD SEED
    const world = new WorldManager();
    world.initialize({
      seed: seed,
      scene,
      camera,
      chunkDistance: 3
    });

    worldRef.current = world;

    // TODO: Game summons GenerationGovernor to CONTROL the engine
    // const governor = new GenerationGovernor(WORLD_SEED);
    // governorRef.current = governor;
    // 
    // // Governor controls what spawns in engine
    // governor.loadChunk(0, 0, scene, world.entityManager);

    setIsReady(true);

    console.log('🌍 World initialized using WorldManager API');
    console.log('🎮 Game will summon GenerationGovernor to control engine');

    // Input handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.movementX;
      mouseRef.current.y = e.movementY;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [scene, camera]);

  useFrame((_state, delta) => {
    if (!isReady || !worldRef.current) return;

    // Update ENGINE
    worldRef.current.update(delta);

    // TODO: Update GenerationGovernor (controls engine)
    // if (governorRef.current) {
    //   const playerPos = worldRef.current.getPlayerPosition();
    //   const chunkX = Math.floor(playerPos.x / 100);
    //   const chunkZ = Math.floor(playerPos.z / 100);
    //   governorRef.current.updateTime(delta);
    //   governorRef.current.loadChunk(chunkX, chunkZ, scene, worldRef.current.entityManager);
    // }
  });

  return null;
}

function GameContent() {
  const { currentScreen, setScreen } = useUIManager();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setScreen(currentScreen === ScreenType.GAME ? ScreenType.PAUSE : ScreenType.GAME);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [currentScreen, setScreen]);

  return (
    <WorldProvider world={worldRef.current} seed={getWorldSeed()}>
      <div style={{ width: '100vw', height: '100vh' }}>
        {currentScreen === ScreenType.MENU && <MenuScreen />}
        {currentScreen === ScreenType.PAUSE && <PauseScreen />}
        <GameScreen>
          <Canvas
            shadows
            camera={{ fov: 90, near: 0.1, far: 1500 }}
            style={{ display: currentScreen === ScreenType.GAME ? 'block' : 'none' }}
          >
            <World />
            <PointerLockControls />
            <Stats />
          </Canvas>
          {currentScreen === ScreenType.GAME && <HUD />}
        </GameScreen>
      </div>
    </WorldProvider>
  );
}

export function Game() {
  return (
    <UIManagerProvider initialScreen={ScreenType.MENU}>
      <GameContent />
    </UIManagerProvider>
  );
}
