/**
 * MOLECULAR SYNTHESIS
 * 
 * Visual forms emerge from molecular composition.
 * 
 * Core Principle:
 * - Protein % → Muscle bulk (cylinder deformations)
 * - Calcium % → Bone structure (rigid connections)
 * - Lipid % → Fat distribution (sphere inflation)
 * - Chitin % → Exoskeleton segments (faceted geometry)
 * - Keratin % → Hair/feathers (spike protrusions)
 */

import * as THREE from 'three';

export interface MolecularComposition {
    protein: number;    // 0-1 (muscle, tendons)
    calcium: number;    // 0-1 (bones, shells)
    lipid: number;      // 0-1 (fat, membranes)
    chitin: number;     // 0-1 (exoskeleton)
    keratin: number;    // 0-1 (hair, feathers, claws)
    water: number;      // 0-1 (hydration)
    minerals: number;   // 0-1 (trace elements)
}

export interface BodyPlan {
    segments: number;       // Body segmentation
    symmetry: 'bilateral' | 'radial' | 'asymmetric';
    appendages: number;     // Limbs/tentacles
    spine: boolean;         // Vertebrate vs invertebrate
}

/**
 * Generate geometry from molecular composition
 */
export class MolecularSynthesis {
    /**
     * Create creature geometry from molecules
     */
    generateFromComposition(
        composition: MolecularComposition,
        mass: number,
        bodyPlan: BodyPlan
    ): THREE.Group {
        const group = new THREE.Group();

        // Base scale from mass
        const scale = Math.cbrt(mass / 50);

        if (bodyPlan.spine) {
            // VERTEBRATE: High protein/calcium
            this.generateVertebrate(group, composition, scale, bodyPlan);
        } else if (composition.chitin > 0.3) {
            // ARTHROPOD: High chitin
            this.generateArthropod(group, composition, scale, bodyPlan);
        } else {
            // SOFT-BODIED: High water/lipid
            this.generateSoftBody(group, composition, scale, bodyPlan);
        }

        return group;
    }

    /**
     * VERTEBRATE SYNTHESIS
     * 
     * Protein → muscle cylinders
     * Calcium → bone rigidity
     * Lipid → body thickness
     */
    private generateVertebrate(
        group: THREE.Group,
        comp: MolecularComposition,
        scale: number,
        plan: BodyPlan
    ): void {
        // Body bulk from protein + lipid
        const bulkFactor = comp.protein * 0.7 + comp.lipid * 0.3;
        const bodyRadius = scale * (0.3 + bulkFactor * 0.2);
        const bodyLength = scale * (0.8 + comp.protein * 0.4);

        // Main body (cylinder, muscle-driven)
        const bodyGeometry = new THREE.CylinderGeometry(
            bodyRadius,
            bodyRadius * (1 - comp.lipid * 0.3), // Taper if lean
            bodyLength,
            8,
            Math.ceil(comp.calcium * 8) // More segments if rigid
        );
        const body = new THREE.Mesh(bodyGeometry, this.createMaterial(comp));
        body.rotation.z = Math.PI / 2; // Horizontal
        group.add(body);

        // Head (calcium-rich = larger skull)
        const headRadius = bodyRadius * (0.6 + comp.calcium * 0.2);
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(headRadius, 8, 8),
            this.createMaterial(comp)
        );
        head.position.set(bodyLength / 2 + headRadius, 0, 0);
        group.add(head);

        // Limbs (protein = muscle, calcium = bone)
        const limbStrength = (comp.protein + comp.calcium) / 2;
        const limbLength = bodyLength * (0.6 + limbStrength * 0.4);
        const limbRadius = bodyRadius * (0.15 + comp.protein * 0.1);

        for (let i = 0; i < plan.appendages; i++) {
            const angle = (i / plan.appendages) * Math.PI * 2;
            const limb = new THREE.Mesh(
                new THREE.CylinderGeometry(limbRadius, limbRadius * 0.5, limbLength, 4),
                this.createMaterial(comp)
            );
            limb.position.set(
                (i < plan.appendages / 2 ? bodyLength * 0.3 : -bodyLength * 0.3),
                -limbLength / 2,
                Math.sin(angle) * bodyRadius * 0.7
            );
            group.add(limb);
        }

