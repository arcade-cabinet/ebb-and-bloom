import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as THREE from 'three';
import { rngRegistry } from '../../engine/rng/RNGRegistry';
import { EnhancedRNG } from '../../engine/utils/EnhancedRNG';
import { GenesisConstants } from '../../engine/genesis/GenesisConstants';
import { CosmicProvenanceTimeline } from '../../engine/genesis/CosmicProvenanceTimeline';
import { World } from '../../engine/ecs/World';
import { GovernorActionExecutor } from '../../engine/ecs/core/GovernorActionExecutor';
import type { GovernorIntent } from '../../agents/controllers/GovernorActionPort';
import { gameStateLogger } from '../../engine/logging/logger';

export type { Entity } from '../../engine/ecs/components/CoreComponents';

interface GameState {
  // === TWIN 1: Seed & RNG ===
  seed: string;
  seedSource: 'user' | 'auto';
  
  // === TWIN 2: Genesis & Timeline ===
  genesisConstants: GenesisConstants | null;
  cosmicTimeline: CosmicProvenanceTimeline | null;
  
  // === CORE: ECS World ===
  world: World | null;
  
  // === UNIFIED GOVERNOR INTERFACE ===
  governorExecutor: GovernorActionExecutor | null;
  
  // === Three.js Context ===
  scene: THREE.Scene | null;
  camera: THREE.Camera | null;
  
  // === UNIFIED API ===
  initializeWorld: (seed: string, scene: THREE.Scene, camera: THREE.Camera, source?: 'user' | 'auto') => Promise<void>;
  dispose: () => void;
  getScopedRNG: (namespace: string) => EnhancedRNG;
  executeGovernorIntent: (intent: GovernorIntent) => Promise<boolean>;
  
  isInitialized: boolean;
}

export const useGameState = create<GameState>()(
  persist(
    (set, get) => ({
      seed: '',
      seedSource: 'auto',
      genesisConstants: null,
      cosmicTimeline: null,
      world: null,
      governorExecutor: null,
      scene: null,
      camera: null,
      isInitialized: false,
      
      initializeWorld: async (
        seed: string, 
        scene: THREE.Scene, 
        camera: THREE.Camera,
        source: 'user' | 'auto' = 'auto'
      ) => {
        gameStateLogger.info({ seed, source }, 'Initializing unified world state');
        
        rngRegistry.setSeed(seed);
        
        const genesisRng = rngRegistry.getScopedRNG('genesis');
        const timelineRng = rngRegistry.getScopedRNG('cosmic-timeline');
        
        const genesis = new GenesisConstants(genesisRng);
        const timeline = new CosmicProvenanceTimeline(timelineRng);
        
        gameStateLogger.debug({
          gravity: genesis.getGravity(),
          metallicity: genesis.getMetallicity(),
          temperature: genesis.getSurfaceTemperature(),
        }, 'Cosmic twins created');
        
        const ecsWorld = new World();
        await ecsWorld.initialize();
        gameStateLogger.debug('ECS World with law orchestrator created');
        
        const executor = new GovernorActionExecutor(ecsWorld, genesis, scene);
        gameStateLogger.debug('Governor action executor created');
        
        gameStateLogger.debug('Three.js scene/camera refs stored');
        
        set({
          seed,
          seedSource: source,
          genesisConstants: genesis,
          cosmicTimeline: timeline,
          world: ecsWorld,
          governorExecutor: executor,
          scene,
          camera,
          isInitialized: true
        });
        
        gameStateLogger.info('Unified world initialized successfully');
      },
      
      getScopedRNG: (namespace: string) => {
        const { seed } = get();
        if (!seed) {
          throw new Error('❌ Game seed not initialized! Call initializeWorld() first.');
        }
        return rngRegistry.getScopedRNG(namespace);
      },
      
      dispose: () => {
        gameStateLogger.info('Disposing world state');
        const { world } = get();
        
        if (world) {
          world.destroy();
        }
        
        set({
          world: null,
          governorExecutor: null,
          scene: null,
          camera: null,
          isInitialized: false
        });
        
        gameStateLogger.debug('World state disposed');
      },
      
      executeGovernorIntent: async (intent: GovernorIntent): Promise<boolean> => {
        const { governorExecutor } = get();
        if (!governorExecutor) {
          gameStateLogger.error('Governor executor not initialized');
          throw new Error('❌ Governor executor not initialized! Call initializeWorld() first.');
        }
        const success = await governorExecutor.execute(intent);
        gameStateLogger.debug({ success, intentType: intent.type }, 'Intent execution result');
        return success;
      },
    }),
    {
      name: 'ebb-and-bloom-game-state',
      partialize: (state) => ({ 
        seed: state.seed, 
        seedSource: state.seedSource,
        isInitialized: false
      }),
    }
  )
);
