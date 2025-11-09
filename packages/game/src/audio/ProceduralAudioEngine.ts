/**
 * Procedural Audio Engine
 * 
 * Generate ALL sounds from laws. NO audio files.
 * 
 * Uses Web Audio API + acoustic laws.
 */

import { AcousticsLaws } from '../laws/02-planetary/acoustics';

export class ProceduralAudioEngine {
  private audioContext: AudioContext;
  private masterGain: GainNode;
  
  constructor() {
    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.5;
    this.masterGain.connect(this.audioContext.destination);
  }
  
  /**
   * Generate animal call from anatomy
   */
  generateAnimalCall(
    mass_kg: number,
    purpose: 'alarm' | 'territorial' | 'mating' | 'distress' | 'contact',
    emotionalArousal: number = 0.5
  ): void {
    // Fundamental frequency from mass
    const f0 = AcousticsLaws.vocal.fundamentalFrequency_Hz(mass_kg);
    
    // Call parameters from purpose
    const callParams = AcousticsLaws.animalSounds.callType(purpose);
    
    // Modulation from emotion
    const vibrato = AcousticsLaws.animalSounds.modulationDepth_Hz(emotionalArousal);
    
    // Create oscillator (fundamental)
    const osc = this.audioContext.createOscillator();
    osc.frequency.value = f0;
    osc.type = 'sawtooth'; // Rich harmonics
    
    // Vibrato (frequency modulation)
    const lfo = this.audioContext.createOscillator();
    lfo.frequency.value = 5; // 5 Hz vibrato rate
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = vibrato;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    
    // Envelope (ADSR)
    const gainNode = this.audioContext.createGain();
    const now = this.audioContext.currentTime;
    const attack = 0.01;
    const decay = 0.1;
    const sustain = 0.7;
    const release = 0.2;
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + attack);
    gainNode.gain.linearRampToValueAtTime(sustain, now + attack + decay);
    gainNode.gain.setValueAtTime(sustain, now + callParams.duration_s - release);
    gainNode.gain.linearRampToValueAtTime(0, now + callParams.duration_s);
    
    // Filter (formants - vocal tract resonances)
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = callParams.freq_Hz;
    filter.Q.value = 10; // Narrow peak
    
    // Connect
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    // Play
    osc.start(now);
    lfo.start(now);
    osc.stop(now + callParams.duration_s);
    lfo.stop(now + callParams.duration_s);
    
    console.log(`[Audio] Animal call: ${mass_kg}kg, f₀=${f0.toFixed(0)}Hz, ${purpose}`);
  }
  
  /**
   * Ambient cosmic soundscape
   * Space is silent, but we create ambience from events
   */
  generateCosmicAmbience(
    starAge_Gyr: number,
    stellarActivity: number,
    nearbyEvents: string[]
  ): void {
    // Deep drone from stellar fusion
    const stellarDrone = this.audioContext.createOscillator();
    stellarDrone.type = 'sine';
    stellarDrone.frequency.value = 40 + stellarActivity * 20; // 40-60 Hz (very low)
    
    const droneGain = this.audioContext.createGain();
    droneGain.gain.value = 0.1;
    
    stellarDrone.connect(droneGain);
    droneGain.connect(this.masterGain);
    stellarDrone.start();
    
    // Pulses for events
    for (const event of nearbyEvents) {
      if (event === 'supernova') {
        this.generateExplosion(5000, 2.0); // High freq, long
      } else if (event === 'star-formation') {
        this.generateRumble(100, 1.0); // Low freq, short
      }
    }
    
    console.log(`[Audio] Cosmic ambience: Age=${starAge_Gyr}Gyr, Activity=${stellarActivity}`);
  }
  
  /**
   * Explosion sound (supernova, impact)
   */
  private generateExplosion(maxFreq_Hz: number, duration_s: number): void {
    const now = this.audioContext.currentTime;
    
    // Noise burst
    const noise = this.audioContext.createBufferSource();
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration_s, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.audioContext.sampleRate * 0.5));
    }
    
    noise.buffer = buffer;
    
    // Filter sweep (high to low)
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(maxFreq_Hz, now);
    filter.frequency.exponentialRampToValueAtTime(50, now + duration_s);
    
    const gain = this.audioContext.createGain();
    gain.gain.value = 0.3;
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start(now);
    noise.stop(now + duration_s);
  }
  
  /**
   * Low rumble (earthquakes, volcanos, thunder)
   */
  private generateRumble(baseFreq_Hz: number, duration_s: number): void {
    const now = this.audioContext.currentTime;
    
    const osc = this.audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = baseFreq_Hz;
    
    // Random modulation
    const lfo = this.audioContext.createOscillator();
    lfo.frequency.value = 0.5; // Slow random variation
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = baseFreq_Hz * 0.1;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.2);
    gain.gain.linearRampToValueAtTime(0, now + duration_s);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    lfo.start(now);
    osc.stop(now + duration_s);
    lfo.stop(now + duration_s);
  }
  
  /**
   * Environmental ambience
   * Wind, water, rustling - from environment properties
   */
  generateEnvironmentAmbience(
    windSpeed_ms: number,
    rainfall_mm: number,
    vegetation: number
  ): void {
    const now = this.audioContext.currentTime;
    
    // Wind noise (filtered white noise)
    if (windSpeed_ms > 1) {
      const noise = this.createWhiteNoise(10); // 10 seconds
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 200 + windSpeed_ms * 50; // Frequency from wind speed
      
      const gain = this.audioContext.createGain();
      gain.gain.value = Math.min(0.3, windSpeed_ms / 20);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
    }
    
    // Rain patter (random impulses)
    if (rainfall_mm > 0) {
      const rainDensity = rainfall_mm / 100; // Impacts per second
      this.generateRainPattern(rainDensity, 10);
    }
    
    // Rustling (if vegetation)
    if (vegetation > 0.3) {
      const rustle = this.createWhiteNoise(10);
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2000; // High frequency rustle
      filter.Q.value = 0.5;
      
      const gain = this.audioContext.createGain();
      gain.gain.value = vegetation * 0.1;
      
      rustle.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      rustle.start(now);
    }
  }
  
  /**
   * Create white noise source
   */
  private createWhiteNoise(duration_s: number): AudioBufferSourceNode {
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration_s, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    
    return source;
  }
  
  /**
   * Rain impact pattern
   */
  private generateRainPattern(impactsPerSecond: number, duration_s: number): void {
    const now = this.audioContext.currentTime;
    const totalImpacts = impactsPerSecond * duration_s;
    
    for (let i = 0; i < totalImpacts; i++) {
      const time = now + Math.random() * duration_s;
      
      // Single raindrop impact
      const osc = this.audioContext.createOscillator();
      osc.frequency.value = 2000 + Math.random() * 1000; // 2-3 kHz
      
      const gain = this.audioContext.createGain();
      gain.gain.setValueAtTime(0.05, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(time);
      osc.stop(time + 0.05);
    }
  }
}

export const ProceduralAudio = {
  /**
   * Generate sound from object properties
   */
  synthesize: (
    objectType: 'creature' | 'environment' | 'cosmic' | 'tool',
    properties: any
  ): AudioBuffer | null => {
    // Will be implemented with actual synthesis
    return null;
  },
};

