/**
 * Planetary Accretion System
 * 
 * BUILDS THE PLANET FROM THE CORE OUTWARD using Yuka cohesion.
 * 
 * Process:
 * 1. Place planetary core at world center
 * 2. Spawn material spheres around core
 * 3. Materials gravitate inward via Yuka CohesionBehavior
 * 4. Dense materials sink, light materials rise
 * 5. Similar materials cluster via affinity
 * 6. Materials settle when colliding
 * 7. Layers form naturally
 * 8. Fill material occupies gaps
 * 9. Result: DIGGABLE PLANETARY SURFACE
 * 
 * This runs ONCE during Gen 0, then the planet is "baked".
 * Materials become static, queryable entities that can be removed (digging).
 */

import { World } from 'miniplex';
import * as THREE from 'three';
import * as YUKA from 'yuka';
import seedrandom from 'seedrandom';
import { log } from '../utils/Logger';
import type { WorldSchema, Transform, YukaAgent } from '../world/ECSWorld';
import type { 
  PlanetaryManifest, 
  PlanetaryCore,
  SharedMaterial,
  CoreSpecificMaterial,
  FillMaterial 
} from '../core/generation-zero-types';
import { generateMaterialGeometry } from './ProceduralMaterialGeometry';

/**
 * Material entity during accretion (has physics)
 */
interface AccretingMaterial {
  id: string;
  name: string;
  category: 'stone' | 'ore' | 'crystal' | 'organic' | 'liquid';
  shape: 'spherical' | 'cubic' | 'irregular' | 'crystalline' | 'layered';
  
  // Physics properties
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  density: number; // 0-10
  size: number; // Radius in meters
  mass: number;
  
  // Yuka properties
  vehicle: YUKA.Vehicle;
  cohesion: number; // 0-10 (attraction to similar materials)
  affinity: string[]; // Affinity types
  
  // State
  settled: boolean; // Has stopped moving
  depth: number; // Final depth (calculated after settling)
  
  // Visual
  mesh: THREE.Mesh;
}

/**
 * Planetary Accretion System
 * Simulates planetary formation using Yuka physics
 */
class PlanetaryAccretionSystem {
  private world: World<WorldSchema>;
  private manifest: PlanetaryManifest | null = null;
  
  // Core
  private corePosition = new THREE.Vector3(0, 0, 0);
  private coreRadius = 5; // meters
  private coreAttraction = 10; // Force strength
  
  // Materials
  private materials: AccretingMaterial[] = [];
  private settled = false;
  private settledCount = 0;
  
  // Simulation
  private simulationTime = 0;
  private maxSimulationTime = 30; // 30 seconds max
  private gravity = new THREE.Vector3(0, -9.8, 0);
  
  // Yuka
  private yukaEntityManager: YUKA.EntityManager;
  
  constructor(world: World<WorldSchema>) {
    this.world = world;
    this.yukaEntityManager = new YUKA.EntityManager();
    
    log.info('PlanetaryAccretionSystem initialized');
  }
  
  /**
   * Start planetary accretion simulation
   */
  async accretePlanet(manifest: PlanetaryManifest): Promise<void> {
    this.manifest = manifest;
    
    log.info('=== PLANETARY ACCRETION STARTING ===');
    log.info(`Planet: ${manifest.planetaryName}`);
    log.info(`Core: ${manifest.cores[0].name}`);
    log.info(`Materials: ${manifest.sharedMaterials.length} shared + core-specific`);
    
    // Step 1: Initialize core
    this.initializeCore(manifest.cores[0]);
    
    // Step 2: Generate material spheres around core
    this.generateMaterialSphere(manifest);
    
    // Step 3: Run physics simulation
    await this.runAccretionSimulation();
    
    // Step 4: Finalize planetary structure
    this.finalizePlanet();
    
    log.info('=== PLANETARY ACCRETION COMPLETE ===');
    log.info(`Materials settled: ${this.settledCount}/${this.materials.length}`);
    log.info(`Deepest material: ${this.getDeepestMaterial().depth.toFixed(1)}m`);
    log.info(`Surface materials: ${this.getSurfaceMaterials().length}`);
  }
  
  /**
   * Initialize planetary core
   */
  private initializeCore(core: PlanetaryCore): void {
    // Core is stationary attractor at world center
    log.info(`Core initialized at (0, 0, 0)`, {
      element: core.dominantElement,
      temperature: core.temperature,
      pressure: core.pressure,
    });
  }
  
