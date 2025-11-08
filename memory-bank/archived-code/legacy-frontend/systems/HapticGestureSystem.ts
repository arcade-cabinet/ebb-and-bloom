/**
 * Haptic Gesture System - Mobile-first touch interaction and haptic feedback
 * Integrates with Capacitor for native mobile haptics
 */

import * as THREE from 'three';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { log } from '../utils/Logger';
import { gameClock } from './GameClock';
import { useEvolutionDataStore } from '../stores/EvolutionDataStore';

export enum GestureType {
  TAP = 'tap',
  DOUBLE_TAP = 'double_tap', 
  LONG_PRESS = 'long_press',
  SWIPE = 'swipe',
  PINCH = 'pinch',
  ROTATE = 'rotate',
  DRAG = 'drag'
}

export enum HapticPattern {
  // Basic feedback
  LIGHT_TAP = 'light_tap',
  MEDIUM_IMPACT = 'medium_impact',
  HEAVY_IMPACT = 'heavy_impact',
  
  // Evolution events  
  TRAIT_EMERGENCE = 'trait_emergence',
  PACK_FORMATION = 'pack_formation',
  SHOCK_EVENT = 'shock_event',
  
  // Interaction feedback
  RESOURCE_COLLECTION = 'resource_collection',
  CRAFTING_SUCCESS = 'crafting_success',
  DISCOVERY = 'discovery',
  
  // Emotional/atmospheric
  HEARTBEAT = 'heartbeat',
  BREATHING = 'breathing',
  TENSION = 'tension',
  RELEASE = 'release',
  CRESCENDO = 'crescendo'
}

interface GestureEvent {
  type: GestureType;
  position: THREE.Vector2; // Screen coordinates
  startPosition: THREE.Vector2;
  currentPosition: THREE.Vector2;
  deltaPosition: THREE.Vector2;
  startTime: number;
  duration: number;
  velocity: THREE.Vector2;
  pressure: number; // 0-1 if available
  fingers: number; // Multi-touch count
}

interface HapticSequence {
  pattern: HapticPattern;
  steps: HapticStep[];
  duration: number;
  intensity: number; // 0-1 overall intensity
  playstyleModifier: 'harmony' | 'conquest' | 'frolick' | 'neutral';
}

interface HapticStep {
  delay: number; // ms from start
  type: 'impact' | 'vibration' | 'pulse';
  intensity: number; // 0-1
  duration: number; // ms
  frequency?: number; // Hz for vibration
}

interface TouchInteraction {
  gesture: GestureEvent;
  worldPosition: THREE.Vector3 | null; // Raycast hit point
  targetEntity: any | null; // What was touched
  actionType: 'observe' | 'collect' | 'craft' | 'move' | 'interact';
  hapticFeedback: HapticPattern;
}

class HapticGestureSystem {
  private gestureListeners = new Map<GestureType, Array<(gesture: GestureEvent) => void>>();
  private hapticSequences = new Map<HapticPattern, HapticSequence>();
  private activeGestures = new Map<number, GestureEvent>(); // Touch ID -> gesture
  private camera: THREE.Camera | null = null;
  private raycaster = new THREE.Raycaster();
  private touchSensitivity = 1.0;
  private hapticIntensity = 1.0;
  
  constructor() {
    this.initializeHapticPatterns();
    this.setupGestureHandlers();
    log.info('HapticGestureSystem initialized for mobile-first interaction');
  }
  
