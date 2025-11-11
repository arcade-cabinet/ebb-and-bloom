/**
 * GameState Integration Tests
 * 
 * Tests seed propagation through the entire system and scene transitions.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../../game/state/GameState';
import { rngRegistry } from '../../engine/rng/RNGRegistry';
import { SceneManager } from '../../game/scenes/SceneManager';
import { MenuScene } from '../../game/scenes/MenuScene';
import { IntroScene } from '../../game/scenes/IntroScene';
import { GameplayScene } from '../../game/scenes/GameplayScene';
import { PauseScene } from '../../game/scenes/PauseScene';

describe('GameState Seed Propagation', () => {
  beforeEach(() => {
    rngRegistry.reset();
  });

  it('propagates seed from menu to intro to gameplay', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.setCurrentSeed('test-seed-123');
    });
    
    expect(result.current.currentSeed).toBe('test-seed-123');
    
    const testRNG = rngRegistry.getScopedRNG('test');
    const value1 = testRNG.uniform(0, 1);
    
    rngRegistry.reset();
    rngRegistry.setSeed('test-seed-123');
    const testRNG2 = rngRegistry.getScopedRNG('test');
    const value2 = testRNG2.uniform(0, 1);
    
    expect(value1).toBe(value2);
  });

  it('updates RNGRegistry when seed changes', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.setCurrentSeed('new-seed-456');
    });
    
    const rng1 = rngRegistry.getScopedRNG('test-namespace');
    const value1 = rng1.uniform(0, 100);
    
    rngRegistry.reset();
    rngRegistry.setSeed('new-seed-456');
    const rng2 = rngRegistry.getScopedRNG('test-namespace');
    const value2 = rng2.uniform(0, 100);
    
    expect(value1).toBe(value2);
  });

  it('maintains seed consistency across multiple namespace accesses', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.setCurrentSeed('consistent-seed');
    });
    
    const rng1 = rngRegistry.getScopedRNG('namespace-a');
    const rng2 = rngRegistry.getScopedRNG('namespace-b');
    const rng3 = rngRegistry.getScopedRNG('namespace-c');
    
    const values1 = [
      rng1.uniform(0, 1),
      rng2.uniform(0, 1),
      rng3.uniform(0, 1)
    ];
    
    rngRegistry.reset();
    rngRegistry.setSeed('consistent-seed');
    
    const rng4 = rngRegistry.getScopedRNG('namespace-a');
    const rng5 = rngRegistry.getScopedRNG('namespace-b');
    const rng6 = rngRegistry.getScopedRNG('namespace-c');
    
    const values2 = [
      rng4.uniform(0, 1),
      rng5.uniform(0, 1),
      rng6.uniform(0, 1)
    ];
    
    expect(values1).toEqual(values2);
  });

  it('initializes with seed correctly', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.initializeWithSeed('init-seed-789', 'user');
    });
    
    expect(result.current.seed).toBe('init-seed-789');
    expect(result.current.seedSource).toBe('user');
    expect(result.current.isInitialized).toBe(true);
    
    const rng = rngRegistry.getScopedRNG('init-test');
    expect(rng).toBeDefined();
  });

  it('generates random seed with auto source', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.generateRandomSeed();
    });
    
    expect(result.current.seed).toBeTruthy();
    expect(result.current.seed.length).toBeGreaterThan(0);
    expect(result.current.seedSource).toBe('auto');
    expect(result.current.isInitialized).toBe(true);
  });

  it('handles seed changes without breaking RNG determinism', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.setCurrentSeed('first-seed');
    });
    
    const rng1 = rngRegistry.getScopedRNG('change-test');
    const firstValue = rng1.uniform(0, 100);
    
    act(() => {
      result.current.setCurrentSeed('second-seed');
    });
    
    const rng2 = rngRegistry.getScopedRNG('change-test');
    const secondValue = rng2.uniform(0, 100);
    
    expect(firstValue).not.toBe(secondValue);
    
    act(() => {
      result.current.setCurrentSeed('first-seed');
    });
    
    const rng3 = rngRegistry.getScopedRNG('change-test');
    const thirdValue = rng3.uniform(0, 100);
    
    expect(thirdValue).toBe(firstValue);
  });
});

describe('Scene Transitions', () => {
  let sceneManager: SceneManager;

  beforeEach(() => {
    sceneManager = SceneManager.getInstance();
  });

  it('transitions menu → intro → gameplay', async () => {
    sceneManager.registerScene('menu', MenuScene);
    sceneManager.registerScene('intro', IntroScene);
    sceneManager.registerScene('gameplay', GameplayScene);
    
    await sceneManager.changeScene('menu');
    expect(sceneManager.getCurrentScene()).toBeInstanceOf(MenuScene);
    
    await sceneManager.changeScene('intro');
    expect(sceneManager.getCurrentScene()).toBeInstanceOf(IntroScene);
    
    await sceneManager.changeScene('gameplay');
    expect(sceneManager.getCurrentScene()).toBeInstanceOf(GameplayScene);
  });

  it('transitions gameplay → pause → resume', async () => {
    sceneManager.registerScene('gameplay', GameplayScene);
    sceneManager.registerScene('pause', PauseScene);
    
    await sceneManager.changeScene('gameplay');
    expect(sceneManager.getCurrentScene()).toBeInstanceOf(GameplayScene);
    
    await sceneManager.changeScene('pause');
    expect(sceneManager.getCurrentScene()).toBeInstanceOf(PauseScene);
    
    await sceneManager.changeScene('gameplay');
    expect(sceneManager.getCurrentScene()).toBeInstanceOf(GameplayScene);
  });

  it('maintains seed across scene transitions', async () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.setCurrentSeed('transition-seed');
    });
    
    sceneManager.registerScene('menu', MenuScene);
    sceneManager.registerScene('intro', IntroScene);
    
    await sceneManager.changeScene('menu');
    const seedBeforeTransition = result.current.currentSeed;
    
    await sceneManager.changeScene('intro');
    const seedAfterTransition = result.current.currentSeed;
    
    expect(seedBeforeTransition).toBe('transition-seed');
    expect(seedAfterTransition).toBe('transition-seed');
  });

  it('cleans up properly on scene exit', async () => {
    sceneManager.registerScene('menu', MenuScene);
    sceneManager.registerScene('intro', IntroScene);
    
    await sceneManager.changeScene('menu');
    await sceneManager.changeScene('intro');
    
    expect(sceneManager.getCurrentScene()).toBeInstanceOf(IntroScene);
  });

  it('preserves RNG state during scene transitions', async () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.setCurrentSeed('preservation-seed');
    });
    
    const rng1 = rngRegistry.getScopedRNG('scene-test');
    const value1 = rng1.uniform(0, 1);
    
    sceneManager.registerScene('menu', MenuScene);
    sceneManager.registerScene('intro', IntroScene);
    
    await sceneManager.changeScene('menu');
    await sceneManager.changeScene('intro');
    
    rngRegistry.reset();
    rngRegistry.setSeed('preservation-seed');
    const rng2 = rngRegistry.getScopedRNG('scene-test');
    const value2 = rng2.uniform(0, 1);
    
    expect(value1).toBe(value2);
  });
});

describe('GameState Persistence', () => {
  it('stores seed in persisted state', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.initializeWithSeed('persist-seed', 'user');
    });
    
    expect(result.current.seed).toBe('persist-seed');
    expect(result.current.seedSource).toBe('user');
    expect(result.current.isInitialized).toBe(true);
  });

  it('maintains currentSeed separately from seed', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.initializeWithSeed('main-seed', 'user');
      result.current.setCurrentSeed('current-seed');
    });
    
    expect(result.current.seed).toBe('main-seed');
    expect(result.current.currentSeed).toBe('current-seed');
  });
});

describe('GameState getScopedRNG', () => {
  it('returns scoped RNG with initialized seed', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.initializeWithSeed('scoped-seed', 'user');
    });
    
    const rng = result.current.getScopedRNG('test-scope');
    expect(rng).toBeDefined();
    
    const value = rng.uniform(0, 100);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(100);
  });

  it('throws error when getting RNG without initialization', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.initializeWithSeed('', 'auto');
    });
    
    expect(() => {
      result.current.getScopedRNG('test-scope');
    }).toThrow('Game seed not initialized');
  });

  it('returns consistent RNG for same scope', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.initializeWithSeed('consistent-rng', 'user');
    });
    
    const rng1 = result.current.getScopedRNG('same-scope');
    const rng2 = result.current.getScopedRNG('same-scope');
    
    expect(rng1).toBe(rng2);
  });
});
