/**
 * Evolution Particles - Visual feedback for evolutionary events
 * 
 * Particles and glows when creatures evolve, reproduce, or die
 * Brand-aligned colors: Trait Gold for evolution, Bloom Emerald for birth, Pollution Red for death
 */

import React, { useEffect, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWorld } from '../contexts/WorldContext';
import { gameClock } from '../systems/GameClock';
import type { EvolutionEvent } from '../systems/GameClock';

interface ParticleEffect {
  position: THREE.Vector3;
  color: THREE.Color;
  lifetime: number;
  maxLifetime: number;
  type: 'evolution' | 'birth' | 'death' | 'significant';
}

const EvolutionParticles: React.FC = () => {
  const { world } = useWorld();
  const [effects, setEffects] = useState<ParticleEffect[]>([]);
  const particlesRef = useRef<THREE.Points>(null);

  // Listen to evolution events
  useEffect(() => {
    const unsubscribe = gameClock.onEvolutionEvent((event: EvolutionEvent) => {
      // Trigger particle effect at affected creatures
      for (const entity of event.affectedCreatures) {
        if (!entity.transform) continue;

        const effect: ParticleEffect = {
          position: entity.transform.position.clone(),
          color: getEventColor(event.eventType, event.significance),
          lifetime: 0,
          maxLifetime: event.significance > 0.7 ? 3.0 : 1.5,
          type: getEffectType(event.eventType)
        };

        setEffects(prev => [...prev, effect]);
      }
    });

    return unsubscribe;
  }, []);

  // Update particles
  useFrame((_, delta) => {
    setEffects(prev => {
      return prev
        .map(effect => ({
          ...effect,
          lifetime: effect.lifetime + delta
        }))
        .filter(effect => effect.lifetime < effect.maxLifetime);
    });

    // Update particle system
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const colors = particlesRef.current.geometry.attributes.color as THREE.BufferAttribute;

      effects.forEach((effect, i) => {
        if (i * 3 >= positions.count) return;

        // Particle rises and fades
        const progress = effect.lifetime / effect.maxLifetime;
        const y = effect.position.y + progress * 3;

        positions.setXYZ(
          i,
          effect.position.x + (Math.random() - 0.5) * 2,
          y,
          effect.position.z + (Math.random() - 0.5) * 2
        );

        const alpha = 1 - progress;
        colors.setXYZW(i, effect.color.r, effect.color.g, effect.color.b, alpha);
      });

      positions.needsUpdate = true;
      colors.needsUpdate = true;
    }
  });

  // Create particle geometry
  const particleGeometry = new THREE.BufferGeometry();
  const maxParticles = 1000;
  const positions = new Float32Array(maxParticles * 3);
  const colors = new Float32Array(maxParticles * 4);

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 4));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.3,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  return (
    <points ref={particlesRef} geometry={particleGeometry} material={particleMaterial} />
  );
};

function getEventColor(eventType: EvolutionEvent['eventType'], significance: number): THREE.Color {
  switch (eventType) {
    case 'trait_mutation':
    case 'trait_emergence':
      // Trait Gold for evolution
      return new THREE.Color(0xD69E2E);
    
    case 'pack_formation':
      // Bloom Emerald for birth/formation
      return new THREE.Color(0x38A169);
    
    case 'trait_loss':
      // Pollution Red for death
      return new THREE.Color(0xE53E3E);
    
    case 'environmental_shift':
      // Echo Silver for environmental
      return new THREE.Color(0xA0AEC0);
    
    case 'resource_discovery':
      // Bloom Emerald for discovery
      return new THREE.Color(0x38A169);
    
    default:
      // Ebb Indigo for unknown
      return new THREE.Color(0x4A5568);
  }
}

function getEffectType(eventType: EvolutionEvent['eventType']): 'evolution' | 'birth' | 'death' | 'significant' {
  switch (eventType) {
    case 'trait_mutation':
    case 'trait_emergence':
      return 'evolution';
    case 'pack_formation':
      return 'birth';
    case 'trait_loss':
      return 'death';
    default:
      return 'significant';
  }
}

export default EvolutionParticles;

