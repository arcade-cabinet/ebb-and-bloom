import { VoiceContext, AudioNodeGroup } from '../types';
import { createNoiseBuffer } from '../dsp/oscillators';
import { createBandpassFilter } from '../dsp/filters';
import { createExponentialDecay } from '../dsp/envelopes';

export function generateCoreRumble(
  context: VoiceContext,
  progress: number
): AudioNode {
  const { audioContext, masterGain, rng, currentSources } = context;
  if (!audioContext || !masterGain) throw new Error('AudioContext not initialized');
  
  const duration = 4.5;
  const now = audioContext.currentTime;
  const nodes: AudioNode[] = [];
  
  const masterGainNode = audioContext.createGain();
  masterGainNode.gain.value = 0.2;
  
  const coreFreq = 30 + rng.uniform(-5, 5);
  const coreOsc = audioContext.createOscillator();
  coreOsc.type = 'sine';
  coreOsc.frequency.value = coreFreq;
  
  const coreGain = audioContext.createGain();
  coreGain.gain.setValueAtTime(0.4, now);
  
  const pulseRate = 0.6;
  for (let i = 0; i < duration / pulseRate; i++) {
    const time = now + i * pulseRate;
    const intensity = 0.4 + rng.uniform(-0.1, 0.1);
    coreGain.gain.setValueAtTime(intensity, time);
    coreGain.gain.setValueAtTime(intensity * 0.6, time + pulseRate * 0.4);
  }
  
  coreOsc.connect(coreGain);
  coreGain.connect(masterGainNode);
  
  coreOsc.start(now);
  coreOsc.stop(now + duration);
  
  nodes.push(coreOsc, coreGain);
  
  const mantleFreq = 60 + rng.uniform(-10, 10);
  const mantleOsc = audioContext.createOscillator();
  mantleOsc.type = 'triangle';
  mantleOsc.frequency.value = mantleFreq;
  
  const mantleGain = audioContext.createGain();
  mantleGain.gain.value = 0.15 * progress;
  
  mantleOsc.connect(mantleGain);
  mantleGain.connect(masterGainNode);
  
  mantleOsc.start(now);
  mantleOsc.stop(now + duration);
  
  nodes.push(mantleOsc, mantleGain);
  
  masterGainNode.connect(masterGain);
  
  currentSources.push({ nodes, stopTime: now + duration });
  
  return masterGainNode;
}

export function generateOceanicBubbling(
  context: VoiceContext,
  progress: number
): AudioNode {
  const { audioContext, masterGain, rng, currentSources } = context;
  if (!audioContext || !masterGain) throw new Error('AudioContext not initialized');
  
  const duration = 4.0;
  const now = audioContext.currentTime;
  const nodes: AudioNode[] = [];
  
  const masterGainNode = audioContext.createGain();
  masterGainNode.gain.value = 0.15;
  
  const waterBuffer = createNoiseBuffer(audioContext, duration, rng, 'pink');
  const waterSource = audioContext.createBufferSource();
  waterSource.buffer = waterBuffer;
  waterSource.loop = true;
  
  const waterFilter = createBandpassFilter(audioContext, 500, 1.0);
  
  const waterGain = audioContext.createGain();
  waterGain.gain.value = 0.2;
  
  waterSource.connect(waterFilter);
  waterFilter.connect(waterGain);
  waterGain.connect(masterGainNode);
  
  waterSource.start(now);
  waterSource.stop(now + duration);
  
  nodes.push(waterSource, waterFilter, waterGain);
  
  const numBubbles = Math.floor(10 + progress * 20);
  
  for (let i = 0; i < numBubbles; i++) {
    const bubbleTime = now + rng.uniform(0, duration);
    const bubbleFreq = rng.uniform(400, 1200);
    
    const bubbleOsc = audioContext.createOscillator();
    bubbleOsc.type = 'sine';
    bubbleOsc.frequency.setValueAtTime(bubbleFreq, bubbleTime);
    bubbleOsc.frequency.exponentialRampToValueAtTime(bubbleFreq * 1.5, bubbleTime + 0.1);
    
    const bubbleGain = audioContext.createGain();
    createExponentialDecay(bubbleGain, bubbleTime, 0.15, 0.1);
    
    bubbleOsc.connect(bubbleGain);
    bubbleGain.connect(masterGainNode);
    
    bubbleOsc.start(bubbleTime);
    bubbleOsc.stop(bubbleTime + 0.15);
    
    nodes.push(bubbleOsc, bubbleGain);
  }
  
  if (progress > 0.5) {
    const bioFreq = 220 + rng.uniform(-20, 20);
    const bioOsc = audioContext.createOscillator();
    bioOsc.type = 'sine';
    bioOsc.frequency.value = bioFreq;
    
    const bioGain = audioContext.createGain();
    const bpm = 60 + progress * 40;
    const beatInterval = 60 / bpm;
    
    for (let i = 0; i < duration / beatInterval; i++) {
      const time = now + i * beatInterval;
      bioGain.gain.setValueAtTime(0.15, time);
      bioGain.gain.setValueAtTime(0.05, time + beatInterval * 0.3);
    }
    
    bioOsc.connect(bioGain);
    bioGain.connect(masterGainNode);
    
    bioOsc.start(now);
    bioOsc.stop(now + duration);
    
    nodes.push(bioOsc, bioGain);
  }
  
  masterGainNode.connect(masterGain);
  
  currentSources.push({ nodes, stopTime: now + duration });
  
  return masterGainNode;
}
