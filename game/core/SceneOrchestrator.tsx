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

  // Cleanup effect to prevent memory leaks
  // This effect will run when the component unmounts or when `currentScene` changes.
  // It attempts to hint the garbage collector to free up memory.
  useEffect(() => {
    return () => {
      // Force garbage collection hint
      if (typeof window !== 'undefined' && (window as any).gc) {
        (window as any).gc();
      }
    };
  }, [/* currentScene */]); // Removed currentScene from dependency array as SceneManager is used for scene changes

  // The SceneOrchestrator component itself doesn't render scenes directly based on state.
  // It acts as a container and initializer for the SceneManager.
  // Therefore, its return statement should simply render its children.
  return <>{children}</>;
}