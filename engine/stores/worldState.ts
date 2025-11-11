/**
 * WORLD STATE STORE (Zustand)
 * 
 * Central state management for world generation.
 * Tracks ALL chunk states, governor states, and game time.
 * 
 * TODO: Replace with PlanetaryState from genesis pipeline
 */

import { create } from 'zustand';

interface ChunkState {
  generated: boolean;
  biome?: string;
  lastUpdate?: number;
}

interface WorldState {
    // Game time
    currentTime: number; // Seconds since world start
    
    // Chunk states (key: "chunkX,chunkZ")
    chunkStates: Map<string, ChunkState>;
    
    // Active chunks (currently loaded)
    activeChunks: Set<string>;
    
    // Global governor states
    globalEcology: {
        totalBiomass: number;
        totalPrey: number;
        totalPredators: number;
    };
    
    // Actions
    updateTime: (delta: number) => void;
    setChunkState: (chunkX: number, chunkZ: number, state: ChunkState) => void;
    getChunkState: (chunkX: number, chunkZ: number) => ChunkState | undefined;
    setActiveChunk: (chunkX: number, chunkZ: number, active: boolean) => void;
    updateGlobalEcology: (updates: Partial<WorldState['globalEcology']>) => void;
}

export const useWorldState = create<WorldState>((set, get) => ({
    currentTime: 0,
    chunkStates: new Map(),
    activeChunks: new Set(),
    globalEcology: {
        totalBiomass: 0,
        totalPrey: 0,
        totalPredators: 0
    },
    
    updateTime: (delta: number) => {
        set((state) => ({
            currentTime: state.currentTime + delta
        }));
    },
    
    setChunkState: (chunkX: number, chunkZ: number, chunkState: ChunkState) => {
        const key = `${chunkX},${chunkZ}`;
        set((state) => {
            const newStates = new Map(state.chunkStates);
            newStates.set(key, chunkState);
            return { chunkStates: newStates };
        });
    },
    
    getChunkState: (chunkX: number, chunkZ: number) => {
        const key = `${chunkX},${chunkZ}`;
        return get().chunkStates.get(key);
    },
    
    setActiveChunk: (chunkX: number, chunkZ: number, active: boolean) => {
        const key = `${chunkX},${chunkZ}`;
        set((state) => {
            const newActive = new Set(state.activeChunks);
            if (active) {
                newActive.add(key);
            } else {
                newActive.delete(key);
            }
            return { activeChunks: newActive };
        });
    },
    
    updateGlobalEcology: (updates: Partial<WorldState['globalEcology']>) => {
        set((state) => ({
            globalEcology: { ...state.globalEcology, ...updates }
        }));
    }
}));

