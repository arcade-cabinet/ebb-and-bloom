/**
 * GOVERNORS DEMO
 * 
 * Demonstrates Yuka-native law implementation:
 * - Physics: Gravity, Orbit, Temperature
 * - Biological: Metabolism, Lifecycle, Reproduction
 * - Ecological: Flocking, Predator-Prey, Territorial
 * - Social: Hierarchy
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats, Html } from '@react-three/drei';
import { useRef, useEffect, useState } from 'react';
import { EntityManager, Vehicle } from 'yuka';
import { Vector3 } from 'three';

// Import governors
import {
  GravityBehavior,
  FlockingGovernor,
  PredatorPreyBehavior,
  HungerEvaluator,
  MetabolismSystem,
  LifecycleStateMachine,
  HierarchyBehavior,
  TemperatureBehavior
} from '../../../engine/governors';

interface AgentMesh {
  agent: Vehicle;
  position: [number, number, number];
  color: string;
  role?: string;
  name?: string;
}

function Scene() {
  const [agents, setAgents] = useState<AgentMesh[]>([]);
  const managerRef = useRef<EntityManager>(new EntityManager());
  const deltaRef = useRef<number>(0);
  const prevTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    const manager = managerRef.current;

    // Create predators
    for (let i = 0; i < 3; i++) {
      const predator = new Vehicle();
      predator.position.set(
        Math.random() * 100 - 50,
        5,
        Math.random() * 100 - 50
      );
      predator.maxSpeed = 8;
      predator.mass = 50;
      predator.role = 'predator';
      (predator as any).name = `Predator ${i + 1}`;
      (predator as any).energy = 100;
      (predator as any).maxEnergy = 100;

      // Add predator-prey behavior
      const predatorPreyBehavior = new PredatorPreyBehavior();
      predator.steering.add(predatorPreyBehavior);

      manager.add(predator);
    }

    // Create prey with flocking
    const flocking = new FlockingGovernor();
    for (let i = 0; i < 15; i++) {
      const prey = new Vehicle();
      prey.position.set(
        Math.random() * 60 - 30,
        5,
        Math.random() * 60 - 30
      );
      prey.maxSpeed = 6;
      prey.mass = 10;
      prey.role = 'prey';
      (prey as any).name = `Prey ${i + 1}`;
      (prey as any).energy = 50;
      (prey as any).maxEnergy = 50;
      (prey as any).age = 0;
      (prey as any).startAsJuvenile = true;

      // Add flocking behavior
      flocking.applyTo(prey, 15);

      // Add predator-prey behavior
      const predatorPreyBehavior = new PredatorPreyBehavior();
      prey.steering.add(predatorPreyBehavior);

      // Add lifecycle state machine
      const lifecycle = new LifecycleStateMachine(prey);
      (prey as any).stateMachine = lifecycle;

      // Add metabolism
      (prey as any).metabolismSystem = true;

      manager.add(prey);
    }

    // Initialize social hierarchy
    const allAgents = manager.entities as Vehicle[];
    HierarchyBehavior.initializeHierarchy(allAgents);

    // Animation loop
    const animate = () => {
      const currentTime = performance.now();
      const delta = Math.min((currentTime - prevTimeRef.current) / 1000, 0.1); // Cap delta
      prevTimeRef.current = currentTime;
      deltaRef.current = delta;

      // Update entity manager (Yuka handles all governor updates!)
      manager.update(delta);

      // Update custom systems
      for (const entity of manager.entities) {
        const agent = entity as any;

        // Metabolism
        if (agent.metabolismSystem) {
          MetabolismSystem.update(agent, delta);
        }

        // Lifecycle
        if (agent.stateMachine) {
          agent.stateMachine.update(delta);
        }
      }

      // Update React state
      const agentMeshes: AgentMesh[] = manager.entities.map((entity) => {
        const vehicle = entity as any;
        return {
          agent: vehicle,
          position: [
            vehicle.position.x,
            vehicle.position.y,
            vehicle.position.z
          ] as [number, number, number],
          color: vehicle.role === 'predator' ? '#ff0000' : '#00ff00',
          role: vehicle.role,
          name: vehicle.name
        };
      });

      setAgents(agentMeshes);

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      manager.clear();
    };
  }, []);

  return (
    <>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Agents */}
      {agents.map((agentMesh, index) => (
        <group key={index} position={agentMesh.position}>
          <mesh castShadow>
            <sphereGeometry args={[agentMesh.role === 'predator' ? 1.5 : 0.8, 16, 16]} />
            <meshStandardMaterial color={agentMesh.color} />
          </mesh>
          <Html distanceFactor={10}>
            <div style={{
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              whiteSpace: 'nowrap'
            }}>
              {agentMesh.name}
              <br />
              {agentMesh.role}
              <br />
              Energy: {Math.round((agentMesh.agent as any).energy || 0)}
              {(agentMesh.agent as any).age !== undefined && (
                <>
                  <br />
                  Age: {((agentMesh.agent as any).age || 0).toFixed(2)}y
                </>
              )}
              {(agentMesh.agent as any).socialRank !== undefined && (
                <>
                  <br />
                  Rank: {((agentMesh.agent as any).socialRank || 0).toFixed(2)}
                </>
              )}
            </div>
          </Html>
        </group>
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[50, 50, 25]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </>
  );
}

export default function GovernorsDemo() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1e293b' }}>
      <Canvas
        camera={{ position: [0, 50, 80], fov: 50 }}
        shadows
      >
        <Scene />
        <OrbitControls />
        <Stats />
      </Canvas>

      {/* Info overlay */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxWidth: '400px'
      }}>
        <h2 style={{ margin: '0 0 10px 0' }}>Governors Demo</h2>
        <p style={{ margin: '5px 0' }}>
          <strong>Red spheres:</strong> Predators (Pursuit behavior)
        </p>
        <p style={{ margin: '5px 0' }}>
          <strong>Green spheres:</strong> Prey (Flocking + Flee)
        </p>
        <p style={{ margin: '10px 0 5px 0' }}><strong>Active Governors:</strong></p>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Predator-Prey (Lotka-Volterra)</li>
          <li>Flocking (Alignment + Cohesion + Separation)</li>
          <li>Metabolism (Kleiber's Law)</li>
          <li>Lifecycle (Juvenile → Adult → Elder)</li>
          <li>Social Hierarchy (Dominance ranks)</li>
        </ul>
      </div>
    </div>
  );
}

