/**
 * CREATURE MESH GENERATOR
 * 
 * Generates THREE.js meshes for creatures based on governor-driven traits.
 * Simple composites: spheres, cylinders, boxes.
 */

import * as THREE from 'three';
import { BIOLOGICAL_CONSTANTS } from '../tables/biological-constants';

export interface CreatureTraits {
    mass: number;           // kg
    locomotion: 'cursorial' | 'arboreal' | 'burrowing' | 'littoral';
    diet: 'herbivore' | 'carnivore' | 'omnivore';
    socialBehavior: 'solitary' | 'pack';
}

export class CreatureMeshGenerator {
    /**
     * Generate creature mesh from traits (decided by governors)
     */
    generate(traits: CreatureTraits): THREE.Group {
        const group = new THREE.Group();

        // Body size from mass (cube root scaling)
        const bodyLength = Math.cbrt(traits.mass / 50);
        const bodyRadius = bodyLength * 0.3;

        // Body (main sphere)
        const bodyGeometry = new THREE.SphereGeometry(bodyRadius, 8, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: this.getColorForDiet(traits.diet),
            roughness: 0.8,
            metalness: 0.2
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        group.add(body);

        // Head (smaller sphere in front)
        const headRadius = bodyRadius * 0.6;
        const headGeometry = new THREE.SphereGeometry(headRadius, 6, 6);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(bodyRadius + headRadius * 0.5, 0, 0);
        group.add(head);

        // Limbs based on locomotion
        const limbCount = this.getLimbCount(traits.locomotion);
        const limbLength = bodyLength * 0.8;
        const limbRadius = bodyRadius * 0.15;

        for (let i = 0; i < limbCount; i++) {
            const angle = (i / limbCount) * Math.PI * 2;
            const limb = new THREE.Mesh(
                new THREE.CylinderGeometry(limbRadius, limbRadius * 0.5, limbLength, 4),
                bodyMaterial
            );
            limb.position.set(
                Math.cos(angle) * bodyRadius * 0.7,
                -limbLength / 2,
                Math.sin(angle) * bodyRadius * 0.7
            );
            group.add(limb);
        }

        return group;
    }

    private getColorForDiet(diet: string): number {
        switch (diet) {
            case 'herbivore': return 0x88cc88; // Green
            case 'carnivore': return 0xcc8888; // Red
            case 'omnivore': return 0xccaa88; // Brown
            default: return 0xaaaaaa;
        }
    }

    private getLimbCount(locomotion: string): number {
        switch (locomotion) {
            case 'cursorial': return 4; // Quadruped
            case 'arboreal': return 4;  // Quadruped climber
            case 'burrowing': return 4; // Digger
            case 'littoral': return 2;  // Wader
            default: return 4;
        }
    }
}
