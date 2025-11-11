import type { World } from '../World';
import type { GovernorIntent } from '../../../agents/controllers/GovernorActionPort';
import type { GenesisConstants } from '../../genesis/GenesisConstants';
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';
import { intentLogger } from '../../logging/logger';

export class GovernorActionExecutor {
  private world: World;
  private genesis: GenesisConstants;
  private scene: THREE.Scene;

  constructor(world: World, genesis: GenesisConstants, scene: THREE.Scene) {
    this.world = world;
    this.genesis = genesis;
    this.scene = scene;
  }

  async execute(intent: GovernorIntent): Promise<boolean> {
    intentLogger.debug({
      type: intent.type,
      target: intent.target,
      magnitude: intent.magnitude,
    }, 'Executing governor intent');

    let success = false;
    
    switch (intent.type) {
      case 'smitePredator':
        success = await this.executeSmitePredator(intent);
        break;
      case 'nurtureFood':
        success = await this.executeNurtureFood(intent);
        break;
      case 'shapeTerrain':
        success = await this.executeShapeTerrain(intent);
        break;
      case 'applyPressure':
        success = await this.executeApplyPressure(intent);
        break;
      case 'selectPrey':
        success = await this.executeSelectPrey(intent);
        break;
      case 'formAlliance':
        success = await this.executeFormAlliance(intent);
        break;
      case 'migrate':
        success = await this.executeMigrate(intent);
        break;
      default:
        intentLogger.warn({ type: intent.type }, 'Unknown action type');
        return false;
    }
    
    if (success) {
      intentLogger.info({ type: intent.type }, 'Intent executed successfully');
    } else {
      intentLogger.warn({ type: intent.type }, 'Intent execution failed or aborted');
    }
    
    return success;
  }

  private async executeSmitePredator(intent: GovernorIntent): Promise<boolean> {
    if (typeof intent.target !== 'string') {
      intentLogger.warn('Invalid target type for smitePredator');
      return false;
    }
    
    const predator = this.world.getEntityById(intent.target);
    if (!predator) {
      intentLogger.warn({ target: intent.target }, 'Predator not found');
      return false;
    }

    if (predator.mass) {
      const damage = (intent.magnitude || 0.5) * predator.mass;
      const originalMass = predator.mass;
      predator.mass = Math.max(0, predator.mass - damage);
      
      if (predator.mass <= 0) {
        this.world.remove(predator);
        if (predator.mesh) {
          this.scene.remove(predator.mesh as THREE.Object3D);
        }
        intentLogger.info({
          target: intent.target,
          originalMass,
          damage,
        }, 'Predator destroyed');
      } else {
        intentLogger.debug({
          target: intent.target,
          originalMass,
          newMass: predator.mass,
          damage,
        }, 'Predator damaged');
      }
    }
    return true;
  }

  private async executeNurtureFood(intent: GovernorIntent): Promise<boolean> {
    if (!(intent.target && typeof intent.target === 'object')) {
      intentLogger.warn('Invalid target type for nurtureFood');
      return false;
    }
    
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

    intentLogger.info({
      foodCount,
      position: { x: position.x, z: position.z },
      magnitude,
    }, 'Nurture food executed');
    return true;
  }

  private async executeShapeTerrain(intent: GovernorIntent): Promise<boolean> {
    if (!(intent.target && typeof intent.target === 'object')) {
      intentLogger.warn('Invalid target type for shapeTerrain');
      return false;
    }
    
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
    
    intentLogger.info({
      position: { x: position.x, z: position.z },
      magnitude,
      terrainCount: nearbyTerrain.length,
    }, 'Shape terrain executed');
    return true;
  }

  private async executeApplyPressure(intent: GovernorIntent): Promise<boolean> {
    if (!(intent.target && typeof intent.target === 'object')) {
      intentLogger.warn('Invalid target type for applyPressure');
      return false;
    }
    
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
    
    intentLogger.info({
      creatureCount: nearbyCreatures.length,
      position: { x: position.x, z: position.z },
      magnitude,
    }, 'Apply pressure executed');
    return true;
  }

  private async executeSelectPrey(intent: GovernorIntent): Promise<boolean> {
    intentLogger.info({ target: intent.target }, 'Select prey executed');
    return true;
  }

  private async executeFormAlliance(intent: GovernorIntent): Promise<boolean> {
    intentLogger.info({ target: intent.target }, 'Form alliance executed');
    return true;
  }

  private async executeMigrate(intent: GovernorIntent): Promise<boolean> {
    if (!(intent.target && typeof intent.target === 'object')) {
      intentLogger.warn('Invalid target type for migrate');
      return false;
    }
    
    const newPosition = intent.target as { x: number; y: number; z: number };
    intentLogger.info({
      newPosition: { x: newPosition.x, z: newPosition.z },
    }, 'Migrate executed');
    return true;
  }
}
