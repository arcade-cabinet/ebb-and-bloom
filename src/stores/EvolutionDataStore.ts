/**
 * Evolution Data Store - Persistent state management for evolution simulation
 * Uses Zustand for state persistence and Winston for file logging
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { log } from '../utils/Logger';
import type { GameTime, EvolutionEvent } from '../systems/GameClock';
import type { EcosystemState } from '../systems/EcosystemFoundation';
import type { EvolutionaryCreature } from '../systems/CreatureArchetypeSystem';
import type { PopulationStats } from '../systems/PopulationDynamicsSystem';

export interface GenerationSnapshot {
  generation: number;
  timestamp: string;
  gameTime: GameTime;
  ecosystemState: EcosystemState;
  populationStats: PopulationStats;
  creatures: CreatureSnapshot[];
  materials: MaterialSnapshot[];
  evolutionEvents: EvolutionEvent[];
  significantChanges: string[];
}

interface CreatureSnapshot {
  id: string;
  archetype: string;
  generation: number;
  age: number;
  traits: number[];
  behaviorState: string;
  position: [number, number, number];
  energy: number;
  packMembership?: string;
  emergentName?: string;
  mutationCount: number;
}

interface MaterialSnapshot {
  id: string;
  category: string;
  position: [number, number, number];
  purity: number;
  influenceRadius: number;
  nearbyCreatures: string[];
  evolutionPressure: number[];
}

interface EvolutionDataState {
  // Current simulation state
  currentGeneration: number;
  simulationStartTime: string;
  totalEvolutionEvents: number;
  
  // Historical data
  generationHistory: GenerationSnapshot[];
  significantEvents: EvolutionEvent[];
  emergentSpecies: Record<string, CreatureSnapshot>;
  
  // Analysis cache
  lastAnalysis: {
    timestamp: string;
    evolutionRate: number;
    diversityIndex: number;
    populationTrend: 'growing' | 'stable' | 'declining';
    dominantTraits: number[];
  } | null;
  
  // Configuration
  config: {
    maxHistorySize: number;
    analysisInterval: number;
    autoSaveInterval: number;
    fileLoggingEnabled: boolean;
  };
  
  // Actions
  recordGenerationSnapshot: (snapshot: GenerationSnapshot) => void;
  recordEvolutionEvent: (event: EvolutionEvent) => void;
  analyzeEvolutionTrends: () => void;
  exportToFile: () => void;
  clearHistory: () => void;
  updateConfig: (newConfig: Partial<EvolutionDataState['config']>) => void;
}

export const useEvolutionDataStore = create<EvolutionDataState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentGeneration: 0,
      simulationStartTime: new Date().toISOString(),
      totalEvolutionEvents: 0,
      generationHistory: [],
      significantEvents: [],
      emergentSpecies: {},
      lastAnalysis: null,
      
      config: {
        maxHistorySize: 100,        // Keep last 100 generations
        analysisInterval: 10,       // Analyze every 10 generations  
        autoSaveInterval: 5,        // Auto-save every 5 generations
        fileLoggingEnabled: true
      },
      
      // Actions
      recordGenerationSnapshot: (snapshot: GenerationSnapshot) => {
        set((state) => {
          const newHistory = [...state.generationHistory, snapshot];
          
          // Trim history to max size
          const trimmedHistory = newHistory.length > state.config.maxHistorySize
            ? newHistory.slice(-state.config.maxHistorySize)
            : newHistory;
          
          // Log to winston file
          if (state.config.fileLoggingEnabled) {
            log.info('Generation snapshot recorded', {
              generation: snapshot.generation,
              creatureCount: snapshot.creatures.length,
              materialCount: snapshot.materials.length,
              evolutionEvents: snapshot.evolutionEvents.length,
              significantChanges: snapshot.significantChanges
            });
            
            // Detailed file logging
            log.debug('Complete generation data', {
              snapshot: JSON.stringify(snapshot, null, 2)
            });
          }
          
          return {
            currentGeneration: snapshot.generation,
            generationHistory: trimmedHistory,
            totalEvolutionEvents: state.totalEvolutionEvents + snapshot.evolutionEvents.length
          };
        });
      },
      
      recordEvolutionEvent: (event: EvolutionEvent) => {
        set((state) => {
          const newEvents = [...state.significantEvents, event];
          
          // Keep only significant events (significance > 0.6)
          const significantOnly = newEvents.filter(e => e.significance > 0.6);
          
          // Log to winston
          log.info('Significant evolution event', {
            generation: event.generation,
            eventType: event.eventType,
            description: event.description,
            significance: event.significance,
            affectedCreatures: event.affectedCreatures.length,
            traits: event.traits
          });
          
          // Check for emergent species
          if (event.eventType === 'speciation' && event.description.includes('new')) {
            log.info('New species detected', {
              generation: event.generation,
              traits: event.traits,
              significance: event.significance
            });
          }
          
          return {
            significantEvents: significantOnly.slice(-50), // Keep last 50 significant events
            totalEvolutionEvents: state.totalEvolutionEvents + 1
          };
        });
      },
      
      analyzeEvolutionTrends: () => {
        const state = get();
        const recentHistory = state.generationHistory.slice(-20); // Last 20 generations
        
        if (recentHistory.length < 2) return;
        
        // Calculate evolution metrics
        const evolutionRate = recentHistory.reduce((sum, snap) => 
          sum + snap.evolutionEvents.length, 0) / recentHistory.length;
        
        // Calculate diversity index (how different creatures have become)
        const allCreatures = recentHistory.flatMap(snap => snap.creatures);
        const diversityIndex = calculateTraitDiversity(allCreatures);
        
        // Population trend
        const firstPop = recentHistory[0].ecosystemState.totalCreatures;
        const lastPop = recentHistory[recentHistory.length - 1].ecosystemState.totalCreatures;
        const populationTrend: 'growing' | 'stable' | 'declining' = 
          lastPop > firstPop * 1.1 ? 'growing' : 
          lastPop < firstPop * 0.9 ? 'declining' : 'stable';
        
        // Dominant traits
        const dominantTraits = calculateDominantTraits(allCreatures);
        
        const analysis = {
          timestamp: new Date().toISOString(),
          evolutionRate,
          diversityIndex,
          populationTrend,
          dominantTraits
        };
        
        set({ lastAnalysis: analysis });
        
        // Log comprehensive analysis
        log.info('Evolution trend analysis complete', analysis);
        
        return analysis;
      },
      
      exportToFile: () => {
        const state = get();
        
        const exportData = {
          metadata: {
            exportTime: new Date().toISOString(),
            simulationDuration: Date.now() - new Date(state.simulationStartTime).getTime(),
            totalGenerations: state.currentGeneration,
            totalEvents: state.totalEvolutionEvents
          },
          fullHistory: state.generationHistory,
          significantEvents: state.significantEvents,
          emergentSpecies: state.emergentSpecies,
          analysis: state.lastAnalysis
        };
        
        // Log complete dataset for file export
        log.info('Complete evolution dataset export', {
          exportSize: JSON.stringify(exportData).length,
          generations: state.generationHistory.length,
          events: state.significantEvents.length,
          analysis: exportData.analysis
        });
        
        // Would also save to downloadable file in production
        return exportData;
      },
      
      clearHistory: () => {
        log.info('Clearing evolution history');
        set({
          generationHistory: [],
          significantEvents: [],
          emergentSpecies: {},
          lastAnalysis: null,
          totalEvolutionEvents: 0
        });
      },
      
      updateConfig: (newConfig) => {
        set((state) => ({
          config: { ...state.config, ...newConfig }
        }));
        log.info('Evolution data store config updated', newConfig);
      }
    }),
    {
      name: 'ebb-bloom-evolution-data',
      storage: createJSONStorage(() => localStorage),
      skipHydration: false
    }
  )
);

// Helper functions
function calculateTraitDiversity(creatures: CreatureSnapshot[]): number {
  if (creatures.length === 0) return 0;
  
  // Calculate variance in trait values across population
  const traitVariances = Array(10).fill(0);
  
  for (let traitIndex = 0; traitIndex < 10; traitIndex++) {
    const values = creatures.map(c => c.traits[traitIndex] || 0);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    traitVariances[traitIndex] = variance;
  }
  
  // Average variance as diversity index
  return traitVariances.reduce((sum, variance) => sum + variance, 0) / 10;
}

function calculateDominantTraits(creatures: CreatureSnapshot[]): number[] {
  if (creatures.length === 0) return Array(10).fill(0);
  
  const traitAverages = Array(10).fill(0);
  
  for (let traitIndex = 0; traitIndex < 10; traitIndex++) {
    const values = creatures.map(c => c.traits[traitIndex] || 0);
    traitAverages[traitIndex] = values.reduce((sum, val) => sum + val, 0) / values.length;
  }
  
  return traitAverages;
}

// Hook for logging generation snapshots
export const useGenerationLogger = () => {
  const store = useEvolutionDataStore();
  
  return {
    logGeneration: (snapshot: GenerationSnapshot) => {
      store.recordGenerationSnapshot(snapshot);
      
      // Auto-analyze every N generations
      if (snapshot.generation % store.config.analysisInterval === 0) {
        store.analyzeEvolutionTrends();
      }
      
      // Auto-export every N generations
      if (snapshot.generation % store.config.autoSaveInterval === 0) {
        store.exportToFile();
      }
    },
    
    logEvent: (event: EvolutionEvent) => {
      store.recordEvolutionEvent(event);
    },
    
    getAnalysis: () => store.lastAnalysis,
    getHistory: () => store.generationHistory,
    
    exportData: () => store.exportToFile()
  };
};

export default useEvolutionDataStore;