import { useMemo, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import { CosmicProvenanceTimeline, CosmicStage } from '../../engine/genesis/CosmicProvenanceTimeline';
import { GenesisConstants } from '../../engine/genesis/GenesisConstants';
import { EnhancedRNG } from '../../engine/utils/EnhancedRNG';

interface CosmicExpansionFMVProps {
  seed: string;
  onComplete: (constants: GenesisConstants) => void;
  autoPlay?: boolean;
  stageIndex?: number;
}

export function CosmicExpansionFMV({ 
  seed, 
  onComplete, 
  autoPlay = true, 
  stageIndex 
}: CosmicExpansionFMVProps) {
  const timeline = useMemo(() => new CosmicProvenanceTimeline(seed), [seed]);
  const genesis = useMemo(() => new GenesisConstants(seed), [seed]);
  const stages = useMemo(() => timeline.getStages(), [timeline]);
  
  const [currentStage, setCurrentStage] = useState(stageIndex ?? 0);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (!autoPlay) return;
    
    const stageDuration = 5000;
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed % stageDuration) / stageDuration;
      setProgress(newProgress);
      
      if (elapsed > stageDuration) {
        if (currentStage < stages.length - 1) {
          setCurrentStage(currentStage + 1);
        } else {
          clearInterval(interval);
          onComplete(genesis);
        }
      }
    }, 16);
    
    return () => clearInterval(interval);
  }, [autoPlay, currentStage, stages.length, genesis, onComplete]);
  
  const stage = stages[currentStage];
  
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
      <ambientLight intensity={0.3} />
      <StageRenderer 
        stage={stage}
        progress={progress}
        seed={seed}
      />
      <CameraAnimator 
        stage={stage}
        _progress={progress}
      />
    </Canvas>
  );
}

interface StageRendererProps {
  stage: CosmicStage;
  progress: number;
  seed: string;
}

function StageRenderer({ stage, progress, seed }: StageRendererProps) {
  switch (stage.id) {
    case 'planck-epoch':
      return <PlanckEpochRenderer stage={stage} progress={progress} seed={seed} />;
    case 'cosmic-inflation':
      return <CosmicInflationRenderer stage={stage} progress={progress} seed={seed} />;
    case 'quark-gluon-plasma':
      return <QuarkGluonPlasmaRenderer stage={stage} progress={progress} seed={seed} />;
    case 'nucleosynthesis':
      return <NucleosynthesisRenderer stage={stage} progress={progress} seed={seed} />;
    case 'recombination':
      return <RecombinationRenderer stage={stage} progress={progress} seed={seed} />;
    case 'dark-matter-web':
      return <DarkMatterWebRenderer stage={stage} progress={progress} seed={seed} />;
    case 'population-iii-stars':
      return <PopulationIIIStarsRenderer stage={stage} progress={progress} seed={seed} />;
    case 'first-supernovae':
      return <FirstSupernovaeRenderer stage={stage} progress={progress} seed={seed} />;
    case 'galaxy-position':
      return <GalaxyPositionRenderer stage={stage} progress={progress} seed={seed} />;
    case 'molecular-cloud':
      return <MolecularCloudRenderer stage={stage} progress={progress} seed={seed} />;
    case 'cloud-collapse':
      return <CloudCollapseRenderer stage={stage} progress={progress} seed={seed} />;
    case 'protoplanetary-disk':
      return <ProtoplanetaryDiskRenderer stage={stage} progress={progress} seed={seed} />;
    case 'planetary-accretion':
      return <PlanetaryAccretionRenderer stage={stage} progress={progress} seed={seed} />;
    case 'planetary-differentiation':
      return <PlanetaryDifferentiationRenderer stage={stage} progress={progress} seed={seed} />;
    case 'surface-and-life':
      return <SurfaceFirstLifeRenderer stage={stage} progress={progress} seed={seed} />;
    default:
      return null;
  }
}

