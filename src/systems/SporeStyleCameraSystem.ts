/**
 * Spore-Style Camera System - Dynamic third-person evolution camera
 * Optimized for showing creature evolution, pack dynamics, and ecosystem interactions
 */

import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import { useWorld } from '../contexts/WorldContext';
import { log } from '../utils/Logger';
import { gameClock, type EvolutionEvent } from './GameClock';
import type { World, Entity } from 'miniplex';
import type { WorldSchema } from '../world/ECSWorld';

export enum CameraMode {
  FOLLOW_CREATURE = 'follow_creature',     // Standard Spore-style creature following
  OBSERVE_PACK = 'observe_pack',           // Pack-wide social dynamics view
  ENVIRONMENTAL = 'environmental',         // Ecosystem-wide view for environmental events
  CINEMATIC = 'cinematic',                // Scripted sequences for major evolution events
  FREE_EXPLORE = 'free_explore'           // Player-controlled exploration
}

export interface CameraState {
  mode: CameraMode;
  target: Entity<WorldSchema> | THREE.Vector3 | null;
  distance: number;           // 3-100 units from target
  height: number;             // 5-60 units above ground
  orbitalAngle: number;       // 0-2π rotation around target
  pitch: number;              // -π/4 to π/4 vertical angle
  transitionSpeed: number;    // 0.1-2.0 transition rate
  activityContext: string;    // Current activity driving camera behavior
  lastUpdateTime: number;
}

interface CameraPreset {
  name: string;
  distance: number;
  height: number;
  pitch: number;
  transitionSpeed: number;
  useCase: string;
}

class SporeStyleCameraSystem {
  private world: World<WorldSchema>;
  private state: CameraState;
  private presets = new Map<string, CameraPreset>();
  private targetPosition = new THREE.Vector3();
  private currentPosition = new THREE.Vector3();
  private lookAtPosition = new THREE.Vector3();
  private transitionTarget = {
    distance: 15,
    height: 10,
    angle: 0,
    pitch: -0.2
  };
  
  constructor(world: World<WorldSchema>) {
    this.world = world;
    this.state = {
      mode: CameraMode.FOLLOW_CREATURE,
      target: null,
      distance: 15,
      height: 10,
      orbitalAngle: 0,
      pitch: -0.2,
      transitionSpeed: 1.0,
      activityContext: 'exploration',
      lastUpdateTime: 0
    };
    
    this.initializeCameraPresets();
    this.setupEvolutionEventHandlers();
    
    log.info('SporeStyleCameraSystem initialized with dynamic third-person perspective');
  }
  
  private initializeCameraPresets(): void {
    // Spore-inspired camera presets for different activities
    this.presets.set('intimate', {
      name: 'Intimate View',
      distance: 4,
      height: 6,
      pitch: -0.1,
      transitionSpeed: 0.8,
      useCase: 'trait_inspection, individual_behavior'
    });
    
    this.presets.set('social', {
      name: 'Social View', 
      distance: 12,
      height: 15,
      pitch: -0.3,
      transitionSpeed: 1.0,
      useCase: 'pack_dynamics, group_interactions'
    });
    
    this.presets.set('tactical', {
      name: 'Tactical View',
      distance: 20,
      height: 25,
      pitch: -0.4,
      transitionSpeed: 1.2,
      useCase: 'combat, territory_defense, hunting'
    });
    
    this.presets.set('ecosystem', {
      name: 'Ecosystem View',
      distance: 40,
      height: 50,
      pitch: -0.5,
      transitionSpeed: 0.6,
      useCase: 'environmental_events, migration, overview'
    });
    
    this.presets.set('epic', {
      name: 'Epic View',
      distance: 80,
      height: 80,
      pitch: -0.6,
      transitionSpeed: 0.4,
      useCase: 'shock_events, mass_migration, ecosystem_transformation'
    });
    
    log.info('Camera presets initialized', {
      presets: Array.from(this.presets.keys())
    });
  }
  
  private setupEvolutionEventHandlers(): void {
    // React to evolution events with appropriate camera positioning
    gameClock.onEvolutionEvent((event: EvolutionEvent) => {
      this.handleEvolutionEvent(event);
    });
    
    log.info('Evolution event camera handlers setup');
  }
  
