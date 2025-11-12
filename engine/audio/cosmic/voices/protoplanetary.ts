import { VoiceContext, AudioNodeGroup } from '../types';
import { createExponentialDecay } from '../dsp/envelopes';

export function generateDiskRotation(
  context: VoiceContext,
  progress: number
): AudioNode {
  const { audioContext, masterGain, rng, currentSources } = context;
  if (!audioContext || !masterGain) throw new Error('AudioContext not initialized');
  
  const duration = 4.0;
  const now = audioContext.currentTime;
  const nodes: AudioNode[] = [];
  
  const masterGainNode = audioContext.createGain();
  masterGainNode.gain.value = 0.08 + progress * 0.05;
  
  const numOrbits = Math.floor(2 + progress * 3);
  
  for (let i = 0; i < numOrbits; i++) {
    const distance = i / numOrbits;
    const innerTemp = 800;
    const outerTemp = 200;
    const temp = innerTemp - distance * (innerTemp - outerTemp);
    const freq = temp * 0.5;
    
    const osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq + rng.uniform(-20, 20);
    
    const panner = audioContext.createStereoPanner();
    const period = 1.0 + distance * 2.0;
    
    for (let j = 0; j < duration / 0.1; j++) {
      const time = now + j * 0.1;
      const angle = (j * 0.1 / period) * 2 * Math.PI;
      const pan = Math.sin(angle) * 0.7;
      panner.pan.setValueAtTime(pan, time);
    }
    
    const orbitGain = audioContext.createGain();
    orbitGain.gain.value = 0.15 * (1 - distance * 0.5);
    
    osc.connect(panner);
    panner.connect(orbitGain);
    orbitGain.connect(masterGainNode);
    
    osc.start(now);
    osc.stop(now + duration);
    
    nodes.push(osc, panner, orbitGain);
  }
  
  masterGainNode.connect(masterGain);
  
  currentSources.push({ nodes, stopTime: now + duration });
  
  return masterGainNode;
}

export function generatePlanetesimalCollisions(
  context: VoiceContext,
  progress: number
): AudioNode {
  const { audioContext, masterGain, rng, currentSources } = context;
  if (!audioContext || !masterGain) throw new Error('AudioContext not initialized');
  
  const duration = 4.0;
  const now = audioContext.currentTime;
  const nodes: AudioNode[] = [];
  
  const masterGainNode = audioContext.createGain();
  masterGainNode.gain.value = 0.17;
  
  const numImpacts = Math.floor(5 + progress * 15);
  const bassMass = 40 + progress * 100;
  
  const bassOsc = audioContext.createOscillator();
  bassOsc.type = 'sine';
  bassOsc.frequency.value = bassMass;
  
  const bassGain = audioContext.createGain();
  bassGain.gain.value = 0.3 * progress;
  
  bassOsc.connect(bassGain);
  bassGain.connect(masterGainNode);
  
  bassOsc.start(now);
  bassOsc.stop(now + duration);
  
  nodes.push(bassOsc, bassGain);
  
  for (let i = 0; i < numImpacts; i++) {
    const impactTime = now + rng.uniform(0, duration);
    const impactSize = rng.uniform(0.3, 1.0) * progress;
    
    const impactFreq = rng.uniform(100, 500) * (1 - impactSize * 0.5);
    const impactOsc = audioContext.createOscillator();
    impactOsc.type = 'triangle';
    impactOsc.frequency.setValueAtTime(impactFreq, impactTime);
    impactOsc.frequency.exponentialRampToValueAtTime(impactFreq * 0.5, impactTime + 0.2);
    
    const impactGain = audioContext.createGain();
    createExponentialDecay(impactGain, impactTime, 0.3, 0.3 * impactSize);
    
    impactOsc.connect(impactGain);
    impactGain.connect(masterGainNode);
    
    impactOsc.start(impactTime);
    impactOsc.stop(impactTime + 0.3);
    
    nodes.push(impactOsc, impactGain);
  }
  
  masterGainNode.connect(masterGain);
  
  currentSources.push({ nodes, stopTime: now + duration });
  
  return masterGainNode;
}
