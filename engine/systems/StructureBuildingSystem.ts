/**
 * STRUCTURE BUILDING SYSTEM
 * 
 * Governor-driven structure creation.
 * 
 * CooperationBehavior decides: Will creatures work together?
 * HierarchyBehavior decides: Who coordinates construction?
 * StructureSynthesis creates: What does it look like?
 */

import { StructureSynthesis, MaterialAvailability, StructureType } from '../procedural/StructureSynthesis';
import * as THREE from 'three';

export interface Structure {
    id: string;
    type: StructureType;
    position: THREE.Vector3;
    mesh: THREE.Group;
    builders: string[];
    durability: number;
    capacity: number;
    occupants: Set<string>;
}

export interface BuildingProject {
    structureId: string;
    type: StructureType;
    position: THREE.Vector3;
    progress: number; // 0-1
    contributors: Map<string, number>;
}

export class StructureBuildingSystem {
    private structures: Map<string, Structure> = new Map();
    private projects: Map<string, BuildingProject> = new Map();
    private synthesis: StructureSynthesis;
    private scene: THREE.Scene;
    private nextId: number = 0;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.synthesis = new StructureSynthesis();
    }

    /**
     * Start building project (initiated by cooperative creatures)
     */
    startProject(
        type: StructureType,
        position: THREE.Vector3,
        initiatorId: string
    ): string {
        const projectId = `project-${this.nextId++}`;

        this.projects.set(projectId, {
            structureId: `structure-${this.nextId++}`,
            type,
            position: position.clone(),
            progress: 0,
            contributors: new Map([[initiatorId, 0.01]])
        });

        return projectId;
    }

    /**
     * Creature works on project
     */
    contribute(projectId: string, creatureId: string, amount: number): void {
        const project = this.projects.get(projectId);
        if (!project) return;

        const current = project.contributors.get(creatureId) || 0;
        project.contributors.set(creatureId, current + amount);

        // Update progress
        const total = Array.from(project.contributors.values()).reduce((a, b) => a + b, 0);
        project.progress = Math.min(1.0, total);

        // Complete if done
        if (project.progress >= 1.0) {
            this.completeProject(projectId);
        }
    }

    /**
     * Complete project (SYNTHESIS happens here)
     */
    private completeProject(projectId: string): void {
        const project = this.projects.get(projectId);
        if (!project) return;

        // Determine materials from environment (simplified)
        const materials: MaterialAvailability = {
            wood: 0.7,
            stone: 0.5,
            bone: 0.3,
            fiber: 0.6,
            clay: 0.4
        };

        // SYNTHESIS: Generate structure mesh
        const mesh = this.synthesis.generateStructure(project.type, materials, 2.0);
        mesh.position.copy(project.position);
        this.scene.add(mesh);

        // Create structure
        const structure: Structure = {
            id: project.structureId,
            type: project.type,
            position: project.position,
            mesh,
            builders: Array.from(project.contributors.keys()),
            durability: 1.0,
            capacity: this.getCapacity(project.type),
            occupants: new Set()
        };

        this.structures.set(structure.id, structure);
        this.projects.delete(projectId);
    }

    /**
     * Update structures (degradation)
     */
    update(delta: number): void {
        const DEGRADATION_RATE = 0.0001;

        for (const [id, structure] of this.structures) {
            structure.durability -= DEGRADATION_RATE * delta;

            if (structure.durability <= 0) {
                this.scene.remove(structure.mesh);
                this.structures.delete(id);
            }
        }
    }

    private getCapacity(type: StructureType): number {
        const capacities: Record<StructureType, number> = {
            burrow: 5,
            platform: 3,
            stiltwork: 4,
            windbreak: 3
        };
        return capacities[type];
    }

    getStructures(): Structure[] {
        return Array.from(this.structures.values());
    }

    getProjects(): BuildingProject[] {
        return Array.from(this.projects.values());
    }
}
