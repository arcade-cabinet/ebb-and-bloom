import { useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Stats, PerformanceMonitor, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import { Button, Box } from '@mui/material';
import { BaseScene } from './BaseScene';
import { SceneManager } from './SceneManager';
import { WorldProvider } from '../ui/WorldContext';
import { HUD } from '../ui/hud/HUD';
import { useGameState } from '../state/GameState';
import { TransitionWrapper } from '../ui/TransitionWrapper';
import { RenderResourceManager } from '../core/RenderResourceManager';

export class GameplayScene extends BaseScene {
  private manager: SceneManager;
  private sceneId: string;
  
  constructor(manager: SceneManager) {
    super();
    this.manager = manager;
    this.sceneId = `gameplay-${Date.now()}`;
  }
  
  async enter(): Promise<void> {
    console.log('GameplayScene: Entering');
  }
  
  async exit(): Promise<void> {
    console.log('GameplayScene: Exiting');
  }
  
  async dispose(): Promise<void> {
    console.log('GameplayScene: Disposing world resources');
    
    // Use GameState disposal
    const { dispose } = useGameState.getState();
    dispose();
    
    const resourceManager = RenderResourceManager.getInstance();
    resourceManager.disposeScene(this.sceneId);
    
    console.log('GameplayScene: Disposal complete');
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

function World() {
  const { scene, camera } = useThree();
  const { seed, world } = useGameState();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if already initialized WITHOUT adding to deps (prevents cleanup loop)
    const { isInitialized } = useGameState.getState();
    
    if (isInitialized) {
      console.log('🌍 World already initialized');
      setIsReady(true);
      return;
    }

    console.log(`🌍 Initializing unified world with seed: ${seed}`);

    // UNIFIED INITIALIZATION
    const { initializeWorld } = useGameState.getState();
    initializeWorld(seed, scene, camera, 'auto');
    
    setIsReady(true);
    console.log('🌍 World initialized using UNIFIED GameState');

    // Cleanup ONLY runs on unmount (when scene/camera/seed changes)
    return () => {
      console.log('🧹 Cleaning up world (component unmounting)');
      const { dispose } = useGameState.getState();
      dispose();
    };
  }, [scene, camera, seed]);

  useFrame((_state, _delta) => {
    if (!isReady || !world) return;
    
    // Phase 2 will add ECS systems here
    // For now, world exists but has no entities/systems
  });

  return null;
}

function GameplaySceneComponent({ manager }: GameplaySceneComponentProps) {
  const { seed } = useGameState();
  const [dpr, setDpr] = useState(1);

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
    <WorldProvider world={null} seed={seed}>
      <TransitionWrapper fadeIn duration={1000} delay={0}>
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
          <Canvas
            shadows
            camera={{ fov: 90, near: 0.1, far: 1500 }}
            style={{ width: '100%', height: '100%' }}
            dpr={dpr}
          >
            <PerformanceMonitor
              onIncline={() => setDpr(1)}
              onDecline={() => setDpr(0.5)}
            >
              <AdaptiveDpr pixelated />
              <AdaptiveEvents />
              <World />
              <PointerLockControls />
              <Stats />
            </PerformanceMonitor>
          </Canvas>
          <HUDWithAnimation />
          
          <Button
            variant="outlined"
            onClick={() => manager.pushScene('pause')}
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              color: 'white',
              borderColor: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: 'scale(1.05)',
              },
            }}
          >
            Pause
          </Button>
        </div>
      </TransitionWrapper>
    </WorldProvider>
  );
}

function HUDWithAnimation() {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        '& > *': {
          pointerEvents: 'auto',
        },
      }}
    >
      <TransitionWrapper fadeIn duration={600} delay={800}>
        <HUD />
      </TransitionWrapper>
    </Box>
  );
}
