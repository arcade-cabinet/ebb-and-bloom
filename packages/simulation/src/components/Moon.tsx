/**
 * Moon Component - Renders moon with orbital motion
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, MeshStandardMaterial, SphereGeometry } from 'three';
import * as THREE from 'three';

interface MoonProps {
  moon: {
    id: string;
    name: string;
    radius: number;
    orbitalDistance: number;
    orbitalPeriod: number;
    position: { x: number; y: number; z: number };
  };
  planetRadius: number;
}

export function Moon({ moon, planetRadius }: MoonProps) {
  const meshRef = useRef<Mesh>(null);
  
  // Calculate moon radius in scene units (same scale as planet)
  const sceneRadius = moon.radius / 1e6; // Convert meters to scene units
  
  // Calculate orbital position in scene units
  const orbitalDistance = moon.orbitalDistance / 1e6; // Convert meters to scene units
  const position = useMemo(() => [
    moon.position.x / 1e6,
    moon.position.y / 1e6,
    moon.position.z / 1e6,
  ], [moon.position]);
  
  // Update position based on orbital motion
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Update orbital position based on time
      // This is a simplified version - full implementation would use Kepler's equations
      const time = state.clock.elapsedTime;
      const angle = (2 * Math.PI * time) / moon.orbitalPeriod;
      const x = orbitalDistance * Math.cos(angle);
      const y = orbitalDistance * Math.sin(angle) * 0.5; // Slight inclination
      const z = orbitalDistance * Math.sin(angle) * 0.3;
      
      meshRef.current.position.set(x, y, z);
    }
  });
  
  // Simple moon material (gray, slightly reflective)
  const material = useMemo(() => {
    return new MeshStandardMaterial({
      color: new THREE.Color(0x888888),
      roughness: 0.9,
      metalness: 0.1,
    });
  }, []);

  return (
    <mesh ref={meshRef} geometry={new SphereGeometry(sceneRadius, 32, 32)} material={material}>
      {/* Moon label could go here */}
    </mesh>
  );
}

