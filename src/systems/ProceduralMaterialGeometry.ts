/**
 * Procedural Material Geometry Generator
 * 
 * Generates 3D geometry for raw materials using procedural techniques.
 * NO MESHY API NEEDED - just deformed spheres + AmbientCG textures.
 * 
 * Material visualization:
 * - Ores: Deformed spheres/cubes with metallic textures
 * - Crystals: Faceted polyhedrons with refractive textures
 * - Stones: Irregular blobs with rock textures
 * - Organic: Cluster of spheres with organic textures
 * - Liquids: Smooth sphere with translucent shader
 */

import * as THREE from 'three';
import seedrandom from 'seedrandom';

export type MaterialShape = 'spherical' | 'cubic' | 'irregular' | 'crystalline' | 'layered';
export type MaterialCategory = 'stone' | 'ore' | 'crystal' | 'organic' | 'liquid';

/**
 * Generate procedural geometry for a material
 */
export function generateMaterialGeometry(
  category: MaterialCategory,
  shape: MaterialShape,
  size: number,
  seed: string
): THREE.BufferGeometry {
  const rng = seedrandom(seed);

  switch (shape) {
    case 'spherical':
      return generateSphericalGeometry(size, rng);
    
    case 'cubic':
      return generateCubicGeometry(size, rng);
    
    case 'irregular':
      return generateIrregularGeometry(size, rng);
    
    case 'crystalline':
      return generateCrystallineGeometry(size, rng);
    
    case 'layered':
      return generateLayeredGeometry(size, rng);
    
    default:
      return generateSphericalGeometry(size, rng);
  }
}

/**
 * Spherical geometry (for ores, organic materials)
 * Deformed sphere with noise
 */
function generateSphericalGeometry(size: number, rng: seedrandom.PRNG): THREE.BufferGeometry {
  const geometry = new THREE.SphereGeometry(size, 16, 12);
  
  // Apply noise deformation
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    // Add random deformation
    const deformAmount = 0.2; // 20% deformation
    const noiseX = (rng() - 0.5) * deformAmount * size;
    const noiseY = (rng() - 0.5) * deformAmount * size;
    const noiseZ = (rng() - 0.5) * deformAmount * size;
    
    positions.setXYZ(
      i,
      x + noiseX,
      y + noiseY,
      z + noiseZ
    );
  }
  
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Cubic geometry (for stone, structural materials)
 * Beveled cube with edge wear
 */
function generateCubicGeometry(size: number, rng: seedrandom.PRNG): THREE.BufferGeometry {
  const geometry = new THREE.BoxGeometry(size, size, size, 3, 3, 3);
  
  // Apply edge beveling/wear
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    // Bevel corners
    const bevelAmount = 0.15; // 15% bevel
    const factor = 1 - bevelAmount * (rng() * 0.5 + 0.5);
    
    positions.setXYZ(
      i,
      x * factor,
      y * factor,
      z * factor
    );
  }
  
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Irregular geometry (for rocks, rough materials)
 * Random blob shape
 */
function generateIrregularGeometry(size: number, rng: seedrandom.PRNG): THREE.BufferGeometry {
  const geometry = new THREE.IcosahedronGeometry(size, 1);
  
  // Heavy random deformation
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    // Large random deformation
    const deformAmount = 0.4; // 40% deformation
    const scale = 0.5 + rng() * 0.7; // 0.5-1.2 scale
    
    positions.setXYZ(
      i,
      x * scale,
      y * scale,
      z * scale
    );
  }
  
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Crystalline geometry (for crystals, gems)
 * Faceted polyhedron
 */
function generateCrystallineGeometry(size: number, rng: seedrandom.PRNG): THREE.BufferGeometry {
  // Use octahedron as base (crystal shape)
  const geometry = new THREE.OctahedronGeometry(size, 0);
  
  // Scale faces to create crystal facets
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    // Elongate vertically for crystal shape
    const yScale = 1.2 + rng() * 0.4; // 1.2-1.6 vertical stretch
    
    positions.setXYZ(
      i,
      x,
      y * yScale,
      z
    );
  }
  
  // Don't compute smooth normals - keep faceted look
  return geometry;
}

/**
 * Layered geometry (for sedimentary materials, stratified rocks)
 * Stacked disc shapes
 */
function generateLayeredGeometry(size: number, rng: seedrandom.PRNG): THREE.BufferGeometry {
  const layers = 3 + Math.floor(rng() * 3); // 3-5 layers
  const geometry = new THREE.CylinderGeometry(
    size * 0.8,
    size,
    size * 0.6,
    12,
    layers,
    false
  );
  
  // Randomize layer heights
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    
    // Add layer variation
    const layerNoise = (rng() - 0.5) * 0.1 * size;
    
    positions.setY(i, y + layerNoise);
  }
  
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Create a material mesh from procedural geometry + texture
 */
export function createMaterialMesh(
  category: MaterialCategory,
  shape: MaterialShape,
  size: number,
  seed: string,
  texture: THREE.Texture | null = null
): THREE.Mesh {
  const geometry = generateMaterialGeometry(category, shape, size, seed);
  
  // Create material with texture if available
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: getCategoryRoughness(category),
    metalness: getCategoryMetalness(category),
    color: texture ? 0xffffff : getCategoryColor(category),
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  return mesh;
}

/**
 * Get roughness value based on material category
 */
function getCategoryRoughness(category: MaterialCategory): number {
  switch (category) {
    case 'crystal': return 0.1; // Smooth, reflective
    case 'liquid': return 0.0; // Very smooth
    case 'ore': return 0.6; // Moderately rough
    case 'stone': return 0.8; // Very rough
    case 'organic': return 0.7; // Rough
    default: return 0.5;
  }
}

/**
 * Get metalness value based on material category
 */
function getCategoryMetalness(category: MaterialCategory): number {
  switch (category) {
    case 'ore': return 0.8; // Metallic
    case 'crystal': return 0.3; // Semi-metallic
    case 'liquid': return 0.0; // Non-metallic
    case 'stone': return 0.0; // Non-metallic
    case 'organic': return 0.0; // Non-metallic
    default: return 0.0;
  }
}

/**
 * Get default color based on material category (if no texture)
 */
function getCategoryColor(category: MaterialCategory): number {
  switch (category) {
    case 'ore': return 0x8b7355; // Brownish metal
    case 'crystal': return 0xe0e0ff; // Light blue
    case 'stone': return 0x808080; // Gray
    case 'organic': return 0x556b2f; // Olive green
    case 'liquid': return 0x4169e1; // Royal blue
    default: return 0xcccccc;
  }
}
