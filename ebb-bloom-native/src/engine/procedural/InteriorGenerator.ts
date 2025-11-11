/**
 * INTERIOR GENERATOR
 * 
 * Generates building interiors with rooms, furniture, doors.
 * Replaces DFU's RDB interior blocks with synthesis.
 * 
 * DFU uses: Fixed RDB blocks from dungeon/interior data
 * We use: Social governors + materials → interior layouts
 */

import * as THREE from 'three';
import { BuildingLayout, Room } from './BuildingArchitect';

export interface InteriorLayout {
    rooms: InteriorRoom[];
    connections: Connection[];
    furniture: FurnitureItem[];
}

export interface InteriorRoom extends Room {
    id: string;
    floor: THREE.Mesh;
    walls: THREE.Mesh[];
    ceiling: THREE.Mesh;
}

export interface Connection {
    fromRoom: string;
    toRoom: string;
    doorPosition: THREE.Vector3;
    doorType: 'standard' | 'archway' | 'hidden';
}

export interface FurnitureItem {
    type: 'bed' | 'table' | 'chair' | 'shelf' | 'chest';
    position: THREE.Vector3;
    rotation: number;
    mesh: THREE.Group;
}

export class InteriorGenerator {
    /**
     * Generate interior from building layout
     */
    generateInterior(buildingLayout: BuildingLayout, buildingType: string): THREE.Group {
        const interior = new THREE.Group();
        
        // Generate each room
        for (const room of buildingLayout.rooms) {
            const roomMesh = this.generateRoom(room);
            interior.add(roomMesh);
            
            // Add furniture based on room type
            const furniture = this.generateFurniture(room, buildingType);
            for (const item of furniture) {
                interior.add(item.mesh);
            }
        }
        
        return interior;
    }
    
    /**
     * Generate single room mesh
     */
    private generateRoom(room: Room): THREE.Group {
        const roomGroup = new THREE.Group();
        
        // Floor
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(room.size.x, room.size.z),
            new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.9 })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.copy(room.position);
        roomGroup.add(floor);
        
        // Walls (4 sides)
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xD2B48C, roughness: 0.85 });
        
        // Front/back
        const wallFront = new THREE.Mesh(
            new THREE.PlaneGeometry(room.size.x, room.size.y),
            wallMaterial
        );
        wallFront.position.set(room.position.x, room.position.y + room.size.y/2, room.position.z - room.size.z/2);
        roomGroup.add(wallFront);
        
        const wallBack = wallFront.clone();
        wallBack.position.z = room.position.z + room.size.z/2;
        wallBack.rotation.y = Math.PI;
        roomGroup.add(wallBack);
        
        // Sides
        const wallLeft = new THREE.Mesh(
            new THREE.PlaneGeometry(room.size.z, room.size.y),
            wallMaterial
        );
        wallLeft.position.set(room.position.x - room.size.x/2, room.position.y + room.size.y/2, room.position.z);
        wallLeft.rotation.y = Math.PI / 2;
        roomGroup.add(wallLeft);
        
        const wallRight = wallLeft.clone();
        wallRight.position.x = room.position.x + room.size.x/2;
        wallRight.rotation.y = -Math.PI / 2;
        roomGroup.add(wallRight);
        
        // Ceiling
        const ceiling = new THREE.Mesh(
            new THREE.PlaneGeometry(room.size.x, room.size.z),
            new THREE.MeshStandardMaterial({ color: 0xA0826D, roughness: 0.8 })
        );
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.set(room.position.x, room.position.y + room.size.y, room.position.z);
        roomGroup.add(ceiling);
        
        return roomGroup;
    }
    
    /**
     * Generate furniture for room
     */
    private generateFurniture(room: Room, buildingType: string): FurnitureItem[] {
        const furniture: FurnitureItem[] = [];
        
        // Furniture based on room type AND building type
        if (room.type === 'living') {
            // Houses: Bed + chest
            if (buildingType === 'house' || buildingType === 'tavern') {
                furniture.push({
                    type: 'bed',
                    position: new THREE.Vector3(
                        room.position.x + room.size.x * 0.3,
                        room.position.y,
                        room.position.z + room.size.z * 0.3
                    ),
                    rotation: 0,
                    mesh: this.createBed()
                });
                
                furniture.push({
                    type: 'chest',
                    position: new THREE.Vector3(
                        room.position.x - room.size.x * 0.3,
                        room.position.y,
                        room.position.z
                    ),
                    rotation: 0,
                    mesh: this.createChest()
                });
            }
            // Shops: Display cases + counter
            else if (buildingType === 'shop') {
                furniture.push({
                    type: 'table',
                    position: new THREE.Vector3(room.position.x, room.position.y, room.position.z),
                    rotation: 0,
                    mesh: this.createTable()
                });
            }
            // Temples: Altar + benches
            else if (buildingType === 'temple') {
                furniture.push({
                    type: 'table',
                    position: new THREE.Vector3(room.position.x, room.position.y, room.position.z),
                    rotation: 0,
                    mesh: this.createTable() // Altar
                });
            }
        } else if (room.type === 'work') {
            // Work rooms: Table + tools
            furniture.push({
                type: 'table',
                position: new THREE.Vector3(room.position.x, room.position.y, room.position.z),
                rotation: 0,
                mesh: this.createTable()
            });
        }
        
        return furniture;
    }
    
    // Simple furniture synthesis
    private createBed(): THREE.Group {
        const bed = new THREE.Group();
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.5, 1.5),
            new THREE.MeshStandardMaterial({ color: 0x8B4513 })
        );
        frame.position.y = 0.25;
        bed.add(frame);
        return bed;
    }
    
    private createTable(): THREE.Group {
        const table = new THREE.Group();
        const top = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.1, 1),
            new THREE.MeshStandardMaterial({ color: 0x8B4513 })
        );
        top.position.y = 0.75;
        table.add(top);
        
        // 4 legs
        for (let x = -1; x <= 1; x += 2) {
            for (let z = -1; z <= 1; z += 2) {
                const leg = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.05, 0.05, 0.7, 6),
                    new THREE.MeshStandardMaterial({ color: 0x654321 })
                );
                leg.position.set(x * 0.6, 0.35, z * 0.4);
                table.add(leg);
            }
        }
        
        return table;
    }
    
    private createChest(): THREE.Group {
        const chest = new THREE.Group();
        const box = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.6, 0.5),
            new THREE.MeshStandardMaterial({ color: 0x654321 })
        );
        box.position.y = 0.3;
        chest.add(box);
        return chest;
    }
}

