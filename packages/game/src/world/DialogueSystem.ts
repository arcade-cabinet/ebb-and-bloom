/**
 * DIALOGUE SYSTEM
 * 
 * Simple dialogue system for NPC interactions.
 * Inspired by Daggerfall's click-to-talk system.
 * 
 * Features:
 * - Raycast to detect NPC clicks
 * - Role-based dialogue trees
 * - Procedural greetings based on time/weather
 * - Simple response options (Rumors, Services, Goodbye)
 */

import * as THREE from 'three';
import { NPCData, NPCRole } from './NPCSpawner';
import { EnhancedRNG } from '../utils/EnhancedRNG';

export interface DialogueOption {
  text: string;
  response: string;
  action?: () => void;
}

export interface DialogueState {
  npc: NPCData;
  greeting: string;
  options: DialogueOption[];
}

export class DialogueSystem {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private raycaster: THREE.Raycaster;
  private seed: string;
  private rng: EnhancedRNG;
  private currentDialogue: DialogueState | null = null;
  private onDialogueOpen?: (state: DialogueState) => void;
  private onDialogueClose?: () => void;
  
  constructor(
    scene: THREE.Scene, 
    camera: THREE.Camera, 
    seed: string,
    callbacks?: {
      onOpen?: (state: DialogueState) => void,
      onClose?: () => void
    }
  ) {
    this.scene = scene;
    this.camera = camera;
    this.raycaster = new THREE.Raycaster();
    this.seed = seed;
    this.rng = new EnhancedRNG(seed);
    this.onDialogueOpen = callbacks?.onOpen;
    this.onDialogueClose = callbacks?.onClose;
  }
  
  /**
   * Check if player clicked on an NPC
   * Returns NPC mesh if hit, null otherwise
   */
  raycastNPC(
    mouseX: number, 
    mouseY: number, 
    npcMeshes: THREE.Mesh[]
  ): THREE.Mesh | null {
    // Convert screen coordinates to normalized device coordinates (-1 to +1)
    const mouse = new THREE.Vector2(mouseX, mouseY);
    
    // Update raycaster
    this.raycaster.setFromCamera(mouse, this.camera);
    
    // Check intersections
    const intersects = this.raycaster.intersectObjects(npcMeshes, false);
    
    if (intersects.length > 0) {
      return intersects[0].object as THREE.Mesh;
    }
    
    return null;
  }
  
  /**
   * Start dialogue with an NPC
   */
  startDialogue(npc: NPCData, gameTime: number): void {
    const greeting = this.generateGreeting(npc, gameTime);
    const options = this.generateOptions(npc);
    
    this.currentDialogue = {
      npc,
      greeting,
      options
    };
    
    if (this.onDialogueOpen) {
      this.onDialogueOpen(this.currentDialogue);
    }
  }
  
  /**
   * End current dialogue
   */
  endDialogue(): void {
    this.currentDialogue = null;
    if (this.onDialogueClose) {
      this.onDialogueClose();
    }
  }
  
