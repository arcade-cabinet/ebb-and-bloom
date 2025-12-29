import { useEffect, useRef } from 'react';
import { useRapier } from '@react-three/rapier';
import { JointData } from '@dimforge/rapier3d-compat';

export type BondType = 'fixed' | 'spherical' | 'revolute' | 'prismatic';

export interface BondDefinition {
  id: string;
  body1: React.RefObject<any>;
  body2: React.RefObject<any>;
  anchor1?: [number, number, number];
  anchor2?: [number, number, number];
  bondType?: BondType;
  axis?: [number, number, number];
  limits?: [number, number];
}

export interface RapierBondsProps {
  bonds: BondDefinition[];
}

export function RapierBonds({ bonds }: RapierBondsProps) {
  const { world } = useRapier();
  const jointsMapRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    return () => {
      for (const joint of jointsMapRef.current.values()) {
        try {
          if (world) {
            world.removeImpulseJoint(joint, true);
          }
        } catch (error) {
          console.warn('[RapierBonds] Failed to remove joint on unmount:', error);
        }
      }
      jointsMapRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!world) return;

    const newBondIds = new Set<string>(bonds.map(b => b.id));
    
    for (const bond of bonds) {
      if (!bond.body1.current || !bond.body2.current) continue;

      const rawBody1 = bond.body1.current.raw();
      const rawBody2 = bond.body2.current.raw();
      
      if (!rawBody1 || !rawBody2) continue;
      
      if (!jointsMapRef.current.has(bond.id)) {
        const anchor1 = bond.anchor1 || [0, 0, 0];
        const anchor2 = bond.anchor2 || [0, 0, 0];
        const bondType = bond.bondType || 'fixed';

        try {
          let jointData;

          switch (bondType) {
            case 'fixed': {
              jointData = JointData.fixed(
                { x: anchor1[0], y: anchor1[1], z: anchor1[2] },
                { x: 0, y: 0, z: 0, w: 1 },
                { x: anchor2[0], y: anchor2[1], z: anchor2[2] },
                { x: 0, y: 0, z: 0, w: 1 }
              );
              break;
            }

            case 'spherical': {
              jointData = JointData.spherical(
                { x: anchor1[0], y: anchor1[1], z: anchor1[2] },
                { x: anchor2[0], y: anchor2[1], z: anchor2[2] }
              );
              break;
            }

            case 'revolute': {
              const axis = bond.axis || [0, 1, 0];
              jointData = JointData.revolute(
                { x: anchor1[0], y: anchor1[1], z: anchor1[2] },
                { x: anchor2[0], y: anchor2[1], z: anchor2[2] },
                { x: axis[0], y: axis[1], z: axis[2] }
              );
              break;
            }

            case 'prismatic': {
              const axis = bond.axis || [0, 1, 0];
              jointData = JointData.prismatic(
                { x: anchor1[0], y: anchor1[1], z: anchor1[2] },
                { x: anchor2[0], y: anchor2[1], z: anchor2[2] },
                { x: axis[0], y: axis[1], z: axis[2] }
              );
              break;
            }
          }

          if (jointData) {
            const jointHandle = world.createImpulseJoint(jointData, rawBody1, rawBody2, true);
            if (bond.limits && (bond.bondType === 'revolute' || bond.bondType === 'prismatic')) {
              (jointHandle as any).setLimits(bond.limits[0], bond.limits[1]);
            }
            jointsMapRef.current.set(bond.id, jointHandle);
          }
        } catch (error) {
          console.warn('[RapierBonds] Failed to create joint:', error);
        }
      }
    }
    
    for (const [id, joint] of jointsMapRef.current.entries()) {
      if (!newBondIds.has(id)) {
        try {
          world.removeImpulseJoint(joint, true);
        } catch (error) {
          console.warn('[RapierBonds] Failed to remove joint:', error);
        }
        jointsMapRef.current.delete(id);
      }
    }
  }, [bonds, world]);

  return null;
}
