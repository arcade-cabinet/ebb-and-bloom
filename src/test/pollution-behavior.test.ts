/**
 * Pollution & Behavior System Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createWorld } from 'bitecs';
import { createPlayer } from '../ecs/entities';
import { 
  calculateGlobalPollution,
  addPollution,
  shouldTriggerShock,
  executeShock,
  plantPurityGrove,
  Pollution,
  SHOCK_THRESHOLDS
} from '../ecs/systems/PollutionSystem';
import {
  recordAction,
  getDominantPlaystyle,
  getPlaystyleEffect,
  getWorldReactionModifiers,
  BehaviorProfile
} from '../ecs/systems/BehaviorSystem';

describe('PollutionSystem', () => {
  let world;
  let playerEid;
  
  beforeEach(() => {
    world = createWorld();
    playerEid = createPlayer(world, 0, 0);
  });
  
  it('should calculate global pollution from tiles', () => {
    const tiles = [1, 2, 3];
    Pollution.echo[1] = 30;
    Pollution.echo[2] = 50;
    Pollution.echo[3] = 20;
    
    const global = calculateGlobalPollution(world, tiles);
    
    expect(global).toBeCloseTo(33.33, 1); // (30+50+20)/3
  });
  
  it('should add pollution to tiles', () => {
    // Need to explicitly initialize first
    Pollution.echo[1] = 0;
    
    addPollution(1, 25);
    expect(Pollution.echo[1]).toBe(25);
    
    addPollution(1, 30);
    expect(Pollution.echo[1]).toBe(55);
  });
  
  it('should cap pollution at 100', () => {
    addPollution(1, 90);
    addPollution(1, 50);
    
    expect(Pollution.echo[1]).toBe(100);
  });
  
  it('should trigger whisper shock at 40% pollution', () => {
    const result = shouldTriggerShock(45, 0, 400000);
    
    expect(result.trigger).toBe(true);
    expect(result.type).toBe('whisper');
  });
  
  it('should trigger tempest shock at 70% pollution', () => {
    const result = shouldTriggerShock(75, 0, 400000);
    
    expect(result.trigger).toBe(true);
    expect(result.type).toBe('tempest');
  });
  
  it('should not trigger shock too soon after last shock', () => {
    const result = shouldTriggerShock(80, Date.now() - 100000, Date.now());
    
    expect(result.trigger).toBe(false);
  });
  
  it('should execute whisper shock with mutations', () => {
    const result = executeShock(world, 'whisper', { harmony: 0.5, conquest: 0.3, frolick: 0.2 });
    
    expect(result.mutations.length).toBeGreaterThan(0);
    expect(result.pollutionChange).toBeLessThan(0); // Cleanup
    expect(result.evoCost).toBeGreaterThan(0);
  });
  
  it('should plant purity grove to reduce pollution', () => {
    const tiles = [1, 2, 3];
    Pollution.echo[1] = 50;
    Pollution.echo[2] = 40;
    Pollution.echo[3] = 30;
    
    const result = plantPurityGrove(1, 2, tiles);
    
    expect(result.success).toBe(true);
    expect(result.pollutionReduced).toBeGreaterThan(0);
  });
});

describe('BehaviorSystem', () => {
  let world;
  let playerEid;
  let history;
  
  beforeEach(() => {
    world = createWorld();
    playerEid = createPlayer(world, 0, 0);
    history = { actions: [], timestamps: [] };
    
    // Initialize behavior profile
    BehaviorProfile.harmony[playerEid] = 0.33;
    BehaviorProfile.conquest[playerEid] = 0.33;
    BehaviorProfile.frolick[playerEid] = 0.33;
    BehaviorProfile.plantActions[playerEid] = 0;
    BehaviorProfile.chopActions[playerEid] = 0;
    BehaviorProfile.mineActions[playerEid] = 0;
    BehaviorProfile.craftActions[playerEid] = 0;
    BehaviorProfile.wanderActions[playerEid] = 0;
    BehaviorProfile.restoreActions[playerEid] = 0;
  });
  
  it('should record player actions', () => {
    recordAction(playerEid, 'chop', history);
    recordAction(playerEid, 'mine', history);
    
    expect(history.actions.length).toBe(2);
    expect(history.actions[0]).toBe('chop');
  });
  
  it('should identify conquest playstyle', () => {
    // Heavy extraction and crafting
    for (let i = 0; i < 50; i++) {
      recordAction(playerEid, 'chop', history);
      recordAction(playerEid, 'mine', history);
    }
    for (let i = 0; i < 20; i++) {
      recordAction(playerEid, 'craft', history);
    }
    
    const style = getDominantPlaystyle(playerEid);
    expect(style).toBe('conquest');
  });
  
  it('should identify harmony playstyle', () => {
    // Balanced planting and extraction
    for (let i = 0; i < 40; i++) {
      recordAction(playerEid, 'plant', history);
      recordAction(playerEid, 'chop', history);
    }
    
    const style = getDominantPlaystyle(playerEid);
    expect(style).toBe('harmony');
  });
  
  it('should identify frolick playstyle', () => {
    // Lots of wandering, minimal extraction
    for (let i = 0; i < 80; i++) {
      recordAction(playerEid, 'wander', history);
    }
    
    const style = getDominantPlaystyle(playerEid);
    expect(style).toBe('frolick');
  });
  
  it('should provide playstyle-specific effects', () => {
    // Set conquest profile
    BehaviorProfile.conquest[playerEid] = 0.7;
    BehaviorProfile.harmony[playerEid] = 0.2;
    BehaviorProfile.frolick[playerEid] = 0.1;
    
    const effect = getPlaystyleEffect(playerEid);
    
    expect(effect.name).toContain('Forge-Lord');
    expect(effect.buff).toBeTruthy();
    expect(effect.consequence).toBeTruthy();
  });
  
  it('should modify world reactions based on playstyle', () => {
    // Set harmony profile
    BehaviorProfile.harmony[playerEid] = 0.8;
    BehaviorProfile.conquest[playerEid] = 0.1;
    BehaviorProfile.frolick[playerEid] = 0.1;
    
    const modifiers = getWorldReactionModifiers(playerEid);
    
    expect(modifiers.pollutionRate).toBeLessThan(1.0); // Less pollution
    expect(modifiers.shockThreshold).toBeGreaterThan(1.0); // Higher threshold
    expect(modifiers.evolutionBias).toBe('symbiotic');
  });
  
  it('should limit action history to 100 entries', () => {
    for (let i = 0; i < 150; i++) {
      recordAction(playerEid, 'wander', history);
    }
    
    expect(history.actions.length).toBe(100);
  });
});