  /**
   * Generate material spheres around core
   */
  private generateMaterialSphere(manifest: PlanetaryManifest): void {
    const rng = seedrandom(manifest.seedPhrase);
    const initialRadius = 50; // Spawn materials 50m from core
    const materialsPerRing = 8;
    const rings = 5; // 5 rings = 40 materials
    
    let materialId = 0;
    
    // Spawn shared materials
    manifest.sharedMaterials.forEach(mat => {
      for (let ring = 0; ring < rings; ring++) {
        const angle = (materialId % materialsPerRing) * (Math.PI * 2 / materialsPerRing);
        const radius = initialRadius + ring * 10;
        
        const position = new THREE.Vector3(
          Math.cos(angle) * radius,
          (rng() - 0.5) * 20, // Some vertical variance
          Math.sin(angle) * radius
        );
        
        this.createMaterialEntity(
          `${mat.name}-${materialId}`,
          mat.name,
          mat.category,
          position,
          mat.hardness, // Used as density
          mat.baseDepth, // Initial size hint
          ['METAL', 'BIND'], // Simplified affinity
          manifest.seedPhrase,
          rng
        );
        
        materialId++;
      }
    });
    
    log.info(`Generated ${this.materials.length} material entities in sphere`);
  }
  
  /**
   * Create individual material entity
   */
  private createMaterialEntity(
    id: string,
    name: string,
    category: 'stone' | 'ore' | 'crystal' | 'organic' | 'liquid',
    position: THREE.Vector3,
    density: number,
    sizeHint: number,
    affinity: string[],
    seed: string,
    rng: seedrandom.PRNG
  ): void {
    // Determine shape based on category
    const shapes: Record<string, any> = {
      stone: 'irregular',
      ore: 'spherical',
      crystal: 'crystalline',
      organic: 'spherical',
      liquid: 'spherical',
    };
    const shape = shapes[category] || 'spherical';
    
    // Size based on hint (normalized)
    const size = 0.3 + (sizeHint / 50) * 0.5; // 0.3-0.8m radius
    
    // Create Yuka vehicle
    const vehicle = new YUKA.Vehicle();
    vehicle.position.copy(position as any);
    vehicle.maxSpeed = 10;
    vehicle.maxForce = 5;
    
    // Add steering behaviors
    const cohesionBehavior = new YUKA.CohesionBehavior();
    cohesionBehavior.weight = 2.0;
    vehicle.steering.add(cohesionBehavior);
    
    const separationBehavior = new YUKA.SeparationBehavior();
    separationBehavior.weight = 1.5;
    vehicle.steering.add(separationBehavior);
    
    this.yukaEntityManager.add(vehicle);
    
    // Create visual mesh
    const geometry = generateMaterialGeometry(category, shape, size, `${seed}-${id}`);
    const material = new THREE.MeshStandardMaterial({
      color: this.getCategoryColor(category),
      roughness: 0.7,
      metalness: category === 'ore' ? 0.8 : 0.0,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Create accreting material
    const accretingMaterial: AccretingMaterial = {
      id,
      name,
      category,
      shape,
      position: position.clone(),
      velocity: new THREE.Vector3(0, 0, 0),
      density,
      size,
      mass: density * size * size * size, // Approximation
      vehicle,
      cohesion: density, // Higher density = stronger cohesion
      affinity,
      settled: false,
      depth: 0,
      mesh,
    };
    
    this.materials.push(accretingMaterial);
  }
  
  /**
   * Run physics simulation
   */
  private async runAccretionSimulation(): Promise<void> {
    log.info('Starting accretion simulation...');
    
    const deltaTime = 0.016; // ~60 FPS
    const maxSteps = (this.maxSimulationTime / deltaTime);
    let steps = 0;
    
    while (!this.settled && steps < maxSteps) {
      this.updateAccretion(deltaTime);
      steps++;
      
      // Log progress every second
      if (steps % 60 === 0) {
        const progress = (this.settledCount / this.materials.length * 100).toFixed(0);
        log.info(`Accretion progress: ${progress}% (${this.settledCount}/${this.materials.length} settled)`);
      }
    }
    
    this.settled = true;
    log.info(`Accretion simulation complete in ${(steps * deltaTime).toFixed(1)}s`);
  }
  
  /**
   * Update physics for one frame
   */
  private updateAccretion(deltaTime: number): void {
    this.simulationTime += deltaTime;
    
    // Update Yuka
    this.yukaEntityManager.update(deltaTime);
    
    // Update each material
    for (const material of this.materials) {
      if (material.settled) continue;
      
      // 1. Core attraction (pulls toward center)
      const toCoreDirection = new THREE.Vector3()
        .subVectors(this.corePosition, material.position)
        .normalize();
      const toCoreDistance = material.position.distanceTo(this.corePosition);
      const coreForce = toCoreDirection.multiplyScalar(
        this.coreAttraction / (toCoreDistance * toCoreDistance) // Inverse square law
      );
      
      // 2. Gravity (pulls downward based on density)
      const gravityForce = this.gravity.clone().multiplyScalar(material.density / 10);
      
      // 3. Apply forces
      material.velocity.add(coreForce.multiplyScalar(deltaTime));
      material.velocity.add(gravityForce.multiplyScalar(deltaTime));
      
      // 4. Update position
      material.position.add(material.velocity.clone().multiplyScalar(deltaTime));
      material.vehicle.position.copy(material.position as any);
      material.mesh.position.copy(material.position);
      
      // 5. Collision detection (simple sphere vs core sphere)
      const distanceToCore = material.position.distanceTo(this.corePosition);
      if (distanceToCore < this.coreRadius + material.size) {
        // Settled on core
        material.settled = true;
        material.velocity.set(0, 0, 0);
        material.depth = -material.position.y; // Depth is negative Y
        this.settledCount++;
      }
      
      // 6. Check for low velocity (settled in layer)
      if (material.velocity.length() < 0.1 && !material.settled) {
        material.settled = true;
        material.velocity.set(0, 0, 0);
        material.depth = -material.position.y;
        this.settledCount++;
      }
    }
    
    // Check if all settled
    if (this.settledCount >= this.materials.length) {
      this.settled = true;
    }
  }
  
  /**
   * Finalize planet structure
   */
  private finalizePlanet(): void {
    // Calculate final depths
    for (const material of this.materials) {
      material.depth = -material.position.y; // Y=0 is surface, negative is underground
    }
    
    // Sort by depth
    this.materials.sort((a, b) => b.depth - a.depth); // Deepest first
    
    log.info('Planet structure finalized');
    log.info(`Depth range: ${this.getDeepestMaterial().depth.toFixed(1)}m to ${this.getShallowestMaterial().depth.toFixed(1)}m`);
  }
  
  /**
   * Get all settled materials
   */
  getSettledMaterials(): AccretingMaterial[] {
    return this.materials.filter(m => m.settled);
  }
  
  /**
   * Get surface materials (depth < 5m)
   */
  getSurfaceMaterials(): AccretingMaterial[] {
    return this.materials.filter(m => m.settled && m.depth < 5);
  }
  
  /**
   * Get deepest material
   */
  private getDeepestMaterial(): AccretingMaterial {
    return this.materials.reduce((deepest, m) => 
      m.depth > deepest.depth ? m : deepest
    );
  }
  
  /**
   * Get shallowest material
   */
  private getShallowestMaterial(): AccretingMaterial {
    return this.materials.reduce((shallowest, m) => 
      m.depth < shallowest.depth ? m : shallowest
    );
  }
  
  /**
   * Get materials in area (for digging queries)
   */
  getMaterialsInArea(centerX: number, centerZ: number, radius: number): AccretingMaterial[] {
    const center = new THREE.Vector2(centerX, centerZ);
    return this.materials.filter(m => {
      const pos = new THREE.Vector2(m.position.x, m.position.z);
      return pos.distanceTo(center) <= radius;
    });
  }
  
  /**
   * Remove material (digging)
   */
  removeMaterial(materialId: string): boolean {
    const index = this.materials.findIndex(m => m.id === materialId);
    if (index === -1) return false;
    
    const material = this.materials[index];
    
    // Remove mesh from scene (would be done by renderer)
    // Remove from list
    this.materials.splice(index, 1);
    
    log.info(`Material removed: ${material.name} at depth ${material.depth.toFixed(1)}m`);
    return true;
  }
  
  /**
   * Get category color
   */
  private getCategoryColor(category: string): number {
    const colors: Record<string, number> = {
      ore: 0x8b7355,
      crystal: 0xe0e0ff,
      stone: 0x808080,
      organic: 0x556b2f,
      liquid: 0x4169e1,
    };
    return colors[category] || 0xcccccc;
  }
}

export default PlanetaryAccretionSystem;
