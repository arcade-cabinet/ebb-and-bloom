import { EnhancedRNG } from '../../utils/EnhancedRNG';

export interface AudioCharacteristics {
  frequencyRange: [number, number];
  waveform: 'noise' | 'sine' | 'sawtooth' | 'square' | 'triangle' | 'percussion';
  motif: string;
  volume: number;
  panning: number;
  reverbAmount: number;
  filterType?: 'lowpass' | 'highpass' | 'bandpass';
  filterFrequency?: number;
}

export interface AudioNodeGroup {
  nodes: AudioNode[];
  stopTime: number;
}

export interface AudioContext {
  audioContext: AudioContext;
  masterGain: GainNode;
  convolver: ConvolverNode | null;
  rng: EnhancedRNG;
}

export interface VoiceContext {
  audioContext: AudioContext;
  masterGain: GainNode;
  convolver: ConvolverNode | null;
  rng: EnhancedRNG;
  currentSources: AudioNodeGroup[];
}

export type NoiseType = 'white' | 'pink' | 'brown';
