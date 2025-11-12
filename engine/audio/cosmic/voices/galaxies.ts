import { VoiceContext, AudioNodeGroup } from '../types';

export function generateGalacticHarmony(
  context: VoiceContext,
  progress: number
): AudioNode {
  const { audioContext, masterGain, rng, currentSources } = context;
  if (!audioContext || !masterGain) throw new Error('AudioContext not initialized');
  
  const duration = 3.5;
  const now = audioContext.currentTime;
  const nodes: AudioNode[] = [];
  
  const masterGainNode = audioContext.createGain();
  masterGainNode.gain.value = 0.14;
  
  const baseFreq = 150 + rng.uniform(-20, 20);
  const chord = [1, 5/4, 3/2, 2];
  
  for (let i = 0; i < chord.length; i++) {
    const freq = baseFreq * chord[i];
    const osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const panner = audioContext.createStereoPanner();
    const panPosition = rng.uniform(-1, 1) * progress;
    panner.pan.value = panPosition;
    
    const noteGain = audioContext.createGain();
    noteGain.gain.value = 0.25;
    
    osc.connect(panner);
    panner.connect(noteGain);
    noteGain.connect(masterGainNode);
    
    osc.start(now);
    osc.stop(now + duration);
    
    nodes.push(osc, panner, noteGain);
  }
  
  masterGainNode.connect(masterGain);
  
  currentSources.push({ nodes, stopTime: now + duration });
  
  return masterGainNode;
}
