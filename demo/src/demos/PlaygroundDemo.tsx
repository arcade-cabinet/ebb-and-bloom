/**
 * PLAYGROUND DEMO
 * 
 * Interactive law visualization.
 * Test individual laws with sliders and see results in real-time.
 */

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { useControls } from 'leva';
import { calculateGravity } from '../../../engine/laws/physics';

export const PlaygroundDemo: React.FC = () => {
  const { mass1, mass2, distance } = useControls('Gravity Law', {
    mass1: { value: 1e24, min: 1e20, max: 1e30, step: 1e23 },
    mass2: { value: 1e24, min: 1e20, max: 1e30, step: 1e23 },
    distance: { value: 1e6, min: 1e3, max: 1e9, step: 1e5 }
  });
  
  const force = calculateGravity(mass1, mass2, distance);
  
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <color attach="background" args={['#0a0e1a']} />
        
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        <OrbitControls />
        <Stats />
      </Canvas>
      
      <div style={{
        position: 'fixed',
        top: 20,
        right: 20,
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        fontFamily: 'monospace',
        minWidth: '300px'
      }}>
        <h3>Law Playground</h3>
        <hr style={{ margin: '1rem 0', opacity: 0.2 }} />
        <p><strong>Gravity Law</strong></p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Force = G × (m₁ × m₂) / r²
        </p>
        <hr style={{ margin: '1rem 0', opacity: 0.2 }} />
        <p style={{ color: '#3b82f6', fontSize: '1.25rem', marginTop: '1rem' }}>
          F = {force.toExponential(2)} N
        </p>
      </div>
    </div>
  );
};

