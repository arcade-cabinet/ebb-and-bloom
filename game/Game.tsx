import { SceneOrchestrator } from './core/SceneOrchestrator';
import { RenderLayer } from './core/RenderLayer';
import { UIOverlay } from './ui/UIOverlay';
import { useEffect, useRef } from 'react';

export function Game() {
  const worldRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (worldRef.current) {
        // Clean up world resources
        worldRef.current = null;
      }

      // Clear any interval/timeout references
      if (typeof window !== 'undefined') {
        const highestId = window.setTimeout(() => {}, 0);
        for (let i = 0; i < highestId; i++) {
          window.clearTimeout(i);
        }
      }
    };
  }, []);

  return (
    <SceneOrchestrator ref={worldRef}>
      <RenderLayer />
      <UIOverlay />
    </SceneOrchestrator>
  );
}