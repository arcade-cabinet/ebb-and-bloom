/**
 * Game Clock System - Production-quality time management for evolution simulation
 * Handles game time, generation cycles, and evolution events
 */

import { log, measurePerformance } from '../utils/Logger';

export interface GameTime {
  realTimeMs: number;           // Actual milliseconds since start
  gameTimeMs: number;           // Scaled game time
  generation: number;           // Current evolution generation
  generationProgress: number;   // 0-1 progress through current generation
  totalGenerations: number;     // Total generations simulated
  evolutionEvents: EvolutionEvent[];
}

export interface EvolutionEvent {
  generation: number;
  timestamp: number;
  eventType: 'trait_emergence' | 'behavior_shift' | 'pack_formation' | 'extinction' | 'speciation';
  description: string;
  affectedCreatures: string[];  // Entity IDs
  traits: number[];            // Trait values at time of event
  significance: number;        // 0-1, how important this event was
}

export interface TimeConfig {
  timeScale: number;           // Acceleration multiplier (1.0 = real time)
  generationDurationMs: number; // How long each generation lasts
  evolutionPressure: number;   // How fast traits change (0-1)
  maxGenerations: number;      // Safety limit for simulation
  autoPause: boolean;          // Pause on significant events
  logInterval: number;         // How often to dump state (generations)
}

class GameClock {
  private config: TimeConfig;
  private gameTime: GameTime;
  private startTime: number;
  private lastUpdate: number;
  private paused: boolean = false;
  private listeners: Array<(time: GameTime) => void> = [];
  private stateListeners: Array<(event: EvolutionEvent) => void> = [];
  
  constructor(config: Partial<TimeConfig> = {}) {
    this.config = {
      timeScale: config.timeScale || 10.0,      // 10x speed by default
      generationDurationMs: config.generationDurationMs || 30000, // 30 seconds per generation
      evolutionPressure: config.evolutionPressure || 0.1,
      maxGenerations: config.maxGenerations || 1000,
      autoPause: config.autoPause || false,
      logInterval: config.logInterval || 5
    };
    
    this.startTime = Date.now();
    this.lastUpdate = this.startTime;
    
    this.gameTime = {
      realTimeMs: 0,
      gameTimeMs: 0,
      generation: 0,
      generationProgress: 0,
      totalGenerations: 0,
      evolutionEvents: []
    };
    
    log.info('GameClock initialized', this.config);
  }
  
  update(): GameTime {
    if (this.paused) return this.gameTime;
    
    const now = Date.now();
    const deltaReal = now - this.lastUpdate;
    const deltaGame = deltaReal * this.config.timeScale;
    
    this.lastUpdate = now;
    
    // Update time values
    this.gameTime.realTimeMs = now - this.startTime;
    this.gameTime.gameTimeMs += deltaGame;
    
    // Calculate generation progress
    const generationTimeMs = this.gameTime.gameTimeMs % this.config.generationDurationMs;
    this.gameTime.generationProgress = generationTimeMs / this.config.generationDurationMs;
    
    // Check for generation advancement
    const newGeneration = Math.floor(this.gameTime.gameTimeMs / this.config.generationDurationMs);
    
    if (newGeneration > this.gameTime.generation) {
      this.advanceGeneration(newGeneration);
    }
    
    // Safety check - pause if too many generations
    if (this.gameTime.generation >= this.config.maxGenerations) {
      this.pause();
      log.warn('Maximum generations reached, pausing simulation', {
        generation: this.gameTime.generation,
        maxGenerations: this.config.maxGenerations
      });
    }
    
    // Notify listeners
    for (const listener of this.listeners) {
      try {
        listener(this.gameTime);
      } catch (error) {
        log.error('GameClock listener error', error);
      }
    }
    
    return this.gameTime;
  }
  
  private advanceGeneration(newGeneration: number): void {
    const perf = measurePerformance(`Generation ${newGeneration} Advancement`);
    
    const previousGeneration = this.gameTime.generation;
    this.gameTime.generation = newGeneration;
    this.gameTime.totalGenerations++;
    this.gameTime.generationProgress = 0;
    
    // Create generation advancement event
    const event: EvolutionEvent = {
      generation: newGeneration,
      timestamp: this.gameTime.gameTimeMs,
      eventType: 'trait_emergence',
      description: `Generation ${newGeneration} began`,
      affectedCreatures: [],
      traits: [],
      significance: 0.5
    };
    
    this.recordEvent(event);
    
    // Log state at intervals
    if (newGeneration % this.config.logInterval === 0) {
      this.dumpGenerationState();
    }
    
    perf.end();
    
    log.info('Generation advanced', {
      from: previousGeneration,
      to: newGeneration,
      totalGenerations: this.gameTime.totalGenerations,
      evolutionEvents: this.gameTime.evolutionEvents.length
    });
  }
  
