/**
 * Cosmic Sonification
 * 
 * Space is SILENT (no medium for sound).
 * But we TRANSLATE physical processes to audio as data sonification.
 * 
 * This is what NASA does with spacecraft data:
 * - Plasma waves → Audio frequencies
 * - Magnetosphere vibrations → Tones
 * - Particle flux → Whooshes
 * 
 * We acknowledge this is TRANSLATION, not literal sound.
 */

import { StellarLaws } from '../laws/stellar';
import { RadiationLaws } from '../laws/02-planetary/radiation';

export class CosmicSonification {
  private audioContext: AudioContext;
  private masterGain: GainNode;
  
  constructor() {
    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.audioContext.destination);
  }
  
  /**
   * STELLAR FUSION → Deep drone
   * 
   * NOT sound in space! 
   * TRANSLATION: Fusion power output → Audio frequency
   * 
   * Massive stars (high power) → Higher frequency drone
   * Small stars (low power) → Lower frequency drone
   */
  sonicateStellarFusion(
    stellarMass_Msun: number,
    stellarAge_Gyr: number
  ): void {
    const luminosity = StellarLaws.mainSequence.luminosity(stellarMass_Msun);
    
    // TRANSLATION: Log(luminosity) → Frequency
    // 0.001 L☉ (red dwarf) → 30 Hz
    // 1.0 L☉ (sun) → 50 Hz
    // 100 L☉ (massive) → 80 Hz
    const baseFreq = 30 + 20 * Math.log10(luminosity + 0.001);
    
    const osc = this.audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = baseFreq;
    
    // Modulation from stellar activity
    const activityLevel = stellarAge_Gyr < 1 ? 0.5 : 0.1; // Young = active
    const lfo = this.audioContext.createOscillator();
    lfo.frequency.value = 0.2; // Slow pulsation
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = baseFreq * activityLevel;
    
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    
    const gain = this.audioContext.createGain();
    gain.gain.value = 0.15;
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    lfo.start();
    
    console.log(`[Sonification] Stellar fusion: ${stellarMass_Msun.toFixed(3)}M☉ → ${baseFreq.toFixed(1)}Hz drone`);
    console.log(`[Sonification] (Translation: Energy output → Audible frequency)`);
  }
  
  /**
   * COSMIC MICROWAVE BACKGROUND → Static/hum
   * 
   * CMB temperature: 2.725K → Microwave frequencies
   * TRANSLATION: Temperature → Audible noise spectrum
   */
  sonificationCMB(): void {
    // White noise (represents random fluctuations in CMB)
    const noise = this.createWhiteNoise(60); // 60s loop
    
    // Filter to low frequencies (deep hum)
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 100; // Very low
    filter.Q.value = 0.5;
    
    const gain = this.audioContext.createGain();
    gain.gain.value = 0.05; // Subtle
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start();
    
    console.log('[Sonification] CMB: 2.725K → Low frequency hum');
    console.log('[Sonification] (Translation: Cosmic background radiation → Ambient tone)');
  }
  
  /**
   * SOLAR WIND → Particle flux whoosh
   * 
   * TRANSLATION: Particle density + velocity → Noise intensity
   */
  sonificationSolarWind(
    particleDensity_perM3: number,
    velocity_ms: number
  ): void {
    // Noise burst modulated by particle flux
    const noise = this.createWhiteNoise(30);
    
    // High-pass filter (wind-like)
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 500 + velocity_ms / 1000; // Frequency from velocity
    
    // Gain from particle density
    const gain = this.audioContext.createGain();
    const intensity = Math.min(0.3, particleDensity_perM3 / 1e7);
    gain.gain.value = intensity;
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start();
    
    console.log(`[Sonification] Solar wind: ${velocity_ms}km/s → Whoosh at ${filter.frequency.value.toFixed(0)}Hz`);
    console.log('[Sonification] (Translation: Particle flux → Noise intensity)');
  }
  
  /**
   * GRAVITATIONAL WAVES → Chirp
   * 
   * Like LIGO detection!
   * TRANSLATION: Frequency sweep from orbital decay
   */
  sonifyGravitationalWave(
    initialFreq_Hz: number,
    finalFreq_Hz: number,
    duration_s: number
  ): void {
    const now = this.audioContext.currentTime;
    
    const osc = this.audioContext.createOscillator();
    osc.frequency.setValueAtTime(initialFreq_Hz, now);
    osc.frequency.exponentialRampToValueAtTime(finalFreq_Hz, now + duration_s);
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5, now + duration_s * 0.9);
    gain.gain.linearRampToValueAtTime(0, now + duration_s);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + duration_s);
    
    console.log(`[Sonification] Gravitational wave: ${initialFreq_Hz}Hz → ${finalFreq_Hz}Hz chirp`);
    console.log('[Sonification] (Translation: Spacetime ripples → Audible sweep)');
  }
  
  /**
   * PLANETARY ATMOSPHERE → REAL sound begins!
   * 
   * Once we're in atmosphere, sound is ACTUAL physics, not translation.
   */
  atmosphericSoundBegins(
    atmosphericPressure_Pa: number,
    composition: Record<string, number>,
    temperature_K: number
  ): void {
    console.log('\n[Audio] ENTERING ATMOSPHERE - Real sound physics now active!');
    console.log(`[Audio] Pressure: ${(atmosphericPressure_Pa / 101325).toFixed(2)} atm`);
    console.log(`[Audio] Composition: ${JSON.stringify(composition)}`);
    console.log(`[Audio] Speed of sound: ${this.calculateSoundSpeed(composition, temperature_K).toFixed(0)} m/s`);
    console.log('[Audio] Sound is now REAL, not sonified.\n');
    
    // Fade out cosmic sonification
    this.fadeOutCosmicAmbience();
    
    // Begin atmospheric sounds (wind, rain, animals - real physics!)
  }
  
  /**
   * Calculate actual speed of sound in this atmosphere
   */
  private calculateSoundSpeed(composition: Record<string, number>, temp_K: number): number => {
    // Weighted average of molar masses
    const molarMasses: Record<string, number> = {
      N2: 28,
      O2: 32,
      CO2: 44,
      Ar: 40,
    };
    
    let avgMolarMass = 0;
    for (const [gas, fraction] of Object.entries(composition)) {
      avgMolarMass += (molarMasses[gas] || 29) * fraction;
    }
    
    const gamma = 1.4; // Diatomic gas
    const R = 8.314;
    
    return Math.sqrt((gamma * R * temp_K) / (avgMolarMass / 1000));
  }
  
  /**
   * Fade out cosmic ambience
   */
  private fadeOutCosmicAmbience(): void {
    const now = this.audioContext.currentTime;
    this.masterGain.gain.linearRampToValueAtTime(0, now + 2); // 2s fade
  }
  
  /**
   * Helper: White noise
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
}

/**
 * Audio Mode System
 * 
 * SPACE: Sonification (translation of physics)
 * ATMOSPHERE: Real sound (acoustic physics)
 */
