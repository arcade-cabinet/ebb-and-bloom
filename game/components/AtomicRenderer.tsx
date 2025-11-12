/**
 * ATOMIC RENDERER - PUSH VISUAL LIMITS
 * 
 * Tests the actual limits of raycasting for atomic visualization:
 * - Electron clouds (volumetric)
 * - Orbital shapes (s, p, d, f)
 * - Dynamic electron motion
 * - Proper atomic physics visualization
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface AtomicRendererProps {
  element: {
    symbol: string;
    atomicNumber: number;
    electronConfiguration: string;
    color: string;
    metallic: number;
    roughness: number;
    opacity: number;
  };
  position: [number, number, number];
  showElectrons?: boolean;
  showOrbitals?: boolean;
  animateElectrons?: boolean;
}

export function AtomicRenderer({ 
  element, 
  position, 
  showElectrons = true, 
  showOrbitals = true,
  animateElectrons = true 
}: AtomicRendererProps) {
  const groupRef = useRef<THREE.Group>(null);
  const electronCloudRef = useRef<THREE.Points>(null);
  
  // Generate electron cloud points (volumetric rendering test)
  const electronCloud = useMemo(() => {
    const points = new Float32Array(element.atomicNumber * 1000 * 3); // 1000 points per electron
    const colors = new Float32Array(element.atomicNumber * 1000 * 3);
    
    let index = 0;
    
    // Generate probability-based electron positions
    for (let electron = 0; electron < element.atomicNumber; electron++) {
      const shell = getElectronShell(electron);
      const orbitalType = getOrbitalType(electron);
      
      for (let point = 0; point < 1000; point++) {
        const pos = generateElectronPosition(shell, orbitalType);
        
        points[index * 3] = pos.x;
        points[index * 3 + 1] = pos.y;
        points[index * 3 + 2] = pos.z;
        
        // Color by energy level
        const energyColor = getEnergyLevelColor(shell);
        colors[index * 3] = energyColor.r;
        colors[index * 3 + 1] = energyColor.g;
        colors[index * 3 + 2] = energyColor.b;
        
        index++;
      }
    }
    
    return { positions: points, colors };
  }, [element.atomicNumber]);

  // Generate orbital shapes (geometry test)
  const orbitalShapes = useMemo(() => {
    const shapes: JSX.Element[] = [];
    
    // S orbitals (spherical)
    if (element.atomicNumber >= 1) {
      shapes.push(
        <Sphere key="1s" args={[0.5, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#4488ff" 
            transparent 
            opacity={0.1}
            wireframe={false}
          />
        </Sphere>
      );
    }
    
    // P orbitals (dumbbell shapes) - TESTING COMPLEX GEOMETRY
    if (element.atomicNumber >= 5) {
      const pOrbitalGeometry = createPOrbitalGeometry();
      ['x', 'y', 'z'].forEach((axis, i) => {
        const rotation = axis === 'x' ? [0, 0, Math.PI/2] : 
                        axis === 'y' ? [0, 0, 0] : 
                        [Math.PI/2, 0, 0];
        
        shapes.push(
          <mesh key={`2p${axis}`} geometry={pOrbitalGeometry} rotation={rotation}>
            <meshStandardMaterial 
              color="#ff4488" 
              transparent 
              opacity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      });
    }
    
    // D orbitals (complex shapes) - TESTING ADVANCED GEOMETRY
    if (element.atomicNumber >= 21) {
      const dOrbitalGeometry = createDOrbitalGeometry();
      shapes.push(
        <mesh key="3d" geometry={dOrbitalGeometry}>
          <meshStandardMaterial 
            color="#44ff88" 
            transparent 
            opacity={0.12}
            side={THREE.DoubleSide}
          />
        </mesh>
      );
    }
    
    return shapes;
  }, [element.atomicNumber]);

  // Animate electron motion
  useFrame((state) => {
    if (!animateElectrons || !electronCloudRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Rotate electron cloud to simulate motion
    electronCloudRef.current.rotation.y = time * 0.5;
    electronCloudRef.current.rotation.x = Math.sin(time * 0.3) * 0.2;
    
    // Pulse opacity to simulate quantum uncertainty
    const opacity = 0.3 + Math.sin(time * 2) * 0.1;
    if (electronCloudRef.current.material instanceof THREE.PointsMaterial) {
      electronCloudRef.current.material.opacity = opacity;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Nucleus (enhanced sphere) */}
      <Sphere args={[0.1, 32, 32]}>
        <meshStandardMaterial
          color={element.color}
          metalness={element.metallic}
          roughness={element.roughness}
          emissive={element.metallic > 0.5 ? element.color : '#000000'}
          emissiveIntensity={element.metallic * 0.2}
        />
      </Sphere>
      
      {/* Electron cloud (volumetric rendering test) */}
      {showElectrons && (
        <Points ref={electronCloudRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={electronCloud.positions}
              count={electronCloud.positions.length / 3}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              array={electronCloud.colors}
              count={electronCloud.colors.length / 3}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.02}
            vertexColors
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            sizeAttenuation={true}
          />
        </Points>
      )}
      
      {/* Orbital shapes (complex geometry test) */}
      {showOrbitals && orbitalShapes}
      
      {/* Element label */}
      <mesh position={[0, 0.8, 0]}>
        <planeGeometry args={[0.4, 0.2]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

// Helper functions for advanced geometry generation

function getElectronShell(electronIndex: number): number {
  // Electron shell filling: 1s(2) 2s(2) 2p(6) 3s(2) 3p(6) 4s(2) 3d(10)...
  if (electronIndex < 2) return 1;
  if (electronIndex < 10) return 2;
  if (electronIndex < 18) return 3;
  if (electronIndex < 36) return 4;
  return 5;
}

function getOrbitalType(electronIndex: number): string {
  // Simplified orbital assignment
  if (electronIndex < 2) return 's';
  if (electronIndex < 10) return electronIndex < 4 ? 's' : 'p';
  if (electronIndex < 18) return electronIndex < 12 ? 's' : 'p';
  return 'd';
}

function generateElectronPosition(shell: number, orbital: string): THREE.Vector3 {
  const radius = shell * 0.3; // Shell radius
  
  switch (orbital) {
    case 's':
      // Spherical distribution
      return new THREE.Vector3(
        (Math.random() - 0.5) * radius,
        (Math.random() - 0.5) * radius,
        (Math.random() - 0.5) * radius
      );
    
    case 'p':
      // Dumbbell distribution
      const axis = Math.floor(Math.random() * 3);
      const distance = (Math.random() * 0.5 + 0.5) * radius;
      const sign = Math.random() < 0.5 ? -1 : 1;
      
      if (axis === 0) return new THREE.Vector3(distance * sign, Math.random() * 0.1 - 0.05, Math.random() * 0.1 - 0.05);
      if (axis === 1) return new THREE.Vector3(Math.random() * 0.1 - 0.05, distance * sign, Math.random() * 0.1 - 0.05);
      return new THREE.Vector3(Math.random() * 0.1 - 0.05, Math.random() * 0.1 - 0.05, distance * sign);
    
    case 'd':
      // Complex d-orbital shapes
      return new THREE.Vector3(
        Math.random() * radius * Math.cos(Math.random() * Math.PI * 2),
        Math.random() * radius * Math.sin(Math.random() * Math.PI * 2),
        (Math.random() - 0.5) * radius * 0.5
      );
    
    default:
      return new THREE.Vector3(0, 0, 0);
  }
}

function getEnergyLevelColor(shell: number): THREE.Color {
  const colors = [
    new THREE.Color('#ff0000'), // Shell 1: Red
    new THREE.Color('#ff8800'), // Shell 2: Orange  
    new THREE.Color('#ffff00'), // Shell 3: Yellow
    new THREE.Color('#00ff00'), // Shell 4: Green
    new THREE.Color('#0088ff'), // Shell 5: Blue
  ];
  return colors[shell - 1] || new THREE.Color('#ffffff');
}

function createPOrbitalGeometry(): THREE.BufferGeometry {
  // Create dumbbell shape for p orbitals
  const geometry = new THREE.SphereGeometry(0.3, 16, 16);
  
  // Modify vertices to create dumbbell shape
  const positions = geometry.attributes.position.array as Float32Array;
  
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    
    // Create dumbbell constriction at center
    const distance = Math.sqrt(x*x + y*y + z*z);
    const constriction = Math.abs(y) < 0.1 ? 0.3 : 1.0;
    
    positions[i] = x * constriction;
    positions[i + 1] = y;
    positions[i + 2] = z * constriction;
  }
  
  geometry.attributes.position.needsUpdate = true;
  geometry.computeVertexNormals();
  
  return geometry;
}

function createDOrbitalGeometry(): THREE.BufferGeometry {
  // Create complex d-orbital shapes (cloverleaf pattern)
  const geometry = new THREE.TorusGeometry(0.4, 0.1, 8, 16);
  return geometry;
}