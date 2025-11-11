/**
 * STRUCTURE SYNTHESIS
 * 
 * Generate tools and structures from available materials.
 * Governors decide WHAT to build, this synthesizes HOW it looks.
 */

import * as THREE from 'three';

export interface MaterialAvailability {
    wood: number;       // 0-1
    stone: number;      // 0-1
    bone: number;       // 0-1
    fiber: number;      // 0-1 (plant fibers)
    clay: number;       // 0-1
}

export type ToolType = 'digging_stick' | 'gathering_pole' | 'wading_spear' | 'striking_stone';
export type StructureType = 'burrow' | 'platform' | 'stiltwork' | 'windbreak';

export class StructureSynthesis {
    /**
     * Generate tool mesh from available materials
     */
    generateTool(type: ToolType, materials: MaterialAvailability): THREE.Group {
        const tool = (() => {
            switch (type) {
                case 'digging_stick':
                    return this.synthesizeDiggingStick(materials);
                case 'gathering_pole':
                    return this.synthesizeGatheringPole(materials);
                case 'wading_spear':
                    return this.synthesizeWadingSpear(materials);
                case 'striking_stone':
                    return this.synthesizeStrikingStone(materials);
            }
        })();
        
        // Add material-based finishing touches
        tool.name = `tool-${type}`;
        return tool;
    }

    /**
     * Generate structure mesh
     */
    generateStructure(type: StructureType, materials: MaterialAvailability, scale: number): THREE.Group {
        const structure = (() => {
            switch (type) {
                case 'burrow':
                    return this.synthesizeBurrow(materials, scale);
                case 'platform':
                    return this.synthesizePlatform(materials, scale);
                case 'stiltwork':
                    return this.synthesizeStiltwork(materials, scale);
                case 'windbreak':
                    return this.synthesizeWindbreak(materials, scale);
            }
        })();
        
        // Add material-based finishing touches
        structure.name = `structure-${type}`;
        return structure;
    }