function CameraAnimator({ stage, _progress }: { stage: CosmicStage; _progress: number }) {
  void _progress;
  
  const cameraPositions: Record<string, [number, number, number]> = {
    'planck-epoch': [0, 0, 0.00001],
    'cosmic-inflation': [0, 0, 1],
    'quark-gluon-plasma': [0, 0, 5],
    'nucleosynthesis': [0, 0, 3],
    'recombination': [0, 0, 50],
    'dark-matter-web': [0, 30, 100],
    'population-iii-stars': [0, 10, 50],
    'first-supernovae': [0, 5, 20],
    'galaxy-position': [0, 50, 200],
    'molecular-cloud': [0, 10, 40],
    'cloud-collapse': [0, 0, 15],
    'protoplanetary-disk': [10, 5, 10],
    'planetary-accretion': [0, 5, 15],
    'planetary-differentiation': [5, 5, 10],
    'surface-and-life': [0, 2, 8],
  };
  
  const { position } = useSpring({
    position: cameraPositions[stage.id] || [0, 0, 10],
    config: { duration: 1000 }
  });
  
  return (
    <animated.perspectiveCamera
      position={position as any}
    />
  );
}

function PlanckEpochRenderer({ stage: _stage, progress, seed }: StageRendererProps) {
  const count = 100000;
  const rng = useMemo(() => new EnhancedRNG(seed), [seed]);
  
  const mesh = useMemo(() => {
    const geometry = new THREE.SphereGeometry(0.001, 4, 4);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        seed: { value: rng.uniform() },
        intensity: { value: 1.0 }
      },
      vertexShader: `
        uniform float time;
        uniform float seed;
        uniform float intensity;
        varying float vNoise;
        
        float hash(vec3 p) {
          p = fract(p * 0.3183099 + seed);
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }
        
        void main() {
          vec3 pos = position;
          float n = hash(pos + time);
          vNoise = n;
          pos += normal * n * intensity * 0.01;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying float vNoise;
        void main() {
          vec3 color = mix(vec3(0.7, 0.7, 1.0), vec3(1.0), vNoise);
          gl_FragColor = vec4(color, 0.8);
        }
      `,
      transparent: true
    });
    
    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < count; i++) {
      dummy.position.set(
        (rng.uniform() - 0.5) * 0.01,
        (rng.uniform() - 0.5) * 0.01,
        (rng.uniform() - 0.5) * 0.01
      );
      dummy.scale.setScalar(rng.uniform() * 0.5 + 0.5);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    }
    
    return instancedMesh;
  }, [count, rng]);
  
  useFrame((state) => {
    if (mesh.material instanceof THREE.ShaderMaterial) {
      mesh.material.uniforms.time.value = state.clock.elapsedTime + progress * 10;
    }
  });
  
  return <primitive object={mesh} />;
}

function CosmicInflationRenderer({ stage: _stage, progress, seed }: StageRendererProps) {
  const count = 50000;
  const rng = useMemo(() => new EnhancedRNG(seed), [seed]);
  
  const mesh = useMemo(() => {
    const geometry = new THREE.SphereGeometry(0.02, 6, 6);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        expansionRate: { value: 0.1 },
        center: { value: new THREE.Vector3(0, 0, 0) }
      },
      vertexShader: `
        uniform float time;
        uniform float expansionRate;
        uniform vec3 center;
        varying vec3 vColor;
        varying float vDistance;
        
        void main() {
          vec3 direction = normalize(position - center);
          vDistance = length(position - center);
          float expansion = exp(time * expansionRate) - 1.0;
          vec3 expanded = center + direction * (vDistance + expansion);
          
          float redshift = vDistance * expansionRate;
          vColor = mix(vec3(0.0, 0.0, 1.0), vec3(1.0, 0.0, 0.0), clamp(redshift, 0.0, 1.0));
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(expanded, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          gl_FragColor = vec4(vColor, 0.7);
        }
      `,
      transparent: true
    });
    
    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < count; i++) {
      const theta = rng.uniform() * Math.PI * 2;
      const phi = Math.acos(2 * rng.uniform() - 1);
      const r = rng.uniform() * 0.5;
      
      dummy.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    }
    
    return instancedMesh;
  }, [count, rng]);
  
  useFrame((_state) => {
    if (mesh.material instanceof THREE.ShaderMaterial) {
      mesh.material.uniforms.time.value = progress * 5;
    }
  });
  
  return <primitive object={mesh} />;
}

function QuarkGluonPlasmaRenderer({ stage: _stage, progress: _progress, seed }: StageRendererProps) {
  const count = 200000;
  const rng = useMemo(() => new EnhancedRNG(seed), [seed]);
  
  const points = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rng.uniform() - 0.5) * 2;
      positions[i * 3 + 1] = (rng.uniform() - 0.5) * 2;
      positions[i * 3 + 2] = (rng.uniform() - 0.5) * 2;
      
      const heat = rng.uniform();
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = heat * 0.6;
      colors[i * 3 + 2] = heat * 0.2;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    return new THREE.Points(geometry, material);
  }, [count, rng]);
  
  useFrame(() => {
    points.rotation.x += 0.001;
    points.rotation.y += 0.002;
  });
  
  return <primitive object={points} />;
}