  private handleEvolutionEvent(event: EvolutionEvent): void {
    log.info('Camera responding to evolution event', {
      eventType: event.eventType,
      significance: event.significance,
      affectedCreatures: event.affectedCreatures.length
    });
    
    // Find the most relevant creature for this event
    const targetCreature = this.findEventTarget(event);
    
    switch (event.eventType) {
      case 'trait_emergence':
        this.transitionToPreset('intimate');
        this.setTarget(targetCreature, 'trait_emergence');
        break;
        
      case 'pack_formation':
        this.transitionToPreset('social');
        this.setTarget(targetCreature, 'pack_formation');
        break;
        
      case 'behavior_shift':
        this.transitionToPreset('tactical');
        this.setTarget(targetCreature, 'behavior_change');
        break;
        
      case 'extinction':
        this.transitionToPreset('ecosystem');
        this.setTarget(targetCreature, 'environmental_impact');
        break;
        
      case 'speciation':
        this.transitionToPreset('epic');
        this.setTarget(targetCreature, 'major_evolution');
        break;
    }
  }
  
  private findEventTarget(event: EvolutionEvent): Entity<WorldSchema> | null {
    // Find the most significant creature involved in this event
    if (event.affectedCreatures.length === 0) return null;
    
    const creatures = this.world.with('creature', 'transform');
    
    // Simple implementation - find first matching creature
    for (const creature of creatures.entities) {
      if (event.affectedCreatures.includes(creature.toString())) {
        return creature;
      }
    }
    
    return null;
  }
  
  private transitionToPreset(presetName: string): void {
    const preset = this.presets.get(presetName);
    if (!preset) {
      log.warn('Unknown camera preset', { presetName });
      return;
    }
    
    this.transitionTarget = {
      distance: preset.distance,
      height: preset.height,
      angle: this.state.orbitalAngle, // Keep current angle
      pitch: preset.pitch
    };
    
    this.state.transitionSpeed = preset.transitionSpeed;
    this.state.activityContext = preset.useCase;
    
    log.debug('Camera transitioning to preset', {
      preset: presetName,
      distance: preset.distance,
      height: preset.height,
      useCase: preset.useCase
    });
  }
  
  private setTarget(target: Entity<WorldSchema> | THREE.Vector3 | null, context: string): void {
    this.state.target = target;
    this.state.activityContext = context;
    
    if (target && 'transform' in target && target.transform) {
      log.info('Camera target set to creature', {
        context,
        targetPosition: target.transform.position.toArray()
      });
    } else if (target instanceof THREE.Vector3) {
      log.info('Camera target set to position', {
        context,
        targetPosition: target.toArray()
      });
    }
  }
  
  /**
   * Handle manual camera controls (touch/mouse input)
   */
  handleManualControl(
    gestureType: 'zoom' | 'orbit' | 'reset',
    delta: { x: number; y: number; scale?: number }
  ): void {
    
    switch (gestureType) {
      case 'zoom':
        const zoomDelta = (delta.scale || 1) - 1;
        const newDistance = this.state.distance * (1 + zoomDelta * 0.5);
        
        // Clamp to reasonable ranges based on current mode
        const minDist = this.state.mode === CameraMode.FOLLOW_CREATURE ? 3 : 8;
        const maxDist = this.state.mode === CameraMode.ENVIRONMENTAL ? 100 : 50;
        
        this.transitionTarget.distance = Math.max(minDist, Math.min(maxDist, newDistance));
        break;
        
      case 'orbit':
        this.state.orbitalAngle += delta.x * 0.01; // Convert pixel delta to radians
        this.transitionTarget.pitch = Math.max(-Math.PI/3, Math.min(0, this.state.pitch + delta.y * 0.005));
        break;
        
      case 'reset':
        this.transitionToPreset('social'); // Default Spore view
        break;
    }
  }
  
  /**
   * Update camera position and orientation (called every frame)
   */
  updateCamera(camera: THREE.Camera, deltaTime: number): void {
    this.state.lastUpdateTime += deltaTime;
    
    // Update target position
    this.updateTargetPosition();
    
    // Smooth interpolation toward target configuration
    this.interpolateCameraState(deltaTime);
    
    // Calculate final camera position using spherical coordinates
    this.calculateCameraPosition();
    
    // Apply to actual camera
    camera.position.copy(this.currentPosition);
    camera.lookAt(this.lookAtPosition);
  }
  
  private updateTargetPosition(): void {
    if (!this.state.target) {
      this.targetPosition.set(0, 0, 0); // Default center
      return;
    }
    
    if (this.state.target instanceof THREE.Vector3) {
      this.targetPosition.copy(this.state.target);
    } else if ('transform' in this.state.target && this.state.target.transform) {
      this.targetPosition.copy(this.state.target.transform.position);
      
      // Add pack center offset if in pack observation mode
      if (this.state.mode === CameraMode.OBSERVE_PACK) {
        const packCenter = this.calculatePackCenter(this.state.target);
        this.targetPosition.copy(packCenter);
      }
    }
  }
  
