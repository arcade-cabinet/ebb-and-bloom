/**
 * Evolution Data Store - Persistent state management for evolution simulation
 * Uses Zustand for state persistence and Winston for file logging
 */

import { create } from 'zustand';
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware';
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

// Unified event system - platform, input, and gesture events
export interface PlatformEvent {
  type: 'platform' | 'resize' | 'orientation' | 'input';
  data: any;
  timestamp: number;
}

export interface GestureEvent {
  type: 'swipe' | 'pinch' | 'hold' | 'tap' | 'drag' | 'rotate' | 'double_tap' | 'long_press';
  position?: { x: number; y: number };
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
  fingers?: number;
  angle?: number;
  timestamp: number;
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
  
  // Unified event system - platform, input, and gestures
  platform: {
    platform: 'web' | 'ios' | 'android' | 'electron';
    isMobile: boolean;
    isDesktop: boolean;
    isNative: boolean;
    screen: {
      width: number;
      height: number;
      orientation: 'portrait' | 'landscape';
      aspectRatio: number;
    };
    inputMode: 'touch' | 'mouse' | 'keyboard' | 'gamepad';
  };
  
  eventHistory: Array<PlatformEvent | GestureEvent>;
  
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
  
  // Unified event actions
  dispatchPlatformEvent: (event: PlatformEvent) => void;
  dispatchGestureEvent: (event: GestureEvent) => void;
  setInputMode: (mode: EvolutionDataState['platform']['inputMode']) => void;
  updateScreen: (width: number, height: number) => void;
  analyzeEvolutionTrends: () => void;
  exportToFile: () => void;
  clearHistory: () => void;
  updateConfig: (newConfig: Partial<EvolutionDataState['config']>) => void;
}

export const useEvolutionDataStore = create<EvolutionDataState>()(
  subscribeWithSelector(
    persist(
      (set, get) => {
        // Initialize platform state
        const getPlatform = (): EvolutionDataState['platform']['platform'] => {
          if (typeof window === 'undefined') return 'web';
          const plat = Platform.getPlatform();
          if (plat === 'ios' || plat === 'android') return plat;
          if (plat === 'electron') return 'electron';
          return 'web';
        };

        const platform = getPlatform();
        const isNative = Capacitor.isNativePlatform();
        const isMobile = ['ios', 'android'].includes(platform);
        const isDesktop = platform === 'electron';

        const initialWidth = typeof window !== 'undefined' ? window.innerWidth : 1280;
        const initialHeight = typeof window !== 'undefined' ? window.innerHeight : 720;
        const initialOrientation = initialWidth > initialHeight ? 'landscape' : 'portrait';

        return {
        // Initial state
        currentGeneration: 0,
        simulationStartTime: new Date().toISOString(),
        totalEvolutionEvents: 0,
        generationHistory: [],
        significantEvents: [],
        emergentSpecies: {},
        lastAnalysis: null,
        
        // Unified platform state
        platform: {
          platform,
          isMobile,
          isDesktop,
          isNative,
          screen: {
            width: initialWidth,
            height: initialHeight,
            orientation: initialOrientation,
            aspectRatio: initialWidth / initialHeight,
          },
          inputMode: isMobile ? 'touch' : 'mouse',
        },
        
        eventHistory: [],
        
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
      },
      
      // Unified event actions
      dispatchPlatformEvent: (event: PlatformEvent) => {
        set((state) => {
          const newHistory = [...state.eventHistory.slice(-49), event]; // Keep last 50 events
          
          log.debug('Platform event dispatched', { type: event.type, data: event.data });
          
          // Handle specific event types
          if (event.type === 'platform') {
            const getPlatformValue = (): EvolutionDataState['platform']['platform'] => {
              if (typeof window === 'undefined') return 'web';
              const plat = Platform.getPlatform();
              if (plat === 'ios' || plat === 'android') return plat;
              if (plat === 'electron') return 'electron';
              return 'web';
            };
            const plat = getPlatformValue();
            return {
              platform: {
                ...state.platform,
                platform: plat,
                isMobile: ['ios', 'android'].includes(plat),
                isDesktop: plat === 'electron',
                isNative: Capacitor.isNativePlatform(),
              },
              eventHistory: newHistory,
            };
          } else if (event.type === 'resize') {
            const { width, height } = event.data;
            return {
              platform: {
                ...state.platform,
                screen: {
                  width,
                  height,
                  orientation: width > height ? 'landscape' : 'portrait',
                  aspectRatio: width / height,
                },
              },
              eventHistory: newHistory,
            };
          } else if (event.type === 'orientation') {
            const { orientation } = event.data;
            return {
              platform: {
                ...state.platform,
                screen: {
                  ...state.platform.screen,
                  orientation: orientation === 'landscape' ? 'landscape' : 'portrait',
                },
              },
              eventHistory: newHistory,
            };
          } else if (event.type === 'input') {
            return {
              platform: {
                ...state.platform,
                inputMode: event.data,
              },
              eventHistory: newHistory,
            };
          }
          
          return { eventHistory: newHistory };
        });
      },
      
      dispatchGestureEvent: (event: GestureEvent) => {
        set((state) => {
          const newHistory = [...state.eventHistory.slice(-49), event]; // Keep last 50 events
          log.debug('Gesture event dispatched', { type: event.type, position: event.position });
          return { eventHistory: newHistory };
        });
      },
      
      setInputMode: (mode) => {
        set((state) => ({
          platform: {
            ...state.platform,
            inputMode: mode,
          },
        }));
        log.debug('Input mode set', { mode });
      },
      
      updateScreen: (width, height) => {
        set((state) => ({
          platform: {
            ...state.platform,
            screen: {
              width,
              height,
              orientation: width > height ? 'landscape' : 'portrait',
              aspectRatio: width / height,
            },
          },
        }));
        log.debug('Screen updated', { width, height });
      },
        };
      }
    ),
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