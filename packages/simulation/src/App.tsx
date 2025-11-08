/**
 * Main App Component - GEN0 Planetary Visualization
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { PlanetSphere } from './components/PlanetSphere';
import { useGen0Data } from './hooks/useGen0Data';

export function App() {
  const gen0Data = useGen0Data();

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Stars radius={300} depth={50} count={5000} factor={4} />
        <Environment preset="night" />
        
        {gen0Data && (
          <PlanetSphere gen0Data={gen0Data} />
        )}
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
        />
      </Canvas>
      
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: 'white',
        fontFamily: 'monospace',
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '5px',
      }}>
        <h2>GEN0: Planetary Genesis</h2>
        {gen0Data && (
          <div>
            <p>Selected: {gen0Data.macro.selectedContext}</p>
            <p>Textures: {gen0Data.macro.visualBlueprint.representations.materials.join(', ')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

