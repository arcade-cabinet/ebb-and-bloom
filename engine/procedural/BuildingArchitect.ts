/**
 * BUILDING ARCHITECT
 * 
 * Synthesizes complete buildings from materials + social governors.
 * Replaces DFU's RMB block prefabs with governor-driven architecture.
 * 
 * DFU uses: Fixed RMB blocks from BLOCKS.BSA
 * We use: Social governors → building complexity → synthesized structures
 */

import * as THREE from 'three';
import { SOCIAL_CONSTANTS } from '../tables/social-constants';

export interface BuildingSpec {
    type: 'house' | 'shop' | 'temple' | 'tavern' | 'workshop' | 'warehouse';
    population: number;      // Drives complexity
    governanceType: 'band' | 'tribe' | 'chiefdom' | 'state';
    materials: MaterialSet;
    scale: number;
}

export interface MaterialSet {
    primary: 'wood' | 'stone' | 'clay' | 'thatch';
    secondary: 'wood' | 'stone' | 'clay';
    roofing: 'thatch' | 'tile' | 'slate';
    availability: number; // 0-1, affects quality
}

export interface BuildingLayout {
    footprint: THREE.Vector2;  // Width x depth
    height: number;
    rooms: Room[];
    doors: Door[];
    windows: Window[];
}

export interface Room {
    position: THREE.Vector3;
    size: THREE.Vector3;
    type: 'living' | 'storage' | 'work' | 'public';
}

export interface Door {
    position: THREE.Vector3;
    direction: 'north' | 'south' | 'east' | 'west';
}

export interface Window {
    position: THREE.Vector3;
    direction: 'north' | 'south' | 'east' | 'west';
}

export class BuildingArchitect {
    /**
     * Generate complete building from governors + materials
     */
    generateBuilding(spec: BuildingSpec): { mesh: THREE.Group; layout: BuildingLayout } {
        // Complexity from governance type (social governors)
        const complexity = this.getComplexity(spec.governanceType);
        
        // Generate layout based on type and complexity
        const layout = this.generateLayout(spec, complexity);
        
        // Synthesize mesh from layout + materials
        const mesh = this.synthesizeMesh(layout, spec.materials);
        
        return { mesh, layout };
    }
    
    /**
     * Social governors determine building complexity
     */
    private getComplexity(governanceType: string): number {
        switch (governanceType) {
            case 'band': return 1;      // Simple shelters
            case 'tribe': return 2;     // Basic structures
            case 'chiefdom': return 3;  // Elaborate buildings
            case 'state': return 4;     // Complex architecture
            default: return 1;
        }
    }
    
    /**
     * Generate building layout
     */
    private generateLayout(spec: BuildingSpec, complexity: number): BuildingLayout {
        const rooms: Room[] = [];
        const doors: Door[] = [];
        const windows: Window[] = [];
        
        // Base dimensions from building type
        let width = 6;
        let depth = 6;
        let height = 3;
        
        switch (spec.type) {
            case 'house':
                width = 4 + complexity;
                depth = 4 + complexity;
                height = 2.5;
                break;
            case 'shop':
                width = 6 + complexity * 2;
                depth = 4 + complexity;
                height = 3;
                break;
            case 'temple':
                width = 8 + complexity * 3;
                depth = 8 + complexity * 3;
                height = 4 + complexity;
                break;
            case 'tavern':
                width = 8 + complexity * 2;
                depth = 6 + complexity;
                height = 3 + complexity * 0.5;
                break;
            case 'workshop':
                width = 5 + complexity;
                depth = 5 + complexity;
                height = 3;
                break;
            case 'warehouse':
                width = 10 + complexity * 2;
                depth = 8 + complexity * 2;
                height = 4;
                break;
        }
        
        // Generate rooms based on complexity
        const roomCount = Math.min(1 + complexity, 6);
        
        if (roomCount === 1) {
            // Single room (band-level)
            rooms.push({
                position: new THREE.Vector3(0, 0, 0),
                size: new THREE.Vector3(width, height, depth),
                type: 'living'
            });
        } else {
            // Multi-room (tribe+)
            // Main room
            rooms.push({
                position: new THREE.Vector3(0, 0, 0),
                size: new THREE.Vector3(width * 0.6, height, depth * 0.6),
                type: spec.type === 'shop' ? 'public' : 'living'
            });
            
            // Additional rooms
            for (let i = 1; i < roomCount; i++) {
                const roomSize = width / roomCount;
                rooms.push({
                    position: new THREE.Vector3(i * roomSize - width/2, 0, depth/2),
                    size: new THREE.Vector3(roomSize, height, depth * 0.4),
                    type: i === 1 ? 'work' : 'storage'
                });
            }
        }
        
        // Doors (at least one)
        doors.push({
            position: new THREE.Vector3(0, height/2, -depth/2),
            direction: 'south'
        });
        
        // Windows (complexity determines count)
        const windowCount = complexity * 2;
        for (let i = 0; i < windowCount; i++) {
            const side = i % 4;
            let pos: THREE.Vector3;
            let dir: 'north' | 'south' | 'east' | 'west';
            
            switch (side) {
                case 0: // East
                    pos = new THREE.Vector3(width/2, height * 0.6, (i/4 - 0.5) * depth);
                    dir = 'east';
                    break;
                case 1: // West
                    pos = new THREE.Vector3(-width/2, height * 0.6, (i/4 - 0.5) * depth);
                    dir = 'west';
                    break;
                case 2: // North
                    pos = new THREE.Vector3((i/4 - 0.5) * width, height * 0.6, depth/2);
                    dir = 'north';
                    break;
                case 3: // South  
                    pos = new THREE.Vector3((i/4 - 0.5) * width, height * 0.6, -depth/2);
                    dir = 'south';
                    break;
            }
            
            windows.push({ position: pos!, direction: dir! });
        }
        
        return {
            footprint: new THREE.Vector2(width, depth),
            height,
            rooms,
            doors,
            windows
        };
    }
    
