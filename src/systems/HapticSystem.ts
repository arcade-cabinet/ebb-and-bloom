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
  SNAP_HARMONY: { style: 'light' as ImpactStyle, duration: 50 },
  SNAP_CONQUEST: { style: 'medium' as ImpactStyle, duration: 100 },
  SNAP_FROLICK: { style: 'light' as ImpactStyle, duration: 30 },
  
  // World shocks
  SHOCK_WHISPER: { style: 'medium' as ImpactStyle, duration: 150 },
  SHOCK_TEMPEST: { style: 'heavy' as ImpactStyle, duration: 300 },
  SHOCK_COLLAPSE: { style: 'heavy' as ImpactStyle, duration: 500 },
  
  // Pack events
  PACK_FORM: { style: 'light' as ImpactStyle, duration: 80 },
  PACK_ALLY: { style: 'light' as ImpactStyle, duration: 100 },
  PACK_RIVAL: { style: 'medium' as ImpactStyle, duration: 120 },
  PACK_RETURN: { style: 'light' as ImpactStyle, duration: 60 },
  
  // Combat
  COMBAT_HIT: { style: 'medium' as ImpactStyle, duration: 70 },
  COMBAT_SURGE: { style: 'heavy' as ImpactStyle, duration: 200 },
  COMBAT_VICTORY: { style: 'light' as ImpactStyle, duration: 150 },
  
  // Trait inheritance
  TRAIT_INHERIT: { style: 'light' as ImpactStyle, duration: 90 },
  
  // Resource collection
  RESOURCE_COLLECT: { style: 'light' as ImpactStyle, duration: 40 }
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
        style = pattern.style === 'light' ? 'medium' : 'heavy';
      } else if (playstyle.harmony > 0.6) {
        // Harmony players get gentler haptics
        style = pattern.style === 'heavy' ? 'medium' : 'light';
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
    progress < 0.3 ? 'light' : 
    progress < 0.7 ? 'medium' : 'heavy';
  
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
      { delay: 0, style: 'light' },
      { delay: 100, style: 'light' }
    ]);
  } else {
    // Long warning pulse
    await playHapticSequence([
      { delay: 0, style: 'medium' },
      { delay: 200, style: 'medium' }
    ]);
  }
}

/**
 * Crescendo pattern for catalyst assembly (splash screen)
 */
export async function playCrescendo(): Promise<void> {
  await playHapticSequence([
    { delay: 0, style: 'light' },
    { delay: 300, style: 'light' },
    { delay: 600, style: 'medium' },
    { delay: 900, style: 'medium' },
    { delay: 1200, style: 'heavy' }
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
        { delay: 0, style: 'light' },
        { delay: 150, style: 'medium' }
      ]);
      break;
      
    case 'tempest':
      await playHapticSequence([
        { delay: 0, style: 'medium' },
        { delay: 100, style: 'medium' },
        { delay: 200, style: 'heavy' },
        { delay: 400, style: 'heavy' }
      ]);
      break;
      
    case 'collapse':
      await playHapticSequence([
        { delay: 0, style: 'heavy' },
        { delay: 100, style: 'heavy' },
        { delay: 200, style: 'heavy' },
        { delay: 300, style: 'medium' },
        { delay: 500, style: 'light' }
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
