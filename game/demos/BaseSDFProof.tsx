/**
 * BASE SDF RENDERER PROOF
 * 
 * Minimal proof-of-concept demo showing basic SDF rendering works.
 * Demonstrates raymarching with three simple primitives:
 * - Sphere (left)
 * - Box (center)
 * - Torus (right)
 */

import { Box } from '@mui/material';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { SDFPrimitive } from '../../engine/rendering/sdf/types';
import { SDFRenderer } from '../../engine/rendering/sdf/renderer/SDFRenderer';

function Scene() {
    const primitives: SDFPrimitive[] = [
        {
            type: 'sphere',
            position: [-2, 0, 0],
            params: [0.6],
            materialId: 'element-h'
        },
        {
            type: 'box',
            position: [0, 0, 0],
            params: [0.5, 0.5, 0.5],
            materialId: 'element-c'
        },
        {
            type: 'torus',
            position: [2, 0, 0],
            params: [0.5, 0.2],
            materialId: 'element-o'
        }
    ];

    return <SDFRenderer primitives={primitives} />;
}

export function BaseSDFProof() {
    return (
        <Box sx={{ width: '100vw', height: '100vh', bgcolor: '#111' }}>
            <Canvas camera={{ position: [0, 1, 5], fov: 60 }}>
                <Scene />
                <OrbitControls />
                <ambientLight intensity={0.1} />
                <directionalLight position={[5, 5, 5]} intensity={1.5} />
                <pointLight position={[-5, -5, -5]} intensity={0.5} color="#2222ff" />
            </Canvas>
        </Box>
    );
}

export default BaseSDFProof;
