/**
 * Tests for CosmicProvenanceTimeline
 * 
 * Verifies all 15 stages are properly defined and generate deterministic constants.
 * Refactored with factories, fixtures, and parameterization.
 */

import { describe, it, expect } from 'vitest';
import { CosmicProvenanceTimeline } from '../CosmicProvenanceTimeline';
import { createTestTimeline, createTestStageContext } from '../../../tests/factories/cosmicFactories';
import { rngRegistry } from '../../rng/RNGRegistry';

const YEAR = 31557600;

const ALL_STAGES = [
  { 
    id: 'planck-epoch', 
    name: 'Planck Epoch',
    timeStart: 0, 
    timeEnd: 1e-32,
    hasConstants: ['time_dilation_constant', 'entropy_baseline', 'vacuum_energy']
  },
  { 
    id: 'cosmic-inflation', 
    name: 'Cosmic Inflation',
    timeStart: 1e-32, 
    timeEnd: 1e-6,
    hasConstants: ['hubble_expansion_rate', 'cosmic_curvature', 'density_fluctuation_amplitude']
  },
  { 
    id: 'quark-gluon-plasma', 
    name: 'Quark-Gluon Plasma',
    timeStart: 1e-6, 
    timeEnd: 1,
    hasConstants: ['baryon_to_photon_ratio', 'matter_antimatter_ratio', 'qcd_coupling_constant']
  },
  { 
    id: 'nucleosynthesis', 
    name: 'Big Bang Nucleosynthesis',
    timeStart: 1, 
    timeEnd: 180,
    hasConstants: ['hydrogen_fraction', 'helium_fraction', 'lithium_fraction', 'deuterium_fraction']
  },
  { 
    id: 'recombination', 
    name: 'Recombination Era',
    timeStart: 380000 * YEAR, 
    timeEnd: 400000 * YEAR,
    hasConstants: ['cmb_temperature', 'sound_horizon', 'photon_mean_free_path']
  },
  { 
    id: 'dark-matter-web', 
    name: 'Dark Matter Web Formation',
    timeStart: 200e6 * YEAR, 
    timeEnd: 400e6 * YEAR,
    hasConstants: ['dark_matter_density', 'structure_formation_scale', 'cosmic_web_connectivity']
  },
  { 
    id: 'population-iii-stars', 
    name: 'Population III Stars',
    timeStart: 400e6 * YEAR, 
    timeEnd: 500e6 * YEAR,
    hasConstants: ['pop3_imf_slope', 'star_formation_efficiency', 'min_stellar_mass']
  },
  { 
    id: 'first-supernovae', 
    name: 'First Supernovae',
    timeStart: 500e6 * YEAR, 
    timeEnd: 600e6 * YEAR,
    hasConstants: ['supernova_energy', 'iron_peak_yield', 'alpha_element_ratio']
  },
  { 
    id: 'galaxy-position', 
    name: 'Galaxy Position Determination',
    timeStart: 1e9 * YEAR, 
    timeEnd: 1.5e9 * YEAR,
    hasConstants: ['distance_from_core', 'metallicity', 'orbital_velocity']
  },
  { 
    id: 'molecular-cloud', 
    name: 'Molecular Cloud Formation',
    timeStart: 4e9 * YEAR, 
    timeEnd: 4.5e9 * YEAR,
    hasConstants: ['molecular_cloud_mass', 'dust_fraction', 'carbon_oxygen_ratio']
  },
  { 
    id: 'cloud-collapse', 
    name: 'Cloud Collapse Trigger',
    timeStart: 4.567e9 * YEAR - 50000 * YEAR, 
    timeEnd: 4.567e9 * YEAR,
    hasConstants: ['specific_angular_momentum', 'rotation_period', 'free_fall_time']
  },
  { 
    id: 'protoplanetary-disk', 
    name: 'Protoplanetary Disk',
    timeStart: 4.567e9 * YEAR, 
    timeEnd: 4.567e9 * YEAR + 50000 * YEAR,
    hasConstants: ['disk_mass', 'frost_line_radius', 'temperature_at_1AU']
  },
  { 
    id: 'planetary-accretion', 
    name: 'Planetary Accretion',
    timeStart: 4.567e9 * YEAR + 50000 * YEAR, 
    timeEnd: 4.567e9 * YEAR + 100e6 * YEAR,
    hasConstants: ['terrestrial_planet_mass', 'semi_major_axis', 'eccentricity']
  },
  { 
    id: 'planetary-differentiation', 
    name: 'Planetary Differentiation',
    timeStart: 4.567e9 * YEAR + 100e6 * YEAR, 
    timeEnd: 4.567e9 * YEAR + 200e6 * YEAR,
    hasConstants: ['core_fraction', 'magnetic_field', 'heat_flow']
  },
  { 
    id: 'surface-and-life', 
    name: 'Surface Formation & First Life',
    timeStart: 4.567e9 * YEAR + 200e6 * YEAR, 
    timeEnd: 4.567e9 * YEAR + 800e6 * YEAR,
    hasConstants: ['ocean_mass_fraction', 'atmospheric_pressure', 'organic_carbon_concentration', 'ph_value']
  },
] as const;

