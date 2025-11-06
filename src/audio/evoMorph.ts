// src/audio/evoMorph.ts
import { Capacitor } from '@capacitor/core';
import { Haptics } from '@capacitor/haptics';

class EvoMorphAudio {
  private ctx: AudioContext;
  private gain: GainNode;
  private isPlaying = false;

  constructor() {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.gain = this.ctx.createGain();
    this.gain.connect(this.ctx.destination);
  }

  // Burr Surge Morph: Grind to zap (heat + power)
  async burrSurge(duration = 1, intensity = 0.5) {
    if (this.isPlaying) this.stop();
    this.isPlaying = true;

    // Base grind: Square osc + noise scrape
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(150, this.ctx.currentTime);
    const noiseBuffer = this.createNoiseBuffer(0.5);
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 300;
    const gain1 = this.ctx.createGain();
    gain1.gain.setValueAtTime(0.4 * intensity, this.ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.15 * intensity, this.ctx.currentTime + 0.6);
    osc1.connect(gain1);
    noise.connect(filter).connect(gain1);
    gain1.connect(this.gain);
    osc1.start();
    noise.start();

    // Power zap twist: FM carrier + modulator
    const carrier = this.ctx.createOscillator();
    carrier.frequency.setValueAtTime(400, this.ctx.currentTime + 0.3);
    const modulator = this.ctx.createOscillator();
    modulator.frequency.setValueAtTime(80, this.ctx.currentTime + 0.3);
    modulator.connect(carrier.frequency); // FM burr
    const perlinJitter = (t: number) => 0.8 + 0.4 * Math.sin(t * 0.15 + Math.random() * Math.PI);
    carrier.frequency.setTargetAtTime(400 + perlinJitter(0) * 200, this.ctx.currentTime + 0.3, 0.1);
    const gain2 = this.ctx.createGain();
    gain2.gain.setValueAtTime(0.25 * intensity, this.ctx.currentTime + 0.3);
    gain2.gain.exponentialRampToValueAtTime(0.05 * intensity, this.ctx.currentTime + 1);
    carrier.connect(gain2).connect(this.gain);
    modulator.start(this.ctx.currentTime + 0.3);
    carrier.start(this.ctx.currentTime + 0.3);

    // Haptic sync: Grind rumble to zap forks
    const hapticInterval = setInterval(() => {
      if (!this.isPlaying) return;
      const envelope = (t: number) => 0.6 + 0.4 * Math.sin(t * 0.3 + Math.random() * Math.PI);
      const env = envelope(this.ctx.currentTime) * 0.5 * intensity; // 0-0.5g
      if (env > 0.3) {
        Haptics.impact({ style: ImpactStyle.Medium }); // Zap fork
      } else {
        Haptics.vibrate({ duration: 150 * env }); // Rumble build
      }
    }, 150); // 6.67Hz low-end sync

    setTimeout(() => this.stop(hapticInterval), duration * 1000);
  }

  private createNoiseBuffer(duration: number): AudioBuffer {
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
    return buffer;
  }

  private stop(interval?: NodeJS.Timeout) {
    this.isPlaying = false;
    if (interval) clearInterval(interval);
    this.gain.gain.setValueAtTime(0, this.ctx.currentTime);
  }

  // Tie to shader: Envelope feeds uniform
  getEnvelope(): number {
    return this.gain.gain.value;
  }
}

export const useEvoMorphAudio = () => new EvoMorphAudio();