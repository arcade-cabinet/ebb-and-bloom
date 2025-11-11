/**
 * UI MANAGER TESTS
 * 
 * Tests for UIManager context provider and screen management.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UIManagerProvider, useUIManager, ScreenType } from '../../../game/ui/UIManager';

// Test component that uses UIManager
function TestComponent() {
  const { currentScreen, setScreen, isHUDVisible, setHUDVisible } = useUIManager();

  return (
    <div>
      <div data-testid="current-screen">{currentScreen}</div>
      <div data-testid="hud-visible">{isHUDVisible.toString()}</div>
      <button onClick={() => setScreen(ScreenType.GAME)}>Go to Game</button>
      <button onClick={() => setScreen(ScreenType.PAUSE)}>Go to Pause</button>
      <button onClick={() => setHUDVisible(true)}>Show HUD</button>
      <button onClick={() => setHUDVisible(false)}>Hide HUD</button>
    </div>
  );
}

describe('UIManager', () => {
  it('should provide default screen (MENU)', () => {
    render(
      <UIManagerProvider>
        <TestComponent />
      </UIManagerProvider>
    );

    expect(screen.getByTestId('current-screen')).toHaveTextContent(ScreenType.MENU);
  });

  it('should use initialScreen prop', () => {
    render(
      <UIManagerProvider initialScreen={ScreenType.GAME}>
        <TestComponent />
      </UIManagerProvider>
    );

    expect(screen.getByTestId('current-screen')).toHaveTextContent(ScreenType.GAME);
    // HUD visibility is set automatically when screen is GAME
    expect(screen.getByTestId('hud-visible')).toHaveTextContent('true');
  });

  it('should change screen when setScreen is called', () => {
    render(
      <UIManagerProvider>
        <TestComponent />
      </UIManagerProvider>
    );

    expect(screen.getByTestId('current-screen')).toHaveTextContent(ScreenType.MENU);

    fireEvent.click(screen.getByText('Go to Game'));
    expect(screen.getByTestId('current-screen')).toHaveTextContent(ScreenType.GAME);
    expect(screen.getByTestId('hud-visible')).toHaveTextContent('true');

    fireEvent.click(screen.getByText('Go to Pause'));
    expect(screen.getByTestId('current-screen')).toHaveTextContent(ScreenType.PAUSE);
    expect(screen.getByTestId('hud-visible')).toHaveTextContent('false');
  });

  it('should automatically show HUD when switching to GAME screen', () => {
    render(
      <UIManagerProvider initialScreen={ScreenType.MENU}>
        <TestComponent />
      </UIManagerProvider>
    );

    expect(screen.getByTestId('hud-visible')).toHaveTextContent('false');

    fireEvent.click(screen.getByText('Go to Game'));
    expect(screen.getByTestId('hud-visible')).toHaveTextContent('true');
  });

  it('should allow manual HUD visibility control', () => {
    render(
      <UIManagerProvider initialScreen={ScreenType.GAME}>
        <TestComponent />
      </UIManagerProvider>
    );

    expect(screen.getByTestId('hud-visible')).toHaveTextContent('true');

    fireEvent.click(screen.getByText('Hide HUD'));
    expect(screen.getByTestId('hud-visible')).toHaveTextContent('false');

    fireEvent.click(screen.getByText('Show HUD'));
    expect(screen.getByTestId('hud-visible')).toHaveTextContent('true');
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useUIManager must be used within UIManagerProvider');

    consoleSpy.mockRestore();
  });
});

