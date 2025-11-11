import { useEffect, useState } from 'react';
import { SceneManager } from '../scenes/SceneManager';
import { LoadingOverlay } from './LoadingOverlay';

const sceneManager = SceneManager.getInstance();

export function UIOverlay() {
  const [transitionState, setTransitionState] = useState(sceneManager.getTransitionState());

  useEffect(() => {
    const unsubscribe = sceneManager.onTransitionStateChange(() => {
      setTransitionState(sceneManager.getTransitionState());
    });

    return unsubscribe;
  }, []);

  const { fadeProgress, loadingMessage } = transitionState;

  return (
    <>
      {fadeProgress > 0 && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#000',
            opacity: fadeProgress,
            pointerEvents: 'none',
            zIndex: 9998,
          }}
        />
      )}

      <LoadingOverlay message={loadingMessage} show={!!loadingMessage} />
    </>
  );
}
