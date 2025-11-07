/**
 * Evolution UI - Main interface displaying evolutionary ecosystem in action
 * Clean information hierarchy with evolution visualization
 */

import React, { useEffect, useState } from 'react';
import { useEntities } from 'miniplex-react';
import { gameClock } from '../systems/GameClock';
import { useEvolutionDataStore } from '../stores/EvolutionDataStore';
import TraitEvolutionDisplay from './TraitEvolutionDisplay';
import NarrativeDisplay from './NarrativeDisplay';
import type { EvolutionEvent } from '../systems/GameClock';

// Clean information hierarchy for evolution display
const GenerationDisplay = () => {
  const [currentTime, setCurrentTime] = useState(gameClock.getCurrentTime());
  
  useEffect(() => {
    const unsubscribe = gameClock.onTimeUpdate((time) => {
      setCurrentTime(time);
    });
    
    return unsubscribe;
  }, []);
  
  return (
    <div className="evolution-card fixed top-4 right-4 z-50">
      <div className="generation-counter text-xl font-mono">
        Generation {currentTime.generation}
      </div>
      <div className="w-48 bg-base-200 rounded-full h-2 mt-2">
        <div 
          className="trait-fill h-full rounded-full transition-all duration-1000"
          style={{ width: `${currentTime.generationProgress * 100}%` }}
        />
      </div>
      <div className="text-xs text-echo-silver-600 mt-1">
        {Math.floor(currentTime.generationProgress * 100)}% complete
      </div>
      <div className="text-xs text-echo-silver-600">
        Events: {currentTime.evolutionEvents.length}
      </div>
    </div>
  );
};

