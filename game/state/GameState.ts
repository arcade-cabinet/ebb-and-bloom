import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { World } from 'miniplex';
import * as THREE from 'three';
import { rngRegistry } from '../../engine/rng/RNGRegistry';
import { EnhancedRNG } from '../../engine/utils/EnhancedRNG';
import { GenesisConstants } from '../../engine/genesis/GenesisConstants';
import { CosmicProvenanceTimeline } from '../../engine/genesis/CosmicProvenanceTimeline';

export type Entity = {
  id?: string;
  position?: THREE.Vector3;
  velocity?: THREE.Vector3;
  mesh?: THREE.Mesh;
};

interface GameState {
  // === TWIN 1: Seed & RNG ===
  seed: string;
  seedSource: 'user' | 'auto';
  
  // === TWIN 2: Genesis & Timeline ===
  genesisConstants: GenesisConstants | null;
  cosmicTimeline: CosmicProvenanceTimeline | null;
  
  // === CORE: ECS World ===
  world: World<Entity> | null;
  
  // === Three.js Context ===
  scene: THREE.Scene | null;
  camera: THREE.Camera | null;
  
  // === UNIFIED API ===
  initializeWorld: (seed: string, scene: THREE.Scene, camera: THREE.Camera, source?: 'user' | 'auto') => void;
  dispose: () => void;
  getScopedRNG: (namespace: string) => EnhancedRNG;
  
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
      scene: null,
      camera: null,
      isInitialized: false,
      
      initializeWorld: (
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
        
        const ecsWorld = new World<Entity>();
        console.log('[GameState] ✅ Miniplex ECS world created');
        
        console.log('[GameState] ✅ Three.js scene/camera refs stored');
        
        set({
          seed,
          seedSource: source,
          genesisConstants: genesis,
          cosmicTimeline: timeline,
          world: ecsWorld,
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
          world.clear();
        }
        
        set({
          world: null,
          scene: null,
          camera: null,
          isInitialized: false
        });
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
