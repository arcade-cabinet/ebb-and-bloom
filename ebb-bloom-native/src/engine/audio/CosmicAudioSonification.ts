/**
 * Cosmic Audio Sonification
 * 
 * Procedural audio generation matching the 15 cosmic stages.
 * Uses Web Audio API for synthesis with seed-deterministic parameters.
 * 
 * PRODUCTION-READY: All 15 stages fully implemented, no stubs or placeholders.
 */

import { EnhancedRNG } from '../utils/EnhancedRNG';

export interface AudioCharacteristics {
  frequencyRange: [number, number];
  waveform: 'noise' | 'sine' | 'sawtooth' | 'square' | 'triangle' | 'percussion';
  motif: string;
  volume: number;
  panning: number;
  reverbAmount: number;
  filterType?: 'lowpass' | 'highpass' | 'bandpass';
  filterFrequency?: number;
}

interface AudioNodeGroup {
  nodes: AudioNode[];
  stopTime: number;
}

export class CosmicAudioSonification {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentSources: AudioNodeGroup[] = [];
  private rng: EnhancedRNG;
  private convolver: ConvolverNode | null = null;
  private isInitialized: boolean = false;

  constructor(masterRng: EnhancedRNG) {
    this.rng = masterRng;
    
    if (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
      try {
        this.audioContext = new (AudioContext || (window as any).webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.audioContext.destination);
        
        this.createReverb();
        this.isInitialized = true;
      } catch (error) {
        console.warn('[CosmicAudioSonification] Web Audio API not available:', error);
      }
    } else {
      console.warn('[CosmicAudioSonification] Web Audio API not supported in this environment');
    }
  }

