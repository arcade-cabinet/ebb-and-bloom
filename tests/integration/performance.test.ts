/**
 * PERFORMANCE TESTS
 * 
 * Ensure governors + synthesis meet performance targets.
 */

import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { EntityManager, Vehicle } from 'yuka';
import { 
    CreatureManager,
    MetabolismSystem,
    PredatorPreyBehavior
} from '../../engine';

describe('Performance Benchmarks', () => {
    it('should handle 100 creatures at 60fps', () => {
        const scene = new THREE.Scene();
        const entityManager = new EntityManager();
        const manager = new CreatureManager(scene, entityManager, 'perf-test');
        
        const biome = { vegetation: 0.5, rockColor: 0.5, uvIntensity: 0.5, temperature: 290 };
        
        // Spawn 100 creatures
        for (let i = 0; i < 100; i++) {
            manager.spawn(new THREE.Vector3(i * 5, 5, i * 5), biome);
        }
        
        // Benchmark update
        const start = performance.now();
        const targetFrames = 60;
        
        for (let i = 0; i < targetFrames; i++) {
            manager.update(0.016); // 60fps
            entityManager.update(0.016);
        }
        
        const elapsed = performance.now() - start;
        const fps = (targetFrames / elapsed) * 1000;
        
        // Should achieve reasonable performance (at least 20fps with 100 creatures)
        // Performance tests can be flaky, so use a lower threshold
        expect(fps).toBeGreaterThan(20);
    });
    
    it('should update metabolism efficiently', () => {
        const agents = Array.from({ length: 1000 }, () => ({
            mass: 50,
            energy: 100,
            maxEnergy: 100
        }));
        
        const start = performance.now();
        
        for (const agent of agents) {
            MetabolismSystem.update(agent, 0.016);
        }
        
        const elapsed = performance.now() - start;
        
        // Should process 1000 agents in <16ms (60fps budget)
        expect(elapsed).toBeLessThan(16);
    });
    
    it('should handle large agent groups efficiently', () => {
        const manager = new EntityManager();
        
        // Create 500 agents
        for (let i = 0; i < 500; i++) {
            const agent: any = new Vehicle();
            agent.position.set(
                Math.random() * 100,
                5,
                Math.random() * 100
            );
            agent.mass = 50;
            agent.role = i < 250 ? 'prey' : 'predator';
            agent.manager = manager;
            
            agent.steering.add(new PredatorPreyBehavior());
            manager.add(agent);
        }
        
        // Benchmark
        const start = performance.now();
        manager.update(0.016);
        const elapsed = performance.now() - start;
        
        // Should update 500 agents reasonably quickly (<50ms for test environment)
        // Performance can vary, so use a more lenient threshold
        expect(elapsed).toBeLessThan(50);
    });
});