function NucleosynthesisRenderer({ stage: _stage, progress: _progress, seed }: StageRendererProps) {
  const atomCount = 10000;
  const rng = useMemo(() => new EnhancedRNG(seed), [seed]);
  
  const mesh = useMemo(() => {
    const geometry = new THREE.SphereGeometry(0.05, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const instancedMesh = new THREE.InstancedMesh(geometry, material, atomCount);
    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < atomCount; i++) {
      dummy.position.set(
        (rng.uniform() - 0.5) * 5,
        (rng.uniform() - 0.5) * 5,
        (rng.uniform() - 0.5) * 5
      );
      dummy.scale.setScalar(rng.uniform() * 0.5 + 0.5);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
      
      const element = rng.uniform();
      const color = new THREE.Color();
      if (element < 0.75) {
        color.set(0xffffff);
      } else if (element < 0.99) {
        color.set(0x00ffff);
      } else {
        color.set(0xff00ff);
      }
      instancedMesh.setColorAt(i, color);
    }
    
    if (instancedMesh.instanceColor) {
      instancedMesh.instanceColor.needsUpdate = true;
    }
    
    return instancedMesh;
  }, [atomCount, rng]);
  
  return <primitive object={mesh} />;
}

function RecombinationRenderer({ stage: _stage, progress: _progress, seed }: StageRendererProps) {
  const photonCount = 5000;
  const rng = useMemo(() => new EnhancedRNG(seed), [seed]);
  
  const points = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(photonCount * 3);
    const velocities = new Float32Array(photonCount * 3);
    
    for (let i = 0; i < photonCount; i++) {
      const theta = rng.uniform() * Math.PI * 2;
      const phi = Math.acos(2 * rng.uniform() - 1);
      const r = rng.uniform() * 10;
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      
      velocities[i * 3] = Math.sin(phi) * Math.cos(theta);
      velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta);
      velocities[i * 3 + 2] = Math.cos(phi);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.2,
      color: 0xff9933,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    return new THREE.Points(geometry, material);
  }, [photonCount, rng]);
  
  useFrame(() => {
    const positions = points.geometry.attributes.position.array as Float32Array;
    const velocities = points.geometry.attributes.velocity.array as Float32Array;
    
    for (let i = 0; i < photonCount; i++) {
      positions[i * 3] += velocities[i * 3] * 0.1;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * 0.1;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * 0.1;
    }
    
    points.geometry.attributes.position.needsUpdate = true;
  });
  
  return <primitive object={points} />;
}

function DarkMatterWebRenderer({ stage: _stage, progress: _progress, seed }: StageRendererProps) {
  const rng = useMemo(() => new EnhancedRNG(seed), [seed]);
  
  const lines = useMemo(() => {
    const nodeCount = 100;
    const nodes: THREE.Vector3[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      nodes.push(new THREE.Vector3(
        (rng.uniform() - 0.5) * 50,
        (rng.uniform() - 0.5) * 50,
        (rng.uniform() - 0.5) * 50
      ));
    }
    
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 20 && rng.uniform() > 0.7) {
          positions.push(nodes[i].x, nodes[i].y, nodes[i].z);
          positions.push(nodes[j].x, nodes[j].y, nodes[j].z);
        }
      }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    const material = new THREE.LineBasicMaterial({
      color: 0x330099,
      transparent: true,
      opacity: 0.4
    });
    
    return new THREE.LineSegments(geometry, material);
  }, [rng]);
  
  return <primitive object={lines} />;
}

function PopulationIIIStarsRenderer({ stage: _stage, progress: _progress, seed }: StageRendererProps) {
  const starCount = 1000;
  const rng = useMemo(() => new EnhancedRNG(seed), [seed]);
  
  const stars = useMemo(() => {
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0x6666ff,
      emissive: 0x3333ff,
      emissiveIntensity: 2
    });
    const instancedMesh = new THREE.InstancedMesh(geometry, material, starCount);
    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < starCount; i++) {
      dummy.position.set(
        (rng.uniform() - 0.5) * 30,
        (rng.uniform() - 0.5) * 30,
        (rng.uniform() - 0.5) * 30
      );
      dummy.scale.setScalar(rng.uniform() * 0.5 + 1.0);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    }
    
    return instancedMesh;
  }, [starCount, rng]);
  
  return (
    <>
      <primitive object={stars} />
      <pointLight position={[0, 0, 0]} intensity={2} color={0x6666ff} />
    </>
  );
}

