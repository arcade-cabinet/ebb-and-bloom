/**
 * Player module
 * Handles touch gestures (swipe/joystick), catalyst character movement
 * Includes modular 8x8 sprite with flipper trail warp effect
 */

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.velocityX = 0;
    this.velocityY = 0;
    this.speed = 100; // pixels per second
    this.maxSpeed = 200;
    
    // Sprite properties (8x8 modular)
    this.spriteSize = 8;
    this.direction = 'down'; // down, up, left, right
    this.flipX = false;
    this.animation = 'idle';
    
    // Trail effect for warp
    this.trail = [];
    this.maxTrailLength = 10;
    
    // Inventory for crafting
    this.inventory = {
      ore: 0,
      water: 0,
      alloy: 0
    };
  }

  update(deltaTime) {
    // Update position based on velocity
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
    
    // Update trail
    this.updateTrail();
    
    // Decay velocity
    this.velocityX *= 0.9;
    this.velocityY *= 0.9;
    
    // Update direction based on velocity
    if (Math.abs(this.velocityX) > Math.abs(this.velocityY)) {
      this.direction = this.velocityX > 0 ? 'right' : 'left';
      this.flipX = this.velocityX < 0;
    } else if (Math.abs(this.velocityY) > 0.1) {
      this.direction = this.velocityY > 0 ? 'down' : 'up';
    }
    
    // Update animation
    const moving = Math.abs(this.velocityX) > 5 || Math.abs(this.velocityY) > 5;
    this.animation = moving ? 'walk' : 'idle';
  }

  updateTrail() {
    // Add current position to trail
    this.trail.push({ x: this.x, y: this.y, alpha: 1.0 });
    
    // Remove old trail points
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }
    
    // Fade trail
    this.trail.forEach((point, i) => {
      point.alpha = i / this.maxTrailLength;
    });
  }

  applyForce(forceX, forceY) {
    this.velocityX = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.velocityX + forceX));
    this.velocityY = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.velocityY + forceY));
  }

  moveTo(targetX, targetY, speed = 1.0) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 1) {
      this.velocityX = (dx / distance) * this.speed * speed;
      this.velocityY = (dy / distance) * this.speed * speed;
    }
  }

  collectResource(type) {
    if (this.inventory[type] !== undefined) {
      this.inventory[type]++;
      return true;
    }
    return false;
  }

  craft(recipe) {
    // Basic crafting: ore + water = alloy
    if (recipe === 'alloy') {
      if (this.inventory.ore > 0 && this.inventory.water > 0) {
        this.inventory.ore--;
        this.inventory.water--;
        this.inventory.alloy++;
        return true;
      }
    }
    return false;
  }

  getPosition() {
    return { x: this.x, y: this.y };
  }

  getTilePosition(tileSize = 8) {
    return {
      x: Math.floor(this.x / tileSize),
      y: Math.floor(this.y / tileSize)
    };
  }
}

export class GestureController {
  constructor(player, element) {
    this.player = player;
    this.element = element;
    
    // Touch state
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchCurrentX = 0;
    this.touchCurrentY = 0;
    this.isTouching = false;
    this.touchStartTime = 0;
    
    // Joystick mode
    this.joystickMode = false;
    this.joystickDeadzone = 10;
    this.joystickRadius = 50;
    
    // Swipe detection
    this.swipeThreshold = 50;
    this.swipeTimeout = 300;
    
    this.setupListeners();
  }

