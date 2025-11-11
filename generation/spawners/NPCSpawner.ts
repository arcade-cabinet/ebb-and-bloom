/**
 * NPC SPAWNER
 * 
 * Spawns NPCs in settlements with daily schedules and behavior.
 * Uses Yuka AI for pathfinding and decision-making.
 * 
 * Daggerfall had NPCs with schedules - sleep at night, work during day.
 * We enhance this with law-based behavior from SocialLaws.
 * 
 * Key features:
 * - Daily schedules (work, eat, sleep)
 * - Wandering behavior (patrol settlements)
 * - Interaction (talk to player - future)
 * - Roles (merchant, guard, villager, farmer)
 */

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Vehicle, WanderBehavior, FollowPathBehavior, Path, EntityManager, Vector3 as YukaVector3 } from 'yuka';
import { EnhancedRNG } from '../../engine/utils/EnhancedRNG';
import { Settlement, SettlementType } from './SettlementPlacer';
import { BuildingType } from './BuildingPrefab';

export enum NPCRole {
  VILLAGER = 'villager',
  MERCHANT = 'merchant',
  GUARD = 'guard',
  FARMER = 'farmer',
  BLACKSMITH = 'blacksmith',
  PRIEST = 'priest'
}

export interface NPCData {
  agent: Vehicle;
  mesh: THREE.Mesh;
  role: NPCRole;
  settlement: string;
  schedule: DailySchedule;
  currentActivity: 'sleeping' | 'going_to_work' | 'working' | 'going_home' | 'wandering';
  pathToWork?: import('yuka').Path;
  pathToHome?: import('yuka').Path;
}

export interface DailySchedule {
  sleepTime: number;  // Hour (0-24)
  wakeTime: number;   // Hour
  workStart: number;  // Hour
  workEnd: number;    // Hour
  workLocation?: THREE.Vector3;
  homeLocation: THREE.Vector3;
}

/**
 * Sync function for Yuka
 */
function sync(entity: Vehicle, renderComponent: THREE.Object3D) {
  // Convert Yuka Matrix4 to THREE Matrix4
  const yukaMatrix = entity.worldMatrix;
  const threeMatrix = renderComponent.matrix;
  threeMatrix.set(
    yukaMatrix.elements[0], yukaMatrix.elements[1], yukaMatrix.elements[2], yukaMatrix.elements[3],
    yukaMatrix.elements[4], yukaMatrix.elements[5], yukaMatrix.elements[6], yukaMatrix.elements[7],
    yukaMatrix.elements[8], yukaMatrix.elements[9], yukaMatrix.elements[10], yukaMatrix.elements[11],
    yukaMatrix.elements[12], yukaMatrix.elements[13], yukaMatrix.elements[14], yukaMatrix.elements[15]
  );
}

export class NPCSpawner {
  private npcs: Map<string, NPCData> = new Map();
  private scene: THREE.Scene;
  private entityManager: EntityManager;
  private seed: string;
  private rng: EnhancedRNG;
  private gameTime: number = 8; // Start at 8 AM
  
  constructor(scene: THREE.Scene, entityManager: EntityManager, seed: string) {
    this.scene = scene;
    this.entityManager = entityManager;
    this.seed = seed;
    this.rng = new EnhancedRNG(seed);
    console.log('[NPCSpawner] Initialized');
  }
  
  /**
   * Spawn NPCs in a settlement
   */
  spawnInSettlement(settlement: Settlement): void {
    const settlementSeed = `${this.seed}-npcs-${settlement.id}`;
    const settlementRng = new EnhancedRNG(settlementSeed);
    
    // Determine NPC count based on settlement type
    let npcCount: number;
    switch (settlement.type) {
      case SettlementType.VILLAGE:
        npcCount = Math.floor(settlement.population * 0.05); // 5% visible
        break;
      case SettlementType.TOWN:
        npcCount = Math.floor(settlement.population * 0.03); // 3% visible
        break;
      case SettlementType.CITY:
        npcCount = Math.floor(settlement.population * 0.01); // 1% visible
        break;
    }
    
    // Cap NPCs for performance
    npcCount = Math.min(npcCount, 50);
    
    console.log(`[NPCSpawner] Spawning ${npcCount} NPCs in ${settlement.name}`);
    
    for (let i = 0; i < npcCount; i++) {
      this.spawnNPC(settlement, i, settlementRng);
    }
  }
  
