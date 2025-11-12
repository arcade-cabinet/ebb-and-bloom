/**
 * BASE SDF RENDERER PROOF
 * 
 * A single, focused demo to prove the base SDF rendering layer.
 * Renders multiple complex primitives with PBR textures from AmbientCG.
 */

import { Box } from '@mui/material';
import { OrbitControls, useTexture } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { SDFPrimitive } from '../../engine/rendering/sdf/SDFPrimitives';
import { SDFRenderer } from '../../engine/rendering/sdf/SDFRenderer';

function Scene() {
    const textures = {
        rock: {
            diffuse: useTexture('/textures/ambientcg/Rock027/Rock027_1K_Color.jpg'),
            normal: useTexture('/textures/ambientcg/Rock027/Rock027_1K_NormalGL.jpg'),
            roughness: useTexture('/textures/ambientcg/Rock027/Rock027_1K_Roughness.jpg'),
        },
        metal: {
            diffuse: useTexture('/textures/ambientcg/Metal034/Metal034_1K_Color.jpg'),
            normal: useTexture('/textures/ambientcg/Metal034/Metal034_1K_NormalGL.jpg'),
            roughness: useTexture('/textures/ambientcg/Metal034/Metal034_1K_Roughness.jpg'),
        }
    };

    const primitives: SDFPrimitive[] = [
        // Rock Octahedron
        {
            type: 'octahedron',
            position: [-2, 0, 0],
            params: [0.8],
            materialId: 3 // Metal-like base material
        },
        // Metal Pyramid (hollowed out)
        {
            type: 'pyramid',
            position: [0, -0.2, 0],
            params: [0.8],
            materialId: 3
        },
        {
            type: 'pyramid',
            position: [0, -0.2, 0],
            params: [0.7],
            materialId: 3,
            operation: 'subtract'
        },
        // Rock Torus and Sphere (smoothly blended)
        {
            type: 'torus',
            position: [2, 0, 0],
            params: [0.5, 0.2],
            materialId: 3
        },
        {
            type: 'sphere',
            position: [2.5, 0, 0],
            params: [0.3],
            materialId: 3,
            operation: 'smooth-union',
            operationStrength: 0.4
        }
    ];

    // For this proof, we will apply textures manually in the shader based on object position.
    // A full implementation would involve material indices and texture arrays.
    return <SDFRenderer primitives={primitives} textures={{ ...textures.rock, ...textures.metal }} />;
}

export function BaseSDFProof() {
    return (
        <Box sx={{ width: '100vw', height: '100vh', bgcolor: '#111' }}>
            <Canvas camera={{ position: [0, 1, 5], fov: 60 }}>
                <Suspense fallback={null}>
                    <Scene />
                </Suspense>
                <OrbitControls />
                <ambientLight intensity={0.1} />
                <directionalLight position={[5, 5, 5]} intensity={1.5} />
                <pointLight position={[-5, -5, -5]} intensity={0.5} color="#2222ff" />
            </Canvas>
        </Box>
    );
}
