/**
 * StageOrchestrator Tests
 * 
 * Verify lifecycle transitions and callback behavior
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnhancedRNG } from '../../../engine/utils/EnhancedRNG';
import { CosmicProvenanceTimeline } from '../../../engine/genesis/CosmicProvenanceTimeline';
import { GenesisConstants } from '../../../engine/genesis/GenesisConstants';
import { CosmicAudioSonification } from '../../../engine/audio/CosmicAudioSonification';
import { CosmicHapticFeedback } from '../../../engine/haptics/CosmicHapticFeedback';
import { StageOrchestrator, OrchestratorState } from '../../../engine/genesis/StageOrchestrator';

describe('StageOrchestrator', () => {
  let orchestrator: StageOrchestrator;
  let masterRng: EnhancedRNG;
  let timeline: CosmicProvenanceTimeline;
  let genesis: GenesisConstants;
  let audio: CosmicAudioSonification;
  let haptics: CosmicHapticFeedback;

  beforeEach(() => {
    masterRng = new EnhancedRNG('test-seed');
    timeline = new CosmicProvenanceTimeline(masterRng);
    genesis = new GenesisConstants(masterRng);
    audio = new CosmicAudioSonification(masterRng);
    haptics = new CosmicHapticFeedback(masterRng);
    
    vi.spyOn(audio, 'playSoundForStage').mockImplementation(() => {});
    vi.spyOn(audio, 'stopAll').mockImplementation(() => {});
    vi.spyOn(haptics, 'playHapticForStage').mockImplementation(() => Promise.resolve());
    vi.spyOn(haptics, 'stopAll').mockImplementation(() => Promise.resolve());
    
    orchestrator = new StageOrchestrator(
      'test-seed',
      timeline,
      genesis,
      audio,
      haptics
    );
  });

  describe('Initialization', () => {
    it('should initialize in paused state', () => {
      expect(orchestrator.getState()).toBe('paused');
    });

    it('should start at stage 0', () => {
      expect(orchestrator.getCurrentStageIndex()).toBe(0);
    });

    it('should have progress at 0', () => {
      expect(orchestrator.getProgress()).toBe(0);
    });

    it('should have 9 total stages', () => {
      expect(orchestrator.getTotalStages()).toBe(9);
    });

    it('should have valid first stage', () => {
      const stage = orchestrator.getCurrentStage();
      expect(stage).toBeTruthy();
      expect(stage.stageName).toBe('Quantum Fluctuation');
    });
  });

  describe('State Transitions', () => {
    it('should transition from paused to playing on play()', () => {
      expect(orchestrator.getState()).toBe('paused');
      orchestrator.play();
      expect(orchestrator.getState()).toBe('playing');
    });

    it('should transition from playing to paused on pause()', () => {
      orchestrator.play();
      expect(orchestrator.getState()).toBe('playing');
      orchestrator.pause();
      expect(orchestrator.getState()).toBe('paused');
    });

    it('should reset to paused state on reset()', () => {
      orchestrator.play();
      orchestrator.update(5.0);
      orchestrator.reset();
      
      expect(orchestrator.getState()).toBe('paused');
      expect(orchestrator.getCurrentStageIndex()).toBe(0);
      expect(orchestrator.getProgress()).toBe(0);
    });

    it('should transition to completed when all stages finish', () => {
      orchestrator.play();
      
      const stages = orchestrator.getAllStages();
      const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);
      
      orchestrator.update(totalDuration + 1);
      
      expect(orchestrator.getState()).toBe('completed');
    });

    it('should reset from completed state when play() is called', () => {
      orchestrator.play();
      
      const stages = orchestrator.getAllStages();
      const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);
      
      orchestrator.update(totalDuration + 1);
      expect(orchestrator.getState()).toBe('completed');
      
      orchestrator.play();
      expect(orchestrator.getState()).toBe('playing');
      expect(orchestrator.getCurrentStageIndex()).toBe(0);
    });

    it('should not update when paused', () => {
      orchestrator.pause();
      const initialProgress = orchestrator.getProgress();
      
      orchestrator.update(1.0);
      
      expect(orchestrator.getProgress()).toBe(initialProgress);
    });

    it('should not update when completed', () => {
      orchestrator.play();
      
      const stages = orchestrator.getAllStages();
      const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);
      
      orchestrator.update(totalDuration + 1);
      expect(orchestrator.getState()).toBe('completed');
      
      const finalProgress = orchestrator.getProgress();
      orchestrator.update(1.0);
      
      expect(orchestrator.getProgress()).toBe(finalProgress);
    });
  });

  describe('Progress Tracking', () => {
    it('should update progress correctly during stage', () => {
      orchestrator.play();
      const stage = orchestrator.getCurrentStage();
      
      orchestrator.update(stage.duration / 2);
      
      const progress = orchestrator.getProgress();
      expect(progress).toBeGreaterThan(0.4);
      expect(progress).toBeLessThan(0.6);
    });

    it('should reset progress to 0 when moving to next stage', () => {
      orchestrator.play();
      const firstStage = orchestrator.getCurrentStage();
      
      orchestrator.update(firstStage.duration + 0.1);
      
      expect(orchestrator.getCurrentStageIndex()).toBe(1);
      expect(orchestrator.getProgress()).toBeLessThan(0.1);
    });

    it('should calculate overall progress correctly', () => {
      orchestrator.play();
      
      expect(orchestrator.getOverallProgress()).toBe(0);
      
      const firstStage = orchestrator.getCurrentStage();
      orchestrator.update(firstStage.duration);
      
      const overallProgress = orchestrator.getOverallProgress();
      expect(overallProgress).toBeGreaterThan(0);
      expect(overallProgress).toBeLessThan(1);
    });

    it('should reach 100% overall progress at completion', () => {
      orchestrator.play();
      
      const stages = orchestrator.getAllStages();
      const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);
      
      orchestrator.update(totalDuration + 1);
      
      expect(orchestrator.getProgress()).toBe(1);
    });
  });

  describe('Stage Navigation', () => {
    it('should skip to next stage', () => {
      orchestrator.skip();
      
      expect(orchestrator.getCurrentStageIndex()).toBe(1);
      expect(orchestrator.getCurrentStage().stageName).toBe('Cosmic Inflation');
    });

    it('should complete when skipping from last stage', () => {
      for (let i = 0; i < 9; i++) {
        orchestrator.skip();
      }
      
      expect(orchestrator.getState()).toBe('completed');
    });

    it('should jump to specific stage', () => {
      orchestrator.jumpToStage(5);
      
      expect(orchestrator.getCurrentStageIndex()).toBe(5);
      expect(orchestrator.getCurrentStage().stageName).toBe('Galaxy Formation');
    });

    it('should throw error when jumping to invalid stage index', () => {
      expect(() => orchestrator.jumpToStage(-1)).toThrow();
      expect(() => orchestrator.jumpToStage(10)).toThrow();
    });

    it('should reset progress when jumping to stage', () => {
      orchestrator.play();
      orchestrator.update(2.0);
      
      orchestrator.jumpToStage(3);
      
      expect(orchestrator.getProgress()).toBe(0);
    });

    it('should automatically advance to next stage after duration', () => {
      orchestrator.play();
      const firstStage = orchestrator.getCurrentStage();
      
      orchestrator.update(firstStage.duration + 0.1);
      
      expect(orchestrator.getCurrentStageIndex()).toBe(1);
    });
  });

  describe('Callbacks', () => {
    it('should call onStageChange callback when stage changes', () => {
      const callback = vi.fn();
      orchestrator.onStageChange(callback);
      
      orchestrator.play();
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          fromStage: null,
          toStage: expect.objectContaining({ stageName: 'Quantum Fluctuation' }),
          progress: 0
        })
      );
    });

    it('should call onStageChange callback when skipping', () => {
      const callback = vi.fn();
      orchestrator.onStageChange(callback);
      
      orchestrator.skip();
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          fromStage: expect.objectContaining({ stageName: 'Quantum Fluctuation' }),
          toStage: expect.objectContaining({ stageName: 'Cosmic Inflation' }),
          progress: 0
        })
      );
    });

    it('should call onComplete callback when orchestrator completes', () => {
      const callback = vi.fn();
      orchestrator.onComplete(callback);
      
      orchestrator.play();
      
      const stages = orchestrator.getAllStages();
      const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);
      
      orchestrator.update(totalDuration + 1);
      
      expect(callback).toHaveBeenCalled();
    });

    it('should allow unsubscribing from onStageChange', () => {
      const callback = vi.fn();
      const unsubscribe = orchestrator.onStageChange(callback);
      
      unsubscribe();
      orchestrator.skip();
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should allow unsubscribing from onComplete', () => {
      const callback = vi.fn();
      const unsubscribe = orchestrator.onComplete(callback);
      
      unsubscribe();
      orchestrator.play();
      
      const stages = orchestrator.getAllStages();
      const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);
      
      orchestrator.update(totalDuration + 1);
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should call multiple stage change callbacks', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      orchestrator.onStageChange(callback1);
      orchestrator.onStageChange(callback2);
      
      orchestrator.skip();
      
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should call multiple complete callbacks', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      orchestrator.onComplete(callback1);
      orchestrator.onComplete(callback2);
      
      orchestrator.play();
      
      const stages = orchestrator.getAllStages();
      const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);
      
      orchestrator.update(totalDuration + 1);
      
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('Audio and Haptics Integration', () => {
    it('should trigger audio on stage enter', () => {
      orchestrator.play();
      
      expect(audio.playSoundForStage).toHaveBeenCalled();
    });

    it('should trigger haptics on stage enter', () => {
      orchestrator.play();
      
      expect(haptics.playHapticForStage).toHaveBeenCalled();
    });

    it('should stop audio on pause', () => {
      orchestrator.play();
      orchestrator.pause();
      
      expect(audio.stopAll).toHaveBeenCalled();
    });

    it('should stop haptics on pause', () => {
      orchestrator.play();
      orchestrator.pause();
      
      expect(haptics.stopAll).toHaveBeenCalled();
    });

    it('should stop audio on reset', () => {
      orchestrator.play();
      orchestrator.reset();
      
      expect(audio.stopAll).toHaveBeenCalled();
    });

    it('should stop haptics on reset', () => {
      orchestrator.play();
      orchestrator.reset();
      
      expect(haptics.stopAll).toHaveBeenCalled();
    });
  });

  describe('getAllStages', () => {
    it('should return all 9 stages', () => {
      const stages = orchestrator.getAllStages();
      expect(stages).toHaveLength(9);
    });

    it('should return stages in correct order', () => {
      const stages = orchestrator.getAllStages();
      
      expect(stages[0].stageName).toBe('Quantum Fluctuation');
      expect(stages[1].stageName).toBe('Cosmic Inflation');
      expect(stages[2].stageName).toBe('Dark Matter Web');
      expect(stages[3].stageName).toBe('Population III Stars');
      expect(stages[4].stageName).toBe('First Supernovae');
      expect(stages[5].stageName).toBe('Galaxy Formation');
      expect(stages[6].stageName).toBe('Molecular Cloud');
      expect(stages[7].stageName).toBe('Stellar Furnace');
      expect(stages[8].stageName).toBe('Planetary Accretion');
    });

    it('should return a copy of stages array', () => {
      const stages1 = orchestrator.getAllStages();
      const stages2 = orchestrator.getAllStages();
      
      expect(stages1).not.toBe(stages2);
      expect(stages1).toEqual(stages2);
    });
  });
});
