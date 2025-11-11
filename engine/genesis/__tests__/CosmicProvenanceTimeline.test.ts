/**
 * Tests for CosmicProvenanceTimeline
 * Verifies all 15 stages are properly defined and generate deterministic constants
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CosmicProvenanceTimeline } from '../CosmicProvenanceTimeline';
import { rngRegistry } from '../../rng/RNGRegistry';

describe('CosmicProvenanceTimeline', () => {
  let timeline: CosmicProvenanceTimeline;

  beforeEach(() => {
    rngRegistry.reset();
    rngRegistry.setSeed('test-cosmic-seed');
    const rng = rngRegistry.getScopedRNG('timeline-test');
    timeline = new CosmicProvenanceTimeline(rng);
  });

  it('should create timeline with all 15 stages', () => {
    const stages = timeline.getStages();
    expect(stages).toHaveLength(15);
  });

  it('should have stages in chronological order', () => {
    const stages = timeline.getStages();
    for (let i = 1; i < stages.length; i++) {
      expect(stages[i].timeStart).toBeGreaterThanOrEqual(stages[i - 1].timeEnd);
    }
  });

  it('should generate deterministic constants from seed', () => {
    rngRegistry.reset();
    rngRegistry.setSeed('test-seed-deterministic');
    const rng1 = rngRegistry.getScopedRNG('timeline-1');
    const timeline1 = new CosmicProvenanceTimeline(rng1);
    
    rngRegistry.reset();
    rngRegistry.setSeed('test-seed-deterministic');
    const rng2 = rngRegistry.getScopedRNG('timeline-1');
    const timeline2 = new CosmicProvenanceTimeline(rng2);
    
    const constants1 = timeline1.getAllConstants();
    const constants2 = timeline2.getAllConstants();
    
    expect(constants1).toEqual(constants2);
  });

  it('should generate different constants for different seeds', () => {
    rngRegistry.reset();
    rngRegistry.setSeed('seed-1');
    const rng1 = rngRegistry.getScopedRNG('timeline-diff-1');
    const timeline1 = new CosmicProvenanceTimeline(rng1);
    
    rngRegistry.reset();
    rngRegistry.setSeed('seed-2');
    const rng2 = rngRegistry.getScopedRNG('timeline-diff-2');
    const timeline2 = new CosmicProvenanceTimeline(rng2);
    
    const constants1 = timeline1.getAllConstants();
    const constants2 = timeline2.getAllConstants();
    
    expect(constants1).not.toEqual(constants2);
  });

  describe('Stage: Planck Epoch', () => {
    it('should have correct time range', () => {
      const stage = timeline.getStage('planck-epoch');
      expect(stage.timeStart).toBe(0);
      expect(stage.timeEnd).toBe(1e-32);
    });

    it('should generate quantum constants', () => {
      const constants = timeline.calculateConstantsForStage('planck-epoch');
      expect(constants).toHaveProperty('time_dilation_constant');
      expect(constants).toHaveProperty('entropy_baseline');
      expect(constants).toHaveProperty('vacuum_energy');
    });
  });

  describe('Stage: Cosmic Inflation', () => {
    it('should have correct causal trigger', () => {
      const stage = timeline.getStage('cosmic-inflation');
      expect(stage.causalTrigger).toBe('Symmetry breaking of unified force');
    });

    it('should generate expansion constants', () => {
      const constants = timeline.calculateConstantsForStage('cosmic-inflation');
      expect(constants).toHaveProperty('hubble_expansion_rate');
      expect(constants).toHaveProperty('cosmic_curvature');
      expect(constants).toHaveProperty('density_fluctuation_amplitude');
    });
  });

  describe('Stage: Nucleosynthesis', () => {
    it('should generate primordial element fractions', () => {
      const constants = timeline.calculateConstantsForStage('nucleosynthesis');
      expect(constants).toHaveProperty('hydrogen_fraction');
      expect(constants).toHaveProperty('helium_fraction');
      expect(constants).toHaveProperty('lithium_fraction');
      
      const hFraction = constants.hydrogen_fraction;
      expect(hFraction).toBeGreaterThan(0.7);
      expect(hFraction).toBeLessThan(0.8);
    });
  });

  describe('Stage: Recombination', () => {
    it('should occur at 380,000 years', () => {
      const stage = timeline.getStage('recombination');
      const YEAR = 31557600;
      expect(stage.timeStart).toBe(380000 * YEAR);
    });

    it('should generate CMB temperature', () => {
      const constants = timeline.calculateConstantsForStage('recombination');
      expect(constants).toHaveProperty('cmb_temperature');
      
      const cmbTemp = constants.cmb_temperature;
      expect(cmbTemp).toBeGreaterThan(2.7);
      expect(cmbTemp).toBeLessThan(2.8);
    });
  });

  describe('Stage: First Supernovae', () => {
    it('should generate heavy element yields', () => {
      const constants = timeline.calculateConstantsForStage('first-supernovae');
      expect(constants).toHaveProperty('supernova_energy');
      expect(constants).toHaveProperty('iron_peak_yield');
      expect(constants).toHaveProperty('alpha_element_ratio');
    });
  });

  describe('Stage: Galaxy Position', () => {
    it('should generate metallicity gradient', () => {
      const constants = timeline.calculateConstantsForStage('galaxy-position');
      expect(constants).toHaveProperty('distance_from_core');
      expect(constants).toHaveProperty('metallicity');
      expect(constants).toHaveProperty('orbital_velocity');
    });
  });

  describe('Stage: Protoplanetary Disk', () => {
    it('should generate frost line position', () => {
      const constants = timeline.calculateConstantsForStage('protoplanetary-disk');
      expect(constants).toHaveProperty('frost_line_radius');
      expect(constants).toHaveProperty('temperature_at_1AU');
      expect(constants).toHaveProperty('disk_mass');
    });
  });

  describe('Stage: Surface and First Life', () => {
    it('should be the final stage', () => {
      const stages = timeline.getStages();
      const lastStage = stages[stages.length - 1];
      expect(lastStage.id).toBe('surface-and-life');
    });

    it('should generate prebiotic chemistry parameters', () => {
      const constants = timeline.calculateConstantsForStage('surface-and-life');
      expect(constants).toHaveProperty('ocean_mass_fraction');
      expect(constants).toHaveProperty('atmospheric_pressure');
      expect(constants).toHaveProperty('organic_carbon_concentration');
      expect(constants).toHaveProperty('ph_value');
    });
  });

  describe('Time Scale Labels', () => {
    it('should format Planck epoch correctly', () => {
      const stage = timeline.getStage('planck-epoch');
      const label = timeline.getTimeScaleLabel(stage);
      expect(label).toContain('Planck times');
    });

    it('should format nucleosynthesis correctly', () => {
      const stage = timeline.getStage('nucleosynthesis');
      const label = timeline.getTimeScaleLabel(stage);
      expect(label).toContain('minutes');
    });

    it('should format recombination correctly', () => {
      const stage = timeline.getStage('recombination');
      const label = timeline.getTimeScaleLabel(stage);
      expect(label).toContain('thousand years');
    });

    it('should format galaxy formation correctly', () => {
      const stage = timeline.getStage('galaxy-position');
      const label = timeline.getTimeScaleLabel(stage);
      expect(label).toContain('billion years');
    });
  });

  describe('Conservation Tracking', () => {
    it('should track mass-energy conservation', () => {
      const stage = timeline.getStage('planck-epoch');
      const conservation = timeline.getConservationStatus(stage);
      
      expect(conservation).toHaveProperty('mass');
      expect(conservation).toHaveProperty('energy');
      expect(conservation).toHaveProperty('entropy');
      
      expect(conservation.mass).toBeGreaterThan(0);
      expect(conservation.energy).toBeGreaterThan(0);
      expect(conservation.entropy).toBeGreaterThan(0);
    });

    it('should show increasing entropy over time', () => {
      const earlyStage = timeline.getStage('planck-epoch');
      const lateStage = timeline.getStage('surface-and-life');
      
      const earlyConservation = timeline.getConservationStatus(earlyStage);
      const lateConservation = timeline.getConservationStatus(lateStage);
      
      expect(lateConservation.entropy).toBeGreaterThan(earlyConservation.entropy);
    });
  });

  describe('Visual Characteristics', () => {
    it('should define particle counts for each stage', () => {
      const stages = timeline.getStages();
      stages.forEach(stage => {
        expect(stage.visualCharacteristics.particleCount).toBeGreaterThan(0);
        expect(stage.visualCharacteristics.colorPalette.length).toBeGreaterThan(0);
        expect(stage.visualCharacteristics.scaleRange[0]).toBeLessThan(
          stage.visualCharacteristics.scaleRange[1]
        );
      });
    });

    it('should have appropriate color palettes', () => {
      const qgp = timeline.getStage('quark-gluon-plasma');
      expect(qgp.visualCharacteristics.colorPalette[0]).toMatch(/#ff/i);
      
      const dmWeb = timeline.getStage('dark-matter-web');
      expect(dmWeb.visualCharacteristics.colorPalette[0]).toMatch(/#0000/i);
    });
  });

  describe('Audio Characteristics', () => {
    it('should define audio properties for each stage', () => {
      const stages = timeline.getStages();
      stages.forEach(stage => {
        expect(stage.audioCharacteristics.frequencyRange[0]).toBeLessThan(
          stage.audioCharacteristics.frequencyRange[1]
        );
        expect(['noise', 'sine', 'sawtooth', 'percussion']).toContain(
          stage.audioCharacteristics.waveform
        );
        expect(stage.audioCharacteristics.motif).toBeTruthy();
      });
    });

    it('should use noise waveform for chaotic stages', () => {
      const planck = timeline.getStage('planck-epoch');
      expect(planck.audioCharacteristics.waveform).toBe('noise');
    });

    it('should use percussion for collision stages', () => {
      const accretion = timeline.getStage('planetary-accretion');
      expect(accretion.audioCharacteristics.waveform).toBe('percussion');
    });
  });

  describe('Utility Methods', () => {
    it('should get stage at specific time', () => {
      const stage = timeline.getStageAtTime(100);
      expect(stage?.id).toBe('nucleosynthesis');
    });

    it('should return null for time before Big Bang', () => {
      const stage = timeline.getStageAtTime(-1);
      expect(stage).toBeNull();
    });

    it('should calculate progress through stage', () => {
      const stage = timeline.getStage('nucleosynthesis');
      const progress = timeline.getProgressThroughStage(stage, 90);
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(1);
    });

  });

  describe('All Stage IDs', () => {
    const expectedStageIds = [
      'planck-epoch',
      'cosmic-inflation',
      'quark-gluon-plasma',
      'nucleosynthesis',
      'recombination',
      'dark-matter-web',
      'population-iii-stars',
      'first-supernovae',
      'galaxy-position',
      'molecular-cloud',
      'cloud-collapse',
      'protoplanetary-disk',
      'planetary-accretion',
      'planetary-differentiation',
      'surface-and-life'
    ];

    it('should have all 15 expected stages', () => {
      const stages = timeline.getStages();
      const stageIds = stages.map(s => s.id);
      
      expectedStageIds.forEach(expectedId => {
        expect(stageIds).toContain(expectedId);
      });
    });
  });

  describe('Causal Chain', () => {
    it('should have causal triggers for all stages', () => {
      const stages = timeline.getStages();
      stages.forEach(stage => {
        expect(stage.causalTrigger).toBeTruthy();
        expect(stage.causalTrigger.length).toBeGreaterThan(10);
      });
    });

    it('should have seed influences for all stages', () => {
      const stages = timeline.getStages();
      stages.forEach(stage => {
        expect(stage.seedInfluence.length).toBeGreaterThan(0);
      });
    });

    it('should generate constants for all stages', () => {
      const stages = timeline.getStages();
      stages.forEach(stage => {
        expect(stage.constantsGenerated.length).toBeGreaterThan(0);
      });
    });
  });
});
