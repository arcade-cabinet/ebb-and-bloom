/**
 * Evolution Observer - Fixed camera for watching evolution simulation
 * No player input, just observation of creature evolution over time
 */

import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gameClock, type GameTime, type EvolutionEvent } from '../systems/GameClock';
import { log } from '../utils/Logger';

const EvolutionObserver: React.FC = () => {
  const { camera } = useThree();
  const observationRadius = useRef(0);
  const observationHeight = useRef(50);
  const rotationSpeed = useRef(0.1);
  
  useEffect(() => {
    log.info('EvolutionObserver initialized - Fixed scene observation mode');
    
    // Position camera for good overview of evolution area
    camera.position.set(0, 50, 100);
    camera.lookAt(0, 0, 0);
    
    // Subscribe to evolution events for camera reactions
    const unsubscribeEvents = gameClock.onEvolutionEvent((event: EvolutionEvent) => {
      handleEvolutionEvent(event);
    });
    
    // Subscribe to time updates for periodic camera movements
    const unsubscribeTime = gameClock.onTimeUpdate((time: GameTime) => {
      handleTimeUpdate(time);
    });
    
    return () => {
      unsubscribeEvents();
      unsubscribeTime();
    };
  }, [camera]);
  
  const handleEvolutionEvent = (event: EvolutionEvent) => {
    log.info('Observer reacting to evolution event', event);
    
    // Camera reactions to significant events
    switch (event.eventType) {
      case 'speciation':
        // Zoom in on speciation events
        observationHeight.current = 30;
        rotationSpeed.current = 0.05; // Slower for detailed observation
        break;
        
      case 'pack_formation':
        // Move to observe pack behavior
        rotationSpeed.current = 0.2; // Faster rotation to see pack dynamics
        break;
        
      case 'extinction':
        // Pull back for overview
        observationHeight.current = 80;
        break;
        
      default:
        // Normal observation
        observationHeight.current = 50;
        rotationSpeed.current = 0.1;
    }
  };
  
  const handleTimeUpdate = (time: GameTime) => {
    // Log generation progress
    if (time.generation > 0 && Math.floor(time.generationProgress * 10) === 0) {
      log.debug('Generation progress', {
        generation: time.generation,
        progress: `${(time.generationProgress * 100).toFixed(1)}%`,
        eventsThisGeneration: time.evolutionEvents.filter(e => e.generation === time.generation).length
      });
    }
  };
  
  useFrame((state, delta) => {
    try {
      // Update game clock
      const currentTime = gameClock.update();
      
      // Smooth camera movement for observation
      const targetHeight = observationHeight.current;
      const currentHeight = camera.position.y;
      camera.position.y += (targetHeight - currentHeight) * 0.02;
      
      // Gentle orbital movement for better observation angles
      observationRadius.current += rotationSpeed.current * delta;
      const radius = 100;
      
      camera.position.x = Math.sin(observationRadius.current) * radius;
      camera.position.z = Math.cos(observationRadius.current) * radius;
      
      // Always look at the center of evolution activity
      camera.lookAt(0, 0, 0);
      
    } catch (error) {
      log.error('EvolutionObserver update failed', error);
    }
  });
  
  return null;
};

export default EvolutionObserver;