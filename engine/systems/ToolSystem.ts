/**
 * TOOL SYSTEM
 * 
 * Governor-driven tool creation and use.
 * 
 * CognitiveSystem decides: Can this creature learn tools?
 * CooperationBehavior decides: Will it teach others?
 * StructureSynthesis creates: What does the tool look like?
 */

import { StructureSynthesis, MaterialAvailability, ToolType } from '../procedural/StructureSynthesis';
import * as THREE from 'three';

export interface Tool {
    id: string;
    type: ToolType;
    position: THREE.Vector3;
    mesh: THREE.Group;
    createdBy: string;
    durability: number;
    discoveredBy: Set<string>;
}

export class ToolSystem {
    private tools: Map<string, Tool> = new Map();
    private synthesis: StructureSynthesis;
    private scene: THREE.Scene;
    private nextId: number = 0;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.synthesis = new StructureSynthesis();
    }

    /**
     * Creature creates tool (CognitiveSystem drives this)
     */
    createTool(
        type: ToolType,
        position: THREE.Vector3,
        creatorId: string,
        materials: MaterialAvailability
    ): Tool {
        // SYNTHESIS: Generate mesh from available materials
        const mesh = this.synthesis.generateTool(type, materials);
        mesh.position.copy(position);
        this.scene.add(mesh);

        const tool: Tool = {
            id: `tool-${this.nextId++}`,
            type,
            position: position.clone(),
            mesh,
            createdBy: creatorId,
            durability: 1.0,
            discoveredBy: new Set([creatorId])
        };

        this.tools.set(tool.id, tool);
        return tool;
    }

    /**
     * Update tools (degradation)
     */
    update(delta: number): void {
        const DEGRADATION_RATE = 0.001;

        for (const [id, tool] of this.tools) {
            tool.durability -= DEGRADATION_RATE * delta;

            if (tool.durability <= 0) {
                this.scene.remove(tool.mesh);
                this.tools.delete(id);
            }
        }
    }

    /**
     * Creature discovers tool
     */
    discover(toolId: string, creatureId: string): boolean {
        const tool = this.tools.get(toolId);
        if (!tool) return false;

        tool.discoveredBy.add(creatureId);
        return true;
    }

    getTools(): Tool[] {
        return Array.from(this.tools.values());
    }

    getToolsNear(position: THREE.Vector3, radius: number): Tool[] {
        return Array.from(this.tools.values()).filter(tool =>
            tool.position.distanceTo(position) < radius
        );
    }
}
