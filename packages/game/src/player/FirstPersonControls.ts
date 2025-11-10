/**
 * FIRST PERSON CONTROLS
 * 
 * Based on Yuka examples/playground/shooter/src/FirstPersonControls.js
 * Adapted for TypeScript + our game
 */

import { Vehicle, Vector3 } from 'yuka';

const PI05 = Math.PI / 2;
const direction = new Vector3();
const velocity = new Vector3();

export class FirstPersonControls {
  owner: Vehicle;
  
  movementX: number = 0; // yaw
  movementY: number = 0; // pitch
  
  acceleration: number = 50;
  brakingPower: number = 10;
  lookingSpeed: number = 1;
  
  input = {
    forward: false,
    backward: false,
    left: false,
    right: false
  };
  
  private _mouseDownHandler: (e: MouseEvent) => void;
  private _mouseMoveHandler: (e: MouseEvent) => void;
  private _pointerlockChangeHandler: () => void;
  private _keyDownHandler: (e: KeyboardEvent) => void;
  private _keyUpHandler: (e: KeyboardEvent) => void;
  
  constructor(owner: Vehicle) {
    this.owner = owner;
    
    this._mouseDownHandler = this.onMouseDown.bind(this);
    this._mouseMoveHandler = this.onMouseMove.bind(this);
    this._pointerlockChangeHandler = this.onPointerlockChange.bind(this);
    this._keyDownHandler = this.onKeyDown.bind(this);
    this._keyUpHandler = this.onKeyUp.bind(this);
  }
  
  connect(): void {
    document.addEventListener('mousedown', this._mouseDownHandler, false);
    document.addEventListener('mousemove', this._mouseMoveHandler, false);
    document.addEventListener('pointerlockchange', this._pointerlockChangeHandler, false);
    document.addEventListener('keydown', this._keyDownHandler, false);
    document.addEventListener('keyup', this._keyUpHandler, false);
    
    document.body.requestPointerLock();
    console.log('[FirstPersonControls] Connected');
  }
  
  disconnect(): void {
    document.removeEventListener('mousedown', this._mouseDownHandler, false);
    document.removeEventListener('mousemove', this._mouseMoveHandler, false);
    document.removeEventListener('pointerlockchange', this._pointerlockChangeHandler, false);
    document.removeEventListener('keydown', this._keyDownHandler, false);
    document.removeEventListener('keyup', this._keyUpHandler, false);
    
    console.log('[FirstPersonControls] Disconnected');
  }
  
  update(delta: number): void {
    const input = this.input;
    const owner = this.owner;
    
    // Apply braking
    velocity.x -= velocity.x * this.brakingPower * delta;
    velocity.z -= velocity.z * this.brakingPower * delta;
    
    // Calculate movement direction
    direction.z = Number(input.forward) - Number(input.backward);
    direction.x = Number(input.left) - Number(input.right);
    direction.normalize();
    
    // Apply acceleration
    if (input.forward || input.backward) velocity.z -= direction.z * this.acceleration * delta;
    if (input.left || input.right) velocity.x -= direction.x * this.acceleration * delta;
    
    // Apply velocity to owner (rotated by owner's facing direction)
    owner.velocity.copy(velocity).applyRotation(owner.rotation);
  }
  
  setRotation(yaw: number, pitch: number): void {
    this.movementX = yaw;
    this.movementY = pitch;
    
    this.owner.rotation.fromEuler(0, this.movementX, 0);
  }
  
  private onMouseDown(event: MouseEvent): void {
    // Could add shooting or interaction here
  }
  
  private onMouseMove(event: MouseEvent): void {
    this.movementX -= event.movementX * 0.001 * this.lookingSpeed;
    this.movementY -= event.movementY * 0.001 * this.lookingSpeed;
    
    // Clamp pitch
    this.movementY = Math.max(-PI05, Math.min(PI05, this.movementY));
    
    // Apply rotation (yaw and pitch)
    this.owner.rotation.fromEuler(0, this.movementX, 0);
  }
  
  private onPointerlockChange(): void {
    if (document.pointerLockElement === document.body) {
      console.log('[FirstPersonControls] Pointer locked');
    } else {
      this.disconnect();
      console.log('[FirstPersonControls] Pointer unlocked');
    }
  }
  
  private onKeyDown(event: KeyboardEvent): void {
    switch (event.keyCode) {
      case 38: // up arrow
      case 87: // W
        this.input.forward = true;
        break;
      case 37: // left arrow
      case 65: // A
        this.input.left = true;
        break;
      case 40: // down arrow
      case 83: // S
        this.input.backward = true;
        break;
      case 39: // right arrow
      case 68: // D
        this.input.right = true;
        break;
    }
  }
  
  private onKeyUp(event: KeyboardEvent): void {
    switch (event.keyCode) {
      case 38: // up arrow
      case 87: // W
        this.input.forward = false;
        break;
      case 37: // left arrow
      case 65: // A
        this.input.left = false;
        break;
      case 40: // down arrow
      case 83: // S
        this.input.backward = false;
        break;
      case 39: // right arrow
      case 68: // D
        this.input.right = false;
        break;
    }
  }
}

