/**
 * CosmicStageDescriptor Tests
 * 
 * Verify deterministic stage generation from seed
 */

import { describe, it, expect } from 'vitest';
import { EnhancedRNG } from '../../../engine/utils/EnhancedRNG';
import { createStageDescriptors, CosmicStageDescriptor, SDFPrimitive } from '../../../engine/genesis/CosmicStageDescriptor';

describe('CosmicStageDescriptor', () => {
  describe('createStageDescriptors', () => {
    it('should create exactly 9 stages', () => {
      const rng = new EnhancedRNG('test-seed');
      const stages = createStageDescriptors(rng);
      
      expect(stages).toHaveLength(9);
    });

    it('should create stages with correct names in order', () => {
      const rng = new EnhancedRNG('test-seed');
      const stages = createStageDescriptors(rng);
      
      expect(stages[0].stageName).toBe('Quantum Fluctuation');
      expect(stages[1].stageName).toBe('Cosmic Inflation');
      expect(stages[2].stageName).toBe('Dark Matter Web');
      expect(stages[3].stageName).toBe('Population III Stars');
      expect(stages[4].stageName).toBe('First Supernovae');
      expect(stages[5].stageName).toBe('Galaxy Formation');
      expect(stages[6].stageName).toBe('Molecular Cloud');
      expect(stages[7].stageName).toBe('Stellar Furnace');
      expect(stages[8].stageName).toBe('Planetary Accretion');
    });

    it('should create deterministic stages from same seed', () => {
      const stages1 = createStageDescriptors(new EnhancedRNG('seed-1'));
      const stages2 = createStageDescriptors(new EnhancedRNG('seed-1'));
      
      expect(stages1).toHaveLength(stages2.length);
      
      for (let i = 0; i < stages1.length; i++) {
        expect(stages1[i].stageName).toBe(stages2[i].stageName);
        expect(stages1[i].duration).toBe(stages2[i].duration);
        expect(stages1[i].description).toBe(stages2[i].description);
        expect(stages1[i].audioMotif).toBe(stages2[i].audioMotif);
        expect(stages1[i].hapticPattern).toBe(stages2[i].hapticPattern);
        
        const primitives1 = stages1[i].sdfPrimitives();
        const primitives2 = stages2[i].sdfPrimitives();
        
        expect(primitives1).toHaveLength(primitives2.length);
      }
    });

    it('should create different stages from different seeds', () => {
      const stages1 = createStageDescriptors(new EnhancedRNG('seed-1'));
      const stages2 = createStageDescriptors(new EnhancedRNG('seed-2'));
      
      expect(stages1).toHaveLength(stages2.length);
      
      const primitives1 = stages1[0].sdfPrimitives();
      const primitives2 = stages2[0].sdfPrimitives();
      
      let hasDifference = false;
      for (let i = 0; i < Math.min(primitives1.length, primitives2.length); i++) {
        if (
          primitives1[i].position[0] !== primitives2[i].position[0] ||
          primitives1[i].position[1] !== primitives2[i].position[1] ||
          primitives1[i].position[2] !== primitives2[i].position[2]
        ) {
          hasDifference = true;
          break;
        }
      }
      
      expect(hasDifference).toBe(true);
    });

    it('should have valid durations for all stages', () => {
      const rng = new EnhancedRNG('test-seed');
      const stages = createStageDescriptors(rng);
      
      for (const stage of stages) {
        expect(stage.duration).toBeGreaterThan(0);
        expect(stage.duration).toBeLessThan(60);
      }
    });

    it('should have non-empty descriptions for all stages', () => {
      const rng = new EnhancedRNG('test-seed');
      const stages = createStageDescriptors(rng);
      
      for (const stage of stages) {
        expect(stage.description).toBeTruthy();
        expect(stage.description.length).toBeGreaterThan(10);
      }
    });

    it('should have valid material IDs for all stages', () => {
      const rng = new EnhancedRNG('test-seed');
      const stages = createStageDescriptors(rng);
      
      for (const stage of stages) {
        expect(stage.materials).toBeTruthy();
        expect(stage.materials.length).toBeGreaterThan(0);
        
        for (const materialId of stage.materials) {
          expect(materialId).toBeTruthy();
          expect(typeof materialId).toBe('string');
        }
      }
    });

    it('should have valid shader uniforms for all stages', () => {
      const rng = new EnhancedRNG('test-seed');
      const stages = createStageDescriptors(rng);
      
      for (const stage of stages) {
        expect(stage.shaderUniforms).toBeTruthy();
        expect(typeof stage.shaderUniforms).toBe('object');
        expect(Object.keys(stage.shaderUniforms).length).toBeGreaterThan(0);
      }
    });

    it('should have valid audio motifs for all stages', () => {
      const rng = new EnhancedRNG('test-seed');
      const stages = createStageDescriptors(rng);
      
      for (const stage of stages) {
        expect(stage.audioMotif).toBeTruthy();
        expect(typeof stage.audioMotif).toBe('string');
        expect(stage.audioMotif.length).toBeGreaterThan(5);
      }
    });

    it('should have valid haptic patterns for all stages', () => {
      const rng = new EnhancedRNG('test-seed');
      const stages = createStageDescriptors(rng);
      
      for (const stage of stages) {
        expect(stage.hapticPattern).toBeTruthy();
        expect(typeof stage.hapticPattern).toBe('string');
        expect(stage.hapticPattern.length).toBeGreaterThan(3);
      }
    });
  });

  describe('SDFPrimitives', () => {
    it('should generate primitives for Quantum Fluctuation stage', () => {
      const rng = new EnhancedRNG('test-seed');
      const stages = createStageDescriptors(rng);
      const quantumStage = stages[0];
      
      const primitives = quantumStage.sdfPrimitives();
      
      expect(primitives.length).toBeGreaterThan(0);
      
      for (const primitive of primitives) {
        expect(primitive.type).toBe('sphere');
        expect(primitive.position).toHaveLength(3);
        expect(primitive.rotation).toHaveLength(3);
        expect(primitive.scale).toHaveLength(3);
        expect(primitive.materialId).toBeTruthy();
      }
    });

    it('should generate primitives for Inflation stage', () => {
      const rng = new EnhancedRNG('test-seed');
      const stages = createStageDescriptors(rng);
      const inflationStage = stages[1];
      
      const primitives = inflationStage.sdfPrimitives();
      
      expect(primitives.length).toBeGreaterThan(0);
      
      for (const primitive of primitives) {
        expect(primitive.type).toBe('torus');
        expect(primitive.operation).toBe('smoothUnion');
        expect(primitive.smoothness).toBeGreaterThan(0);
      }
    });

    it('should generate primitives for Dark Matter Web stage', () => {
      const rng = new EnhancedRNG('test-seed');
      const stages = createStageDescriptors(rng);
      const darkMatterStage = stages[2];
      
      const primitives = darkMatterStage.sdfPrimitives();
      
      expect(primitives.length).toBeGreaterThan(0);
      
      const gyroidPrimitive = primitives.find(p => p.type === 'gyroid');
      expect(gyroidPrimitive).toBeTruthy();
      
      const spherePrimitives = primitives.filter(p => p.type === 'sphere');
      expect(spherePrimitives.length).toBeGreaterThan(0);
    });

    it('should generate primitives for Population III Stars stage', () => {
      const rng = new EnhancedRNG('test-seed');
      const stages = createStageDescriptors(rng);
      const starsStage = stages[3];
      
      const primitives = starsStage.sdfPrimitives();
      
      expect(primitives.length).toBeGreaterThan(10);
      
      for (const primitive of primitives) {
        expect(primitive.type).toBe('sphere');
        expect(primitive.parameters.mass).toBeGreaterThan(0);
      }
    });

    it('should generate primitives for Supernova stage', () => {
      const rng = new EnhancedRNG('test-seed');
      const stages = createStageDescriptors(rng);
      const supernovaStage = stages[4];
      
      const primitives = supernovaStage.sdfPrimitives();
      
      expect(primitives.length).toBeGreaterThan(0);
      
      const corePrimitive = primitives[0];
      expect(corePrimitive.materialId).toBe('element-fe');
      
      const shockwaves = primitives.slice(1);
      expect(shockwaves.length).toBeGreaterThan(0);
    });

    it('should generate primitives for Galaxy Formation stage', () => {
      const rng = new EnhancedRNG('test-seed');
      const stages = createStageDescriptors(rng);
      const galaxyStage = stages[5];
      
      const primitives = galaxyStage.sdfPrimitives();
      
      expect(primitives.length).toBeGreaterThan(50);
      
      const corePrimitive = primitives[0];
      expect(corePrimitive.type).toBe('sphere');
      expect(corePrimitive.scale[1]).toBeLessThan(corePrimitive.scale[0]);
    });

    it('should generate primitives for Molecular Cloud stage', () => {
      const rng = new EnhancedRNG('test-seed');
      const stages = createStageDescriptors(rng);
      const cloudStage = stages[6];
      
      const primitives = cloudStage.sdfPrimitives();
      
      expect(primitives.length).toBeGreaterThan(0);
      
      const ellipsoid = primitives.find(p => p.type === 'ellipsoid');
      expect(ellipsoid).toBeTruthy();
      
      const cylinders = primitives.filter(p => p.type === 'cylinder');
      expect(cylinders.length).toBeGreaterThan(0);
    });

    it('should generate primitives for Stellar Furnace stage', () => {
      const rng = new EnhancedRNG('test-seed');
      const stages = createStageDescriptors(rng);
      const furnaceStage = stages[7];
      
      const primitives = furnaceStage.sdfPrimitives();
      
      expect(primitives.length).toBeGreaterThan(0);
      
      const centralStar = primitives[0];
      expect(centralStar.type).toBe('sphere');
      
      const diskRings = primitives.filter(p => p.type === 'torus');
      expect(diskRings.length).toBeGreaterThan(0);
    });

    it('should generate primitives for Planetary Accretion stage', () => {
      const rng = new EnhancedRNG('test-seed');
      const stages = createStageDescriptors(rng);
      const planetStage = stages[8];
      
      const primitives = planetStage.sdfPrimitives();
      
      expect(primitives.length).toBeGreaterThan(0);
      
      const layers = primitives.filter(p => p.type === 'sphere').slice(0, 4);
      expect(layers.length).toBe(4);
      
      expect(layers[0].materialId).toBe('element-fe');
      expect(layers[1].materialId).toBe('element-mg');
      expect(layers[2].materialId).toBe('element-si');
      expect(layers[3].materialId).toBe('element-o');
    });

    it('should maintain consistent primitive count across calls with same seed', () => {
      const stages1 = createStageDescriptors(new EnhancedRNG('seed-consistency'));
      const stages2 = createStageDescriptors(new EnhancedRNG('seed-consistency'));
      
      for (let i = 0; i < stages1.length; i++) {
        const primitives1 = stages1[i].sdfPrimitives();
        const primitives2 = stages2[i].sdfPrimitives();
        
        expect(primitives1.length).toBe(primitives2.length);
      }
    });

    it('should have valid primitive properties', () => {
      const rng = new EnhancedRNG('test-seed');
      const stages = createStageDescriptors(rng);
      
      for (const stage of stages) {
        const primitives = stage.sdfPrimitives();
        
        for (const primitive of primitives) {
          expect(primitive.type).toBeTruthy();
          expect(primitive.position).toHaveLength(3);
          expect(primitive.rotation).toHaveLength(3);
          expect(primitive.scale).toHaveLength(3);
          expect(primitive.materialId).toBeTruthy();
          expect(primitive.parameters).toBeTruthy();
          
          for (const pos of primitive.position) {
            expect(typeof pos).toBe('number');
            expect(isFinite(pos)).toBe(true);
          }
          
          for (const rot of primitive.rotation) {
            expect(typeof rot).toBe('number');
            expect(isFinite(rot)).toBe(true);
          }
          
          for (const s of primitive.scale) {
            expect(typeof s).toBe('number');
            expect(isFinite(s)).toBe(true);
            expect(s).toBeGreaterThan(0);
          }
        }
      }
    });
  });
});
