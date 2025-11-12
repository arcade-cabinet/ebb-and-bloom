/**
 * FOREIGN BODY SYSTEM (Phase 0.4)
 * 
 * Enables attachment of foreign primitives to specific coordinates on host primitives.
 * Supports "squirrel = body + legs + tail" composite construction.
 */

import { SDFPrimitive } from './types';
import * as THREE from 'three';

export interface AttachmentPoint {
  position: [number, number, number];
  normal: [number, number, number];
  rotation?: [number, number, number];
  region?: 'all' | 'top' | 'bottom' | 'sides' | 'front' | 'back' | 'left' | 'right';
}

export interface ForeignBody {
  primitive: SDFPrimitive;
  attachmentOffset: [number, number, number];
  attachmentRotation: [number, number, number];
  alignWithSurface: boolean;
}

export interface HostPrimitive {
  primitive: SDFPrimitive;
  attachedBodies: ForeignBody[];
}

export interface AttachmentTransform {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export class ForeignBodySystem {
  calculateAttachmentTransform(
    host: HostPrimitive,
    attachmentPoint: AttachmentPoint,
    foreignBody: ForeignBody
  ): AttachmentTransform {
    const hostPos = new THREE.Vector3(...host.primitive.position);
    const attachPos = new THREE.Vector3(...attachmentPoint.position);
    const normal = new THREE.Vector3(...attachmentPoint.normal).normalize();
    
    const offset = new THREE.Vector3(...foreignBody.attachmentOffset);
    
    const finalPosition = hostPos.clone().add(attachPos).add(offset);
    
    let rotation: [number, number, number] = [0, 0, 0];
    
    if (foreignBody.alignWithSurface) {
      rotation = this.calculateSurfaceAlignedRotation(normal, attachmentPoint.rotation);
    } else if (attachmentPoint.rotation) {
      rotation = attachmentPoint.rotation;
    }
    
    const hostRotation = host.primitive.rotation || [0, 0, 0];
    const foreignRotation = foreignBody.attachmentRotation;
    rotation = this.combineRotations(rotation, hostRotation, foreignRotation);
    
    const scale = foreignBody.primitive.scale || [1, 1, 1];
    
    return {
      position: [finalPosition.x, finalPosition.y, finalPosition.z],
      rotation,
      scale
    };
  }

  private calculateSurfaceAlignedRotation(
    normal: THREE.Vector3,
    additionalRotation?: [number, number, number]
  ): [number, number, number] {
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(up, normal);
    
    if (additionalRotation) {
      const additionalQuat = new THREE.Euler(...additionalRotation).toVector3();
      const rotQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(...additionalRotation));
      quaternion.multiply(rotQuat);
    }
    
    const euler = new THREE.Euler().setFromQuaternion(quaternion);
    return [euler.x, euler.y, euler.z];
  }

  private combineRotations(
    baseRotation: [number, number, number],
    hostRotation: [number, number, number],
    foreignRotation: [number, number, number]
  ): [number, number, number] {
    const q1 = new THREE.Quaternion().setFromEuler(new THREE.Euler(...baseRotation));
    const q2 = new THREE.Quaternion().setFromEuler(new THREE.Euler(...hostRotation));
    const q3 = new THREE.Quaternion().setFromEuler(new THREE.Euler(...foreignRotation));
    
    const combined = q1.multiply(q2).multiply(q3);
    const euler = new THREE.Euler().setFromQuaternion(combined);
    
    return [euler.x, euler.y, euler.z];
  }

  calculateSurfaceNormal(
    primitive: SDFPrimitive,
    localPoint: [number, number, number]
  ): [number, number, number] {
    const p = new THREE.Vector3(...localPoint);
    
    switch (primitive.type) {
      case 'sphere':
        return this.sphereNormal(p, primitive.params[0]);
      case 'box':
        return this.boxNormal(p, primitive.params.slice(0, 3) as [number, number, number]);
      case 'cylinder':
        return this.cylinderNormal(p, primitive.params[0], primitive.params[1]);
      case 'torus':
        return this.torusNormal(p, primitive.params[0], primitive.params[1]);
      case 'cone':
        return this.coneNormal(p, primitive.params[0], primitive.params[1], primitive.params[2]);
      case 'pyramid':
        return this.pyramidNormal(p, primitive.params[0]);
      case 'ellipsoid':
        return this.ellipsoidNormal(p, primitive.params.slice(0, 3) as [number, number, number]);
      case 'capsule':
        return this.capsuleNormal(
          p,
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(primitive.params[0], primitive.params[1], primitive.params[2]),
          primitive.params[3]
        );
      default:
        return this.numericalNormal(primitive, localPoint);
    }
  }

