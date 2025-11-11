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
  executeGovernorIntent: (intent: GovernorIntent) => Promise<void>;
  
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
        console.log(`[GameState] 🌍 Initializing unified world state`);
        console.log(`[GameState] Seed: ${seed}`);
        
        rngRegistry.setSeed(seed);
        
        const genesisRng = rngRegistry.getScopedRNG('genesis');
        const timelineRng = rngRegistry.getScopedRNG('cosmic-timeline');
        
        const genesis = new GenesisConstants(genesisRng);
        const timeline = new CosmicProvenanceTimeline(timelineRng);
        
        console.log('[GameState] ✅ Cosmic twins created:', {
          gravity: genesis.getGravity(),
          metallicity: genesis.getMetallicity(),
          temperature: genesis.getSurfaceTemperature()
        });
        
        const ecsWorld = new World();
        await ecsWorld.initialize();
        console.log('[GameState] ✅ ECS World with law orchestrator created');
        
        const executor = new GovernorActionExecutor(ecsWorld, genesis, scene);
        console.log('[GameState] ✅ Governor action executor created');
        
        console.log('[GameState] ✅ Three.js scene/camera refs stored');
        
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
        
        console.log('[GameState] 🎉 UNIFIED WORLD INITIALIZED');
      },
      
      getScopedRNG: (namespace: string) => {
        const { seed } = get();
        if (!seed) {
          throw new Error('❌ Game seed not initialized! Call initializeWorld() first.');
        }
        return rngRegistry.getScopedRNG(namespace);
      },
      
      dispose: () => {
        console.log('[GameState] 🧹 Disposing world state');
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
      },
      
      executeGovernorIntent: async (intent: GovernorIntent) => {
        const { governorExecutor } = get();
        if (!governorExecutor) {
          throw new Error('❌ Governor executor not initialized! Call initializeWorld() first.');
        }
        await governorExecutor.execute(intent);
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
