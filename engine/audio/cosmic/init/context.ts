import { EnhancedRNG } from '../../../utils/EnhancedRNG';

export class AudioContextManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private isInitialized: boolean = false;
  private rng: EnhancedRNG;

  constructor(rng: EnhancedRNG) {
    this.rng = rng;
    this.initialize();
  }

  private initialize(): void {
    if (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
      try {
        this.audioContext = new (AudioContext || (window as any).webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.audioContext.destination);
        
        this.createReverb();
        this.isInitialized = true;
      } catch (error) {
        console.warn('[AudioContextManager] Web Audio API not available:', error);
      }
    } else {
      console.warn('[AudioContextManager] Web Audio API not supported in this environment');
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

  public getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  public getMasterGain(): GainNode | null {
    return this.masterGain;
  }

  public getConvolver(): ConvolverNode | null {
    return this.convolver;
  }

  public isReady(): boolean {
    return this.isInitialized;
  }

  public setMasterVolume(volume: number): void {
    if (!this.masterGain) return;
    this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
  }
}
