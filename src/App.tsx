import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { getWorld, initializeYuka } from './world/ECSWorld';
import TextureSystem, { TextureContext } from './systems/TextureSystem';
import EcosystemFoundation from './systems/EcosystemFoundation';
import { gameClock } from './systems/GameClock';
import { useGenerationLogger } from './stores/EvolutionDataStore';
import { log, initializeLogging } from './utils/Logger';
import { usePlatformEvents } from './hooks/usePlatformEvents';
import { useResponsiveScene } from './hooks/useResponsiveScene';
import { WorldProvider } from './contexts/WorldContext';
import { CreatureCategory } from './systems/CreatureArchetypeSystem';
import * as THREE from 'three';

// Components
import TerrainRenderer from './components/TerrainRenderer';
import CreatureRenderer from './components/CreatureRenderer';
import BuildingRenderer from './components/BuildingRenderer';
import EvolutionUI from './components/EvolutionUI';
import CatalystCreator, { type TraitAllocation } from './components/CatalystCreator';
import OnboardingFlow from './components/OnboardingFlow';
import { SporeStyleCamera } from './systems/SporeStyleCameraSystem';

// Initialize complete ecosystem
const world = getWorld();
const textureSystem = new TextureSystem(world);
const ecosystem = new EcosystemFoundation(world, textureSystem);

// Main Scene with organized systems
const Scene: React.FC = () => {
  const initialized = useRef(false);
  const { logGeneration, logEvent } = useGenerationLogger();
  
  // Initialize platform event listeners
  usePlatformEvents();
  
  // Responsive scene adaptation
  useResponsiveScene();
  
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    const initializeWorld = async () => {
      try {
        log.info('Initializing complete Ebb & Bloom ecosystem - PRODUCTION MODE');
        
        // PRODUCTION GATE: Initialize texture system first (required)
        try {
          await textureSystem.initialize();
        } catch (error) {
          // Show user-friendly error in UI
          const errorMessage = error instanceof Error ? error.message : 'Texture system initialization failed';
          log.error('PRODUCTION BLOCKER: Texture system failed', error);
          
          // Display error to user (would show in UI)
          alert(`Game cannot start:\n\n${errorMessage}\n\nPlease run: pnpm setup:textures`);
          throw error; // Stop initialization
        }
        
        // Initialize Yuka
        initializeYuka();
        
        // Initialize complete ecosystem foundation (requires textures)
        await ecosystem.initialize();
        
        // Start evolution simulation
        ecosystem.start();
        
        // Create comprehensive test scenarios
        log.info('Setting up complete evolution test scenarios...');
        
        // Test 1: Tool-use evolution with building proximity
        ecosystem.requestEvolutionTest(
          'tool_use_evolution',
          [0.1, 0.2, 0.8, 0.6, 0.9, 0.3, 0.4, 0.2, 0.5, 0.3], // High manipulation traits
          CreatureCategory.SMALL_FORAGER,
          new THREE.Vector3(-50, 2, -50)
        );
        
        // Test 2: Social coordination with pack formation
        ecosystem.requestEvolutionTest(
          'social_evolution',
          [0.3, 0.4, 0.2, 0.9, 0.5, 0.7, 0.8, 0.3, 0.4, 0.6], // High social traits
          CreatureCategory.MEDIUM_GRAZER,
          new THREE.Vector3(60, 2, 60)
        );
        
        // Test 3: Environmental adaptation
        ecosystem.requestEvolutionTest(
          'pollution_resistance',
          [0.5, 0.3, 0.4, 0.2, 0.6, 0.7, 0.8, 0.9, 0.8, 0.4], // High resistance traits
          CreatureCategory.SMALL_FORAGER,
          new THREE.Vector3(0, 2, -80)
        );
        
        // Generate a small settlement for building interaction testing
        log.info('Generating test settlement...');
        // Would call buildingSystem.generateSettlement() here
        
        log.info('Complete ecosystem initialization finished');
        
        // Set up generation logging
        gameClock.onTimeUpdate((time) => {
          if (time.generation > 0 && time.generationProgress < 0.1) {
            // Log generation snapshot to persistent storage
            const ecosystemState = ecosystem.getCurrentEcosystemState();
            
            const snapshot = {
              generation: time.generation,
              timestamp: new Date().toISOString(),
              gameTime: time,
              ecosystemState,
              populationStats: { totalPopulation: ecosystemState.totalCreatures, carryingCapacity: 100, birthRate: 0, deathRate: 0, populationPressure: ecosystemState.populationPressure, averageAge: 0, generationTurnover: 0 },
              creatures: [],  // Would extract from ECS
              materials: [],  // Would extract from ECS  
              evolutionEvents: time.evolutionEvents,
              significantChanges: []
            };
            
            logGeneration(snapshot);
          }
        });
        
        // Set up evolution event logging
        gameClock.onEvolutionEvent((event) => {
          logEvent(event);
        });
        
      } catch (error) {
        log.error('Ecosystem initialization failed', error);
      }
    };
    
    initializeWorld();
  }, []);
  
  return (
    <>
      {/* Lighting setup */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[100, 200, 50]} 
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={500}
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
      />
      
      {/* Atmospheric fog for depth */}
      <fog attach="fog" args={[0xcccccc, 100, 1500]} />
      
      {/* World renderers */}
      <TerrainRenderer />
      <CreatureRenderer />
      <BuildingRenderer />
      
      {/* Spore-style dynamic third-person camera */}
      <SporeStyleCamera />
    </>
  );
};

