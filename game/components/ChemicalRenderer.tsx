/**
 * CHEMICAL RENDERER - Miniplex-React Integration
 * 
 * Renders chemical entities from the ECS world.
 * Automatically updates when ReactionKineticsSystem modifies bonds.
 */

import { useEntities } from 'miniplex-react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameState } from '../state/GameState';
import periodicTableData from '../../data/PeriodicTableJSON.json';

// Get element visual properties from JSON
// NO FALLBACKS - if element not found, throw error so we know about it
function getElementVisuals(symbol: string) {
  const element = periodicTableData.elements.find((el: any) => el.symbol === symbol);
  if (!element) {
    throw new Error(`BUG: Element ${symbol} not found in periodic table data`);
  }

  // JSON uses "cpk-hex" (with hyphen), ensure # prefix
  const cpkHex = (element as any)['cpk-hex'];
  if (!cpkHex) {
    throw new Error(`BUG: Element ${symbol} missing cpk-hex color in periodic table data`);
  }
  const color = cpkHex.startsWith('#') ? cpkHex : `#${cpkHex}`;

  return {
    color,
    metallic: element.name.toLowerCase().includes('metal') ? 0.8 : 0.1,
    roughness: element.name.toLowerCase().includes('metal') ? 0.2 : 0.8,
    radius: Math.max(0.2, (element.atomic_mass || 100) / 200),
    opacity: element.phase === 'Gas' ? 0.6 : 1.0
  };
}

export function ChemicalRenderer() {
  const { world } = useGameState();
  
  if (!world) return null;

  // Get all chemical entities from ECS world - useEntities returns iterable, convert to array
  const chemicalEntitiesIterable = useEntities(world.entities.with('elementCounts', 'position'));
  const chemicalEntities = Array.from(chemicalEntitiesIterable);
  const bondedEntitiesIterable = useEntities(world.entities.with('bondGraph', 'position'));
  const bondedEntities = Array.from(bondedEntitiesIterable);

  return (
    <>
      {/* Render individual atoms/molecules */}
      {chemicalEntities.map((entity) => {
        if (!entity.position || !entity.elementCounts) return null;

        // For atomic entities, render each element type
        if (entity.scale === 'atomic') {
          return Object.entries(entity.elementCounts).map(([symbol, count], index) => {
            const visuals = getElementVisuals(symbol);
            const offset = index * 0.5;
            
            return (
              <group key={`${entity.entityId}-${symbol}`} position={[
                entity.position.x + offset,
                entity.position.y, 
                entity.position.z
              ]}>
                <mesh>
                  <sphereGeometry args={[visuals.radius, 32, 32]} />
                  <meshStandardMaterial
                    color={visuals.color}
                    metalness={visuals.metallic}
                    roughness={visuals.roughness}
                    transparent={visuals.opacity < 1}
                    opacity={visuals.opacity}
                  />
                </mesh>
                <Text
                  position={[0, visuals.radius + 0.3, 0]}
                  fontSize={0.15}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                >
                  {symbol}
                  {count > 1 && `₂`}
                </Text>
              </group>
            );
          });
        }

        // For molecular entities, render as compound
        return (
          <group key={entity.entityId} position={[entity.position.x, entity.position.y, entity.position.z]}>
            <mesh>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color="#88ff88" />
            </mesh>
            <Text
              position={[0, 0.6, 0]}
              fontSize={0.12}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              MOLECULE
            </Text>
          </group>
        );
      })}

      {/* Render chemical bonds */}
      {bondedEntities.map((entity) => {
        if (!entity.position || !entity.bondGraph) return null;

        return entity.bondGraph.map((bondId, index) => {
          // Simple bond visualization - can be enhanced
          const bondLength = 1.0;
          const bondThickness = 0.05;
          
          return (
            <group key={`${entity.entityId}-bond-${index}`} position={[
              entity.position.x,
              entity.position.y + index * 0.2,
              entity.position.z
            ]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[bondThickness, bondThickness, bondLength, 8]} />
                <meshStandardMaterial color="#ffffff" emissive="#004444" />
              </mesh>
            </group>
          );
        });
      })}
    </>
  );
}