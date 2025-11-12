import { VoiceContext, AudioNodeGroup } from '../types';
import { createExponentialDecay } from '../dsp/envelopes';

export function generateAtomicBonding(
  context: VoiceContext,
  progress: number
): AudioNode {
  const { audioContext, masterGain, rng, currentSources } = context;
  if (!audioContext || !masterGain) throw new Error('AudioContext not initialized');
  
  const duration = 3.0;
  const now = audioContext.currentTime;
  const nodes: AudioNode[] = [];
  
  const masterGainNode = audioContext.createGain();
  masterGainNode.gain.value = 0.15;
  
  const elements = [
    { name: 'H', freq: 110, active: progress > 0 },
    { name: 'He', freq: 220, active: progress > 0.3 },
    { name: 'Li', freq: 165, active: progress > 0.6 }
  ];
  
  for (const element of elements) {
    if (!element.active) continue;
    
    const osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = element.freq + rng.uniform(-2, 2);
    
    const gain = audioContext.createGain();
    gain.gain.value = 0.2;
    
    osc.connect(gain);
    gain.connect(masterGainNode);
    
    osc.start(now);
    osc.stop(now + duration);
    
    nodes.push(osc, gain);
  }
  
  const numClicks = Math.floor(5 + progress * 10);
  for (let i = 0; i < numClicks; i++) {
    const clickTime = now + rng.uniform(0, duration);
    
    const clickOsc = audioContext.createOscillator();
    clickOsc.type = 'sine';
    clickOsc.frequency.value = rng.uniform(800, 2000);
    
    const clickGain = audioContext.createGain();
    createExponentialDecay(clickGain, clickTime, 0.05, 0.15);
    
    clickOsc.connect(clickGain);
    clickGain.connect(masterGainNode);
    
    clickOsc.start(clickTime);
    clickOsc.stop(clickTime + 0.05);
    
    nodes.push(clickOsc, clickGain);
  }
  
  masterGainNode.connect(masterGain);
  
  currentSources.push({ nodes, stopTime: now + duration });
  
  return masterGainNode;
}

export function generatePhotonRelease(
  context: VoiceContext,
  progress: number
): AudioNode {
  const { audioContext, masterGain, convolver, rng, currentSources } = context;
  if (!audioContext || !masterGain) throw new Error('AudioContext not initialized');
  
  const duration = 3.5;
  const now = audioContext.currentTime;
  const nodes: AudioNode[] = [];
  
  const masterGainNode = audioContext.createGain();
  masterGainNode.gain.value = 0.18;
  
  const numBells = Math.floor(4 + progress * 6);
  
  for (let i = 0; i < numBells; i++) {
    const startTime = now + i * (duration / numBells);
    const bellFreq = rng.uniform(2000, 8000);
    
    const fundamental = audioContext.createOscillator();
    fundamental.type = 'sine';
    fundamental.frequency.value = bellFreq;
    
    const harmonic1 = audioContext.createOscillator();
    harmonic1.type = 'sine';
    harmonic1.frequency.value = bellFreq * 2.5;
    
    const harmonic2 = audioContext.createOscillator();
    harmonic2.type = 'sine';
    harmonic2.frequency.value = bellFreq * 4.2;
    
    const bellGain = audioContext.createGain();
    createExponentialDecay(bellGain, startTime, 0.8, 0.1);
    
    fundamental.connect(bellGain);
    harmonic1.connect(bellGain);
    harmonic2.connect(bellGain);
    
    if (convolver) {
      const reverbGain = audioContext.createGain();
      reverbGain.gain.value = 0.3 + progress * 0.4;
      
      bellGain.connect(reverbGain);
      reverbGain.connect(convolver);
      convolver.connect(masterGainNode);
      
      nodes.push(reverbGain);
    }
    
    bellGain.connect(masterGainNode);
    
    fundamental.start(startTime);
    fundamental.stop(startTime + 0.8);
    harmonic1.start(startTime);
    harmonic1.stop(startTime + 0.8);
    harmonic2.start(startTime);
    harmonic2.stop(startTime + 0.8);
    
    nodes.push(fundamental, harmonic1, harmonic2, bellGain);
  }
  
  masterGainNode.connect(masterGain);
  
  currentSources.push({ nodes, stopTime: now + duration });
  
  return masterGainNode;
}
