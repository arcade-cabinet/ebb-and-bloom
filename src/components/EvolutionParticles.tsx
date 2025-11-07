/**
 * Evolution Particles - Visual feedback for evolutionary events
 * 
 * Particles and glows when creatures evolve, reproduce, or die
 * Brand-aligned colors: Trait Gold for evolution, Bloom Emerald for birth, Pollution Red for death
 */

import { useFrame } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useWorld } from '../contexts/WorldContext';
import type { EvolutionEvent } from '../systems/GameClock';
import { gameClock } from '../systems/GameClock';

interface ParticleEffect {
    position: THREE.Vector3;
    color: THREE.Color;
    lifetime: number;
    maxLifetime: number;
    type: 'evolution' | 'birth' | 'death' | 'significant';
}

const EvolutionParticles: React.FC = () => {
    const { world } = useWorld();
    // Use ref for particle effects to avoid re-renders on every frame
    const effectsRef = useRef<ParticleEffect[]>([]);
    const particlesRef = useRef<THREE.Points>(null);
    const geometryRef = useRef<THREE.BufferGeometry | null>(null);

    // Helper to find entity by ID string
    const findEntityById = (id: string) => {
        const creatures = world.with('creature', 'transform');
        for (const entity of creatures.entities) {
            if (entity.toString() === id) {
                return entity;
            }
        }
        return null;
    };

    // Listen to evolution events - only add particles, don't update state every frame
    useEffect(() => {
        const unsubscribe = gameClock.onEvolutionEvent((event: EvolutionEvent) => {
            // Trigger particle effect at affected creatures
            for (const entityId of event.affectedCreatures) {
                const entity = findEntityById(entityId);
                if (!entity || !entity.transform) continue;

                const effect: ParticleEffect = {
                    position: entity.transform.position.clone(),
                    color: getEventColor(event.eventType),
                    lifetime: 0,
                    maxLifetime: event.significance > 0.7 ? 3.0 : 1.5,
                    type: getEffectType(event.eventType)
                };

                // Add to ref, not state (avoids re-render)
                effectsRef.current.push(effect);
            }
        });

        return unsubscribe;
    }, [world]);

    // Update particles - use refs only, no setState
    useFrame((_, delta) => {
        // Update lifetimes and filter expired particles
        effectsRef.current = effectsRef.current
            .map(effect => ({
                ...effect,
                lifetime: effect.lifetime + delta
            }))
            .filter(effect => effect.lifetime < effect.maxLifetime);

        // Update particle system geometry directly
        if (particlesRef.current && geometryRef.current) {
            const positions = geometryRef.current.attributes.position as THREE.BufferAttribute;
            const colors = geometryRef.current.attributes.color as THREE.BufferAttribute;
            const effects = effectsRef.current;

            // Update positions and colors for active particles
            for (let i = 0; i < Math.min(effects.length, positions.count / 3); i++) {
                const effect = effects[i];
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
            }

            // Clear unused particle slots
            for (let i = effects.length; i < positions.count / 3; i++) {
                positions.setXYZ(i, 0, -1000, 0); // Hide off-screen
                colors.setXYZW(i, 0, 0, 0, 0); // Fully transparent
            }

            positions.needsUpdate = true;
            colors.needsUpdate = true;
        }
    });

    // Create particle geometry - memoize to avoid recreation
    const particleGeometry = React.useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        const maxParticles = 1000;
        const positions = new Float32Array(maxParticles * 3);
        const colors = new Float32Array(maxParticles * 4);

        // Initialize all particles as hidden
        for (let i = 0; i < maxParticles; i++) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = -1000; // Off-screen
            positions[i * 3 + 2] = 0;
            colors[i * 4] = 0;
            colors[i * 4 + 1] = 0;
            colors[i * 4 + 2] = 0;
            colors[i * 4 + 3] = 0; // Fully transparent
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4));
        geometryRef.current = geometry;
        return geometry;
    }, []);

    const particleMaterial = React.useMemo(() => new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    }), []);

    return (
        <points ref={particlesRef} geometry={particleGeometry} material={particleMaterial} />
    );
};

function getEventColor(eventType: EvolutionEvent['eventType']): THREE.Color {
    switch (eventType) {
        case 'trait_emergence':
            // Trait Gold for evolution
            return new THREE.Color(0xD69E2E);

        case 'pack_formation':
            // Bloom Emerald for birth/formation
            return new THREE.Color(0x38A169);

        case 'extinction':
            // Pollution Red for death
            return new THREE.Color(0xE53E3E);

        case 'behavior_shift':
            // Echo Silver for environmental/behavioral
            return new THREE.Color(0xA0AEC0);

        case 'speciation':
            // Bloom Emerald for new species
            return new THREE.Color(0x38A169);

        default:
            // Ebb Indigo for unknown
            return new THREE.Color(0x4A5568);
    }
}

function getEffectType(eventType: EvolutionEvent['eventType']): 'evolution' | 'birth' | 'death' | 'significant' {
    switch (eventType) {
        case 'trait_emergence':
        case 'speciation':
            return 'evolution';
        case 'pack_formation':
            return 'birth';
        case 'extinction':
            return 'death';
        default:
            return 'significant';
    }
}

export default EvolutionParticles;