  private sphereNormal(p: THREE.Vector3, radius: number): [number, number, number] {
    const normal = p.clone().normalize();
    return [normal.x, normal.y, normal.z];
  }

  private boxNormal(p: THREE.Vector3, size: [number, number, number]): [number, number, number] {
    const d = new THREE.Vector3(
      Math.abs(p.x) - size[0],
      Math.abs(p.y) - size[1],
      Math.abs(p.z) - size[2]
    );
    
    const maxComponent = Math.max(d.x, d.y, d.z);
    
    if (Math.abs(d.x - maxComponent) < 0.001) {
      return [Math.sign(p.x), 0, 0];
    } else if (Math.abs(d.y - maxComponent) < 0.001) {
      return [0, Math.sign(p.y), 0];
    } else {
      return [0, 0, Math.sign(p.z)];
    }
  }

  private cylinderNormal(p: THREE.Vector3, height: number, radius: number): [number, number, number] {
    const radialDist = Math.sqrt(p.x * p.x + p.z * p.z);
    const verticalDist = Math.abs(p.y) - height;
    
    if (verticalDist > radialDist - radius) {
      return [0, Math.sign(p.y), 0];
    } else {
      const normal = new THREE.Vector3(p.x, 0, p.z).normalize();
      return [normal.x, 0, normal.z];
    }
  }

  private torusNormal(p: THREE.Vector3, majorRadius: number, minorRadius: number): [number, number, number] {
    const q = new THREE.Vector2(
      Math.sqrt(p.x * p.x + p.z * p.z) - majorRadius,
      p.y
    );
    
    const angle = Math.atan2(p.z, p.x);
    const torusCenter = new THREE.Vector3(
      Math.cos(angle) * majorRadius,
      0,
      Math.sin(angle) * majorRadius
    );
    
    const normal = p.clone().sub(torusCenter).normalize();
    return [normal.x, normal.y, normal.z];
  }

  private coneNormal(p: THREE.Vector3, sinAngle: number, cosAngle: number, height: number): [number, number, number] {
    const eps = 0.001;
    return this.numericalNormalAtPoint(p, eps, (point) => {
      const h = height;
      const c = new THREE.Vector2(sinAngle / cosAngle, -1.0);
      const q = new THREE.Vector2(h * c.x / c.y, -1.0);
      const w = new THREE.Vector2(Math.sqrt(point.x * point.x + point.z * point.z), point.y);
      
      const a = w.clone().sub(q.clone().multiplyScalar(
        Math.max(0, Math.min(1, w.dot(q) / q.dot(q)))
      ));
      const b = w.clone().sub(q.clone().multiplyScalar(
        Math.max(0, Math.min(1, w.x / q.x))
      ).multiply(new THREE.Vector2(1, 1)));
      
      const k = Math.sign(q.y);
      const d = Math.min(a.dot(a), b.dot(b));
      const s = Math.max(k * (w.x * q.y - w.y * q.x), k * (w.y - q.y));
      
      return Math.sqrt(d) * Math.sign(s);
    });
  }

  private pyramidNormal(p: THREE.Vector3, height: number): [number, number, number] {
    const eps = 0.001;
    return this.numericalNormalAtPoint(p, eps, (point) => {
      const m2 = height * height + 0.25;
      const px = Math.abs(point.x);
      const pz = Math.abs(point.z);
      const p2 = pz > px ? new THREE.Vector3(pz, point.y, px) : new THREE.Vector3(px, point.y, pz);
      const p3 = new THREE.Vector3(p2.x - 0.5, p2.y, p2.z - 0.5);
      
      const q = new THREE.Vector3(
        p3.z,
        height * p3.y - 0.5 * p3.x,
        height * p3.x + 0.5 * p3.y
      );
      
      const s = Math.max(-q.x, 0.0);
      const t = Math.max(0, Math.min(1, (q.y - 0.5 * p3.z) / (m2 + 0.25)));
      
      const a = m2 * (q.x + s) * (q.x + s) + q.y * q.y;
      const b = m2 * (q.x + 0.5 * t) * (q.x + 0.5 * t) + (q.y - m2 * t) * (q.y - m2 * t);
      
      const d2 = Math.min(q.y, -q.x * m2 - q.y * 0.5) > 0.0 ? 0.0 : Math.min(a, b);
      
      return Math.sqrt((d2 + q.z * q.z) / m2) * Math.sign(Math.max(q.z, -point.y));
    });
  }