export class AudioModeSystem {
  private cosmic: CosmicSonification;
  private inAtmosphere: boolean = false;
  
  constructor() {
    this.cosmic = new CosmicSonification();
  }
  
  /**
   * Switch modes based on zoom level
   */
  updateMode(cameraDistance_m: number, nearestPlanet: any): void {
    const inAtmosphereNow = cameraDistance_m < 100000 && nearestPlanet?.atmosphere;
    
    if (!this.inAtmosphere && inAtmosphereNow) {
      // TRANSITION: Sonification → Real sound
      console.log('\n═══════════════════════════════════════');
      console.log('  AUDIO MODE: COSMIC → ATMOSPHERIC');
      console.log('═══════════════════════════════════════');
      
      this.cosmic.atmosphericSoundBegins(
        nearestPlanet.atmosphere.pressure,
        nearestPlanet.atmosphere.composition,
        nearestPlanet.surfaceTemp
      );
      
      this.inAtmosphere = true;
    } else if (this.inAtmosphere && !inAtmosphereNow) {
      // TRANSITION: Real sound → Sonification
      console.log('\n═══════════════════════════════════════');
      console.log('  AUDIO MODE: ATMOSPHERIC → COSMIC');
      console.log('═══════════════════════════════════════');
      console.log('[Audio] Leaving atmosphere - resuming cosmic sonification\n');
      
      this.inAtmosphere = false;
    }
  }
}

