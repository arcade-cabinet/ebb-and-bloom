/**
 * WORLD CONTEXT
 * 
 * Provides WorldManager instance and game state to UI components.
 */

import { createContext, useContext, ReactNode } from 'react';
import { WorldManager } from '../../engine/core/WorldManager';

interface WorldContextType {
  world: WorldManager | null;
  seed: string | null;
}

const WorldContext = createContext<WorldContextType>({
  world: null,
  seed: null,
});

export function useWorld() {
  return useContext(WorldContext);
}

interface WorldProviderProps {
  children: ReactNode;
  world: WorldManager | null;
  seed: string | null;
}

export function WorldProvider({ children, world, seed }: WorldProviderProps) {
  return (
    <WorldContext.Provider value={{ world, seed }}>
      {children}
    </WorldContext.Provider>
  );
}


