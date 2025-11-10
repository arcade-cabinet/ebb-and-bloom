/**
 * PIGMENTATION DEMO
 * 
 * Shows how diet and environment drive coloring.
 * Demonstrates biological pigments: melanin, carotenoids, pterins.
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { useControls } from 'leva';
import * as THREE from 'three';
import { useMemo } from 'react';

function ColoredCreature() {
    const diet = useControls('Diet', {
        plantMatter: { value: 0.5, min: 0, max: 1, step: 0.01 },
        animalMatter: { value: 0.5, min: 0, max: 1, step: 0.01 },
        minerals: { value: 0.1, min: 0, max: 1, step: 0.01 },
    });

    const environment = useControls('Environment', {
        vegetation: { value: 0.5, min: 0, max: 1, step: 0.01 },
        rockColor: { value: 0.5, min: 0, max: 1, step: 0.01 },
        uvIntensity: { value: 0.6, min: 0, max: 1, step: 0.01 },
        temperature: { value: 290, min: 250, max: 320, step: 1 },
    });

    const genetics = useControls('Genetics', {
        value: { value: 0.5, min: 0, max: 1, step: 0.01 },
        patternType: { value: 'spots', options: ['solid', 'spots', 'stripes'] },
    });

    // Calculate pigments
    const pigments = useMemo(() => {
        return {
            melanin: environment.uvIntensity * 0.7 + genetics.value * 0.3,
            carotenoid: diet.plantMatter * 0.8,
            pterin: genetics.value * 0.5 + diet.animalMatter * 0.3,
            purine: 0.3 + diet.animalMatter * 0.2,
            porphyrin: diet.animalMatter * 0.5 + diet.plantMatter * 0.2
        };
    }, [diet, environment, genetics.value]);

    // Mix pigments into final color
    const color = useMemo(() => {
        const r = pigments.melanin * 0.2 + pigments.carotenoid * 0.8 + pigments.purine * 0.9;
        const g = pigments.carotenoid * 0.5 + pigments.pterin * 0.7 + pigments.porphyrin * 0.3 + pigments.purine * 0.9;
        const b = pigments.melanin * 0.1 + pigments.purine * 0.9;

        const max = Math.max(r, g, b, 0.1);
        return new THREE.Color(r / max, g / max, b / max);
    }, [pigments]);

    // Camouflage color
    const camoColor = useMemo(() => {
        const r = (1 - environment.vegetation) * environment.rockColor * 0.6 + environment.vegetation * 0.2;
        const g = environment.vegetation * 0.5 + (1 - environment.vegetation) * environment.rockColor * 0.4;
        const b = environment.vegetation * 0.2 + (1 - environment.vegetation) * environment.rockColor * 0.3;
        return new THREE.Color(r, g, b);
    }, [environment]);

    return (
        <group>
            {/* Creature body */}
            <mesh castShadow>
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>

            {/* Camouflage reference sphere */}
            <mesh position={[3, 0, 0]}>
                <sphereGeometry args={[0.8, 16, 16]} />
                <meshStandardMaterial color={camoColor} roughness={0.7} />
            </mesh>

            {/* Pattern visualization (spots/stripes) */}
            {genetics.patternType === 'spots' && Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const height = (Math.random() - 0.5) * 1.5;
                return (
                    <mesh
                        key={i}
                        position={[
                            Math.cos(angle) * 0.9,
                            height,
                            Math.sin(angle) * 0.9
                        ]}
                    >
                        <sphereGeometry args={[0.15, 8, 8]} />
                        <meshStandardMaterial 
                            color={new THREE.Color().copy(color).multiplyScalar(0.7)} 
                            roughness={0.7} 
                        />
                    </mesh>
                );
            })}
        </group>
    );
}

export default function PigmentationDemo() {
    return (
        <div style={{ width: '100vw', height: '100vh', background: '#0f0f1e' }}>
            <Canvas camera={{ position: [4, 3, 4], fov: 50 }} shadows>
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                
                <ColoredCreature />
                
                <gridHelper args={[10, 10, '#333', '#1a1a1a']} />
                <OrbitControls />
                <Stats />
            </Canvas>

            <div style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: '20px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '12px',
                maxWidth: '300px'
            }}>
                <h2 style={{ margin: '0 0 10px 0' }}>Pigmentation Synthesis</h2>
                <p style={{ fontSize: '11px', margin: '10px 0' }}>
                    <strong>Left sphere:</strong> Creature with diet-derived pigments
                </p>
                <p style={{ fontSize: '11px', margin: '10px 0' }}>
                    <strong>Right sphere:</strong> Environment camouflage reference
                </p>
                <ul style={{ margin: '10px 0', paddingLeft: '20px', fontSize: '10px' }}>
                    <li><strong>Plant diet →</strong> Carotenoids (yellow/orange)</li>
                    <li><strong>Meat diet →</strong> Porphyrins (red)</li>
                    <li><strong>High UV →</strong> Melanin (dark)</li>
                    <li><strong>Vegetation →</strong> Green camouflage</li>
                    <li><strong>Rock →</strong> Brown camouflage</li>
                </ul>
            </div>
        </div>
    );
}