    /**
     * Synthesize mesh from layout + materials
     */
    private synthesizeMesh(layout: BuildingLayout, materials: MaterialSet): THREE.Group {
        const building = new THREE.Group();
        
        // Walls
        const wallMaterial = this.getMaterial(materials.primary, materials.availability);
        const wallThickness = 0.3;
        
        // Four walls
        const width = layout.footprint.x;
        const depth = layout.footprint.y;
        const height = layout.height;
        
        // Front/back walls
        const frontWall = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, wallThickness),
            wallMaterial
        );
        frontWall.position.set(0, height/2, -depth/2);
        building.add(frontWall);
        
        const backWall = frontWall.clone();
        backWall.position.set(0, height/2, depth/2);
        building.add(backWall);
        
        // Side walls
        const sideWall = new THREE.Mesh(
            new THREE.BoxGeometry(wallThickness, height, depth),
            wallMaterial
        );
        sideWall.position.set(-width/2, height/2, 0);
        building.add(sideWall);
        
        const otherSideWall = sideWall.clone();
        otherSideWall.position.set(width/2, height/2, 0);
        building.add(otherSideWall);
        
        // Floor
        const floorMaterial = this.getMaterial(materials.secondary, materials.availability);
        const floor = new THREE.Mesh(
            new THREE.BoxGeometry(width, 0.2, depth),
            floorMaterial
        );
        floor.position.y = 0.1;
        building.add(floor);
        
        // Roof
        const roofMaterial = this.getMaterial(materials.roofing === 'thatch' ? 'thatch' : 'stone', materials.availability);
        const roof = new THREE.Mesh(
            new THREE.ConeGeometry(width * 0.7, height * 0.4, 4),
            roofMaterial
        );
        roof.position.y = height + height * 0.2;
        roof.rotation.y = Math.PI / 4; // 45° for diamond shape
        building.add(roof);
        
        // Doors (cut holes and add frames)
        for (const door of layout.doors) {
            const doorFrame = new THREE.Mesh(
                new THREE.BoxGeometry(1, 2, 0.1),
                new THREE.MeshStandardMaterial({ color: 0x654321 })
            );
            doorFrame.position.copy(door.position);
            building.add(doorFrame);
        }
        
        // Windows
        for (const window of layout.windows) {
            const windowFrame = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 1, 0.05),
                new THREE.MeshStandardMaterial({ 
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.7
                })
            );
            windowFrame.position.copy(window.position);
            building.add(windowFrame);
        }
        
        return building;
    }
    
    private getMaterial(type: string, quality: number): THREE.MeshStandardMaterial {
        let color: number;
        let roughness: number;
        
        switch (type) {
            case 'wood':
                color = quality > 0.7 ? 0x8B4513 : 0x654321;
                roughness = 0.9;
                break;
            case 'stone':
                color = quality > 0.7 ? 0xA0A0A0 : 0x707070;
                roughness = 0.8;
                break;
            case 'clay':
                color = 0xB87333;
                roughness = 0.85;
                break;
            case 'thatch':
                color = 0xC19A6B;
                roughness = 0.95;
                break;
            default:
                color = 0x888888;
                roughness = 0.8;
        }
        
        return new THREE.MeshStandardMaterial({ color, roughness });
    }
}

