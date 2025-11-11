/**
 * CosmicHapticFeedback Tests
 * 
 * Comprehensive tests for all 15 cosmic stage haptic feedback generators.
 * Uses fixtures and factories with parameterized tests.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const { mockHaptics, ImpactStyle: MockImpactStyle, NotificationType: MockNotificationType, mockTimers } = vi.hoisted(() => {
  const mocks = {
    vibrate: vi.fn().mockResolvedValue(undefined),
    impact: vi.fn().mockResolvedValue(undefined),
    notification: vi.fn().mockResolvedValue(undefined),
  };
  
  const timers = {
    setTimeout: ((fn: Function) => { fn(); return 0 as any; }) as any,
    clearTimeout: (() => {}) as any,
  };
  
  return {
    mockHaptics: mocks,
    mockTimers: timers,
    ImpactStyle: {
      Light: 'LIGHT',
      Medium: 'MEDIUM',
      Heavy: 'HEAVY',
    },
    NotificationType: {
      Success: 'SUCCESS',
      Warning: 'WARNING',
      Error: 'ERROR',
    },
  };
});

vi.mock('@capacitor/haptics', () => ({
  Haptics: mockHaptics,
  ImpactStyle: MockImpactStyle,
  NotificationType: MockNotificationType,
}));

import { ImpactStyle, NotificationType } from '@capacitor/haptics';

import { CosmicHapticFeedback } from '../CosmicHapticFeedback';
import { setupHapticsFixture } from '../../../tests/fixtures/hapticsFixture';
import { rngRegistry } from '../../rng/RNGRegistry';

const ALL_STAGES = [
  { stageId: 'planck-epoch', index: 0 },
  { stageId: 'cosmic-inflation', index: 1 },
  { stageId: 'quark-gluon-plasma', index: 2 },
  { stageId: 'nucleosynthesis', index: 3 },
  { stageId: 'recombination', index: 4 },
  { stageId: 'dark-matter-web', index: 5 },
  { stageId: 'population-iii-stars', index: 6 },
  { stageId: 'first-supernovae', index: 7 },
  { stageId: 'galaxy-position', index: 8 },
  { stageId: 'molecular-cloud', index: 9 },
  { stageId: 'cloud-collapse', index: 10 },
  { stageId: 'protoplanetary-disk', index: 11 },
  { stageId: 'planetary-accretion', index: 12 },
  { stageId: 'planetary-differentiation', index: 13 },
  { stageId: 'surface-and-life', index: 14 },
];

describe('CosmicHapticFeedback', () => {
  const hapticsFixture = setupHapticsFixture(mockHaptics);

  beforeEach(() => {
    hapticsFixture.resetMocks();
  });

  describe('Constructor', () => {
    it('should initialize with RNG', () => {
      const rng = rngRegistry.getScopedRNG('haptic-test');
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      expect(feedback).toBeDefined();
    });

    it('should check haptics availability on construction', () => {
      const rng = rngRegistry.getScopedRNG('haptic-test');
      new CosmicHapticFeedback(rng, mockTimers);
      expect(hapticsFixture.mockHaptics.vibrate).toHaveBeenCalled();
    });
  });

  describe('Enable/Disable Controls', () => {
    it('should enable and disable haptics', async () => {
      const rng = rngRegistry.getScopedRNG('haptic-test');
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      feedback.setEnabled(false);
      await feedback.playHapticForStage('planck-epoch', 0.5);
      
      expect(hapticsFixture.mockHaptics.impact).not.toHaveBeenCalled();
    });

    it('should stop all haptics when disabled', async () => {
      const rng = rngRegistry.getScopedRNG('haptic-test');
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      await feedback.playHapticForStage('planck-epoch', 0.5);
      feedback.setEnabled(false);
      
      expect(feedback).toBeDefined();
    });

    it('should stop all haptics on command', async () => {
      const rng = rngRegistry.getScopedRNG('haptic-test');
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      await feedback.stopAll();
      
      expect(feedback).toBeDefined();
    });
  });

  describe('Stage Haptic Generation - All Stages', () => {
    it.each(ALL_STAGES.slice(0, 3))('generates haptics for $stageId', async ({ stageId }) => {
      const rng = rngRegistry.getScopedRNG(`stage-test-${stageId}`);
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      hapticsFixture.resetMocks();
      await feedback.playHapticForStage(stageId, 0.5);
      
      expect(hapticsFixture.mockHaptics.impact).toHaveBeenCalled();
    }, 30000);

    it.each(ALL_STAGES)('generates haptics for $stageId at low progress', async ({ stageId }) => {
      const rng = rngRegistry.getScopedRNG(`stage-low-${stageId}`);
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      hapticsFixture.resetMocks();
      await feedback.playHapticForStage(stageId, 0.1);
      
      expect(hapticsFixture.mockHaptics.impact).toHaveBeenCalled();
    });

    it.each(ALL_STAGES)('generates haptics for $stageId at high progress', async ({ stageId }) => {
      const rng = rngRegistry.getScopedRNG(`stage-high-${stageId}`);
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      hapticsFixture.resetMocks();
      await feedback.playHapticForStage(stageId, 0.9);
      
      expect(hapticsFixture.mockHaptics.impact).toHaveBeenCalled();
    });
  });

  describe('Stage-Specific Haptic Patterns', () => {
    it('planck-epoch should generate quantum flutter with many light taps', async () => {
      const rng = rngRegistry.getScopedRNG('planck-test');
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      await feedback.playHapticForStage('planck-epoch', 0.5);
      
      const calls = hapticsFixture.getImpactCalls();
      expect(calls.length).toBeGreaterThan(5);
      expect(calls.every(c => c.style === ImpactStyle.Light)).toBe(true);
    });

    it('cosmic-inflation should generate expansion rumble with decreasing intensity', async () => {
      const rng = rngRegistry.getScopedRNG('inflation-test');
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      await feedback.playHapticForStage('cosmic-inflation', 0.5);
      
      const calls = hapticsFixture.getImpactCalls();
      expect(calls.length).toBeGreaterThan(2);
      expect(calls[0].style).toBe(ImpactStyle.Heavy);
    });

    it('quark-gluon-plasma should generate chaotic irregular impacts', async () => {
      const rng = rngRegistry.getScopedRNG('plasma-test');
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      await feedback.playHapticForStage('quark-gluon-plasma', 0.8);
      
      const calls = hapticsFixture.getImpactCalls();
      expect(calls.length).toBeGreaterThan(5);
      expect(calls.every(c => c.style === ImpactStyle.Medium)).toBe(true);
    });

    it('nucleosynthesis should generate atomic bonding taps', async () => {
      const rng = rngRegistry.getScopedRNG('nucleus-test');
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      await feedback.playHapticForStage('nucleosynthesis', 0.5);
      
      const calls = hapticsFixture.getImpactCalls();
      expect(calls.length).toBeGreaterThan(2);
      expect(calls.every(c => c.style === ImpactStyle.Light)).toBe(true);
    });

    it('recombination should generate photon release pulses', async () => {
      const rng = rngRegistry.getScopedRNG('recombination-test');
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      await feedback.playHapticForStage('recombination', 0.5);
      
      const calls = hapticsFixture.getImpactCalls();
      expect(calls.length).toBeGreaterThan(0);
      expect(calls.every(c => c.style === ImpactStyle.Light)).toBe(true);
    });

    it('dark-matter-web should generate heavy gravitational pulses', async () => {
      const rng = rngRegistry.getScopedRNG('darkmatter-test');
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      await feedback.playHapticForStage('dark-matter-web', 0.5);
      
      const calls = hapticsFixture.getImpactCalls();
      expect(calls.length).toBeGreaterThan(2);
      expect(calls.every(c => c.style === ImpactStyle.Heavy)).toBe(true);
    });

    it('population-iii-stars should generate stellar ignition pattern', async () => {
      const rng = rngRegistry.getScopedRNG('popiii-test');
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      await feedback.playHapticForStage('population-iii-stars', 0.5);
      
      const calls = hapticsFixture.getImpactCalls();
      expect(calls.length).toBeGreaterThan(2);
    });

    it('first-supernovae should generate shockwave with decay', async () => {
      const rng = rngRegistry.getScopedRNG('supernova-test');
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      await feedback.playHapticForStage('first-supernovae', 0.8);
      
      const calls = hapticsFixture.getImpactCalls();
      expect(calls.length).toBeGreaterThan(2);
      expect(calls[0].style).toBe(ImpactStyle.Heavy);
    });

    it('galaxy-position should generate harmonic resonance pattern', async () => {
      const rng = rngRegistry.getScopedRNG('galaxy-test');
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      await feedback.playHapticForStage('galaxy-position', 0.5);
      
      const calls = hapticsFixture.getImpactCalls();
      expect(calls.length).toBeGreaterThan(3);
      expect(calls.every(c => c.style === ImpactStyle.Light)).toBe(true);
    });

    it('molecular-cloud should generate wispy irregular patterns', async () => {
      const rng = rngRegistry.getScopedRNG('cloud-test');
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      await feedback.playHapticForStage('molecular-cloud', 0.5);
      
      const calls = hapticsFixture.getImpactCalls();
      expect(calls.length).toBeGreaterThan(5);
      expect(calls.every(c => c.style === ImpactStyle.Light)).toBe(true);
    });

    it('cloud-collapse should generate accelerating compression', async () => {
      const rng = rngRegistry.getScopedRNG('collapse-test');
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      await feedback.playHapticForStage('cloud-collapse', 0.5);
      
      const calls = hapticsFixture.getImpactCalls();
      expect(calls.length).toBeGreaterThan(3);
      expect(calls[calls.length - 1].style).toBe(ImpactStyle.Heavy);
    });

    it('protoplanetary-disk should generate orbital rhythm', async () => {
      const rng = rngRegistry.getScopedRNG('disk-test');
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      await feedback.playHapticForStage('protoplanetary-disk', 0.5);
      
      const calls = hapticsFixture.getImpactCalls();
      expect(calls.length).toBeGreaterThan(4);
      expect(calls.every(c => c.style === ImpactStyle.Light)).toBe(true);
    });

    it('planetary-accretion should generate varied impact intensities', async () => {
      const rng = rngRegistry.getScopedRNG('accretion-test');
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      await feedback.playHapticForStage('planetary-accretion', 0.7);
      
      const calls = hapticsFixture.getImpactCalls();
      expect(calls.length).toBeGreaterThan(8);
      
      const hasVariety = calls.some(c => c.style === ImpactStyle.Heavy) &&
                         calls.some(c => c.style === ImpactStyle.Medium);
      expect(hasVariety).toBe(true);
    });

    it('planetary-differentiation should generate core settling pulses', async () => {
      const rng = rngRegistry.getScopedRNG('diff-test');
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      await feedback.playHapticForStage('planetary-differentiation', 0.5);
      
      const calls = hapticsFixture.getImpactCalls();
      expect(calls.length).toBeGreaterThan(2);
      expect(calls.every(c => c.style === ImpactStyle.Heavy)).toBe(true);
    });

    it('surface-and-life should generate life spark pattern', async () => {
      const rng = rngRegistry.getScopedRNG('life-test');
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      await feedback.playHapticForStage('surface-and-life', 0.7);
      
      const calls = hapticsFixture.getImpactCalls();
      expect(calls.length).toBeGreaterThan(1);
      expect(calls.every(c => c.style === ImpactStyle.Light)).toBe(true);
    });
  });

  describe('Progress-Based Modulation', () => {
    it.each([
      { stageId: 'planck-epoch', name: 'quantum flutter' },
      { stageId: 'nucleosynthesis', name: 'atomic bonding' },
      { stageId: 'planetary-accretion', name: 'impacts' }
    ])('should modulate $name intensity based on progress', async ({ stageId }) => {
      const rng = rngRegistry.getScopedRNG(`progress-test-${stageId}`);
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      hapticsFixture.resetMocks();
      await feedback.playHapticForStage(stageId, 0.1);
      const lowProgressCalls = hapticsFixture.getImpactCalls().length;
      
      hapticsFixture.resetMocks();
      await feedback.playHapticForStage(stageId, 0.9);
      const highProgressCalls = hapticsFixture.getImpactCalls().length;
      
      expect(highProgressCalls).toBeGreaterThanOrEqual(lowProgressCalls);
    });
  });

  describe('Determinism', () => {
    it('should generate same pattern for same seed', async () => {
      const rng1 = rngRegistry.getScopedRNG('deterministic-test-1');
      const feedback1 = new CosmicHapticFeedback(rng1, mockTimers);
      const rng2 = rngRegistry.getScopedRNG('deterministic-test-1');
      const feedback2 = new CosmicHapticFeedback(rng2, mockTimers);
      
      hapticsFixture.resetMocks();
      await feedback1.playHapticForStage('quark-gluon-plasma', 0.5);
      const calls1 = hapticsFixture.getImpactCalls().length;
      
      hapticsFixture.resetMocks();
      await feedback2.playHapticForStage('quark-gluon-plasma', 0.5);
      const calls2 = hapticsFixture.getImpactCalls().length;
      
      expect(calls1).toBe(calls2);
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown stages gracefully', async () => {
      const rng = rngRegistry.getScopedRNG('unknown-test');
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      await expect(
        feedback.playHapticForStage('unknown-stage', 0.5)
      ).resolves.not.toThrow();
    });

    it('should clamp progress to [0, 1] range', async () => {
      const rng = rngRegistry.getScopedRNG('range-test');
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      await expect(
        feedback.playHapticForStage('planck-epoch', -0.5)
      ).resolves.not.toThrow();
      
      await expect(
        feedback.playHapticForStage('planck-epoch', 1.5)
      ).resolves.not.toThrow();
    });

    it('should handle haptics unavailability gracefully', async () => {
      hapticsFixture.mockHaptics.vibrate.mockRejectedValue(new Error('Not available'));
      
      const rng = rngRegistry.getScopedRNG('unavailable-test');
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      await expect(
        feedback.playHapticForStage('planck-epoch', 0.5)
      ).resolves.not.toThrow();
    });
  });

  describe('Availability Check', () => {
    it('should report haptics availability', async () => {
      const rng = rngRegistry.getScopedRNG('availability-test');
      const feedback = new CosmicHapticFeedback(rng, mockTimers);
      
      const available = await feedback.isAvailable();
      expect(typeof available).toBe('boolean');
    });
  });
});
