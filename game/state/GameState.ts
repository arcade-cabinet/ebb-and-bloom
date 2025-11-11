import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { rngRegistry } from '../../engine/rng/RNGRegistry';
import { EnhancedRNG } from '../../engine/utils/EnhancedRNG';

interface GameState {
  seed: string;
  seedSource: 'user' | 'auto';
  
  initializeWithSeed: (seed: string, source?: 'user' | 'auto') => void;
  generateRandomSeed: () => void;
  getScopedRNG: (namespace: string) => EnhancedRNG;
  
  isInitialized: boolean;
}

export const useGameState = create<GameState>()(
  persist(
    (set, get) => ({
      seed: '',
      seedSource: 'auto',
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
    }),
    {
      name: 'ebb-and-bloom-game-state',
      partialize: (state) => ({ 
        seed: state.seed, 
        seedSource: state.seedSource,
        isInitialized: state.isInitialized 
      }),
    }
  )
);
