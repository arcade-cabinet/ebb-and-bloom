/**
 * Catalyst Creator - Trait selection interface for player's starting creature
 * Players allocate 10 Evo Points across 10 evolutionary traits
 * Brand: Meditative, contemplative, organic flowing UI
 */

import React, { useState } from 'react';
import { log } from '../utils/Logger';

export interface TraitAllocation {
  mobility: number;        // Movement speed, agility
  manipulation: number;    // Tool use, grasping ability
  excavation: number;      // Digging, drilling capability
  social: number;          // Pack coordination, communication
  sensing: number;         // Detection, awareness range
  illumination: number;    // Bioluminescence, light emission
  storage: number;         // Carrying capacity
  filtration: number;      // Pollution resistance
  defense: number;         // Armor, protection
  toxicity: number;        // Chemical defense, poison
}

interface CatalystCreatorProps {
  onComplete: (traits: TraitAllocation) => void;
  onSkip?: () => void;
}

const TRAIT_NAMES: (keyof TraitAllocation)[] = [
  'mobility',
  'manipulation',
  'excavation',
  'social',
  'sensing',
  'illumination',
  'storage',
  'filtration',
  'defense',
  'toxicity'
];

const TRAIT_DESCRIPTIONS: Record<keyof TraitAllocation, string> = {
  mobility: 'Movement speed and agility through terrain',
  manipulation: 'Tool use and object grasping ability',
  excavation: 'Digging and drilling into earth/stone',
  social: 'Pack coordination and communication',
  sensing: 'Detection range and environmental awareness',
  illumination: 'Bioluminescence and light emission',
  storage: 'Carrying capacity for resources',
  filtration: 'Resistance to pollution and toxins',
  defense: 'Armor plating and physical protection',
  toxicity: 'Chemical defense and poison production'
};

const TRAIT_ICONS: Record<keyof TraitAllocation, string> = {
  mobility: '🦎',
  manipulation: '✋',
  excavation: '⛏️',
  social: '👥',
  sensing: '👁️',
  illumination: '💡',
  storage: '🎒',
  filtration: '🫁',
  defense: '🛡️',
  toxicity: '☠️'
};

const MAX_EVO_POINTS = 10;
const MAX_TRAIT_VALUE = 5;

const CatalystCreator: React.FC<CatalystCreatorProps> = ({ onComplete, onSkip }) => {
  const [traits, setTraits] = useState<TraitAllocation>({
    mobility: 1,
    manipulation: 1,
    excavation: 1,
    social: 1,
    sensing: 1,
    illumination: 0,
    storage: 1,
    filtration: 1,
    defense: 1,
    toxicity: 0
  });

  const totalAllocated = Object.values(traits).reduce((sum, val) => sum + val, 0);
  const remainingPoints = MAX_EVO_POINTS - totalAllocated;

  const incrementTrait = (trait: keyof TraitAllocation) => {
    if (remainingPoints > 0 && traits[trait] < MAX_TRAIT_VALUE) {
      setTraits({ ...traits, [trait]: traits[trait] + 1 });
    }
  };

  const decrementTrait = (trait: keyof TraitAllocation) => {
    if (traits[trait] > 0) {
      setTraits({ ...traits, [trait]: traits[trait] - 1 });
    }
  };

  const handleComplete = () => {
    if (totalAllocated !== MAX_EVO_POINTS) {
      alert(`Please allocate all ${MAX_EVO_POINTS} Evo Points before continuing.`);
      return;
    }

    log.info('Catalyst traits selected', { traits, totalAllocated });
    onComplete(traits);
  };

  const handleReset = () => {
    setTraits({
      mobility: 1,
      manipulation: 1,
      excavation: 1,
      social: 1,
      sensing: 1,
      illumination: 0,
      storage: 1,
      filtration: 1,
      defense: 1,
      toxicity: 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-ebb-indigo-900/95 backdrop-blur-md flex items-center justify-center">
      <div className="max-w-4xl w-full mx-4 p-8 bg-ebb-indigo-800/90 border border-trait-gold-400/30 rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-trait-gold-300 mb-2">
            Catalyst Creator
          </h1>
          <p className="text-echo-silver-400 text-lg">
            Shape your evolutionary starting point
          </p>
        </div>

        {/* Evo Points Display */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-trait-gold-500/20 border border-trait-gold-400/40 rounded-2xl">
            <span className="text-2xl">⚡</span>
            <div>
              <div className="text-sm text-echo-silver-400">Evo Points Remaining</div>
              <div className={`text-3xl font-bold font-mono ${
                remainingPoints === 0 ? 'text-bloom-emerald-400' : 'text-trait-gold-300'
              }`}>
                {remainingPoints} / {MAX_EVO_POINTS}
              </div>
            </div>
          </div>
        </div>

        {/* Trait Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {TRAIT_NAMES.map((trait) => (
            <div 
              key={trait}
              className="p-4 bg-ebb-indigo-700/50 border border-echo-silver-400/20 rounded-xl hover:border-trait-gold-400/40 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{TRAIT_ICONS[trait]}</span>
                  <div>
                    <div className="font-semibold text-bloom-emerald-300 capitalize">
                      {trait}
                    </div>
                    <div className="text-xs text-echo-silver-500">
                      {TRAIT_DESCRIPTIONS[trait]}
                    </div>
                  </div>
                </div>
                <div className="font-mono text-xl text-trait-gold-300">
                  {traits[trait]}
                </div>
              </div>

              {/* Trait Bar */}
              <div className="w-full bg-ebb-indigo-900/50 rounded-full h-2 mb-3 border border-echo-silver-500/20">
                <div 
                  className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-trait-gold-500 to-bloom-emerald-500"
                  style={{ width: `${(traits[trait] / MAX_TRAIT_VALUE) * 100}%` }}
                />
              </div>

              {/* Increment/Decrement Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => decrementTrait(trait)}
                  disabled={traits[trait] === 0}
                  className="flex-1 px-3 py-2 bg-ebb-indigo-600 hover:bg-ebb-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-echo-silver-300 font-mono transition-all active:scale-95"
                >
                  −
                </button>
                <button
                  onClick={() => incrementTrait(trait)}
                  disabled={remainingPoints === 0 || traits[trait] === MAX_TRAIT_VALUE}
                  className="flex-1 px-3 py-2 bg-bloom-emerald-600 hover:bg-bloom-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-white font-mono transition-all active:scale-95"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-echo-silver-600 hover:bg-echo-silver-500 rounded-xl text-white font-medium transition-all active:scale-95"
          >
            Reset
          </button>
          {onSkip && (
            <button
              onClick={onSkip}
              className="px-6 py-3 bg-ebb-indigo-600 hover:bg-ebb-indigo-500 rounded-xl text-echo-silver-300 font-medium transition-all active:scale-95"
            >
              Skip Tutorial
            </button>
          )}
          <button
            onClick={handleComplete}
            disabled={totalAllocated !== MAX_EVO_POINTS}
            className="px-8 py-3 bg-trait-gold-600 hover:bg-trait-gold-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold transition-all active:scale-95 shadow-lg"
          >
            Begin Evolution
          </button>
        </div>

        {/* Helper Text */}
        <div className="text-center mt-6 text-sm text-echo-silver-500">
          <p>Your choices shape the initial archetype. Evolution will continue from here.</p>
          <p className="mt-1">The "Everything is Squirrels" doctrine ensures all forms emerge organically.</p>
        </div>
      </div>
    </div>
  );
};

export default CatalystCreator;
export type { TraitAllocation };

