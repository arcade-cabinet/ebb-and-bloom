/**
 * Stage Orchestrator
 * 
 * FMV controller for cosmic stage progression with state machine.
 * Manages playback, transitions, and integration with audio/haptics systems.
 * 
 * PRODUCTION-READY: Complete state machine with lifecycle management.
 */

import { EnhancedRNG } from '../utils/EnhancedRNG';
import { CosmicProvenanceTimeline } from './CosmicProvenanceTimeline';
import { GenesisConstants } from './GenesisConstants';
import { CosmicAudioSonification } from '../audio/CosmicAudioSonification';
import { CosmicHapticFeedback } from '../haptics/CosmicHapticFeedback';
import { CosmicStageDescriptor, createStageDescriptors } from './CosmicStageDescriptor';

export type OrchestratorState = 'loading' | 'playing' | 'paused' | 'completed';

export interface StageTransition {
  fromStage: CosmicStageDescriptor | null;
  toStage: CosmicStageDescriptor;
  progress: number;
}

type StageChangeCallback = (transition: StageTransition) => void;
type CompleteCallback = () => void;

/**
 * Orchestrates the cosmic FMV sequence with state management.
 */
export class StageOrchestrator {
  private state: OrchestratorState = 'loading';
  private stages: CosmicStageDescriptor[] = [];
  private currentStageIndex: number = 0;
  private stageProgress: number = 0;
  private totalElapsedTime: number = 0;
  
  private rng: EnhancedRNG;
  private timeline: CosmicProvenanceTimeline;
  private genesis: GenesisConstants;
  private audio: CosmicAudioSonification;
  private haptics: CosmicHapticFeedback;
  
  private stageChangeCallbacks: Set<StageChangeCallback> = new Set();
  private completeCallbacks: Set<CompleteCallback> = new Set();
  
  private lastStageIndex: number = -1;

  constructor(
    seed: string,
    timeline: CosmicProvenanceTimeline,
    genesis: GenesisConstants,
    audio: CosmicAudioSonification,
    haptics: CosmicHapticFeedback
  ) {
    this.rng = new EnhancedRNG(`${seed}-stage-orchestrator`);
    this.timeline = timeline;
    this.genesis = genesis;
    this.audio = audio;
    this.haptics = haptics;
    
    this.initialize();
  }

  private initialize(): void {
    this.stages = createStageDescriptors(this.rng);
    this.state = 'paused';
    this.currentStageIndex = 0;
    this.stageProgress = 0;
    this.totalElapsedTime = 0;
    this.lastStageIndex = -1;
  }

  /**
   * Start or resume playback
   */
  public play(): void {
    if (this.state === 'completed') {
      this.reset();
    }
    
    if (this.state === 'paused' || this.state === 'loading') {
      this.state = 'playing';
      this.triggerStageChangeIfNeeded();
    }
  }

