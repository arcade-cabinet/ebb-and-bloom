/**
 * Creature AI System
 * Handles Yuka-powered creature behavior and spawning
 */

import * as THREE from 'three';
import * as YUKA from 'yuka';
import { log, measurePerformance } from '../utils/Logger';
import type { World, Entity } from 'miniplex';
import type { WorldSchema, CreatureData, YukaAgent, Transform, RenderData } from '../world/ECSWorld';
import { yukaManager, yukaTime } from '../world/ECSWorld';

export class CreatureSystem {
  private world: World<WorldSchema>;
  private creatures: Entity<WorldSchema>[] = [];
  
  constructor(world: World<WorldSchema>) {
    this.world = world;
    log.info('CreatureSystem initialized');
  }
  
  spawnCreature(
    species: CreatureData['species'],
    position: THREE.Vector3,
    personality: CreatureData['personality'] = 'neutral'
  ): Entity<WorldSchema> {
    
    const perf = measurePerformance(`Spawn ${species}`);
    
    try {
      log.creature('Spawning creature', `${species}_${this.creatures.length}`, {
        species,
        position: position.toArray(),
        personality
      });
      
      // Create Yuka vehicle for AI
      const vehicle = new YUKA.Vehicle();
      vehicle.position.set(position.x, position.y, position.z);
      
      // Set up behavior based on species and personality
      this.setupCreatureBehavior(vehicle, species, personality, position);
      
      // Create visual mesh
      const mesh = this.createCreatureMesh(species);
      mesh.position.copy(position);
      
      // Add to Yuka manager
      yukaManager.add(vehicle);
      
      // Create ECS entity
      const entity = this.world.add({
        transform: {
          position: position.clone(),
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(1, 1, 1)
        },
        creature: {
          species,
          size: this.getSpeciesSize(species),
          personality,
          energy: 100,
          mood: 0
        },
        yukaAgent: {
          vehicle,
          behaviorType: this.getBehaviorType(personality),
          homePosition: position.clone(),
          territory: this.getTerritorySize(species)
        },
        render: {
          mesh,
          material: mesh.material as THREE.Material,
          visible: true,
          castShadow: true,
          receiveShadow: true
        }
      });
      
      this.creatures.push(entity);
      
      perf.end();
      log.creature('Creature spawned successfully', `${species}_${this.creatures.length - 1}`, {
        entityId: entity
      });
      
      return entity;
      
    } catch (error) {
      log.error('Failed to spawn creature', error, { species, position, personality });
      throw error;
    }
  }
  
  private setupCreatureBehavior(
    vehicle: YUKA.Vehicle,
    species: CreatureData['species'],
    personality: CreatureData['personality'],
    homePosition: THREE.Vector3
  ): void {
    
    try {
      log.yuka('Setting up creature behavior', undefined, { species, personality });
      
      switch (species) {
        case 'squirrel':
          const wanderBehavior = new YUKA.WanderBehavior();
          wanderBehavior.radius = personality === 'shy' ? 8 : 15;
          wanderBehavior.distance = 10;
          wanderBehavior.jitter = personality === 'curious' ? 5 : 2;
          
          vehicle.steering.add(wanderBehavior);
          vehicle.maxSpeed = personality === 'aggressive' ? 8 : 5;
          break;
          
        case 'rabbit':
          const flockBehavior = new YUKA.WanderBehavior();
          flockBehavior.radius = 12;
          flockBehavior.distance = 8;
          
          vehicle.steering.add(flockBehavior);
          vehicle.maxSpeed = 7; // Rabbits are quick
          break;
          
        case 'deer':
          const grazeBehavior = new YUKA.WanderBehavior();
          grazeBehavior.radius = 25;
          grazeBehavior.distance = 15;
          grazeBehavior.jitter = 1; // Calm grazing
          
          vehicle.steering.add(grazeBehavior);
          vehicle.maxSpeed = personality === 'shy' ? 12 : 6;
          break;
          
        case 'bird':
          // Birds fly in patterns
          const flyBehavior = new YUKA.WanderBehavior();
          flyBehavior.radius = 30;
          flyBehavior.distance = 20;
          flyBehavior.jitter = 8; // Erratic flight
          
          vehicle.steering.add(flyBehavior);
          vehicle.maxSpeed = 15;
          break;
      }
      
      log.yuka('Creature behavior setup complete', undefined, { species, maxSpeed: vehicle.maxSpeed });
      
    } catch (error) {
      log.error('Failed to setup creature behavior', error, { species, personality });
      throw error;
    }
  }
  