describe('CosmicProvenanceTimeline', () => {
  describe('Constructor & Initialization', () => {
    it('should create timeline with all 15 stages', () => {
      const timeline = createTestTimeline();
      const stages = timeline.getStages();
      expect(stages).toHaveLength(15);
    });

    it('should accept custom RNG', () => {
      const customRng = rngRegistry.getScopedRNG('custom-timeline');
      const timeline = new CosmicProvenanceTimeline(customRng);
      expect(timeline.getStages()).toHaveLength(15);
    });

    it('should have all expected stage IDs', () => {
      const timeline = createTestTimeline();
      const stageIds = timeline.getStages().map(s => s.id);
      const expectedIds = ALL_STAGES.map(s => s.id);
      
      expect(stageIds).toEqual(expectedIds);
    });
  });

  describe('Stage Sequence', () => {
    it('should have stages in chronological order', () => {
      const timeline = createTestTimeline();
      const stages = timeline.getStages();
      
      for (let i = 1; i < stages.length; i++) {
        expect(stages[i].timeStart).toBeGreaterThanOrEqual(stages[i - 1].timeEnd);
      }
    });

    it.each(ALL_STAGES)(
      'stage $id should have correct time bounds',
      ({ id, timeStart, timeEnd }) => {
        const timeline = createTestTimeline();
        const stage = timeline.getStage(id);
        
        expect(stage.timeStart).toBe(timeStart);
        expect(stage.timeEnd).toBe(timeEnd);
      }
    );

    it.each(ALL_STAGES)(
      'stage $id should have correct name',
      ({ id, name }) => {
        const timeline = createTestTimeline();
        const stage = timeline.getStage(id);
        
        expect(stage.name).toBe(name);
      }
    );

    it.each(ALL_STAGES)(
      'stage $id should have causal trigger',
      ({ id }) => {
        const timeline = createTestTimeline();
        const stage = timeline.getStage(id);
        
        expect(stage.causalTrigger).toBeTruthy();
        expect(stage.causalTrigger.length).toBeGreaterThan(10);
      }
    );

    it.each(ALL_STAGES)(
      'stage $id should have seed influences',
      ({ id }) => {
        const timeline = createTestTimeline();
        const stage = timeline.getStage(id);
        
        expect(stage.seedInfluence.length).toBeGreaterThan(0);
      }
    );

    it.each(ALL_STAGES)(
      'stage $id should generate expected constants',
      ({ id, hasConstants }) => {
        const timeline = createTestTimeline();
        const constants = timeline.calculateConstantsForStage(id);
        
        hasConstants.forEach(constantName => {
          expect(constants).toHaveProperty(constantName);
        });
      }
    );
  });

  describe('Determinism', () => {
    it('should generate identical constants from same seed', () => {
      rngRegistry.reset();
      rngRegistry.setSeed('determinism-test');
      const timeline1 = createTestTimeline();
      
      rngRegistry.reset();
      rngRegistry.setSeed('determinism-test');
      const timeline2 = createTestTimeline();
      
      const constants1 = timeline1.getAllConstants();
      const constants2 = timeline2.getAllConstants();
      
      expect(constants1).toEqual(constants2);
    });

    it('should generate different constants from different seeds', () => {
      rngRegistry.reset();
      rngRegistry.setSeed('seed-alpha');
      const timeline1 = createTestTimeline();
      
      rngRegistry.reset();
      rngRegistry.setSeed('seed-beta');
      const timeline2 = createTestTimeline();
      
      const constants1 = timeline1.getAllConstants();
      const constants2 = timeline2.getAllConstants();
      
      expect(constants1).not.toEqual(constants2);
    });

    it('should produce deterministic stage sequence', () => {
      rngRegistry.reset();
      rngRegistry.setSeed('sequence-test');
      const timeline1 = createTestTimeline();
      
      rngRegistry.reset();
      rngRegistry.setSeed('sequence-test');
      const timeline2 = createTestTimeline();
      
      const stages1 = timeline1.getStages();
      const stages2 = timeline2.getStages();
      
      expect(stages1.length).toBe(stages2.length);
      stages1.forEach((stage1, i) => {
        expect(stage1.id).toBe(stages2[i].id);
        expect(stage1.timeStart).toBe(stages2[i].timeStart);
        expect(stage1.timeEnd).toBe(stages2[i].timeEnd);
      });
    });
  });

  describe('Conservation Laws', () => {
    it.each(ALL_STAGES)(
      'stage $id should track mass-energy conservation',
      ({ id }) => {
        const timeline = createTestTimeline();
        const stage = timeline.getStage(id);
        const conservation = timeline.getConservationStatus(stage);
        
        expect(conservation).toHaveProperty('mass');
        expect(conservation).toHaveProperty('energy');
        expect(conservation).toHaveProperty('entropy');
        
        expect(conservation.mass).toBeGreaterThan(0);
        expect(conservation.energy).toBeGreaterThan(0);
        expect(conservation.entropy).toBeGreaterThan(0);
      }
    );

    it('should show increasing entropy from early to late universe', () => {
      const timeline = createTestTimeline();
      const earlyStage = timeline.getStage('planck-epoch');
      const lateStage = timeline.getStage('surface-and-life');
      
      const earlyEntropy = timeline.getConservationStatus(earlyStage).entropy;
      const lateEntropy = timeline.getConservationStatus(lateStage).entropy;
      
      expect(lateEntropy).toBeGreaterThan(earlyEntropy);
    });

    it('should conserve total mass-energy across stages', () => {
      const timeline = createTestTimeline();
      const stages = timeline.getStages();
      
      const firstStage = timeline.getConservationStatus(stages[0]);
      const totalEnergy = firstStage.mass + firstStage.energy;
      
      stages.forEach(stage => {
        const conservation = timeline.getConservationStatus(stage);
        const stageEnergy = conservation.mass + conservation.energy;
        expect(stageEnergy).toBeCloseTo(totalEnergy, 0.1);
      });
    });
  });

  describe('Visual Characteristics', () => {
    it.each(ALL_STAGES)(
      'stage $id should define particle count',
      ({ id }) => {
        const timeline = createTestTimeline();
        const stage = timeline.getStage(id);
        
        expect(stage.visualCharacteristics.particleCount).toBeGreaterThan(0);
      }
    );

    it.each(ALL_STAGES)(
      'stage $id should have valid color palette',
      ({ id }) => {
        const timeline = createTestTimeline();
        const stage = timeline.getStage(id);
        
        expect(stage.visualCharacteristics.colorPalette.length).toBeGreaterThan(0);
        stage.visualCharacteristics.colorPalette.forEach(color => {
          expect(color).toMatch(/^#[0-9a-f]{6}$/i);
        });
      }
    );

    it.each(ALL_STAGES)(
      'stage $id should have valid scale range',
      ({ id }) => {
        const timeline = createTestTimeline();
        const stage = timeline.getStage(id);
        
        const [min, max] = stage.visualCharacteristics.scaleRange;
        expect(min).toBeLessThan(max);
        expect(min).toBeGreaterThan(0);
      }
    );

    it('should use appropriate colors for chaotic stages', () => {
      const timeline = createTestTimeline();
      
      const planck = timeline.getStage('planck-epoch');
      expect(planck.visualCharacteristics.colorPalette[0]).toMatch(/#[a-f0-9]{6}/i);
      
      const qgp = timeline.getStage('quark-gluon-plasma');
      expect(qgp.visualCharacteristics.colorPalette[0]).toMatch(/#ff/i);
    });

    it('should use dark colors for dark matter stages', () => {
      const timeline = createTestTimeline();
      const dmWeb = timeline.getStage('dark-matter-web');
      
      expect(dmWeb.visualCharacteristics.colorPalette[0]).toMatch(/#0000/i);
    });
  });

  describe('Audio Characteristics', () => {
    it.each(ALL_STAGES)(
      'stage $id should define audio properties',
      ({ id }) => {
        const timeline = createTestTimeline();
        const stage = timeline.getStage(id);
        
        const [minFreq, maxFreq] = stage.audioCharacteristics.frequencyRange;
        expect(minFreq).toBeLessThan(maxFreq);
        expect(minFreq).toBeGreaterThan(0);
        
        expect(['noise', 'sine', 'sawtooth', 'percussion']).toContain(
          stage.audioCharacteristics.waveform
        );
        expect(stage.audioCharacteristics.motif).toBeTruthy();
      }
    );

    it('should use noise waveform for chaotic stages', () => {
      const timeline = createTestTimeline();
      const planck = timeline.getStage('planck-epoch');
      expect(planck.audioCharacteristics.waveform).toBe('noise');
    });

    it('should use percussion for collision stages', () => {
      const timeline = createTestTimeline();
      const accretion = timeline.getStage('planetary-accretion');
      expect(accretion.audioCharacteristics.waveform).toBe('percussion');
    });

    it('should use sine for ordered stages', () => {
      const timeline = createTestTimeline();
      const recombination = timeline.getStage('recombination');
      expect(recombination.audioCharacteristics.waveform).toBe('sine');
    });
  });

  describe('Stage-Specific Physics', () => {
    describe('Planck Epoch', () => {
      it('should start at t=0', () => {
        const timeline = createTestTimeline();
        const stage = timeline.getStage('planck-epoch');
        expect(stage.timeStart).toBe(0);
      });

      it('should generate quantum constants', () => {
        const timeline = createTestTimeline();
        const constants = timeline.calculateConstantsForStage('planck-epoch');
        
        expect(constants.time_dilation_constant).toBeDefined();
        expect(constants.entropy_baseline).toBeDefined();
        expect(constants.vacuum_energy).toBeDefined();
      });
    });

    describe('Nucleosynthesis', () => {
      it('should generate primordial element fractions', () => {
        const timeline = createTestTimeline();
        const constants = timeline.calculateConstantsForStage('nucleosynthesis');
        
        const hFraction = constants.hydrogen_fraction;
        expect(hFraction).toBeGreaterThan(0.7);
        expect(hFraction).toBeLessThan(0.8);
        
        const heFraction = constants.helium_fraction;
        expect(heFraction).toBeGreaterThan(0.2);
        expect(heFraction).toBeLessThan(0.3);
      });

      it('should have element fractions sum close to 1', () => {
        const timeline = createTestTimeline();
        const constants = timeline.calculateConstantsForStage('nucleosynthesis');
        
        const total = constants.hydrogen_fraction + constants.helium_fraction;
        expect(total).toBeCloseTo(1.0, 0.1);
      });
    });

    describe('Recombination', () => {
      it('should occur at 380,000 years', () => {
        const timeline = createTestTimeline();
        const stage = timeline.getStage('recombination');
        expect(stage.timeStart).toBe(380000 * YEAR);
      });

      it('should generate CMB temperature', () => {
        const timeline = createTestTimeline();
        const constants = timeline.calculateConstantsForStage('recombination');
        
        const cmbTemp = constants.cmb_temperature;
        expect(cmbTemp).toBeGreaterThan(2.7);
        expect(cmbTemp).toBeLessThan(2.8);
      });
    });

    describe('First Supernovae', () => {
      it('should generate heavy element yields', () => {
        const timeline = createTestTimeline();
        const constants = timeline.calculateConstantsForStage('first-supernovae');
        
        expect(constants.supernova_energy).toBeGreaterThan(0);
        expect(constants.iron_peak_yield).toBeGreaterThan(0);
        expect(constants.alpha_element_ratio).toBeDefined();
      });
    });

    describe('Surface and First Life', () => {
      it('should be the final stage', () => {
        const timeline = createTestTimeline();
        const stages = timeline.getStages();
        const lastStage = stages[stages.length - 1];
        expect(lastStage.id).toBe('surface-and-life');
      });

      it('should generate prebiotic chemistry parameters', () => {
        const timeline = createTestTimeline();
        const constants = timeline.calculateConstantsForStage('surface-and-life');
        
        expect(constants.ocean_mass_fraction).toBeGreaterThan(0);
        expect(constants.atmospheric_pressure).toBeGreaterThan(0);
        expect(constants.organic_carbon_concentration).toBeGreaterThan(0);
        expect(constants.ph_value).toBeGreaterThan(0);
        expect(constants.ph_value).toBeLessThan(14);
      });
    });
  });

  describe('Utility Methods', () => {
    it('should get stage at specific time', () => {
      const timeline = createTestTimeline();
      const stage = timeline.getStageAtTime(100);
      expect(stage?.id).toBe('nucleosynthesis');
    });

    it('should return null for time before Big Bang', () => {
      const timeline = createTestTimeline();
      const stage = timeline.getStageAtTime(-1);
      expect(stage).toBeNull();
    });

    it('should calculate progress through stage', () => {
      const timeline = createTestTimeline();
      const stage = timeline.getStage('nucleosynthesis');
      const progress = timeline.getProgressThroughStage(stage, 90);
      
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(1);
    });

    it('should return 0 progress at stage start', () => {
      const timeline = createTestTimeline();
      const stage = timeline.getStage('nucleosynthesis');
      const progress = timeline.getProgressThroughStage(stage, stage.timeStart);
      
      expect(progress).toBe(0);
    });

    it('should return 1 progress at stage end', () => {
      const timeline = createTestTimeline();
      const stage = timeline.getStage('nucleosynthesis');
      const progress = timeline.getProgressThroughStage(stage, stage.timeEnd);
      
      expect(progress).toBe(1);
    });
  });

  describe('Time Scale Labels', () => {
    const timeScaleCases = [
      { id: 'planck-epoch', expectedPattern: /planck times/i },
      { id: 'cosmic-inflation', expectedPattern: /seconds?/i },
      { id: 'nucleosynthesis', expectedPattern: /minutes?/i },
      { id: 'recombination', expectedPattern: /years?/i },
      { id: 'galaxy-position', expectedPattern: /billion years?/i },
    ];

    it.each(timeScaleCases)(
      'stage $id should have appropriate time scale label',
      ({ id, expectedPattern }) => {
        const timeline = createTestTimeline();
        const stage = timeline.getStage(id);
        const label = timeline.getTimeScaleLabel(stage);
        
        expect(label).toMatch(expectedPattern);
      }
    );
  });

  describe('Edge Cases', () => {
    it('should handle extreme seed: all zeros', () => {
      rngRegistry.reset();
      rngRegistry.setSeed('0000000000000000');
      const timeline = createTestTimeline();
      
      expect(timeline.getStages()).toHaveLength(15);
      const constants = timeline.getAllConstants();
      expect(Object.keys(constants).length).toBeGreaterThan(0);
    });

    it('should handle extreme seed: maximum entropy', () => {
      rngRegistry.reset();
      rngRegistry.setSeed('zzzzzzzzzzzzzzz');
      const timeline = createTestTimeline();
      
      expect(timeline.getStages()).toHaveLength(15);
      const constants = timeline.getAllConstants();
      expect(Object.keys(constants).length).toBeGreaterThan(0);
    });

    it('should handle very long seed strings', () => {
      rngRegistry.reset();
      rngRegistry.setSeed('a'.repeat(1000));
      const timeline = createTestTimeline();
      
      expect(timeline.getStages()).toHaveLength(15);
    });

    it('should handle single character seed', () => {
      rngRegistry.reset();
      rngRegistry.setSeed('x');
      const timeline = createTestTimeline();
      
      expect(timeline.getStages()).toHaveLength(15);
    });

    it('should handle special character seeds', () => {
      rngRegistry.reset();
      rngRegistry.setSeed('!@#$%^&*()');
      const timeline = createTestTimeline();
      
      expect(timeline.getStages()).toHaveLength(15);
    });
  });

  describe('Integration Tests', () => {
    it('should provide complete cosmic history from Big Bang to Life', () => {
      const timeline = createTestTimeline();
      const stages = timeline.getStages();
      
      expect(stages[0].id).toBe('planck-epoch');
      expect(stages[0].timeStart).toBe(0);
      
      expect(stages[stages.length - 1].id).toBe('surface-and-life');
      expect(stages[stages.length - 1].timeEnd).toBeGreaterThan(4.5e9 * YEAR);
    });

    it('should generate all constants for complete simulation', () => {
      const timeline = createTestTimeline();
      const allConstants = timeline.getAllConstants();
      
      expect(Object.keys(allConstants).length).toBeGreaterThan(50);
      
      Object.values(allConstants).forEach(value => {
        expect(typeof value).toBe('number');
        expect(Number.isNaN(value)).toBe(false);
        expect(Number.isFinite(value)).toBe(true);
      });
    });

    it('should support factory createTestStageContext', () => {
      const context = createTestStageContext(3);
      
      expect(context.timeline).toBeInstanceOf(CosmicProvenanceTimeline);
      expect(context.stage).toBeDefined();
      expect(context.index).toBe(3);
      expect(context.stage.id).toBe('nucleosynthesis');
    });
  });
});