  /**
   * Spawn a single NPC
   */
  private spawnNPC(settlement: Settlement, index: number, rng: EnhancedRNG): void {
    // Determine NPC role based on buildings
    const role = this.determineRole(settlement, rng);
    
    // Find home location (random house)
    const houses = settlement.buildings.filter(b => b.type === BuildingType.HOUSE);
    const homeBuilding = houses[index % houses.length];
    const homeLocation = homeBuilding ? 
      homeBuilding.position.clone() : 
      settlement.position.clone();
    
    // Find work location based on role
    const workLocation = this.findWorkLocation(settlement, role, rng);
    
    // Create schedule
    const schedule: DailySchedule = {
      sleepTime: 22, // 10 PM
      wakeTime: 6,   // 6 AM
      workStart: 8,  // 8 AM
      workEnd: 18,   // 6 PM
      workLocation,
      homeLocation
    };
    
    // Use instance rng for global NPC variations
    const globalVariation = this.rng.uniform(0.95, 1.05);
    
    // Create Yuka agent
    const agent = new Vehicle();
    agent.position.set(
      homeLocation.x + rng.uniform(-20, 20), // Spread out more
      homeLocation.y + 1.5, // ABOVE GROUND (feet level)
      homeLocation.z + rng.uniform(-20, 20)
    );
    agent.name = `npc-${settlement.id}-${index}`;
    agent.maxSpeed = rng.uniform(3, 5) * globalVariation; // Apply global variation
    agent.updateOrientation = true;
    
    // Create visual mesh (humanoid)
    const mesh = this.createNPCMesh(role, rng);
    mesh.matrixAutoUpdate = false; // Yuka controls
    
    // Yuka pattern: setRenderComponent
    agent.setRenderComponent(mesh, sync);
    
    // Add to scene and entity manager
    this.scene.add(mesh);
    this.entityManager.add(agent);
    
    // Create paths for schedule
    const pathToWork = workLocation ? this.createPath(homeLocation, workLocation) : undefined;
    const pathToHome = workLocation ? this.createPath(workLocation, homeLocation) : undefined;
    
    // Store NPC data
    const npcId = `${settlement.id}-${index}`;
    this.npcs.set(npcId, {
      agent,
      mesh,
      role,
      settlement: settlement.id,
      schedule,
      currentActivity: 'sleeping', // Start sleeping
      pathToWork,
      pathToHome
    });
  }
  
  /**
   * Determine NPC role based on settlement buildings
   */
  private determineRole(settlement: Settlement, rng: EnhancedRNG): NPCRole {
    // Count different building types
    const buildings = settlement.buildings;
    const shops = buildings.filter(b => b.type === BuildingType.SHOP).length;
    const temples = buildings.filter(b => b.type === BuildingType.TEMPLE).length;
    const workshops = buildings.filter(b => b.type === BuildingType.WORKSHOP).length;
    
    const random = rng.uniform(0, 1);
    
    if (shops > 0 && random < 0.1) {
      return NPCRole.MERCHANT;
    } else if (temples > 0 && random < 0.15) {
      return NPCRole.PRIEST;
    } else if (workshops > 0 && random < 0.2) {
      return NPCRole.BLACKSMITH;
    } else if (settlement.type === SettlementType.CITY && random < 0.3) {
      return NPCRole.GUARD;
    } else if (settlement.type === SettlementType.VILLAGE && random < 0.5) {
      return NPCRole.FARMER;
    } else {
      return NPCRole.VILLAGER;
    }
  }
  
  /**
   * Find work location for NPC based on role
   */
  private findWorkLocation(settlement: Settlement, role: NPCRole, rng: EnhancedRNG): THREE.Vector3 | undefined {
    const buildings = settlement.buildings;
    
    switch (role) {
      case NPCRole.MERCHANT: {
        const shops = buildings.filter(b => b.type === BuildingType.SHOP);
        if (shops.length > 0) {
          const shop = shops[Math.floor(rng.uniform(0, 1) * shops.length)];
          return shop.position.clone();
        }
        break;
      }
      case NPCRole.PRIEST: {
        const temples = buildings.filter(b => b.type === BuildingType.TEMPLE);
        if (temples.length > 0) {
          const temple = temples[Math.floor(rng.uniform(0, 1) * temples.length)];
          return temple.position.clone();
        }
        break;
      }
      case NPCRole.BLACKSMITH: {
        const workshops = buildings.filter(b => b.type === BuildingType.WORKSHOP);
        if (workshops.length > 0) {
          const workshop = workshops[Math.floor(rng.uniform(0, 1) * workshops.length)];
          return workshop.position.clone();
        }
        break;
      }
      case NPCRole.GUARD: {
        // Guards patrol settlement center
        return settlement.position.clone();
      }
      case NPCRole.FARMER: {
        // Farmers work outside settlement
        return settlement.position.clone().add(new THREE.Vector3(
          rng.uniform(-100, 100),
          0,
          rng.uniform(-100, 100)
        ));
      }
    }
    
    return undefined;
  }
  
