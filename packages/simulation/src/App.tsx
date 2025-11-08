/**
 * Main App Component - GEN0 Planetary Visualization
 */

import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { PlanetSphere } from './components/PlanetSphere';
import { Moon } from './components/Moon';
import { useGen0RenderData } from './hooks/useGen0RenderData';

const API_BASE = 'http://localhost:3001';

export function App() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [seed, setSeed] = useState<string>('v1-test-world-seed');
  const [time, setTime] = useState(0);
  
  // Load Gen0 render data
  const { data: gen0Data, loading, error } = useGen0RenderData(gameId, time);
  
  // Create game on mount
  useEffect(() => {
    async function createGame() {
      try {
        const response = await fetch(`${API_BASE}/api/game/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seed }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to create game: ${response.statusText}`);
        }
        
        const result = await response.json();
        setGameId(result.gameId);
      } catch (err) {
        console.error('Failed to create game:', err);
      }
    }
    
    createGame();
  }, [seed]);
  
  // Animate time for moon orbital motion
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 1); // Advance 1 second per frame
    }, 100); // Update every 100ms
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        <Stars radius={300} depth={50} count={5000} factor={4} />
        <Environment preset="night" />
        
        {gen0Data && (
          <>
            <PlanetSphere
              planet={gen0Data.planet}
              visualBlueprint={gen0Data.visualBlueprint}
            />
            {gen0Data.moons.map((moon) => (
              <Moon
                key={moon.id}
                moon={moon}
                planetRadius={gen0Data.planet.radius}
              />
            ))}
          </>
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
        padding: '15px',
        borderRadius: '5px',
        fontSize: '14px',
      }}>
        <h2 style={{ margin: '0 0 10px 0' }}>GEN0: Planetary Genesis</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: '#ff4444' }}>Error: {error}</p>}
        {gen0Data && (
          <div>
            <p><strong>Stellar Context:</strong> {gen0Data.stellarContext}</p>
            <p><strong>Planet Radius:</strong> {(gen0Data.planet.radius / 1000).toFixed(0)} km</p>
            <p><strong>Rotation Period:</strong> {(gen0Data.planet.rotationPeriod / 3600).toFixed(1)} hours</p>
            <p><strong>Moons:</strong> {gen0Data.moons.length}</p>
            <p><strong>Textures:</strong> {gen0Data.visualBlueprint.textureReferences.join(', ') || 'None'}</p>
            <p><strong>Time:</strong> {time.toFixed(0)}s</p>
          </div>
        )}
      </div>
    </div>
  );
}
