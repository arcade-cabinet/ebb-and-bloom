import { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Stats, PerformanceMonitor, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import { Button, Box } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import * as THREE from 'three';
import { BaseScene } from './BaseScene';
import { SceneManager } from './SceneManager';
import { WorldProvider } from '../ui/WorldContext';
import { HUD } from '../ui/hud/HUD';
import { useGameState } from '../state/GameState';
import { TransitionWrapper } from '../ui/TransitionWrapper';
import { RenderResourceManager } from '../core/RenderResourceManager';
import type { World as ECSWorld } from '../../engine/ecs/World';
import type { GenesisConstants } from '../../engine/genesis/GenesisConstants';

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

function spawnInitialWorld(
  world: ECSWorld,
  scene: THREE.Scene,
  genesis: GenesisConstants
): void {
  const chunkSize = 100;

  for (let x = -1; x <= 1; x++) {
    for (let z = -1; z <= 1; z++) {
      const terrainGeo = new THREE.PlaneGeometry(chunkSize, chunkSize, 10, 10);
      const terrainMat = new THREE.MeshStandardMaterial({
        color: 0x7cfc00,
        side: THREE.DoubleSide,
      });
      const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
      terrainMesh.rotation.x = -Math.PI / 2;
      terrainMesh.position.set(x * chunkSize, 0, z * chunkSize);
      terrainMesh.receiveShadow = true;
      scene.add(terrainMesh);

      world.add({
        entityId: uuidv4(),
        scale: 'structural',
        position: { x: x * chunkSize, y: 0, z: z * chunkSize },
        mesh: terrainMesh,
        visible: true,
        receiveShadow: true,
      });

      const density = Math.min(1.0, genesis.getMetallicity() / 0.02);
      const treeCount = Math.floor(density * 20);

      for (let i = 0; i < treeCount; i++) {
        const treeX = x * chunkSize + Math.random() * chunkSize - chunkSize / 2;
        const treeZ = z * chunkSize + Math.random() * chunkSize - chunkSize / 2;

        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.5, 0.5, 5, 8),
          new THREE.MeshStandardMaterial({ color: 0x8b4513 })
        );
        const foliage = new THREE.Mesh(
          new THREE.SphereGeometry(3, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0x228b22 })
        );
        foliage.position.y = 4;

        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(foliage);
        tree.position.set(treeX, 0, treeZ);
        tree.castShadow = true;
        tree.receiveShadow = true;
        scene.add(tree);

        world.add({
          entityId: uuidv4(),
          scale: 'organismal',
          mass: 100,
          position: { x: treeX, y: 0, z: treeZ },
          velocity: { x: 0, y: 0, z: 0 },
          temperature: genesis.getSurfaceTemperature(),
          elementCounts: {
            C: 50,
            O: 30,
            H: 15,
            N: 3,
            P: 1,
            K: 1,
          },
          genome: 'TREE_GENOME_PLACEHOLDER',
          phenotype: { species: 'oak', height: 5, age: Math.random() * 100 },
          mesh: tree,
          visible: true,
          castShadow: true,
          receiveShadow: true,
        });
      }

      console.log(`[World] Spawned chunk (${x}, ${z}) with ${treeCount} trees`);
    }
  }

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(50, 50, 50);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  console.log(`[World] Spawned ${world.getStatistics().entityCount} entities`);
}

function World() {
  const { scene, camera } = useThree();
  const { seed, world } = useGameState();
  const [isReady, setIsReady] = useState(false);
  const spawnedRef = useRef(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) {
      console.log('🌍 World already initialized (ref guard)');
      return;
    }

    const { isInitialized } = useGameState.getState();

    if (isInitialized) {
      console.log('🌍 World already initialized');
      setIsReady(true);
      initializedRef.current = true;
      return;
    }

    console.log(`🌍 Initializing unified world with seed: ${seed}`);
    initializedRef.current = true;

    const { initializeWorld } = useGameState.getState();
    initializeWorld(seed, scene, camera, 'auto').then(() => {
      const { world: ecsWorld, genesisConstants: genesis } = useGameState.getState();
      if (!ecsWorld || !genesis) {
        console.error('❌ World or Genesis not initialized!');
        return;
      }

      if (!spawnedRef.current) {
        spawnInitialWorld(ecsWorld, scene, genesis);
        spawnedRef.current = true;
      }

      setIsReady(true);
      console.log('🌍 World initialized with law-based ECS');
    });
  }, [seed]);

  useFrame((_state, delta) => {
    if (!isReady || !world) return;

    world.tick(delta);
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
