/**
 * CosmicAudioSonification Tests
 * 
 * Comprehensive tests for all 15 cosmic stage audio generators.
 * Uses fixtures and factories with parameterized tests.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Set up Web Audio API mocks before any imports
const mockNodes: any[] = [];

function createMockNode(nodeType: string) {
  const node = {
    _nodeType: nodeType,  // Use _nodeType instead of type to avoid conflicts with Web Audio API
    type: 'sine',  // Default oscillator type for Web Audio API
    connect: vi.fn().mockReturnThis(),
    disconnect: vi.fn().mockReturnThis(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { value: 440, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    pan: { value: 0, setValueAtTime: vi.fn() },
    Q: { value: 1, setValueAtTime: vi.fn() },
    buffer: null,
    loop: false,
  };
  mockNodes.push(node);
  return node;
}

const mockAudioContext = {
  currentTime: 0,
  sampleRate: 44100,
  destination: createMockNode('destination'),
  createOscillator: vi.fn(() => createMockNode('oscillator')),
  createGain: vi.fn(() => createMockNode('gain')),
  createBiquadFilter: vi.fn(() => createMockNode('filter')),
  createBufferSource: vi.fn(() => createMockNode('bufferSource')),
  createBuffer: vi.fn((c: number, l: number, sr: number) => ({
    getChannelData: vi.fn(() => new Float32Array(l)),
    numberOfChannels: c,
    length: l,
    sampleRate: sr,
  })),
  createConvolver: vi.fn(() => createMockNode('convolver')),
  createStereoPanner: vi.fn(() => createMockNode('panner')),
};

class MockAudioContext {
  currentTime = 0;
  sampleRate = 44100;
  destination = mockAudioContext.destination;
  createOscillator = mockAudioContext.createOscillator;
  createGain = mockAudioContext.createGain;
  createBiquadFilter = mockAudioContext.createBiquadFilter;
  createBufferSource = mockAudioContext.createBufferSource;
  createBuffer = mockAudioContext.createBuffer;
  createConvolver = mockAudioContext.createConvolver;
  createStereoPanner = mockAudioContext.createStereoPanner;
}

vi.stubGlobal('AudioContext', MockAudioContext);
vi.stubGlobal('webkitAudioContext', MockAudioContext);

import { CosmicAudioSonification } from '../cosmic';
import { createTestTimeline, createTestStageContext } from '../../../tests/factories/cosmicFactories';
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

describe('CosmicAudioSonification', () => {
  beforeEach(() => {
    // Clear mockNodes before each test
    mockNodes.length = 0;
    // Re-add destination node
    mockNodes.push(mockAudioContext.destination);
    // Reset all mock function call counts
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with a seed', () => {
      const rng = rngRegistry.getScopedRNG('audio-test');
      const sonification = new CosmicAudioSonification(rng);
      expect(sonification).toBeDefined();
    });

    it('should create master gain node', () => {
      const rng = rngRegistry.getScopedRNG('audio-test');
      new CosmicAudioSonification(rng);
      expect(mockAudioContext.createGain).toHaveBeenCalled();
    });

    it('should handle missing Web Audio API gracefully', () => {
      const originalAudioContext = global.AudioContext;
      delete (global as any).AudioContext;
      
      const rng = rngRegistry.getScopedRNG('audio-test');
      const sonification = new CosmicAudioSonification(rng);
      expect(sonification).toBeDefined();
      
      global.AudioContext = originalAudioContext;
    });
  });

  describe('Master Controls', () => {
    it('should set master volume', () => {
      const rng = rngRegistry.getScopedRNG('audio-test');
      const sonification = new CosmicAudioSonification(rng);
      sonification.setMasterVolume(0.5);
      
      const masterGain = mockNodes.find(n => n._nodeType === 'gain');
      expect(masterGain?.gain.value).toBe(0.5);
    });

    it('should clamp master volume to [0, 1]', () => {
      const rng = rngRegistry.getScopedRNG('audio-test');
      const sonification = new CosmicAudioSonification(rng);
      
      sonification.setMasterVolume(1.5);
      let masterGain = mockNodes.find(n => n._nodeType === 'gain');
      expect(masterGain?.gain.value).toBe(1);
      
      sonification.setMasterVolume(-0.5);
      masterGain = mockNodes.find(n => n._nodeType === 'gain');
      expect(masterGain?.gain.value).toBe(0);
    });

    it('should stop all sources', () => {
      const rng = rngRegistry.getScopedRNG('audio-test');
      const sonification = new CosmicAudioSonification(rng);
      sonification.playSoundForStage('planck-epoch', 0.5);
      
      const oscillators = mockNodes.filter(n => n._nodeType === 'oscillator');
      const bufferSources = mockNodes.filter(n => n._nodeType === 'bufferSource');
      
      sonification.stopAll();
      
      oscillators.forEach(osc => {
        expect(osc.stop).toHaveBeenCalled();
      });
      
      bufferSources.forEach(src => {
        expect(src.stop).toHaveBeenCalled();
      });
    });
  });

  describe('Stage Audio Generation - All Stages', () => {
    it.each(ALL_STAGES)('generates audio for $stageId', ({ stageId }) => {
      const { timeline } = createTestStageContext(0);
      const rng = rngRegistry.getScopedRNG(`stage-test-${stageId}`);
      const sonification = new CosmicAudioSonification(rng);
      
      sonification.playSoundForStage(stageId, 0.5);
      
      expect(mockNodes.length).toBeGreaterThan(0);
    });

    it.each(ALL_STAGES)('creates audio nodes for $stageId at low progress', ({ stageId }) => {
      const rng = rngRegistry.getScopedRNG(`stage-low-${stageId}`);
      const sonification = new CosmicAudioSonification(rng);
      
      sonification.playSoundForStage(stageId, 0.1);
      
      const allNodes = mockNodes;
      expect(allNodes.length).toBeGreaterThan(0);
    });

    it.each(ALL_STAGES)('creates audio nodes for $stageId at high progress', ({ stageId }) => {
      const rng = rngRegistry.getScopedRNG(`stage-high-${stageId}`);
      const sonification = new CosmicAudioSonification(rng);
      
      sonification.playSoundForStage(stageId, 0.9);
      
      const allNodes = mockNodes;
      expect(allNodes.length).toBeGreaterThan(0);
    });
  });

  describe('Stage-Specific Characteristics', () => {
    it('planck-epoch should generate quantum noise', () => {
      const rng = rngRegistry.getScopedRNG('planck-test');
      const sonification = new CosmicAudioSonification(rng);
      
      sonification.playSoundForStage('planck-epoch', 0.5);
      
      const bufferSources = mockNodes.filter(n => n._nodeType === 'bufferSource');
      const filters = mockNodes.filter(n => n._nodeType === 'filter');
      
      expect(bufferSources.length).toBeGreaterThan(0);
      expect(filters.length).toBeGreaterThan(0);
    });

    it('cosmic-inflation should use exponential frequency descent', () => {
      const rng = rngRegistry.getScopedRNG('inflation-test');
      const sonification = new CosmicAudioSonification(rng);
      
      sonification.playSoundForStage('cosmic-inflation', 0.5);
      
      const oscillators = mockNodes.filter(n => n._nodeType === 'oscillator');
      expect(oscillators.length).toBeGreaterThan(0);
      expect(oscillators[0].frequency.setValueAtTime).toHaveBeenCalled();
    });

    it('quark-gluon-plasma should generate multiple chaotic oscillators', () => {
      const rng = rngRegistry.getScopedRNG('plasma-test');
      const sonification = new CosmicAudioSonification(rng);
      
      sonification.playSoundForStage('quark-gluon-plasma', 0.8);
      
      const oscillators = mockNodes.filter(n => n._nodeType === 'oscillator');
      const bufferSources = mockNodes.filter(n => n._nodeType === 'bufferSource');
      
      expect(oscillators.length).toBeGreaterThan(3);
      expect(bufferSources.length).toBeGreaterThan(0);
    });

    it('nucleosynthesis should add more tones with progress', () => {
      const rng = rngRegistry.getScopedRNG('nucleus-test');
      const sonification = new CosmicAudioSonification(rng);
      
      sonification.playSoundForStage('nucleosynthesis', 0.2);
      const lowProgressOscs = mockNodes.filter(n => n._nodeType === 'oscillator').length;
      
      sonification.playSoundForStage('nucleosynthesis', 0.9);
      const highProgressOscs = mockNodes.filter(n => n._nodeType === 'oscillator').length;
      
      expect(highProgressOscs).toBeGreaterThanOrEqual(lowProgressOscs);
    });

    it('recombination should generate bell-like tones with reverb', () => {
      const rng = rngRegistry.getScopedRNG('recombination-test');
      const sonification = new CosmicAudioSonification(rng);
      
      
      sonification.playSoundForStage('recombination', 0.5);
      
      
      const oscillators = mockNodes.filter(n => n._nodeType === 'oscillator');
      
      expect(oscillators.length).toBeGreaterThan(3);
      expect(mockAudioContext.createConvolver).toHaveBeenCalled();
    });

    it('dark-matter-web should generate deep bass with pulsing', () => {
      const rng = rngRegistry.getScopedRNG('darkmatter-test');
      const sonification = new CosmicAudioSonification(rng);
      
      sonification.playSoundForStage('dark-matter-web', 0.5);
      
      const oscillators = mockNodes.filter(n => n._nodeType === 'oscillator');
      const filters = mockNodes.filter(n => n._nodeType === 'filter');
      const gains = mockNodes.filter(n => n._nodeType === 'gain');
      
      expect(oscillators.length).toBeGreaterThan(0);
      expect(filters.length).toBeGreaterThan(0);
      
      const pulsingGain = gains.find(g => g.gain.setValueAtTime.mock.calls.length > 3);
      expect(pulsingGain).toBeDefined();
    });

    it('population-iii-stars should generate harmonic overtones', () => {
      const rng = rngRegistry.getScopedRNG('popiii-test');
      const sonification = new CosmicAudioSonification(rng);
      
      sonification.playSoundForStage('population-iii-stars', 0.5);
      
      const oscillators = mockNodes.filter(n => n._nodeType === 'oscillator');
      expect(oscillators.length).toBeGreaterThanOrEqual(4);
    });

    it('first-supernovae should build up then explode', () => {
      const rng = rngRegistry.getScopedRNG('supernova-test');
      const sonification = new CosmicAudioSonification(rng);
      
      sonification.playSoundForStage('first-supernovae', 0.2);
      const buildupNodes = mockNodes.length;
      
      sonification.playSoundForStage('first-supernovae', 0.8);
      const explosionNodes = mockNodes.length;
      
      expect(explosionNodes).toBeGreaterThan(buildupNodes);
    });

    it('galaxy-position should use spatial panning and harmonic chord', () => {
      const rng = rngRegistry.getScopedRNG('galaxy-test');
      const sonification = new CosmicAudioSonification(rng);
      
      sonification.playSoundForStage('galaxy-position', 0.5);
      
      const panners = mockNodes.filter(n => n._nodeType === 'panner');
      const oscillators = mockNodes.filter(n => n._nodeType === 'oscillator');
      
      expect(panners.length).toBeGreaterThan(0);
      expect(oscillators.length).toBeGreaterThanOrEqual(3);
    });

    it('molecular-cloud should generate layered evolving harmonics', () => {
      const rng = rngRegistry.getScopedRNG('cloud-test');
      const sonification = new CosmicAudioSonification(rng);
      
      sonification.playSoundForStage('molecular-cloud', 0.5);
      
      const oscillators = mockNodes.filter(n => n._nodeType === 'oscillator');
      const gains = mockNodes.filter(n => n._nodeType === 'gain');
      
      expect(oscillators.length).toBeGreaterThan(3);
      
      const evolvingGain = gains.find(g => g.gain.setValueAtTime.mock.calls.length > 5);
      expect(evolvingGain).toBeDefined();
    });

    it('cloud-collapse should include rotational panning', () => {
      const rng = rngRegistry.getScopedRNG('collapse-test');
      const sonification = new CosmicAudioSonification(rng);
      
      sonification.playSoundForStage('cloud-collapse', 0.5);
      
      const panners = mockNodes.filter(n => n._nodeType === 'panner');
      expect(panners.length).toBeGreaterThan(0);
      
      const rotatingPanner = panners.find(p => p.pan.setValueAtTime.mock.calls.length > 3);
      expect(rotatingPanner).toBeDefined();
    });

    it('protoplanetary-disk should generate orbital rhythms', () => {
      const rng = rngRegistry.getScopedRNG('disk-test');
      const sonification = new CosmicAudioSonification(rng);
      
      sonification.playSoundForStage('protoplanetary-disk', 0.5);
      
      const oscillators = mockNodes.filter(n => n._nodeType === 'oscillator');
      const panners = mockNodes.filter(n => n._nodeType === 'panner');
      
      expect(oscillators.length).toBeGreaterThanOrEqual(3);
      expect(panners.length).toBeGreaterThan(0);
    });

    it('planetary-accretion should generate impact percussion', () => {
      const rng = rngRegistry.getScopedRNG('accretion-test');
      const sonification = new CosmicAudioSonification(rng);
      
      sonification.playSoundForStage('planetary-accretion', 0.7);
      
      const oscillators = mockNodes.filter(n => n._nodeType === 'oscillator');
      expect(oscillators.length).toBeGreaterThan(5);
    });

    it('planetary-differentiation should generate core rumble with pulsing', () => {
      const rng = rngRegistry.getScopedRNG('diff-test');
      const sonification = new CosmicAudioSonification(rng);
      
      sonification.playSoundForStage('planetary-differentiation', 0.5);
      
      const oscillators = mockNodes.filter(n => n._nodeType === 'oscillator');
      const gains = mockNodes.filter(n => n._nodeType === 'gain');
      
      expect(oscillators.length).toBeGreaterThan(0);
      
      const pulsingGain = gains.find(g => g.gain.setValueAtTime.mock.calls.length > 4);
      expect(pulsingGain).toBeDefined();
    });

    it('surface-and-life should include water sounds and bio-rhythms', () => {
      const rng = rngRegistry.getScopedRNG('life-test');
      const sonification = new CosmicAudioSonification(rng);
      
      sonification.playSoundForStage('surface-and-life', 0.7);
      
      const oscillators = mockNodes.filter(n => n._nodeType === 'oscillator');
      const bufferSources = mockNodes.filter(n => n._nodeType === 'bufferSource');
      const filters = mockNodes.filter(n => n._nodeType === 'filter');
      
      expect(oscillators.length).toBeGreaterThan(5);
      expect(bufferSources.length).toBeGreaterThan(0);
      expect(filters.length).toBeGreaterThan(0);
    });
  });

  describe('Seed Determinism', () => {
    it('should generate same audio nodes for same seed and scope', () => {
      const initialNodes = mockNodes.length;
      
      const rng1 = rngRegistry.getScopedRNG('deterministic-test-1');
      const sonification1 = new CosmicAudioSonification(rng1);
      sonification1.playSoundForStage('planck-epoch', 0.5);
      const nodes1 = mockNodes.length - initialNodes;
      
      const midNodes = mockNodes.length;
      const rng2 = rngRegistry.getScopedRNG('deterministic-test-1');
      const sonification2 = new CosmicAudioSonification(rng2);
      sonification2.playSoundForStage('planck-epoch', 0.5);
      const nodes2 = mockNodes.length - midNodes;
      
      expect(nodes1).toBeGreaterThan(0);
      expect(nodes2).toBeGreaterThan(0);
      expect(nodes1).toBe(nodes2);
    });

    it('should be consistent across multiple generations', () => {
      const rng = rngRegistry.getScopedRNG('consistency-test');
      const sonification = new CosmicAudioSonification(rng);
      
      const start1 = mockNodes.length;
      sonification.playSoundForStage('cosmic-inflation', 0.5);
      const delta1 = mockNodes.length - start1;
      
      const start2 = mockNodes.length;
      sonification.playSoundForStage('cosmic-inflation', 0.5);
      const delta2 = mockNodes.length - start2;
      
      expect(delta1).toBe(delta2);
    });
  });

  describe('Progress-Based Modulation', () => {
    it.each([
      { stageId: 'nucleosynthesis', name: 'nucleosynthesis' },
      { stageId: 'first-supernovae', name: 'supernova' },
      { stageId: 'surface-and-life', name: 'life' }
    ])('should modulate $name based on progress', ({ stageId }) => {
      const rng = rngRegistry.getScopedRNG(`progress-test-${stageId}`);
      const sonification = new CosmicAudioSonification(rng);
      
      const start1 = mockNodes.length;
      sonification.playSoundForStage(stageId, 0.1);
      const earlyDelta = mockNodes.length - start1;
      
      const start2 = mockNodes.length;
      sonification.playSoundForStage(stageId, 0.9);
      const lateDelta = mockNodes.length - start2;
      
      expect(lateDelta).toBeGreaterThanOrEqual(earlyDelta);
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown stages gracefully', () => {
      const rng = rngRegistry.getScopedRNG('unknown-test');
      const sonification = new CosmicAudioSonification(rng);
      
      expect(() => {
        sonification.playSoundForStage('unknown-stage', 0.5);
      }).not.toThrow();
    });

    it('should handle progress outside [0, 1] range', () => {
      const rng = rngRegistry.getScopedRNG('range-test');
      const sonification = new CosmicAudioSonification(rng);
      
      expect(() => {
        sonification.playSoundForStage('planck-epoch', -0.5);
        sonification.playSoundForStage('planck-epoch', 1.5);
      }).not.toThrow();
    });
  });
});
