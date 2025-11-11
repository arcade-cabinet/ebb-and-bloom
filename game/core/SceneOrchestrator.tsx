import { useEffect, useRef, ReactNode } from 'react';
import { SceneManager } from '../scenes/SceneManager';
import { MenuScene } from '../scenes/MenuScene';
import { IntroScene } from '../scenes/IntroScene';
import { GameplayScene } from '../scenes/GameplayScene';
import { PauseScene } from '../scenes/PauseScene';

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

  useEffect(() => {
    if (!initializedRef.current) {
      console.log('SceneOrchestrator: Initializing with menu scene');
      initializedRef.current = true;
      sceneManager.changeScene('menu');
    }
  }, []);

  return <>{children}</>;
}
