import { create } from 'zustand';
import type { IWorld } from 'bitecs';

interface GameEvent {
  type: string;
  title: string;
  description: string;
  timestamp: number;
  haiku?: string;
}

interface GameState {
  // Core state
  pollution: number;
  fps: number;
  playerPosition: { x: number; y: number };
  playerInventory: Record<string, number>;
  playerTraits: any[];
  dominantPlaystyle: 'Harmony' | 'Conquest' | 'Frolick' | 'Neutral';
  
  // Event logging
  eventLog: GameEvent[];
  actionHistory: string[];
  playTime: number;
  
  // Game lifecycle
  isPlaying: boolean;
  world: IWorld | null;
  
  // Actions
  updatePollution: (value: number) => void;
  updateFPS: (value: number) => void;
  updatePlayerPosition: (x: number, y: number) => void;
  updatePlayerInventory: (inventory: Record<string, number>) => void;
  setPlayerTraits: (traits: any[]) => void;
  updatePlaystyle: (style: 'Harmony' | 'Conquest' | 'Frolick' | 'Neutral') => void;
  
  // Event logging
  addEvent: (event: Omit<GameEvent, 'timestamp'>) => void;
  recordAction: (action: string) => void;
  clearEventLog: () => void;
  
  // Lifecycle
  startGame: () => void;
  stopGame: () => void;
  setWorld: (world: IWorld) => void;
}

let gameLoopInterval: NodeJS.Timeout | null = null;

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  pollution: 0,
  fps: 60,
  playerPosition: { x: 0, y: 0 },
  playerInventory: {},
  playerTraits: [],
  dominantPlaystyle: 'Neutral',
  eventLog: [],
  actionHistory: [],
  playTime: 0,
  isPlaying: false,
  world: null,
  
  // State updates
  updatePollution: (value: number) => set({ pollution: value }),
  updateFPS: (value: number) => set({ fps: value }),
  updatePlayerPosition: (x: number, y: number) => set({ playerPosition: { x, y } }),
  updatePlayerInventory: (inventory: Record<string, number>) => set({ playerInventory: inventory }),
  setPlayerTraits: (traits: any[]) => set({ playerTraits: traits }),
  updatePlaystyle: (style: 'Harmony' | 'Conquest' | 'Frolick' | 'Neutral') => set({ dominantPlaystyle: style }),
  
  // Event logging
  addEvent: (event) => {
    const newEvent: GameEvent = {
      ...event,
      timestamp: Date.now()
    };
    set((state) => ({
      eventLog: [newEvent, ...state.eventLog].slice(0, 100) // Keep last 100 events
    }));
  },
  
  recordAction: (action: string) => {
    set((state) => ({
      actionHistory: [...state.actionHistory, action].slice(-100) // Rolling window of 100
    }));
  },
  
  clearEventLog: () => set({ eventLog: [], actionHistory: [] }),
  
  // Lifecycle
  startGame: () => {
    set({ isPlaying: true });
    
    // Start play time counter
    if (gameLoopInterval) {
      clearInterval(gameLoopInterval);
    }
    
    gameLoopInterval = setInterval(() => {
      set((state) => ({ playTime: state.playTime + 1 }));
    }, 1000);
  },
  
  stopGame: () => {
    set({ isPlaying: false });
    
    if (gameLoopInterval) {
      clearInterval(gameLoopInterval);
      gameLoopInterval = null;
    }
  },
  
  setWorld: (world: IWorld) => set({ world })
}));
