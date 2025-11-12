import { VoiceContext, AudioNodeGroup } from '../types';
import { createNoiseBuffer } from '../dsp/oscillators';
import { createHighpassFilter } from '../dsp/filters';

export function generatePlasmaChaos(
  context: VoiceContext,
  progress: number
): AudioNode {
  const { audioContext, masterGain, rng, currentSources } = context;
  if (!audioContext || !masterGain) throw new Error('AudioContext not initialized');
  
  const duration = 2.5;
  const now = audioContext.currentTime;
  const nodes: AudioNode[] = [];
  
  const numOscillators = Math.min(8, Math.floor(3 + progress * 5));
  
  const masterGainNode = audioContext.createGain();
  masterGainNode.gain.value = 0.12;
  
  for (let i = 0; i < numOscillators; i++) {
    const osc = audioContext.createOscillator();
    osc.type = 'sawtooth';
    
    const baseFreq = rng.uniform(500, 5000);
    osc.frequency.setValueAtTime(baseFreq, now);
    
    for (let j = 0; j < 10; j++) {
      const time = now + j * 0.25;
      const freq = baseFreq + rng.uniform(-500, 500);
      osc.frequency.setValueAtTime(freq, time);
    }
    
    const oscGain = audioContext.createGain();
    oscGain.gain.value = 1.0 / numOscillators;
    
    osc.connect(oscGain);
    oscGain.connect(masterGainNode);
    
    osc.start(now);
    osc.stop(now + duration);
    
    nodes.push(osc, oscGain);
  }
  
  const noiseBuffer = createNoiseBuffer(audioContext, duration, rng, 'white');
  const noiseSource = audioContext.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  
  const noiseFilter = createHighpassFilter(audioContext, 3000);
  
  const noiseGain = audioContext.createGain();
  noiseGain.gain.value = 0.1;
  
  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGainNode);
  
  noiseSource.start(now);
  noiseSource.stop(now + duration);
  
  nodes.push(noiseSource, noiseFilter, noiseGain);
  
  masterGainNode.connect(masterGain);
  
  currentSources.push({ nodes, stopTime: now + duration });
  
  return masterGainNode;
}
