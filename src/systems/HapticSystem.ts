/**
 * Enhanced Haptic Feedback System
 * From docs/07-mobileUX.md
 * 
 * Haptics as "world pulse" - light for harmony, heavy for conquest
 * Different patterns for snaps, shocks, combat, and pack events
 */

import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Haptic patterns for different game events
export const HAPTIC_PATTERNS = {
  // Resource snapping
  SNAP_HARMONY: { style: ImpactStyle.Light as ImpactStyle, duration: 50 },
  SNAP_CONQUEST: { style: ImpactStyle.Medium as ImpactStyle, duration: 100 },
  SNAP_FROLICK: { style: ImpactStyle.Light as ImpactStyle, duration: 30 },
  
  // World shocks
  SHOCK_WHISPER: { style: ImpactStyle.Medium as ImpactStyle, duration: 150 },
  SHOCK_TEMPEST: { style: ImpactStyle.Heavy as ImpactStyle, duration: 300 },
  SHOCK_COLLAPSE: { style: ImpactStyle.Heavy as ImpactStyle, duration: 500 },
  
  // Pack events
  PACK_FORM: { style: ImpactStyle.Light as ImpactStyle, duration: 80 },
  PACK_ALLY: { style: ImpactStyle.Light as ImpactStyle, duration: 100 },
  PACK_RIVAL: { style: ImpactStyle.Medium as ImpactStyle, duration: 120 },
  PACK_RETURN: { style: ImpactStyle.Light as ImpactStyle, duration: 60 },
  
  // Combat
  COMBAT_HIT: { style: ImpactStyle.Medium as ImpactStyle, duration: 70 },
  COMBAT_SURGE: { style: ImpactStyle.Heavy as ImpactStyle, duration: 200 },
  COMBAT_VICTORY: { style: ImpactStyle.Light as ImpactStyle, duration: 150 },
  
  // Trait inheritance
  TRAIT_INHERIT: { style: ImpactStyle.Light as ImpactStyle, duration: 90 },
  
  // Resource collection
  RESOURCE_COLLECT: { style: ImpactStyle.Light as ImpactStyle, duration: 40 }
};

/**
 * Play haptic feedback based on game event
 * Automatically adjusts intensity based on playstyle
 */
export async function playHaptic(
  event: keyof typeof HAPTIC_PATTERNS,
  playstyle?: { harmony: number; conquest: number; frolick: number }
): Promise<void> {
  
  try {
    const pattern = HAPTIC_PATTERNS[event];
    
    // Adjust intensity based on playstyle
    let style = pattern.style;
    if (playstyle) {
      if (playstyle.conquest > 0.6) {
        // Conquest players get stronger haptics
        style = pattern.style === ImpactStyle.Light ? ImpactStyle.Medium : ImpactStyle.Heavy;
      } else if (playstyle.harmony > 0.6) {
        // Harmony players get gentler haptics
        style = pattern.style === ImpactStyle.Heavy ? ImpactStyle.Medium : ImpactStyle.Light;
      }
    }
    
    await Haptics.impact({ style });
  } catch (error) {
    // Haptics not supported on this device - silent fail
    console.debug('Haptics not supported:', error);
  }
}

/**
 * Play sequence of haptic pulses
 * For dramatic events (shocks, victories)
 */
export async function playHapticSequence(
  pulses: Array<{ delay: number; style: ImpactStyle }>
): Promise<void> {
  
  try {
    for (const pulse of pulses) {
      await new Promise(resolve => setTimeout(resolve, pulse.delay));
      await Haptics.impact({ style: pulse.style });
    }
  } catch (error) {
    console.debug('Haptics sequence failed:', error);
  }
}

/**
 * Building tension rumble for abyss reclamation
 */
export async function playTensionRumble(progress: number): Promise<void> {
  // Increasing intensity as progress grows
  const style: ImpactStyle = 
    progress < 0.3 ? ImpactStyle.Light : 
    progress < 0.7 ? ImpactStyle.Medium : ImpactStyle.Heavy;
  
  await playHaptic('SHOCK_WHISPER'); // Use a base pattern
}

/**
 * Heartbeat pattern for pack returns
 */
export async function playHeartbeat(
  type: 'bounty' | 'lash'
): Promise<void> {
  
  if (type === 'bounty') {
    // Short pulses
    await playHapticSequence([
      { delay: 0, style: ImpactStyle.Light },
      { delay: 100, style: ImpactStyle.Light }
    ]);
  } else {
    // Long warning pulse
    await playHapticSequence([
      { delay: 0, style: ImpactStyle.Medium },
      { delay: 200, style: ImpactStyle.Medium }
    ]);
  }
}

/**
 * Crescendo pattern for catalyst assembly (splash screen)
 */
export async function playCrescendo(): Promise<void> {
  await playHapticSequence([
    { delay: 0, style: ImpactStyle.Light },
    { delay: 300, style: ImpactStyle.Light },
    { delay: 600, style: ImpactStyle.Medium },
    { delay: 900, style: ImpactStyle.Medium },
    { delay: 1200, style: ImpactStyle.Heavy }
  ]);
}

/**
 * Shock rumble with escalation
 */
export async function playShockRumble(
  type: 'whisper' | 'tempest' | 'collapse'
): Promise<void> {
  
  switch (type) {
    case 'whisper':
      await playHapticSequence([
        { delay: 0, style: ImpactStyle.Light },
        { delay: 150, style: ImpactStyle.Medium }
      ]);
      break;
      
    case 'tempest':
      await playHapticSequence([
        { delay: 0, style: ImpactStyle.Medium },
        { delay: 100, style: ImpactStyle.Medium },
        { delay: 200, style: ImpactStyle.Heavy },
        { delay: 400, style: ImpactStyle.Heavy }
      ]);
      break;
      
    case 'collapse':
      await playHapticSequence([
        { delay: 0, style: ImpactStyle.Heavy },
        { delay: 100, style: ImpactStyle.Heavy },
        { delay: 200, style: ImpactStyle.Heavy },
        { delay: 300, style: ImpactStyle.Medium },
        { delay: 500, style: ImpactStyle.Light }
      ]);
      break;
  }
}

export const createHapticSystem = () => {
  return {
    playHaptic,
    playHapticSequence,
    playTensionRumble,
    playHeartbeat,
    playCrescendo,
    playShockRumble,
    HAPTIC_PATTERNS
  };
};