  /**
   * Create NPC mesh (humanoid figure)
   */
  private createNPCMesh(role: NPCRole, _rng: EnhancedRNG): THREE.Mesh {
    // BIGGER humanoid geometry (actually visible from distance)
    const bodyHeight = 3.0;   // BIGGER - was 1.7
    const bodyRadius = 0.6;   // WIDER - was 0.2
    const headRadius = 0.5;   // BIGGER - was 0.15
    const legLength = 1.5;    // LONGER - was 0.8
    const legRadius = 0.25;   // THICKER - was 0.08
    const armLength = 1.2;    // LONGER - was 0.6
    const armRadius = 0.2;    // THICKER - was 0.06
    
    // Body (capsule)
    const body = new THREE.CapsuleGeometry(bodyRadius, bodyHeight * 0.6, 8, 16);
    body.translate(0, legLength + bodyHeight * 0.3, 0);
    
    // Head (sphere)
    const head = new THREE.SphereGeometry(headRadius, 8, 8);
    head.translate(0, legLength + bodyHeight * 0.6 + headRadius, 0);
    
    // Legs (2)
    const leg = new THREE.CylinderGeometry(legRadius, legRadius, legLength, 8);
    leg.translate(0, legLength / 2, 0);
    
    const legLeft = leg.clone();
    legLeft.translate(0, 0, -bodyRadius * 0.5);
    
    const legRight = leg.clone();
    legRight.translate(0, 0, bodyRadius * 0.5);
    
    // Arms (2)
    const arm = new THREE.CylinderGeometry(armRadius, armRadius, armLength, 8);
    arm.translate(0, legLength + bodyHeight * 0.5 - armLength / 2, 0);
    
    const armLeft = arm.clone();
    armLeft.translate(0, 0, -bodyRadius * 1.2);
    
    const armRight = arm.clone();
    armRight.translate(0, 0, bodyRadius * 1.2);
    
    // Merge all parts (modern Three.js way)
    const merged = mergeGeometries([body, head, legLeft, legRight, armLeft, armRight]);
    const geometry = merged || body; // Fallback to body if merge fails
    
    // BRIGHT colors based on role (very visible!)
    let color: number;
    let emissive: number;
    switch (role) {
      case NPCRole.MERCHANT:
        color = 0xFFAA44; // BRIGHT orange (merchant)
        emissive = 0xFF8800;
        break;
      case NPCRole.GUARD:
        color = 0x4488FF; // BRIGHT blue (guard)
        emissive = 0x0044FF;
        break;
      case NPCRole.PRIEST:
        color = 0xFFFFFF; // WHITE (priest)
        emissive = 0xCCCCCC;
        break;
      case NPCRole.BLACKSMITH:
        color = 0x666666; // Gray (blacksmith)
        emissive = 0x444444;
        break;
      case NPCRole.FARMER:
        color = 0x88FF88; // BRIGHT green (farmer)
        emissive = 0x44CC44;
        break;
      default:
        color = 0xFFCC88; // BRIGHT tan (villager)
        emissive = 0xDD9944;
    }
    
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.6,
      metalness: 0.2,
      emissive,
      emissiveIntensity: 0.3 // NPCs GLOW slightly
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Add floating indicator above NPC (always visible)
    const indicatorGeometry = new THREE.SphereGeometry(0.8, 8, 8);
    const indicatorMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFF00, // YELLOW marker
      emissive: 0xFFFF00,
      emissiveIntensity: 0.8
    });
    const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
    indicator.position.y = bodyHeight + legLength + headRadius + 2; // Above head
    mesh.add(indicator);
    
    return mesh;
  }
  
  /**
   * Update NPCs (schedule-based behavior)
   */
  update(delta: number): void {
    // Update game time (simplified - 1 second = 1 minute)
    this.gameTime += delta / 60;
    if (this.gameTime >= 24) {
      this.gameTime -= 24;
    }
    
    // Update NPC behaviors based on schedule
    for (const npc of this.npcs.values()) {
      this.updateNPCBehavior(npc);
    }
    
    // Yuka handles actual movement and rendering via setRenderComponent
  }
  
  /**
   * Create path between two points (simple straight line for now)
   */
  private createPath(from: THREE.Vector3, to: THREE.Vector3): import('yuka').Path {
    const path = new Path();
    path.add(new YukaVector3(from.x, from.y, from.z));
    
    // Add intermediate waypoint (1/3 of the way)
    const mid1 = new THREE.Vector3().lerpVectors(from, to, 0.33);
    path.add(new YukaVector3(mid1.x, mid1.y, mid1.z));
    
    // Add intermediate waypoint (2/3 of the way)
    const mid2 = new THREE.Vector3().lerpVectors(from, to, 0.67);
    path.add(new YukaVector3(mid2.x, mid2.y, mid2.z));
    
    path.add(new YukaVector3(to.x, to.y, to.z));
    path.loop = false;
    return path;
  }
  
  /**
   * Update single NPC behavior based on schedule
   */
  private updateNPCBehavior(npc: NPCData): void {
    const { schedule, agent } = npc;
    const hour = Math.floor(this.gameTime);
    
    // Use agent to check if active
    if (!agent || !agent.active) return;
    
    // Determine what NPC should be doing
    let desiredActivity: 'sleeping' | 'going_to_work' | 'working' | 'going_home' | 'wandering';
    
    if (hour >= schedule.sleepTime || hour < schedule.wakeTime) {
      desiredActivity = 'sleeping';
    } else if (hour === schedule.wakeTime) {
      desiredActivity = 'going_to_work';
    } else if (hour >= schedule.workStart && hour < schedule.workEnd) {
      desiredActivity = 'working';
    } else if (hour === schedule.workEnd) {
      desiredActivity = 'going_home';
    } else {
      desiredActivity = 'wandering';
    }
    
    // Transition to new activity if needed
    if (desiredActivity !== npc.currentActivity) {
      this.transitionNPCActivity(npc, desiredActivity);
    }
  }
  
  /**
   * Transition NPC to new activity
   */
  private transitionNPCActivity(
    npc: NPCData, 
    newActivity: 'sleeping' | 'going_to_work' | 'working' | 'going_home' | 'wandering'
  ): void {
    // Clear all current steering behaviors
    npc.agent.steering.clear();
    
    switch (newActivity) {
      case 'sleeping':
        // Stay still at home
        npc.agent.maxSpeed = 0;
        break;
        
      case 'going_to_work':
        // Follow path to work
        if (npc.pathToWork) {
          const followPathBehavior = new FollowPathBehavior(npc.pathToWork);
          followPathBehavior.nextWaypointDistance = 2;
          npc.agent.steering.add(followPathBehavior);
          npc.agent.maxSpeed = 2.0; // Walking speed
        }
        break;
        
      case 'working':
        // Wander near work location (simulate working)
        const workWander = new WanderBehavior();
        workWander.radius = 5;
        workWander.distance = 3;
        workWander.jitter = 0.3;
        npc.agent.steering.add(workWander);
        npc.agent.maxSpeed = 0.5; // Slow movement
        break;
        
      case 'going_home':
        // Follow path home
        if (npc.pathToHome) {
          const followPathBehavior = new FollowPathBehavior(npc.pathToHome);
          followPathBehavior.nextWaypointDistance = 2;
          npc.agent.steering.add(followPathBehavior);
          npc.agent.maxSpeed = 2.0; // Walking speed
        }
        break;
        
      case 'wandering':
        // Free time - wander around settlement
        const freeWander = new WanderBehavior();
        freeWander.radius = 20;
        freeWander.distance = 10;
        freeWander.jitter = 0.5;
        npc.agent.steering.add(freeWander);
        npc.agent.maxSpeed = 1.5; // Casual walking
        break;
    }
    
    npc.currentActivity = newActivity;
  }
  
  /**
   * Get NPC count
   */
  getNPCCount(): number {
    return this.npcs.size;
  }
  
  /**
   * Get game time (hour)
   */
  getGameTime(): number {
    return this.gameTime;
  }
  
  /**
   * Get all NPC meshes (for raycasting)
   */
  getAllMeshes(): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = [];
    for (const npc of this.npcs.values()) {
      meshes.push(npc.mesh);
    }
    return meshes;
  }
  
  /**
   * Get NPC data by mesh
   */
  getNPCByMesh(mesh: THREE.Mesh): NPCData | undefined {
    for (const npc of this.npcs.values()) {
      if (npc.mesh === mesh) {
        return npc;
      }
    }
    return undefined;
  }
}

