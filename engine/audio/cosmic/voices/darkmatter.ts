import { VoiceContext, AudioNodeGroup } from '../types';
import { createLowpassFilter } from '../dsp/filters';
import { createPulseEnvelope } from '../dsp/envelopes';

export function generateGravitationalBass(
  context: VoiceContext,
  progress: number
): AudioNode {
  const { audioContext, masterGain, rng, currentSources } = context;
  if (!audioContext || !masterGain) throw new Error('AudioContext not initialized');
  
  const duration = 4.0;
  const now = audioContext.currentTime;
  const nodes: AudioNode[] = [];
  
  const masterGainNode = audioContext.createGain();
  masterGainNode.gain.value = 0.25;
  
  const bassOsc = audioContext.createOscillator();
  bassOsc.type = 'sine';
  const baseFreq = 20 + rng.uniform(0, 30);
  bassOsc.frequency.setValueAtTime(baseFreq, now);
  
  for (let i = 0; i < 8; i++) {
    const time = now + i * 0.5;
    const freq = baseFreq + rng.uniform(-5, 5);
    bassOsc.frequency.setValueAtTime(freq, time);
  }
  
  const filter = createLowpassFilter(audioContext, 80, 1.5);
  
  const pulseGain = audioContext.createGain();
  const pulseInterval = 0.4;
  
  for (let i = 0; i < duration / pulseInterval; i++) {
    const time = now + i * pulseInterval;
    const intensity = 0.5 + progress * 0.5;
    pulseGain.gain.setValueAtTime(intensity, time);
    pulseGain.gain.setValueAtTime(intensity * 0.3, time + pulseInterval * 0.3);
  }
  
  bassOsc.connect(filter);
  filter.connect(pulseGain);
  pulseGain.connect(masterGainNode);
  
  bassOsc.start(now);
  bassOsc.stop(now + duration);
  
  nodes.push(bassOsc, filter, pulseGain);
  
  masterGainNode.connect(masterGain);
  
  currentSources.push({ nodes, stopTime: now + duration });
  
  return masterGainNode;
}