function FirstSupernovaeRenderer({ stage: _stage, progress: _progress, seed }: StageRendererProps) {
  const ejectaCount = 50000;
  const rng = useMemo(() => new EnhancedRNG(seed), [seed]);
  
  const particles = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(ejectaCount * 3);
    const velocities = new Float32Array(ejectaCount * 3);
    const colors = new Float32Array(ejectaCount * 3);
    
    for (let i = 0; i < ejectaCount; i++) {
      positions[i * 3] = (rng.uniform() - 0.5) * 0.5;
      positions[i * 3 + 1] = (rng.uniform() - 0.5) * 0.5;
      positions[i * 3 + 2] = (rng.uniform() - 0.5) * 0.5;
      
      const theta = rng.uniform() * Math.PI * 2;
      const phi = Math.acos(2 * rng.uniform() - 1);
      const speed = rng.uniform() * 2 + 1;
      
      velocities[i * 3] = speed * Math.sin(phi) * Math.cos(theta);
      velocities[i * 3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
      velocities[i * 3 + 2] = speed * Math.cos(phi);
      
      const metalType = rng.uniform();
      if (metalType < 0.2) {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 1.0;
        colors[i * 3 + 2] = 1.0;
      } else if (metalType < 0.4) {
        colors[i * 3] = 0.0;
        colors[i * 3 + 1] = 1.0;
        colors[i * 3 + 2] = 1.0;
      } else {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.5;
        colors[i * 3 + 2] = 0.0;
      }
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    return new THREE.Points(geometry, material);
  }, [ejectaCount, rng]);
  
  useFrame(() => {
    const positions = particles.geometry.attributes.position.array as Float32Array;
    const velocities = particles.geometry.attributes.velocity.array as Float32Array;
    
    for (let i = 0; i < ejectaCount; i++) {
      positions[i * 3] += velocities[i * 3] * 0.05;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * 0.05;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * 0.05;
    }
    
    particles.geometry.attributes.position.needsUpdate = true;
  });
  
  return (
    <>
      <primitive object={particles} />
      <pointLight position={[0, 0, 0]} intensity={5} color={0xffffff} distance={50} />
    </>
  );
}

function GalaxyPositionRenderer({ stage: _stage, progress: _progress, seed }: StageRendererProps) {
  const starCount = 10000;
  const rng = useMemo(() => new EnhancedRNG(seed), [seed]);
  
  const galaxy = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
      const r = rng.uniform() * 40;
      const theta = rng.uniform() * Math.PI * 2;
      const spiral = theta + r * 0.3;
      const y = (rng.uniform() - 0.5) * 2 * Math.exp(-r / 20);
      
      positions[i * 3] = r * Math.cos(spiral);
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = r * Math.sin(spiral);
      
      const coreDistance = r / 40;
      colors[i * 3] = coreDistance < 0.3 ? 1.0 : 0.6;
      colors[i * 3 + 1] = coreDistance < 0.3 ? 0.8 : 0.7;
      colors[i * 3 + 2] = coreDistance < 0.3 ? 0.0 : 1.0;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    
    return new THREE.Points(geometry, material);
  }, [starCount, rng]);
  
  useFrame(() => {
    galaxy.rotation.y += 0.001;
  });
  
  return <primitive object={galaxy} />;
}

function MolecularCloudRenderer({ stage: _stage, progress: _progress, seed }: StageRendererProps) {
  const particleCount = 20000;
  const rng = useMemo(() => new EnhancedRNG(seed), [seed]);
  
  const cloud = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const theta = rng.uniform() * Math.PI * 2;
      const phi = Math.acos(2 * rng.uniform() - 1);
      const r = Math.pow(rng.uniform(), 0.5) * 10;
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      
      const density = 1.0 - r / 10;
      colors[i * 3] = 0.6 * density;
      colors[i * 3 + 1] = 0.2 * density;
      colors[i * 3 + 2] = 0.1 * density;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.NormalBlending
    });
    
    return new THREE.Points(geometry, material);
  }, [particleCount, rng]);
  
  return <primitive object={cloud} />;
}

