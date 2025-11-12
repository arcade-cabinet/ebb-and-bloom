import { EnhancedRNG } from '../../../utils/EnhancedRNG';
import { NoiseType } from '../types';

export function createNoiseBuffer(
  audioContext: AudioContext,
  duration: number,
  rng: EnhancedRNG,
  filterType: NoiseType = 'white'
): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const length = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  
  if (filterType === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = rng.uniform(-1, 1);
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  } else if (filterType === 'brown') {
    let lastOut = 0;
    for (let i = 0; i < length; i++) {
      const white = rng.uniform(-1, 1);
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
  } else {
    for (let i = 0; i < length; i++) {
      data[i] = rng.uniform(-1, 1);
    }
  }
  
  return buffer;
}

export function createHarmonicOscillators(
  audioContext: AudioContext,
  fundamentalFreq: number,
  harmonics: number[],
  masterGain: GainNode,
  duration: number,
  progress: number = 1.0
): AudioNode[] {
  const nodes: AudioNode[] = [];
  const now = audioContext.currentTime;
  
  for (let i = 0; i < harmonics.length; i++) {
    const harmonic = harmonics[i];
    const osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = fundamentalFreq * harmonic;
    
    const harmonicGain = audioContext.createGain();
    const amplitude = 1.0 / (harmonic * harmonic);
    harmonicGain.gain.value = amplitude * (0.5 + progress * 0.5);
    
    osc.connect(harmonicGain);
    harmonicGain.connect(masterGain);
    
    osc.start(now);
    osc.stop(now + duration);
    
    nodes.push(osc, harmonicGain);
  }
  
  return nodes;
}
