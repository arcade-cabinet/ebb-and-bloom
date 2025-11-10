/**
 * ACTION BUTTONS
 * 
 * Mobile action buttons for Daggerfall-style interactions:
 * - Jump
 * - Attack (swing weapon)
 * - Use/Interact
 * - Sprint
 * 
 * Positioned on right side of screen for thumb access.
 */

export interface ActionButtonCallbacks {
  onJump?: () => void;
  onAttack?: () => void;
  onUse?: () => void;
  onSprint?: (active: boolean) => void;
}

export class ActionButtons {
  private container: HTMLDivElement;
  private callbacks: ActionButtonCallbacks;
  private sprintActive: boolean = false;
  
  constructor(callbacks: ActionButtonCallbacks = {}) {
    this.callbacks = callbacks;
    this.container = this.createUI();
    
    // Only show on touch devices
    if (this.isTouchDevice()) {
      document.body.appendChild(this.container);
    }
  }
  
  private isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
  
  private createUI(): HTMLDivElement {
    const container = document.createElement('div');
    container.id = 'action-buttons';
    container.style.cssText = `
      position: fixed;
      right: 20px;
      bottom: 20px;
      display: flex;
      flex-direction: column;
      gap: 15px;
      z-index: 1000;
      pointer-events: none;
    `;
    
    // Jump button (top)
    const jumpBtn = this.createButton('↑', 'JUMP');
    jumpBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.callbacks.onJump) this.callbacks.onJump();
      this.flashButton(jumpBtn);
    });
    
    // Attack button (middle)
    const attackBtn = this.createButton('⚔', 'ATTACK');
    attackBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.callbacks.onAttack) this.callbacks.onAttack();
      this.flashButton(attackBtn);
    });
    
    // Use/Interact button (bottom)
    const useBtn = this.createButton('✋', 'USE');
    useBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.callbacks.onUse) this.callbacks.onUse();
      this.flashButton(useBtn);
    });
    
    // Sprint toggle (hold)
    const sprintBtn = this.createButton('▶▶', 'SPRINT');
    sprintBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.sprintActive = true;
      sprintBtn.style.background = 'rgba(0, 255, 136, 0.5)';
      if (this.callbacks.onSprint) this.callbacks.onSprint(true);
    });
    sprintBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.sprintActive = false;
      sprintBtn.style.background = 'rgba(255, 255, 255, 0.2)';
      if (this.callbacks.onSprint) this.callbacks.onSprint(false);
    });
    
    container.appendChild(jumpBtn);
    container.appendChild(attackBtn);
    container.appendChild(useBtn);
    container.appendChild(sprintBtn);
    
    return container;
  }
  
  private createButton(icon: string, label: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.innerHTML = `
      <div style="font-size: 24px; line-height: 1;">${icon}</div>
      <div style="font-size: 10px; margin-top: 4px;">${label}</div>
    `;
    button.style.cssText = `
      width: 70px;
      height: 70px;
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      color: white;
      font-family: 'Work Sans', sans-serif;
      font-weight: bold;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
      -webkit-tap-highlight-color: transparent;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      transition: all 0.1s;
    `;
    
    return button;
  }
  
  private flashButton(button: HTMLButtonElement): void {
    button.style.background = 'rgba(0, 255, 136, 0.8)';
    button.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      button.style.background = 'rgba(255, 255, 255, 0.2)';
      button.style.transform = 'scale(1)';
    }, 150);
  }
  
  destroy(): void {
    if (this.container.parentElement) {
      this.container.parentElement.removeChild(this.container);
    }
  }
}


