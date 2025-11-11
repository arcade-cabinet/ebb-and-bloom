/**
 * Audio Test Fixture
 * 
 * Provides Web Audio API mocking utilities for testing audio systems.
 * 
 * This fixture creates a complete mock of the Web Audio API that properly tracks
 * all created audio nodes in a mockNodes array for test assertions.
 */

import { beforeEach, vi } from 'vitest';

export interface MockAudioNode {
  type: string;
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  frequency: {
    value: number;
    setValueAtTime: ReturnType<typeof vi.fn>;
    linearRampToValueAtTime: ReturnType<typeof vi.fn>;
    exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
  };
  gain: {
    value: number;
    setValueAtTime: ReturnType<typeof vi.fn>;
    linearRampToValueAtTime: ReturnType<typeof vi.fn>;
    exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
  };
  pan: {
    value: number;
    setValueAtTime: ReturnType<typeof vi.fn>;
  };
  Q: {
    value: number;
    setValueAtTime: ReturnType<typeof vi.fn>;
  };
  buffer: AudioBuffer | null;
  loop: boolean;
}

export interface MockAudioContext {
  currentTime: number;
  sampleRate: number;
  destination: MockAudioNode;
  createOscillator: () => MockAudioNode;
  createGain: () => MockAudioNode;
  createBiquadFilter: () => MockAudioNode;
  createBufferSource: () => MockAudioNode;
  createBuffer: (channels: number, length: number, sampleRate: number) => any;
  createConvolver: () => MockAudioNode;
  createStereoPanner: () => MockAudioNode;
}

export interface AudioFixture {
  mockAudioContext: MockAudioContext;
  mockNodes: MockAudioNode[];
  resetMocks: () => void;
}

// Module-level shared state for all audio mocks
const sharedMockNodes: MockAudioNode[] = [];
let sharedMockAudioContext: MockAudioContext | null = null;

function createMockNode(type: string): MockAudioNode {
  const node: MockAudioNode = {
    type,
    connect: vi.fn().mockReturnThis(),
    disconnect: vi.fn().mockReturnThis(),
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
  
  sharedMockNodes.push(node);
  return node;
}

export function setupAudioFixture(): AudioFixture {
  const resetMocks = () => {
    // Clear the shared array in place to maintain reference integrity
    while (sharedMockNodes.length > 0) {
      sharedMockNodes.pop();
    }
    
    // Create new mock audio context with tracked methods
    sharedMockAudioContext = {
      currentTime: 0,
      sampleRate: 44100,
      destination: createMockNode('destination'),
      createOscillator: vi.fn(() => createMockNode('oscillator')) as any,
      createGain: vi.fn(() => createMockNode('gain')) as any,
      createBiquadFilter: vi.fn(() => createMockNode('filter')) as any,
      createBufferSource: vi.fn(() => createMockNode('bufferSource')) as any,
      createBuffer: vi.fn((channels: number, length: number, sampleRate: number) => ({
        getChannelData: vi.fn(() => new Float32Array(length)),
        numberOfChannels: channels,
        length,
        sampleRate,
      })) as any,
      createConvolver: vi.fn(() => createMockNode('convolver')) as any,
      createStereoPanner: vi.fn(() => createMockNode('panner')) as any,
    };
    
    // Create mock AudioContext class that uses the shared context
    class MockAudioContextClass {
      currentTime: number;
      sampleRate: number;
      destination: MockAudioNode;
      createOscillator: any;
      createGain: any;
      createBiquadFilter: any;
      createBufferSource: any;
      createBuffer: any;
      createConvolver: any;
      createStereoPanner: any;
      
      constructor() {
        this.currentTime = sharedMockAudioContext!.currentTime;
        this.sampleRate = sharedMockAudioContext!.sampleRate;
        this.destination = sharedMockAudioContext!.destination;
        this.createOscillator = sharedMockAudioContext!.createOscillator;
        this.createGain = sharedMockAudioContext!.createGain;
        this.createBiquadFilter = sharedMockAudioContext!.createBiquadFilter;
        this.createBufferSource = sharedMockAudioContext!.createBufferSource;
        this.createBuffer = sharedMockAudioContext!.createBuffer;
        this.createConvolver = sharedMockAudioContext!.createConvolver;
        this.createStereoPanner = sharedMockAudioContext!.createStereoPanner;
      }
    }
    
    // Use vi.stubGlobal to ensure proper mocking
    vi.stubGlobal('AudioContext', MockAudioContextClass);
    vi.stubGlobal('webkitAudioContext', MockAudioContextClass);
    
    // Also set on globalThis for extra safety
    (globalThis as any).AudioContext = MockAudioContextClass;
    (globalThis as any).webkitAudioContext = MockAudioContextClass;
  };

  // Register beforeEach hook
  beforeEach(() => {
    resetMocks();
  });

  // Return fixture interface
  return {
    get mockAudioContext() { 
      return sharedMockAudioContext!; 
    },
    get mockNodes() { 
      return sharedMockNodes; 
    },
    resetMocks,
  };
}
