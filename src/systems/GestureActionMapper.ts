/**
 * Gesture Action Mapper - Wires gestures to actual game actions
 * 
 * Integrates HapticGestureSystem with game systems
 * Provides feedback through haptics for every action
 */

import type { World } from 'miniplex';
import * as THREE from 'three';
import { log } from '../utils/Logger';
import type { WorldSchema } from '../world/ECSWorld';
import type { GestureType } from './HapticGestureSystem';
import HapticGestureSystem from './HapticGestureSystem';
import DeconstructionSystem from './DeconstructionSystem';
import { useEvolutionDataStore, type GestureEvent } from '../stores/EvolutionDataStore';

export interface GestureAction {
  type: GestureType;
  position: THREE.Vector3;
  target?: import('miniplex').With<WorldSchema, keyof WorldSchema>;
  duration?: number;
  force?: number;
}

class GestureActionMapper {
  private world: World<WorldSchema>;
  private hapticSystem: HapticGestureSystem;
  private deconstructionSystem: DeconstructionSystem;
  private selectedCreature: import('miniplex').With<WorldSchema, keyof WorldSchema> | null = null;

  constructor(
    world: World<WorldSchema>,
    hapticSystem: HapticGestureSystem,
    deconstructionSystem: DeconstructionSystem
  ) {
    this.world = world;
    this.hapticSystem = hapticSystem;
    this.deconstructionSystem = deconstructionSystem;

    log.info('GestureActionMapper initialized - Gestures wired to game actions');

    // Listen to gesture events from store
    this.setupGestureListeners();
  }

  private setupGestureListeners(): void {
    const store = useEvolutionDataStore.getState();

    // Subscribe to gesture events from eventHistory
    useEvolutionDataStore.subscribe((state) => {
      // Filter eventHistory for GestureEvent types
      const gestureEvents = state.eventHistory.filter((e): e is GestureEvent => 
        'type' in e && ['swipe', 'pinch', 'hold', 'tap', 'drag', 'rotate', 'double_tap', 'long_press'].includes(e.type)
      );
      
      if (gestureEvents.length === 0) return;
      
      const latestEvent = gestureEvents[gestureEvents.length - 1];
      if (latestEvent && Date.now() - latestEvent.timestamp < 100 && latestEvent.position) {
        this.handleGesture(latestEvent.type, new THREE.Vector2(latestEvent.position.x, latestEvent.position.y));
      }
    });
  }

  /**
   * Map gesture to game action
   */
  handleGesture(type: GestureType, screenPosition: THREE.Vector2): void {
    // Raycast from screen position to 3D world
    const worldPosition = this.screenToWorld(screenPosition);
    const target = this.raycastForEntity(worldPosition);

    const action: GestureAction = {
      type,
      position: worldPosition,
      target,
      duration: 0,
      force: 1.0
    };

    switch (type) {
      case 'tap':
        this.handleTap(action);
        break;

      case 'long_press':
        this.handleLongPress(action);
        break;

      case 'double_tap':
        this.handleDoubleTap(action);
        break;

      case 'swipe':
        this.handleSwipe(action);
        break;

      case 'pinch':
        this.handlePinch(action);
        break;

      case 'rotate':
        this.handleRotate(action);
        break;

      case 'three_finger_tap':
        this.handleThreeFingerTap(action);
        break;
    }
  }

  /**
   * TAP - Observe/Select creature or resource
   */
  private handleTap(action: GestureAction): void {
    if (action.target) {
      this.selectedCreature = action.target;

      // Trigger subtle haptic
      this.hapticSystem.triggerHaptic('tap');

      log.info('Creature/resource selected', {
        type: action.target.creature ? 'creature' : action.target.resource ? 'resource' : 'unknown'
      });

      // Record selection event
      useEvolutionDataStore.getState().recordPlatformEvent('user_interaction', {
        action: 'select',
        target: action.target.creature?.species || action.target.resource?.materialType
      });
    }
  }

