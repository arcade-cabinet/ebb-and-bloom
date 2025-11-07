import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SimplexNoise } from 'simplex-noise';
import { world } from '../App';

// Grok-style parametric resource generation with "genes"
interface MaterialGene {
  purity: number;        // 0-1, affects final properties
  density: number;       // 0-3, affects lump size
  volatility: number;    // 0-1, affects behavior
  magnetism: number;     // 0-1, snap attraction strength
  colorShift: number;    // 0-1, HSL variation
  crystalline: number;   // 0-1, geometric complexity
  affinityMask: number;  // 8-bit flags for snapping
}

interface ResourceLump {
  gene: MaterialGene;
  position: THREE.Vector3;
  baseType: 'metallic' | 'organic' | 'energetic' | 'composite';
  age: number;           // For decay/evolution
  snapRadius: number;    // Magnetic field strength
}

// Noise generator for procedural properties
const materialNoise = new SimplexNoise();

// Affinity flags (keeping from original vision)
export enum AffinityFlag {
  HEAT = 1 << 0,   // 0001
  FLOW = 1 << 1,   // 0010  
  BIND = 1 << 2,   // 0100
  POWER = 1 << 3,  // 1000
  LIFE = 1 << 4,   
  METAL = 1 << 5,
  VOID = 1 << 6,
  WILD = 1 << 7
}

// Generate procedural material gene
const generateMaterialGene = (x: number, z: number, biomeType: string): MaterialGene => {
  const seed = x * 1000 + z;
  
  return {
    purity: Math.max(0, materialNoise.noise2D(x * 0.01, z * 0.01) * 0.5 + 0.5),
    density: Math.max(0, materialNoise.noise2D(x * 0.02, z * 0.02) * 1.5 + 1.5),
    volatility: Math.max(0, materialNoise.noise2D(x * 0.03, z * 0.03) * 0.5 + 0.5),
    magnetism: Math.max(0, materialNoise.noise2D(x * 0.015, z * 0.015) * 0.5 + 0.5),
    colorShift: materialNoise.noise2D(x * 0.05, z * 0.05) * 0.5 + 0.5,
    crystalline: Math.max(0, materialNoise.noise2D(x * 0.025, z * 0.025) * 0.5 + 0.5),
    affinityMask: generateAffinityMask(x, z, biomeType)
  };
};

// Generate affinity mask based on location and biome
const generateAffinityMask = (x: number, z: number, biome: string): number => {
  let mask = 0;
  
  // Base affinities by biome
  switch (biome) {
    case 'metallic':
      mask |= AffinityFlag.METAL | AffinityFlag.BIND;
      break;
    case 'organic':  
      mask |= AffinityFlag.LIFE | AffinityFlag.FLOW;
      break;
    case 'energetic':
      mask |= AffinityFlag.POWER | AffinityFlag.HEAT;
      break;
    case 'composite':
      mask |= AffinityFlag.WILD; // Can combine with anything
      break;
  }
  
  // Add noise-based secondary affinities
  if (materialNoise.noise2D(x * 0.01, z * 0.01) > 0.3) mask |= AffinityFlag.HEAT;
  if (materialNoise.noise2D(x * 0.02, z * 0.02) > 0.3) mask |= AffinityFlag.FLOW;
  if (materialNoise.noise2D(x * 0.03, z * 0.03) > 0.3) mask |= AffinityFlag.VOID;
  
  return mask;
};

// Grok-style parametric mesh generation
const createParametricMesh = (gene: MaterialGene, baseType: string): { geometry: THREE.BufferGeometry; material: THREE.Material } => {
  let geometry: THREE.BufferGeometry;
  let material: THREE.Material;
  
  // Geometry based on gene properties
  const scale = 0.5 + (gene.density * 0.8);
  const complexity = Math.floor(gene.crystalline * 12) + 4;
  
  switch (baseType) {
    case 'metallic':
      // More crystalline = more faces, higher density = bigger
      geometry = new THREE.DodecahedronGeometry(scale, gene.crystalline > 0.7 ? 1 : 0);
      break;
    case 'organic':
      // Soft, blobby shapes - use noise to deform sphere
      geometry = new THREE.SphereGeometry(scale, complexity, complexity);
      deformGeometryWithNoise(geometry, gene.volatility * 0.3);
      break;
    case 'energetic':
      // Sharp, angular - octahedron with spikes
      geometry = new THREE.OctahedronGeometry(scale, gene.crystalline > 0.5 ? 1 : 0);
      break;
    case 'composite':
      // Weird hybrid shapes - combine geometries
      geometry = createHybridGeometry(gene, scale);
      break;
    default:
      geometry = new THREE.BoxGeometry(scale, scale, scale);
  }
  
  // Material based on gene properties
  const baseColor = new THREE.Color();
  const hue = gene.colorShift;
  const saturation = 0.6 + (gene.purity * 0.4);
  const lightness = 0.4 + (gene.density * 0.2);
  
  baseColor.setHSL(hue, saturation, lightness);
  
  // Add emissive for energetic types or high volatility
  const emissive = gene.volatility > 0.7 || baseType === 'energetic' 
    ? baseColor.clone().multiplyScalar(0.2)
    : new THREE.Color(0x000000);
  
  material = new THREE.MeshLambertMaterial({
    color: baseColor,
    emissive,
    transparent: gene.volatility > 0.8,
    opacity: gene.volatility > 0.8 ? 0.7 : 1.0
  });
  
  return { geometry, material };
};

