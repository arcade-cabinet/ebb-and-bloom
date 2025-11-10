/**
 * MOLECULAR SYNTHESIS DEMO
 * 
 * Shows how molecular composition drives visual forms.
 * Adjust sliders to see protein/calcium/chitin affecting geometry.
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { useState } from 'react';
import { useControls } from 'leva';

function MolecularCreature() {
    const composition = useControls('Molecular Composition', {
        protein: { value: 0.45, min: 0, max: 1, step: 0.01 },
        calcium: { value: 0.15, min: 0, max: 1, step: 0.01 },
        lipid: { value: 0.15, min: 0, max: 1, step: 0.01 },
        chitin: { value: 0.0, min: 0, max: 1, step: 0.01 },
        keratin: { value: 0.08, min: 0, max: 1, step: 0.01 },
    });

    const bodyPlan = useControls('Body Plan', {
        mass: { value: 50, min: 1, max: 500, step: 1 },
        segments: { value: 3, min: 1, max: 12, step: 1 },
        appendages: { value: 4, min: 0, max: 12, step: 1 },
        spine: true
    });

    // Calculate visual parameters from molecules
    const scale = Math.cbrt(bodyPlan.mass / 50);
    const bulkFactor = composition.protein * 0.7 + composition.lipid * 0.3;
    const bodyRadius = scale * (0.3 + bulkFactor * 0.2);
    const bodyLength = scale * (0.8 + composition.protein * 0.4);

    // Color from molecules
    const isChitin = composition.chitin > 0.5;
    const isCalcium = composition.calcium > 0.4;
    const baseColor = isChitin 
        ? `rgb(${Math.floor((0.2 + composition.chitin * 0.2) * 255)}, 38, 25)`
        : isCalcium
        ? `rgb(230, ${Math.floor((0.85 + composition.calcium * 0.15) * 255)}, 204)`
        : `rgb(${Math.floor((0.7 + composition.protein * 0.2) * 255)}, ${Math.floor((0.4 + composition.lipid * 0.3) * 255)}, ${Math.floor((0.3 + 0.2) * 255)})`;

    return (
        <group>
            {/* Main body - cylinder (muscle/protein driven) */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[
                    bodyRadius,
                    bodyRadius * (1 - composition.lipid * 0.3),
                    bodyLength,
                    8,
                    Math.ceil(composition.calcium * 8)
                ]} />
                <meshStandardMaterial color={baseColor} roughness={0.7 + composition.chitin * 0.3} />
            </mesh>

            {/* Head - calcium affects size */}
            <mesh position={[bodyLength / 2 + bodyRadius * (0.6 + composition.calcium * 0.2), 0, 0]}>
                <sphereGeometry args={[bodyRadius * (0.6 + composition.calcium * 0.2), 8, 8]} />
                <meshStandardMaterial color={baseColor} />
            </mesh>

            {/* Limbs - protein = muscle, calcium = bone */}
            {Array.from({ length: bodyPlan.appendages }).map((_, i) => {
                const angle = (i / bodyPlan.appendages) * Math.PI * 2;
                const limbStrength = (composition.protein + composition.calcium) / 2;
                const limbLength = bodyLength * (0.6 + limbStrength * 0.4);
                const limbRadius = bodyRadius * (0.15 + composition.protein * 0.1);

                return (
                    <mesh
                        key={i}
                        position={[
                            i < bodyPlan.appendages / 2 ? bodyLength * 0.3 : -bodyLength * 0.3,
                            -limbLength / 2,
                            Math.sin(angle) * bodyRadius * 0.7
                        ]}
                    >
                        <cylinderGeometry args={[limbRadius, limbRadius * 0.5, limbLength, 4]} />
                        <meshStandardMaterial color={baseColor} />
                    </mesh>
                );
            })}

            {/* Keratin features (horns/spikes) */}
            {composition.keratin > 0.3 && Array.from({ length: Math.floor(composition.keratin * 8) }).map((_, i) => {
                const spikeCount = Math.floor(composition.keratin * 8);
                const angle = (i / spikeCount) * Math.PI * 2;
                const headRadius = bodyRadius * (0.6 + composition.calcium * 0.2);

                return (
                    <mesh
                        key={`spike-${i}`}
                        position={[
                            bodyLength / 2 + headRadius * (0.6 + Math.cos(angle) * 0.4),
                            headRadius * Math.sin(angle) * 0.8,
                            headRadius * 0.5
                        ]}
                        rotation={[Math.PI / 2, 0, 0]}
                    >
                        <coneGeometry args={[headRadius * 0.2, headRadius * 0.8, 4]} />
                        <meshStandardMaterial color="#E8D7C3" roughness={0.6} />
                    </mesh>
                );
            })}
        </group>
    );
}

export default function MolecularDemo() {
    return (
        <div style={{ width: '100vw', height: '100vh', background: '#1a1a2e' }}>
            <Canvas camera={{ position: [5, 3, 5], fov: 50 }} shadows>
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                
                <MolecularCreature />
                
                <gridHelper args={[20, 20, '#444', '#222']} />
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
                fontSize: '14px'
            }}>
                <h2 style={{ margin: '0 0 10px 0' }}>Molecular Synthesis</h2>
                <p style={{ margin: '5px 0', fontSize: '12px' }}>
                    Adjust composition to see how molecules drive form:
                </p>
                <ul style={{ margin: '10px 0', paddingLeft: '20px', fontSize: '11px' }}>
                    <li><strong>Protein ↑</strong> = More muscle bulk</li>
                    <li><strong>Calcium ↑</strong> = Larger head/bones</li>
                    <li><strong>Lipid ↑</strong> = Fatter body</li>
                    <li><strong>Chitin ↑</strong> = Darker, rougher</li>
                    <li><strong>Keratin ↑</strong> = Horns/spikes</li>
                </ul>
            </div>
        </div>
    );
}

