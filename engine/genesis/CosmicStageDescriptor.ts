/**
 * Cosmic Stage Descriptor
 * 
 * Stage visualization schema for interactive Genesis FMV.
 * Defines 9 cosmic stages with SDF primitives, materials, and sensory feedback.
 * 
 * PRODUCTION-READY: All 9 stages fully implemented with seed-deterministic generation.
 */

import { EnhancedRNG } from '../utils/EnhancedRNG';

export interface SDFPrimitive {
  type: 'sphere' | 'box' | 'cylinder' | 'torus' | 'cone' | 'gyroid' | 'ellipsoid' | 
        'capsule' | 'octahedron' | 'hexPrism' | 'torusKnot' | 'roundedBox' | 'plane';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  parameters: Record<string, number>;
  materialId: string;
  operation?: 'union' | 'subtraction' | 'intersection' | 'smoothUnion' | 'smoothSubtraction';
  smoothness?: number;
}

export interface CosmicStageDescriptor {
  stageName: string;
  duration: number;
  description: string;
  sdfPrimitives: () => SDFPrimitive[];
  materials: string[];
  shaderUniforms: Record<string, any>;
  audioMotif: string;
  hapticPattern: string;
}

/**
 * Creates all 9 cosmic stage descriptors using seed-deterministic RNG.
 * Each stage has unique visual, audio, and haptic characteristics.
 * 
 * @param rng - Enhanced RNG for deterministic generation
 * @returns Array of 9 stage descriptors
 */
export function createStageDescriptors(rng: EnhancedRNG): CosmicStageDescriptor[] {
  return [
    createQuantumFluctuationStage(rng),
    createInflationStage(rng),
    createDarkMatterWebStage(rng),
    createPopIIIStarsStage(rng),
    createSupernovaStage(rng),
    createGalaxiesStage(rng),
    createMolecularCloudStage(rng),
    createStellarFurnaceStage(rng),
    createPlanetaryAccretionStage(rng)
  ];
}

/**
 * Stage 1: Quantum Fluctuation
 * Animated noise volumes representing quantum foam at Planck scale
 */
function createQuantumFluctuationStage(rng: EnhancedRNG): CosmicStageDescriptor {
  const numFluctuations = 50;
  const fluctuationPositions: [number, number, number][] = [];
  const fluctuationScales: number[] = [];
  
  for (let i = 0; i < numFluctuations; i++) {
    fluctuationPositions.push([
      rng.uniform(-10, 10),
      rng.uniform(-10, 10),
      rng.uniform(-10, 10)
    ]);
    fluctuationScales.push(rng.uniform(0.1, 0.5));
  }

  return {
    stageName: 'Quantum Fluctuation',
    duration: 8.0,
    description: 'Quantum foam at the Planck scale - spacetime itself fluctuates',
    sdfPrimitives: () => {
      return fluctuationPositions.map((pos, i) => ({
        type: 'sphere' as const,
        position: pos,
        rotation: [0, 0, 0] as [number, number, number],
        scale: [fluctuationScales[i], fluctuationScales[i], fluctuationScales[i]] as [number, number, number],
        parameters: { radius: fluctuationScales[i] },
        materialId: 'element-h',
        operation: 'smoothUnion' as const,
        smoothness: 0.3
      }));
    },
    materials: ['element-h'],
    shaderUniforms: {
      time: 0,
      noiseScale: 5.0,
      noiseAmplitude: 0.2,
      turbulence: 3.0,
      glowIntensity: 0.8,
      colorShift: [0.9, 0.9, 1.0]
    },
    audioMotif: 'Chaotic white noise modulated by seed density',
    hapticPattern: 'rapid_flutter'
  };
}

/**
 * Stage 2: Inflation
 * Expanding torus shells representing cosmic inflation
 */
