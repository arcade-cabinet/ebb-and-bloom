import type { World } from '../World';
import type { GovernorIntent } from '../../../agents/controllers/GovernorActionPort';
import type { GenesisConstants } from '../../genesis/GenesisConstants';
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';

export class GovernorActionExecutor {
  private world: World;
  private genesis: GenesisConstants;
  private scene: THREE.Scene;

  constructor(world: World, genesis: GenesisConstants, scene: THREE.Scene) {
    this.world = world;
    this.genesis = genesis;
    this.scene = scene;
  }

  async execute(intent: GovernorIntent): Promise<void> {
    console.log(`[GovernorActionExecutor] Executing: ${intent.type}`, intent);

    switch (intent.type) {
      case 'smitePredator':
        await this.executeSmitePredator(intent);
        break;
      case 'nurtureFood':
        await this.executeNurtureFood(intent);
        break;
      case 'shapeTerrain':
        await this.executeShapeTerrain(intent);
        break;
      case 'applyPressure':
        await this.executeApplyPressure(intent);
        break;
      case 'selectPrey':
        await this.executeSelectPrey(intent);
        break;
      case 'formAlliance':
        await this.executeFormAlliance(intent);
        break;
      case 'migrate':
        await this.executeMigrate(intent);
        break;
      default:
        console.warn(`[GovernorActionExecutor] Unknown action: ${intent.type}`);
    }
  }

  private async executeSmitePredator(intent: GovernorIntent): Promise<void> {
    if (typeof intent.target !== 'string') return;
    
    const predator = this.world.getEntityById(intent.target);
    if (!predator) {
      console.warn(`[Smite] Predator ${intent.target} not found`);
      return;
    }

    if (predator.mass) {
      const damage = (intent.magnitude || 0.5) * predator.mass;
      predator.mass = Math.max(0, predator.mass - damage);
      
      if (predator.mass <= 0) {
        this.world.remove(predator);
        if (predator.mesh) {
          this.scene.remove(predator.mesh as THREE.Object3D);
        }
        console.log(`[Smite] Destroyed predator ${intent.target}`);
      }
    }
  }

  private async executeNurtureFood(intent: GovernorIntent): Promise<void> {
    if (!(intent.target && typeof intent.target === 'object')) return;
    
    const position = intent.target as { x: number; y: number; z: number };
    const magnitude = intent.magnitude || 0.5;
    const foodCount = Math.floor(magnitude * 10);

    for (let i = 0; i < foodCount; i++) {
      const offset = {
        x: (Math.random() - 0.5) * 10,
        y: 0,
        z: (Math.random() - 0.5) * 10
      };
      const foodPos = {
        x: position.x + offset.x,
        y: position.y + offset.y,
        z: position.z + offset.z
      };

      const foodGeo = new THREE.SphereGeometry(0.5, 8, 8);
      const foodMat = new THREE.MeshStandardMaterial({ color: 0x90EE90 });
      const foodMesh = new THREE.Mesh(foodGeo, foodMat);
      foodMesh.position.set(foodPos.x, foodPos.y, foodPos.z);
      foodMesh.castShadow = true;
      this.scene.add(foodMesh);

      this.world.add({
        entityId: uuidv4(),
        scale: 'organismal',
        mass: 1,
        position: foodPos,
        velocity: { x: 0, y: 0, z: 0 },
        temperature: this.genesis.getSurfaceTemperature(),
        elementCounts: { 'C': 10, 'O': 5, 'H': 10, 'N': 1 },
        genome: 'FOOD_PLANT_GENOME',
        phenotype: { species: 'berry', edible: true },
        mesh: foodMesh,
        visible: true,
        castShadow: true,
      });
    }

    console.log(`[Nurture] Spawned ${foodCount} food items at (${position.x}, ${position.z})`);
  }

  private async executeShapeTerrain(intent: GovernorIntent): Promise<void> {
    if (!(intent.target && typeof intent.target === 'object')) return;
    
    const position = intent.target as { x: number; y: number; z: number };
    const magnitude = intent.magnitude || 0.5;
    
    const nearbyTerrain = this.world.queryRadius(position, 50);
    
    for (const entity of nearbyTerrain) {
      if (entity.scale === 'structural' && entity.mesh && entity.position) {
        const heightDelta = (magnitude - 0.5) * 20;
        entity.position.y += heightDelta;
        
        const mesh = entity.mesh as THREE.Mesh;
        mesh.position.y = entity.position.y;
      }
    }
    
    console.log(`[ShapeTerrain] Modified terrain at (${position.x}, ${position.z})`);
  }

  private async executeApplyPressure(intent: GovernorIntent): Promise<void> {
    if (!(intent.target && typeof intent.target === 'object')) return;
    
    const position = intent.target as { x: number; y: number; z: number };
    const magnitude = intent.magnitude || 0.5;
    
    const nearbyCreatures = this.world.queryRadius(position, 30)
      .filter(e => e.genome);
    
    for (const creature of nearbyCreatures) {
      if (creature.temperature) {
        const tempDelta = (magnitude - 0.5) * 100;
        creature.temperature += tempDelta;
      }
      
      if (creature.energyStores !== undefined) {
        const energyLoss = magnitude * 50;
        creature.energyStores = Math.max(0, creature.energyStores - energyLoss);
      }
    }
    
    console.log(`[Pressure] Applied stress to ${nearbyCreatures.length} creatures`);
  }

  private async executeSelectPrey(intent: GovernorIntent): Promise<void> {
    console.log(`[SelectPrey] Marked ${intent.target} as prey target`);
  }

  private async executeFormAlliance(intent: GovernorIntent): Promise<void> {
    console.log(`[Alliance] Formed alliance with ${intent.target}`);
  }

  private async executeMigrate(intent: GovernorIntent): Promise<void> {
    if (!(intent.target && typeof intent.target === 'object')) return;
    
    const newPosition = intent.target as { x: number; y: number; z: number };
    console.log(`[Migrate] Moving species to (${newPosition.x}, ${newPosition.z})`);
  }
}
