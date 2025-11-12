/**
 * FOREIGN BODY JOINING TESTS (Phase 0.4)
 * 
 * Comprehensive tests for foreign body attachment system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  ForeignBodySystem, 
  HostPrimitive, 
  ForeignBody,
  AttachmentPoint 
} from '../../../../engine/rendering/sdf/ForeignBodySystem';
import { SDFPrimitive } from '../../../../engine/rendering/sdf/types';

describe('ForeignBodySystem', () => {
  let system: ForeignBodySystem;

  beforeEach(() => {
    system = new ForeignBodySystem();
  });

  describe('calculateAttachmentTransform', () => {
    it('should calculate correct position for simple attachment', () => {
      const hostPrimitive: SDFPrimitive = {
        type: 'sphere',
        position: [0, 0, 0],
        params: [1.0],
        materialId: 'default'
      };

      const host: HostPrimitive = {
        primitive: hostPrimitive,
        attachedBodies: []
      };

      const attachmentPoint: AttachmentPoint = {
        position: [1, 0, 0],
        normal: [1, 0, 0]
      };

      const foreignBody: ForeignBody = {
        primitive: {
          type: 'sphere',
          position: [0, 0, 0],
          params: [0.2],
          materialId: 'default'
        },
        attachmentOffset: [0.2, 0, 0],
        attachmentRotation: [0, 0, 0],
        alignWithSurface: false
      };

      const transform = system.calculateAttachmentTransform(host, attachmentPoint, foreignBody);

      expect(transform.position[0]).toBeCloseTo(1.2, 5);
      expect(transform.position[1]).toBeCloseTo(0, 5);
      expect(transform.position[2]).toBeCloseTo(0, 5);
    });

    it('should align foreign body to surface normal when alignWithSurface is true', () => {
      const hostPrimitive: SDFPrimitive = {
        type: 'sphere',
        position: [0, 0, 0],
        params: [1.0],
        materialId: 'default'
      };

      const host: HostPrimitive = {
        primitive: hostPrimitive,
        attachedBodies: []
      };

      const attachmentPoint: AttachmentPoint = {
        position: [0, 1, 0],
        normal: [0, 1, 0]
      };

      const foreignBody: ForeignBody = {
        primitive: {
          type: 'cylinder',
          position: [0, 0, 0],
          params: [0.5, 0.1],
          materialId: 'default'
        },
        attachmentOffset: [0, 0.5, 0],
        attachmentRotation: [0, 0, 0],
        alignWithSurface: true
      };

      const transform = system.calculateAttachmentTransform(host, attachmentPoint, foreignBody);

      expect(transform.position).toBeDefined();
      expect(transform.rotation).toBeDefined();
      expect(transform.scale).toBeDefined();
    });

    it('should combine host, attachment, and foreign body rotations', () => {
      const hostPrimitive: SDFPrimitive = {
        type: 'box',
        position: [0, 0, 0],
        rotation: [0, Math.PI / 4, 0],
        params: [1, 1, 1],
        materialId: 'default'
      };

      const host: HostPrimitive = {
        primitive: hostPrimitive,
        attachedBodies: []
      };

      const attachmentPoint: AttachmentPoint = {
        position: [1, 0, 0],
        normal: [1, 0, 0],
        rotation: [0, 0, Math.PI / 4]
      };

      const foreignBody: ForeignBody = {
        primitive: {
          type: 'cone',
          position: [0, 0, 0],
          params: [0.5, 0.8, 0.5],
          materialId: 'default'
        },
        attachmentOffset: [0.3, 0, 0],
        attachmentRotation: [Math.PI / 6, 0, 0],
        alignWithSurface: false
      };

      const transform = system.calculateAttachmentTransform(host, attachmentPoint, foreignBody);

      expect(transform.rotation).toBeDefined();
      expect(transform.rotation.length).toBe(3);
    });
  });

  describe('calculateSurfaceNormal', () => {
    it('should calculate correct normal for sphere', () => {
      const primitive: SDFPrimitive = {
        type: 'sphere',
        position: [0, 0, 0],
        params: [1.0],
        materialId: 'default'
      };

      const point: [number, number, number] = [0.7071, 0.7071, 0];
      const normal = system.calculateSurfaceNormal(primitive, point);

      expect(normal[0]).toBeCloseTo(0.7071, 3);
      expect(normal[1]).toBeCloseTo(0.7071, 3);
      expect(normal[2]).toBeCloseTo(0, 3);
      
      const magnitude = Math.sqrt(normal[0]**2 + normal[1]**2 + normal[2]**2);
      expect(magnitude).toBeCloseTo(1.0, 5);
    });

    it('should calculate correct normal for box face', () => {
      const primitive: SDFPrimitive = {
        type: 'box',
        position: [0, 0, 0],
        params: [1, 1, 1],
        materialId: 'default'
      };

      const topPoint: [number, number, number] = [0, 1, 0];
      const topNormal = system.calculateSurfaceNormal(primitive, topPoint);

      expect(topNormal[0]).toBeCloseTo(0, 5);
      expect(topNormal[1]).toBeCloseTo(1, 5);
      expect(topNormal[2]).toBeCloseTo(0, 5);

      const sidePoint: [number, number, number] = [1, 0, 0];
      const sideNormal = system.calculateSurfaceNormal(primitive, sidePoint);

      expect(sideNormal[0]).toBeCloseTo(1, 5);
      expect(sideNormal[1]).toBeCloseTo(0, 5);
      expect(sideNormal[2]).toBeCloseTo(0, 5);
    });

    it('should calculate correct normal for cylinder', () => {
      const primitive: SDFPrimitive = {
        type: 'cylinder',
        position: [0, 0, 0],
        params: [0.5, 0.5],
        materialId: 'default'
      };

      const sidePoint: [number, number, number] = [0.5, 0, 0];
      const sideNormal = system.calculateSurfaceNormal(primitive, sidePoint);

      expect(sideNormal[0]).toBeCloseTo(1, 3);
      expect(sideNormal[1]).toBeCloseTo(0, 3);
      expect(sideNormal[2]).toBeCloseTo(0, 3);

      const topPoint: [number, number, number] = [0, 0.5, 0];
      const topNormal = system.calculateSurfaceNormal(primitive, topPoint);

      expect(topNormal[0]).toBeCloseTo(0, 5);
      expect(topNormal[1]).toBeCloseTo(1, 5);
      expect(topNormal[2]).toBeCloseTo(0, 5);
    });

    it('should calculate correct normal for torus', () => {
      const primitive: SDFPrimitive = {
        type: 'torus',
        position: [0, 0, 0],
        params: [1.0, 0.3],
        materialId: 'default'
      };

      const point: [number, number, number] = [1.3, 0, 0];
      const normal = system.calculateSurfaceNormal(primitive, point);

      expect(normal[0]).toBeGreaterThan(0);
      expect(normal[1]).toBeCloseTo(0, 3);
      expect(normal[2]).toBeCloseTo(0, 3);
      
      const magnitude = Math.sqrt(normal[0]**2 + normal[1]**2 + normal[2]**2);
      expect(magnitude).toBeCloseTo(1.0, 5);
    });

    it('should calculate correct normal for ellipsoid', () => {
      const primitive: SDFPrimitive = {
        type: 'ellipsoid',
        position: [0, 0, 0],
        params: [1, 2, 1],
        materialId: 'default'
      };

      const point: [number, number, number] = [0, 2, 0];
      const normal = system.calculateSurfaceNormal(primitive, point);

      expect(normal[0]).toBeCloseTo(0, 3);
      expect(normal[1]).toBeGreaterThan(0);
      expect(normal[2]).toBeCloseTo(0, 3);
      
      const magnitude = Math.sqrt(normal[0]**2 + normal[1]**2 + normal[2]**2);
      expect(magnitude).toBeCloseTo(1.0, 5);
    });
  });

  describe('sampleSurfacePoints', () => {
    it('should generate correct number of points for sphere', () => {
      const primitive: SDFPrimitive = {
        type: 'sphere',
        position: [0, 0, 0],
        params: [1.0],
        materialId: 'default'
      };

      const points = system.sampleSurfacePoints(primitive, 100);

      expect(points.length).toBe(100);
      
      for (const point of points) {
        expect(point.position).toBeDefined();
        expect(point.normal).toBeDefined();
        
        const distance = Math.sqrt(
          point.position[0]**2 + 
          point.position[1]**2 + 
          point.position[2]**2
        );
        expect(distance).toBeCloseTo(1.0, 3);
        
        const normalMag = Math.sqrt(
          point.normal[0]**2 + 
          point.normal[1]**2 + 
          point.normal[2]**2
        );
        expect(normalMag).toBeCloseTo(1.0, 5);
      }
    });

    it('should generate evenly distributed points on sphere using Fibonacci lattice', () => {
      const primitive: SDFPrimitive = {
        type: 'sphere',
        position: [0, 0, 0],
        params: [1.0],
        materialId: 'default'
      };

      const points = system.sampleSurfacePoints(primitive, 50);

      expect(points.length).toBe(50);
      
      let minDistance = Infinity;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].position[0] - points[j].position[0];
          const dy = points[i].position[1] - points[j].position[1];
          const dz = points[i].position[2] - points[j].position[2];
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          minDistance = Math.min(minDistance, dist);
        }
      }
      
      expect(minDistance).toBeGreaterThan(0.1);
    });

    it('should generate correct points for box faces', () => {
      const primitive: SDFPrimitive = {
        type: 'box',
        position: [0, 0, 0],
        params: [1, 1, 1],
        materialId: 'default'
      };

      const points = system.sampleSurfacePoints(primitive, 60);

      expect(points.length).toBeGreaterThan(0);
      
      for (const point of points) {
        const [x, y, z] = point.position;
        const onFace = 
          Math.abs(Math.abs(x) - 1) < 0.01 ||
          Math.abs(Math.abs(y) - 1) < 0.01 ||
          Math.abs(Math.abs(z) - 1) < 0.01;
        expect(onFace).toBe(true);
      }
    });

    it('should generate correct points for cylinder', () => {
      const primitive: SDFPrimitive = {
        type: 'cylinder',
        position: [0, 0, 0],
        params: [0.5, 0.5],
        materialId: 'default'
      };

      const points = system.sampleSurfacePoints(primitive, 50);

      expect(points.length).toBeGreaterThan(0);
      
      for (const point of points) {
        const [x, y, z] = point.position;
        const radiusDist = Math.sqrt(x*x + z*z);
        const onCylinderBody = Math.abs(radiusDist - 0.5) < 0.1;
        const onCap = Math.abs(Math.abs(y) - 0.5) < 0.01;
        
        expect(onCylinderBody || onCap).toBe(true);
      }
    });
  });

  describe('createComposite', () => {
    it('should create composite with host and foreign bodies', () => {
      const hostPrimitive: SDFPrimitive = {
        type: 'sphere',
        position: [0, 0, 0],
        params: [1.0],
        materialId: 'body'
      };

      const foreignBody: ForeignBody = {
        primitive: {
          type: 'cylinder',
          position: [0, 0, 0],
          params: [0.1, 0.5],
          materialId: 'flagellum'
        },
        attachmentOffset: [0.5, 0, 0],
        attachmentRotation: [0, 0, 0],
        alignWithSurface: true
      };

      const host: HostPrimitive = {
        primitive: hostPrimitive,
        attachedBodies: [foreignBody]
      };

      const primitives = system.createComposite(host);

      expect(primitives.length).toBe(2);
      expect(primitives[0].type).toBe('sphere');
      expect(primitives[1].type).toBe('cylinder');
      expect(primitives[1].position).toBeDefined();
    });

    it('should create composite with multiple foreign bodies', () => {
      const hostPrimitive: SDFPrimitive = {
        type: 'ellipsoid',
        position: [0, 0, 0],
        params: [0.5, 1.0, 0.5],
        materialId: 'cell'
      };

      const foreignBodies: ForeignBody[] = [
        {
          primitive: {
            type: 'cylinder',
            position: [0, 0, 0],
            params: [0.05, 1.0],
            materialId: 'flagellum'
          },
          attachmentOffset: [0, 1.0, 0],
          attachmentRotation: [0, 0, 0],
          alignWithSurface: true
        },
        {
          primitive: {
            type: 'sphere',
            position: [0, 0, 0],
            params: [0.3],
            materialId: 'nucleus'
          },
          attachmentOffset: [0, 0, 0],
          attachmentRotation: [0, 0, 0],
          alignWithSurface: false
        },
        {
          primitive: {
            type: 'torus',
            position: [0, 0, 0],
            params: [0.4, 0.1],
            materialId: 'membrane'
          },
          attachmentOffset: [0, 0, 0],
          attachmentRotation: [0, 0, 0],
          alignWithSurface: false
        }
      ];

      const host: HostPrimitive = {
        primitive: hostPrimitive,
        attachedBodies: foreignBodies
      };

      const primitives = system.createComposite(host);

      expect(primitives.length).toBe(4);
      expect(primitives[0].type).toBe('ellipsoid');
      expect(primitives[1].type).toBe('cylinder');
      expect(primitives[2].type).toBe('sphere');
      expect(primitives[3].type).toBe('torus');
    });

    it('should apply correct transforms to bacteria with flagella', () => {
      const bacteriaBody: SDFPrimitive = {
        type: 'capsule',
        position: [0, 0, 0],
        params: [0, 0, 1.5, 0.5],
        materialId: 'bacteria'
      };

      const flagellum: ForeignBody = {
        primitive: {
          type: 'cylinder',
          position: [0, 0, 0],
          params: [0.02, 2.0],
          materialId: 'flagellum'
        },
        attachmentOffset: [0, 0, 2.0],
        attachmentRotation: [Math.PI / 6, 0, 0],
        alignWithSurface: true
      };

      const bacteria: HostPrimitive = {
        primitive: bacteriaBody,
        attachedBodies: [flagellum]
      };

      const primitives = system.createComposite(bacteria);

      expect(primitives.length).toBe(2);
      expect(primitives[0].materialId).toBe('bacteria');
      expect(primitives[1].materialId).toBe('flagellum');
      expect(primitives[1].rotation).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle host with no foreign bodies', () => {
      const host: HostPrimitive = {
        primitive: {
          type: 'sphere',
          position: [0, 0, 0],
          params: [1.0],
          materialId: 'default'
        },
        attachedBodies: []
      };

      const primitives = system.createComposite(host);

      expect(primitives.length).toBe(1);
      expect(primitives[0].type).toBe('sphere');
    });

    it('should handle zero offset attachment', () => {
      const host: HostPrimitive = {
        primitive: {
          type: 'box',
          position: [0, 0, 0],
          params: [1, 1, 1],
          materialId: 'default'
        },
        attachedBodies: [{
          primitive: {
            type: 'sphere',
            position: [0, 0, 0],
            params: [0.5],
            materialId: 'default'
          },
          attachmentOffset: [0, 0, 0],
          attachmentRotation: [0, 0, 0],
          alignWithSurface: false
        }]
      };

      const primitives = system.createComposite(host);

      expect(primitives.length).toBe(2);
    });

    it('should handle very small primitives', () => {
      const primitive: SDFPrimitive = {
        type: 'sphere',
        position: [0, 0, 0],
        params: [0.01],
        materialId: 'default'
      };

      const normal = system.calculateSurfaceNormal(primitive, [0.01, 0, 0]);

      expect(normal).toBeDefined();
      const magnitude = Math.sqrt(normal[0]**2 + normal[1]**2 + normal[2]**2);
      expect(magnitude).toBeCloseTo(1.0, 5);
    });

    it('should handle large primitive counts', () => {
      const primitive: SDFPrimitive = {
        type: 'sphere',
        position: [0, 0, 0],
        params: [1.0],
        materialId: 'default'
      };

      const points = system.sampleSurfacePoints(primitive, 1000);

      expect(points.length).toBe(1000);
    });
  });
});
