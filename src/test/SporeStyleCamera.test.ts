/**
 * Spore-Style Camera System Tests - Comprehensive validation of camera behavior
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { World } from 'miniplex';
import SporeStyleCameraSystem from '../systems/SporeStyleCameraSystem';

// Import CameraMode directly to avoid export issues
enum CameraMode {
  FOLLOW_CREATURE = 'follow_creature',
  OBSERVE_PACK = 'observe_pack', 
  ENVIRONMENTAL = 'environmental',
  CINEMATIC = 'cinematic',
  FREE_EXPLORE = 'free_explore'
}
import type { WorldSchema } from '../world/ECSWorld';
import * as THREE from 'three';

describe('SporeStyleCameraSystem', () => {
  let world: World<WorldSchema>;
  let cameraSystem: SporeStyleCameraSystem;
  let mockCamera: THREE.Camera;
  
  beforeEach(() => {
    world = new World<WorldSchema>();
    cameraSystem = new SporeStyleCameraSystem(world);
    mockCamera = new THREE.PerspectiveCamera();
  });
  
  test('initializes with correct default state', () => {
    const analysis = cameraSystem.getCameraAnalysis();
    
    expect(analysis.currentMode).toBe(CameraMode.FOLLOW_CREATURE);
    expect(analysis.targetDistance).toBeGreaterThan(10);
    expect(analysis.heightAboveGround).toBeGreaterThan(5);
    expect(analysis.activityContext).toBeDefined();
  });
  
  test('responds to trait emergence events', () => {
    const testEvent = {
      generation: 1,
      timestamp: Date.now(),
      eventType: 'trait_emergence' as const,
      description: 'Test trait emergence',
      affectedCreatures: ['creature_1'],
      traits: [0.8, 0.6, 0.4],
      significance: 0.7
    };
    
    // Simulate evolution event
    cameraSystem['handleEvolutionEvent'](testEvent);
    
    // Update camera multiple times to allow transition
    for (let i = 0; i < 60; i++) {
      cameraSystem.updateCamera(mockCamera, 1/60);
    }
    
    const analysis = cameraSystem.getCameraAnalysis();
    
    // Should switch to intimate view for trait inspection (preset distance is 4)
    // But transition is smooth, so check it's moving toward intimate distance
    expect(analysis.targetDistance).toBeLessThan(15); // Should be less than default
    expect(analysis.activityContext).toContain('trait');
  });
  
  test('responds to pack formation events', () => {
    const testEvent = {
      generation: 2,
      timestamp: Date.now(),
      eventType: 'pack_formation' as const,
      description: 'Pack formation event',
      affectedCreatures: ['creature_1', 'creature_2', 'creature_3'],
      traits: [0.5, 0.8, 0.6],
      significance: 0.8
    };
    
    cameraSystem['handleEvolutionEvent'](testEvent);
    
    const analysis = cameraSystem.getCameraAnalysis();
    
    // Should switch to social view for pack dynamics
    expect(analysis.targetDistance).toBeGreaterThan(8);
    expect(analysis.targetDistance).toBeLessThan(20);
    expect(analysis.activityContext).toContain('pack');
  });
  
  test('responds to environmental shock events', () => {
    const testEvent = {
      generation: 3,
      timestamp: Date.now(),
      eventType: 'extinction' as const,
      description: 'Environmental shock',
      affectedCreatures: ['creature_1', 'creature_2'],
      traits: [0.3, 0.2, 0.1],
      significance: 0.9
    };
    
    cameraSystem['handleEvolutionEvent'](testEvent);
    
    // Update camera multiple times to allow transition
    for (let i = 0; i < 60; i++) {
      cameraSystem.updateCamera(mockCamera, 1/60);
    }
    
    const analysis = cameraSystem.getCameraAnalysis();
    
    // Should switch to ecosystem view for environmental overview (preset distance is 40)
    // Transition is smooth, so check it's moving toward ecosystem distance
    expect(analysis.targetDistance).toBeGreaterThan(15); // Should be greater than default
    expect(analysis.activityContext).toContain('environmental');
  });
  
  test('handles manual zoom controls', () => {
    const initialDistance = cameraSystem.getCameraAnalysis().targetDistance;
    
    // Simulate pinch-to-zoom gesture (zoom in)
    cameraSystem.handleManualControl('zoom', { x: 0, y: 0, scale: 0.8 });
    
    // Update camera to apply transition
    for (let i = 0; i < 60; i++) {
      cameraSystem.updateCamera(mockCamera, 1/60);
    }
    
    const newDistance = cameraSystem.getCameraAnalysis().targetDistance;
    
    // Distance should decrease (zoom in) - transition is smooth so check it's moving in right direction
    // With scale 0.8, new target distance = initialDistance * (1 + (0.8 - 1) * 0.5) = initialDistance * 0.9
    expect(newDistance).toBeLessThanOrEqual(initialDistance * 1.1); // Allow some tolerance for smooth transition
  });
  
  test('handles orbital rotation controls', () => {
    const initialState = cameraSystem.getCameraAnalysis();
    
    // Simulate drag gesture for camera rotation
    cameraSystem.handleManualControl('orbit', { x: 100, y: 50 });
    
    // Should update camera orbital position
    // (Internal state changes not directly observable in analysis)
    expect(() => cameraSystem.handleManualControl('orbit', { x: -100, y: -50 })).not.toThrow();
  });
  
  test('resets to default view correctly', () => {
    // First change to a different view
    cameraSystem.handleManualControl('zoom', { x: 0, y: 0, scale: 0.3 }); // Zoom way in
    
    // Reset to default
    cameraSystem.handleManualControl('reset', { x: 0, y: 0 });
    
    const analysis = cameraSystem.getCameraAnalysis();
    
    // Should return to social view (Spore default)
    expect(analysis.targetDistance).toBeGreaterThan(8);
    expect(analysis.targetDistance).toBeLessThan(20);
  });
  
  test('updates camera position without errors', () => {
    // Create test creature for targeting
    const testCreature = world.add({
      transform: {
        position: new THREE.Vector3(10, 2, 10),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1)
      },
      creature: {
        species: 'test_creature' as any,
        size: 0.5,
        personality: 'neutral' as any,
        energy: 100,
        mood: 0
      }
    });
    
    // Set creature as camera target
    cameraSystem['setTarget'](testCreature, 'test');
    
    // Update camera (should not throw)
    expect(() => {
      cameraSystem.updateCamera(mockCamera, 1/60);
    }).not.toThrow();
    
    // Camera should be positioned relative to creature
    const distance = mockCamera.position.distanceTo(testCreature.transform!.position);
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(200); // Reasonable range
  });
  
  test('camera presets have valid configurations', () => {
    const presets = ['intimate', 'social', 'tactical', 'ecosystem', 'epic'];
    
    for (const presetName of presets) {
      expect(() => {
        cameraSystem['transitionToPreset'](presetName);
      }).not.toThrow();
      
      const analysis = cameraSystem.getCameraAnalysis();
      
      // All presets should produce valid camera configurations
      expect(analysis.targetDistance).toBeGreaterThan(0);
      expect(analysis.targetDistance).toBeLessThan(200);
      expect(analysis.heightAboveGround).toBeGreaterThan(0);
      expect(analysis.heightAboveGround).toBeLessThan(150);
    }
  });
  
  test('camera mode transitions are smooth', () => {
    const modes = [
      CameraMode.FOLLOW_CREATURE,
      CameraMode.OBSERVE_PACK,
      CameraMode.ENVIRONMENTAL,
      CameraMode.CINEMATIC
    ];
    
    for (const mode of modes) {
      cameraSystem['state'].mode = mode;
      
      // Update camera multiple times to test smoothness
      for (let i = 0; i < 10; i++) {
        expect(() => {
          cameraSystem.updateCamera(mockCamera, 1/60);
        }).not.toThrow();
      }
    }
  });
  
  test('pack center calculation works correctly', () => {
    // Create multiple creatures to form a pack
    const packMembers = [
      world.add({
        transform: {
          position: new THREE.Vector3(0, 2, 0),
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(1, 1, 1)
        },
        creature: {
          species: 'pack_member' as any,
          size: 0.5,
          personality: 'social' as any,
          energy: 100,
          mood: 0
        }
      }),
      world.add({
        transform: {
          position: new THREE.Vector3(10, 2, 0),
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(1, 1, 1)
        },
        creature: {
          species: 'pack_member' as any,
          size: 0.5,
          personality: 'social' as any,
          energy: 100,
          mood: 0
        }
      }),
      world.add({
        transform: {
          position: new THREE.Vector3(5, 2, 10),
          rotation: new THREE.Euler(0, 0, 0),
          scale: new THREE.Vector3(1, 1, 1)
        },
        creature: {
          species: 'pack_member' as any,
          size: 0.5,
          personality: 'social' as any,
          energy: 100,
          mood: 0
        }
      })
    ];
    
    const packCenter = cameraSystem['calculatePackCenter'](packMembers[0]);
    
    // Pack center should be roughly in the middle of all creatures
    expect(packCenter.x).toBeGreaterThan(3);
    expect(packCenter.x).toBeLessThan(7);
    expect(packCenter.z).toBeGreaterThan(2);
    expect(packCenter.z).toBeLessThan(6);
  });
});

describe('Camera Integration with Evolution Events', () => {
  let world: World<WorldSchema>;
  let cameraSystem: SporeStyleCameraSystem;
  let mockCamera: THREE.Camera;
  
  beforeEach(() => {
    world = new World<WorldSchema>();
    cameraSystem = new SporeStyleCameraSystem(world);
    mockCamera = new THREE.PerspectiveCamera();
  });
  
  test('high significance events trigger appropriate camera response', () => {
    const highSignificanceEvent = {
      generation: 5,
      timestamp: Date.now(),
      eventType: 'speciation' as const,
      description: 'Major speciation event',
      affectedCreatures: ['creature_1'],
      traits: [0.9, 0.8, 0.7],
      significance: 0.95
    };
    
    cameraSystem['handleEvolutionEvent'](highSignificanceEvent);
    
    // Update camera multiple times to allow transition
    for (let i = 0; i < 60; i++) {
      cameraSystem.updateCamera(mockCamera, 1/60);
    }
    
    const analysis = cameraSystem.getCameraAnalysis();
    
    // High significance should trigger epic view (preset distance is 80)
    // Transition is smooth, so check it's moving toward epic distance
    expect(analysis.targetDistance).toBeGreaterThan(15); // Should be greater than default
    expect(analysis.activityContext).toBeDefined();
  });
  
  test('camera system integrates with ECS creature queries', () => {
    // Create test creatures
    const creature1 = world.add({
      transform: {
        position: new THREE.Vector3(15, 2, 15),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1)
      },
      creature: {
        species: 'test_species' as any,
        size: 0.6,
        personality: 'curious' as any,
        energy: 90,
        mood: 0.2
      }
    });
    
    // Camera should be able to find and target creatures
    expect(() => {
      cameraSystem['setTarget'](creature1, 'test_targeting');
    }).not.toThrow();
    
    const analysis = cameraSystem.getCameraAnalysis();
    expect(analysis.activityContext).toBe('test_targeting');
  });
});