function CloudCollapseRenderer({ stage: _stage, progress: _progress, seed }: StageRendererProps) {
  const particleCount = 20000;
  const rng = useMemo(() => new EnhancedRNG(seed), [seed]);
  
  const cloudRef = useRef<THREE.Points>(null);
  
  const cloud = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const initialPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const theta = rng.uniform() * Math.PI * 2;
      const phi = Math.acos(2 * rng.uniform() - 1);
      const r = Math.pow(rng.uniform(), 0.5) * 8;
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      initialPositions[i * 3] = x;
      initialPositions[i * 3 + 1] = y;
      initialPositions[i * 3 + 2] = z;
      
      const heat = r < 2 ? 1.0 : 0.3;
      colors[i * 3] = heat;
      colors[i * 3 + 1] = heat * 0.5;
      colors[i * 3 + 2] = heat * 0.1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('initialPosition', new THREE.BufferAttribute(initialPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.7
    });
    
    return new THREE.Points(geometry, material);
  }, [particleCount, rng]);
  
  useFrame((state) => {
    if (cloudRef.current) {
      const positions = cloudRef.current.geometry.attributes.position.array as Float32Array;
      const initialPositions = cloudRef.current.geometry.attributes.initialPosition.array as Float32Array;
      const time = state.clock.elapsedTime;
      
      for (let i = 0; i < particleCount; i++) {
        const ix = initialPositions[i * 3];
        const iy = initialPositions[i * 3 + 1];
        const iz = initialPositions[i * 3 + 2];
        const r = Math.sqrt(ix * ix + iy * iy + iz * iz);
        
        const collapseProgress = Math.min(time * 0.1, 1.0);
        const targetR = r * (1.0 - collapseProgress * 0.7);
        
        positions[i * 3] = ix * (targetR / r);
        positions[i * 3 + 1] = iy * (targetR / r);
        positions[i * 3 + 2] = iz * (targetR / r);
        
        const rotationAngle = time * 0.2 * (1.0 / (r + 1.0));
        const x = positions[i * 3];
        const z = positions[i * 3 + 2];
        positions[i * 3] = x * Math.cos(rotationAngle) - z * Math.sin(rotationAngle);
        positions[i * 3 + 2] = x * Math.sin(rotationAngle) + z * Math.cos(rotationAngle);
      }
      
      cloudRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return <primitive ref={cloudRef} object={cloud} />;
}

function ProtoplanetaryDiskRenderer({ stage: _stage, progress: _progress, seed }: StageRendererProps) {
  const particleCount = 15000;
  const rng = useMemo(() => new EnhancedRNG(seed), [seed]);
  
  const disk = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const r = rng.uniform() * 8 + 1;
      const theta = rng.uniform() * Math.PI * 2;
      const y = (rng.uniform() - 0.5) * 0.2 * Math.exp(-r / 5);
      
      positions[i * 3] = r * Math.cos(theta);
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = r * Math.sin(theta);
      
      const temp = 1.0 / Math.pow(r / 2, 0.75);
      const normalizedTemp = Math.min(temp, 1.0);
      
      if (normalizedTemp > 0.7) {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.5;
        colors[i * 3 + 2] = 0.0;
      } else if (normalizedTemp > 0.4) {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 1.0;
        colors[i * 3 + 2] = 1.0;
      } else {
        colors[i * 3] = 0.3;
        colors[i * 3 + 1] = 0.5;
        colors[i * 3 + 2] = 0.8;
      }
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.7
    });
    
    return new THREE.Points(geometry, material);
  }, [particleCount, rng]);
  
  useFrame(() => {
    disk.rotation.y += 0.005;
  });
  
  return <primitive object={disk} />;
}

function PlanetaryAccretionRenderer({ stage: _stage, progress: _progress, seed }: StageRendererProps) {
  const planetesimalCount = 500;
  const rng = useMemo(() => new EnhancedRNG(seed), [seed]);
  
  const planetRef = useRef<THREE.Mesh>(null);
  const [planetSize, setPlanetSize] = useState(0.5);
  
  const planetesimals = useMemo(() => {
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      emissive: 0xff3300,
      emissiveIntensity: 0.5
    });
    const instancedMesh = new THREE.InstancedMesh(geometry, material, planetesimalCount);
    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < planetesimalCount; i++) {
      const r = rng.uniform() * 5 + 2;
      const theta = rng.uniform() * Math.PI * 2;
      const phi = Math.acos(2 * rng.uniform() - 1);
      
      dummy.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      dummy.scale.setScalar(rng.uniform() * 0.5 + 0.5);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    }
    
    return instancedMesh;
  }, [planetesimalCount, rng]);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    setPlanetSize(0.5 + time * 0.1);
  });
  
  return (
    <>
      <mesh ref={planetRef}>
        <sphereGeometry args={[planetSize, 32, 32]} />
        <meshStandardMaterial 
          color={0xff4400}
          emissive={0xff2200}
          emissiveIntensity={0.8}
        />
      </mesh>
      <primitive object={planetesimals} />
      <pointLight position={[0, 0, 0]} intensity={3} color={0xff6600} />
    </>
  );
}

