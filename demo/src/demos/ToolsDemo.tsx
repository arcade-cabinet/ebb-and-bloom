/**
 * TOOLS & STRUCTURES DEMO
 * 
 * Shows synthesis of tools and structures from materials.
 * CognitiveSystem decides who can create, synthesis decides how it looks.
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { useControls } from 'leva';
import * as THREE from 'three';

function Tool({ type, position }: { type: string; position: [number, number, number] }) {
    const materials = {
        wood: 0.7,
        stone: 0.5,
        bone: 0.3
    };

    if (type === 'digging_stick') {
        return (
            <group position={position}>
                {/* Shaft */}
                <mesh>
                    <cylinderGeometry args={[0.03, 0.04, 1.5, 8]} />
                    <meshStandardMaterial color="#8B4513" roughness={0.9} />
                </mesh>
                {/* Point */}
                <mesh position={[0, 0.75 + 0.075, 0]}>
                    <coneGeometry args={[0.05, 0.15, 6]} />
                    <meshStandardMaterial color="#808080" roughness={0.8} metalness={0.1} />
                </mesh>
            </group>
        );
    } else if (type === 'striking_stone') {
        return (
            <group position={position}>
                <mesh>
                    <dodecahedronGeometry args={[0.12, 0]} />
                    <meshStandardMaterial color="#606060" roughness={0.8} metalness={0.1} />
                </mesh>
            </group>
        );
    } else if (type === 'wading_spear') {
        return (
            <group position={position}>
                {/* Long shaft */}
                <mesh>
                    <cylinderGeometry args={[0.025, 0.03, 2.0, 6]} />
                    <meshStandardMaterial color="#8B4513" roughness={0.9} />
                </mesh>
                {/* Sharp point */}
                <mesh position={[0, 1.125, 0]}>
                    <coneGeometry args={[0.04, 0.25, 6]} />
                    <meshStandardMaterial color="#E8D7C3" roughness={0.6} metalness={0.2} />
                </mesh>
            </group>
        );
    }

    return null;
}

function Structure({ type, position }: { type: string; position: [number, number, number] }) {
    const scale = 2;

    if (type === 'burrow') {
        return (
            <group position={position}>
                {/* Mound */}
                <mesh position={[0, -scale * 0.15, 0]}>
                    <coneGeometry args={[scale * 0.5, scale * 0.3, 8]} />
                    <meshStandardMaterial color="#B87333" roughness={0.85} />
                </mesh>
                {/* Hole */}
                <mesh position={[0, -scale * 0.1, 0]}>
                    <cylinderGeometry args={[scale * 0.3, scale * 0.3, scale * 0.4, 8]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
            </group>
        );
    } else if (type === 'windbreak') {
        return (
            <group position={position}>
                {/* Wall */}
                <mesh>
                    <boxGeometry args={[scale * 2, scale, scale * 0.2]} />
                    <meshStandardMaterial color="#8B4513" roughness={0.95} />
                </mesh>
                {/* Support poles */}
                {[-1, 0, 1].map(i => (
                    <mesh key={i} position={[i * scale * 0.8, scale * 0.5, -scale * 0.1]}>
                        <cylinderGeometry args={[scale * 0.04, scale * 0.04, scale, 6]} />
                        <meshStandardMaterial color="#654321" roughness={0.9} />
                    </mesh>
                ))}
            </group>
        );
    }

    return null;
}

export default function ToolsDemo() {
    const controls = useControls('Display', {
        showTools: true,
        showStructures: true,
    });

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#1a1a2e' }}>
            <Canvas camera={{ position: [8, 6, 8], fov: 50 }} shadows>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

                {/* Ground */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                    <planeGeometry args={[50, 50]} />
                    <meshStandardMaterial color="#3a5a3a" />
                </mesh>

                {/* Tools */}
                {controls.showTools && (
                    <>
                        <Tool type="digging_stick" position={[-4, 0.75, 0]} />
                        <Tool type="striking_stone" position={[-2, 0.1, 0]} />
                        <Tool type="wading_spear" position={[2, 1, 0]} />
                    </>
                )}

                {/* Structures */}
                {controls.showStructures && (
                    <>
                        <Structure type="burrow" position={[-6, 0, -4]} />
                        <Structure type="windbreak" position={[6, 0, -4]} />
                    </>
                )}

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
                <h2 style={{ margin: '0 0 15px 0' }}>Tool & Structure Synthesis</h2>
                
                <div style={{ fontSize: '11px', marginBottom: '15px' }}>
                    <p><strong>Tools:</strong></p>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        <li>Digging Stick: Wood shaft + stone point</li>
                        <li>Striking Stone: Handheld rock</li>
                        <li>Wading Spear: Long shaft + sharp tip</li>
                    </ul>
                </div>

                <div style={{ fontSize: '11px' }}>
                    <p><strong>Structures:</strong></p>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        <li>Burrow: Underground chamber</li>
                        <li>Windbreak: Simple shelter</li>
                    </ul>
                </div>

                <p style={{ marginTop: '15px', fontSize: '10px', opacity: 0.7 }}>
                    All synthesized from wood/stone/bone.<br/>
                    NO PREFABS. Pure composition.
                </p>
            </div>
        </div>
    );
}