// Ecosystem Update Loop
const EcosystemUpdater: React.FC = () => {
  useEffect(() => {
    const updateEcosystem = () => {
      try {
        const deltaTime = 1/60; // Fixed timestep
        
        // Update complete ecosystem
        ecosystem.update(deltaTime);
        
        requestAnimationFrame(updateEcosystem);
        
      } catch (error) {
        log.error('Ecosystem update failed', error);
      }
    };
    
    updateEcosystem();
  }, []);
  
  return null;
};

// Main App with proper architecture
const App: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showCatalyst, setShowCatalyst] = useState(false);
  
  useEffect(() => {
    initializeLogging();
    log.info('Ebb & Bloom starting with organized architecture');
    log.info('React Three Fiber + Miniplex + texture system + creature AI');
    
    // Check if player has completed onboarding before
    const hasCompletedOnboarding = localStorage.getItem('ebb-bloom-onboarding-complete');
    if (hasCompletedOnboarding === 'true') {
      setShowOnboarding(false);
      setShowCatalyst(false);
    }
  }, []);
  
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setShowCatalyst(true);
    localStorage.setItem('ebb-bloom-onboarding-complete', 'true');
  };
  
  const handleCatalystComplete = (traits: TraitAllocation) => {
    setShowCatalyst(false);
    log.info('Player catalyst created', { traits });
    
    // TODO: Use traits to influence initial creature generation
    // Store in localStorage for persistence
    localStorage.setItem('ebb-bloom-player-traits', JSON.stringify(traits));
  };
  
  const handleSkipOnboarding = () => {
    setShowOnboarding(false);
    setShowCatalyst(false);
    localStorage.setItem('ebb-bloom-onboarding-complete', 'true');
  };
  
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      {/* Onboarding Flow */}
      {showOnboarding && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}
      
      {/* Catalyst Creator */}
      {showCatalyst && (
        <CatalystCreator 
          onComplete={handleCatalystComplete}
          onSkip={handleSkipOnboarding}
        />
      )}
      
      <WorldProvider world={world} ecosystem={ecosystem}>
        <TextureContext.Provider value={textureSystem}>
          <Canvas
              shadows
              camera={{ fov: 75, near: 0.1, far: 2000, position: [0, 5, 0] }}
              gl={{ 
                antialias: true,
                powerPreference: 'high-performance',
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.2
              }}
              onError={(error) => log.error('Canvas error', error)}
            onCreated={({ gl, camera }) => {
              log.info('Canvas created successfully', {
                renderer: gl.info.render,
                camera: camera.position.toArray()
              });
            }}
            >
              <Scene />
              <EcosystemUpdater />
            </Canvas>
            
            {/* Evolution UI overlay with clean information display */}
            <EvolutionUI />
        </TextureContext.Provider>
      </WorldProvider>
    </div>
  );
};

export default App;