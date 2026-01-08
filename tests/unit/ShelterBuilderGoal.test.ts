
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShelterBuilderGoal, ShelterAgent, GatherMaterialGoal } from '../../engine/agents/ShelterBuilderGoal';
import { Vector3, Goal } from 'yuka';

class MockWorld {
    remove(entity: any) {}
    queryRadius(pos: any, radius: any) { return []; }
}

describe('ShelterBuilderGoal', () => {
    let agent: ShelterAgent;
    let goal: ShelterBuilderGoal;

    beforeEach(() => {
        agent = {
            position: new Vector3(0, 0, 0),
            velocity: new Vector3(0, 0, 0),
            maxSpeed: 1,
            world: new MockWorld() as any,
            currentShelter: 'none',
            inventory: {
                wood: 0,
                stone: 0,
                mud: 0,
                thatch: 0
            },
            energy: 100,
            maxEnergy: 100
        };
        goal = new ShelterBuilderGoal(agent);
    });

    it('should initialize with correct owner', () => {
        expect(goal.owner).toBe(agent);
        expect(goal.targetShelterType).toBe('pit');
    });

    it('should determine next shelter type on activate', () => {
        agent.currentShelter = 'none';
        goal.activate();
        expect(goal.targetShelterType).toBe('pit');
    });

    it('should have subgoals capabilities', () => {
        expect(typeof goal.addSubgoal).toBe('function');
        expect(typeof goal.hasSubgoals).toBe('function');
    });

    it('should add gather material goal if materials insufficient', () => {
        goal.activate();
        // Needs wood for pit (5 wood)
        agent.inventory.wood = 0;

        goal.execute();

        expect(goal.hasSubgoals()).toBe(true);
        expect(goal.status).toBe(Goal.STATUS.ACTIVE);

        const subgoal = goal.currentSubgoal();
        expect(subgoal).toBeInstanceOf(GatherMaterialGoal);
        if (subgoal instanceof GatherMaterialGoal) {
             expect(subgoal.materialType).toBe('wood');
        }
    });

    it('should construct shelter if materials sufficient', () => {
        goal.activate();
        // Needs wood for pit (5 wood, 10 mud)
        agent.inventory.wood = 10;
        agent.inventory.mud = 15;
        agent.inventory.stone = 10;

        goal.execute();

        expect(goal.hasSubgoals()).toBe(false);
        expect(goal.status).toBe(Goal.STATUS.COMPLETED);
        expect(agent.currentShelter).toBe('pit');
        expect(agent.inventory.wood).toBe(5); // 10 - 5
        expect(agent.inventory.mud).toBe(5);  // 15 - 10
    });

    it('should handle sequential gathering logic', () => {
        goal.activate();
        // Start empty
        goal.execute();
        expect(goal.hasSubgoals()).toBe(true);
        let subgoal = goal.currentSubgoal();
        expect(subgoal).toBeInstanceOf(GatherMaterialGoal); // Wood

        // Simulate subgoal completion
        subgoal!.status = Goal.STATUS.COMPLETED;

        // Next execute - should wait for cleanup

        goal.clearSubgoals();

        // Give some wood
        agent.inventory.wood = 10;

        goal.execute();
        // Should now ask for Mud
        expect(goal.hasSubgoals()).toBe(true);
        subgoal = goal.currentSubgoal();
        if (subgoal instanceof GatherMaterialGoal) {
             expect(subgoal.materialType).toBe('mud');
        }
    });
});
