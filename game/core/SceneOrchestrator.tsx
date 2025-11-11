import { useEffect, useRef, ReactNode, useState } from 'react';
import { SceneManager } from '../scenes/SceneManager';
import { MenuScene } from '../scenes/MenuScene';
import { IntroScene } from '../scenes/IntroScene';
import { GameplayScene } from '../scenes/GameplayScene';
import { PauseScene } from '../scenes/PauseScene';

// Define SceneType for clarity
type SceneType = 'menu' | 'intro' | 'gameplay' | 'pause';

const sceneManager = SceneManager.getInstance();

sceneManager.registerScene('menu', MenuScene);
sceneManager.registerScene('intro', IntroScene);
sceneManager.registerScene('gameplay', GameplayScene);
sceneManager.registerScene('pause', PauseScene);

interface SceneOrchestratorProps {
  children: ReactNode;
}

export function SceneOrchestrator({ children }: SceneOrchestratorProps) {
  const initializedRef = useRef(false);

  // This useEffect is responsible for the initial scene change.
  // It should not be removed as it ensures the application starts with the correct scene.
  useEffect(() => {
    if (!initializedRef.current) {
      console.log('SceneOrchestrator: Initializing with menu scene');
      initializedRef.current = true;
      sceneManager.changeScene('menu');
    }
  }, []);

  // The following state and return statement were part of a different approach (component-based scene rendering).
  // Given the existing sceneManager implementation, this part is redundant and has been replaced.
  // The original SceneManager.changeScene is the intended way to switch scenes.

  // Aggressive cleanup effect
  useEffect(() => {
    const cleanup = () => {
      // Clear all intervals/timeouts
      const highestId = window.setTimeout(() => {}, 0);
      for (let i = 0; i < highestId; i++) {
        window.clearTimeout(i);
        window.clearInterval(i);
      }

      // Force garbage collection hint
      if ((window as any).gc) {
        (window as any).gc();
      }

      // Request browser to release memory
      if ((performance as any).memory) {
        console.log('Memory before cleanup:', (performance as any).memory.usedJSHeapSize / 1048576, 'MB');
      }
    };

    // Cleanup every 30 seconds
    const cleanupInterval = setInterval(cleanup, 30000);

    return () => {
      clearInterval(cleanupInterval);
      cleanup();
    };
  }, []);

  // The SceneOrchestrator component itself doesn't render scenes directly based on state.
  // It acts as a container and initializer for the SceneManager.
  // Therefore, its return statement should simply render its children.
  return <>{children}</>;
}