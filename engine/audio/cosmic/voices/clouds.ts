import { VoiceContext, AudioNodeGroup } from '../types';

export function generateNebulaWisps(
  context: VoiceContext,
  progress: number
): AudioNode {
  const { audioContext, masterGain, rng, currentSources } = context;
  if (!audioContext || !masterGain) throw new Error('AudioContext not initialized');
  
  const duration = 4.0;
  const now = audioContext.currentTime;
  const nodes: AudioNode[] = [];
  
  const masterGainNode = audioContext.createGain();
  masterGainNode.gain.value = 0.12;
  
  const numLayers = Math.floor(3 + progress * 5);
  
  for (let i = 0; i < numLayers; i++) {
    const layerFreq = rng.uniform(100, 400);
    const osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(layerFreq, now);
    
    for (let j = 0; j < 10; j++) {
      const time = now + j * 0.4;
      const freq = layerFreq + rng.uniform(-20, 20);
      osc.frequency.setValueAtTime(freq, time);
    }
    
    const layerGain = audioContext.createGain();
    layerGain.gain.value = 0;
    
    for (let j = 0; j < 8; j++) {
      const time = now + j * 0.5;
      const amplitude = rng.uniform(0.05, 0.15);
      layerGain.gain.setValueAtTime(amplitude, time);
      layerGain.gain.setValueAtTime(0, time + 0.25);
    }
    
    osc.connect(layerGain);
    layerGain.connect(masterGainNode);
    
    osc.start(now);
    osc.stop(now + duration);
    
    nodes.push(osc, layerGain);
  }
  
  masterGainNode.connect(masterGain);
  
  currentSources.push({ nodes, stopTime: now + duration });
  
  return masterGainNode;
}

export function generateCloudCollapse(
  context: VoiceContext,
  progress: number
): AudioNode {
  const { audioContext, masterGain, rng, currentSources } = context;
  if (!audioContext || !masterGain) throw new Error('AudioContext not initialized');
  
  const duration = 3.5;
  const now = audioContext.currentTime;
  const nodes: AudioNode[] = [];
  
  const masterGainNode = audioContext.createGain();
  masterGainNode.gain.value = 0.16;
  
  if (progress < 0.2) {
    const impactOsc = audioContext.createOscillator();
    impactOsc.type = 'sine';
    impactOsc.frequency.setValueAtTime(150, now);
    impactOsc.frequency.exponentialRampToValueAtTime(80, now + 0.5);
    
    const impactGain = audioContext.createGain();
    impactGain.gain.setValueAtTime(0.4, now);
    impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    impactOsc.connect(impactGain);
    impactGain.connect(masterGainNode);
    
    impactOsc.start(now);
    impactOsc.stop(now + 0.5);
    
    nodes.push(impactOsc, impactGain);
  }
  
  const rotationOsc = audioContext.createOscillator();
  rotationOsc.type = 'sine';
  const rotFreq = 80 + rng.uniform(-10, 10);
  rotationOsc.frequency.setValueAtTime(rotFreq, now);
  rotationOsc.frequency.exponentialRampToValueAtTime(rotFreq * (1.2 + progress * 0.5), now + duration);
  
  const panner = audioContext.createStereoPanner();
  const rotationSpeed = 0.5 + progress;
  
  for (let i = 0; i < duration * 4; i++) {
    const time = now + i * 0.25;
    const pan = Math.sin(i * rotationSpeed) * 0.8;
    panner.pan.setValueAtTime(pan, time);
  }
  
  const rotGain = audioContext.createGain();
  rotGain.gain.setValueAtTime(0.2, now);
  rotGain.gain.linearRampToValueAtTime(0.3, now + duration);
  
  rotationOsc.connect(panner);
  panner.connect(rotGain);
  rotGain.connect(masterGainNode);
  
  rotationOsc.start(now);
  rotationOsc.stop(now + duration);
  
  nodes.push(rotationOsc, panner, rotGain);
  
  masterGainNode.connect(masterGain);
  
  currentSources.push({ nodes, stopTime: now + duration });
  
  return masterGainNode;
}