  private initializeHapticPatterns(): void {
    log.info('Initializing haptic feedback patterns...');
    
    // Basic impact patterns
    this.hapticSequences.set(HapticPattern.LIGHT_TAP, {
      pattern: HapticPattern.LIGHT_TAP,
      steps: [
        { delay: 0, type: 'impact', intensity: 0.3, duration: 50 }
      ],
      duration: 50,
      intensity: 0.3,
      playstyleModifier: 'neutral'
    });
    
    this.hapticSequences.set(HapticPattern.MEDIUM_IMPACT, {
      pattern: HapticPattern.MEDIUM_IMPACT,
      steps: [
        { delay: 0, type: 'impact', intensity: 0.6, duration: 100 }
      ],
      duration: 100,
      intensity: 0.6,
      playstyleModifier: 'neutral'
    });
    
    // Evolution event patterns
    this.hapticSequences.set(HapticPattern.TRAIT_EMERGENCE, {
      pattern: HapticPattern.TRAIT_EMERGENCE,
      steps: [
        { delay: 0, type: 'pulse', intensity: 0.4, duration: 200 },
        { delay: 250, type: 'pulse', intensity: 0.6, duration: 200 },
        { delay: 500, type: 'pulse', intensity: 0.8, duration: 200 }
      ],
      duration: 700,
      intensity: 0.7,
      playstyleModifier: 'harmony'
    });
    
    this.hapticSequences.set(HapticPattern.PACK_FORMATION, {
      pattern: HapticPattern.PACK_FORMATION,
      steps: [
        { delay: 0, type: 'vibration', intensity: 0.5, duration: 150, frequency: 30 },
        { delay: 100, type: 'vibration', intensity: 0.5, duration: 150, frequency: 30 },
        { delay: 200, type: 'vibration', intensity: 0.5, duration: 150, frequency: 30 },
        { delay: 400, type: 'impact', intensity: 0.7, duration: 200 }
      ],
      duration: 600,
      intensity: 0.6,
      playstyleModifier: 'harmony'
    });
    
    this.hapticSequences.set(HapticPattern.SHOCK_EVENT, {
      pattern: HapticPattern.SHOCK_EVENT,
      steps: [
        { delay: 0, type: 'impact', intensity: 1.0, duration: 300 },
        { delay: 350, type: 'vibration', intensity: 0.8, duration: 500, frequency: 15 },
        { delay: 900, type: 'pulse', intensity: 0.4, duration: 200 }
      ],
      duration: 1100,
      intensity: 0.9,
      playstyleModifier: 'conquest'
    });
    
    // Interaction feedback
    this.hapticSequences.set(HapticPattern.RESOURCE_COLLECTION, {
      pattern: HapticPattern.RESOURCE_COLLECTION,
      steps: [
        { delay: 0, type: 'pulse', intensity: 0.5, duration: 100 },
        { delay: 150, type: 'impact', intensity: 0.4, duration: 50 }
      ],
      duration: 200,
      intensity: 0.4,
      playstyleModifier: 'neutral'
    });
    
    this.hapticSequences.set(HapticPattern.CRAFTING_SUCCESS, {
      pattern: HapticPattern.CRAFTING_SUCCESS,
      steps: [
        { delay: 0, type: 'pulse', intensity: 0.6, duration: 150 },
        { delay: 200, type: 'pulse', intensity: 0.7, duration: 150 },
        { delay: 400, type: 'impact', intensity: 0.8, duration: 200 }
      ],
      duration: 600,
      intensity: 0.7,
      playstyleModifier: 'harmony'
    });
    
    // Atmospheric patterns
    this.hapticSequences.set(HapticPattern.HEARTBEAT, {
      pattern: HapticPattern.HEARTBEAT,
      steps: [
        { delay: 0, type: 'pulse', intensity: 0.3, duration: 100 },
        { delay: 800, type: 'pulse', intensity: 0.3, duration: 100 }
      ],
      duration: 900,
      intensity: 0.3,
      playstyleModifier: 'neutral'
    });
    
    this.hapticSequences.set(HapticPattern.CRESCENDO, {
      pattern: HapticPattern.CRESCENDO,
      steps: [
        { delay: 0, type: 'pulse', intensity: 0.2, duration: 100 },
        { delay: 200, type: 'pulse', intensity: 0.4, duration: 150 },
        { delay: 450, type: 'pulse', intensity: 0.6, duration: 200 },
        { delay: 750, type: 'impact', intensity: 0.9, duration: 250 }
      ],
      duration: 1000,
      intensity: 0.8,
      playstyleModifier: 'frolick'
    });
    
    log.info('Haptic patterns initialized', {
      totalPatterns: this.hapticSequences.size,
      patterns: Array.from(this.hapticSequences.keys())
    });
  }
  