function createInflationStage(rng: EnhancedRNG): CosmicStageDescriptor {
  const numShells = 8;
  const shellRadii: number[] = [];
  const shellThicknesses: number[] = [];
  
  for (let i = 0; i < numShells; i++) {
    shellRadii.push(1.0 + i * 1.5 + rng.uniform(-0.3, 0.3));
    shellThicknesses.push(0.1 + rng.uniform(0, 0.1));
  }

  return {
    stageName: 'Cosmic Inflation',
    duration: 10.0,
    description: 'Exponential expansion - universe grows by factor of 10^26',
    sdfPrimitives: () => {
      return shellRadii.map((radius, i) => ({
        type: 'torus' as const,
        position: [0, 0, 0] as [number, number, number],
        rotation: [
          rng.uniform(0, Math.PI * 2),
          rng.uniform(0, Math.PI * 2),
          rng.uniform(0, Math.PI * 2)
        ] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
        parameters: { 
          majorRadius: radius,
          minorRadius: shellThicknesses[i]
        },
        materialId: 'element-he',
        operation: 'smoothUnion' as const,
        smoothness: 0.5
      }));
    },
    materials: ['element-he'],
    shaderUniforms: {
      time: 0,
      expansionRate: 2.5,
      shellGlow: 1.2,
      energyDensity: 0.9,
      colorShift: [1.0, 0.2, 1.0]
    },
    audioMotif: 'Rapid pitch descent representing redshift from expansion',
    hapticPattern: 'expansion_rumble'
  };
}

/**
 * Stage 3: Dark Matter Web
 * Gyroid lattice representing cosmic web structure
 */