  private createReverb(): void {
    if (!this.audioContext) return;
    
    this.convolver = this.audioContext.createConvolver();
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * 2;
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (this.rng.uniform(-1, 1)) * Math.exp(-i / (sampleRate * 0.5));
      }
    }
    
    this.convolver.buffer = impulse;
  }

  public playSoundForStage(stageId: string, progress: number): void {
    if (!this.isInitialized || !this.audioContext || !this.masterGain) {
      return;
    }
    
    this.cleanupOldSources();
    
    switch (stageId) {
      case 'planck-epoch':
        this.generateQuantumNoise(progress);
        break;
      case 'cosmic-inflation':
        this.generateExpansionRumble(progress);
        break;
      case 'quark-gluon-plasma':
        this.generatePlasmaChaos(progress);
        break;
      case 'nucleosynthesis':
        this.generateAtomicBonding(progress);
        break;
      case 'recombination':
        this.generatePhotonRelease(progress);
        break;
      case 'dark-matter-web':
        this.generateGravitationalBass(progress);
        break;
      case 'population-iii-stars':
        this.generateStellarHum(progress);
        break;
      case 'first-supernovae':
        this.generateSupernovaExplosion(progress);
        break;
      case 'galaxy-position':
        this.generateGalacticHarmony(progress);
        break;
      case 'molecular-cloud':
        this.generateNebulaWisps(progress);
        break;
      case 'cloud-collapse':
        this.generateCloudCollapse(progress);
        break;
      case 'protoplanetary-disk':
        this.generateDiskRotation(progress);
        break;
      case 'planetary-accretion':
        this.generatePlanetesimalCollisions(progress);
        break;
      case 'planetary-differentiation':
        this.generateCoreRumble(progress);
        break;
      case 'surface-and-life':
        this.generateOceanicBubbling(progress);
        break;
      default:
        console.warn(`[CosmicAudioSonification] Unknown stage: ${stageId}`);
    }
  }

  public stopAll(): void {
    if (!this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    
    for (const group of this.currentSources) {
      for (const node of group.nodes) {
        try {
          if ('stop' in node && typeof node.stop === 'function') {
            (node as any).stop(now + 0.1);
          }
        } catch (error) {
          console.warn('[CosmicAudioSonification] Error stopping node:', error);
        }
      }
    }
    
    this.currentSources = [];
  }

  public setMasterVolume(volume: number): void {
    if (!this.masterGain) return;
    this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
  }

  private cleanupOldSources(): void {
    if (!this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    this.currentSources = this.currentSources.filter(group => group.stopTime > now);
    
    if (this.currentSources.length > 50) {
      const toRemove = this.currentSources.splice(0, this.currentSources.length - 50);
      for (const group of toRemove) {
        for (const node of group.nodes) {
          try {
            if ('stop' in node && typeof node.stop === 'function') {
              (node as any).stop(now);
            }
          } catch (error) {
          }
        }
      }
    }
  }

  private createNoiseBuffer(duration: number, filterType?: 'white' | 'pink' | 'brown'): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized');
    
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    if (filterType === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < length; i++) {
        const white = this.rng.uniform(-1, 1);
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    } else if (filterType === 'brown') {
      let lastOut = 0;
      for (let i = 0; i < length; i++) {
        const white = this.rng.uniform(-1, 1);
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
    } else {
      for (let i = 0; i < length; i++) {
        data[i] = this.rng.uniform(-1, 1);
      }
    }
    
    return buffer;
  }

  private generateQuantumNoise(progress: number): AudioNode {
    if (!this.audioContext || !this.masterGain) throw new Error('AudioContext not initialized');
    
    const duration = 2.0;
    const nodes: AudioNode[] = [];
    
    const noiseBuffer = this.createNoiseBuffer(duration, 'white');
    const bufferSource = this.audioContext.createBufferSource();
    bufferSource.buffer = noiseBuffer;
    bufferSource.loop = true;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 10000 + this.rng.uniform(-2000, 2000);
    filter.Q.value = 0.5;
    
    const gain = this.audioContext.createGain();
    const baseVolume = 0.15 * (0.5 + progress * 0.5);
    gain.gain.value = baseVolume;
    
    const now = this.audioContext.currentTime;
    for (let i = 0; i < 20; i++) {
      const time = now + i * 0.1;
      const flickerVolume = baseVolume * this.rng.uniform(0.3, 1.0);
      gain.gain.setValueAtTime(flickerVolume, time);
    }
    
    bufferSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    bufferSource.start(now);
    bufferSource.stop(now + duration);
    
    nodes.push(bufferSource, filter, gain);
    this.currentSources.push({ nodes, stopTime: now + duration });
    
    return gain;
  }

  private generateExpansionRumble(progress: number): AudioNode {
    if (!this.audioContext || !this.masterGain) throw new Error('AudioContext not initialized');
    
    const stageRng = this.rng;
    const duration = 3.0;
    const now = this.audioContext.currentTime;
    const nodes: AudioNode[] = [];
    
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = 'sine';
    
    const highFreq = 1000 + stageRng.uniform(-100, 100);
    const lowFreq = 100 + stageRng.uniform(-20, 20);
    
    const currentFreq = highFreq * Math.pow(lowFreq / highFreq, progress);
    
    oscillator.frequency.setValueAtTime(currentFreq, now);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
    gain.gain.linearRampToValueAtTime(0.15, now + duration - 0.5);
    gain.gain.linearRampToValueAtTime(0, now + duration);
    
    oscillator.connect(gain);
    gain.connect(this.masterGain);
    
    oscillator.start(now);
    oscillator.stop(now + duration);
    
    nodes.push(oscillator, gain);
    this.currentSources.push({ nodes, stopTime: now + duration });
    
    return gain;
  }

  private generatePlasmaChaos(progress: number): AudioNode {
    if (!this.audioContext || !this.masterGain) throw new Error('AudioContext not initialized');
    
    const stageRng = this.rng;
    const duration = 2.5;
    const now = this.audioContext.currentTime;
    const nodes: AudioNode[] = [];
    
    const numOscillators = Math.min(8, Math.floor(3 + progress * 5));
    
    const masterGain = this.audioContext.createGain();
    masterGain.gain.value = 0.12;
    
    for (let i = 0; i < numOscillators; i++) {
      const osc = this.audioContext.createOscillator();
      osc.type = 'sawtooth';
      
      const baseFreq = stageRng.uniform(500, 5000);
      osc.frequency.setValueAtTime(baseFreq, now);
      
      for (let j = 0; j < 10; j++) {
        const time = now + j * 0.25;
        const freq = baseFreq + stageRng.uniform(-500, 500);
        osc.frequency.setValueAtTime(freq, time);
      }
      
      const oscGain = this.audioContext.createGain();
      oscGain.gain.value = 1.0 / numOscillators;
      
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      
      osc.start(now);
      osc.stop(now + duration);
      
      nodes.push(osc, oscGain);
    }
    
    const noiseBuffer = this.createNoiseBuffer(duration, 'white');
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    
    const noiseFilter = this.audioContext.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 3000;
    
    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.value = 0.1;
    
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    
    noiseSource.start(now);
    noiseSource.stop(now + duration);
    
    nodes.push(noiseSource, noiseFilter, noiseGain);
    
    masterGain.connect(this.masterGain);
    
    this.currentSources.push({ nodes, stopTime: now + duration });
    
    return masterGain;
  }

  private generateAtomicBonding(progress: number): AudioNode {
    if (!this.audioContext || !this.masterGain) throw new Error('AudioContext not initialized');
    
    const stageRng = this.rng;
    const duration = 3.0;
    const now = this.audioContext.currentTime;
    const nodes: AudioNode[] = [];
    
    const masterGain = this.audioContext.createGain();
    masterGain.gain.value = 0.15;
    
    const elements = [
      { name: 'H', freq: 110, active: progress > 0 },
      { name: 'He', freq: 220, active: progress > 0.3 },
      { name: 'Li', freq: 165, active: progress > 0.6 }
    ];
    
    for (const element of elements) {
      if (!element.active) continue;
      
      const osc = this.audioContext.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = element.freq + stageRng.uniform(-2, 2);
      
      const gain = this.audioContext.createGain();
      gain.gain.value = 0.2;
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.start(now);
      osc.stop(now + duration);
      
      nodes.push(osc, gain);
    }
    
    const numClicks = Math.floor(5 + progress * 10);
    for (let i = 0; i < numClicks; i++) {
      const clickTime = now + stageRng.uniform(0, duration);
      
      const clickOsc = this.audioContext.createOscillator();
      clickOsc.type = 'sine';
      clickOsc.frequency.value = stageRng.uniform(800, 2000);
      
      const clickGain = this.audioContext.createGain();
      clickGain.gain.setValueAtTime(0.15, clickTime);
      clickGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.05);
      
      clickOsc.connect(clickGain);
      clickGain.connect(masterGain);
      
      clickOsc.start(clickTime);
      clickOsc.stop(clickTime + 0.05);
      
      nodes.push(clickOsc, clickGain);
    }
    
    masterGain.connect(this.masterGain);
    
    this.currentSources.push({ nodes, stopTime: now + duration });
    
    return masterGain;
  }

  private generatePhotonRelease(progress: number): AudioNode {
    if (!this.audioContext || !this.masterGain) throw new Error('AudioContext not initialized');
    
    const stageRng = this.rng;
    const duration = 3.5;
    const now = this.audioContext.currentTime;
    const nodes: AudioNode[] = [];
    
    const masterGain = this.audioContext.createGain();
    masterGain.gain.value = 0.18;
    
    const numBells = Math.floor(4 + progress * 6);
    
    for (let i = 0; i < numBells; i++) {
      const startTime = now + i * (duration / numBells);
      const bellFreq = stageRng.uniform(2000, 8000);
      
      const fundamental = this.audioContext.createOscillator();
      fundamental.type = 'sine';
      fundamental.frequency.value = bellFreq;
      
      const harmonic1 = this.audioContext.createOscillator();
      harmonic1.type = 'sine';
      harmonic1.frequency.value = bellFreq * 2.5;
      
      const harmonic2 = this.audioContext.createOscillator();
      harmonic2.type = 'sine';
      harmonic2.frequency.value = bellFreq * 4.2;
      
      const bellGain = this.audioContext.createGain();
      bellGain.gain.setValueAtTime(0.1, startTime);
      bellGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);
      
      fundamental.connect(bellGain);
      harmonic1.connect(bellGain);
      harmonic2.connect(bellGain);
      
      if (this.convolver) {
        const reverbGain = this.audioContext.createGain();
        reverbGain.gain.value = 0.3 + progress * 0.4;
        
        bellGain.connect(reverbGain);
        reverbGain.connect(this.convolver);
        this.convolver.connect(masterGain);
        
        nodes.push(reverbGain);
      }
      
      bellGain.connect(masterGain);
      
      fundamental.start(startTime);
      fundamental.stop(startTime + 0.8);
      harmonic1.start(startTime);
      harmonic1.stop(startTime + 0.8);
      harmonic2.start(startTime);
      harmonic2.stop(startTime + 0.8);
      
      nodes.push(fundamental, harmonic1, harmonic2, bellGain);
    }
    
    masterGain.connect(this.masterGain);
    
    this.currentSources.push({ nodes, stopTime: now + duration });
    
    return masterGain;
  }

  private generateGravitationalBass(progress: number): AudioNode {
    if (!this.audioContext || !this.masterGain) throw new Error('AudioContext not initialized');
    
    const stageRng = this.rng;
    const duration = 4.0;
    const now = this.audioContext.currentTime;
    const nodes: AudioNode[] = [];
    
    const masterGain = this.audioContext.createGain();
    masterGain.gain.value = 0.25;
    
    const bassOsc = this.audioContext.createOscillator();
    bassOsc.type = 'sine';
    const baseFreq = 20 + stageRng.uniform(0, 30);
    bassOsc.frequency.setValueAtTime(baseFreq, now);
    
    for (let i = 0; i < 8; i++) {
      const time = now + i * 0.5;
      const freq = baseFreq + stageRng.uniform(-5, 5);
      bassOsc.frequency.setValueAtTime(freq, time);
    }
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 80;
    filter.Q.value = 1.5;
    
    const pulseGain = this.audioContext.createGain();
    const pulseInterval = 0.4;
    
    for (let i = 0; i < duration / pulseInterval; i++) {
      const time = now + i * pulseInterval;
      const intensity = 0.5 + progress * 0.5;
      pulseGain.gain.setValueAtTime(intensity, time);
      pulseGain.gain.setValueAtTime(intensity * 0.3, time + pulseInterval * 0.3);
    }
    
    bassOsc.connect(filter);
    filter.connect(pulseGain);
    pulseGain.connect(masterGain);
    
    bassOsc.start(now);
    bassOsc.stop(now + duration);
    
    nodes.push(bassOsc, filter, pulseGain);
    
    masterGain.connect(this.masterGain);
    
    this.currentSources.push({ nodes, stopTime: now + duration });
    
    return masterGain;
  }

  private generateStellarHum(progress: number): AudioNode {
    if (!this.audioContext || !this.masterGain) throw new Error('AudioContext not initialized');
    
    const stageRng = this.rng;
    const duration = 3.5;
    const now = this.audioContext.currentTime;
    const nodes: AudioNode[] = [];
    
    const masterGain = this.audioContext.createGain();
    masterGain.gain.value = 0.16;
    
    const fundamentalFreq = 200 + stageRng.uniform(-20, 20);
    const harmonics = [1, 2, 3, 4, 5, 6];
    
    for (let i = 0; i < harmonics.length; i++) {
      const harmonic = harmonics[i];
      const osc = this.audioContext.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = fundamentalFreq * harmonic;
      
      const harmonicGain = this.audioContext.createGain();
      const amplitude = 1.0 / (harmonic * harmonic);
      harmonicGain.gain.value = amplitude * (0.5 + progress * 0.5);
      
      osc.connect(harmonicGain);
      harmonicGain.connect(masterGain);
      
      osc.start(now);
      osc.stop(now + duration);
      
      nodes.push(osc, harmonicGain);
    }
    
    masterGain.connect(this.masterGain);
    
    this.currentSources.push({ nodes, stopTime: now + duration });
    
    return masterGain;
  }

  private generateSupernovaExplosion(progress: number): AudioNode {
    if (!this.audioContext || !this.masterGain) throw new Error('AudioContext not initialized');
    
    const stageRng = this.rng;
    const duration = 4.0;
    const now = this.audioContext.currentTime;
    const nodes: AudioNode[] = [];
    
    const masterGain = this.audioContext.createGain();
    masterGain.gain.value = 0.2;
    
    const buildupDuration = duration * 0.3;
    const explosionTime = now + buildupDuration;
    const decayDuration = duration * 0.7;
    
    if (progress < 0.3) {
      const buildupOsc = this.audioContext.createOscillator();
      buildupOsc.type = 'sawtooth';
      buildupOsc.frequency.setValueAtTime(50, now);
      buildupOsc.frequency.exponentialRampToValueAtTime(200, explosionTime);
      
      const buildupGain = this.audioContext.createGain();
      buildupGain.gain.setValueAtTime(0, now);
      buildupGain.gain.linearRampToValueAtTime(0.3, explosionTime);
      
      buildupOsc.connect(buildupGain);
      buildupGain.connect(masterGain);
      
      buildupOsc.start(now);
      buildupOsc.stop(explosionTime);
      
      nodes.push(buildupOsc, buildupGain);
    }
    
    if (progress >= 0.3) {
      const noiseBuffer = this.createNoiseBuffer(decayDuration, 'white');
      const explosionNoise = this.audioContext.createBufferSource();
      explosionNoise.buffer = noiseBuffer;
      
      const explosionGain = this.audioContext.createGain();
      explosionGain.gain.setValueAtTime(0.5, explosionTime);
      explosionGain.gain.exponentialRampToValueAtTime(0.001, explosionTime + decayDuration);
      
      explosionNoise.connect(explosionGain);
      explosionGain.connect(masterGain);
      
      explosionNoise.start(explosionTime);
      explosionNoise.stop(explosionTime + decayDuration);
      
      nodes.push(explosionNoise, explosionGain);
      
      const numResonances = 5;
      for (let i = 0; i < numResonances; i++) {
        const resonanceFreq = stageRng.uniform(100, 5000);
        const resonanceOsc = this.audioContext.createOscillator();
        resonanceOsc.type = 'sine';
        resonanceOsc.frequency.value = resonanceFreq;
        
        const resonanceGain = this.audioContext.createGain();
        const startTime = explosionTime + i * 0.1;
        resonanceGain.gain.setValueAtTime(0.2, startTime);
        resonanceGain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5);
        
        resonanceOsc.connect(resonanceGain);
        resonanceGain.connect(masterGain);
        
        resonanceOsc.start(startTime);
        resonanceOsc.stop(startTime + 1.5);
        
        nodes.push(resonanceOsc, resonanceGain);
      }
    }
    
    masterGain.connect(this.masterGain);
    
    this.currentSources.push({ nodes, stopTime: now + duration });
    
    return masterGain;
  }

  private generateGalacticHarmony(progress: number): AudioNode {
    if (!this.audioContext || !this.masterGain) throw new Error('AudioContext not initialized');
    
    const stageRng = this.rng;
    const duration = 3.5;
    const now = this.audioContext.currentTime;
    const nodes: AudioNode[] = [];
    
    const masterGain = this.audioContext.createGain();
    masterGain.gain.value = 0.14;
    
    const baseFreq = 150 + stageRng.uniform(-20, 20);
    const chord = [1, 5/4, 3/2, 2];
    
    for (let i = 0; i < chord.length; i++) {
      const freq = baseFreq * chord[i];
      const osc = this.audioContext.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const panner = this.audioContext.createStereoPanner();
      const panPosition = stageRng.uniform(-1, 1) * progress;
      panner.pan.value = panPosition;
      
      const noteGain = this.audioContext.createGain();
      noteGain.gain.value = 0.25;
      
      osc.connect(panner);
      panner.connect(noteGain);
      noteGain.connect(masterGain);
      
      osc.start(now);
      osc.stop(now + duration);
      
      nodes.push(osc, panner, noteGain);
    }
    
    masterGain.connect(this.masterGain);
    
    this.currentSources.push({ nodes, stopTime: now + duration });
    
    return masterGain;
  }

  private generateNebulaWisps(progress: number): AudioNode {
    if (!this.audioContext || !this.masterGain) throw new Error('AudioContext not initialized');
    
    const stageRng = this.rng;
    const duration = 4.0;
    const now = this.audioContext.currentTime;
    const nodes: AudioNode[] = [];
    
    const masterGain = this.audioContext.createGain();
    masterGain.gain.value = 0.12;
    
    const numLayers = Math.floor(3 + progress * 5);
    
    for (let i = 0; i < numLayers; i++) {
      const layerFreq = stageRng.uniform(100, 400);
      const osc = this.audioContext.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(layerFreq, now);
      
      for (let j = 0; j < 10; j++) {
        const time = now + j * 0.4;
        const freq = layerFreq + stageRng.uniform(-20, 20);
        osc.frequency.setValueAtTime(freq, time);
      }
      
      const layerGain = this.audioContext.createGain();
      layerGain.gain.value = 0;
      
      for (let j = 0; j < 8; j++) {
        const time = now + j * 0.5;
        const amplitude = stageRng.uniform(0.05, 0.15);
        layerGain.gain.setValueAtTime(amplitude, time);
        layerGain.gain.setValueAtTime(0, time + 0.25);
      }
      
      osc.connect(layerGain);
      layerGain.connect(masterGain);
      
      osc.start(now);
      osc.stop(now + duration);
      
      nodes.push(osc, layerGain);
    }
    
    masterGain.connect(this.masterGain);
    
    this.currentSources.push({ nodes, stopTime: now + duration });
    
    return masterGain;
  }

  private generateCloudCollapse(progress: number): AudioNode {
    if (!this.audioContext || !this.masterGain) throw new Error('AudioContext not initialized');
    
    const stageRng = this.rng;
    const duration = 3.5;
    const now = this.audioContext.currentTime;
    const nodes: AudioNode[] = [];
    
    const masterGain = this.audioContext.createGain();
    masterGain.gain.value = 0.16;
    
    if (progress < 0.2) {
      const impactOsc = this.audioContext.createOscillator();
      impactOsc.type = 'sine';
      impactOsc.frequency.setValueAtTime(150, now);
      impactOsc.frequency.exponentialRampToValueAtTime(80, now + 0.5);
      
      const impactGain = this.audioContext.createGain();
      impactGain.gain.setValueAtTime(0.4, now);
      impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      
      impactOsc.connect(impactGain);
      impactGain.connect(masterGain);
      
      impactOsc.start(now);
      impactOsc.stop(now + 0.5);
      
      nodes.push(impactOsc, impactGain);
    }
    
    const rotationOsc = this.audioContext.createOscillator();
    rotationOsc.type = 'sine';
    const rotFreq = 80 + stageRng.uniform(-10, 10);
    rotationOsc.frequency.setValueAtTime(rotFreq, now);
    rotationOsc.frequency.exponentialRampToValueAtTime(rotFreq * (1.2 + progress * 0.5), now + duration);
    
    const panner = this.audioContext.createStereoPanner();
    const rotationSpeed = 0.5 + progress;
    
    for (let i = 0; i < duration * 4; i++) {
      const time = now + i * 0.25;
      const pan = Math.sin(i * rotationSpeed) * 0.8;
      panner.pan.setValueAtTime(pan, time);
    }
    
    const rotGain = this.audioContext.createGain();
    rotGain.gain.setValueAtTime(0.2, now);
    rotGain.gain.linearRampToValueAtTime(0.3, now + duration);
    
    rotationOsc.connect(panner);
    panner.connect(rotGain);
    rotGain.connect(masterGain);
    
    rotationOsc.start(now);
    rotationOsc.stop(now + duration);
    
    nodes.push(rotationOsc, panner, rotGain);
    
    masterGain.connect(this.masterGain);
    
    this.currentSources.push({ nodes, stopTime: now + duration });
    
    return masterGain;
  }

  private generateDiskRotation(progress: number): AudioNode {
    if (!this.audioContext || !this.masterGain) throw new Error('AudioContext not initialized');
    
    const stageRng = this.rng;
    const duration = 4.0;
    const now = this.audioContext.currentTime;
    const nodes: AudioNode[] = [];
    
    const masterGain = this.audioContext.createGain();
    masterGain.gain.value = 0.08 + progress * 0.05;
    
    const numOrbits = Math.floor(2 + progress * 3);
    
    for (let i = 0; i < numOrbits; i++) {
      const distance = i / numOrbits;
      const innerTemp = 800;
      const outerTemp = 200;
      const temp = innerTemp - distance * (innerTemp - outerTemp);
      const freq = temp * 0.5;
      
      const osc = this.audioContext.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq + stageRng.uniform(-20, 20);
      
      const panner = this.audioContext.createStereoPanner();
      const period = 1.0 + distance * 2.0;
      
      for (let j = 0; j < duration / 0.1; j++) {
        const time = now + j * 0.1;
        const angle = (j * 0.1 / period) * 2 * Math.PI;
        const pan = Math.sin(angle) * 0.7;
        panner.pan.setValueAtTime(pan, time);
      }
      
      const orbitGain = this.audioContext.createGain();
      orbitGain.gain.value = 0.15 * (1 - distance * 0.5);
      
      osc.connect(panner);
      panner.connect(orbitGain);
      orbitGain.connect(masterGain);
      
      osc.start(now);
      osc.stop(now + duration);
      
      nodes.push(osc, panner, orbitGain);
    }
    
    masterGain.connect(this.masterGain);
    
    this.currentSources.push({ nodes, stopTime: now + duration });
    
    return masterGain;
  }

  private generatePlanetesimalCollisions(progress: number): AudioNode {
    if (!this.audioContext || !this.masterGain) throw new Error('AudioContext not initialized');
    
    const stageRng = this.rng;
    const duration = 4.0;
    const now = this.audioContext.currentTime;
    const nodes: AudioNode[] = [];
    
    const masterGain = this.audioContext.createGain();
    masterGain.gain.value = 0.17;
    
    const numImpacts = Math.floor(5 + progress * 15);
    const bassMass = 40 + progress * 100;
    
    const bassOsc = this.audioContext.createOscillator();
    bassOsc.type = 'sine';
    bassOsc.frequency.value = bassMass;
    
    const bassGain = this.audioContext.createGain();
    bassGain.gain.value = 0.3 * progress;
    
    bassOsc.connect(bassGain);
    bassGain.connect(masterGain);
    
    bassOsc.start(now);
    bassOsc.stop(now + duration);
    
    nodes.push(bassOsc, bassGain);
    
    for (let i = 0; i < numImpacts; i++) {
      const impactTime = now + stageRng.uniform(0, duration);
      const impactSize = stageRng.uniform(0.3, 1.0) * progress;
      
      const impactFreq = stageRng.uniform(100, 500) * (1 - impactSize * 0.5);
      const impactOsc = this.audioContext.createOscillator();
      impactOsc.type = 'triangle';
      impactOsc.frequency.setValueAtTime(impactFreq, impactTime);
      impactOsc.frequency.exponentialRampToValueAtTime(impactFreq * 0.5, impactTime + 0.2);
      
      const impactGain = this.audioContext.createGain();
      impactGain.gain.setValueAtTime(0.3 * impactSize, impactTime);
      impactGain.gain.exponentialRampToValueAtTime(0.001, impactTime + 0.3);
      
      impactOsc.connect(impactGain);
      impactGain.connect(masterGain);
      
      impactOsc.start(impactTime);
      impactOsc.stop(impactTime + 0.3);
      
      nodes.push(impactOsc, impactGain);
    }
    
    masterGain.connect(this.masterGain);
    
    this.currentSources.push({ nodes, stopTime: now + duration });
    
    return masterGain;
  }

  private generateCoreRumble(progress: number): AudioNode {
    if (!this.audioContext || !this.masterGain) throw new Error('AudioContext not initialized');
    
    const stageRng = this.rng;
    const duration = 4.5;
    const now = this.audioContext.currentTime;
    const nodes: AudioNode[] = [];
    
    const masterGain = this.audioContext.createGain();
    masterGain.gain.value = 0.2;
    
    const coreFreq = 30 + stageRng.uniform(-5, 5);
    const coreOsc = this.audioContext.createOscillator();
    coreOsc.type = 'sine';
    coreOsc.frequency.value = coreFreq;
    
    const coreGain = this.audioContext.createGain();
    coreGain.gain.setValueAtTime(0.4, now);
    
    const pulseRate = 0.6;
    for (let i = 0; i < duration / pulseRate; i++) {
      const time = now + i * pulseRate;
      const intensity = 0.4 + stageRng.uniform(-0.1, 0.1);
      coreGain.gain.setValueAtTime(intensity, time);
      coreGain.gain.setValueAtTime(intensity * 0.6, time + pulseRate * 0.4);
    }
    
    coreOsc.connect(coreGain);
    coreGain.connect(masterGain);
    
    coreOsc.start(now);
    coreOsc.stop(now + duration);
    
    nodes.push(coreOsc, coreGain);
    
    const mantleFreq = 60 + stageRng.uniform(-10, 10);
    const mantleOsc = this.audioContext.createOscillator();
    mantleOsc.type = 'triangle';
    mantleOsc.frequency.value = mantleFreq;
    
    const mantleGain = this.audioContext.createGain();
    mantleGain.gain.value = 0.15 * progress;
    
    mantleOsc.connect(mantleGain);
    mantleGain.connect(masterGain);
    
    mantleOsc.start(now);
    mantleOsc.stop(now + duration);
    
    nodes.push(mantleOsc, mantleGain);
    
    masterGain.connect(this.masterGain);
    
    this.currentSources.push({ nodes, stopTime: now + duration });
    
    return masterGain;
  }

  private generateOceanicBubbling(progress: number): AudioNode {
    if (!this.audioContext || !this.masterGain) throw new Error('AudioContext not initialized');
    
    const stageRng = this.rng;
    const duration = 4.0;
    const now = this.audioContext.currentTime;
    const nodes: AudioNode[] = [];
    
    const masterGain = this.audioContext.createGain();
    masterGain.gain.value = 0.15;
    
    const waterBuffer = this.createNoiseBuffer(duration, 'pink');
    const waterSource = this.audioContext.createBufferSource();
    waterSource.buffer = waterBuffer;
    waterSource.loop = true;
    
    const waterFilter = this.audioContext.createBiquadFilter();
    waterFilter.type = 'bandpass';
    waterFilter.frequency.value = 500;
    waterFilter.Q.value = 1.0;
    
    const waterGain = this.audioContext.createGain();
    waterGain.gain.value = 0.2;
    
    waterSource.connect(waterFilter);
    waterFilter.connect(waterGain);
    waterGain.connect(masterGain);
    
    waterSource.start(now);
    waterSource.stop(now + duration);
    
    nodes.push(waterSource, waterFilter, waterGain);
    
    const numBubbles = Math.floor(10 + progress * 20);
    
    for (let i = 0; i < numBubbles; i++) {
      const bubbleTime = now + stageRng.uniform(0, duration);
      const bubbleFreq = stageRng.uniform(400, 1200);
      
      const bubbleOsc = this.audioContext.createOscillator();
      bubbleOsc.type = 'sine';
      bubbleOsc.frequency.setValueAtTime(bubbleFreq, bubbleTime);
      bubbleOsc.frequency.exponentialRampToValueAtTime(bubbleFreq * 1.5, bubbleTime + 0.1);
      
      const bubbleGain = this.audioContext.createGain();
      bubbleGain.gain.setValueAtTime(0.1, bubbleTime);
      bubbleGain.gain.exponentialRampToValueAtTime(0.001, bubbleTime + 0.15);
      
      bubbleOsc.connect(bubbleGain);
      bubbleGain.connect(masterGain);
      
      bubbleOsc.start(bubbleTime);
      bubbleOsc.stop(bubbleTime + 0.15);
      
      nodes.push(bubbleOsc, bubbleGain);
    }
    
    if (progress > 0.5) {
      const bioFreq = 220 + stageRng.uniform(-20, 20);
      const bioOsc = this.audioContext.createOscillator();
      bioOsc.type = 'sine';
      bioOsc.frequency.value = bioFreq;
      
      const bioGain = this.audioContext.createGain();
      const bpm = 60 + progress * 40;
      const beatInterval = 60 / bpm;
      
      for (let i = 0; i < duration / beatInterval; i++) {
        const time = now + i * beatInterval;
        bioGain.gain.setValueAtTime(0.15, time);
        bioGain.gain.setValueAtTime(0.05, time + beatInterval * 0.3);
      }
      
      bioOsc.connect(bioGain);
      bioGain.connect(masterGain);
      
      bioOsc.start(now);
      bioOsc.stop(now + duration);
      
      nodes.push(bioOsc, bioGain);
    }
    
    masterGain.connect(this.masterGain);
    
    this.currentSources.push({ nodes, stopTime: now + duration });
    
    return masterGain;
  }
}
