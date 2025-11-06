/**
 * Pinia Game Store - Correct State Management for Ionic Vue
 * Per 07-mobileUX.md: "Use Pinia store for shared state"
 */

import { defineStore } from 'pinia';
import type { IWorld } from 'bitecs';

interface GameEvent {
  type: string;
  title: string;
  description: string;
  timestamp: number;
  haiku?: string;
}

export const useGameStore = defineStore('game', {
  state: () => ({
    // ECS World
    world: null as IWorld | null,
    
    // Core state
    pollution: 0,
    fps: 60,
    playTime: 0,
    isPlaying: false,
    
    // Player state (synced from ECS)
    playerPosition: { x: 0, y: 0 },
    playerInventory: {} as Record<string, number>,
    playerTraits: [] as any[],
    dominantPlaystyle: 'Neutral' as 'Harmony' | 'Conquest' | 'Frolick' | 'Neutral',
    
    // Event logging
    eventLog: [] as GameEvent[],
    actionHistory: [] as string[]
  }),
  
  getters: {
    totalResources: (state) => {
      return Object.values(state.playerInventory).reduce((sum, val) => sum + val, 0);
    },
    
    playstyleColor: (state) => {
      switch (state.dominantPlaystyle) {
        case 'Harmony': return 'success';
        case 'Conquest': return 'danger';
        case 'Frolick': return 'warning';
        default: return 'medium';
      }
    },
    
    pollutionColor: (state) => {
      if (state.pollution > 70) return 'danger';
      if (state.pollution > 40) return 'warning';
      return 'success';
    },
    
    formattedPlayTime: (state) => {
      const minutes = Math.floor(state.playTime / 60);
      const seconds = state.playTime % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  },
  
  actions: {
    // State updates
    updatePollution(value: number) {
      this.pollution = value;
    },
    
    addPollution(amount: number) {
      this.pollution = Math.min(100, this.pollution + amount);
    },
    
    updateFPS(value: number) {
      this.fps = value;
    },
    
    updatePlayerPosition(x: number, y: number) {
      this.playerPosition = { x, y };
    },
    
    updatePlayerInventory(inventory: Record<string, number>) {
      this.playerInventory = inventory;
    },
    
    setPlayerTraits(traits: any[]) {
      this.playerTraits = traits;
    },
    
    updatePlaystyle(style: 'Harmony' | 'Conquest' | 'Frolick' | 'Neutral') {
      this.dominantPlaystyle = style;
    },
    
    // Event logging
    addEvent(event: Omit<GameEvent, 'timestamp'>) {
      const newEvent: GameEvent = {
        ...event,
        timestamp: Date.now()
      };
      this.eventLog = [newEvent, ...this.eventLog].slice(0, 100);
    },
    
    recordAction(action: string) {
      this.actionHistory = [...this.actionHistory, action].slice(-100);
    },
    
    clearEventLog() {
      this.eventLog = [];
      this.actionHistory = [];
    },
    
    // Lifecycle
    startGame() {
      this.isPlaying = true;
      
      // Start play time counter
      const interval = setInterval(() => {
        if (this.isPlaying) {
          this.playTime++;
        } else {
          clearInterval(interval);
        }
      }, 1000);
    },
    
    stopGame() {
      this.isPlaying = false;
    },
    
    setWorld(world: IWorld) {
      this.world = world;
    },
    
    reset() {
      this.pollution = 0;
      this.playTime = 0;
      this.playerPosition = { x: 0, y: 0 };
      this.playerInventory = {};
      this.eventLog = [];
      this.actionHistory = [];
    }
  }
});
