/**
 * Enhanced Gesture System
 * From docs/07-mobileUX.md
 * 
 * Touch-first mechanics: swipe, pinch, hold, gyro
 * Terraform gestures, combat moves, ritual gestures
 */

export interface GestureEvent {
  type: 'swipe' | 'pinch' | 'hold' | 'tap' | 'drag' | 'rotate';
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
  fingers?: number;
  angle?: number;
}

export interface GestureConfig {
  swipeThreshold: number;      // Min distance for swipe (px)
  holdDuration: number;         // Min time for hold (ms)
  pinchThreshold: number;       // Min distance change for pinch
  tapMaxDuration: number;       // Max time for tap
  doubleTapWindow: number;      // Window for double-tap
}

const DEFAULT_CONFIG: GestureConfig = {
  swipeThreshold: 50,
  holdDuration: 500,
  pinchThreshold: 20,
  tapMaxDuration: 200,
  doubleTapWindow: 300
};

/**
 * Enhanced gesture recognizer for mobile terraforming
 */
export class EnhancedGestureController {
  private config: GestureConfig;
  private touches: Map<number, Touch>;
  private gestureStart: number;
  private lastTap: number;
  private tapCount: number;
  private holdTimer: NodeJS.Timeout | null;
  
  constructor(
    private element: HTMLElement,
    private callbacks: {
      onSwipe?: (direction: string, distance: number) => void;
      onPinch?: (scale: number, center: { x: number; y: number }) => void;
      onHold?: (position: { x: number; y: number }) => void;
      onTap?: (position: { x: number; y: number }) => void;
      onDoubleTap?: (position: { x: number; y: number }) => void;
      onDrag?: (delta: { x: number; y: number }) => void;
      onRotate?: (angle: number) => void;
    },
    config?: Partial<GestureConfig>
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.touches = new Map();
    this.gestureStart = 0;
    this.lastTap = 0;
    this.tapCount = 0;
    this.holdTimer = null;
    
    this.setupListeners();
  }
  
  private setupListeners(): void {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
  }
  
  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    
    this.gestureStart = Date.now();
    
    // Store all touches
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      this.touches.set(touch.identifier, touch);
    }
    
    // Start hold timer for single touch
    if (event.touches.length === 1 && this.callbacks.onHold) {
      const touch = event.touches[0];
      this.holdTimer = setTimeout(() => {
        if (this.callbacks.onHold) {
          this.callbacks.onHold({ x: touch.clientX, y: touch.clientY });
        }
      }, this.config.holdDuration);
    }
  }
  
  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    
    // Cancel hold timer on move
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }
    
    if (event.touches.length === 1) {
      // Single finger drag
      this.handleDrag(event.touches[0]);
    } else if (event.touches.length === 2) {
      // Two-finger pinch/rotate
      this.handlePinchOrRotate(event.touches[0], event.touches[1]);
    }
  }
  
  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    
    const duration = Date.now() - this.gestureStart;
    
    // Cancel hold timer
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }
    
    // Detect tap vs swipe
    if (duration < this.config.tapMaxDuration && event.changedTouches.length === 1) {
      this.handleTap(event.changedTouches[0]);
    } else if (event.changedTouches.length === 1) {
      this.handleSwipe(event.changedTouches[0]);
    }
    
    // Clear stored touches
    for (let i = 0; i < event.changedTouches.length; i++) {
      this.touches.delete(event.changedTouches[i].identifier);
    }
  }
  
  private handleSwipe(touch: Touch): void {
    const startTouch = Array.from(this.touches.values())[0];
    if (!startTouch || !this.callbacks.onSwipe) return;
    
    const dx = touch.clientX - startTouch.clientX;
    const dy = touch.clientY - startTouch.clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < this.config.swipeThreshold) return;
    
    // Determine direction
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    let direction: string;
    
    if (angle > -45 && angle < 45) direction = 'right';
    else if (angle >= 45 && angle < 135) direction = 'down';
    else if (angle >= 135 || angle < -135) direction = 'left';
    else direction = 'up';
    
    this.callbacks.onSwipe(direction, distance);
  }
  
  private handleDrag(touch: Touch): void {
    if (!this.callbacks.onDrag) return;
    
    const startTouch = Array.from(this.touches.values())[0];
    if (!startTouch) return;
    
    const dx = touch.clientX - startTouch.clientX;
    const dy = touch.clientY - startTouch.clientY;
    
    this.callbacks.onDrag({ x: dx, y: dy });
  }
  
  private handlePinchOrRotate(touch1: Touch, touch2: Touch): void {
    const storedTouches = Array.from(this.touches.values());
    if (storedTouches.length < 2) return;
    
    const start1 = storedTouches[0];
    const start2 = storedTouches[1];
    
    // Calculate pinch
    if (this.callbacks.onPinch) {
      const startDist = Math.hypot(
        start2.clientX - start1.clientX,
        start2.clientY - start1.clientY
      );
      
      const currentDist = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      if (Math.abs(currentDist - startDist) > this.config.pinchThreshold) {
        const scale = currentDist / startDist;
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        
        this.callbacks.onPinch(scale, { x: centerX, y: centerY });
      }
    }
    
    // Calculate rotation
    if (this.callbacks.onRotate) {
      const startAngle = Math.atan2(
        start2.clientY - start1.clientY,
        start2.clientX - start1.clientX
      );
      
      const currentAngle = Math.atan2(
        touch2.clientY - touch1.clientY,
        touch2.clientX - touch1.clientX
      );
      
      const angleDiff = (currentAngle - startAngle) * 180 / Math.PI;
      
      if (Math.abs(angleDiff) > 10) {
        this.callbacks.onRotate(angleDiff);
      }
    }
  }
  
  private handleTap(touch: Touch): void {
    const now = Date.now();
    
    if (now - this.lastTap < this.config.doubleTapWindow) {
      // Double tap
      this.tapCount++;
      if (this.tapCount === 2 && this.callbacks.onDoubleTap) {
        this.callbacks.onDoubleTap({ x: touch.clientX, y: touch.clientY });
        this.tapCount = 0;
      }
    } else {
      // Single tap
      this.tapCount = 1;
      if (this.callbacks.onTap) {
        this.callbacks.onTap({ x: touch.clientX, y: touch.clientY });
      }
    }
    
    this.lastTap = now;
  }
  
  destroy(): void {
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
    }
    
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
  }
}

/**
 * Gesture action mappings for game mechanics
 */
export const GESTURE_ACTIONS = {
  // Terraforming
  SWIPE_UP_FLOOD: 'Flood tile with water (flipper trait)',
  SWIPE_DOWN_DIG: 'Dig/mine tile (drill trait)',
  SWIPE_LEFT_CLEAR: 'Clear vegetation (chainsaw trait)',
  SWIPE_RIGHT_PLANT: 'Plant/restore biome',
  
  // Combat
  SWIPE_QUICK: 'Quick attack/cleave',
  SWIPE_HOLD: 'Charged surge attack',
  PINCH_IN: 'Siphon/absorb enemy essence',
  PINCH_OUT: 'Release defensive shield',
  
  // Pack interaction
  TAP: 'Select/interact with pack',
  DOUBLE_TAP: 'Dispatch pack on quest',
  HOLD: 'Tame/bond with pack',
  
  // Camera
  TWO_FINGER_DRAG: 'Pan camera view',
  PINCH: 'Zoom in/out',
  ROTATE: 'Rotate view (future 3D)'
};

export const createGestureSystem = () => {
  return {
    EnhancedGestureController,
    GESTURE_ACTIONS
  };
};