  private ellipsoidNormal(p: THREE.Vector3, radii: [number, number, number]): [number, number, number] {
    const r = new THREE.Vector3(...radii);
    const scaled = new THREE.Vector3(
      p.x / (r.x * r.x),
      p.y / (r.y * r.y),
      p.z / (r.z * r.z)
    );
    const normal = scaled.normalize();
    return [normal.x, normal.y, normal.z];
  }

  private capsuleNormal(
    p: THREE.Vector3,
    a: THREE.Vector3,
    b: THREE.Vector3,
    radius: number
  ): [number, number, number] {
    const pa = p.clone().sub(a);
    const ba = b.clone().sub(a);
    const h = Math.max(0, Math.min(1, pa.dot(ba) / ba.dot(ba)));
    const closestPoint = a.clone().add(ba.clone().multiplyScalar(h));
    const normal = p.clone().sub(closestPoint).normalize();
    return [normal.x, normal.y, normal.z];
  }

  private numericalNormal(
    primitive: SDFPrimitive,
    localPoint: [number, number, number]
  ): [number, number, number] {
    const eps = 0.001;
    const p = new THREE.Vector3(...localPoint);
    
    return this.numericalNormalAtPoint(p, eps, (point) => {
      return this.evaluateSDF(primitive, [point.x, point.y, point.z]);
    });
  }

  private numericalNormalAtPoint(
    p: THREE.Vector3,
    eps: number,
    sdfFunc: (p: THREE.Vector3) => number
  ): [number, number, number] {
    const dx = sdfFunc(new THREE.Vector3(p.x + eps, p.y, p.z)) -
              sdfFunc(new THREE.Vector3(p.x - eps, p.y, p.z));
    const dy = sdfFunc(new THREE.Vector3(p.x, p.y + eps, p.z)) -
              sdfFunc(new THREE.Vector3(p.x, p.y - eps, p.z));
    const dz = sdfFunc(new THREE.Vector3(p.x, p.y, p.z + eps)) -
              sdfFunc(new THREE.Vector3(p.x, p.y, p.z - eps));
    
    const normal = new THREE.Vector3(dx, dy, dz).normalize();
    return [normal.x, normal.y, normal.z];
  }

  private evaluateSDF(primitive: SDFPrimitive, point: [number, number, number]): number {
    const p = new THREE.Vector3(...point);
    
    switch (primitive.type) {
      case 'sphere':
        return p.length() - primitive.params[0];
      case 'box': {
        const b = new THREE.Vector3(...primitive.params.slice(0, 3));
        const q = new THREE.Vector3(
          Math.abs(p.x) - b.x,
          Math.abs(p.y) - b.y,
          Math.abs(p.z) - b.z
        );
        return Math.max(q.x, Math.max(q.y, q.z), 0) + 
               new THREE.Vector3(
                 Math.max(q.x, 0),
                 Math.max(q.y, 0),
                 Math.max(q.z, 0)
               ).length();
      }
      default:
        return 0;
    }
  }

  sampleSurfacePoints(
    primitive: SDFPrimitive,
    numPoints: number = 100
  ): AttachmentPoint[] {
    const points: AttachmentPoint[] = [];
    
    switch (primitive.type) {
      case 'sphere':
        return this.sampleSphereSurface(primitive.params[0], numPoints);
      case 'box':
        return this.sampleBoxSurface(
          primitive.params.slice(0, 3) as [number, number, number],
          numPoints
        );
      case 'cylinder':
        return this.sampleCylinderSurface(
          primitive.params[0],
          primitive.params[1],
          numPoints
        );
      default:
        return this.sampleGenericSurface(primitive, numPoints);
    }
  }

  private sampleSphereSurface(radius: number, numPoints: number): AttachmentPoint[] {
    const points: AttachmentPoint[] = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    
    for (let i = 0; i < numPoints; i++) {
      const theta = 2 * Math.PI * i / goldenRatio;
      const phi = Math.acos(1 - 2 * (i + 0.5) / numPoints);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      const normal = new THREE.Vector3(x, y, z).normalize();
      
      points.push({
        position: [x, y, z],
        normal: [normal.x, normal.y, normal.z]
      });
    }
    
    return points;
  }

