/**
 * SYNTHESIS TESTS
 * 
 * Tests for all synthesis systems.
 */

import { describe, it, expect } from 'vitest';
import {
    MolecularSynthesis,
    PigmentationSynthesis,
    StructureSynthesis,
    BuildingArchitect,
    InteriorGenerator,
    WeaponSynthesis
} from '../../engine';

describe('MolecularSynthesis', () => {
    const synthesis = new MolecularSynthesis();
    
    it('should generate vertebrate from high protein/calcium', () => {
        const mesh = synthesis.generateFromComposition(
            { protein: 0.6, calcium: 0.3, lipid: 0.1, chitin: 0, keratin: 0, water: 0, minerals: 0 },
            50,
            { segments: 3, symmetry: 'bilateral', appendages: 4, spine: true }
        );
        
        expect(mesh.children.length).toBeGreaterThan(0);
    });
    
    it('should generate arthropod from high chitin', () => {
        const mesh = synthesis.generateFromComposition(
            { protein: 0.2, calcium: 0.1, lipid: 0.1, chitin: 0.6, keratin: 0, water: 0, minerals: 0 },
            10,
            { segments: 8, symmetry: 'bilateral', appendages: 6, spine: false }
        );
        
        expect(mesh.children.length).toBeGreaterThan(0);
    });
});

describe('PigmentationSynthesis', () => {
    const pigments = new PigmentationSynthesis();
    
    it('should generate green color for herbivores in forest', () => {
        const color = pigments.generateColor(
            { plantMatter: 0.9, animalMatter: 0.1, minerals: 0.1 },
            { vegetation: 0.9, rockColor: 0.1, uvIntensity: 0.3, temperature: 290 },
            0.5
        );
        
        expect(color.g).toBeGreaterThan(color.r);
        expect(color.g).toBeGreaterThan(color.b);
    });
    
    it('should generate dark color for high UV environment', () => {
        const color = pigments.generateColor(
            { plantMatter: 0.5, animalMatter: 0.5, minerals: 0.1 },
            { vegetation: 0.1, rockColor: 0.5, uvIntensity: 1.0, temperature: 300 },
            0.5
        );
        
        const brightness = (color.r + color.g + color.b) / 3;
        expect(brightness).toBeLessThan(0.5); // Dark from melanin
    });
});

describe('BuildingArchitect', () => {
    const architect = new BuildingArchitect();
    
    it('should generate house with rooms', () => {
        const { mesh, layout } = architect.generateBuilding({
            type: 'house',
            population: 100,
            governanceType: 'tribe',
            materials: { primary: 'wood', secondary: 'stone', roofing: 'thatch', availability: 0.7 },
            scale: 1
        });
        
        expect(mesh).toBeDefined();
        expect(layout.rooms.length).toBeGreaterThan(0);
        expect(layout.doors.length).toBeGreaterThan(0);
    });
    
    it('should create more complex buildings for states', () => {
        const band = architect.generateBuilding({
            type: 'house',
            population: 30,
            governanceType: 'band',
            materials: { primary: 'wood', secondary: 'clay', roofing: 'thatch', availability: 0.5 },
            scale: 1
        });
        
        const state = architect.generateBuilding({
            type: 'house',
            population: 1000,
            governanceType: 'state',
            materials: { primary: 'stone', secondary: 'stone', roofing: 'tile', availability: 0.9 },
            scale: 1
        });
        
        expect(state.layout.windows.length).toBeGreaterThan(band.layout.windows.length);
    });
});

describe('WeaponSynthesis', () => {
    const weapons = new WeaponSynthesis();
    
    it('should generate weapon with stats', () => {
        const { mesh, stats } = weapons.generateWeapon('sword', {
            shaft: 'wood',
            head: 'metal',
            binding: 'leather',
            quality: 0.8
        });
        
        expect(mesh).toBeDefined();
        expect(stats.damage).toBeGreaterThan(0);
        expect(stats.durability).toBeGreaterThan(0);
    });
    
    it('should give better stats for metal weapons', () => {
        const stone = weapons.generateWeapon('sword', {
            shaft: 'wood',
            head: 'stone',
            binding: 'fiber',
            quality: 0.5
        });
        
        const metal = weapons.generateWeapon('sword', {
            shaft: 'wood',
            head: 'metal',
            binding: 'leather',
            quality: 0.9
        });
        
        expect(metal.stats.damage).toBeGreaterThan(stone.stats.damage);
        expect(metal.stats.durability).toBeGreaterThan(stone.stats.durability);
    });
});