        // Keratin features (horns, spikes)
        if (comp.keratin > 0.3) {
            const spikeCount = Math.floor(comp.keratin * 8);
            for (let i = 0; i < spikeCount; i++) {
                const angle = (i / spikeCount) * Math.PI * 2;
                const spike = new THREE.Mesh(
                    new THREE.ConeGeometry(headRadius * 0.2, headRadius * 0.8, 4),
                    this.createMaterial({ ...comp, keratin: 1.0 })
                );
                spike.position.set(
                    headRadius * Math.cos(angle) * 0.8,
                    headRadius * Math.sin(angle) * 0.8,
                    headRadius * 0.5
                );
                spike.rotation.x = Math.PI / 2;
                head.add(spike);
            }
        }
    }

    /**
     * ARTHROPOD SYNTHESIS
     * 
     * Chitin → segmented exoskeleton
     * Protein → small muscle attachments
     */
    private generateArthropod(
        group: THREE.Group,
        comp: MolecularComposition,
        scale: number,
        plan: BodyPlan
    ): void {
        const segmentCount = plan.segments;
        const segmentLength = (scale * 0.8) / segmentCount;
        const segmentRadius = scale * 0.2;

        // Segmented body (chitin exoskeleton)
        for (let i = 0; i < segmentCount; i++) {
            const segment = new THREE.Mesh(
                new THREE.CylinderGeometry(
                    segmentRadius * (1 - i * 0.1 / segmentCount), // Taper
                    segmentRadius * (1 - (i + 1) * 0.1 / segmentCount),
                    segmentLength,
                    6 // Hexagonal (chitin structure)
                ),
                this.createMaterial(comp)
            );
            segment.position.set(
                (i - segmentCount / 2) * segmentLength,
                0,
                0
            );
            segment.rotation.z = Math.PI / 2;
            group.add(segment);
        }

        // Jointed appendages (6-8 legs typical)
        const limbRadius = segmentRadius * 0.3;
        const limbLength = scale * 0.6;
        
        for (let i = 0; i < plan.appendages; i++) {
            const segmentIndex = Math.floor((i / plan.appendages) * segmentCount);
            const angle = (i % 2) * Math.PI; // Alternate sides

            // Multi-segment leg (chitin joints)
            const leg = new THREE.Group();
            const segments = 3;
            for (let j = 0; j < segments; j++) {
                const joint = new THREE.Mesh(
                    new THREE.CylinderGeometry(limbRadius, limbRadius * 0.8, limbLength / segments, 6),
                    this.createMaterial(comp)
                );
                joint.position.set(0, -j * limbLength / segments, 0);
                joint.rotation.x = j * 0.3; // Bend
                leg.add(joint);
            }

            leg.position.set(
                (segmentIndex - segmentCount / 2) * segmentLength,
                0,
                Math.sin(angle) * segmentRadius * 1.5
            );
            group.add(leg);
        }
    }

    /**
     * SOFT-BODIED SYNTHESIS
     * 
     * Water + lipid → blobby forms
     * Low protein → minimal structure
     */
    private generateSoftBody(
        group: THREE.Group,
        comp: MolecularComposition,
        scale: number,
        plan: BodyPlan
    ): void {
        // Blob shape (water-dominant)
        const blobRadius = scale * (0.4 + comp.water * 0.3);
        const blob = new THREE.Mesh(
            new THREE.SphereGeometry(blobRadius, 8, 8),
            this.createMaterial(comp)
        );
        group.add(blob);

        // Tentacles if appropriate
        if (plan.appendages > 0) {
            for (let i = 0; i < plan.appendages; i++) {
                const angle = (i / plan.appendages) * Math.PI * 2;
                const tentacle = this.createTentacle(
                    blobRadius * 0.2,
                    scale * 0.8,
                    comp
                );
                tentacle.position.set(
                    Math.cos(angle) * blobRadius * 0.7,
                    -blobRadius * 0.5,
                    Math.sin(angle) * blobRadius * 0.7
                );
                group.add(tentacle);
            }
        }
    }

    /**
     * Create material from molecular composition
     */
    private createMaterial(comp: MolecularComposition): THREE.MeshStandardMaterial {
        // Base color from dominant molecule
        let baseColor: THREE.Color;

        if (comp.chitin > 0.5) {
            // Chitin = dark browns/blacks
            baseColor = new THREE.Color(0.2 + comp.chitin * 0.2, 0.15, 0.1);
        } else if (comp.keratin > 0.4) {
            // Keratin = grays/browns
            baseColor = new THREE.Color(0.4, 0.35, 0.3);
        } else if (comp.calcium > 0.4) {
            // Calcium = white/cream
            baseColor = new THREE.Color(0.9, 0.85 + comp.calcium * 0.15, 0.8);
        } else {
            // Protein/lipid = pinks/reds
            baseColor = new THREE.Color(
                0.7 + comp.protein * 0.2,
                0.4 + comp.lipid * 0.3,
                0.3 + comp.water * 0.2
            );
        }

        return new THREE.MeshStandardMaterial({
            color: baseColor,
            roughness: 0.7 + comp.chitin * 0.3, // Chitin = rough
            metalness: comp.minerals * 0.3,     // Minerals = slightly metallic
        });
    }

    /**
     * Create tentacle geometry
     */
    private createTentacle(radius: number, length: number, comp: MolecularComposition): THREE.Group {
        const tentacle = new THREE.Group();
        const segments = 6;

        for (let i = 0; i < segments; i++) {
            const segment = new THREE.Mesh(
                new THREE.CylinderGeometry(
                    radius * (1 - i * 0.15),
                    radius * (1 - (i + 1) * 0.15),
                    length / segments,
                    6
                ),
                this.createMaterial(comp)
            );
            segment.position.set(0, -i * length / segments, 0);
            segment.rotation.x = i * 0.1; // Slight curl
            tentacle.add(segment);
        }

        return tentacle;
    }
}

