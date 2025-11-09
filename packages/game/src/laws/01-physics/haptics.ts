/**
 * Haptics Laws
 *
 * Force feedback, vibration, touch sensations.
 * From physics calculations → haptic output.
 */

export const ForceFeedback = {
  /**
   * Impact force from collision
   * F = Δp / Δt = m × Δv / Δt
   */
  impactForce_N: (mass_kg: number, velocityChange_ms: number, duration_s: number): number => {
    return (mass_kg * velocityChange_ms) / duration_s;
  },

  /**
   * Vibration intensity from force
   */
  vibrationIntensity_01: (force_N: number): number => {
    // Normalize to 0-1 range for haptic API
    return Math.min(1, force_N / 100); // 100N = max vibration
  },

  /**
   * Vibration frequency from material
   * Harder materials = higher frequency
   */
  vibrationFrequency_Hz: (materialHardness_mohs: number): number => {
    return 50 + materialHardness_mohs * 30; // 50-350 Hz range
  },

  /**
   * Haptic pattern from event type
   */
  patternFromEvent: (
    eventType: string
  ): { intensity: number; duration_ms: number; frequency_Hz: number } => {
    const patterns: Record<
      string,
      { intensity: number; duration_ms: number; frequency_Hz: number }
    > = {
      impact: { intensity: 0.8, duration_ms: 50, frequency_Hz: 200 },
      rumble: { intensity: 0.3, duration_ms: 500, frequency_Hz: 80 },
      click: { intensity: 0.4, duration_ms: 20, frequency_Hz: 150 },
      pulse: { intensity: 0.5, duration_ms: 100, frequency_Hz: 120 },
      earthquake: { intensity: 0.9, duration_ms: 2000, frequency_Hz: 60 },
    };
    return patterns[eventType] || patterns.click;
  },
};

export const TouchSensation = {
  /**
   * Surface texture from roughness
   * Smooth vs rough affects vibration when touched
   */
  textureVibration_Hz: (roughness_01: number): number => {
    // Rough surfaces produce higher frequency vibrations
    return 100 + roughness_01 * 200; // 100-300 Hz
  },

  /**
   * Temperature sensation
   * Hot/cold affects perceived touch
   */
  thermalFeedback: (temperature_K: number, skinTemp_K: number): number => {
    const delta = temperature_K - skinTemp_K;
    return Math.min(1, Math.abs(delta) / 50); // Intensity 0-1
  },
};

export const HapticsLaws = {
  force: ForceFeedback,
  touch: TouchSensation,
} as const;