  /**
   * LONG-PRESS - Influence evolutionary pressure
   */
  private handleLongPress(action: GestureAction): void {
    if (!action.target) return;

    // Long press on creature = nudge evolution
    if (action.target.creature) {
      const evolutionData = (action.target as any).evolutionaryCreature;
      if (evolutionData) {
        // Apply environmental pressure boost
        evolutionData.stress += 0.1; // Increases evolution probability

        // Trigger resonant haptic
        this.hapticSystem.triggerHaptic('long_press');

        log.info('Evolution pressure applied via long-press', {
          species: action.target.creature.species,
          newStress: evolutionData.stress
        });
      }
    }

    // Long press on resource = gather
    if (action.target.resource) {
      this.harvestResource(action.target);
      this.hapticSystem.triggerHaptic('success');
    }
  }

  /**
   * DOUBLE-TAP - Camera reset / Quick action
   */
  private handleDoubleTap(action: GestureAction): void {
    if (action.target?.creature) {
      // Double-tap creature = focus camera
      log.info('Camera focus requested', { target: action.target.creature.species });
      this.hapticSystem.triggerHaptic('double_tap');
    } else {
      // Double-tap empty space = reset camera
      this.hapticSystem.triggerHaptic('tap');
    }
  }

  /**
   * SWIPE - Suggest direction / Nudge creature
   */
  private handleSwipe(action: GestureAction): void {
    if (this.selectedCreature && this.selectedCreature.yukaAgent) {
      // Nudge creature in swipe direction
      const direction = new THREE.Vector3(
        Math.random() - 0.5,
        0,
        Math.random() - 0.5
      ).normalize();

      // Apply gentle force to Yuka vehicle
      this.selectedCreature.yukaAgent.vehicle.position.add(direction.multiplyScalar(2));

      this.hapticSystem.triggerHaptic('swipe');

      log.info('Creature nudged via swipe', {
        species: this.selectedCreature.creature?.species
      });
    }
  }

  /**
   * PINCH - Zoom camera (handled by camera system)
   */
  private handlePinch(action: GestureAction): void {
    // Camera system handles pinch-to-zoom
    this.hapticSystem.triggerHaptic('pinch');
  }

  /**
   * ROTATE - Rotate camera (handled by camera system)
   */
  private handleRotate(action: GestureAction): void {
    // Camera system handles rotation
    this.hapticSystem.triggerHaptic('tap'); // Subtle feedback
  }

  /**
   * THREE-FINGER-TAP - Special actions / Debug menu
   */
  private handleThreeFingerTap(action: GestureAction): void {
    log.info('Three-finger tap - special action');
    this.hapticSystem.triggerHaptic('notification');

    // Could trigger debug menu, special abilities, etc.
  }

  /**
   * Harvest resource and provide haptic feedback
   */
  private harvestResource(entity: import('miniplex').With<WorldSchema, keyof WorldSchema>): void {
    if (!entity.resource) return;

    const quantity = entity.resource.quantity;

    // Reduce quantity
    entity.resource.quantity = Math.max(0, quantity - 1);

    // Remove if depleted
    if (entity.resource.quantity === 0) {
      this.world.remove(entity);
      this.hapticSystem.triggerHaptic('resource_depleted');
    } else {
      this.hapticSystem.triggerHaptic('resource_collect');
    }

    log.info('Resource harvested', {
      type: entity.resource.materialType,
      remaining: entity.resource.quantity
    });
  }

  /**
   * Raycast from screen to world entities
   */
  private raycastForEntity(worldPos: THREE.Vector3): import('miniplex').With<WorldSchema, keyof WorldSchema> | null {
    const SELECTION_RADIUS = 5;

    // Check creatures
    const creatures = this.world.with('creature', 'transform');
    for (const entity of creatures.entities) {
      if (!entity.transform) continue;

      const distance = entity.transform.position.distanceTo(worldPos);
      if (distance < SELECTION_RADIUS) {
        return entity;
      }
    }

    // Check resources
    const resources = this.world.with('resource', 'transform');
    for (const entity of resources.entities) {
      if (!entity.transform) continue;

      const distance = entity.transform.position.distanceTo(worldPos);
      if (distance < SELECTION_RADIUS) {
        return entity;
      }
    }

    return null;
  }

  /**
   * Convert screen coordinates to world position
   */
  private screenToWorld(screenPos: THREE.Vector2): THREE.Vector3 {
    // Simplified - would use proper screen-to-world projection
    // For now, just return a position on the ground plane
    return new THREE.Vector3(
      (screenPos.x - 0.5) * 100,
      2,
      (screenPos.y - 0.5) * 100
    );
  }
}

export default GestureActionMapper;
export type { GestureAction };

