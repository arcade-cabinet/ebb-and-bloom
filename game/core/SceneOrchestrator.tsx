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

// Define a type for scene instances that might have cleanup methods
type SceneInstance = {
  cleanup?: () => void;
  // other scene properties
};

interface SceneOrchestratorProps {
  children: ReactNode;
}

export function SceneOrchestrator({ children }: SceneOrchestratorProps) {
  const initializedRef = useRef(false);
  const currentSceneRef = useRef<SceneInstance | null>(null); // Ref to hold the current scene instance
  const [currentSceneName, setCurrentSceneName] = useState<SceneType | null>(null); // State to track the current scene name

  // This useEffect is responsible for the initial scene change.
  // It should not be removed as it ensures the application starts with the correct scene.
  useEffect(() => {
    if (!initializedRef.current) {
      console.log('SceneOrchestrator: Initializing with menu scene');
      initializedRef.current = true;
      // Fetch the initial scene instance and store it
      const initialScene = sceneManager.changeScene('menu');
      currentSceneRef.current = initialScene as SceneInstance;
      setCurrentSceneName('menu');
    }
  }, []);


  // Add event listener for scene changes initiated by SceneManager
  useEffect(() => {
    const handleSceneChange = () => {
      const currentScene = sceneManager.getCurrentScene();
      if (currentScene) {
        const sceneName = currentScene.constructor.name.replace('Scene', '').toLowerCase() as SceneType;
        if (sceneName !== currentSceneName) {
          setCurrentSceneName(sceneName);
        }
      }
    };

    // Subscribe to scene change events from SceneManager
    const unsubscribe = sceneManager.onSceneChange(handleSceneChange);

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
      // Also perform cleanup for the last active scene on unmount
      if (currentSceneRef.current?.cleanup) {
        console.log('SceneOrchestrator: Cleaning up last scene on unmount');
        currentSceneRef.current.cleanup();
      }
    };
  }, [currentSceneName]); // Depend on currentSceneName to re-subscribe if it changes

  // Aggressive cleanup effect (less critical now with explicit scene cleanup, but kept for safety)
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
        console.log('Memory before aggressive cleanup:', (performance as any).memory.usedJSHeapSize / 1048576, 'MB');
      }
    };

    // Cleanup every 30 seconds
    const cleanupInterval = setInterval(cleanup, 30000);

    return () => {
      clearInterval(cleanupInterval);
      cleanup(); // Ensure cleanup happens on unmount as well
    };
  }, []);

  // The SceneOrchestrator component itself doesn't render scenes directly based on state.
  // It acts as a container and initializer for the SceneManager.
  // Therefore, its return statement should simply render its children.
  return <>{children}</>;
}