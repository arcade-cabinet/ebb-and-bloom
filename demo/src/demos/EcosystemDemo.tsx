/**
 * ECOSYSTEM DEMO
 * 
 * Living ecosystem powered by governors.
 * Watch predator-prey dynamics, flocking, territorial behavior emerge.
 */

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stats, Html } from '@react-three/drei';
import { useRef, useEffect, useState } from 'react';
import { EntityManager, Vehicle, WanderBehavior } from 'yuka';
import { 
    PredatorPreyBehavior,
    FlockingGovernor,
    MetabolismSystem,
    HierarchyBehavior
} from '../../../engine/governors';

interface CreatureState {
    position: [number, number, number];
    color: string;
    energy: number;
    role: string;
    age: number;
}

function Scene() {
    const [creatures, setCreatures] = useState<CreatureState[]>([]);
    const managerRef = useRef<EntityManager>(new EntityManager());
    const timeRef = useRef(0);

    useEffect(() => {
        const manager = managerRef.current;

        // Spawn herbivores (prey) with flocking
        const flocking = new FlockingGovernor();
        for (let i = 0; i < 20; i++) {
            const prey = new Vehicle();
            prey.position.set(
                Math.random() * 60 - 30,
                0.5,
                Math.random() * 60 - 30
            );
            prey.maxSpeed = 6;
            prey.mass = 20;
            (prey as any).role = 'prey';
            (prey as any).energy = 100;
            (prey as any).maxEnergy = 100;
            (prey as any).age = 0;

            flocking.applyTo(prey, 15);
            prey.steering.add(new PredatorPreyBehavior());

            const wander = new WanderBehavior();
            wander.radius = 8;
            prey.steering.add(wander);

            manager.add(prey);
        }

        // Spawn carnivores (predators)
        for (let i = 0; i < 4; i++) {
            const predator = new Vehicle();
            predator.position.set(
                Math.random() * 80 - 40,
                0.5,
                Math.random() * 80 - 40
            );
            predator.maxSpeed = 8;
            predator.mass = 60;
            (predator as any).role = 'predator';
            (predator as any).energy = 100;
            (predator as any).maxEnergy = 100;
            (predator as any).age = 0;

            predator.steering.add(new PredatorPreyBehavior());

            manager.add(predator);
        }

        // Initialize hierarchy
        HierarchyBehavior.initializeHierarchy(manager.entities as Vehicle[]);

        return () => manager.clear();
    }, []);

    useFrame((state, delta) => {
        const manager = managerRef.current;
        timeRef.current += delta;

        // Update entity manager (governors handle movement)
        manager.update(delta);

        // Update systems
        for (const entity of manager.entities) {
            const agent = entity as any;
            
            // Metabolism drains energy
            MetabolismSystem.update(agent, delta);

            // Age creatures
            agent.age += delta / 100; // Faster aging for demo
        }

        // Update React state (every few frames)
        if (timeRef.current > 0.1) {
            timeRef.current = 0;
            
            setCreatures(manager.entities.map((e: any) => ({
                position: [e.position.x, e.position.y, e.position.z],
                color: e.role === 'predator' ? '#ff4444' : '#44ff44',
                energy: e.energy || 100,
                role: e.role || 'unknown',
                age: e.age || 0
            })));
        }
    });

    return (
        <>
            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color="#2a4a2a" />
            </mesh>

            {/* Creatures */}
            {creatures.map((c, i) => (
                <group key={i} position={c.position}>
                    <mesh castShadow>
                        <sphereGeometry args={[c.role === 'predator' ? 1.2 : 0.7, 12, 12]} />
                        <meshStandardMaterial color={c.color} />
                    </mesh>
                    
                    {/* Energy bar */}
                    <Html distanceFactor={15}>
                        <div style={{
                            background: 'rgba(0,0,0,0.7)',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '9px',
                            color: 'white',
                            whiteSpace: 'nowrap'
                        }}>
                            E: {Math.round(c.energy)} | Age: {c.age.toFixed(1)}y
                        </div>
                    </Html>
                </group>
            ))}

            <ambientLight intensity={0.5} />
            <directionalLight position={[50, 50, 25]} intensity={1} castShadow />
        </>
    );
}

export default function EcosystemDemo() {
    const [stats, setStats] = useState({ prey: 20, predators: 4 });

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#1a1a2e' }}>
            <Canvas camera={{ position: [0, 60, 80], fov: 50 }} shadows>
                <Scene />
                <OrbitControls />
                <Stats />
            </Canvas>

            <div style={{
                position: 'absolute',
                top: 20,
                left: 20,
                background: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: '20px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '13px'
            }}>
                <h2 style={{ margin: '0 0 10px 0' }}>Living Ecosystem</h2>
                <p style={{ fontSize: '11px', margin: '5px 0' }}>
                    <span style={{ color: '#44ff44' }}>●</span> <strong>{stats.prey} Herbivores</strong> (Prey)
                </p>
                <p style={{ fontSize: '11px', margin: '5px 0' }}>
                    <span style={{ color: '#ff4444' }}>●</span> <strong>{stats.predators} Carnivores</strong> (Predators)
                </p>

                <div style={{ marginTop: '15px', fontSize: '10px', opacity: 0.8 }}>
                    <p><strong>Active Governors:</strong></p>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        <li>PredatorPreyBehavior (Lotka-Volterra)</li>
                        <li>FlockingBehavior (Prey only)</li>
                        <li>MetabolismSystem (Energy drain)</li>
                        <li>HierarchyBehavior (Social ranks)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

