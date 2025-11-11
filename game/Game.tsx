import { useEffect, useState } from 'react';
import { SceneManager } from './scenes/SceneManager';
import { MenuScene } from './scenes/MenuScene';
import { IntroScene } from './scenes/IntroScene';
import { GameplayScene } from './scenes/GameplayScene';
import { PauseScene } from './scenes/PauseScene';

const sceneManager = SceneManager.getInstance();

sceneManager.registerScene('menu', MenuScene);
sceneManager.registerScene('intro', IntroScene);
sceneManager.registerScene('gameplay', GameplayScene);
sceneManager.registerScene('pause', PauseScene);

export function Game() {
  const [, setTick] = useState(0);
  
  useEffect(() => {
    sceneManager.changeScene('menu');
    
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 16);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const handleUpdate = () => {
      sceneManager.update(0.016);
    };
    
    const animationFrame = requestAnimationFrame(function loop() {
      handleUpdate();
      requestAnimationFrame(loop);
    });
    
    return () => cancelAnimationFrame(animationFrame);
  }, []);
  
  const scenes = sceneManager.getScenes();
  
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {scenes.map((scene, index) => (
        <div 
          key={index} 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: index === scenes.length - 1 ? 'auto' : 'none'
          }}
        >
          {scene.render()}
        </div>
      ))}
    </div>
  );
}