  private createCreatureMesh(species: CreatureData['species']): THREE.Group {
    const group = new THREE.Group();
    
    try {
      switch (species) {
        case 'squirrel':
          // Body
          const squirrelBody = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.15, 0.3),
            new THREE.MeshLambertMaterial({ color: '#8B4513' })
          );
          squirrelBody.castShadow = true;
          group.add(squirrelBody);
          
          // Fluffy tail
          const tail = new THREE.Mesh(
            new THREE.SphereGeometry(0.12),
            new THREE.MeshLambertMaterial({ color: '#654321' })
          );
          tail.position.set(0, 0.1, -0.25);
          tail.castShadow = true;
          group.add(tail);
          break;
          
        case 'rabbit':
          // Body (using SphereGeometry scaled to ellipsoid)
          const rabbitBody = new THREE.Mesh(
            new THREE.SphereGeometry(0.2),
            new THREE.MeshLambertMaterial({ color: '#F5F5F5' })
          );
          rabbitBody.scale.set(1, 0.75, 1.5); // Scale to ellipsoid shape
          rabbitBody.castShadow = true;
          group.add(rabbitBody);
          
          // Ears
          const ear1 = new THREE.Mesh(
            new THREE.SphereGeometry(0.05),
            new THREE.MeshLambertMaterial({ color: '#F0F0F0' })
          );
          ear1.scale.set(1, 3, 0.4); // Scale to ear shape
          ear1.position.set(-0.08, 0.2, 0.1);
          group.add(ear1);
          
          const ear2 = ear1.clone();
          ear2.position.set(0.08, 0.2, 0.1);
          group.add(ear2);
          break;
          
        case 'deer':
          // Body
          const deerBody = new THREE.Mesh(
            new THREE.SphereGeometry(0.3),
            new THREE.MeshLambertMaterial({ color: '#8B4513' })
          );
          deerBody.scale.set(1, 0.67, 2); // Scale to deer body shape
          deerBody.position.y = 0.5;
          deerBody.castShadow = true;
          group.add(deerBody);
          
          // Legs
          for (let i = 0; i < 4; i++) {
            const leg = new THREE.Mesh(
              new THREE.CylinderGeometry(0.03, 0.03, 0.4),
              new THREE.MeshLambertMaterial({ color: '#654321' })
            );
            leg.position.set(
              i < 2 ? -0.15 : 0.15,
              0.2,
              i % 2 === 0 ? 0.2 : -0.2
            );
            leg.castShadow = true;
            group.add(leg);
          }
          break;
          
        case 'bird':
          // Simple bird shape
          const birdBody = new THREE.Mesh(
            new THREE.SphereGeometry(0.08),
            new THREE.MeshLambertMaterial({ color: '#8B4513' })
          );
          birdBody.scale.set(1, 0.75, 1.5); // Scale to bird body
          birdBody.castShadow = true;
          group.add(birdBody);
          
          // Wings (simplified)
          const wing1 = new THREE.Mesh(
            new THREE.SphereGeometry(0.05),
            new THREE.MeshLambertMaterial({ color: '#654321' })
          );
          wing1.scale.set(2, 0.4, 1.6); // Scale to wing shape
          wing1.position.set(-0.12, 0, 0);
          group.add(wing1);
          
          const wing2 = wing1.clone();
          wing2.position.set(0.12, 0, 0);
          group.add(wing2);
          break;
      }
      
      log.creature('Creature mesh created', species, { meshChildren: group.children.length });
      return group;
      
    } catch (error) {
      log.error('Failed to create creature mesh', error, { species });
      throw error;
    }
  }
  
  update(deltaTime: number): void {
    try {
      // Update Yuka AI system
      yukaTime.update();
      yukaManager.update(yukaTime.getDelta());
      
      // Sync creature entities with their Yuka vehicles
      const creatures = this.world.with('transform', 'creature', 'yukaAgent', 'render');
      
      for (const entity of creatures) {
        if (!entity.yukaAgent || !entity.transform || !entity.render) continue;
        
        const vehicle = entity.yukaAgent.vehicle;
        const mesh = entity.render.mesh;
        
        // Update transform from Yuka vehicle
        entity.transform.position.copy(vehicle.position);
        
        // Sync mesh position
        mesh.position.copy(vehicle.position);
        
        // Face movement direction
        if (vehicle.velocity.length() > 0.1) {
          const direction = vehicle.position.clone().add(vehicle.velocity);
          mesh.lookAt(direction);
        }
      }
      
    } catch (error) {
      log.error('Error in creature system update', error);
    }
  }
  
  private getSpeciesSize(species: CreatureData['species']): number {
    const sizes = {
      'squirrel': 0.3,
      'rabbit': 0.4,
      'deer': 0.8,
      'bird': 0.15
    };
    return sizes[species] || 0.5;
  }
  
  private getBehaviorType(personality: CreatureData['personality']): YukaAgent['behaviorType'] {
    switch (personality) {
      case 'curious': return 'seek';
      case 'shy': return 'flee';
      case 'aggressive': return 'seek';
      default: return 'wander';
    }
  }
  
  private getTerritorySize(species: CreatureData['species']): number {
    const territories = {
      'squirrel': 15,
      'rabbit': 20,
      'deer': 50,
      'bird': 100
    };
    return territories[species] || 25;
  }
}

export default CreatureSystem;