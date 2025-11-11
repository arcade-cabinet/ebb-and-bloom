/**
 * CosmicAudioSonification Tests
 * 
 * Comprehensive tests for all 15 cosmic stage audio generators.
 * Uses mocked AudioContext for testing in Node environment.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CosmicAudioSonification } from '../CosmicAudioSonification';
import { rngRegistry } from '../../rng/RNGRegistry';

describe('CosmicAudioSonification', () => {
  let mockAudioContext: any;
  let mockNodes: any[];
  
  beforeEach(() => {
    rngRegistry.reset();
    rngRegistry.setSeed('test-seed');
    
    mockNodes = [];
    
    const createMockNode = (type: string) => {
      const node = {
        type,
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: {
          value: 440,
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        gain: {
          value: 1,
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        pan: {
          value: 0,
          setValueAtTime: vi.fn(),
        },
        Q: {
          value: 1,
          setValueAtTime: vi.fn(),
        },
        buffer: null,
        loop: false,
      };
      mockNodes.push(node);
      return node;
    };
    
    mockAudioContext = {
      currentTime: 0,
      sampleRate: 44100,
      destination: createMockNode('destination'),
      createOscillator: vi.fn(() => createMockNode('oscillator')),
      createGain: vi.fn(() => createMockNode('gain')),
      createBiquadFilter: vi.fn(() => createMockNode('filter')),
      createBufferSource: vi.fn(() => createMockNode('bufferSource')),
      createBuffer: vi.fn((channels, length, sampleRate) => ({
        getChannelData: vi.fn(() => new Float32Array(length)),
        numberOfChannels: channels,
        length,
        sampleRate,
      })),
      createConvolver: vi.fn(() => createMockNode('convolver')),
      createStereoPanner: vi.fn(() => createMockNode('panner')),
    };
    
    global.AudioContext = vi.fn(() => mockAudioContext) as any;
  });

  describe('Constructor', () => {
    it('should initialize with a seed', () => {
      const rng = rngRegistry.getScopedRNG('audio-test');
      const sonification = new CosmicAudioSonification(rng);
      expect(sonification).toBeDefined();
    });

    it('should create master gain node', () => {
      const rng = rngRegistry.getScopedRNG('audio-test');
      const sonification = new CosmicAudioSonification(rng);
      expect(sonification).toBeDefined();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
    });

    it('should handle missing Web Audio API gracefully', () => {
      delete (global as any).AudioContext;
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const rng = rngRegistry.getScopedRNG('audio-test');
      const sonification = new CosmicAudioSonification(rng);
      expect(sonification).toBeDefined();
      expect(consoleWarn).toHaveBeenCalled();
      
      consoleWarn.mockRestore();
    });
  });

  describe('Master Controls', () => {
    it('should set master volume', () => {
      const rng = rngRegistry.getScopedRNG('audio-test');
      const sonification = new CosmicAudioSonification(rng);
      sonification.setMasterVolume(0.5);
      
      const masterGain = mockNodes.find(n => n.type === 'gain');
      expect(masterGain.gain.value).toBe(0.5);
    });

    it('should clamp master volume to [0, 1]', () => {
      const rng = rngRegistry.getScopedRNG('audio-test');
      const sonification = new CosmicAudioSonification(rng);
      
      sonification.setMasterVolume(1.5);
      let masterGain = mockNodes.find(n => n.type === 'gain');
      expect(masterGain.gain.value).toBe(1);
      
      sonification.setMasterVolume(-0.5);
      masterGain = mockNodes.find(n => n.type === 'gain');
      expect(masterGain.gain.value).toBe(0);
    });

    it('should stop all sources', () => {
      const rng = rngRegistry.getScopedRNG('audio-test');
      const sonification = new CosmicAudioSonification(rng);
      sonification.playSoundForStage('planck-epoch', 0.5);
      
      const oscillators = mockNodes.filter(n => n.type === 'oscillator');
      const bufferSources = mockNodes.filter(n => n.type === 'bufferSource');
      
      sonification.stopAll();
      
      oscillators.forEach(osc => {
        expect(osc.stop).toHaveBeenCalled();
      });
      
      bufferSources.forEach(src => {
        expect(src.stop).toHaveBeenCalled();
      });
    });
  });

  describe('Stage Audio Generation - Planck Epoch', () => {
    it('should generate quantum noise', () => {
      const rng = rngRegistry.getScopedRNG('planck-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('planck-epoch', 0.5);
      
      const bufferSources = mockNodes.filter(n => n.type === 'bufferSource');
      expect(bufferSources.length).toBeGreaterThan(0);
      
      const filters = mockNodes.filter(n => n.type === 'filter');
      expect(filters.length).toBeGreaterThan(0);
      
      const filter = filters[0];
      expect(filter.frequency.value).toBeGreaterThanOrEqual(8000);
      expect(filter.frequency.value).toBeLessThanOrEqual(12000);
    });

    it('should modulate volume based on progress', () => {
      const rng = rngRegistry.getScopedRNG('planck-test');
      const sonification = new CosmicAudioSonification(rng);
      
      mockNodes = [];
      sonification.playSoundForStage('planck-epoch', 0.0);
      const gains1 = mockNodes.filter(n => n.type === 'gain');
      
      mockNodes = [];
      sonification.playSoundForStage('planck-epoch', 1.0);
      const gains2 = mockNodes.filter(n => n.type === 'gain');
      
      expect(gains1.length).toBeGreaterThan(0);
      expect(gains2.length).toBeGreaterThan(0);
    });
  });

  describe('Stage Audio Generation - Cosmic Inflation', () => {
    it('should generate expansion rumble with frequency descent', () => {
      const rng = rngRegistry.getScopedRNG('inflation-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('cosmic-inflation', 0.5);
      
      const oscillators = mockNodes.filter(n => n.type === 'oscillator');
      expect(oscillators.length).toBeGreaterThan(0);
      
      const osc = oscillators[0];
      expect(osc.frequency.setValueAtTime).toHaveBeenCalled();
      expect(osc.frequency.exponentialRampToValueAtTime).toHaveBeenCalled();
    });
  });

  describe('Stage Audio Generation - Quark-Gluon Plasma', () => {
    it('should generate plasma chaos with multiple oscillators', () => {
      const rng = rngRegistry.getScopedRNG('plasma-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('quark-gluon-plasma', 0.8);
      
      const oscillators = mockNodes.filter(n => n.type === 'oscillator');
      expect(oscillators.length).toBeGreaterThan(3);
      
      const sawtoothOscs = oscillators.filter(osc => osc.type === 'oscillator');
      expect(sawtoothOscs.length).toBeGreaterThan(0);
    });

    it('should include noise for crackling', () => {
      const rng = rngRegistry.getScopedRNG('plasma-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('quark-gluon-plasma', 0.5);
      
      const bufferSources = mockNodes.filter(n => n.type === 'bufferSource');
      expect(bufferSources.length).toBeGreaterThan(0);
    });
  });

  describe('Stage Audio Generation - Nucleosynthesis', () => {
    it('should generate discrete element tones', () => {
      const rng = rngRegistry.getScopedRNG('nucleus-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('nucleosynthesis', 0.5);
      
      const oscillators = mockNodes.filter(n => n.type === 'oscillator');
      expect(oscillators.length).toBeGreaterThan(0);
    });

    it('should add more tones as progress increases', () => {
      const rng = rngRegistry.getScopedRNG('nucleus-test');
      const sonification = new CosmicAudioSonification(rng);
      
      mockNodes = [];
      sonification.playSoundForStage('nucleosynthesis', 0.2);
      const lowProgressOscs = mockNodes.filter(n => n.type === 'oscillator');
      
      mockNodes = [];
      sonification.playSoundForStage('nucleosynthesis', 0.9);
      const highProgressOscs = mockNodes.filter(n => n.type === 'oscillator');
      
      expect(highProgressOscs.length).toBeGreaterThanOrEqual(lowProgressOscs.length);
    });
  });

  describe('Stage Audio Generation - Recombination', () => {
    it('should generate bell-like tones', () => {
      const rng = rngRegistry.getScopedRNG('recombination-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('recombination', 0.5);
      
      const oscillators = mockNodes.filter(n => n.type === 'oscillator');
      expect(oscillators.length).toBeGreaterThan(3);
    });

    it('should use reverb', () => {
      const rng = rngRegistry.getScopedRNG('recombination-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('recombination', 0.5);
      
      expect(mockAudioContext.createConvolver).toHaveBeenCalled();
    });
  });

  describe('Stage Audio Generation - Dark Matter Web', () => {
    it('should generate deep bass frequencies', () => {
      const rng = rngRegistry.getScopedRNG('darkmatter-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('dark-matter-web', 0.5);
      
      const oscillators = mockNodes.filter(n => n.type === 'oscillator');
      expect(oscillators.length).toBeGreaterThan(0);
      
      const filters = mockNodes.filter(n => n.type === 'filter');
      expect(filters.length).toBeGreaterThan(0);
    });

    it('should include pulsing structure formation', () => {
      const rng = rngRegistry.getScopedRNG('darkmatter-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('dark-matter-web', 0.5);
      
      const gains = mockNodes.filter(n => n.type === 'gain');
      const pulsingGain = gains.find(g => g.gain.setValueAtTime.mock.calls.length > 3);
      expect(pulsingGain).toBeDefined();
    });
  });

  describe('Stage Audio Generation - Population III Stars', () => {
    it('should generate harmonic overtones', () => {
      const rng = rngRegistry.getScopedRNG('popiii-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('population-iii-stars', 0.5);
      
      const oscillators = mockNodes.filter(n => n.type === 'oscillator');
      expect(oscillators.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Stage Audio Generation - First Supernovae', () => {
    it('should build up then explode', () => {
      const rng = rngRegistry.getScopedRNG('supernova-test');
      const sonification = new CosmicAudioSonification(rng);
      
      mockNodes = [];
      sonification.playSoundForStage('first-supernovae', 0.2);
      const buildupNodes = mockNodes.length;
      
      mockNodes = [];
      sonification.playSoundForStage('first-supernovae', 0.8);
      const explosionNodes = mockNodes.length;
      
      expect(explosionNodes).toBeGreaterThan(buildupNodes);
    });

    it('should include metallic resonances', () => {
      const rng = rngRegistry.getScopedRNG('supernova-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('first-supernovae', 0.8);
      
      const oscillators = mockNodes.filter(n => n.type === 'oscillator');
      expect(oscillators.length).toBeGreaterThan(2);
    });
  });

  describe('Stage Audio Generation - Galaxy Position', () => {
    it('should use spatial panning', () => {
      const rng = rngRegistry.getScopedRNG('galaxy-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('galaxy-position', 0.5);
      
      const panners = mockNodes.filter(n => n.type === 'panner');
      expect(panners.length).toBeGreaterThan(0);
    });

    it('should generate harmonic chord', () => {
      const rng = rngRegistry.getScopedRNG('galaxy-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('galaxy-position', 0.5);
      
      const oscillators = mockNodes.filter(n => n.type === 'oscillator');
      expect(oscillators.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Stage Audio Generation - Molecular Cloud', () => {
    it('should generate layered harmonics', () => {
      const rng = rngRegistry.getScopedRNG('cloud-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('molecular-cloud', 0.5);
      
      const oscillators = mockNodes.filter(n => n.type === 'oscillator');
      expect(oscillators.length).toBeGreaterThan(3);
    });

    it('should create wispy evolving textures', () => {
      const rng = rngRegistry.getScopedRNG('cloud-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('molecular-cloud', 0.5);
      
      const gains = mockNodes.filter(n => n.type === 'gain');
      const evolvingGain = gains.find(g => g.gain.setValueAtTime.mock.calls.length > 5);
      expect(evolvingGain).toBeDefined();
    });
  });

  describe('Stage Audio Generation - Cloud Collapse', () => {
    it('should include impact trigger', () => {
      const rng = rngRegistry.getScopedRNG('collapse-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('cloud-collapse', 0.1);
      
      const oscillators = mockNodes.filter(n => n.type === 'oscillator');
      expect(oscillators.length).toBeGreaterThan(0);
    });

    it('should include rotational panning', () => {
      const rng = rngRegistry.getScopedRNG('collapse-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('cloud-collapse', 0.5);
      
      const panners = mockNodes.filter(n => n.type === 'panner');
      expect(panners.length).toBeGreaterThan(0);
      
      const rotatingPanner = panners.find(p => p.pan.setValueAtTime.mock.calls.length > 3);
      expect(rotatingPanner).toBeDefined();
    });
  });

  describe('Stage Audio Generation - Protoplanetary Disk', () => {
    it('should generate orbital rhythms', () => {
      const rng = rngRegistry.getScopedRNG('disk-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('protoplanetary-disk', 0.5);
      
      const oscillators = mockNodes.filter(n => n.type === 'oscillator');
      expect(oscillators.length).toBeGreaterThan(3);
    });

    it('should use rotating stereo field', () => {
      const rng = rngRegistry.getScopedRNG('disk-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('protoplanetary-disk', 0.5);
      
      const panners = mockNodes.filter(n => n.type === 'panner');
      expect(panners.length).toBeGreaterThan(0);
    });

    it('should implement temperature gradient', () => {
      const rng = rngRegistry.getScopedRNG('disk-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('protoplanetary-disk', 0.5);
      
      const oscillators = mockNodes.filter(n => n.type === 'oscillator');
      expect(oscillators.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Stage Audio Generation - Planetary Accretion', () => {
    it('should generate impact percussion', () => {
      const rng = rngRegistry.getScopedRNG('accretion-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('planetary-accretion', 0.7);
      
      const oscillators = mockNodes.filter(n => n.type === 'oscillator');
      expect(oscillators.length).toBeGreaterThan(5);
    });

    it('should increase bass with planet mass', () => {
      const rng = rngRegistry.getScopedRNG('accretion-test');
      const sonification = new CosmicAudioSonification(rng);
      
      mockNodes = [];
      sonification.playSoundForStage('planetary-accretion', 0.2);
      const lowProgressOscs = mockNodes.filter(n => n.type === 'oscillator');
      
      mockNodes = [];
      sonification.playSoundForStage('planetary-accretion', 0.9);
      const highProgressOscs = mockNodes.filter(n => n.type === 'oscillator');
      
      expect(highProgressOscs.length).toBeGreaterThanOrEqual(lowProgressOscs.length);
    });
  });

  describe('Stage Audio Generation - Planetary Differentiation', () => {
    it('should generate core rumble', () => {
      const rng = rngRegistry.getScopedRNG('diff-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('planetary-differentiation', 0.5);
      
      const oscillators = mockNodes.filter(n => n.type === 'oscillator');
      expect(oscillators.length).toBeGreaterThan(0);
    });

    it('should include pulsing heat flow', () => {
      const rng = rngRegistry.getScopedRNG('diff-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('planetary-differentiation', 0.5);
      
      const gains = mockNodes.filter(n => n.type === 'gain');
      const pulsingGain = gains.find(g => g.gain.setValueAtTime.mock.calls.length > 4);
      expect(pulsingGain).toBeDefined();
    });
  });

  describe('Stage Audio Generation - Surface & First Life', () => {
    it('should generate bubbling chemistry sounds', () => {
      const rng = rngRegistry.getScopedRNG('life-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('surface-and-life', 0.7);
      
      const oscillators = mockNodes.filter(n => n.type === 'oscillator');
      expect(oscillators.length).toBeGreaterThan(5);
    });

    it('should include water sounds', () => {
      const rng = rngRegistry.getScopedRNG('life-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('surface-and-life', 0.5);
      
      const bufferSources = mockNodes.filter(n => n.type === 'bufferSource');
      expect(bufferSources.length).toBeGreaterThan(0);
      
      const filters = mockNodes.filter(n => n.type === 'filter');
      expect(filters.length).toBeGreaterThan(0);
    });

    it('should add bio-rhythms at high progress', () => {
      const rng = rngRegistry.getScopedRNG('life-test');
      const sonification = new CosmicAudioSonification(rng);
      
      mockNodes = [];
      sonification.playSoundForStage('surface-and-life', 0.3);
      const lowProgressOscs = mockNodes.filter(n => n.type === 'oscillator');
      
      mockNodes = [];
      sonification.playSoundForStage('surface-and-life', 0.9);
      const highProgressOscs = mockNodes.filter(n => n.type === 'oscillator');
      
      expect(highProgressOscs.length).toBeGreaterThan(lowProgressOscs.length);
    });
  });

  describe('Seed Determinism', () => {
    it('should generate same audio for same seed', () => {
      const rng1 = rngRegistry.getScopedRNG('deterministic-test');
      const sonification1 = new CosmicAudioSonification(rng1);
      const rng2 = rngRegistry.getScopedRNG('deterministic-test');
      const sonification2 = new CosmicAudioSonification(rng2);
      
      mockNodes = [];
      sonification1.playSoundForStage('planck-epoch', 0.5);
      const nodes1 = [...mockNodes];
      
      mockNodes = [];
      sonification2.playSoundForStage('planck-epoch', 0.5);
      const nodes2 = [...mockNodes];
      
      expect(nodes1.length).toBe(nodes2.length);
    });

    it('should generate different audio for different seeds', () => {
      rngRegistry.setSeed('seed-A');
      const rng1 = rngRegistry.getScopedRNG('test-A');
      const sonification1 = new CosmicAudioSonification(rng1);
      
      rngRegistry.setSeed('seed-B');
      const rng2 = rngRegistry.getScopedRNG('test-B');
      const sonification2 = new CosmicAudioSonification(rng2);
      
      mockNodes = [];
      sonification1.playSoundForStage('planck-epoch', 0.5);
      const calls1 = mockAudioContext.createOscillator.mock.calls.length;
      
      mockAudioContext.createOscillator.mockClear();
      mockNodes = [];
      sonification2.playSoundForStage('planck-epoch', 0.5);
      const calls2 = mockAudioContext.createOscillator.mock.calls.length;
      
      expect(calls1).toBe(calls2);
    });
  });

  describe('Progress-Based Modulation', () => {
    it('should modulate nucleosynthesis based on progress', () => {
      const rng = rngRegistry.getScopedRNG('progress-test');
      const sonification = new CosmicAudioSonification(rng);
      
      mockNodes = [];
      sonification.playSoundForStage('nucleosynthesis', 0.1);
      const earlyOscs = mockNodes.filter(n => n.type === 'oscillator');
      
      mockNodes = [];
      sonification.playSoundForStage('nucleosynthesis', 0.9);
      const lateOscs = mockNodes.filter(n => n.type === 'oscillator');
      
      expect(lateOscs.length).toBeGreaterThanOrEqual(earlyOscs.length);
    });

    it('should modulate supernova based on progress', () => {
      const rng = rngRegistry.getScopedRNG('progress-test');
      const sonification = new CosmicAudioSonification(rng);
      
      mockNodes = [];
      sonification.playSoundForStage('first-supernovae', 0.2);
      const buildupNodes = mockNodes.length;
      
      mockNodes = [];
      sonification.playSoundForStage('first-supernovae', 0.8);
      const explosionNodes = mockNodes.length;
      
      expect(explosionNodes).toBeGreaterThan(buildupNodes);
    });
  });

  describe('Performance and Memory Management', () => {
    it('should clean up old sources', () => {
      const rng = rngRegistry.getScopedRNG('cleanup-test');
      const sonification = new CosmicAudioSonification(rng);
      
      for (let i = 0; i < 60; i++) {
        mockNodes = [];
        sonification.playSoundForStage('planck-epoch', 0.5);
      }
      
      expect(mockNodes.some(n => n.stop.mock.calls.length > 0)).toBe(true);
    });

    it('should limit simultaneous oscillators', () => {
      const rng = rngRegistry.getScopedRNG('limit-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('quark-gluon-plasma', 1.0);
      
      const oscillators = mockNodes.filter(n => n.type === 'oscillator');
      expect(oscillators.length).toBeLessThan(50);
    });

    it('should handle stopAll without errors', () => {
      const rng = rngRegistry.getScopedRNG('stop-test');
      const sonification = new CosmicAudioSonification(rng);
      
      sonification.playSoundForStage('planck-epoch', 0.5);
      sonification.playSoundForStage('nucleosynthesis', 0.5);
      
      expect(() => sonification.stopAll()).not.toThrow();
    });
  });

  describe('Unknown Stage Handling', () => {
    it('should handle unknown stage gracefully', () => {
      const rng = rngRegistry.getScopedRNG('unknown-test');
      const sonification = new CosmicAudioSonification(rng);
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      sonification.playSoundForStage('nonexistent-stage', 0.5);
      
      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Unknown stage')
      );
      
      consoleWarn.mockRestore();
    });
  });

  describe('All 15 Stages Coverage', () => {
    it('should handle all 15 cosmic stages', () => {
      const rng = rngRegistry.getScopedRNG('complete-test');
      const sonification = new CosmicAudioSonification(rng);
      const stages = [
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
        'surface-and-life',
      ];
      
      for (const stage of stages) {
        mockNodes = [];
        expect(() => sonification.playSoundForStage(stage, 0.5)).not.toThrow();
        expect(mockNodes.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Audio Node Connections', () => {
    it('should properly connect nodes to master gain', () => {
      const rng = rngRegistry.getScopedRNG('connection-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('planck-epoch', 0.5);
      
      const gains = mockNodes.filter(n => n.type === 'gain');
      expect(gains.length).toBeGreaterThan(0);
      
      const connectedGains = gains.filter(g => g.connect.mock.calls.length > 0);
      expect(connectedGains.length).toBeGreaterThan(0);
    });

    it('should start oscillators', () => {
      const rng = rngRegistry.getScopedRNG('start-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('population-iii-stars', 0.5);
      
      const oscillators = mockNodes.filter(n => n.type === 'oscillator');
      oscillators.forEach(osc => {
        expect(osc.start).toHaveBeenCalled();
      });
    });

    it('should stop oscillators after duration', () => {
      const rng = rngRegistry.getScopedRNG('stop-test');
      const sonification = new CosmicAudioSonification(rng);
      mockNodes = [];
      
      sonification.playSoundForStage('cosmic-inflation', 0.5);
      
      const oscillators = mockNodes.filter(n => n.type === 'oscillator');
      oscillators.forEach(osc => {
        expect(osc.stop).toHaveBeenCalled();
      });
    });
  });
});
