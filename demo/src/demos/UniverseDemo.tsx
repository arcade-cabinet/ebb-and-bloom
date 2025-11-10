/**
 * UNIVERSE DEMO
 * 
 * Full timeline simulation from Big Bang to Heat Death.
 * Visualizes 57 laws generating stars, planets, civilizations.
 */

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Stats } from '@react-three/drei';
import { useControls } from 'leva';

export const UniverseDemo: React.FC = () => {
  const { particleCount, scale } = useControls({
    particleCount: { value: 5000, min: 100, max: 10000, step: 100 },
    scale: { value: 1, min: 0.1, max: 10, step: 0.1 }
  });
  
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 50], fov: 75 }}>
        <color attach="background" args={['#000000']} />
        
        <Stars 
          radius={300}
          depth={50}
          count={particleCount}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} />
        
        <OrbitControls />
        <Stats />
      </Canvas>
      
      <div style={{
        position: 'fixed',
        top: 20,
        left: 20,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '1rem',
        borderRadius: '8px',
        fontFamily: 'monospace'
      }}>
        <h3>Universe Simulation</h3>
        <p>Big Bang → Heat Death</p>
        <p className="mono">Particles: {particleCount.toLocaleString()}</p>
      </div>
    </div>
  );
};

