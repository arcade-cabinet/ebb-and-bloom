/**
 * PLAYGROUND DEMO
 * 
 * Interactive governor visualization.
 * Watch governors control agent behavior in real-time.
 */

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { useControls } from 'leva';
import { EntityManager, Vehicle } from 'yuka';
import { GravityBehavior, MetabolismSystem } from '../../../engine/governors';

function GravityPlayground() {
  const managerRef = useRef<EntityManager>(new EntityManager());
  const agentsRef = useRef<Vehicle[]>([]);

  const { agentCount, gravityScale } = useControls('Gravity', {
    agentCount: { value: 10, min: 2, max: 50, step: 1 },
    gravityScale: { value: 1e10, min: 1e8, max: 1e12, step: 1e9 }
  });

  useEffect(() => {
    const manager = managerRef.current;
    manager.clear();
    agentsRef.current = [];

    // Spawn agents with gravity
    for (let i = 0; i < agentCount; i++) {
      const agent = new Vehicle();
      agent.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
      agent.mass = 1 + Math.random() * 5;
      agent.maxSpeed = 5;

      const gravity = new GravityBehavior();
      gravity.scale = gravityScale;
      agent.steering.add(gravity);

      manager.add(agent);
      agentsRef.current.push(agent);
    }
  }, [agentCount, gravityScale]);

  useFrame((state, delta) => {
    managerRef.current.update(delta);
  });

  return (
    <>
      {agentsRef.current.map((agent, i) => (
        <mesh key={i} position={[agent.position.x, agent.position.y, agent.position.z]}>
          <sphereGeometry args={[0.3 + agent.mass * 0.1, 12, 12]} />
          <meshStandardMaterial 
            color={`hsl(${(agent.mass / 6) * 360}, 70%, 60%)`}
            emissive={`hsl(${(agent.mass / 6) * 360}, 70%, 30%)`}
          />
        </mesh>
      ))}
    </>
  );
}

export const PlaygroundDemo: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 40], fov: 75 }}>
        <color attach="background" args={['#0a0e1a']} />
        
        <GravityPlayground />
        
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        
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
        <h3 style={{ margin: '0 0 10px 0' }}>Governor Playground</h3>
        <hr style={{ margin: '1rem 0', opacity: 0.2 }} />
        <p style={{ fontSize: '0.875rem' }}>
          <strong>Active:</strong> GravityBehavior
        </p>
        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.8 }}>
          Agents cluster via gravitational attraction.<br/>
          Larger spheres = more mass = stronger gravity.
        </p>
        <hr style={{ margin: '1rem 0', opacity: 0.2 }} />
        <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>
          Adjust sliders to see governors change behavior in real-time.
        </p>
      </div>
    </div>
  );
};