function PlanetaryDifferentiationRenderer({ stage: _stage, progress: _progress, seed: _seed }: StageRendererProps) {
  const planetRef = useRef<THREE.Mesh>(null);
  
  const planet = useMemo(() => {
    const geometry = new THREE.SphereGeometry(3, 64, 64);
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        coreFraction: { value: 0.33 },
        mantleFraction: { value: 0.66 },
        time: { value: 0 }
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
          vPosition = position;
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float coreFraction;
        uniform float mantleFraction;
        uniform float time;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          float r = length(vPosition) / 3.0;
          vec3 color;
          
          if (r < coreFraction) {
            color = vec3(1.0, 1.0, 0.9);
          } else if (r < mantleFraction) {
            float convection = sin(vPosition.x * 5.0 + time * 0.1) * 
                              sin(vPosition.y * 5.0 - time * 0.1);
            vec3 mantleColor = vec3(0.8, 0.3, 0.1);
            vec3 molten = vec3(1.0, 0.5, 0.0);
            color = mix(mantleColor, molten, convection * 0.3 + 0.3);
          } else {
            color = vec3(0.4, 0.35, 0.3);
          }
          
          vec3 lightDir = normalize(vec3(1, 1, 1));
          float diffuse = max(dot(vNormal, lightDir), 0.0);
          color *= (0.6 + diffuse * 0.4);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `
    });
    
    return new THREE.Mesh(geometry, material);
  }, []);
  
  useFrame((state) => {
    if (planetRef.current && planetRef.current.material instanceof THREE.ShaderMaterial) {
      planetRef.current.material.uniforms.time.value = state.clock.elapsedTime;
    }
  });
  
  return <primitive ref={planetRef} object={planet} />;
}

function SurfaceFirstLifeRenderer({ stage: _stage, progress: _progress, seed: _seed }: StageRendererProps) {
  const planet = useMemo(() => {
    const geometry = new THREE.SphereGeometry(3, 64, 64);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        sunDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
        organicActivity: { value: 0.5 }
      },
      vertexShader: `
        uniform float time;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }
        
        void main() {
          vPosition = position;
          vNormal = normal;
          vUv = uv;
          
          float wave = sin(position.x * 2.0 + time) * 0.02 +
                      sin(position.z * 3.0 - time * 0.7) * 0.015;
          vec3 displaced = position + normal * wave;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 sunDirection;
        uniform float organicActivity;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }
        
        void main() {
          float isOcean = step(0.5, hash(vUv * 10.0));
          vec3 oceanColor = vec3(0.0, 0.2, 0.4);
          vec3 landColor = vec3(0.4, 0.3, 0.2);
          vec3 baseColor = mix(landColor, oceanColor, isOcean);
          
          vec3 viewDir = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
          
          vec3 reflectDir = reflect(-sunDirection, vNormal);
          float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0) * isOcean;
          
          float organicSparkle = pow(hash(vUv * 50.0 + time * 0.1), 10.0) * organicActivity;
          vec3 organicColor = vec3(0.0, 1.0, 0.5);
          
          vec3 color = baseColor;
          color += vec3(1.0, 1.0, 0.9) * spec * 0.5;
          color += organicColor * organicSparkle * isOcean;
          color = mix(color, vec3(0.5, 0.7, 1.0), fresnel * 0.2 * isOcean);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `
    });
    
    return new THREE.Mesh(geometry, material);
  }, []);
  
  const atmosphere = useMemo(() => {
    const geometry = new THREE.SphereGeometry(3.2, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    return new THREE.Mesh(geometry, material);
  }, []);
  
  useFrame((state) => {
    if (planet.material instanceof THREE.ShaderMaterial) {
      planet.material.uniforms.time.value = state.clock.elapsedTime;
    }
  });
  
  return (
    <>
      <primitive object={planet} />
      <primitive object={atmosphere} />
      <directionalLight position={[10, 5, 5]} intensity={1.5} color={0xffffee} />
    </>
  );
}
