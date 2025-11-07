/**
 * Trait Evolution Display - Spore-inspired visual trait progression
 */

import React, { useState, useEffect } from 'react';
import type { EvolutionaryCreature } from '../systems/CreatureArchetypeSystem';

interface TraitDisplayProps {
  creature: any;
  onSelect?: () => void;
}

const TraitEvolutionDisplay: React.FC<TraitDisplayProps> = ({ creature, onSelect }) => {
  const [selectedTrait, setSelectedTrait] = useState<number | null>(null);
  const evolutionData = creature?.evolutionaryCreature as EvolutionaryCreature;
  
  if (!evolutionData || !evolutionData.currentTraits) {
    return null;
  }
  
  const traitNames = [
    'Mobility', 'Manipulation', 'Excavation', 'Social', 'Sensing',
    'Illumination', 'Storage', 'Filtration', 'Defense', 'Toxicity'
  ];
  
  const traitCategories = {
    'physical': [0, 1, 2, 8, 9], // Mobility, Manipulation, Excavation, Defense, Toxicity
    'social': [3, 6],           // Social, Storage  
    'sensory': [4, 5, 7]        // Sensing, Illumination, Filtration
  };
  
  return (
    <div className="creature-display cursor-pointer" onClick={onSelect}>
      {/* Creature identity */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="creature-name">
            {evolutionData.archetype.baseSpecies}
          </div>
          <div className="text-xs text-echo-silver-600">
            Generation {evolutionData.generation} • Age {evolutionData.age.toFixed(1)}
          </div>
        </div>
        <div className="text-xs font-mono text-trait-gold-600">
          ID: {creature.toString().slice(-4)}
        </div>
      </div>
      
      {/* Trait visualization inspired by Spore's creature editor */}
      <div className="space-y-2">
        {Object.entries(traitCategories).map(([category, indices]) => (
          <div key={category} className="border border-echo-silver-300 rounded-lg p-2">
            <div className="text-xs font-semibold text-ebb-indigo-600 mb-2 capitalize">
              {category}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {indices.map(traitIndex => (
                <div 
                  key={traitIndex}
                  className={`relative cursor-pointer ${
                    selectedTrait === traitIndex ? 'glow-trait rounded' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTrait(selectedTrait === traitIndex ? null : traitIndex);
                  }}
                >
                  <div className="text-xs text-base-content/80">
                    {traitNames[traitIndex]}
                  </div>
                  <div className="trait-bar mt-1">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        evolutionData.currentTraits[traitIndex] > 0.7 
                          ? 'trait-fill--emerging' 
                          : 'trait-fill'
                      }`}
                      style={{ width: `${evolutionData.currentTraits[traitIndex] * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-echo-silver-600 text-right">
                    {(evolutionData.currentTraits[traitIndex] * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Evolution history */}
      {evolutionData.mutationHistory && evolutionData.mutationHistory.length > 0 && (
        <div className="mt-3 border-t border-echo-silver-300 pt-2">
          <div className="text-xs text-ebb-indigo-600 mb-1">Recent Mutations</div>
          {evolutionData.mutationHistory.slice(-3).map((mutation, index) => (
            <div key={index} className="text-xs text-echo-silver-600">
              Gen {mutation.generation}: {traitNames[mutation.traitIndex]} 
              {mutation.newValue > mutation.previousValue ? ' ↗' : ' ↘'}
            </div>
          ))}
        </div>
      )}
      
      {/* Pack membership */}
      {evolutionData.packMembership && (
        <div className="mt-2 text-xs text-bloom-emerald-600">
          Pack: {evolutionData.packMembership}
        </div>
      )}
      
      {/* Selected trait detail */}
      {selectedTrait !== null && (
        <div className="fixed inset-0 bg-base-100/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="evolution-card max-w-sm mx-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-display font-bold text-trait-gold-600">
                {traitNames[selectedTrait]}
              </h3>
              <button 
                onClick={() => setSelectedTrait(null)}
                className="btn btn-sm btn-ghost"
              >
                ✕
              </button>
            </div>
            
            <div className="trait-bar h-6 mb-3">
              <div 
                className="trait-fill h-full rounded-full"
                style={{ width: `${evolutionData.currentTraits[selectedTrait] * 100}%` }}
              />
            </div>
            
            <div className="text-base-content/80 mb-4">
              <strong>{(evolutionData.currentTraits[selectedTrait] * 100).toFixed(1)}%</strong> development
            </div>
            
            <div className="text-sm text-base-content/70">
              {getTraitDescription(selectedTrait, evolutionData.currentTraits[selectedTrait])}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Trait description system
const getTraitDescription = (traitIndex: number, value: number): string => {
  const descriptions = [
    { low: 'Basic mobility', medium: 'Enhanced movement', high: 'Exceptional agility' },
    { low: 'Simple grasping', medium: 'Tool manipulation', high: 'Complex construction' },
    { low: 'Surface scratching', medium: 'Deep digging', high: 'Mineral excavation' },
    { low: 'Solitary behavior', medium: 'Pack coordination', high: 'Complex social structures' },
    { low: 'Basic awareness', medium: 'Enhanced sensing', high: 'Predictive detection' },
    { low: 'Dim presence', medium: 'Visible aura', high: 'Brilliant bioluminescence' },
    { low: 'Minimal carrying', medium: 'Expanded storage', high: 'Massive capacity' },
    { low: 'Basic filtering', medium: 'Pollution resistance', high: 'Environmental purification' },
    { low: 'Soft exterior', medium: 'Protective shell', high: 'Armored carapace' },
    { low: 'Passive defense', medium: 'Warning signals', high: 'Active toxin deployment' }
  ];
  
  const desc = descriptions[traitIndex] || { low: 'Unknown', medium: 'Unknown', high: 'Unknown' };
  
  if (value < 0.3) return desc.low;
  if (value < 0.7) return desc.medium;
  return desc.high;
};

export default TraitEvolutionDisplay;