  /**
   * Pause playback
   */
  public pause(): void {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.audio.stopAll();
      this.haptics.stopAll();
    }
  }

  /**
   * Skip to next stage
   */
  public skip(): void {
    if (this.currentStageIndex < this.stages.length - 1) {
      const previousStage = this.stages[this.currentStageIndex];
      this.currentStageIndex++;
      this.stageProgress = 0;
      
      const currentStage = this.stages[this.currentStageIndex];
      this.notifyStageChange(previousStage, currentStage);
      
      if (this.state === 'playing') {
        this.enterStage(currentStage);
      }
    } else {
      this.complete();
    }
  }

  /**
   * Reset to beginning
   */
  public reset(): void {
    this.audio.stopAll();
    this.haptics.stopAll();
    
    this.currentStageIndex = 0;
    this.stageProgress = 0;
    this.totalElapsedTime = 0;
    this.lastStageIndex = -1;
    this.state = 'paused';
  }

  /**
   * Get current stage descriptor
   */
  public getCurrentStage(): CosmicStageDescriptor {
    return this.stages[this.currentStageIndex];
  }

  /**
   * Get current stage index
   */
  public getCurrentStageIndex(): number {
    return this.currentStageIndex;
  }

  /**
   * Get total number of stages
   */
  public getTotalStages(): number {
    return this.stages.length;
  }

  /**
   * Get progress through current stage (0-1)
   */
  public getProgress(): number {
    return this.stageProgress;
  }

  /**
   * Get overall progress through all stages (0-1)
   */
  public getOverallProgress(): number {
    const totalDuration = this.stages.reduce((sum, stage) => sum + stage.duration, 0);
    const completedDuration = this.stages
      .slice(0, this.currentStageIndex)
      .reduce((sum, stage) => sum + stage.duration, 0);
    const currentStageDuration = this.stages[this.currentStageIndex].duration;
    const currentStageElapsed = this.stageProgress * currentStageDuration;
    
    return (completedDuration + currentStageElapsed) / totalDuration;
  }

  /**
   * Get current state
   */
  public getState(): OrchestratorState {
    return this.state;
  }

  /**
   * Get all stages
   */
  public getAllStages(): CosmicStageDescriptor[] {
    return [...this.stages];
  }

  /**
   * Jump to specific stage
   */
  public jumpToStage(index: number): void {
    if (index < 0 || index >= this.stages.length) {
      throw new Error(`Invalid stage index: ${index}`);
    }
    
    const previousStage = this.stages[this.currentStageIndex];
    this.currentStageIndex = index;
    this.stageProgress = 0;
    
    const currentStage = this.stages[this.currentStageIndex];
    this.notifyStageChange(previousStage, currentStage);
    
    if (this.state === 'playing') {
      this.enterStage(currentStage);
    }
  }

  /**
   * Update orchestrator (call every frame)
   */
  public update(deltaTime: number): void {
    if (this.state !== 'playing') {
      return;
    }

    this.triggerStageChangeIfNeeded();

    let remainingTime = deltaTime;
    
    while (remainingTime > 0 && this.state === 'playing') {
      const currentStage = this.stages[this.currentStageIndex];
      const stageDuration = currentStage.duration;
      const timeToStageEnd = stageDuration * (1.0 - this.stageProgress);
      
      if (remainingTime >= timeToStageEnd) {
        remainingTime -= timeToStageEnd;
        this.stageProgress = 1.0;
        this.totalElapsedTime += timeToStageEnd;
        
        this.exitStage(currentStage);
        
        if (this.currentStageIndex < this.stages.length - 1) {
          const previousStage = currentStage;
          this.currentStageIndex++;
          this.stageProgress = 0;
          
          const nextStage = this.stages[this.currentStageIndex];
          this.notifyStageChange(previousStage, nextStage);
          this.enterStage(nextStage);
        } else {
          this.complete();
          break;
        }
      } else {
        this.stageProgress += remainingTime / stageDuration;
        this.totalElapsedTime += remainingTime;
        this.updateStage(currentStage, this.stageProgress);
        remainingTime = 0;
      }
    }
  }

  /**
   * Register callback for stage changes
   * @returns Unsubscribe function
   */
  public onStageChange(callback: StageChangeCallback): () => void {
    this.stageChangeCallbacks.add(callback);
    return () => {
      this.stageChangeCallbacks.delete(callback);
    };
  }

  /**
   * Register callback for completion
   * @returns Unsubscribe function
   */
  public onComplete(callback: CompleteCallback): () => void {
    this.completeCallbacks.add(callback);
    return () => {
      this.completeCallbacks.delete(callback);
    };
  }

  private triggerStageChangeIfNeeded(): void {
    if (this.lastStageIndex !== this.currentStageIndex) {
      this.lastStageIndex = this.currentStageIndex;
      const currentStage = this.stages[this.currentStageIndex];
      const previousStage = this.currentStageIndex > 0 
        ? this.stages[this.currentStageIndex - 1] 
        : null;
      
      this.notifyStageChange(previousStage, currentStage);
      this.enterStage(currentStage);
    }
  }

  private enterStage(stage: CosmicStageDescriptor): void {
    const stageId = this.getStageId(stage);
    
    this.audio.playSoundForStage(stageId, 0);
    this.haptics.playHapticForStage(stageId, 0);
  }

  private updateStage(stage: CosmicStageDescriptor, progress: number): void {
    const stageId = this.getStageId(stage);
    
    if (progress % 0.1 < 0.05) {
      this.audio.playSoundForStage(stageId, progress);
      this.haptics.playHapticForStage(stageId, progress);
    }
  }

  private exitStage(stage: CosmicStageDescriptor): void {
    this.audio.stopAll();
    this.haptics.stopAll();
  }

  private complete(): void {
    this.state = 'completed';
    this.stageProgress = 1.0;
    
    this.audio.stopAll();
    this.haptics.stopAll();
    
    for (const callback of this.completeCallbacks) {
      callback();
    }
  }

  private notifyStageChange(
    fromStage: CosmicStageDescriptor | null,
    toStage: CosmicStageDescriptor
  ): void {
    const transition: StageTransition = {
      fromStage,
      toStage,
      progress: this.stageProgress
    };
    
    for (const callback of this.stageChangeCallbacks) {
      callback(transition);
    }
  }

  private getStageId(stage: CosmicStageDescriptor): string {
    const stageNameToId: Record<string, string> = {
      'Quantum Fluctuation': 'planck-epoch',
      'Cosmic Inflation': 'cosmic-inflation',
      'Dark Matter Web': 'dark-matter-web',
      'Population III Stars': 'population-iii-stars',
      'First Supernovae': 'first-supernovae',
      'Galaxy Formation': 'galaxy-position',
      'Molecular Cloud': 'molecular-cloud',
      'Stellar Furnace': 'cloud-collapse',
      'Planetary Accretion': 'planetary-accretion'
    };
    
    return stageNameToId[stage.stageName] || 'planck-epoch';
  }
}