// Advanced creature evolution display with Spore-inspired trait visualization
const CreatureEvolutionDisplay = () => {
  const creatures = useEntities('creature', 'transform');
  const [selectedCreature, setSelectedCreature] = useState<any>(null);
  
  return (
    <>
      <div className="fixed bottom-20 left-4 z-50 max-w-sm">
        <div className="evolution-card">
          <h3 className="font-display font-bold text-bloom-emerald-600 mb-3">
            Active Creatures ({creatures.entities.length})
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {creatures.entities.slice(0, 6).map((creature, index) => (
              <TraitEvolutionDisplay
                key={index}
                creature={creature}
                onSelect={() => setSelectedCreature(creature)}
              />
            ))}
            {creatures.entities.length === 0 && (
              <div className="text-echo-silver-600 text-sm italic">
                No creatures detected. Ecosystem initializing...
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Selected creature detailed view */}
      {selectedCreature && (
        <div className="fixed inset-0 bg-base-100/90 backdrop-blur-sm z-60 flex items-center justify-center">
          <div className="evolution-card max-w-lg mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-display text-xl text-trait-gold-600">
                Creature Analysis
              </h3>
              <button 
                onClick={() => setSelectedCreature(null)}
                className="btn btn-ghost btn-sm"
              >
                ✕
              </button>
            </div>
            
            <TraitEvolutionDisplay creature={selectedCreature} />
            
            <div className="mt-4 pt-4 border-t border-echo-silver-300">
              <button 
                onClick={() => {
                  // Would trigger camera focus on this creature
                  console.log('Focus camera on creature:', selectedCreature);
                }}
                className="btn btn-primary w-full mobile-touch-target"
              >
                Focus Camera
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Real-time evolution event feed
const EvolutionEventFeed = () => {
  const [recentEvents, setRecentEvents] = useState<EvolutionEvent[]>([]);
  
  useEffect(() => {
    const unsubscribe = gameClock.onEvolutionEvent((event) => {
      setRecentEvents(prev => [...prev.slice(-4), event]); // Keep last 5 events
    });
    
    return unsubscribe;
  }, []);
  
  return (
    <div className="fixed top-4 left-4 z-50 max-w-md">
      <div className="evolution-card">
        <h3 className="font-display font-bold text-trait-gold-600 mb-3">
          Evolution Events
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {recentEvents.map((event, index) => (
            <div 
              key={index}
              className={`p-2 rounded-lg border transition-all duration-500 animate-trait-emerge ${
                event.significance > 0.7 
                  ? 'evolution-card--significant' 
                  : 'bg-base-200/50 border-echo-silver-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="font-semibold text-sm capitalize">
                  {event.eventType.replace('_', ' ')}
                </div>
                <div className="text-xs text-echo-silver-600">
                  Gen {event.generation}
                </div>
              </div>
              <div className="text-xs text-base-content/80 mt-1">
                {event.description}
              </div>
              {event.affectedCreatures.length > 0 && (
                <div className="text-xs text-echo-silver-600 mt-1">
                  Affects: {event.affectedCreatures.length} creature(s)
                </div>
              )}
            </div>
          ))}
          {recentEvents.length === 0 && (
            <div className="text-echo-silver-600 text-sm italic">
              Awaiting evolution events...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Environmental status display
const EnvironmentalStatus = () => {
  const [ecosystemState, setEcosystemState] = useState<any>(null);
  
  // Would connect to EnvironmentalPressureSystem in production
  useEffect(() => {
    const updateInterval = setInterval(() => {
      // Simulate environmental data
      setEcosystemState({
        globalPollution: Math.random() * 0.3,
        activeSources: Math.floor(Math.random() * 5),
        refugeAreas: 3 + Math.floor(Math.random() * 3)
      });
    }, 5000);
    
    return () => clearInterval(updateInterval);
  }, []);
  
  if (!ecosystemState) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="evolution-card">
        <h3 className="font-display font-bold text-ebb-indigo-600 mb-3">
          Environment
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Pollution</span>
            <div className={`pollution-indicator ${
              ecosystemState.globalPollution > 0.4 ? 'animate-pulse' : ''
            }`}>
              {(ecosystemState.globalPollution * 100).toFixed(0)}%
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Active Sources</span>
            <span className="font-mono text-sm">{ecosystemState.activeSources}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Refuge Areas</span>
            <div className="clean-zone-indicator">
              {ecosystemState.refugeAreas}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Pack dynamics visualization
const PackDynamicsDisplay = () => {
  // Would integrate with PackSocialSystem in production
  const [packData, setPackData] = useState<any[]>([]);
  
  useEffect(() => {
    // Simulate pack formation data
    setPackData([
      { id: 'pack_1', type: 'family_group', members: 4, cohesion: 0.8, territory: 25 },
      { id: 'pack_2', type: 'hunting_pack', members: 6, cohesion: 0.9, territory: 40 }
    ]);
  }, []);
  
  return (
    <div className="fixed top-20 right-4 z-40 max-w-xs">
      {packData.map((pack, index) => (
        <div key={pack.id} className="evolution-card mb-2 animate-pack-form">
          <div className="font-semibold text-sm text-bloom-emerald-600">
            {pack.type.replace('_', ' ').toUpperCase()}
          </div>
          <div className="text-xs text-echo-silver-600 mt-1">
            {pack.members} members • {pack.territory}m territory
          </div>
          <div className="trait-bar mt-2">
            <div 
              className="trait-fill" 
              style={{ width: `${pack.cohesion * 100}%` }}
            />
          </div>
          <div className="text-xs text-echo-silver-600 mt-1">
            Cohesion: {(pack.cohesion * 100).toFixed(0)}%
          </div>
        </div>
      ))}
    </div>
  );
};

// Main evolution UI container
const EvolutionUI = () => {
  return (
    <>
      {/* Generation progress (top-right) */}
      <GenerationDisplay />
      
      {/* Evolution events feed (top-left) */}
      <EvolutionEventFeed />
      
      {/* Advanced creature display with trait visualization (bottom-left) */}
      <CreatureEvolutionDisplay />
      
      {/* Environmental status (bottom-right) */}
      <EnvironmentalStatus />
      
      {/* Pack dynamics (top-right below generation) */}
      <PackDynamicsDisplay />
      
      {/* Narrative system - haikus and storytelling */}
      <NarrativeDisplay />
      
      {/* Mobile-friendly controls overlay */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-base-100/90 to-transparent">
        <div className="flex justify-center space-x-4">
          <button className="haptic-button mobile-touch-target">
            <span className="text-sm">👁️ Observe</span>
          </button>
          <button className="haptic-button mobile-touch-target">
            <span className="text-sm">🧬 Influence</span>
          </button>
          <button className="haptic-button mobile-touch-target">
            <span className="text-sm">📊 Analyze</span>
          </button>
        </div>
        
        <div className="text-center mt-2 text-xs text-echo-silver-600 font-mono">
          Spore-style camera: Pinch zoom • Drag orbit • Double-tap reset
        </div>
      </div>
    </>
  );
};

export default EvolutionUI;