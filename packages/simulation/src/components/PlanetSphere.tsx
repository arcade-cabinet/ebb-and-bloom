/**
 * PlanetSphere Component - Full GEN0 rendering with visual blueprints
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, MeshStandardMaterial, SphereGeometry } from 'three';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface PlanetSphereProps {
  planet: {
    radius: number;
    rotationPeriod: number;
  };
  visualBlueprint: {
    textureReferences: string[];
    visualProperties: {
      pbrProperties?: {
        baseColor?: string;
        roughness?: number;
        metallic?: number;
        emissive?: string;
        normalStrength?: number;
        aoStrength?: number;
        heightScale?: number;
      };
      colorPalette?: string[];
    };
  };
}

export function PlanetSphere({ planet, visualBlueprint }: PlanetSphereProps) {
  const meshRef = useRef<Mesh>(null);
  
  // Calculate rotation speed from rotation period
  const rotationSpeed = useMemo(() => {
    // Convert rotation period (seconds) to rotation per second
    return (2 * Math.PI) / planet.rotationPeriod;
  }, [planet.rotationPeriod]);
  
  // Rotate planet based on rotation period
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed * delta;
    }
  });

  // Extract PBR properties from visual blueprint
  const pbrProps = visualBlueprint.visualProperties?.pbrProperties || {};
  const colorPalette = visualBlueprint.visualProperties?.colorPalette || ['#808080'];
  const baseColor = pbrProps.baseColor || colorPalette[0];
  
  // Load textures (use first texture reference if available)
  const textureRefs = visualBlueprint.textureReferences || [];
  const primaryTextureId = textureRefs[0];
  
  // TODO: Implement texture loading using TextureLoader
  // For now, use procedural material based on visual blueprint

  // Create material with PBR properties
  const material = useMemo(() => {
    const mat = new MeshStandardMaterial({
      color: new THREE.Color(baseColor),
      roughness: pbrProps.roughness ?? 0.8,
      metalness: pbrProps.metallic ?? 0.1,
      emissive: pbrProps.emissive ? new THREE.Color(pbrProps.emissive) : undefined,
      emissiveIntensity: pbrProps.emissive ? 0.2 : 0,
    });
    
    // TODO: Add texture maps when texture loading is implemented
    // if (texture) {
    //   mat.map = texture;
    // }
    
    return mat;
  }, [baseColor, pbrProps]);

  // Calculate planet radius in scene units (normalize to reasonable size)
  // Planet radius is in meters, convert to scene units (1 unit = 1000km)
  const sceneRadius = planet.radius / 1e6; // Convert meters to scene units (1000km scale)

  return (
    <mesh ref={meshRef} geometry={new SphereGeometry(sceneRadius, 64, 64)} material={material}>
      {/* TODO: Add texture mapping from textureReferences */}
      {/* TODO: Add procedural surface features based on proceduralRules */}
      {/* TODO: Add atmospheric effects */}
    </mesh>
  );
}
