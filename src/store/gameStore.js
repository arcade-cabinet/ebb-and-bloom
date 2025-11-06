/**
 * Game State Store using Zustand
 * Manages global game state, player progress, and intimacy mechanics
 */

import { create } from 'zustand';

export const useGameStore = create((set, get) => ({
  // Game state
  isPlaying: false,
  isPaused: false,
  gameTime: 0,
  
  // Player stats
  playTime: 0,
  intimacyLevel: 0,
  evolutionStage: 0,
  
  // World state
  worldSeed: null,
  pollutionLevel: 0,
  
  // Actions
  startGame: (seed) => set({
    isPlaying: true,
    worldSeed: seed || Date.now(),
    gameTime: 0
  }),
  
  pauseGame: () => set({ isPaused: true }),
  
  resumeGame: () => set({ isPaused: false }),
  
  stopGame: () => set({
    isPlaying: false,
    isPaused: false
  }),
  
  updateGameTime: (delta) => set((state) => ({
    gameTime: state.gameTime + delta,
    playTime: state.playTime + delta
  })),
  
  updateIntimacy: (amount) => set((state) => {
    const newIntimacy = Math.max(0, Math.min(100, state.intimacyLevel + amount));
    const newEvolution = Math.floor(newIntimacy / 20);
    
    return {
      intimacyLevel: newIntimacy,
      evolutionStage: newEvolution
    };
  }),
  
  updatePollution: (level) => set({ pollutionLevel: level }),
  
  // Get formatted play time
  getPlayTimeFormatted: () => {
    const state = get();
    const seconds = Math.floor(state.playTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}));

export default useGameStore;
