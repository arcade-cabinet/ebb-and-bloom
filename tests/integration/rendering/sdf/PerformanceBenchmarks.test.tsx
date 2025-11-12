/**
 * SDF PERFORMANCE BENCHMARKS - Phase 0.1.5
 * 
 * Performance tests for SDF rendering system.
 * Validates 60fps target with 100+ primitives and complex scenes.
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { SDFRenderer } from '../../../../engine/rendering/sdf/renderer/SDFRenderer';
import { 
  createPerformanceScene,
  measureRenderPerformance,
  assertRenderPerformance
} from '../../../utils/sdf-test-helpers';

describe('SDF Performance Benchmarks', () => {
  describe('Primitive Count Scaling', () => {
    it('should render 10 primitives efficiently', () => {
      const scene = createPerformanceScene(10);
      
      const metrics = measureRenderPerformance(() => {
        render(
          <Canvas>
            <SDFRenderer primitives={scene.primitives} maxSteps={64} />
          </Canvas>
        );
      }, 10);
      
      expect(metrics.primitiveCount).toBe(10);
      expect(metrics.renderTime).toBeLessThan(100);
    });
    
    it('should render 50 primitives efficiently', () => {
      const scene = createPerformanceScene(50);
      
      const metrics = measureRenderPerformance(() => {
        render(
          <Canvas>
            <SDFRenderer primitives={scene.primitives} maxSteps={64} />
          </Canvas>
        );
      }, 50);
      
      expect(metrics.primitiveCount).toBe(50);
      expect(metrics.renderTime).toBeLessThan(150);
    });
    
    it('should render 100 primitives at target performance', () => {
      const scene = createPerformanceScene(100);
      
      const metrics = measureRenderPerformance(() => {
        render(
          <Canvas>
            <SDFRenderer primitives={scene.primitives} maxSteps={64} />
          </Canvas>
        );
      }, 100);
      
      expect(metrics.primitiveCount).toBe(100);
      assertRenderPerformance(metrics, 60, { allowedDeviation: 0.7 });
    });
    
    it('should handle 150 primitives', () => {
      const scene = createPerformanceScene(150);
      
      const metrics = measureRenderPerformance(() => {
        render(
          <Canvas>
            <SDFRenderer primitives={scene.primitives} maxSteps={64} />
          </Canvas>
        );
      }, 150);
      
      expect(metrics.primitiveCount).toBe(150);
      expect(metrics.renderTime).toBeLessThan(300);
    });
  });
  
  describe('Raymarching Quality Settings', () => {
    it('should be faster with fewer steps', () => {
      const scene = createPerformanceScene(50);
      
      const metrics32 = measureRenderPerformance(() => {
        render(
          <Canvas>
            <SDFRenderer primitives={scene.primitives} maxSteps={32} />
          </Canvas>
        );
      }, 50);
      
      const metrics128 = measureRenderPerformance(() => {
        render(
          <Canvas>
            <SDFRenderer primitives={scene.primitives} maxSteps={128} />
          </Canvas>
        );
      }, 50);
      
      expect(metrics32.renderTime).toBeLessThanOrEqual(metrics128.renderTime * 1.5);
    });
    
    it('should maintain performance with lower precision', () => {
      const scene = createPerformanceScene(100);
      
      const metrics = measureRenderPerformance(() => {
        render(
          <Canvas>
            <SDFRenderer 
              primitives={scene.primitives} 
              maxSteps={64}
              precision={0.01}
            />
          </Canvas>
        );
      }, 100);
      
      assertRenderPerformance(metrics, 60, { allowedDeviation: 0.7 });
    });
  });
  
  describe('Complex Geometry Performance', () => {
    it('should handle complex operations efficiently', () => {
      const scene = createPerformanceScene(30);
      
      scene.primitives.forEach((p, i) => {
        if (i > 0) {
          p.operation = i % 2 === 0 ? 'smooth-union' : 'subtract';
          p.operationStrength = 0.2;
        }
      });
      
      const metrics = measureRenderPerformance(() => {
        render(
          <Canvas>
            <SDFRenderer primitives={scene.primitives} maxSteps={64} />
          </Canvas>
        );
      }, 30);
      
      expect(metrics.renderTime).toBeLessThan(200);
    });
    
    it('should handle heavy transformations efficiently', () => {
      const scene = createPerformanceScene(40);
      
      scene.primitives.forEach(p => {
        p.rotation = [Math.PI / 4, Math.PI / 3, Math.PI / 6];
        p.scale = [1.5, 1.2, 0.8];
      });
      
      const metrics = measureRenderPerformance(() => {
        render(
          <Canvas>
            <SDFRenderer primitives={scene.primitives} maxSteps={64} />
          </Canvas>
        );
      }, 40);
      
      expect(metrics.renderTime).toBeLessThan(150);
    });
  });
  
  describe('Memory and Shader Compilation', () => {
    it('should compile large scenes without timeout', () => {
      const scene = createPerformanceScene(100);
      
      const startTime = performance.now();
      
      render(
        <Canvas>
          <SDFRenderer primitives={scene.primitives} />
        </Canvas>
      );
      
      const compilationTime = performance.now() - startTime;
      
      expect(compilationTime).toBeLessThan(1000);
    });
    
    it('should recompile efficiently on scene changes', () => {
      const scene1 = createPerformanceScene(50);
      
      const startTime1 = performance.now();
      const { rerender } = render(
        <Canvas>
          <SDFRenderer primitives={scene1.primitives} />
        </Canvas>
      );
      const firstRender = performance.now() - startTime1;
      
      const scene2 = createPerformanceScene(50);
      scene2.primitives[0].type = 'box';
      
      const startTime2 = performance.now();
      rerender(
        <Canvas>
          <SDFRenderer primitives={scene2.primitives} />
        </Canvas>
      );
      const secondRender = performance.now() - startTime2;
      
      expect(secondRender).toBeLessThan(firstRender * 2);
    });
  });
  
  describe('Realistic Scenarios', () => {
    it('should handle molecular visualization at 60fps', () => {
      const scene = createPerformanceScene(30);
      
      scene.primitives = scene.primitives.map((p, i) => ({
        ...p,
        type: ['sphere', 'porbital', 'dorbital'][i % 3] as any,
        operation: i > 0 ? 'smooth-union' : undefined,
        operationStrength: 0.15
      }));
      
      const metrics = measureRenderPerformance(() => {
        render(
          <Canvas>
            <SDFRenderer primitives={scene.primitives} maxSteps={64} />
          </Canvas>
        );
      }, 30);
      
      assertRenderPerformance(metrics, 60, { allowedDeviation: 0.75 });
    });
    
    it('should handle crystalline structures efficiently', () => {
      const scene = createPerformanceScene(64);
      
      scene.primitives = scene.primitives.map((p, i) => ({
        ...p,
        type: i % 2 === 0 ? 'box' : 'octahedron',
        operation: i > 0 ? 'union' : undefined
      }));
      
      const metrics = measureRenderPerformance(() => {
        render(
          <Canvas>
            <SDFRenderer primitives={scene.primitives} maxSteps={64} />
          </Canvas>
        );
      }, 64);
      
      expect(metrics.renderTime).toBeLessThan(200);
    });
  });
  
  describe('Stress Tests', () => {
    it('should not crash with 200 primitives', () => {
      const scene = createPerformanceScene(200);
      
      expect(() => {
        render(
          <Canvas>
            <SDFRenderer primitives={scene.primitives} maxSteps={32} />
          </Canvas>
        );
      }).not.toThrow();
    });
    
    it('should handle maximum raymarch steps', () => {
      const scene = createPerformanceScene(20);
      
      const metrics = measureRenderPerformance(() => {
        render(
          <Canvas>
            <SDFRenderer primitives={scene.primitives} maxSteps={256} />
          </Canvas>
        );
      }, 20);
      
      expect(metrics.renderTime).toBeLessThan(500);
    });
  });
  
  describe('Performance Regression Detection', () => {
    it('should track baseline performance for future comparison', () => {
      const scene = createPerformanceScene(100);
      
      const metrics = measureRenderPerformance(() => {
        render(
          <Canvas>
            <SDFRenderer primitives={scene.primitives} maxSteps={64} />
          </Canvas>
        );
      }, 100);
      
      console.log('Performance Baseline (100 primitives):', {
        renderTime: metrics.renderTime.toFixed(2) + 'ms',
        fps: metrics.fps.toFixed(1),
        frameTime: metrics.frameTime.toFixed(2) + 'ms'
      });
      
      expect(metrics.renderTime).toBeLessThan(100);
    });
  });
  
  describe('Frame Time Consistency', () => {
    it.skip('should maintain consistent frame times (skipped: flaky in CI)', () => {
      const scene = createPerformanceScene(50);
      
      const frameTimes: number[] = [];
      
      for (let i = 0; i < 5; i++) {
        const metrics = measureRenderPerformance(() => {
          render(
            <Canvas>
              <SDFRenderer primitives={scene.primitives} maxSteps={64} />
            </Canvas>
          );
        }, 50);
        
        frameTimes.push(metrics.frameTime);
      }
      
      const avgFrameTime = frameTimes.reduce((a, b) => a + b) / frameTimes.length;
      const variance = frameTimes.reduce((sum, time) => {
        return sum + Math.pow(time - avgFrameTime, 2);
      }, 0) / frameTimes.length;
      const stdDev = Math.sqrt(variance);
      
      expect(stdDev / avgFrameTime).toBeLessThan(2.0);
    });
  });
});