function createDarkMatterWebStage(rng: EnhancedRNG): CosmicStageDescriptor {
  const webScale = 0.3 + rng.uniform(-0.05, 0.05);
  const webThickness = 0.08 + rng.uniform(-0.01, 0.01);
  const numNodes = 20;
  const nodePositions: [number, number, number][] = [];
  
  for (let i = 0; i < numNodes; i++) {
    nodePositions.push([
      rng.uniform(-15, 15),
      rng.uniform(-15, 15),
      rng.uniform(-15, 15)
    ]);
  }

  return {
    stageName: 'Dark Matter Web',
    duration: 12.0,
    description: 'Filamentary cosmic web forms gravitational scaffolding',
    sdfPrimitives: () => {
      const primitives: SDFPrimitive[] = [
        {
          type: 'gyroid' as const,
          position: [0, 0, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [20, 20, 20] as [number, number, number],
          parameters: { 
            scale: webScale,
            thickness: webThickness
          },
          materialId: 'element-li',
          operation: 'union' as const
        }
      ];
      
      nodePositions.forEach(pos => {
        primitives.push({
          type: 'sphere' as const,
          position: pos,
          rotation: [0, 0, 0] as [number, number, number],
          scale: [1, 1, 1] as [number, number, number],
          parameters: { radius: 0.5 },
          materialId: 'element-li',
          operation: 'smoothUnion' as const,
          smoothness: 0.4
        });
      });
      
      return primitives;
    },
    materials: ['element-li'],
    shaderUniforms: {
      time: 0,
      webDensity: 0.7,
      gravitationalStrength: 0.6,
      darkMatterGlow: 0.4,
      colorShift: [0.3, 0.1, 0.5]
    },
    audioMotif: 'Deep bass pulses representing gravitational waves',
    hapticPattern: 'gravitational_pulse'
  };
}

/**
 * Stage 4: Population III Stars
 * Stellar spheres with emissive cores - first stars
 */
function createPopIIIStarsStage(rng: EnhancedRNG): CosmicStageDescriptor {
  const numStars = 15;
  const starPositions: [number, number, number][] = [];
  const starMasses: number[] = [];
  
  for (let i = 0; i < numStars; i++) {
    starPositions.push([
      rng.uniform(-20, 20),
      rng.uniform(-20, 20),
      rng.uniform(-20, 20)
    ]);
    starMasses.push(rng.powerLaw(2.35, 10, 300));
  }

  return {
    stageName: 'Population III Stars',
    duration: 15.0,
    description: 'First stars ignite - massive, metal-free giants',
    sdfPrimitives: () => {
      return starPositions.map((pos, i) => {
        const radius = Math.pow(starMasses[i] / 100, 0.8);
        return {
          type: 'sphere' as const,
          position: pos,
          rotation: [0, 0, 0] as [number, number, number],
          scale: [radius, radius, radius] as [number, number, number],
          parameters: { 
            radius,
            mass: starMasses[i]
          },
          materialId: 'element-he',
          operation: 'smoothUnion' as const,
          smoothness: 0.6
        };
      });
    },
    materials: ['element-he', 'element-h'],
    shaderUniforms: {
      time: 0,
      stellarTemperature: 50000,
      fusionIntensity: 1.5,
      coronaGlow: 2.0,
      colorShift: [0.8, 0.8, 1.0]
    },
    audioMotif: 'Harmonic resonance representing nuclear fusion',
    hapticPattern: 'stellar_ignition'
  };
}

/**
 * Stage 5: Supernova
 * Emissive shockwaves expanding from stellar cores
 */
function createSupernovaStage(rng: EnhancedRNG): CosmicStageDescriptor {
  const numShockwaves = 5;
  const corePosition: [number, number, number] = [0, 0, 0];
  const shockwaveRadii: number[] = [];
  
  for (let i = 0; i < numShockwaves; i++) {
    shockwaveRadii.push(2 + i * 3 + rng.uniform(-0.5, 0.5));
  }

  return {
    stageName: 'First Supernovae',
    duration: 12.0,
    description: 'Massive stars explode, forging heavy elements',
    sdfPrimitives: () => {
      const primitives: SDFPrimitive[] = [
        {
          type: 'sphere' as const,
          position: corePosition,
          rotation: [0, 0, 0] as [number, number, number],
          scale: [1.5, 1.5, 1.5] as [number, number, number],
          parameters: { radius: 1.5 },
          materialId: 'element-fe',
          operation: 'union' as const
        }
      ];
      
      shockwaveRadii.forEach((radius, i) => {
        primitives.push({
          type: 'sphere' as const,
          position: corePosition,
          rotation: [0, 0, 0] as [number, number, number],
          scale: [radius, radius, radius] as [number, number, number],
          parameters: { 
            radius,
            thickness: 0.2
          },
          materialId: i % 2 === 0 ? 'element-o' : 'element-si',
          operation: 'smoothUnion' as const,
          smoothness: 0.3
        });
      });
      
      return primitives;
    },
    materials: ['element-fe', 'element-o', 'element-si', 'element-mg'],
    shaderUniforms: {
      time: 0,
      explosionIntensity: 3.0,
      shockwaveSpeed: 0.1,
      remnantGlow: 2.5,
      colorShift: [1.0, 0.6, 0.2]
    },
    audioMotif: 'Explosive crescendo with resonant decay',
    hapticPattern: 'supernova_shockwave'
  };
}

/**
 * Stage 6: Galaxies
 * Spiral structure with nebula clouds
 */
function createGalaxiesStage(rng: EnhancedRNG): CosmicStageDescriptor {
  const numSpiralArms = 4;
  const numStarsPerArm = 20;
  const galaxyRadius = 25;
  const spiralTightness = 0.3 + rng.uniform(-0.05, 0.05);

  return {
    stageName: 'Galaxy Formation',
    duration: 18.0,
    description: 'Spiral galaxies emerge from gravitational collapse',
    sdfPrimitives: () => {
      const primitives: SDFPrimitive[] = [
        {
          type: 'sphere' as const,
          position: [0, 0, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [3, 0.5, 3] as [number, number, number],
          parameters: { radius: 3 },
          materialId: 'element-h',
          operation: 'union' as const
        }
      ];
      
      for (let arm = 0; arm < numSpiralArms; arm++) {
        const armAngle = (arm / numSpiralArms) * Math.PI * 2;
        
        for (let star = 0; star < numStarsPerArm; star++) {
          const t = star / numStarsPerArm;
          const r = t * galaxyRadius;
          const theta = armAngle + t * spiralTightness * Math.PI * 4;
          
          const x = r * Math.cos(theta);
          const z = r * Math.sin(theta);
          const y = rng.uniform(-0.5, 0.5);
          
          primitives.push({
            type: 'sphere' as const,
            position: [x, y, z] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [0.3, 0.3, 0.3] as [number, number, number],
            parameters: { radius: 0.3 },
            materialId: 'element-he',
            operation: 'smoothUnion' as const,
            smoothness: 0.2
          });
        }
      }
      
      return primitives;
    },
    materials: ['element-h', 'element-he', 'element-c'],
    shaderUniforms: {
      time: 0,
      rotationSpeed: 0.1,
      armIntensity: 1.2,
      nebulaGlow: 0.8,
      colorShift: [0.4, 0.6, 1.0]
    },
    audioMotif: 'Harmonic chord progression with spatial panning',
    hapticPattern: 'galactic_resonance'
  };
}

/**
 * Stage 7: Molecular Cloud
 * Fog volumes with cylindrical dust lanes
 */
function createMolecularCloudStage(rng: EnhancedRNG): CosmicStageDescriptor {
  const numDustLanes = 12;
  const cloudSize = 30;
  const dustLanePositions: [number, number, number][] = [];
  const dustLaneRotations: [number, number, number][] = [];
  
  for (let i = 0; i < numDustLanes; i++) {
    dustLanePositions.push([
      rng.uniform(-cloudSize/2, cloudSize/2),
      rng.uniform(-cloudSize/2, cloudSize/2),
      rng.uniform(-cloudSize/2, cloudSize/2)
    ]);
    dustLaneRotations.push([
      rng.uniform(0, Math.PI),
      rng.uniform(0, Math.PI),
      rng.uniform(0, Math.PI * 2)
    ]);
  }

  return {
    stageName: 'Molecular Cloud',
    duration: 14.0,
    description: 'Dense molecular clouds collapse under their own gravity',
    sdfPrimitives: () => {
      const primitives: SDFPrimitive[] = [
        {
          type: 'ellipsoid' as const,
          position: [0, 0, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [cloudSize, cloudSize * 0.6, cloudSize * 0.8] as [number, number, number],
          parameters: { 
            rx: cloudSize,
            ry: cloudSize * 0.6,
            rz: cloudSize * 0.8
          },
          materialId: 'element-h',
          operation: 'union' as const
        }
      ];
      
      dustLanePositions.forEach((pos, i) => {
        primitives.push({
          type: 'cylinder' as const,
          position: pos,
          rotation: dustLaneRotations[i],
          scale: [1, 1, 1] as [number, number, number],
          parameters: { 
            height: 8 + rng.uniform(-1, 1),
            radius: 0.5 + rng.uniform(-0.1, 0.1)
          },
          materialId: 'element-c',
          operation: 'smoothUnion' as const,
          smoothness: 0.5
        });
      });
      
      return primitives;
    },
    materials: ['element-h', 'element-c', 'element-o'],
    shaderUniforms: {
      time: 0,
      cloudDensity: 0.6,
      dustOpacity: 0.4,
      turbulence: 2.0,
      colorShift: [0.6, 0.4, 0.3]
    },
    audioMotif: 'Soft wisps with irregular organic sounds',
    hapticPattern: 'nebula_wisps'
  };
}

/**
 * Stage 8: Stellar Furnace
 * Accretion disk with central protostar
 */
function createStellarFurnaceStage(rng: EnhancedRNG): CosmicStageDescriptor {
  const diskRadius = 15;
  const diskThickness = 1.5;
  const numDiskRings = 8;
  const ringPositions: number[] = [];
  
  for (let i = 0; i < numDiskRings; i++) {
    ringPositions.push(3 + i * 1.5 + rng.uniform(-0.3, 0.3));
  }

  return {
    stageName: 'Stellar Furnace',
    duration: 16.0,
    description: 'Protoplanetary disk accretes around young star',
    sdfPrimitives: () => {
      const primitives: SDFPrimitive[] = [
        {
          type: 'sphere' as const,
          position: [0, 0, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [2, 2, 2] as [number, number, number],
          parameters: { radius: 2 },
          materialId: 'element-he',
          operation: 'union' as const
        }
      ];
      
      ringPositions.forEach((radius, i) => {
        primitives.push({
          type: 'torus' as const,
          position: [0, 0, 0] as [number, number, number],
          rotation: [Math.PI / 2, 0, 0] as [number, number, number],
          scale: [1, 1, 1] as [number, number, number],
          parameters: { 
            majorRadius: radius,
            minorRadius: 0.3 + i * 0.05
          },
          materialId: i < 3 ? 'element-fe' : 'element-si',
          operation: 'smoothUnion' as const,
          smoothness: 0.4
        });
      });
      
      return primitives;
    },
    materials: ['element-he', 'element-fe', 'element-si', 'element-mg'],
    shaderUniforms: {
      time: 0,
      accretionRate: 0.8,
      diskTemperature: 2000,
      magneticFieldStrength: 0.7,
      colorShift: [1.0, 0.7, 0.3]
    },
    audioMotif: 'Orbital swooshes with central hum',
    hapticPattern: 'disk_accretion'
  };
}

/**
 * Stage 9: Planetary Accretion
 * Layered planet with core, mantle, crust
 */
function createPlanetaryAccretionStage(rng: EnhancedRNG): CosmicStageDescriptor {
  const coreRadius = 2.0;
  const mantleRadius = 4.5;
  const crustRadius = 5.0;
  const atmosphereRadius = 6.0;
  const numPlanetesimals = 25;
  const planetesimalPositions: [number, number, number][] = [];
  
  for (let i = 0; i < numPlanetesimals; i++) {
    const theta = rng.uniform(0, Math.PI * 2);
    const phi = rng.uniform(0, Math.PI);
    const r = atmosphereRadius + rng.uniform(1, 3);
    
    planetesimalPositions.push([
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    ]);
  }

  return {
    stageName: 'Planetary Accretion',
    duration: 20.0,
    description: 'Planet forms through collisions and gravitational accretion',
    sdfPrimitives: () => {
      const primitives: SDFPrimitive[] = [
        {
          type: 'sphere' as const,
          position: [0, 0, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [coreRadius, coreRadius, coreRadius] as [number, number, number],
          parameters: { radius: coreRadius },
          materialId: 'element-fe',
          operation: 'union' as const
        },
        {
          type: 'sphere' as const,
          position: [0, 0, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [mantleRadius, mantleRadius, mantleRadius] as [number, number, number],
          parameters: { radius: mantleRadius },
          materialId: 'element-mg',
          operation: 'smoothUnion' as const,
          smoothness: 0.3
        },
        {
          type: 'sphere' as const,
          position: [0, 0, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [crustRadius, crustRadius, crustRadius] as [number, number, number],
          parameters: { radius: crustRadius },
          materialId: 'element-si',
          operation: 'smoothUnion' as const,
          smoothness: 0.2
        },
        {
          type: 'sphere' as const,
          position: [0, 0, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [atmosphereRadius, atmosphereRadius, atmosphereRadius] as [number, number, number],
          parameters: { radius: atmosphereRadius },
          materialId: 'element-o',
          operation: 'smoothUnion' as const,
          smoothness: 0.5
        }
      ];
      
      planetesimalPositions.forEach(pos => {
        primitives.push({
          type: 'sphere' as const,
          position: pos,
          rotation: [0, 0, 0] as [number, number, number],
          scale: [0.3, 0.3, 0.3] as [number, number, number],
          parameters: { radius: 0.3 },
          materialId: 'element-c',
          operation: 'smoothUnion' as const,
          smoothness: 0.2
        });
      });
      
      return primitives;
    },
    materials: ['element-fe', 'element-mg', 'element-si', 'element-o', 'element-c'],
    shaderUniforms: {
      time: 0,
      layerTransition: 0.5,
      coreGlow: 1.5,
      surfaceRoughness: 0.8,
      colorShift: [0.5, 0.4, 0.3]
    },
    audioMotif: 'Rhythmic impacts with increasing frequency',
    hapticPattern: 'planetesimal_impacts'
  };
}