  /**
   * Generate greeting based on NPC role and time
   */
  private generateGreeting(npc: NPCData, gameTime: number): string {
    const hour = Math.floor(gameTime);
    let timeGreeting: string;
    
    if (hour >= 5 && hour < 12) {
      timeGreeting = 'Good morning';
    } else if (hour >= 12 && hour < 18) {
      timeGreeting = 'Good afternoon';
    } else if (hour >= 18 && hour < 22) {
      timeGreeting = 'Good evening';
    } else {
      timeGreeting = 'Hello';
    }
    
    // Role-specific greetings
    const roleGreetings: Record<NPCRole, string[]> = {
      [NPCRole.MERCHANT]: [
        `${timeGreeting}! Looking to buy or sell?`,
        `Welcome to my shop! What can I get you?`,
        `${timeGreeting}, traveler. Fine wares here!`
      ],
      [NPCRole.GUARD]: [
        `${timeGreeting}. Keep the peace.`,
        `Move along, citizen.`,
        `${timeGreeting}. Everything in order?`
      ],
      [NPCRole.PRIEST]: [
        `${timeGreeting}, child. Seek you wisdom?`,
        `Blessings upon you, traveler.`,
        `${timeGreeting}. How may I guide you?`
      ],
      [NPCRole.BLACKSMITH]: [
        `${timeGreeting}! Need repairs?`,
        `Ah, ${timeGreeting}. Finest steel in town!`,
        `${timeGreeting}. What brings you to my forge?`
      ],
      [NPCRole.FARMER]: [
        `${timeGreeting}! Honest work, honest pay.`,
        `${timeGreeting}, friend. Fresh from the fields!`,
        `Ah, ${timeGreeting}. Hard day's work ahead.`
      ],
      [NPCRole.VILLAGER]: [
        `${timeGreeting}!`,
        `Oh, hello there!`,
        `${timeGreeting}, stranger.`
      ]
    };
    
    const greetings = roleGreetings[npc.role];
    const index = Math.floor(this.rng.uniform(0, 1) * greetings.length);
    return greetings[index];
  }
  
  /**
   * Generate dialogue options based on NPC role
   */
  private generateOptions(npc: NPCData): DialogueOption[] {
    const options: DialogueOption[] = [];
    
    // Rumors (everyone)
    options.push({
      text: 'Any rumors?',
      response: this.generateRumor(npc)
    });
    
    // Role-specific options
    switch (npc.role) {
      case NPCRole.MERCHANT:
        options.push({
          text: 'What do you sell?',
          response: 'I have tools, food, and various supplies. Come back when trading is implemented!'
        });
        break;
        
      case NPCRole.GUARD:
        options.push({
          text: 'Any trouble lately?',
          response: 'Things have been quiet. Keep your nose clean and we won\'t have problems.'
        });
        break;
        
      case NPCRole.PRIEST:
        options.push({
          text: 'Tell me about the gods.',
          response: 'The old ways teach balance - give and take, ebb and bloom. All things in their season.'
        });
        break;
        
      case NPCRole.BLACKSMITH:
        options.push({
          text: 'Can you repair my equipment?',
          response: 'Aye, when equipment is implemented! Come back then.'
        });
        break;
        
      case NPCRole.FARMER:
        options.push({
          text: 'How are the crops?',
          response: 'The land is good here. We have enough for the season.'
        });
        break;
        
      case NPCRole.VILLAGER:
        options.push({
          text: 'How\'s life here?',
          response: 'Can\'t complain. Quiet town, good people.'
        });
        break;
    }
    
    // Goodbye (everyone)
    options.push({
      text: 'Goodbye',
      response: 'Farewell, traveler.',
      action: () => this.endDialogue()
    });
    
    return options;
  }
  
  /**
   * Generate a random rumor
   */
  private generateRumor(npc: NPCData): string {
    const rumors = [
      'I heard strange noises from the forest last night.',
      'Trade has been good this season.',
      'Some travelers mentioned seeing lights in the mountains.',
      'The harvest will be good this year, mark my words.',
      'I wouldn\'t wander too far from town if I were you.',
      'They say the old ruins to the north are cursed.',
      'Business is business, times are what they are.',
      'Nothing much happens around here, to be honest.'
    ];
    
    const index = Math.floor(this.rng.uniform(0, 1) * rumors.length);
    return rumors[index];
  }
  
  /**
   * Select a dialogue option
   */
  selectOption(option: DialogueOption): string {
    if (option.action) {
      option.action();
    }
    return option.response;
  }
  
  /**
   * Get current dialogue state
   */
  getCurrentDialogue(): DialogueState | null {
    return this.currentDialogue;
  }
  
  /**
   * Check if dialogue is active
   */
  isDialogueActive(): boolean {
    return this.currentDialogue !== null;
  }
}


