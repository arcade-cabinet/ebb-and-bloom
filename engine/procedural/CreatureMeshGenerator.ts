/**
 * CREATURE MESH GENERATOR
 * 
 * Synthesizes creature visuals from governors' decisions.
 * 
 * Pipeline:
 * 1. Governors decide traits (mass, diet, locomotion)
 * 2. MolecularSynthesis determines composition from traits
 * 3. Generate geometry from molecular structure
 * 4. PigmentationSynthesis determines coloring from diet/environment
 * 5. Apply patterns based on genetics
 * 
 * NO PREFABS. Everything composed from simple forms.
 */

import * as THREE from 'three';
import { MolecularSynthesis, MolecularComposition, BodyPlan } from './MolecularSynthesis';
import { PigmentationSynthesis, DietaryInput, Environment } from './PigmentationSynthesis';

export interface CreatureTraits {
    mass: number;           // kg (from MetabolismGovernor)
    locomotion: 'cursorial' | 'arboreal' | 'burrowing' | 'littoral';
    diet: 'herbivore' | 'carnivore' | 'omnivore';
    socialBehavior: 'solitary' | 'pack';
    age: number;            // years (from LifecycleStates)
    genetics: number;       // 0-1 (from GeneticsSystem)
}

export interface BiomeContext {
    vegetation: number;     // 0-1
    rockColor: number;      // 0-1
    uvIntensity: number;    // 0-1
    temperature: number;    // K
}

export class CreatureMeshGenerator {
    private molecularSynthesis: MolecularSynthesis;
    private pigmentationSynthesis: PigmentationSynthesis;

    constructor() {
        this.molecularSynthesis = new MolecularSynthesis();
        this.pigmentationSynthesis = new PigmentationSynthesis();
    }

    /**
     * Generate creature mesh from governor-decided traits
     */
    generate(traits: CreatureTraits, biome: BiomeContext): THREE.Group {
        // Step 1: Determine molecular composition from traits
        const composition = this.traitsToComposition(traits);

        // Step 2: Determine body plan from locomotion
        const bodyPlan = this.locomotionToBodyPlan(traits.locomotion);

        // Step 3: Generate geometry from molecules
        const geometry = this.molecularSynthesis.generateFromComposition(
            composition,
            traits.mass,
            bodyPlan
        );

        // Step 4: Determine coloring from diet and environment
        const dietaryInput: DietaryInput = {
            plantMatter: traits.diet === 'herbivore' ? 1.0 : traits.diet === 'omnivore' ? 0.5 : 0.1,
            animalMatter: traits.diet === 'carnivore' ? 1.0 : traits.diet === 'omnivore' ? 0.5 : 0.1,
            minerals: 0.1
        };

        const environment: Environment = {
            vegetation: biome.vegetation,
            rockColor: biome.rockColor,
            uvIntensity: biome.uvIntensity,
            temperature: biome.temperature
        };

        const color = this.pigmentationSynthesis.generateColor(
            dietaryInput,
            environment,
            traits.genetics
        );

        // Step 5: Apply coloring to all meshes
        geometry.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                (child.material as THREE.MeshStandardMaterial).color = color;

                // Add pattern if genetics support it
                if (traits.genetics > 0.4) {
                    const pattern = this.pigmentationSynthesis.generatePattern(
                        environment,
                        traits.genetics
                    );
                    (child.material as THREE.MeshStandardMaterial).map = pattern;
                }
            }
        });

        // Step 6: Age affects appearance
        if (traits.age > 0) {
            this.applyAgeEffects(geometry, traits.age, composition);
        }

        return geometry;
    }

    /**
     * Convert traits to molecular composition
     */
    private traitsToComposition(traits: CreatureTraits): MolecularComposition {
        // Carnivores: High protein (muscle)
        // Herbivores: Moderate protein, higher minerals (from plants)
        // Burrowers: Higher calcium (strong bones/claws)
        // Arboreal: Higher protein (climbing muscle)

        let protein = 0.45;
        let calcium = 0.15;
        let lipid = 0.15;

        if (traits.diet === 'carnivore') {
            protein += 0.15; // More muscle
            calcium += 0.05; // Stronger bones for predation
        } else if (traits.diet === 'herbivore') {
            lipid += 0.10; // Fat storage
            calcium -= 0.05; // Less dense bones
        }

        if (traits.locomotion === 'burrowing') {
            calcium += 0.15; // Strong claws
            protein += 0.05; // Digging muscles
        } else if (traits.locomotion === 'arboreal') {
            protein += 0.10; // Climbing muscles
            lipid -= 0.05; // Leaner
        }

        // Normalize
        const total = protein + calcium + lipid;
        protein /= total;
        calcium /= total;
        lipid /= total;

        return {
            protein,
            calcium,
            lipid,
            chitin: 0.0,    // Vertebrates
            keratin: 0.08,  // Hair/claws
            water: 1.0 - (protein + calcium + lipid + 0.08), // Remainder
            minerals: 0.02
        };
    }

    /**
     * Convert locomotion to body plan
     */
    private locomotionToBodyPlan(locomotion: string): BodyPlan {
        switch (locomotion) {
            case 'cursorial':
                return {
                    segments: 3,
                    symmetry: 'bilateral',
                    appendages: 4,
                    spine: true
                };
            case 'arboreal':
                return {
                    segments: 3,
                    symmetry: 'bilateral',
                    appendages: 4,
                    spine: true
                };
            case 'burrowing':
                return {
                    segments: 4,
                    symmetry: 'bilateral',
                    appendages: 4,
                    spine: true
                };
            case 'littoral':
                return {
                    segments: 2,
                    symmetry: 'bilateral',
                    appendages: 2,
                    spine: true
                };
            default:
                return {
                    segments: 3,
                    symmetry: 'bilateral',
                    appendages: 4,
                    spine: true
                };
        }
    }

    /**
     * Apply age effects to mesh
     */
    private applyAgeEffects(
        mesh: THREE.Group,
        age: number,
        composition: MolecularComposition
    ): void {
        // Young: Smaller, brighter
        // Adult: Normal
        // Elder: Grayer, slightly smaller

        // Age factor based on composition: High protein = better muscle retention
        const proteinFactor = composition.protein > 0.3 ? 0.95 : 0.9; // High protein = less shrinkage
        const ageFactor = age < 2 ? 0.7 : age > 10 ? proteinFactor : 1.0;
        mesh.scale.multiplyScalar(ageFactor);

        // Elder = grayer (melanin accumulation)
        // High calcium = stronger bones = less graying (better health)
        const calciumFactor = composition.calcium > 0.2 ? 0.2 : 0.3; // Less graying with strong bones
        if (age > 10) {
            mesh.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    const mat = child.material as THREE.MeshStandardMaterial;
                    mat.color.lerp(new THREE.Color(0.5, 0.5, 0.5), calciumFactor);
                }
            });
        }
    }
}
