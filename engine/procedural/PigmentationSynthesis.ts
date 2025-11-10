/**
 * PIGMENTATION SYNTHESIS
 * 
 * Creature coloring from diet, environment, and chemistry.
 * 
 * Biological Pigments:
 * - Melanin (browns/blacks) - universal, for UV protection
 * - Carotenoids (reds/oranges/yellows) - from diet (plants)
 * - Pterins (reds/yellows) - synthesized internally
 * - Purines (whites) - structural proteins
 * - Porphyrins (greens/reds) - from chlorophyll/blood
 */

import * as THREE from 'three';

export interface DietaryInput {
    plantMatter: number;    // 0-1 (carotenoids)
    animalMatter: number;   // 0-1 (heme/porphyrins)
    minerals: number;       // 0-1 (metallic ions)
}

export interface Environment {
    vegetation: number;     // 0-1 (green camouflage)
    rockColor: number;      // 0-1 (gray/brown camouflage)
    uvIntensity: number;    // 0-1 (melanin protection)
    temperature: number;    // K (affects pigment stability)
}

export class PigmentationSynthesis {
    /**
     * Generate color from diet and environment
     */
    generateColor(diet: DietaryInput, environment: Environment, genetics: number): THREE.Color {
        const pigments = this.calculatePigments(diet, environment, genetics);

        // Mix pigments (additive color)
        const r = pigments.melanin * 0.2 + pigments.carotenoid * 0.8 + pigments.purine * 0.9;
        const g = pigments.carotenoid * 0.5 + pigments.pterin * 0.7 + pigments.porphyrin * 0.3 + pigments.purine * 0.9;
        const b = pigments.melanin * 0.1 + pigments.purine * 0.9;

        // Normalize to 0-1
        const max = Math.max(r, g, b, 0.1);
        return new THREE.Color(r / max, g / max, b / max);
    }

    /**
     * Calculate pigment concentrations from inputs
     */
    private calculatePigments(
        diet: DietaryInput,
        env: Environment,
        genetics: number
    ): {
        melanin: number;
        carotenoid: number;
        pterin: number;
        purine: number;
        porphyrin: number;
    } {
        return {
            // Melanin: UV protection + genetics
            melanin: env.uvIntensity * 0.7 + genetics * 0.3,

            // Carotenoids: From plant diet (cannot synthesize)
            carotenoid: diet.plantMatter * 0.8,

            // Pterins: Synthesized internally
            pterin: genetics * 0.5 + diet.animalMatter * 0.3,

            // Purines: Structural (whites)
            purine: 0.3 + diet.animalMatter * 0.2,

            // Porphyrins: From blood/chlorophyll
            porphyrin: diet.animalMatter * 0.5 + diet.plantMatter * 0.2
        };
    }

    /**
     * Generate camouflage pattern
     */
    generatePattern(environment: Environment, genetics: number): THREE.Texture {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d')!;

        // Base color from environment
        const baseColor = this.getEnvironmentColor(environment);
        ctx.fillStyle = `rgb(${baseColor.r * 255}, ${baseColor.g * 255}, ${baseColor.b * 255})`;
        ctx.fillRect(0, 0, 256, 256);

        // Pattern from genetics
        const patternType = genetics > 0.7 ? 'spots' : genetics > 0.4 ? 'stripes' : 'solid';

        if (patternType === 'spots') {
            // Spots (leopard, giraffe)
            const spotCount = 20 + Math.floor(genetics * 30);
            ctx.fillStyle = `rgba(${baseColor.r * 200}, ${baseColor.g * 200}, ${baseColor.b * 200}, 0.6)`;
            for (let i = 0; i < spotCount; i++) {
                const x = Math.random() * 256;
                const y = Math.random() * 256;
                const radius = 10 + Math.random() * 20;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (patternType === 'stripes') {
            // Stripes (zebra, tiger)
            const stripeCount = 8 + Math.floor(genetics * 8);
            ctx.fillStyle = `rgba(${baseColor.r * 200}, ${baseColor.g * 200}, ${baseColor.b * 200}, 0.7)`;
            const horizontal = genetics > 0.55;
            for (let i = 0; i < stripeCount; i++) {
                if (horizontal) {
                    ctx.fillRect(0, (i * 256) / stripeCount, 256, 256 / (stripeCount * 2));
                } else {
                    ctx.fillRect((i * 256) / stripeCount, 0, 256 / (stripeCount * 2), 256);
                }
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    /**
     * Get camouflage color from environment
     */
    private getEnvironmentColor(env: Environment): THREE.Color {
        // Blend vegetation green with rock brown
        const r = (1 - env.vegetation) * env.rockColor * 0.6 + env.vegetation * 0.2;
        const g = env.vegetation * 0.5 + (1 - env.vegetation) * env.rockColor * 0.4;
        const b = env.vegetation * 0.2 + (1 - env.vegetation) * env.rockColor * 0.3;

        return new THREE.Color(r, g, b);
    }

    /**
     * Generate iridescence (structural color, not pigment)
     */
    generateIridescence(chitinThickness: number, angle: number): THREE.Color {
        // Thin-film interference (like butterfly wings)
        const wavelength = 400 + chitinThickness * 300; // 400-700nm
        const phase = (2 * Math.PI * chitinThickness / wavelength) + angle;

        const r = 0.5 + 0.5 * Math.cos(phase);
        const g = 0.5 + 0.5 * Math.cos(phase + Math.PI * 2 / 3);
        const b = 0.5 + 0.5 * Math.cos(phase + Math.PI * 4 / 3);

        return new THREE.Color(r, g, b);
    }
}

