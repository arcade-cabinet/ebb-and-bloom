import { useMemo } from 'react';
import { MarchingCubes, MarchingCube } from '@react-three/drei';
import { materialRegistry } from '../sdf/MaterialRegistry';

export interface BlobDefinition {
  position: [number, number, number];
  strength: number;
  materialId: string;
  subtract?: number;
}

export interface MarchingCubesRendererProps {
  blobs: BlobDefinition[];
  resolution?: number;
  enablePhysics?: boolean;
  maxPolyCount?: number;
}

export function MarchingCubesRenderer({
  blobs,
  resolution = 64,
  maxPolyCount = 10000
}: MarchingCubesRendererProps) {
  const groupedBlobs = useMemo(() => {
    const groups = new Map<string, BlobDefinition[]>();
    
    for (const blob of blobs) {
      if (!groups.has(blob.materialId)) {
        groups.set(blob.materialId, []);
      }
      groups.get(blob.materialId)!.push(blob);
    }
    
    return groups;
  }, [blobs]);

  const materials = useMemo(() => {
    const mats = new Map<string, { color: string; roughness: number; metallic: number }>();
    
    for (const materialId of groupedBlobs.keys()) {
      const mat = materialRegistry.get(materialId);
      if (mat) {
        const r = Math.round(mat.baseColor[0] * 255);
        const g = Math.round(mat.baseColor[1] * 255);
        const b = Math.round(mat.baseColor[2] * 255);
        const color = `rgb(${r}, ${g}, ${b})`;
        
        mats.set(materialId, {
          color,
          roughness: mat.roughness,
          metallic: mat.metallic
        });
      } else {
        mats.set(materialId, {
          color: '#888888',
          roughness: 0.5,
          metallic: 0.5
        });
      }
    }
    
    return mats;
  }, [groupedBlobs]);

  return (
    <>
      {Array.from(groupedBlobs.entries()).map(([materialId, blobGroup]) => {
        const material = materials.get(materialId);
        if (!material) return null;
        
        return (
          <MarchingCubes
            key={materialId}
            resolution={resolution}
            maxPolyCount={maxPolyCount}
            enableUvs={false}
            enableColors={false}
          >
            <meshStandardMaterial
              color={material.color}
              roughness={material.roughness}
              metalness={material.metallic}
            />
            
            {blobGroup.map((blob, index) => (
              <MarchingCube
                key={`${materialId}-${index}`}
                position={blob.position}
                strength={blob.strength}
                subtract={blob.subtract || 0}
              />
            ))}
          </MarchingCubes>
        );
      })}
    </>
  );
}
