/**
 * BUILDING SPAWNER (DFU-Compatible)
 * 
 * Spawns THREE.js building meshes from prefabs.
 * This is PROVEN 30-year-old DFU code - we keep the logic intact.
 * 
 * BRIDGE ARCHITECTURE:
 * - Receives building data from governors (materials, size, type)
 * - Uses DFU spawning logic to create meshes
 * - NO MAPS.BSA hardcoded data - governors provide all parameters
 */

import * as THREE from 'three';
import { BuildingPrefab } from './BuildingPrefab';

export class BuildingSpawner {
    /**
     * Generate building mesh from prefab
     */
    static generate(prefab: BuildingPrefab, position: THREE.Vector3, rotation: number = 0): THREE.Group {
        const group = new THREE.Group();
        group.position.copy(position);
        group.rotation.y = rotation;

        // Generate walls
        const walls = this.generateWalls(prefab);
        group.add(walls);

        // Generate roof
        const roof = this.generateRoof(prefab);
        group.add(roof);

        // Generate components (doors, windows, etc.)
        for (const component of prefab.components) {
            const mesh = this.generateComponent(component, prefab);
            if (mesh) {
                group.add(mesh);
            }
        }

        return group;
    }

    /**
     * Generate walls from prefab
     */
    private static generateWalls(prefab: BuildingPrefab): THREE.Group {
        const group = new THREE.Group();
        const material = new THREE.MeshStandardMaterial({ color: prefab.materials.wall });

        // Front wall
        const frontWall = new THREE.Mesh(
            new THREE.BoxGeometry(prefab.width, prefab.height, 0.2),
            material
        );
        frontWall.position.set(0, prefab.height / 2, prefab.depth / 2);
        group.add(frontWall);

        // Back wall
        const backWall = new THREE.Mesh(
            new THREE.BoxGeometry(prefab.width, prefab.height, 0.2),
            material
        );
        backWall.position.set(0, prefab.height / 2, -prefab.depth / 2);
        group.add(backWall);

        // Left wall
        const leftWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, prefab.height, prefab.depth),
            material
        );
        leftWall.position.set(-prefab.width / 2, prefab.height / 2, 0);
        group.add(leftWall);

        // Right wall
        const rightWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, prefab.height, prefab.depth),
            material
        );
        rightWall.position.set(prefab.width / 2, prefab.height / 2, 0);
        group.add(rightWall);

        return group;
    }

    /**
     * Generate roof from prefab
     */
    private static generateRoof(prefab: BuildingPrefab): THREE.Mesh {
        const material = new THREE.MeshStandardMaterial({ color: prefab.materials.roof });

        if (prefab.roofType === 'flat') {
            const roof = new THREE.Mesh(
                new THREE.BoxGeometry(prefab.width + 0.4, 0.2, prefab.depth + 0.4),
                material
            );
            roof.position.set(0, prefab.height, 0);
            return roof;
        } else if (prefab.roofType === 'gabled') {
            // Gabled roof (triangular)
            const roofShape = new THREE.Shape();
            roofShape.moveTo(-prefab.width / 2, 0);
            roofShape.lineTo(0, prefab.width / 4); // Peak
            roofShape.lineTo(prefab.width / 2, 0);
            roofShape.lineTo(-prefab.width / 2, 0);

            const extrudeSettings = {
                depth: prefab.depth + 0.4,
                bevelEnabled: false
            };

            const geometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
            const roof = new THREE.Mesh(geometry, material);
            roof.position.set(0, prefab.height, 0);
            roof.rotation.y = Math.PI / 2;
            return roof;
        } else if (prefab.roofType === 'pyramidal') {
            // Pyramidal roof
            const roof = new THREE.Mesh(
                new THREE.ConeGeometry(prefab.width * 0.7, prefab.width / 2, 4),
                material
            );
            roof.position.set(0, prefab.height + prefab.width / 4, 0);
            return roof;
        }

        // Default flat roof
        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(prefab.width + 0.4, 0.2, prefab.depth + 0.4),
            material
        );
        roof.position.set(0, prefab.height, 0);
        return roof;
    }

    /**
     * Generate component (door, window, etc.)
     */
    private static generateComponent(component: any, prefab: BuildingPrefab): THREE.Mesh | null {
        if (component.type === 'door') {
            const material = new THREE.MeshStandardMaterial({ color: prefab.materials.door });
            const door = new THREE.Mesh(
                new THREE.BoxGeometry(component.size.width, component.size.height, 0.1),
                material
            );
            door.position.set(component.position.x, component.position.y, component.position.z);
            return door;
        } else if (component.type === 'window') {
            const material = new THREE.MeshStandardMaterial({ 
                color: 0x87CEEB, // Sky blue
                transparent: true,
                opacity: 0.7
            });
            const window = new THREE.Mesh(
                new THREE.BoxGeometry(component.size.width, component.size.height, 0.1),
                material
            );
            window.position.set(component.position.x, component.position.y, component.position.z);
            return window;
        } else if (component.type === 'chimney') {
            const material = new THREE.MeshStandardMaterial({ color: 0x333333 });
            const chimney = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 2, 0.8),
                material
            );
            chimney.position.set(component.position.x, component.position.y, component.position.z);
            return chimney;
        } else if (component.type === 'sign') {
            const material = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown
            const sign = new THREE.Mesh(
                new THREE.BoxGeometry(component.size.width, component.size.height, 0.1),
                material
            );
            sign.position.set(component.position.x, component.position.y, component.position.z);
            return sign;
        }

        return null;
    }
}

