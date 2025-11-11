import { create } from 'zustand';
import { rngRegistry } from '../../engine/rng/RNGRegistry';
import { EnhancedRNG } from '../../engine/utils/EnhancedRNG';
import { GenesisConstants } from '../../engine/genesis/GenesisConstants';
import { World } from '../../engine/ecs/World';
import { gameStateLogger } from '../../engine/logging/logger';

interface GameState {
  seed: string | null;
  genesis: GenesisConstants | null;
  world: World | null;
  initialized: boolean;
  
  initializeWorld: (seed: string) => Promise<void>;
  getScopedRNG: (namespace: string) => EnhancedRNG;
}

export const useGameStore = create<GameState>((set, get) => ({
  seed: null,
  genesis: null,
  world: null,
  initialized: false,

  initializeWorld: async (seed: string) => {
    gameStateLogger.info({ seed }, 'Initializing world');
    
    rngRegistry.setSeed(seed);
    const genesisRng = rngRegistry.getScopedRNG('genesis');
    
    const genesis = new GenesisConstants(genesisRng);
    const world = new World();
    await world.initialize();
    
    set({ seed, genesis, world, initialized: true });
    gameStateLogger.info('World initialized successfully');
  },

  getScopedRNG: (namespace: string) => {
    return rngRegistry.getScopedRNG(namespace);
  },
}));