  recordEvent(event: EvolutionEvent): void {
    this.gameTime.evolutionEvents.push(event);
    
    // Keep only recent events (memory management)
    if (this.gameTime.evolutionEvents.length > 1000) {
      this.gameTime.evolutionEvents = this.gameTime.evolutionEvents.slice(-500);
    }
    
    // Notify state listeners
    for (const listener of this.stateListeners) {
      try {
        listener(event);
      } catch (error) {
        log.error('Evolution event listener error', error);
      }
    }
    
    // Auto-pause on significant events
    if (this.config.autoPause && event.significance > 0.8) {
      this.pause();
      log.info('Auto-paused on significant evolution event', event);
    }
    
    log.debug('Evolution event recorded', event);
  }
  
  private dumpGenerationState(): void {
    const stateData = {
      timestamp: new Date().toISOString(),
      generation: this.gameTime.generation,
      gameTime: this.gameTime,
      config: this.config,
      recentEvents: this.gameTime.evolutionEvents.slice(-10),
      performance: {
        realTimeMs: this.gameTime.realTimeMs,
        gameTimeMs: this.gameTime.gameTimeMs,
        acceleration: this.config.timeScale
      }
    };
    
    // Log to file for analysis
    log.info('Generation state dump', stateData);
    
    // Also log to console for immediate visibility
    console.log(`=== GENERATION ${this.gameTime.generation} STATE ===`);
    console.log(`Real time: ${(this.gameTime.realTimeMs / 1000).toFixed(1)}s`);
    console.log(`Game time: ${(this.gameTime.gameTimeMs / 1000).toFixed(1)}s`);
    console.log(`Events: ${this.gameTime.evolutionEvents.length}`);
    console.log(`Recent events:`, this.gameTime.evolutionEvents.slice(-3));
    console.log('==========================================');
  }
  
  // Control methods
  pause(): void {
    this.paused = true;
    log.info('GameClock paused', { generation: this.gameTime.generation });
  }
  
  resume(): void {
    this.paused = false;
    this.lastUpdate = Date.now(); // Reset timing
    log.info('GameClock resumed', { generation: this.gameTime.generation });
  }
  
  setTimeScale(scale: number): void {
    this.config.timeScale = scale;
    log.info('Time scale changed', { newScale: scale });
  }
  
  // Event subscription
  onTimeUpdate(listener: (time: GameTime) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }
  
  onEvolutionEvent(listener: (event: EvolutionEvent) => void): () => void {
    this.stateListeners.push(listener);
    return () => {
      const index = this.stateListeners.indexOf(listener);
      if (index > -1) this.stateListeners.splice(index, 1);
    };
  }
  
  // Getters
  getCurrentTime(): GameTime {
    return { ...this.gameTime };
  }
  
  isPaused(): boolean {
    return this.paused;
  }
  
  getConfig(): TimeConfig {
    return { ...this.config };
  }
  
  // Analysis methods
  getEvolutionSummary(): {
    averageEventsPerGeneration: number;
    mostCommonEventType: string;
    totalSignificantEvents: number;
    evolutionRate: number;
  } {
    const events = this.gameTime.evolutionEvents;
    const generations = this.gameTime.totalGenerations || 1;
    
    const eventCounts = events.reduce((counts, event) => {
      counts[event.eventType] = (counts[event.eventType] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    const mostCommonType = Object.entries(eventCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';
    
    const significantEvents = events.filter(e => e.significance > 0.7).length;
    
    return {
      averageEventsPerGeneration: events.length / generations,
      mostCommonEventType: mostCommonType,
      totalSignificantEvents: significantEvents,
      evolutionRate: significantEvents / generations
    };
  }
}

// Singleton instance for global access
export const gameClock = new GameClock({
  timeScale: 10.0,           // 10x acceleration for testing
  generationDurationMs: 20000, // 20 second generations
  evolutionPressure: 0.15,   // Moderate evolution rate
  logInterval: 5,            // Log every 5 generations
  autoPause: false           // Don't auto-pause, let it run
});

export default GameClock;