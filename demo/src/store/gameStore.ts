/**
 * GAME STATE - Zustand Store
 * 
 * Central state management for all game/demo state.
 * Engine state is managed separately by UniverseSimulator.
 */

import { create } from 'zustand';
import { Vector3 } from 'three';

export interface PlayerState {
  position: Vector3;
  rotation: { yaw: number; pitch: number };
  velocity: Vector3;
  isGrounded: boolean;
  health: number;
  stamina: number;
}

export interface WorldState {
  seed: string;
  time: number; // Game time in hours
  loadedChunks: Set<string>;
  settlements: Map<string, any>;
  npcs: Map<string, any>;
  creatures: Map<string, any>;
}

export interface UIState {
  showHUD: boolean;
  showMinimap: boolean;
  showInventory: boolean;
  showDialogue: boolean;
  isPaused: boolean;
  currentDialogueNPC: string | null;
}

export interface PerformanceState {
  fps: number;
  drawCalls: number;
  triangles: number;
  textures: number;
}

interface GameStore {
  // Player
  player: PlayerState;
  setPlayerPosition: (pos: Vector3) => void;
  setPlayerRotation: (yaw: number, pitch: number) => void;
  setGrounded: (grounded: boolean) => void;
  
  // World
  world: WorldState;
  setSeed: (seed: string) => void;
  advanceTime: (hours: number) => void;
  registerChunk: (key: string) => void;
  unregisterChunk: (key: string) => void;
  
  // UI
  ui: UIState;
  toggleHUD: () => void;
  toggleMinimap: () => void;
  toggleInventory: () => void;
  openDialogue: (npcId: string) => void;
  closeDialogue: () => void;
  pause: () => void;
  resume: () => void;
  
  // Performance
  performance: PerformanceState;
  updatePerformance: (stats: Partial<PerformanceState>) => void;
  
  // Actions
  reset: () => void;
}

const initialPlayerState: PlayerState = {
  position: new Vector3(0, 5, 0),
  rotation: { yaw: 0, pitch: 0 },
  velocity: new Vector3(0, 0, 0),
  isGrounded: false,
  health: 100,
  stamina: 100
};

const initialWorldState: WorldState = {
  seed: 'v1-green-valley-breeze',
  time: 8, // 8 AM
  loadedChunks: new Set(),
  settlements: new Map(),
  npcs: new Map(),
  creatures: new Map()
};

const initialUIState: UIState = {
  showHUD: true,
  showMinimap: true,
  showInventory: false,
  showDialogue: false,
  isPaused: false,
  currentDialogueNPC: null
};

const initialPerformanceState: PerformanceState = {
  fps: 0,
  drawCalls: 0,
  triangles: 0,
  textures: 0
};

export const useGameStore = create<GameStore>((set) => ({
  // Initial state
  player: initialPlayerState,
  world: initialWorldState,
  ui: initialUIState,
  performance: initialPerformanceState,
  
  // Player actions
  setPlayerPosition: (pos) => set((state) => ({
    player: { ...state.player, position: pos }
  })),
  
  setPlayerRotation: (yaw, pitch) => set((state) => ({
    player: { ...state.player, rotation: { yaw, pitch } }
  })),
  
  setGrounded: (grounded) => set((state) => ({
    player: { ...state.player, isGrounded: grounded }
  })),
  
  // World actions
  setSeed: (seed) => set((state) => ({
    world: { ...state.world, seed }
  })),
  
  advanceTime: (hours) => set((state) => ({
    world: { ...state.world, time: (state.world.time + hours) % 24 }
  })),
  
  registerChunk: (key) => set((state) => {
    const newChunks = new Set(state.world.loadedChunks);
    newChunks.add(key);
    return { world: { ...state.world, loadedChunks: newChunks } };
  }),
  
  unregisterChunk: (key) => set((state) => {
    const newChunks = new Set(state.world.loadedChunks);
    newChunks.delete(key);
    return { world: { ...state.world, loadedChunks: newChunks } };
  }),
  
  // UI actions
  toggleHUD: () => set((state) => ({
    ui: { ...state.ui, showHUD: !state.ui.showHUD }
  })),
  
  toggleMinimap: () => set((state) => ({
    ui: { ...state.ui, showMinimap: !state.ui.showMinimap }
  })),
  
  toggleInventory: () => set((state) => ({
    ui: { ...state.ui, showInventory: !state.ui.showInventory }
  })),
  
  openDialogue: (npcId) => set((state) => ({
    ui: { ...state.ui, showDialogue: true, currentDialogueNPC: npcId }
  })),
  
  closeDialogue: () => set((state) => ({
    ui: { ...state.ui, showDialogue: false, currentDialogueNPC: null }
  })),
  
  pause: () => set((state) => ({
    ui: { ...state.ui, isPaused: true }
  })),
  
  resume: () => set((state) => ({
    ui: { ...state.ui, isPaused: false }
  })),
  
  // Performance
  updatePerformance: (stats) => set((state) => ({
    performance: { ...state.performance, ...stats }
  })),
  
  // Reset
  reset: () => set({
    player: initialPlayerState,
    world: initialWorldState,
    ui: initialUIState,
    performance: initialPerformanceState
  })
}));

