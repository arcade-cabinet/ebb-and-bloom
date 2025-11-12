import { VoiceContext, AudioNodeGroup } from '../types';

export function generateExpansionRumble(
  context: VoiceContext,
  progress: number
): AudioNode {
  const { audioContext, masterGain, rng, currentSources } = context;
  if (!audioContext || !masterGain) throw new Error('AudioContext not initialized');
  
  const duration = 3.0;
  const now = audioContext.currentTime;
  const nodes: AudioNode[] = [];
  
  const oscillator = audioContext.createOscillator();
  oscillator.type = 'sine';
  
  const highFreq = 1000 + rng.uniform(-100, 100);
  const lowFreq = 100 + rng.uniform(-20, 20);
  
  const currentFreq = highFreq * Math.pow(lowFreq / highFreq, progress);
  
  oscillator.frequency.setValueAtTime(currentFreq, now);
  
  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
  gain.gain.linearRampToValueAtTime(0.15, now + duration - 0.5);
  gain.gain.linearRampToValueAtTime(0, now + duration);
  
  oscillator.connect(gain);
  gain.connect(masterGain);
  
  oscillator.start(now);
  oscillator.stop(now + duration);
  
  nodes.push(oscillator, gain);
  currentSources.push({ nodes, stopTime: now + duration });
  
  return gain;
}
