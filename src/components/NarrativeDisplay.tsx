/**
 * Narrative Display - Haiku and storytelling integration
 * Shows procedural poetry generated from evolution events
 */

import React, { useState, useEffect } from 'react';
import type { HaikuEntry } from '../systems/HaikuNarrativeSystem';
import { useWorld } from '../contexts/WorldContext';

const NarrativeDisplay = () => {
  const { ecosystem } = useWorld();
  const [currentHaiku, setCurrentHaiku] = useState<HaikuEntry | null>(null);
  const [recentHaikus, setRecentHaikus] = useState<HaikuEntry[]>([]);
  const [showJournal, setShowJournal] = useState(false);
  
  // Connect to real HaikuNarrativeSystem
  useEffect(() => {
    if (!ecosystem) return;
    
    const narrativeSystem = ecosystem.getNarrativeSystem();
    
    // Load recent haikus
    const haikus = narrativeSystem.getRecentHaikus(10);
    setRecentHaikus(haikus);
    
    // Set up listener for new haikus (would need to add event system)
    // For now, poll every 5 seconds
    const updateInterval = setInterval(() => {
      const latestHaikus = narrativeSystem.getRecentHaikus(10);
      if (latestHaikus.length > 0) {
        const latest = latestHaikus[0];
        if (!recentHaikus.find(h => h.timestamp === latest.timestamp)) {
          setRecentHaikus(latestHaikus);
          
          // Show new haiku if significant
          if (latest.significance > 0.6) {
            setCurrentHaiku(latest);
            setTimeout(() => setCurrentHaiku(null), 8000);
          }
        }
      }
    }, 5000);
    
    return () => clearInterval(updateInterval);
  }, [ecosystem, recentHaikus]);
  
  return (
    <>
      {/* Current haiku display - appears center screen */}
      {currentHaiku && (
        <div className="fixed inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="evolution-card max-w-sm mx-4 animate-trait-emerge pointer-events-auto">
            <div className="text-center">
              <div className="font-display text-lg leading-relaxed text-base-content space-y-2">
                {currentHaiku.haiku.map((line, index) => (
                  <div 
                    key={index}
                    className="animate-evolution-pulse"
                    style={{ animationDelay: `${index * 0.8}s` }}
                  >
                    {line}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-xs text-echo-silver-600">
                Generation {currentHaiku.generation} • {currentHaiku.context.eventType.replace('_', ' ')}
              </div>
              
              <div className="mt-2">
                <div 
                  className="w-full h-1 bg-echo-silver-200 rounded"
                  style={{
                    background: `linear-gradient(90deg, 
                      ${currentHaiku.emotionalTone > 0 ? '#38A169' : '#E53E3E'} 0%, 
                      #A0AEC0 ${Math.abs(currentHaiku.emotionalTone) * 100}%)`
                  }}
                />
                <div className="text-xs text-echo-silver-600 mt-1">
                  {currentHaiku.emotionalTone > 0 ? 'Joyful' : 'Melancholy'} tone
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Journal toggle button */}
      <button 
        onClick={() => setShowJournal(!showJournal)}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 haptic-button mobile-touch-target"
      >
        <span className="text-sm">📖 {recentHaikus.length}</span>
      </button>
      
      {/* Haiku journal overlay */}
      {showJournal && (
        <div className="fixed inset-0 bg-base-100/95 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="evolution-container py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl text-trait-gold-600">
                Evolution Journal
              </h2>
              <button 
                onClick={() => setShowJournal(false)}
                className="btn btn-ghost btn-lg"
              >
                ✕
              </button>
            </div>
            
            {/* Journal entries */}
            <div className="evolution-grid">
              {recentHaikus.map((entry, index) => (
                <div 
                  key={index} 
                  className={`evolution-card ${
                    entry.significance > 0.7 ? 'evolution-card--significant' : ''
                  }`}
                >
                  <div className="font-display text-base leading-relaxed space-y-1 mb-3">
                    {entry.haiku.map((line, lineIndex) => (
                      <div key={lineIndex}>{line}</div>
                    ))}
                  </div>
                  
                  <div className="border-t border-echo-silver-300 pt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-echo-silver-600">
                        Gen {entry.generation}
                      </span>
                      <span className="text-echo-silver-600">
                        {entry.context.eventType.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="text-xs text-echo-silver-600">
                      Location: {entry.context.location}
                    </div>
                    
                    {entry.context.involvedCreatures.length > 0 && (
                      <div className="text-xs text-echo-silver-600">
                        Creatures: {entry.context.involvedCreatures.length}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: entry.emotionalTone > 0 ? '#38A169' : '#E53E3E',
                          opacity: Math.abs(entry.emotionalTone)
                        }}
                      />
                      <span className="text-xs text-echo-silver-600">
                        {entry.emotionalTone > 0 ? 'Uplifting' : 'Contemplative'}
                      </span>
                      <span className="text-xs text-trait-gold-600">
                        {(entry.significance * 100).toFixed(0)}% significant
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {recentHaikus.length === 0 && (
              <div className="text-center text-echo-silver-600 mt-12">
                <div className="font-display text-xl mb-2">No journal entries yet</div>
                <div className="text-sm">
                  Evolution events will generate haikus to capture significant moments
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NarrativeDisplay;