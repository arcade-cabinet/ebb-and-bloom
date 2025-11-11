import { useEffect, useState } from 'react';
import { SceneManager } from '../scenes/SceneManager';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useRef } from 'react';
import { LoadingOverlay } from '../ui/LoadingOverlay';
import * as THREE from 'three';

const sceneManager = SceneManager.getInstance();

export function RenderLayer() {
  const [scenes, setScenes] = useState<any[]>(sceneManager.getScenes());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const unsubscribe = sceneManager.onSceneChange(() => {
      setScenes([...sceneManager.getScenes()]);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Limit frame rate to 60fps to reduce memory pressure
    let lastFrameTime = 0;
    const targetFrameTime = 1000 / 60;

    const frameThrottle = (callback: FrameRequestCallback) => {
      return (time: number) => {
        if (time - lastFrameTime >= targetFrameTime) {
          lastFrameTime = time;
          callback(time);
        }
      };
    };

    const handleUpdate = () => {
      sceneManager.update(0.016);
    };

    const animationFrame = requestAnimationFrame(frameThrottle(function loop(time) {
      handleUpdate();
      requestAnimationFrame(loop);
    }));

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrame);
      // Force dispose all Three.js resources
      if (canvasRef.current) {
        const gl = (canvasRef.current as any).__THREE__;
        if (gl?.renderer) {
          gl.renderer.dispose();
          gl.renderer.forceContextLoss();
        }
      }

      // Clear all cached geometries and materials
      THREE.Cache.clear();
    };
  }, []);

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
      <Canvas
        ref={canvasRef}
        shadows
        camera={{ position: [0, 5, 10], fov: 75 }}
        frameloop="demand" // Only render when needed
        dpr={[1, 2]} // Limit pixel ratio
        gl={{
          antialias: false, // Reduce memory usage
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none' // Make canvas non-interactive by default
        }}
      >
        <Suspense fallback={null}>
          {/* Scene content will be injected by SceneManager */}
        </Suspense>
      </Canvas>
    </div>
  );
}