  private calculatePackCenter(creature: Entity<WorldSchema>): THREE.Vector3 {
    // Find pack members and calculate center point
    const packCenter = new THREE.Vector3();
    const creatures = this.world.with('creature', 'transform');
    let packMemberCount = 0;
    
    // Simple pack detection - creatures within 30 units
    for (const entity of creatures.entities) {
      if (!entity.transform || !creature.transform) continue;
      
      const distance = entity.transform.position.distanceTo(creature.transform.position);
      if (distance <= 30) {
        packCenter.add(entity.transform.position);
        packMemberCount++;
      }
    }
    
    if (packMemberCount > 0) {
      packCenter.divideScalar(packMemberCount);
    } else {
      packCenter.copy(creature.transform!.position);
    }
    
    return packCenter;
  }
  
  private interpolateCameraState(deltaTime: number): void {
    const lerpSpeed = this.state.transitionSpeed * deltaTime * 2;
    
    // Smooth interpolation toward target values
    this.state.distance += (this.transitionTarget.distance - this.state.distance) * lerpSpeed;
    this.state.height += (this.transitionTarget.height - this.state.height) * lerpSpeed;
    this.state.pitch += (this.transitionTarget.pitch - this.state.pitch) * lerpSpeed;
    
    // Clamp values to prevent camera issues
    this.state.distance = Math.max(2, Math.min(120, this.state.distance));
    this.state.height = Math.max(3, Math.min(80, this.state.height));
    this.state.pitch = Math.max(-Math.PI/2, Math.min(Math.PI/6, this.state.pitch));
  }
  
  private calculateCameraPosition(): void {
    // Calculate position using spherical coordinates around target
    const spherical = new THREE.Spherical(
      this.state.distance,
      Math.PI/2 + this.state.pitch, // Convert pitch to spherical phi
      this.state.orbitalAngle
    );
    
    this.currentPosition.setFromSpherical(spherical);
    this.currentPosition.add(this.targetPosition);
    this.currentPosition.y = Math.max(this.targetPosition.y + 2, this.currentPosition.y); // Minimum height above ground
    
    // Look at point slightly ahead of target for more dynamic feeling
    this.lookAtPosition.copy(this.targetPosition);
    this.lookAtPosition.y += 1; // Look slightly above creature center
  }
  
  /**
   * React hook for camera integration
   */
  useCameraSystem(): {
    handleGesture: (type: 'zoom' | 'orbit' | 'reset', delta: any) => void;
    getCurrentMode: () => CameraMode;
    setTarget: (target: Entity<WorldSchema> | THREE.Vector3 | null) => void;
  } {
    const { camera } = useThree();
    
    useFrame((state, delta) => {
      this.updateCamera(camera, delta);
    });
    
    useEffect(() => {
      // Initialize camera position
      this.transitionToPreset('social');
    }, []);
    
    return {
      handleGesture: (type, delta) => this.handleManualControl(type, delta),
      getCurrentMode: () => this.state.mode,
      setTarget: (target) => this.setTarget(target, 'manual')
    };
  }
  
  // Analysis and debugging
  getCameraAnalysis(): {
    currentMode: CameraMode;
    targetDistance: number;
    heightAboveGround: number;
    activityContext: string;
    transitionsThisSession: number;
  } {
    return {
      currentMode: this.state.mode,
      targetDistance: this.state.distance,
      heightAboveGround: this.state.height,
      activityContext: this.state.activityContext,
      transitionsThisSession: 0 // Would track in production
    };
  }
}

// React component for camera system
export function SporeStyleCamera() {
  const { camera } = useThree();
  const { world } = useWorld();
  const cameraSystem = useRef<SporeStyleCameraSystem | null>(null);
  
  if (!cameraSystem.current) {
    cameraSystem.current = new SporeStyleCameraSystem(world);
  }
  
  usePlatformEvents();
  
  useEffect(() => {
    log.info('Spore-style camera component mounted');
    
    // Listen to evolution events for camera reactions
    const unsubscribe = gameClock.onEvolutionEvent((event: EvolutionEvent) => {
      if (event.significance > 0.7 && cameraSystem.current) {
        // Significant event - transition to ecosystem view
        cameraSystem.current.transitionToPreset('ecosystem');
      }
    });
    
    return unsubscribe;
  }, []);
  
  return null; // This component only handles camera logic
}

export default SporeStyleCameraSystem;