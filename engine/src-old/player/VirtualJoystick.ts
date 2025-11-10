/**
 * VIRTUAL JOYSTICK FOR MOBILE
 * 
 * Touch-based movement controls inspired by Coherent Labs tutorial.
 * Creates an on-screen joystick for mobile devices.
 * 
 * Features:
 * - Dynamic joystick (appears where you touch)
 * - Visual feedback (shows direction/magnitude)
 * - Normalized output for movement
 */

export interface JoystickOutput {
  x: number; // -1 to 1 (left to right)
  y: number; // -1 to 1 (forward to backward)
  active: boolean;
}

export class VirtualJoystick {
  private container: HTMLDivElement;
  private base: HTMLDivElement;
  private stick: HTMLDivElement;
  
  private active: boolean = false;
  private startX: number = 0;
  private startY: number = 0;
  private currentX: number = 0;
  private currentY: number = 0;
  
  private maxDistance: number = 50; // Max stick distance from center
  
  private touchId: number | null = null;
  
  constructor(side: 'left' | 'right' = 'left') {
    // Create container
    this.container = document.createElement('div');
    this.container.style.position = 'fixed';
    this.container.style.bottom = '80px';
    this.container.style[side] = '40px';
    this.container.style.width = '150px';
    this.container.style.height = '150px';
    this.container.style.pointerEvents = 'none';
    this.container.style.zIndex = '1000';
    this.container.style.display = 'none'; // Hidden until touch
    
    // Create base (outer circle)
    this.base = document.createElement('div');
    this.base.style.position = 'absolute';
    this.base.style.width = '100%';
    this.base.style.height = '100%';
    this.base.style.borderRadius = '50%';
    this.base.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    this.base.style.border = '3px solid rgba(255, 255, 255, 0.5)';
    this.base.style.pointerEvents = 'none';
    
    // Create stick (inner circle)
    this.stick = document.createElement('div');
    this.stick.style.position = 'absolute';
    this.stick.style.width = '60px';
    this.stick.style.height = '60px';
    this.stick.style.borderRadius = '50%';
    this.stick.style.backgroundColor = 'rgba(0, 255, 136, 0.6)';
    this.stick.style.border = '2px solid rgba(0, 255, 136, 1)';
    this.stick.style.left = '45px'; // Centered
    this.stick.style.top = '45px';
    this.stick.style.pointerEvents = 'none';
    
    this.container.appendChild(this.base);
    this.container.appendChild(this.stick);
    document.body.appendChild(this.container);
    
    // Bind events
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    // Touch start
    document.addEventListener('touchstart', (e) => {
      if (this.touchId !== null) return; // Already tracking a touch
      
      const touch = e.touches[0];
      
      // Only respond to touches in the left/right half of screen
      const containerRect = this.container.getBoundingClientRect();
      const side = containerRect.left < window.innerWidth / 2 ? 'left' : 'right';
      const touchSide = touch.clientX < window.innerWidth / 2 ? 'left' : 'right';
      
      if (touchSide === side) {
        this.touchId = touch.identifier;
        this.startX = touch.clientX;
        this.startY = touch.clientY;
        this.currentX = touch.clientX;
        this.currentY = touch.clientY;
        this.active = true;
        
        // Position joystick at touch point
        this.container.style.left = `${touch.clientX - 75}px`;
        this.container.style.top = `${touch.clientY - 75}px`;
        this.container.style.display = 'block';
        
        this.updateStickPosition();
      }
    }, { passive: true });
    
    // Touch move
    document.addEventListener('touchmove', (e) => {
      if (this.touchId === null) return;
      
      // Find our touch
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === this.touchId) {
          this.currentX = e.touches[i].clientX;
          this.currentY = e.touches[i].clientY;
          this.updateStickPosition();
          break;
        }
      }
    }, { passive: true });
    
    // Touch end
    document.addEventListener('touchend', (e) => {
      if (this.touchId === null) return;
      
      // Check if our touch ended
      let touchEnded = true;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === this.touchId) {
          touchEnded = false;
          break;
        }
      }
      
      if (touchEnded) {
        this.active = false;
        this.touchId = null;
        this.container.style.display = 'none';
        
        // Reset stick to center
        this.stick.style.left = '45px';
        this.stick.style.top = '45px';
      }
    }, { passive: true });
  }
  
  private updateStickPosition(): void {
    // Calculate delta from start
    const deltaX = this.currentX - this.startX;
    const deltaY = this.currentY - this.startY;
    
    // Calculate distance and angle
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX);
    
    // Clamp to max distance
    const clampedDistance = Math.min(distance, this.maxDistance);
    
    // Calculate stick position
    const stickX = 75 + Math.cos(angle) * clampedDistance - 30;
    const stickY = 75 + Math.sin(angle) * clampedDistance - 30;
    
    this.stick.style.left = `${stickX}px`;
    this.stick.style.top = `${stickY}px`;
  }
  
  /**
   * Get current joystick state
   * Returns normalized values (-1 to 1)
   */
  getValue(): JoystickOutput {
    if (!this.active) {
      return { x: 0, y: 0, active: false };
    }
    
    // Calculate delta
    const deltaX = this.currentX - this.startX;
    const deltaY = this.currentY - this.startY;
    
    // Calculate distance
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const clampedDistance = Math.min(distance, this.maxDistance);
    
    // Normalize to [-1, 1]
    const normalizedDistance = clampedDistance / this.maxDistance;
    const angle = Math.atan2(deltaY, deltaX);
    
    return {
      x: Math.cos(angle) * normalizedDistance,
      y: Math.sin(angle) * normalizedDistance,
      active: true
    };
  }
  
  /**
   * Check if device is touch-enabled
   */
  static isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
  
  /**
   * Destroy joystick
   */
  destroy(): void {
    document.body.removeChild(this.container);
  }
}


