/**
 * GameClock System Tests - Validate time management and evolution events
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import GameClock, { gameClock } from '../systems/GameClock';

describe('GameClock System', () => {
  let testClock: GameClock;
  
  beforeEach(() => {
    // Create fresh clock for each test
    testClock = new GameClock({
      timeScale: 100,  // Very fast for testing
      generationDurationMs: 1000, // 1 second generations
      evolutionPressure: 0.5,
      maxGenerations: 10,
      autoPause: false,
      logInterval: 1
    });
  });
  
  test('initializes with correct default values', () => {
    const time = testClock.getCurrentTime();
    
    expect(time.generation).toBe(0);
    expect(time.generationProgress).toBe(0);
    expect(time.totalGenerations).toBe(0);
    expect(time.evolutionEvents).toEqual([]);
  });
  
  test('advances generations based on time scale', () => {
    vi.useFakeTimers();
    
    const startTime = testClock.getCurrentTime();
    
    // Simulate 1.5 seconds of updates with fake timers
    for (let i = 0; i < 150; i++) {
      testClock.update();
      vi.advanceTimersByTime(10); // 10ms per update
    }
    
    const endTime = testClock.getCurrentTime();
    
    expect(endTime.generation).toBeGreaterThanOrEqual(startTime.generation);
    expect(endTime.generationProgress).toBeGreaterThanOrEqual(0);
    expect(endTime.generationProgress).toBeLessThanOrEqual(1);
    
    vi.useRealTimers();
  });
  
  test('records evolution events correctly', () => {
    const testEvent = {
      generation: 1,
      timestamp: Date.now(),
      eventType: 'trait_emergence' as const,
      description: 'Test evolution event',
      affectedCreatures: ['creature_1'],
      traits: [0.5, 0.3, 0.8],
      significance: 0.7
    };
    
    testClock.recordEvent(testEvent);
    
    const currentTime = testClock.getCurrentTime();
    expect(currentTime.evolutionEvents).toContain(testEvent);
    expect(currentTime.evolutionEvents.length).toBe(1);
  });
  
  test('calculates evolution summary correctly', () => {
    // Add multiple events
    const events = [
      {
        generation: 1,
        timestamp: Date.now(),
        eventType: 'trait_emergence' as const,
        description: 'Event 1',
        affectedCreatures: ['creature_1'],
        traits: [0.5],
        significance: 0.6
      },
      {
        generation: 1,
        timestamp: Date.now(),
        eventType: 'pack_formation' as const,
        description: 'Event 2',
        affectedCreatures: ['creature_2'],
        traits: [0.7],
        significance: 0.8
      }
    ];
    
    events.forEach(event => testClock.recordEvent(event));
    
    const summary = testClock.getEvolutionSummary();
    
    expect(summary.averageEventsPerGeneration).toBeGreaterThan(0);
    expect(summary.mostCommonEventType).toBeDefined();
    expect(summary.totalSignificantEvents).toBeGreaterThanOrEqual(1);
  });
  
  test('pauses and resumes correctly', () => {
    testClock.resume(); // Start
    expect(testClock.isPaused()).toBe(false);
    
    testClock.pause();
    expect(testClock.isPaused()).toBe(true);
    
    // Time shouldn't advance when paused
    const timeBefore = testClock.getCurrentTime().gameTimeMs;
    testClock.update();
    const timeAfter = testClock.getCurrentTime().gameTimeMs;
    
    expect(timeAfter).toBe(timeBefore);
  });
  
  test('manages event memory correctly', () => {
    // Add many events to test memory management
    for (let i = 0; i < 1100; i++) {
      testClock.recordEvent({
        generation: Math.floor(i / 100),
        timestamp: Date.now(),
        eventType: 'trait_emergence',
        description: `Test event ${i}`,
        affectedCreatures: [`creature_${i}`],
        traits: [Math.random()],
        significance: 0.5
      });
    }
    
    const events = testClock.getCurrentTime().evolutionEvents;
    expect(events.length).toBeLessThanOrEqual(1000); // Should trim to 1000 (updated limit)
  });
});

describe('Global GameClock Instance', () => {
  test('singleton instance works correctly', () => {
    expect(gameClock).toBeDefined();
    expect(typeof gameClock.update).toBe('function');
    expect(typeof gameClock.recordEvent).toBe('function');
  });
  
  test('can subscribe to time updates', () => {
    const mockListener = vi.fn();
    const unsubscribe = gameClock.onTimeUpdate(mockListener);
    
    gameClock.update();
    
    expect(mockListener).toHaveBeenCalled();
    
    unsubscribe();
  });
  
  test('can subscribe to evolution events', () => {
    const mockListener = vi.fn();
    const unsubscribe = gameClock.onEvolutionEvent(mockListener);
    
    gameClock.recordEvent({
      generation: 0,
      timestamp: Date.now(),
      eventType: 'trait_emergence',
      description: 'Test',
      affectedCreatures: [],
      traits: [],
      significance: 0.5
    });
    
    expect(mockListener).toHaveBeenCalled();
    
    unsubscribe();
  });
});