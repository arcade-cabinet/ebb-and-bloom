/**
 * Acoustics Laws
 *
 * Sound propagation, frequency generation, vocal production.
 * From physics → procedural audio generation.
 */

export const SoundPropagation = {
  /**
   * Speed of sound in medium
   * v = √(γ × R × T / M)
   *
   * Where γ = adiabatic index, R = gas constant, T = temp, M = molar mass
   */
  speedOfSound_ms: (
    temperature_K: number,
    molarMass_gmol: number,
    gamma: number = 1.4 // Air (diatomic gas)
  ): number => {
    const R = 8.314; // J/(mol·K)
    return Math.sqrt((gamma * R * temperature_K) / (molarMass_gmol / 1000));
  },

  /**
   * Atmospheric absorption
   * High frequencies absorbed more than low
   *
   * Why thunder rumbles (high frequencies attenuated)
   */
  attenuationCoefficient_dBperM: (frequency_Hz: number, humidity: number): number => {
    // Simplified
    return (Math.pow(frequency_Hz / 1000, 2) * 0.01) / (1 + humidity);
  },

  /**
   * Max hearing distance
   */
  maxDistance_m: (
    sourceIntensity_dB: number,
    frequency_Hz: number,
    atmosphericDensity: number
  ): number => {
    const hearingThreshold_dB = 0;
    const attenuation = this.attenuationCoefficient_dBperM(frequency_Hz, 0.5) * atmosphericDensity;

    return (sourceIntensity_dB - hearingThreshold_dB) / attenuation;
  },

  /**
   * Doppler shift
   * f' = f × (v_sound + v_observer) / (v_sound + v_source)
   */
  dopplerShift_Hz: (
    originalFreq_Hz: number,
    sourceVelocity_ms: number,
    observerVelocity_ms: number,
    soundSpeed_ms: number
  ): number => {
    return (
      (originalFreq_Hz * (soundSpeed_ms + observerVelocity_ms)) /
      (soundSpeed_ms + sourceVelocity_ms)
    );
  },
};

export const VocalProduction = {
  /**
   * Formant frequencies from vocal tract
   * F_n = (2n - 1) × c / (4L)
   *
   * Where c = sound speed, L = vocal tract length
   */
  formantFrequency_Hz: (
    vocalTractLength_m: number,
    formantNumber: number,
    soundSpeed_ms: number = 343
  ): number => {
    return ((2 * formantNumber - 1) * soundSpeed_ms) / (4 * vocalTractLength_m);
  },

  /**
   * Vocal tract length from body size
   * Larger animals = deeper voices
   */
  vocalTractLength_m: (bodyLength_m: number): number => {
    return bodyLength_m * 0.15; // ~15% of body length
  },

  /**
   * Fundamental frequency (pitch)
   * f₀ = c / (2L) for vocal folds
   *
   * Smaller = higher pitch
   */
  fundamentalFrequency_Hz: (mass_kg: number): number => {
    // Empirical: f₀ ∝ M^(-0.4)
    return 500 * Math.pow(mass_kg, -0.4); // Hz
  },

  /**
   * Vowel from formants
   * Different formant combinations = different sounds
   */
  vowelFromFormants: (F1_Hz: number, F2_Hz: number): string => {
    // Simplified vowel space
    if (F1_Hz < 400 && F2_Hz > 2000) return 'ee'; // [i]
    if (F1_Hz < 400 && F2_Hz < 1000) return 'oo'; // [u]
    if (F1_Hz > 700 && F2_Hz < 1200) return 'ah'; // [ɑ]
    if (F1_Hz > 500 && F2_Hz > 1800) return 'ay'; // [æ]
    return 'uh'; // [ə] schwa
  },

  /**
   * Call loudness from lung capacity
   * Larger lungs = louder calls
   */
  maxIntensity_dB: (lungVolume_L: number): number => {
    // Empirical
    return 60 + 20 * Math.log10(lungVolume_L); // dB SPL
  },
};

export const AnimalSounds = {
  /**
   * Call type from function
   * Different purposes = different frequencies
   */
  callType: (purpose: string): { freq_Hz: number; duration_s: number } => {
    const calls: Record<string, { freq_Hz: number; duration_s: number }> = {
      alarm: { freq_Hz: 3000, duration_s: 0.1 }, // High, short (attention!)
      territorial: { freq_Hz: 200, duration_s: 2.0 }, // Low, long (presence)
      mating: { freq_Hz: 1000, duration_s: 0.5 }, // Medium, repeated
      distress: { freq_Hz: 4000, duration_s: 0.2 }, // Very high, urgent
      contact: { freq_Hz: 800, duration_s: 0.3 }, // Medium, brief
    };
    return calls[purpose] || calls.contact;
  },

  /**
   * Frequency modulation (vibrato, tremolo)
   * Living sounds fluctuate
   */
  modulationDepth_Hz: (emotionalArousal: number): number => {
    return 5 + emotionalArousal * 20; // Hz deviation
  },

  /**
   * Harmonics (overtones)
   * Fundamental + integer multiples
   */
  harmonics: (fundamental_Hz: number, count: number): number[] => {
    return Array.from({ length: count }, (_, i) => fundamental_Hz * (i + 1));
  },
};

export const Resonance = {
  /**
   * Resonant frequency of cavity
   * f = c / (2L) for closed-closed pipe
   */
  cavityResonance_Hz: (length_m: number, soundSpeed_ms: number = 343): number => {
    return soundSpeed_ms / (2 * length_m);
  },

  /**
   * Q factor (sharpness of resonance)
   * Higher Q = more "ringy" sound
   */
  qualityFactor: (resonantFreq_Hz: number, bandwidth_Hz: number): number => {
    return resonantFreq_Hz / bandwidth_Hz;
  },
};

export const AcousticsLaws = {
  propagation: SoundPropagation,
  vocal: VocalProduction,
  animalSounds: AnimalSounds,
  resonance: Resonance,
} as const;
