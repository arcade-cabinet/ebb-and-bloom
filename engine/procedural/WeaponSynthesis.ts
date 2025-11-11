/**
 * WEAPON SYNTHESIS
 * 
 * Generates weapons from materials + tool knowledge.
 * Extends ToolSystem to include combat weapons.
 * 
 * DFU uses: Fixed weapon models
 * We use: Material composition + CognitiveSystem → weapon forms
 */

import * as THREE from 'three';

export type WeaponType = 'club' | 'spear' | 'axe' | 'sword' | 'bow';

export interface WeaponMaterials {
    shaft: 'wood' | 'bone';
    head: 'stone' | 'bone' | 'metal';
    binding: 'fiber' | 'leather';
    quality: number; // 0-1
}

export interface WeaponStats {
    damage: number;
    durability: number;
    range: number;
    weight: number;
}

export class WeaponSynthesis {
    /**
     * Generate weapon mesh + stats from materials
     */
    generateWeapon(type: WeaponType, materials: WeaponMaterials): {
        mesh: THREE.Group;
        stats: WeaponStats;
    } {
        let mesh: THREE.Group;
        let stats: WeaponStats;
        
        switch (type) {
            case 'club':
                mesh = this.synthesizeClub(materials);
                stats = this.calculateStats('club', materials);
                break;
            case 'spear':
                mesh = this.synthesizeSpear(materials);
                stats = this.calculateStats('spear', materials);
                break;
            case 'axe':
                mesh = this.synthesizeAxe(materials);
                stats = this.calculateStats('axe', materials);
                break;
            case 'sword':
                mesh = this.synthesizeSword(materials);
                stats = this.calculateStats('sword', materials);
                break;
            case 'bow':
                mesh = this.synthesizeBow(materials);
                stats = this.calculateStats('bow', materials);
                break;
        }
        
        return { mesh, stats };
    }
    
    /**
     * Calculate weapon stats from materials
     */
    private calculateStats(type: WeaponType, materials: WeaponMaterials): WeaponStats {
        // Material properties
        const headDamage = materials.head === 'metal' ? 1.5 :
                          materials.head === 'stone' ? 1.0 : 0.7;
        const durabilityMult = materials.quality * 2;
        
        // Base stats by weapon type
        const baseStats: Record<WeaponType, WeaponStats> = {
            club: { damage: 5, durability: 50, range: 1.5, weight: 2 },
            spear: { damage: 8, durability: 40, range: 2.5, weight: 1.5 },
            axe: { damage: 12, durability: 60, range: 1.8, weight: 3 },
            sword: { damage: 10, durability: 70, range: 2, weight: 2.5 },
            bow: { damage: 6, durability: 30, range: 20, weight: 1 }
        };
        
        const base = baseStats[type];
        
        return {
            damage: base.damage * headDamage,
            durability: base.durability * durabilityMult,
            range: base.range,
            weight: base.weight
        };
    }
    
    private synthesizeClub(materials: WeaponMaterials): THREE.Group {
        const club = new THREE.Group();
        
        // Handle
        const handle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.05, 0.6, 8),
            new THREE.MeshStandardMaterial({ color: materials.shaft === 'wood' ? 0x8B4513 : 0xE8D7C3 })
        );
        club.add(handle);
        
        // Head
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 8, 8),
            new THREE.MeshStandardMaterial({ 
                color: materials.head === 'metal' ? 0x808080 : 
                       materials.head === 'stone' ? 0x606060 : 0xD7D7D7,
                roughness: materials.head === 'metal' ? 0.4 : 0.8,
                metalness: materials.head === 'metal' ? 0.8 : 0
            })
        );
        head.position.y = 0.45;
        club.add(head);
        
        return club;
    }
    
    private synthesizeSpear(materials: WeaponMaterials): THREE.Group {
        const spear = new THREE.Group();
        
        const shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.025, 0.03, 1.8, 8),
            new THREE.MeshStandardMaterial({ color: 0x8B4513 })
        );
        spear.add(shaft);
        
        const head = new THREE.Mesh(
            new THREE.ConeGeometry(0.05, 0.3, 6),
            new THREE.MeshStandardMaterial({ 
                color: materials.head === 'metal' ? 0x808080 : 0x606060,
                metalness: materials.head === 'metal' ? 0.8 : 0
            })
        );
        head.position.y = 1.05;
        spear.add(head);
        
        return spear;
    }
    
    private synthesizeAxe(materials: WeaponMaterials): THREE.Group {
        const axe = new THREE.Group();
        
        const handle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.05, 0.8, 8),
            new THREE.MeshStandardMaterial({ color: 0x8B4513 })
        );
        axe.add(handle);
        
        const head = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.15, 0.05),
            new THREE.MeshStandardMaterial({ 
                color: materials.head === 'metal' ? 0x808080 : 0x606060,
                metalness: materials.head === 'metal' ? 0.8 : 0
            })
        );
        head.position.set(0.15, 0.5, 0);
        axe.add(head);
        
        return axe;
    }
    
    private synthesizeSword(materials: WeaponMaterials): THREE.Group {
        const sword = new THREE.Group();
        
        // Blade material based on available materials
        let bladeColor = 0x909090; // Default metal
        let bladeMetalness = 0.9;
        let bladeRoughness = 0.3;
        
        if (materials.head === 'metal') {
            bladeColor = 0x909090; // Metal - gray
            bladeMetalness = 0.9;
            bladeRoughness = 0.3;
        } else if (materials.head === 'bone') {
            bladeColor = 0xD3D3D3; // Bone - white
            bladeMetalness = 0.1;
            bladeRoughness = 0.8;
        } else if (materials.head === 'stone') {
            bladeColor = 0x696969; // Stone - dark gray
            bladeMetalness = 0.1;
            bladeRoughness = 0.9;
        }
        
        // Blade
        const blade = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 1, 0.02),
            new THREE.MeshStandardMaterial({ 
                color: bladeColor,
                metalness: bladeMetalness,
                roughness: bladeRoughness
            })
        );
        blade.position.y = 0.6;
        sword.add(blade);
        
        // Guard (wood or bone based on shaft)
        const guardMaterial = materials.shaft === 'wood' ? 0x8B4513 : 0xD3D3D3; // Wood brown or bone white
        const guard = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.03, 0.05),
            new THREE.MeshStandardMaterial({ color: guardMaterial })
        );
        guard.position.y = 0.1;
        sword.add(guard);
        
        // Handle (wood or bone based on shaft)
        const handleMaterial = materials.shaft === 'wood' ? 0x654321 : 0xD3D3D3; // Wood brown or bone white
        const handle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8),
            new THREE.MeshStandardMaterial({ color: handleMaterial })
        );
        handle.position.y = -0.1;
        sword.add(handle);
        
        return sword;
    }
    
    private synthesizeBow(materials: WeaponMaterials): THREE.Group {
        const bow = new THREE.Group();
        
        // Bow material based on shaft type
        const bowColor = materials.shaft === 'wood' ? 0x8B4513 : 0xD3D3D3; // Wood brown or bone white
        
        // Bow curve (torus segment)
        const curve = new THREE.Mesh(
            new THREE.TorusGeometry(0.6, 0.02, 6, 12, Math.PI),
            new THREE.MeshStandardMaterial({ color: bowColor })
        );
        curve.rotation.z = Math.PI / 2;
        bow.add(curve);
        
        // String
        const string = new THREE.Mesh(
            new THREE.CylinderGeometry(0.005, 0.005, 1.1, 4),
            new THREE.MeshStandardMaterial({ color: 0xDDDDDD })
        );
        bow.add(string);
        
        return bow;
    }
}

