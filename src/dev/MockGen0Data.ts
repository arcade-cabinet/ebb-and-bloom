/**
 * Mock Generation 0 Data Generator
 * 
 * Generates deterministic planetary data without AI API calls.
 * Used for testing and development when OPENAI_API_KEY is not available.
 */

import seedrandom from 'seedrandom';
import type {
  GenerationZeroOutput,
  PlanetaryManifest,
  PlanetaryCore,
  SharedMaterial,
  FillMaterial,
  CoreSpecialistManifest,
  CoreSpecificMaterial,
  CreatureArchetype,
} from '../core/generation-zero-types';

/**
 * Generate mock Gen 0 data from seed phrase
 * Deterministic: same seed = same output
 */
export function generateMockGen0(seedPhrase: string): GenerationZeroOutput {
  const rng = seedrandom(seedPhrase);
  
  const planetNames = [
    'Ferros Prime', 'Crystalia', 'Magmara', 'Glacius', 
    'Verdantia', 'Umbralis', 'Luminara', 'Tectonix'
  ];
  
  const themes = [
    'Volcanic Hellscape', 'Crystalline Paradise', 'Frozen Wasteland',
    'Lush Jungle World', 'Desert Expanse', 'Oceanic Depths',
    'Gaseous Anomaly', 'Tectonic Nightmare'
  ];
  
  const planetName = planetNames[Math.floor(rng() * planetNames.length)];
  const theme = themes[Math.floor(rng() * themes.length)];
  
  // Generate fill material
  const fillMaterial = generateMockFillMaterial(rng);
  
  // Generate 8 cores
  const cores = generateMockCores(rng);
  
  // Generate shared materials
  const sharedMaterials = generateMockSharedMaterials(rng);
  
  const planetary: PlanetaryManifest = {
    seedPhrase,
    planetaryName: planetName,
    worldTheme: theme,
    fillMaterial,
    cores,
    sharedMaterials,
  };
  
  // Generate core-specific content
  const coreManifests = cores.map(core => 
    generateMockCoreManifest(core, rng)
  );
  
  return {
    planetary,
    coreManifests,
  };
}

function generateMockFillMaterial(rng: seedrandom.PRNG): FillMaterial {
  const types: Array<'soil' | 'water' | 'cork' | 'ash' | 'sand'> = 
    ['soil', 'water', 'cork', 'ash', 'sand'];
  
  const type = types[Math.floor(rng() * types.length)];
  
  const names = {
    soil: 'Loamy Soil',
    water: 'Saline Water',
    cork: 'Fungal Cork',
    ash: 'Volcanic Ash',
    sand: 'Fine Sand',
  };
  
  return {
    name: names[type],
    type,
    density: Math.floor(rng() * 5) + 4,
    permeability: Math.floor(rng() * 6) + 3,
    oxygenation: Math.floor(rng() * 7) + 2,
    lightPenetration: Math.floor(rng() * 5) + 1,
    waterRetention: Math.floor(rng() * 6) + 3,
    description: `${names[type]} - procedurally generated fill material`,
  };
}

function generateMockCores(rng: seedrandom.PRNG): PlanetaryCore[] {
  const coreTypes = [
    { name: 'Ferrite Core', element: 'Iron', color: '#8B4513' },
    { name: 'Crystalline Core', element: 'Quartz', color: '#E0E0FF' },
    { name: 'Magma Core', element: 'Basalt', color: '#FF4500' },
    { name: 'Frozen Core', element: 'Ice', color: '#ADD8E6' },
    { name: 'Biomass Core', element: 'Carbon', color: '#228B22' },
    { name: 'Void Core', element: 'Shadow', color: '#1a1a1a' },
    { name: 'Prismatic Core', element: 'Light', color: '#FFD700' },
    { name: 'Tectonic Core', element: 'Stone', color: '#696969' },
  ];
  
  return coreTypes.map(core => ({
    name: core.name,
    description: `${core.name} rich in ${core.element}`,
    color: core.color,
    dominantElement: core.element,
    temperature: Math.floor(rng() * 6) + 3,
    pressure: Math.floor(rng() * 6) + 3,
    stability: Math.floor(rng() * 6) + 2,
    meshyPrompt: `${core.name} geological formation, ${core.element}, PBR textures`,
  }));
}

function generateMockSharedMaterials(rng: seedrandom.PRNG): SharedMaterial[] {
  const materials = [
    { name: 'Iron', category: 'ore' as const },
    { name: 'Quartz', category: 'crystal' as const },
    { name: 'Coal', category: 'ore' as const },
    { name: 'Limestone', category: 'stone' as const },
    { name: 'Copper', category: 'ore' as const },
    { name: 'Salt', category: 'crystal' as const },
    { name: 'Clay', category: 'organic' as const },
  ];
  
  const count = Math.floor(rng() * 3) + 5; // 5-7 materials
  const selected = materials.slice(0, count);
  
  return selected.map(mat => ({
    name: mat.name,
    category: mat.category,
    affinityTypes: ['METAL', 'BIND'],
    rarity: rng() * 0.5 + 0.3, // 0.3-0.8
    baseDepth: Math.floor(rng() * 30) + 5, // 5-35m
    hardness: Math.floor(rng() * 6) + 3, // 3-8
    description: `${mat.name} - shared material found across multiple cores`,
  }));
}

function generateMockCoreManifest(
  core: PlanetaryCore, 
  rng: seedrandom.PRNG
): CoreSpecialistManifest {
  const materialCount = Math.floor(rng() * 3) + 2; // 2-4 materials
  const creatureCount = Math.floor(rng() * 2) + 1; // 1-2 creatures
  
  const materials: CoreSpecificMaterial[] = [];
  for (let i = 0; i < materialCount; i++) {
    materials.push({
      name: `${core.dominantElement} Compound ${i + 1}`,
      coreName: core.name,
      category: 'ore' as const,
      depth: Math.floor(rng() * 30) + 10, // 10-40m
      density: Math.floor(rng() * 6) + 4, // 4-9
      attraction: Math.floor(rng() * 7) + 3, // 3-9
      cohesion: Math.floor(rng() * 7) + 3, // 3-9
      mass: Math.floor(rng() * 6) + 4, // 4-9
      size: Math.floor(rng() * 6) + 3, // 3-8
      shape: ['spherical', 'cubic', 'irregular', 'crystalline', 'layered'][
        Math.floor(rng() * 5)
      ] as any,
      description: `Material unique to ${core.name}`,
    });
  }
  
  const creatures: CreatureArchetype[] = [];
  for (let i = 0; i < creatureCount; i++) {
    creatures.push({
      name: `${core.name} Dweller ${i + 1}`,
      coreName: core.name,
      category: ['terrestrial', 'aquatic', 'aerial', 'subterranean'][
        Math.floor(rng() * 4)
      ] as any,
      size: Math.floor(rng() * 7) + 3, // 3-9
      mobility: Math.floor(rng() * 7) + 3, // 3-9
      manipulation: Math.floor(rng() * 7) + 2, // 2-8
      intelligence: Math.floor(rng() * 7) + 2, // 2-8
      socialTendency: Math.floor(rng() * 8) + 2, // 2-9
      aggression: Math.floor(rng() * 8) + 1, // 1-8
      description: `Creature adapted to ${core.name} environment`,
      meshyPrompt: `Creature from ${core.name}, stylized game model`,
    });
  }
  
  return {
    coreName: core.name,
    materials,
    creatures,
  };
}
