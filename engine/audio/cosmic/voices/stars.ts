import { VoiceContext, AudioNodeGroup } from '../types';
import { createHarmonicOscillators } from '../dsp/oscillators';

export function generateStellarHum(
  context: VoiceContext,
  progress: number
): AudioNode {
  const { audioContext, masterGain, rng, currentSources } = context;
  if (!audioContext || !masterGain) throw new Error('AudioContext not initialized');
  
  const duration = 3.5;
  const now = audioContext.currentTime;
  
  const masterGainNode = audioContext.createGain();
  masterGainNode.gain.value = 0.16;
  
  const fundamentalFreq = 200 + rng.uniform(-20, 20);
  const harmonics = [1, 2, 3, 4, 5, 6];
  
  const nodes = createHarmonicOscillators(
    audioContext,
    fundamentalFreq,
    harmonics,
    masterGainNode,
    duration,
    progress
  );
  
  masterGainNode.connect(masterGain);
  
  currentSources.push({ nodes, stopTime: now + duration });
  
  return masterGainNode;
}
