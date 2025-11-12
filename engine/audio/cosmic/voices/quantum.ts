import { VoiceContext, AudioNodeGroup } from '../types';
import { createNoiseBuffer } from '../dsp/oscillators';
import { createBandpassFilter } from '../dsp/filters';

export function generateQuantumNoise(
  context: VoiceContext,
  progress: number
): AudioNode {
  const { audioContext, masterGain, rng, currentSources } = context;
  if (!audioContext || !masterGain) throw new Error('AudioContext not initialized');
  
  const duration = 2.0;
  const nodes: AudioNode[] = [];
  
  const noiseBuffer = createNoiseBuffer(audioContext, duration, rng, 'white');
  const bufferSource = audioContext.createBufferSource();
  bufferSource.buffer = noiseBuffer;
  bufferSource.loop = true;
  
  const filter = createBandpassFilter(
    audioContext,
    10000 + rng.uniform(-2000, 2000),
    0.5
  );
  
  const gain = audioContext.createGain();
  const baseVolume = 0.15 * (0.5 + progress * 0.5);
  gain.gain.value = baseVolume;
  
  const now = audioContext.currentTime;
  for (let i = 0; i < 20; i++) {
    const time = now + i * 0.1;
    const flickerVolume = baseVolume * rng.uniform(0.3, 1.0);
    gain.gain.setValueAtTime(flickerVolume, time);
  }
  
  bufferSource.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  
  bufferSource.start(now);
  bufferSource.stop(now + duration);
  
  nodes.push(bufferSource, filter, gain);
  currentSources.push({ nodes, stopTime: now + duration });
  
  return gain;
}
