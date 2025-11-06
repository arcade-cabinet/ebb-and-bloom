/**
 * Zustand Game Store - Centralized reactive state
 * Integrates with ECS for game state management
 */

import { create } from 'zustand';
import type { IWorld } from 'bitecs';

interface GameState {
  // ECS World
  world: IWorld | null;
  
  // Game state
  pollution: number;
  fps: number;
  
  // Player stats (synced from ECS)
  playerPosition: { x: number; y: number };
  playerInventory: { ore: number; water: number; alloy: number };
  
  // Actions
  setWorld: (world: IWorld) => void;
  setPollution: (pollution: number) => void;
  addPollution: (amount: number) => void;
  setFPS: (fps: number) => void;
  updatePlayerPosition: (x: number, y: number) => void;
  updatePlayerInventory: (ore: number, water: number, alloy: number) => void;
  
  // Game lifecycle
  initialize: () => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  // Initial state
  world: null,
  pollution: 0,
  fps: 60,
  playerPosition: { x: 0, y: 0 },
  playerInventory: { ore: 0, water: 0, alloy: 0 },
  
  // Actions
  setWorld: (world) => set({ world }),
  
  setPollution: (pollution) => set({ pollution }),
  
  addPollution: (amount) => set((state) => ({ 
    pollution: Math.min(100, state.pollution + amount) 
  })),
  
  setFPS: (fps) => set({ fps }),
  
  updatePlayerPosition: (x, y) => set({ 
    playerPosition: { x, y } 
  }),
  
  updatePlayerInventory: (ore, water, alloy) => set({ 
    playerInventory: { ore, water, alloy } 
  }),
  
  initialize: () => set({ 
    pollution: 0, 
    fps: 60,
    playerPosition: { x: 0, y: 0 },
    playerInventory: { ore: 0, water: 0, alloy: 0 }
  }),
  
  reset: () => set({ 
    world: null,
    pollution: 0, 
    fps: 60,
    playerPosition: { x: 0, y: 0 },
    playerInventory: { ore: 0, water: 0, alloy: 0 }
  })
}));
