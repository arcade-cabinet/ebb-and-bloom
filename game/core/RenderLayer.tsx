import { useEffect, useState, useRef, Suspense } from 'react';
import { SceneManager } from '../scenes/SceneManager';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

const sceneManager = SceneManager.getInstance();

export function RenderLayer() {
  const [scenes, setScenes] = useState<any[]>(sceneManager.getScenes());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.Renderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);

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

    const animationFrame = requestAnimationFrame(frameThrottle(function loop(_time) {
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

      // Comprehensive cleanup
      if (sceneRef.current) {
        sceneRef.current.traverse((object: any) => {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material: any) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
          if (object.texture) {
            object.texture.dispose();
          }
        });
        sceneRef.current.clear();
      }

      if (rendererRef.current && 'dispose' in rendererRef.current) {
        (rendererRef.current as any).dispose();
        if ('forceContextLoss' in rendererRef.current) {
          (rendererRef.current as any).forceContextLoss();
        }
      }

      if (cameraRef.current) {
        cameraRef.current = null;
      }

      // Force garbage collection hint
      if ((window as any).gc) {
        (window as any).gc();
      }
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