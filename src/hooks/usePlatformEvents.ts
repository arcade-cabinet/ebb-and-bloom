/**
 * Platform Events Hook - Initializes event listeners for platform adaptation
 * Listens to resize, orientation, and input changes
 * Based on Grok conversation recommendations
 */

import { useEffect } from 'react';
import { useEvolutionDataStore } from '../stores/EvolutionDataStore';
import { Capacitor } from '@capacitor/core';
import { log } from '../utils/Logger';
import type { PlatformEvent } from '../stores/EvolutionDataStore';

/**
 * Hook to initialize platform event listeners
 * Should be called once in App.tsx
 */
export function usePlatformEvents() {
  const dispatchPlatformEvent = useEvolutionDataStore((state) => state.dispatchPlatformEvent);
  const setInputMode = useEvolutionDataStore((state) => state.setInputMode);
  const updateScreen = useEvolutionDataStore((state) => state.updateScreen);

  useEffect(() => {
    log.info('Initializing platform event listeners');
    
    // Platform init
    dispatchPlatformEvent({ type: 'platform', data: null, timestamp: Date.now() });

    // Resize/orientation handler
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      updateScreen(width, height);
      dispatchPlatformEvent({
        type: 'resize',
        data: { width, height },
        timestamp: Date.now(),
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    // Orientation listener (mobile-focused)
    // Note: ScreenOrientation plugin requires Capacitor 7+, using window.orientation as fallback
    if (Capacitor.isNativePlatform() && typeof window !== 'undefined') {
      const handleOrientationChange = () => {
        const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
        dispatchPlatformEvent({
          type: 'orientation',
          data: { orientation },
          timestamp: Date.now(),
        });
      };
      
      window.addEventListener('orientationchange', handleOrientationChange);
      window.addEventListener('resize', handleOrientationChange);
      
      return () => {
        window.removeEventListener('orientationchange', handleOrientationChange);
        window.removeEventListener('resize', handleOrientationChange);
      };
    }

    // Input detection (switch on first touch/keydown)
    const handleTouchStart = () => {
      setInputMode('touch');
      document.removeEventListener('touchstart', handleTouchStart);
    };

    const handleKeyDown = () => {
      setInputMode('keyboard');
      document.removeEventListener('keydown', handleKeyDown);
    };

    const handleMouseMove = () => {
      setInputMode('mouse');
      document.removeEventListener('mousemove', handleMouseMove);
    };

    // Gamepad detection
    const handleGamepadConnected = () => {
      setInputMode('gamepad');
    };

    document.addEventListener('touchstart', handleTouchStart, { once: true });
    document.addEventListener('keydown', handleKeyDown, { once: true });
    document.addEventListener('mousemove', handleMouseMove, { once: true });
    window.addEventListener('gamepadconnected', handleGamepadConnected);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
    };
  }, [dispatchPlatformEvent, setInputMode, updateScreen]);
}

