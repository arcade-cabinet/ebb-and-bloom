/**
 * Onboarding Flow - First-time player experience with gesture tutorials
 * Brand: Meditative, contemplative, evolutionary discovery
 */

import React, { useState } from 'react';
import { log } from '../utils/Logger';

interface OnboardingFlowProps {
  onComplete: () => void;
}

interface OnboardingStep {
  title: string;
  description: string;
  gesture?: string;
  icon: string;
  action?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to Ebb & Bloom',
    description: 'A meditative evolutionary ecosystem where consciousness flows through living forms. You are not a character—you are awareness itself, witnessing the emergence of complexity.',
    icon: '🌱',
    action: 'Begin Journey'
  },
  {
    title: 'Camera: Spore-Style Exploration',
    description: 'Pinch to zoom • Drag to orbit • Double-tap to reset view',
    gesture: 'pinch',
    icon: '📷',
    action: 'Try Camera'
  },
  {
    title: 'Observe: Watch Life Unfold',
    description: 'Tap creatures to see their traits, pack dynamics, and evolutionary history. Your gaze influences their awareness.',
    gesture: 'tap',
    icon: '👁️',
    action: 'Practice Observing'
  },
  {
    title: 'Influence: Guide Evolution',
    description: 'Long-press to nudge evolutionary pressures. Swipe to suggest directions. The ecosystem responds organically, never forced.',
    gesture: 'long-press',
    icon: '🧬',
    action: 'Try Influencing'
  },
  {
    title: 'Analyze: Read the Haikus',
    description: 'Generational haikus capture significant events. They preserve memory across the flowing timeline of life.',
    gesture: 'swipe',
    icon: '📜',
    action: 'Read First Haiku'
  },
  {
    title: 'Everything is Squirrels',
    description: 'All forms—creatures, tools, buildings—emerge from archetypal synthesis. There are no arbitrary distinctions. Everything evolves.',
    icon: '🐿️',
    action: 'Understand'
  },
  {
    title: 'Death is Relocation',
    description: 'You are a consciousness sphere. When a creature dies, you simply observe another. Knowledge persists through RECORDERS (tool archetype).',
    icon: '💫',
    action: 'Continue'
  },
  {
    title: 'Ready to Begin',
    description: 'You will now shape your catalyst—the initial traits for Generation 1. All subsequent evolution emerges from Yuka AI decisions.',
    icon: '⚡',
    action: 'Shape Catalyst'
  }
];

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [gestureCompleted, setGestureCompleted] = useState(false);

  const step = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setGestureCompleted(false);
      log.info('Onboarding step advanced', { step: currentStep + 1 });
    } else {
      log.info('Onboarding flow completed');
      onComplete();
    }
  };

  const handleSkip = () => {
    log.info('Onboarding flow skipped');
    onComplete();
  };

  const handleGestureDemo = () => {
    // Would trigger gesture tutorial overlay
    setGestureCompleted(true);
    log.info('Gesture demo triggered', { gesture: step.gesture });
  };

  return (
    <div className="fixed inset-0 z-50 bg-ebb-indigo-900/95 backdrop-blur-md flex items-center justify-center">
      <div className="max-w-2xl w-full mx-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-ebb-indigo-800/50 rounded-full h-2 border border-echo-silver-500/20">
            <div 
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-trait-gold-500 to-bloom-emerald-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-center mt-2 text-xs text-echo-silver-500 font-mono">
            Step {currentStep + 1} of {ONBOARDING_STEPS.length}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="p-8 bg-ebb-indigo-800/90 border border-trait-gold-400/30 rounded-3xl shadow-2xl animate-fade-in">
          {/* Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-trait-gold-500/20 rounded-full border border-trait-gold-400/40">
              <span className="text-6xl">{step.icon}</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-center font-display text-3xl text-trait-gold-300 mb-4">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-center text-lg text-echo-silver-400 leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Gesture Demo (if applicable) */}
          {step.gesture && (
            <div className="mb-6">
              <button
                onClick={handleGestureDemo}
                className="w-full px-6 py-4 bg-bloom-emerald-600 hover:bg-bloom-emerald-500 rounded-xl text-white font-medium transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>🤲</span>
                <span>Try {step.gesture} gesture</span>
              </button>
              {gestureCompleted && (
                <div className="mt-2 text-center text-sm text-bloom-emerald-400">
                  ✓ Gesture practiced
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mt-8">
            <button
              onClick={handleSkip}
              className="px-6 py-3 bg-ebb-indigo-600 hover:bg-ebb-indigo-500 rounded-xl text-echo-silver-300 font-medium transition-all active:scale-95"
            >
              Skip Tutorial
            </button>
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-trait-gold-600 hover:bg-trait-gold-500 rounded-xl text-white font-bold transition-all active:scale-95 shadow-lg"
            >
              {step.action || 'Continue'}
            </button>
          </div>
        </div>

        {/* Philosophy Footer */}
        <div className="text-center mt-6 text-sm text-echo-silver-600 italic">
          "In the flow of generations, consciousness observes itself evolving."
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;