  private setupGestureHandlers(): void {
    // Set up touch event listeners for gesture recognition
    document.addEventListener('touchstart', this.handleTouchStart.bind(this));
    document.addEventListener('touchmove', this.handleTouchMove.bind(this));
    document.addEventListener('touchend', this.handleTouchEnd.bind(this));
    document.addEventListener('touchcancel', this.handleTouchCancel.bind(this));
    
    // Mouse events for desktop testing
    document.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    log.info('Gesture handlers initialized for mobile and desktop');
  }
  
  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    
    for (const touch of Array.from(event.changedTouches)) {
      const position = new THREE.Vector2(touch.clientX, touch.clientY);
      
      const gestureEvent: GestureEvent = {
        type: GestureType.TAP, // Will be determined by subsequent events
        position,
        startPosition: position.clone(),
        currentPosition: position.clone(),
        deltaPosition: new THREE.Vector2(0, 0),
        startTime: Date.now(),
        duration: 0,
        velocity: new THREE.Vector2(0, 0),
        pressure: touch.force || 1.0,
        fingers: event.touches.length
      };
      
      this.activeGestures.set(touch.identifier, gestureEvent);
    }
  }
  
  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    
    for (const touch of Array.from(event.changedTouches)) {
      const gesture = this.activeGestures.get(touch.identifier);
      if (!gesture) continue;
      
      const newPosition = new THREE.Vector2(touch.clientX, touch.clientY);
      const deltaTime = Date.now() - gesture.startTime;
      
      gesture.currentPosition = newPosition;
      gesture.deltaPosition = newPosition.clone().sub(gesture.startPosition);
      gesture.duration = deltaTime;
      gesture.velocity = gesture.deltaPosition.clone().divideScalar(deltaTime / 1000);
      
      // Determine gesture type based on movement
      if (gesture.deltaPosition.length() > 20) {
        if (event.touches.length === 2) {
          gesture.type = GestureType.PINCH; // Could be pinch or rotate
        } else {
          gesture.type = GestureType.SWIPE;
        }
      } else if (deltaTime > 500) {
        gesture.type = GestureType.LONG_PRESS;
      }
    }
  }
  
  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    
    for (const touch of Array.from(event.changedTouches)) {
      const gesture = this.activeGestures.get(touch.identifier);
      if (!gesture) continue;
      
      // Finalize gesture type
      this.finalizeGestureType(gesture);
      
      // Process completed gesture
      this.processGesture(gesture);
      
      // Remove from active gestures
      this.activeGestures.delete(touch.identifier);
    }
  }
  
  private handleTouchCancel(event: TouchEvent): void {
    // Clean up cancelled touches
    for (const touch of Array.from(event.changedTouches)) {
      this.activeGestures.delete(touch.identifier);
    }
  }
  
  private handleMouseDown(event: MouseEvent): void {
    // Desktop mouse simulation for testing
    const position = new THREE.Vector2(event.clientX, event.clientY);
    
    const gestureEvent: GestureEvent = {
      type: GestureType.TAP,
      position,
      startPosition: position.clone(),
      currentPosition: position.clone(),
      deltaPosition: new THREE.Vector2(0, 0),
      startTime: Date.now(),
      duration: 0,
      velocity: new THREE.Vector2(0, 0),
      pressure: 1.0,
      fingers: 1
    };
    
    this.activeGestures.set(-1, gestureEvent); // Use -1 for mouse
  }
  
  private handleMouseMove(event: MouseEvent): void {
    if (!event.buttons) return;
    
    const gesture = this.activeGestures.get(-1);
    if (!gesture) return;
    
    const newPosition = new THREE.Vector2(event.clientX, event.clientY);
    gesture.currentPosition = newPosition;
    gesture.deltaPosition = newPosition.clone().sub(gesture.startPosition);
    gesture.duration = Date.now() - gesture.startTime;
    
    if (gesture.deltaPosition.length() > 10) {
      gesture.type = GestureType.DRAG;
    }
  }
  
  private handleMouseUp(event: MouseEvent): void {
    const gesture = this.activeGestures.get(-1);
    if (!gesture) return;
    
    this.finalizeGestureType(gesture);
    this.processGesture(gesture);
    this.activeGestures.delete(-1);
  }
  
  private finalizeGestureType(gesture: GestureEvent): void {
    const distance = gesture.deltaPosition.length();
    const duration = gesture.duration;
    
    if (distance < 10 && duration < 200) {
      gesture.type = GestureType.TAP;
    } else if (distance < 10 && duration > 500) {
      gesture.type = GestureType.LONG_PRESS;
    } else if (distance > 20) {
      if (gesture.fingers > 1) {
        gesture.type = GestureType.PINCH; // Or rotate
      } else {
        gesture.type = GestureType.SWIPE;
      }
    } else {
      gesture.type = GestureType.DRAG;
    }
  }
  
  private processGesture(gesture: GestureEvent): void {
    log.debug('Processing gesture', {
      type: gesture.type,
      position: gesture.position.toArray(),
      duration: gesture.duration,
      distance: gesture.deltaPosition.length()
    });
    
    // Dispatch to unified event store
    const store = useEvolutionDataStore.getState();
    
    // Map internal GestureType to store GestureEvent type
    const mapType = (type: GestureType): import('../stores/EvolutionDataStore').GestureEvent['type'] => {
      switch (type) {
        case GestureType.TAP: return 'tap';
        case GestureType.DOUBLE_TAP: return 'double_tap';
        case GestureType.LONG_PRESS: return 'long_press';
        case GestureType.SWIPE: return 'swipe';
        case GestureType.PINCH: return 'pinch';
        case GestureType.ROTATE: return 'rotate';
        case GestureType.DRAG: return 'drag';
        default: return 'tap';
      }
    };
    
    // Get direction from velocity
    const getDirection = (): 'up' | 'down' | 'left' | 'right' | undefined => {
      const vel = gesture.velocity;
      if (Math.abs(vel.x) > Math.abs(vel.y)) {
        return vel.x > 0 ? 'right' : 'left';
      } else {
        return vel.y > 0 ? 'down' : 'up';
      }
    };
    
    const gestureEvent: import('../stores/EvolutionDataStore').GestureEvent = {
      type: mapType(gesture.type),
      position: { x: gesture.position.x, y: gesture.position.y },
      direction: getDirection(),
      distance: gesture.deltaPosition.length(),
      duration: gesture.duration,
      fingers: gesture.fingers,
      timestamp: Date.now(),
    };
    store.dispatchGestureEvent(gestureEvent);
    
    // Update input mode
    if (gesture.fingers > 0) {
      store.setInputMode('touch');
    }
    
    // Raycast to find world interaction target
    const worldInteraction = this.raycastFromScreen(gesture.position);
    
    // Determine interaction type
    const interaction = this.classifyInteraction(gesture, worldInteraction);
    
    // Trigger haptic feedback
    this.triggerHapticFeedback(interaction.hapticFeedback);
    
    // Notify gesture listeners
    const listeners = this.gestureListeners.get(gesture.type) || [];
    for (const listener of listeners) {
      try {
        listener(gesture);
      } catch (error) {
        log.error('Gesture listener error', error);
      }
    }
    
    log.info('Gesture processed', {
      gesture: gesture.type,
      action: interaction.actionType,
      haptic: interaction.hapticFeedback,
      worldHit: !!interaction.worldPosition
    });
  }
  
  private raycastFromScreen(screenPosition: THREE.Vector2): { 
    worldPosition: THREE.Vector3 | null; 
    entity: any | null; 
  } {
    
    if (!this.camera) {
      return { worldPosition: null, entity: null };
    }
    
    // Convert screen coordinates to normalized device coordinates
    const ndc = new THREE.Vector2(
      (screenPosition.x / window.innerWidth) * 2 - 1,
      -(screenPosition.y / window.innerHeight) * 2 + 1
    );
    
    this.raycaster.setFromCamera(ndc, this.camera);
    
    // Would raycast against scene objects in production
    // For now, return approximate world position
    const worldPosition = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), worldPosition);
    
    return { worldPosition, entity: null };
  }
  
  private classifyInteraction(
    gesture: GestureEvent,
    worldTarget: { worldPosition: THREE.Vector3 | null; entity: any | null }
  ): TouchInteraction {
    
    let actionType: TouchInteraction['actionType'] = 'observe';
    let hapticPattern: HapticPattern = HapticPattern.LIGHT_TAP;
    
    switch (gesture.type) {
      case GestureType.TAP:
        actionType = 'collect';
        hapticPattern = HapticPattern.RESOURCE_COLLECTION;
        break;
        
      case GestureType.DOUBLE_TAP:
        actionType = 'interact';
        hapticPattern = HapticPattern.MEDIUM_IMPACT;
        break;
        
      case GestureType.LONG_PRESS:
        actionType = 'observe';
        hapticPattern = HapticPattern.DISCOVERY;
        break;
        
      case GestureType.SWIPE:
        actionType = 'move';
        hapticPattern = HapticPattern.LIGHT_TAP;
        break;
        
      case GestureType.PINCH:
        actionType = 'observe'; // Zoom/focus
        hapticPattern = HapticPattern.LIGHT_TAP;
        break;
        
      case GestureType.DRAG:
        actionType = 'craft'; // Move materials
        hapticPattern = HapticPattern.TENSION;
        break;
    }
    
    return {
      gesture,
      worldPosition: worldTarget.worldPosition,
      targetEntity: worldTarget.entity,
      actionType,
      hapticFeedback: hapticPattern
    };
  }
  
  /**
   * Trigger haptic feedback pattern
   */
  async triggerHapticFeedback(pattern: HapticPattern, intensityModifier: number = 1.0): Promise<void> {
    const sequence = this.hapticSequences.get(pattern);
    if (!sequence) {
      log.warn('Unknown haptic pattern', { pattern });
      return;
    }
    
    try {
      // Execute haptic sequence
      for (const step of sequence.steps) {
        setTimeout(async () => {
          const adjustedIntensity = Math.min(1.0, step.intensity * intensityModifier * this.hapticIntensity);
          
          switch (step.type) {
            case 'impact':
              await Haptics.impact({ 
                style: this.getImpactStyle(adjustedIntensity) 
              });
              break;
              
            case 'vibration':
            case 'pulse':
              await Haptics.vibrate({ 
                duration: step.duration 
              });
              break;
          }
        }, step.delay);
      }
      
      log.debug('Haptic feedback triggered', {
        pattern,
        duration: sequence.duration,
        intensity: sequence.intensity * intensityModifier
      });
      
    } catch (error) {
      // Graceful fallback for non-mobile devices
      log.debug('Haptic feedback unavailable (desktop/web)', { pattern });
    }
  }
  
  private getImpactStyle(intensity: number): ImpactStyle {
    if (intensity > 0.7) return ImpactStyle.Heavy;
    if (intensity > 0.4) return ImpactStyle.Medium;
    return ImpactStyle.Light;
  }
  
  /**
   * Subscribe to specific gesture types
   */
  onGesture(type: GestureType, listener: (gesture: GestureEvent) => void): () => void {
    if (!this.gestureListeners.has(type)) {
      this.gestureListeners.set(type, []);
    }
    
    this.gestureListeners.get(type)!.push(listener);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.gestureListeners.get(type);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }
  
  /**
   * Set camera reference for raycasting
   */
  setCamera(camera: THREE.Camera): void {
    this.camera = camera;
    log.info('Camera reference set for gesture raycasting');
  }
  
  /**
   * Trigger evolution event haptics
   */
  triggerEvolutionHaptic(eventType: EvolutionEvent['eventType'], significance: number): void {
    if (!this.hapticsEnabled) return;

    let pattern: HapticPattern;
    
    switch (eventType) {
      case 'trait_emergence':
        pattern = HapticPattern.TRAIT_EMERGENCE;
        break;
      case 'pack_formation':
        pattern = HapticPattern.PACK_FORMATION;
        break;
      case 'extinction':
        pattern = HapticPattern.SHOCK_EVENT;
        break;
      default:
        pattern = HapticPattern.DISCOVERY;
    }
    
    this.triggerHapticFeedback(pattern, significance);
  }
  
  /**
   * Initialize auto-listening to GameClock evolution events
   */
  initializeEvolutionListening(): void {
    gameClock.onEvolutionEvent((event) => {
      this.triggerEvolutionHaptic(event.eventType, event.significance);
    });
    
    log.info('HapticGestureSystem now listening to evolution events');
  }
  
  private hapticsEnabled = true;
  
  setHapticsEnabled(enabled: boolean): void {
    this.hapticsEnabled = enabled;
  }
  
  /**
   * Configure haptic intensity (accessibility)
   */
  setHapticIntensity(intensity: number): void {
    this.hapticIntensity = Math.max(0, Math.min(1, intensity));
    log.info('Haptic intensity adjusted', { intensity: this.hapticIntensity });
  }
  
  /**
   * Configure touch sensitivity
   */
  setTouchSensitivity(sensitivity: number): void {
    this.touchSensitivity = Math.max(0.1, Math.min(2.0, sensitivity));
    log.info('Touch sensitivity adjusted', { sensitivity: this.touchSensitivity });
  }
  
  // Analysis methods
  getInteractionMetrics(): {
    totalGestures: number;
    gestureDistribution: Record<GestureType, number>;
    averageGestureDuration: number;
    hapticFeedbackCount: number;
  } {
    // Would track actual metrics in production
    return {
      totalGestures: 0,
      gestureDistribution: {} as Record<GestureType, number>,
      averageGestureDuration: 0,
      hapticFeedbackCount: 0
    };
  }
}

export default HapticGestureSystem;