    /**
     * DIGGING STICK: Wood shaft + stone/bone point
     */
    private synthesizeDiggingStick(mat: MaterialAvailability): THREE.Group {
        const group = new THREE.Group();

        // Shaft (wood preferred, bone fallback)
        const shaftMaterial = mat.wood > 0.3 ? 'wood' : 'bone';
        const shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.04, 1.5, 8),
            this.getMaterial(shaftMaterial, mat)
        );
        group.add(shaft);

        // Point (stone preferred)
        if (mat.stone > 0.2) {
            const point = new THREE.Mesh(
                new THREE.ConeGeometry(0.05, 0.15, 6),
                this.getMaterial('stone', mat)
            );
            point.position.y = 0.75 + 0.075;
            group.add(point);
        }

        return group;
    }

    /**
     * GATHERING POLE: Long shaft with hook
     */
    private synthesizeGatheringPole(mat: MaterialAvailability): THREE.Group {
        const group = new THREE.Group();

        // Long flexible shaft
        const shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.03, 2.5, 6),
            this.getMaterial('wood', mat)
        );
        group.add(shaft);

        // Hook (bone or wood)
        const hook = new THREE.Mesh(
            new THREE.TorusGeometry(0.08, 0.02, 6, 8, Math.PI),
            this.getMaterial('bone', mat)
        );
        hook.position.y = 1.25;
        hook.rotation.z = Math.PI / 4;
        group.add(hook);

        return group;
    }

    /**
     * WADING SPEAR: Long shaft with sharp point
     */
    private synthesizeWadingSpear(mat: MaterialAvailability): THREE.Group {
        const group = new THREE.Group();

        const shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.025, 0.03, 2.0, 6),
            this.getMaterial('wood', mat)
        );
        group.add(shaft);

        // Sharp stone or bone point
        const point = new THREE.Mesh(
            new THREE.ConeGeometry(0.04, 0.25, 6),
            this.getMaterial(mat.stone > 0.3 ? 'stone' : 'bone', mat)
        );
        point.position.y = 1.0 + 0.125;
        group.add(point);

        return group;
    }

    /**
     * STRIKING STONE: Handheld rock
     */
    private synthesizeStrikingStone(mat: MaterialAvailability): THREE.Group {
        const group = new THREE.Group();

        // Irregular stone shape
        const stone = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.08, 0),
            this.getMaterial('stone', mat)
        );
        group.add(stone);

        return group;
    }

    /**
     * BURROW: Underground chamber
     */
    private synthesizeBurrow(mat: MaterialAvailability, scale: number): THREE.Group {
        const group = new THREE.Group();

        // Earthen mound entrance
        const entrance = new THREE.Mesh(
            new THREE.ConeGeometry(scale * 0.5, scale * 0.3, 8),
            this.getMaterial('clay', mat)
        );
        entrance.position.y = -scale * 0.15;
        group.add(entrance);

        // Entrance hole
        const hole = new THREE.Mesh(
            new THREE.CylinderGeometry(scale * 0.3, scale * 0.3, scale * 0.4, 8),
            new THREE.MeshStandardMaterial({ color: 0x000000 })
        );
        hole.position.y = -scale * 0.1;
        group.add(hole);

        return group;
    }

    /**
     * PLATFORM: Tree platform
     */
    private synthesizePlatform(mat: MaterialAvailability, scale: number): THREE.Group {
        const group = new THREE.Group();

        // Wooden platform
        const platform = new THREE.Mesh(
            new THREE.BoxGeometry(scale, scale * 0.1, scale),
            this.getMaterial('wood', mat)
        );
        platform.position.y = scale * 2; // Up in tree
        group.add(platform);

        // Support branches
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const support = new THREE.Mesh(
                new THREE.CylinderGeometry(scale * 0.05, scale * 0.08, scale * 2, 6),
                this.getMaterial('wood', mat)
            );
            support.position.set(
                Math.cos(angle) * scale * 0.4,
                scale,
                Math.sin(angle) * scale * 0.4
            );
            group.add(support);
        }

        return group;
    }

    /**
     * STILTWORK: Water platform on stilts
     */
    private synthesizeStiltwork(mat: MaterialAvailability, scale: number): THREE.Group {
        const group = new THREE.Group();

        // Platform above water
        const platform = new THREE.Mesh(
            new THREE.BoxGeometry(scale * 1.5, scale * 0.1, scale * 1.5),
            this.getMaterial('wood', mat)
        );
        platform.position.y = scale;
        group.add(platform);

        // Stilts (4 corners)
        for (let x = -1; x <= 1; x += 2) {
            for (let z = -1; z <= 1; z += 2) {
                const stilt = new THREE.Mesh(
                    new THREE.CylinderGeometry(scale * 0.06, scale * 0.06, scale, 6),
                    this.getMaterial('wood', mat)
                );
                stilt.position.set(x * scale * 0.6, scale * 0.5, z * scale * 0.6);
                group.add(stilt);
            }
        }

        return group;
    }

    /**
     * WINDBREAK: Simple shelter
     */
    private synthesizeWindbreak(mat: MaterialAvailability, scale: number): THREE.Group {
        const group = new THREE.Group();

        // Wall (branches/fiber)
        const wall = new THREE.Mesh(
            new THREE.BoxGeometry(scale * 2, scale, scale * 0.2),
            this.getMaterial(mat.fiber > 0.3 ? 'fiber' : 'wood', mat)
        );
        group.add(wall);

        // Support poles
        for (let i = -1; i <= 1; i++) {
            const pole = new THREE.Mesh(
                new THREE.CylinderGeometry(scale * 0.04, scale * 0.04, scale, 6),
                this.getMaterial('wood', mat)
            );
            pole.position.set(i * scale * 0.8, scale * 0.5, -scale * 0.1);
            group.add(pole);
        }

        return group;
    }

    /**
     * Get material appearance from type and availability
     */
    private getMaterial(type: string, availability: MaterialAvailability): THREE.MeshStandardMaterial {
        let color: number;
        let roughness: number;
        let metalness: number;

        switch (type) {
            case 'wood':
                color = availability.wood > 0.5 ? 0x8B4513 : 0x654321; // Rich vs poor quality
                roughness = 0.9;
                metalness = 0;
                break;
            case 'stone':
                color = availability.stone > 0.5 ? 0x808080 : 0x555555;
                roughness = 0.8;
                metalness = 0.1;
                break;
            case 'bone':
                color = 0xE8D7C3;
                roughness = 0.6;
                metalness = 0.2;
                break;
            case 'fiber':
                color = 0xC19A6B;
                roughness = 0.95;
                metalness = 0;
                break;
            case 'clay':
                color = 0xB87333;
                roughness = 0.85;
                metalness = 0;
                break;
            default:
                color = 0x888888;
                roughness = 0.7;
                metalness = 0;
        }

        return new THREE.MeshStandardMaterial({ color, roughness, metalness });
    }
}

