import { useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { StageDirector, FMVStage } from './StageDirector';
import { BigBangStage } from './stages/BigBangStage';
import { SplashScreen } from './stages/SplashScreen';
import { PlanetaryAccretionStage } from './stages/PlanetaryAccretionStage';
import { GyroscopeCamera } from './components/GyroscopeCamera';
import { LoadingOverlay } from './components/LoadingOverlay';
import { FPSCounter } from './components/FPSCounter';
import { CosmicAudioSonification } from '../../../engine/audio/cosmic/CosmicAudioSonification';
import { CosmicHapticFeedback } from '../../../engine/haptics/CosmicHapticFeedback';
import { useGameState } from '../../state/GameState';
import * as THREE from 'three';

interface IconicIntroProps {
  onComplete?: () => void;
  skipIntro?: boolean;
}

export function IconicIntro({ onComplete, skipIntro = false }: IconicIntroProps) {
  const [currentStage, setCurrentStage] = useState<FMVStage>('bigbang');
  const [isInitializing, setIsInitializing] = useState(true);
  const getScopedRNG = useGameState((state) => state.getScopedRNG);

  const director = useMemo(() => new StageDirector(), []);

  const audioSystem = useMemo(() => {
    const rng = getScopedRNG('fmv-audio');
    return new CosmicAudioSonification(rng);
  }, [getScopedRNG]);

  const hapticSystem = useMemo(() => {
    const rng = getScopedRNG('fmv-haptics');
    return new CosmicHapticFeedback(rng);
  }, [getScopedRNG]);

  useEffect(() => {
    const initialize = async () => {
      try {
        await Promise.all([
          audioSystem.initialize(),
          hapticSystem.initialize(),
        ]);
      } catch (error) {
        console.warn('Initialization warning:', error);
      } finally {
        setTimeout(() => setIsInitializing(false), 500);
      }
    };

    initialize();
  }, [audioSystem, hapticSystem]);

  useEffect(() => {
    if (skipIntro) {
      director.transitionTo('complete');
      if (onComplete) onComplete();
      return;
    }

    const unsubscribe = director.onStageChange((stage) => {
      setCurrentStage(stage);
      
      if (stage === 'complete' && onComplete) {
        onComplete();
      }
    });

    return () => {
      unsubscribe();
      audioSystem.stopAll();
      hapticSystem.stopAll();
    };
  }, [director, skipIntro, onComplete, audioSystem, hapticSystem]);

  const handleStageComplete = () => {
    director.nextStage();
  };

  if (isInitializing) {
    return <LoadingOverlay text="Initializing cosmic genesis..." />;
  }

  if (skipIntro || currentStage === 'complete') {
    return null;
  }

  if (currentStage === 'splash') {
    return (
      <SplashScreen
        onComplete={handleStageComplete}
        duration={director.getStageDuration('splash')}
      />
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ 
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#0a0a1a'));
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
      >
        <Suspense fallback={null}>
          <GyroscopeCamera 
            enabled={currentStage !== 'splash'} 
            sensitivity={0.4}
            smoothing={0.2}
            maxTilt={0.25}
          />
          
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          
          {currentStage === 'bigbang' && (
            <BigBangStage
              onComplete={handleStageComplete}
              duration={director.getStageDuration('bigbang')}
              audioSystem={audioSystem}
              hapticSystem={hapticSystem}
            />
          )}
          
          {currentStage === 'accretion' && (
            <PlanetaryAccretionStage
              onComplete={handleStageComplete}
              duration={director.getStageDuration('accretion')}
              audioSystem={audioSystem}
              hapticSystem={hapticSystem}
            />
          )}
          <FPSCounter />
        </Suspense>
      </Canvas>
      
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: '0.9rem',
        opacity: 0.6,
        textAlign: 'center',
      }}>
        <div>Stage: {currentStage.toUpperCase()}</div>
        <div style={{ marginTop: '0.5rem' }}>
          Progress: {Math.round(director.getStageProgress() * 100)}%
        </div>
      </div>
    </div>
  );
}