// Deform geometry with noise (Grok's approach)
const deformGeometryWithNoise = (geometry: THREE.BufferGeometry, intensity: number) => {
  const positionAttribute = geometry.getAttribute('position');
  const positions = positionAttribute.array as Float32Array;
  
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];  
    const z = positions[i + 2];
    
    // Add noise displacement
    const noise = materialNoise.noise3D(x * 3, y * 3, z * 3) * intensity;
    const length = Math.sqrt(x*x + y*y + z*z);
    
    positions[i] += (x / length) * noise;
    positions[i + 1] += (y / length) * noise;
    positions[i + 2] += (z / length) * noise;
  }
  
  positionAttribute.needsUpdate = true;
  geometry.computeVertexNormals();
};

// Create hybrid geometry by combining shapes (Grok's advanced approach)
const createHybridGeometry = (gene: MaterialGene, scale: number): THREE.BufferGeometry => {
  const geo1 = new THREE.BoxGeometry(scale, scale * 0.5, scale);
  const geo2 = new THREE.ConeGeometry(scale * 0.7, scale * 1.2, 8);
  
  // Position the cone on top of the box
  geo2.translate(0, scale * 0.6, 0);
  geo2.rotateX(gene.crystalline * Math.PI * 0.5); // Random rotation based on gene
  
  // Merge geometries (simplified - in production use THREE.BufferGeometryUtils)
  const hybrid = geo1; // For now, just use base shape
  return hybrid;
};

// Parametric Resource Lump Component
const ResourceLump: React.FC<{ lump: ResourceLump; onSnap: (lumps: ResourceLump[]) => void }> = ({ 
  lump, 
  onSnap 
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { geometry, material } = useMemo(() => createParametricMesh(lump.gene, lump.baseType), [lump.gene, lump.baseType]);
  
  // Magnetic attraction behavior
  const targetPosition = useRef(lump.position.clone());
  const magneticField = useRef(new THREE.Vector3());
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Age the lump (could change properties over time)
    lump.age += delta;
    
    // Magnetic field visualization (invisible)
    const magneticRadius = lump.gene.magnetism * lump.snapRadius;
    
    // Animate toward target with magnetic pulling
    meshRef.current.position.lerp(targetPosition.current, 0.1);
    
    // Floating animation based on volatility
    const floatIntensity = lump.gene.volatility * 0.2;
    meshRef.current.position.y = lump.position.y + Math.sin(state.clock.elapsedTime * 2 + lump.position.x) * floatIntensity;
    
    // Rotation based on gene properties
    meshRef.current.rotation.y += delta * (lump.gene.volatility + 0.1);
    meshRef.current.rotation.x += delta * lump.gene.crystalline * 0.5;
  });
  
  const handleClick = () => {
    console.log(`Clicked ${lump.baseType} lump:`, lump.gene);
    // Trigger magnetic snap logic
  };
  
  return (
    <mesh 
      ref={meshRef}
      position={lump.position.toArray()}
      geometry={geometry}
      material={material}
      onClick={handleClick}
      castShadow
      receiveShadow
    />
  );
};

// Procedural Material Spawner (Grok-style)
const ProceduralMaterials: React.FC = () => {
  const materialLumps = useMemo(() => {
    const lumps: ResourceLump[] = [];
    const getHeightAt = (window as any).getHeightAt;
    
    if (!getHeightAt) return lumps;
    
    // Generate lumps using noise patterns (not random!)
    for (let x = -400; x < 400; x += 50) {
      for (let z = -400; z < 400; z += 50) {
        // Skip some locations based on noise
        if (materialNoise.noise2D(x * 0.005, z * 0.005) < 0.2) continue;
        
        const worldX = x + (materialNoise.noise2D(x * 0.01, z * 0.01) * 25);
        const worldZ = z + (materialNoise.noise2D(x * 0.02, z * 0.02) * 25);
        const worldY = getHeightAt(worldX, worldZ) + 1;
        
        // Determine biome type from terrain features
        const terrainHeight = getHeightAt(worldX, worldZ);
        const biomeNoise = materialNoise.noise2D(worldX * 0.002, worldZ * 0.002);
        
        let biomeType = 'composite';
        if (terrainHeight > 40) biomeType = 'metallic';      // High areas = metals
        else if (terrainHeight < 20) biomeType = 'organic';  // Low areas = organics  
        else if (biomeNoise > 0.5) biomeType = 'energetic';  // Noise pockets = energy
        
        const gene = generateMaterialGene(worldX, worldZ, biomeType);
        
        lumps.push({
          gene,
          position: new THREE.Vector3(worldX, worldY, worldZ),
          baseType: biomeType as any,
          age: 0,
          snapRadius: 3 + (gene.magnetism * 4)  // 3-7 unit snap radius
        });
      }
    }
    
    return lumps;
  }, []);
  
  const handleSnap = (snappedLumps: ResourceLump[]) => {
    console.log('Material lumps snapped:', snappedLumps);
    
    // Check affinity overlap for alloy creation
    let combinedAffinity = 0;
    snappedLumps.forEach(lump => combinedAffinity |= lump.gene.affinityMask);
    
    console.log('Combined affinity mask:', combinedAffinity.toString(2));
    // Create new alloy lump based on combination
  };
  
  return (
    <>
      {materialLumps.map((lump, index) => (
        <ResourceLump
          key={index}
          lump={lump} 
          onSnap={handleSnap}
        />
      ))}
    </>
  );
};

export default ProceduralResources;