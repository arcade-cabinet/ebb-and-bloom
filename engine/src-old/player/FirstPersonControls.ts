/**
 * FIRST PERSON CONTROLS
 * 
 * Based on Yuka examples/playground/shooter/src/FirstPersonControls.js
 * Adapted for TypeScript + our game
 * 
 * Key insight: Camera pitch is separate from Vehicle yaw
 * Vehicle handles horizontal rotation (yaw), camera handles vertical tilt (pitch)
 */

import { Vehicle, Vector3 } from 'yuka';
import * as THREE from 'three';
import { VirtualJoystick } from './VirtualJoystick';

const PI05 = Math.PI / 2;
const direction = new Vector3();
const velocity = new Vector3();

export class FirstPersonControls {
  owner: Vehicle;
  camera: THREE.Camera | null = null; // Need camera reference for pitch
  
  public movementX: number = 0; // yaw (public for minimap)
  public movementY: number = 0; // pitch
  
  acceleration: number = 50;
  brakingPower: number = 10;
  lookingSpeed: number = 1;
  
  input = {
    forward: false,
    backward: false,
    left: false,
    right: false
  };
  
  // Virtual joystick for mobile
  private moveJoystick: VirtualJoystick | null = null;
  private lookJoystick: VirtualJoystick | null = null;
  
  private _mouseDownHandler: (e: MouseEvent) => void;
  private _mouseMoveHandler: (e: MouseEvent) => void;
  private _pointerlockChangeHandler: () => void;
  private _keyDownHandler: (e: KeyboardEvent) => void;
  private _keyUpHandler: (e: KeyboardEvent) => void;
  
  constructor(owner: Vehicle, camera?: THREE.Camera) {
    this.owner = owner;
    this.camera = camera || null;
    
    this._mouseDownHandler = this.onMouseDown.bind(this);
    this._mouseMoveHandler = this.onMouseMove.bind(this);
    this._pointerlockChangeHandler = this.onPointerlockChange.bind(this);
    this._keyDownHandler = this.onKeyDown.bind(this);
    this._keyUpHandler = this.onKeyUp.bind(this);
    
    // Initialize virtual joysticks on touch devices
    if (VirtualJoystick.isTouchDevice()) {
      this.moveJoystick = new VirtualJoystick('left');  // Movement on left
      this.lookJoystick = new VirtualJoystick('right'); // Looking on right
      console.log('[FirstPersonControls] Virtual joysticks initialized for mobile');
    }
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
    
    // Destroy virtual joysticks if they exist
    if (this.moveJoystick) {
      this.moveJoystick.destroy();
      this.moveJoystick = null;
    }
    if (this.lookJoystick) {
      this.lookJoystick.destroy();
      this.lookJoystick = null;
    }
    
    console.log('[FirstPersonControls] Disconnected');
  }
  
  update(delta: number): void {
    const input = this.input;
    const owner = this.owner;
    
    // Apply braking
    velocity.x -= velocity.x * this.brakingPower * delta;
    velocity.z -= velocity.z * this.brakingPower * delta;
    
    // Calculate movement direction from keyboard
    direction.z = Number(input.forward) - Number(input.backward);
    direction.x = Number(input.left) - Number(input.right);
    
    // Add virtual joystick input (mobile)
    if (this.moveJoystick) {
      const joystickInput = this.moveJoystick.getValue();
      if (joystickInput.active) {
        // Joystick: x = left/right, y = forward/backward
        direction.x += joystickInput.x;
        direction.z -= joystickInput.y; // Invert Y for forward/back
      }
    }
    
    // Normalize direction
    if (direction.length() > 0) {
      direction.normalize();
    }
    
    // Apply acceleration
    if (direction.z !== 0) velocity.z -= direction.z * this.acceleration * delta;
    if (direction.x !== 0) velocity.x -= direction.x * this.acceleration * delta;
    
    // Handle look joystick (mobile camera YAW only - Daggerfall style)
    if (this.lookJoystick) {
      const lookInput = this.lookJoystick.getValue();
      if (lookInput.active) {
        // ONLY control yaw (horizontal rotation) - NO PITCH
        this.movementX -= lookInput.x * delta * 3; // Turn left/right
        
        // Apply yaw rotation (camera stays level)
        this.owner.rotation.fromEuler(0, this.movementX, 0);
        if (this.camera) {
          this.camera.rotation.order = 'YXZ';
          this.camera.rotation.y = this.movementX;
          this.camera.rotation.x = 0; // ALWAYS LEVEL - Daggerfall style
          this.camera.rotation.z = 0;
        }
      }
    }
    
    // Apply velocity to owner (rotated by owner's facing direction)
    owner.velocity.copy(velocity).applyRotation(owner.rotation);
  }
  
  setRotation(yaw: number, pitch: number): void {
    this.movementX = yaw;
    this.movementY = pitch;
    
    // Apply to owner (movement direction)
    this.owner.rotation.fromEuler(0, this.movementX, 0);
    
    // Apply to camera (visual direction)
    if (this.camera) {
      this.camera.rotation.order = 'YXZ';
      this.camera.rotation.y = this.movementX;
      this.camera.rotation.x = this.movementY;
      this.camera.rotation.z = 0;
    }
  }
  
  private onMouseDown(event: MouseEvent): void {
    // Could add shooting or interaction here
  }
  
  private onMouseMove(event: MouseEvent): void {
    // YAW: Horizontal rotation (turn left/right)
    this.movementX -= event.movementX * 0.001 * this.lookingSpeed;
    
    // PITCH: Vertical rotation (look up/down) - ONLY for mouse, NOT mobile
    this.movementY -= event.movementY * 0.001 * this.lookingSpeed;
    this.movementY = Math.max(-PI05, Math.min(PI05, this.movementY));
    
    // Apply yaw to owner (horizontal rotation for movement)
    this.owner.rotation.fromEuler(0, this.movementX, 0);
    
    // Apply yaw + pitch to camera (visual rotation)
    if (this.camera) {
      this.camera.rotation.order = 'YXZ';
      this.camera.rotation.y = this.movementX;
      this.camera.rotation.x = this.movementY; // Mouse can look up/down
      this.camera.rotation.z = 0; // Never roll
    }
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
      case 16: // Shift
        this.owner.maxSpeed = 20; // Sprint
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
      case 16: // Shift
        this.owner.maxSpeed = 10; // Normal speed
        break;
    }
  }
}