  private sampleBoxSurface(
    size: [number, number, number],
    numPoints: number
  ): AttachmentPoint[] {
    const points: AttachmentPoint[] = [];
    const pointsPerFace = Math.floor(numPoints / 6);
    
    const faces: Array<{
      normal: [number, number, number];
      u: [number, number, number];
      v: [number, number, number];
      offset: [number, number, number];
    }> = [
      { normal: [0, 1, 0], u: [1, 0, 0], v: [0, 0, 1], offset: [0, size[1], 0] },
      { normal: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1], offset: [0, -size[1], 0] },
      { normal: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1], offset: [size[0], 0, 0] },
      { normal: [-1, 0, 0], u: [0, 1, 0], v: [0, 0, 1], offset: [-size[0], 0, 0] },
      { normal: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0], offset: [0, 0, size[2]] },
      { normal: [0, 0, -1], u: [1, 0, 0], v: [0, 1, 0], offset: [0, 0, -size[2]] }
    ];
    
    for (const face of faces) {
      const sqrtPoints = Math.ceil(Math.sqrt(pointsPerFace));
      
      for (let i = 0; i < sqrtPoints; i++) {
        for (let j = 0; j < sqrtPoints; j++) {
          const u = (i / (sqrtPoints - 1) - 0.5) * 2;
          const v = (j / (sqrtPoints - 1) - 0.5) * 2;
          
          const pos = new THREE.Vector3(
            face.offset[0] + u * size[0] * face.u[0] + v * size[2] * face.v[0],
            face.offset[1] + u * size[0] * face.u[1] + v * size[2] * face.v[1],
            face.offset[2] + u * size[0] * face.u[2] + v * size[2] * face.v[2]
          );
          
          points.push({
            position: [pos.x, pos.y, pos.z],
            normal: face.normal
          });
        }
      }
    }
    
    return points;
  }

  private sampleCylinderSurface(
    height: number,
    radius: number,
    numPoints: number
  ): AttachmentPoint[] {
    const points: AttachmentPoint[] = [];
    const pointsOnBody = Math.floor(numPoints * 0.8);
    const pointsPerCap = Math.floor(numPoints * 0.1);
    
    for (let i = 0; i < pointsOnBody; i++) {
      const theta = (i / pointsOnBody) * 2 * Math.PI;
      const y = ((i % 10) / 10 - 0.5) * 2 * height;
      
      const x = radius * Math.cos(theta);
      const z = radius * Math.sin(theta);
      
      const normal = new THREE.Vector3(x, 0, z).normalize();
      
      points.push({
        position: [x, y, z],
        normal: [normal.x, 0, normal.z]
      });
    }
    
    for (let i = 0; i < pointsPerCap; i++) {
      const r = Math.sqrt(i / pointsPerCap) * radius;
      const theta = (i / pointsPerCap) * 2 * Math.PI * 5;
      
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);
      
      points.push({
        position: [x, height, z],
        normal: [0, 1, 0]
      });
      
      points.push({
        position: [x, -height, z],
        normal: [0, -1, 0]
      });
    }
    
    return points;
  }

  private sampleGenericSurface(
    primitive: SDFPrimitive,
    numPoints: number
  ): AttachmentPoint[] {
    const points: AttachmentPoint[] = [];
    const boundsSize = 2.0;
    const maxAttempts = numPoints * 10;
    let attempts = 0;
    
    while (points.length < numPoints && attempts < maxAttempts) {
      const x = (Math.random() - 0.5) * boundsSize;
      const y = (Math.random() - 0.5) * boundsSize;
      const z = (Math.random() - 0.5) * boundsSize;
      
      const dist = this.evaluateSDF(primitive, [x, y, z]);
      
      if (Math.abs(dist) < 0.1) {
        const normal = this.calculateSurfaceNormal(primitive, [x, y, z]);
        points.push({
          position: [x, y, z],
          normal
        });
      }
      
      attempts++;
    }
    
    return points;
  }

  createComposite(host: HostPrimitive): SDFPrimitive[] {
    const primitives: SDFPrimitive[] = [host.primitive];
    
    for (const foreignBody of host.attachedBodies) {
      const attachmentPoints = this.sampleSurfacePoints(host.primitive, 100);
      
      const selectedPoint = attachmentPoints.length > 0 
        ? attachmentPoints[0]
        : { position: [0, 0, 0] as [number, number, number], normal: [0, 1, 0] as [number, number, number] };
      
      const transform = this.calculateAttachmentTransform(host, selectedPoint, foreignBody);
      
      const transformedPrimitive: SDFPrimitive = {
        ...foreignBody.primitive,
        position: transform.position,
        rotation: transform.rotation,
        scale: transform.scale
      };
      
      primitives.push(transformedPrimitive);
    }
    
    return primitives;
  }
}

export const foreignBodySystem = new ForeignBodySystem();
