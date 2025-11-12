import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as THREE from 'three';
import { rngRegistry } from '../../engine/rng/RNGRegistry';
import { EnhancedRNG } from '../../engine/utils/EnhancedRNG';
import { GenesisFacade } from '../../engine/genesis/facade/GenesisFacade';
import { CosmicProvenanceTimeline } from '../../engine/genesis/CosmicProvenanceTimeline';
import { World } from '../../engine/ecs/World';
import { GovernorActionExecutor } from '../../engine/ecs/core/GovernorActionExecutor';
import type { GovernorIntent } from '../../agents/controllers/GovernorActionPort';

export type { Entity } from '../../engine/ecs/components/CoreComponents';

interface GameState {
  // === TWIN 1: Seed & RNG ===
  seed: string;
  seedSource: 'user' | 'auto';
  
  // === TWIN 2: Genesis Facade (Lazy Initialized) ===
  _genesisFacade?: GenesisFacade;
  
  // === CORE: ECS World ===
  world: World | null;
  
  // === UNIFIED GOVERNOR INTERFACE ===
  governorExecutor: GovernorActionExecutor | null;
  
  // === Three.js Context ===
  scene: THREE.Scene | null;
  camera: THREE.Camera | null;
  
  // === UNIFIED API ===
  initializeWorld: (seed: string, scene: THREE.Scene, camera: THREE.Camera, source?: 'user' | 'auto') => Promise<void>;
  initializeWithSeed: (seed: string, source?: 'user' | 'auto') => void;
  dispose: () => void;
  getScopedRNG: (namespace: string) => EnhancedRNG;
  executeGovernorIntent: (intent: GovernorIntent) => Promise<void>;
  
  // === GENESIS FACADE GETTERS ===
  getGenesisFacade: () => GenesisFacade;
  getTimeline: () => CosmicProvenanceTimeline;
  getGravity: () => number;
  getMetallicity: () => number;
  getSurfaceTemperature: () => number;
  getPlanetMass: () => number;
  getPlanetRadius: () => number;
  getStellarMass: () => number;
  getStellarLuminosity: () => number;
  getOrbitalRadius: () => number;
  getAtmosphericPressure: () => number;
  getAtmosphericComposition: () => Record<string, number>;
  getEscapeVelocity: () => number;
  getHabitableZoneInner: () => number;
  getHabitableZoneOuter: () => number;
  getMagneticField: () => number;
  getOceanMassFraction: () => number;
  
  isInitialized: boolean;
}

export const useGameState = create<GameState>()(
  persist(
    (set, get) => ({
      seed: '',
      seedSource: 'auto',
      _genesisFacade: undefined,
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
        const facade = new GenesisFacade(genesisRng);
        
        console.log('[GameState] ✅ Genesis Facade created:', {
          gravity: facade.getGravity(),
          metallicity: facade.getMetallicity(),
          temperature: facade.getSurfaceTemperature()
        });
        
        const ecsWorld = new World();
        await ecsWorld.initialize();
        console.log('[GameState] ✅ ECS World with law orchestrator created');
        
        const executor = new GovernorActionExecutor(ecsWorld, scene);
        console.log('[GameState] ✅ Governor action executor created');
        
        console.log('[GameState] ✅ Three.js scene/camera refs stored');
        
        set({
          seed,
          seedSource: source,
          _genesisFacade: facade,
          world: ecsWorld,
          governorExecutor: executor,
          scene,
          camera,
          isInitialized: true
        });
        
        console.log('[GameState] 🎉 UNIFIED WORLD INITIALIZED');
      },
      
      initializeWithSeed: (seed: string, source: 'user' | 'auto' = 'auto') => {
        console.log(`[GameState] 🌱 Initializing with seed: ${seed}`);
        rngRegistry.setSeed(seed);
        
        set({
          seed,
          seedSource: source
        });
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
          _genesisFacade: undefined,
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
      
      getGenesisFacade: () => {
        const state = get();
        if (!state._genesisFacade) {
          const genesisRng = rngRegistry.getScopedRNG('genesis');
          const facade = new GenesisFacade(genesisRng);
          set({ _genesisFacade: facade });
          return facade;
        }
        return state._genesisFacade;
      },
      
      getTimeline: () => {
        return get().getGenesisFacade().getTimeline();
      },
      
      getGravity: () => {
        return get().getGenesisFacade().getGravity();
      },
      
      getMetallicity: () => {
        return get().getGenesisFacade().getMetallicity();
      },
      
      getSurfaceTemperature: () => {
        return get().getGenesisFacade().getSurfaceTemperature();
      },
      
      getPlanetMass: () => {
        return get().getGenesisFacade().getPlanetMass();
      },
      
      getPlanetRadius: () => {
        return get().getGenesisFacade().getPlanetRadius();
      },
      
      getStellarMass: () => {
        return get().getGenesisFacade().getStellarMass();
      },
      
      getStellarLuminosity: () => {
        return get().getGenesisFacade().getStellarLuminosity();
      },
      
      getOrbitalRadius: () => {
        return get().getGenesisFacade().getOrbitalRadius();
      },
      
      getAtmosphericPressure: () => {
        return get().getGenesisFacade().getAtmosphericPressure();
      },
      
      getAtmosphericComposition: () => {
        return get().getGenesisFacade().getAtmosphericComposition();
      },
      
      getEscapeVelocity: () => {
        return get().getGenesisFacade().getEscapeVelocity();
      },
      
      getHabitableZoneInner: () => {
        return get().getGenesisFacade().getHabitableZoneInner();
      },
      
      getHabitableZoneOuter: () => {
        return get().getGenesisFacade().getHabitableZoneOuter();
      },
      
      getMagneticField: () => {
        return get().getGenesisFacade().getMagneticField();
      },
      
      getOceanMassFraction: () => {
        return get().getGenesisFacade().getOceanMassFraction();
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
