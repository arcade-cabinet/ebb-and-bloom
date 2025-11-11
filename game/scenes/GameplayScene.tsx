import { useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Stats } from '@react-three/drei';
import { Button } from '@mui/material';
import { BaseScene } from './BaseScene';
import { SceneManager } from './SceneManager';
import { WorldManager } from '../../engine/core/WorldManager';
import { WorldProvider } from '../ui/WorldContext';
import { HUD } from '../ui/hud/HUD';
import { useGameState } from '../state/GameState';

export class GameplayScene extends BaseScene {
  private manager: SceneManager;
  
  constructor(manager: SceneManager) {
    super();
    this.manager = manager;
  }
  
  async enter(): Promise<void> {
    console.log('GameplayScene: Entering');
  }
  
  async exit(): Promise<void> {
    console.log('GameplayScene: Exiting');
  }
  
  update(_deltaTime: number): void {
  }
  
  render(): React.ReactNode {
    return <GameplaySceneComponent manager={this.manager} />;
  }
}

interface GameplaySceneComponentProps {
  manager: SceneManager;
}

const worldRef = { current: null as WorldManager | null };

function World() {
  const { scene, camera } = useThree();
  const { currentSeed } = useGameState();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log(`🌍 Initializing world with seed: ${currentSeed}`);

    const world = new WorldManager();
    world.initialize({
      seed: currentSeed,
      scene,
      camera,
      chunkDistance: 3
    });

    worldRef.current = world;
    setIsReady(true);

    console.log('🌍 World initialized using WorldManager API');

    return () => {
    };
  }, [scene, camera, currentSeed]);

  useFrame((_state, delta) => {
    if (!isReady || !worldRef.current) return;
    worldRef.current.update(delta);
  });

  return null;
}

function GameplaySceneComponent({ manager }: GameplaySceneComponentProps) {
  const { currentSeed } = useGameState();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        manager.pushScene('pause');
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [manager]);

  return (
    <WorldProvider world={worldRef.current} seed={currentSeed}>
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        <Canvas
          shadows
          camera={{ fov: 90, near: 0.1, far: 1500 }}
          style={{ width: '100%', height: '100%' }}
        >
          <World />
          <PointerLockControls />
          <Stats />
        </Canvas>
        <HUD />
        
        <Button
          variant="outlined"
          onClick={() => manager.pushScene('pause')}
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            color: 'white',
            borderColor: 'white',
            '&:hover': {
              borderColor: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          Pause
        </Button>
      </div>
    </WorldProvider>
  );
}
