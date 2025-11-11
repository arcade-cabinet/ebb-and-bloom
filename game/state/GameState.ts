import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { rngRegistry } from '../../engine/rng/RNGRegistry';
import { EnhancedRNG } from '../../engine/utils/EnhancedRNG';
import { GenesisConstants } from '../../engine/genesis/GenesisConstants';

interface GameState {
  seed: string;
  seedSource: 'user' | 'auto';
  currentSeed: string;
  genesisConstants: GenesisConstants | null;
  
  initializeWithSeed: (seed: string, source?: 'user' | 'auto') => void;
  generateRandomSeed: () => void;
  getScopedRNG: (namespace: string) => EnhancedRNG;
  setCurrentSeed: (seed: string) => void;
  setGenesisConstants: (constants: GenesisConstants) => void;
  
  isInitialized: boolean;
}

export const useGameState = create<GameState>()(
  persist(
    (set, get) => ({
      seed: '',
      seedSource: 'auto',
      currentSeed: '',
      genesisConstants: null,
      isInitialized: false,
      
      initializeWithSeed: (seed: string, source: 'user' | 'auto' = 'auto') => {
        rngRegistry.setSeed(seed);
        set({ seed, seedSource: source, isInitialized: true });
      },
      
      generateRandomSeed: () => {
        const randomSeed = Math.random().toString(36).substring(2, 15);
        get().initializeWithSeed(randomSeed, 'auto');
      },
      
      getScopedRNG: (namespace: string) => {
        const { seed } = get();
        if (!seed) {
          throw new Error('Game seed not initialized. Call initializeWithSeed() first.');
        }
        return rngRegistry.getScopedRNG(namespace);
      },
      
      setCurrentSeed: (seed: string) => {
        set({ currentSeed: seed });
        rngRegistry.setSeed(seed);
      },
      
      setGenesisConstants: (constants: GenesisConstants) => {
        set({ genesisConstants: constants });
      },
    }),
    {
      name: 'ebb-and-bloom-game-state',
      partialize: (state) => ({ 
        seed: state.seed, 
        seedSource: state.seedSource,
        currentSeed: state.currentSeed,
        isInitialized: state.isInitialized 
      }),
    }
  )
);