  setupListeners() {
    // Bind methods once and store references for proper cleanup
    this.boundHandleTouchStart = this.handleTouchStart.bind(this);
    this.boundHandleTouchMove = this.handleTouchMove.bind(this);
    this.boundHandleTouchEnd = this.handleTouchEnd.bind(this);
    this.boundHandleMouseDown = this.handleMouseDown.bind(this);
    this.boundHandleMouseMove = this.handleMouseMove.bind(this);
    this.boundHandleMouseUp = this.handleMouseUp.bind(this);
    
    // Touch events
    this.element.addEventListener('touchstart', this.boundHandleTouchStart, { passive: false });
    this.element.addEventListener('touchmove', this.boundHandleTouchMove, { passive: false });
    this.element.addEventListener('touchend', this.boundHandleTouchEnd, { passive: false });
    
    // Mouse events for testing
    this.element.addEventListener('mousedown', this.boundHandleMouseDown);
    this.element.addEventListener('mousemove', this.boundHandleMouseMove);
    this.element.addEventListener('mouseup', this.boundHandleMouseUp);
  }

  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.startTouch(touch.clientX, touch.clientY);
  }

  handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.moveTouch(touch.clientX, touch.clientY);
  }

  handleTouchEnd(e) {
    e.preventDefault();
    this.endTouch();
  }

  handleMouseDown(e) {
    this.startTouch(e.clientX, e.clientY);
  }

  handleMouseMove(e) {
    if (this.isTouching) {
      this.moveTouch(e.clientX, e.clientY);
    }
  }

  handleMouseUp(e) {
    this.endTouch();
  }

  startTouch(x, y) {
    this.isTouching = true;
    this.touchStartX = x;
    this.touchStartY = y;
    this.touchCurrentX = x;
    this.touchCurrentY = y;
    this.touchStartTime = Date.now();
  }

  moveTouch(x, y) {
    if (!this.isTouching) return;
    
    this.touchCurrentX = x;
    this.touchCurrentY = y;
    
    const deltaX = x - this.touchStartX;
    const deltaY = y - this.touchStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Switch to joystick mode if touch held
    if (distance > this.joystickDeadzone) {
      this.joystickMode = true;
    }
    
    if (this.joystickMode) {
      this.handleJoystick(deltaX, deltaY);
    }
  }

  endTouch() {
    if (!this.isTouching) return;
    
    const deltaX = this.touchCurrentX - this.touchStartX;
    const deltaY = this.touchCurrentY - this.touchStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = Date.now() - this.touchStartTime;
    
    // Detect swipe
    if (!this.joystickMode && distance > this.swipeThreshold && duration < this.swipeTimeout) {
      this.handleSwipe(deltaX, deltaY);
    }
    
    this.isTouching = false;
    this.joystickMode = false;
  }

  handleJoystick(deltaX, deltaY) {
    // Normalize to joystick radius
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const clampedDistance = Math.min(distance, this.joystickRadius);
    const factor = clampedDistance / this.joystickRadius;
    
    if (distance > this.joystickDeadzone) {
      const normalizedX = (deltaX / distance) * factor;
      const normalizedY = (deltaY / distance) * factor;
      
      this.player.applyForce(
        normalizedX * this.player.speed * 0.5,
        normalizedY * this.player.speed * 0.5
      );
    }
  }

  handleSwipe(deltaX, deltaY) {
    // Quick swipe for dash movement
    const swipeForce = 50;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const normalizedX = deltaX / distance;
    const normalizedY = deltaY / distance;
    
    this.player.applyForce(
      normalizedX * swipeForce,
      normalizedY * swipeForce
    );
  }

  getJoystickState() {
    if (!this.joystickMode) return null;
    
    return {
      x: this.touchStartX,
      y: this.touchStartY,
      deltaX: this.touchCurrentX - this.touchStartX,
      deltaY: this.touchCurrentY - this.touchStartY,
      radius: this.joystickRadius
    };
  }

  destroy() {
    // Cleanup listeners using stored bound references
    this.element.removeEventListener('touchstart', this.boundHandleTouchStart);
    this.element.removeEventListener('touchmove', this.boundHandleTouchMove);
    this.element.removeEventListener('touchend', this.boundHandleTouchEnd);
    this.element.removeEventListener('mousedown', this.boundHandleMouseDown);
    this.element.removeEventListener('mousemove', this.boundHandleMouseMove);
    this.element.removeEventListener('mouseup', this.boundHandleMouseUp);
  }
}

export default Player;
