import { VoiceContext, AudioNodeGroup } from '../types';
import { createNoiseBuffer } from '../dsp/oscillators';
import { createExponentialDecay } from '../dsp/envelopes';

export function generateSupernovaExplosion(
  context: VoiceContext,
  progress: number
): AudioNode {
  const { audioContext, masterGain, rng, currentSources } = context;
  if (!audioContext || !masterGain) throw new Error('AudioContext not initialized');
  
  const duration = 4.0;
  const now = audioContext.currentTime;
  const nodes: AudioNode[] = [];
  
  const masterGainNode = audioContext.createGain();
  masterGainNode.gain.value = 0.2;
  
  const buildupDuration = duration * 0.3;
  const explosionTime = now + buildupDuration;
  const decayDuration = duration * 0.7;
  
  if (progress < 0.3) {
    const buildupOsc = audioContext.createOscillator();
    buildupOsc.type = 'sawtooth';
    buildupOsc.frequency.setValueAtTime(50, now);
    buildupOsc.frequency.exponentialRampToValueAtTime(200, explosionTime);
    
    const buildupGain = audioContext.createGain();
    buildupGain.gain.setValueAtTime(0, now);
    buildupGain.gain.linearRampToValueAtTime(0.3, explosionTime);
    
    buildupOsc.connect(buildupGain);
    buildupGain.connect(masterGainNode);
    
    buildupOsc.start(now);
    buildupOsc.stop(explosionTime);
    
    nodes.push(buildupOsc, buildupGain);
  }
  
  if (progress >= 0.3) {
    const noiseBuffer = createNoiseBuffer(audioContext, decayDuration, rng, 'white');
    const explosionNoise = audioContext.createBufferSource();
    explosionNoise.buffer = noiseBuffer;
    
    const explosionGain = audioContext.createGain();
    createExponentialDecay(explosionGain, explosionTime, decayDuration, 0.5);
    
    explosionNoise.connect(explosionGain);
    explosionGain.connect(masterGainNode);
    
    explosionNoise.start(explosionTime);
    explosionNoise.stop(explosionTime + decayDuration);
    
    nodes.push(explosionNoise, explosionGain);
    
    const numResonances = 5;
    for (let i = 0; i < numResonances; i++) {
      const resonanceFreq = rng.uniform(100, 5000);
      const resonanceOsc = audioContext.createOscillator();
      resonanceOsc.type = 'sine';
      resonanceOsc.frequency.value = resonanceFreq;
      
      const resonanceGain = audioContext.createGain();
      const startTime = explosionTime + i * 0.1;
      createExponentialDecay(resonanceGain, startTime, 1.5, 0.2);
      
      resonanceOsc.connect(resonanceGain);
      resonanceGain.connect(masterGainNode);
      
      resonanceOsc.start(startTime);
      resonanceOsc.stop(startTime + 1.5);
      
      nodes.push(resonanceOsc, resonanceGain);
    }
  }
  
  masterGainNode.connect(masterGain);
  
  currentSources.push({ nodes, stopTime: now + duration });
  
  return masterGainNode;
}
