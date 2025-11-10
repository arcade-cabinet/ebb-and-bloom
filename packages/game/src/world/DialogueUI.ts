/**
 * DIALOGUE UI
 * 
 * HTML-based UI for displaying NPC dialogues.
 * Daggerfall-style with character portrait and text.
 */

import { DialogueState, DialogueOption } from './DialogueSystem';

export class DialogueUI {
  private container: HTMLDivElement;
  private greetingElement: HTMLDivElement;
  private optionsElement: HTMLDivElement;
  private onOptionSelected?: (option: DialogueOption) => void;
  
  constructor(onOptionSelected?: (option: DialogueOption) => void) {
    this.onOptionSelected = onOptionSelected;
    this.container = this.createUI();
    document.body.appendChild(this.container);
  }
  
  /**
   * Create dialogue UI elements
   */
  private createUI(): HTMLDivElement {
    const container = document.createElement('div');
    container.id = 'dialogue-ui';
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 600px;
      max-width: 90vw;
      background: rgba(0, 0, 0, 0.9);
      border: 3px solid #00ff88;
      border-radius: 8px;
      padding: 20px;
      display: none;
      font-family: 'Work Sans', sans-serif;
      z-index: 1000;
    `;
    
    // NPC name and role
    const header = document.createElement('div');
    header.id = 'dialogue-header';
    header.style.cssText = `
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      color: #00ff88;
      margin-bottom: 10px;
      border-bottom: 1px solid #00ff88;
      padding-bottom: 8px;
    `;
    container.appendChild(header);
    
    // Greeting/response text
    this.greetingElement = document.createElement('div');
    this.greetingElement.id = 'dialogue-text';
    this.greetingElement.style.cssText = `
      color: white;
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 15px;
      min-height: 60px;
    `;
    container.appendChild(this.greetingElement);
    
    // Options container
    this.optionsElement = document.createElement('div');
    this.optionsElement.id = 'dialogue-options';
    this.optionsElement.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;
    container.appendChild(this.optionsElement);
    
    return container;
  }
  
  /**
   * Show dialogue UI
   */
  show(state: DialogueState): void {
    const { npc, greeting, options } = state;
    
    // Update header
    const header = this.container.querySelector('#dialogue-header') as HTMLDivElement;
    const roleName = npc.role.charAt(0).toUpperCase() + npc.role.slice(1);
    header.textContent = `${roleName} from ${npc.settlement}`;
    
    // Update greeting
    this.greetingElement.textContent = greeting;
    
    // Clear and rebuild options
    this.optionsElement.innerHTML = '';
    options.forEach(option => {
      const button = document.createElement('button');
      button.textContent = option.text;
      button.style.cssText = `
        background: rgba(0, 255, 136, 0.2);
        border: 2px solid #00ff88;
        color: #00ff88;
        padding: 10px 20px;
        font-size: 14px;
        font-family: 'Work Sans', sans-serif;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s;
        text-align: left;
      `;
      
      button.addEventListener('mouseenter', () => {
        button.style.background = 'rgba(0, 255, 136, 0.3)';
        button.style.transform = 'translateX(5px)';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.background = 'rgba(0, 255, 136, 0.2)';
        button.style.transform = 'translateX(0)';
      });
      
      button.addEventListener('click', () => {
        if (this.onOptionSelected) {
          this.onOptionSelected(option);
        }
      });
      
      this.optionsElement.appendChild(button);
    });
    
    // Show container
    this.container.style.display = 'block';
  }
  
  /**
   * Hide dialogue UI
   */
  hide(): void {
    this.container.style.display = 'none';
  }
  
  /**
   * Update dialogue text (for responses)
   */
  updateText(text: string): void {
    this.greetingElement.textContent = text;
  }
  
  /**
   * Check if dialogue UI is visible
   */
  isVisible(): boolean {
    return this.container.style.display === 'block';
  }
  
  /**
   * Cleanup
   */
  dispose(): void {
    if (this.container.parentElement) {
      this.container.parentElement.removeChild(this.container);
    }
  }
}

