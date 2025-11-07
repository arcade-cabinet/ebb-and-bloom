/**
 * Genetic Synthesis System Tests - Validate trait combination and emergent naming
 */

import { describe, test, expect, beforeEach } from 'vitest';
import GeneticSynthesisSystem from '../systems/GeneticSynthesisSystem';

describe('GeneticSynthesisSystem', () => {
  let genetics: GeneticSynthesisSystem;
  
  beforeEach(() => {
    genetics = new GeneticSynthesisSystem();
  });
  
  test('synthesizes creature form from trait combinations', () => {
    const testTraits = [0.8, 0.6, 0.4, 0.9, 0.7, 0.3, 0.5, 0.2, 0.6, 0.4];
    
    const result = genetics.synthesizeCreatureForm(testTraits);
    
    expect(result).toBeDefined();
    expect(result.morphology).toBeDefined();
    expect(result.behavior).toBeDefined(); 
    expect(result.emergentName).toBeDefined();
    expect(result.compatibility).toBeGreaterThanOrEqual(0);
    expect(result.compatibility).toBeLessThanOrEqual(1);
    
    // Verify morphological changes are within bounds
    expect(result.morphology.bodyProportions.height).toBeGreaterThanOrEqual(-1);
    expect(result.morphology.bodyProportions.height).toBeLessThanOrEqual(1);
    expect(result.morphology.bodyProportions.limbCount).toBeGreaterThanOrEqual(0);
    expect(result.morphology.bodyProportions.limbCount).toBeLessThanOrEqual(4);
  });
  
  test('generates different names for different trait combinations', () => {
    const traits1 = [0.1, 0.2, 0.8, 0.9, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
    const traits2 = [0.9, 0.8, 0.2, 0.1, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2];
    
    const result1 = genetics.synthesizeCreatureForm(traits1);
    const result2 = genetics.synthesizeCreatureForm(traits2);
    
    expect(result1.emergentName).not.toBe(result2.emergentName);
  });
  
  test('applies genetic compatibility rules correctly', () => {
    // Test known compatibility: FlipperFeet (trait 0) + StorageSacs (trait 6)
    const traits = Array(10).fill(0);
    traits[0] = 0.8; // High FlipperFeet
    traits[6] = 0.9; // High StorageSacs
    
    const result = genetics.synthesizeCreatureForm(traits);
    
    // Should produce aquatic + hoarding combination
    expect(result.emergentName).toContain('cache_swimmer');
    expect(result.compatibility).toBeGreaterThan(0.7); // High compatibility
    expect(result.behavior.activityPatterns.resourceHoarding).toBeGreaterThan(0.8);
  });
  
  test('generates novel combinations for unknown trait pairs', () => {
    // Use traits that don't have predefined compatibility
    const traits = [0.3, 0.7, 0.2, 0.4, 0.6, 0.8, 0.1, 0.5, 0.9, 0.2];
    
    const result = genetics.synthesizeCreatureForm(traits);
    
    expect(result).toBeDefined();
    expect(result.emergentName).toBeDefined();
    expect(result.compatibility).toBeLessThan(0.8); // Novel combinations have lower compatibility
  });
  
  test('morphological changes scale with trait intensity', () => {
    const lowTraits = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
    const highTraits = [0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9];
    
    const lowResult = genetics.synthesizeCreatureForm(lowTraits);
    const highResult = genetics.synthesizeCreatureForm(highTraits);
    
    // High traits should produce more extreme morphology
    const lowLimbCount = lowResult.morphology.bodyProportions.limbCount;
    const highLimbCount = highResult.morphology.bodyProportions.limbCount;
    
    expect(highLimbCount).toBeGreaterThanOrEqual(lowLimbCount);
  });
  
  test('behavioral changes reflect trait values', () => {
    const socialTraits = Array(10).fill(0.2);
    socialTraits[3] = 0.9; // High social trait
    
    const result = genetics.synthesizeCreatureForm(socialTraits);
    
    expect(result.behavior.yukaModifiers.flockTendency).toBeGreaterThan(0.7);
    expect(result.behavior.activityPatterns.symbioticSeeking).toBeGreaterThan(0.5);
  });
  
  test('texture modifiers are applied correctly', () => {
    const traits = [0.8, 0.3, 0.6, 0.4, 0.7, 0.9, 0.2, 0.5, 0.8, 0.1];
    
    const result = genetics.synthesizeCreatureForm(traits);
    
    expect(result.morphology.textureModifiers.roughness).toBeGreaterThanOrEqual(-1);
    expect(result.morphology.textureModifiers.roughness).toBeLessThanOrEqual(1);
    expect(result.morphology.textureModifiers.pattern).toBeDefined();
    expect(result.morphology.textureModifiers.colorShift).toBeGreaterThanOrEqual(-1);
    expect(result.morphology.textureModifiers.colorShift).toBeLessThanOrEqual(1);
  });
});