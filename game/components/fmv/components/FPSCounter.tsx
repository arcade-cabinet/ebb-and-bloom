import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

export function FPSCounter() {
  const [fps, setFps] = useState(60);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useFrame(() => {
    frameCountRef.current++;
    const currentTime = performance.now();
    const elapsed = currentTime - lastTimeRef.current;

    if (elapsed >= 1000) {
      const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
      setFps(currentFps);
      frameCountRef.current = 0;
      lastTimeRef.current = currentTime;
    }
  });

  if (typeof import.meta.env === 'undefined' || !import.meta.env.DEV) {
    return null;
  }

  const color = fps >= 55 ? '#00ff00' : fps >= 30 ? '#ffaa00' : '#ff0000';

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        padding: '8px 12px',
        background: 'rgba(0, 0, 0, 0.7)',
        color,
        fontFamily: 'monospace',
        fontSize: '14px',
        fontWeight: 'bold',
        borderRadius: '4px',
        border: `2px solid ${color}`,
        zIndex: 10000,
        pointerEvents: 'none',
      }}
    >
      {fps} FPS
    </div>
  );
}
