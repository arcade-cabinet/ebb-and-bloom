/**
 * UI MANAGER BEHAVIOR TESTS
 * 
 * Tests that VERIFY BEHAVIOR, not just implementation.
 * These tests should catch bugs and ensure correctness.
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UIManagerProvider, useUIManager, ScreenType } from '../../../game/ui/UIManager';

// Test component that uses UIManager
function TestComponent() {
  const { currentScreen, setScreen, isHUDVisible } = useUIManager();

  return (
    <div>
      <div data-testid="current-screen">{currentScreen}</div>
      <div data-testid="hud-visible">{isHUDVisible.toString()}</div>
      <button onClick={() => setScreen(ScreenType.GAME)}>Go to Game</button>
      <button onClick={() => setScreen(ScreenType.PAUSE)}>Go to Pause</button>
      <button onClick={() => setScreen(ScreenType.MENU)}>Go to Menu</button>
    </div>
  );
}

describe('UIManager Behavior', () => {
  it('should prevent HUD from showing on non-game screens', () => {
    render(
      <UIManagerProvider initialScreen={ScreenType.MENU}>
        <TestComponent />
      </UIManagerProvider>
    );

    expect(screen.getByTestId('hud-visible')).toHaveTextContent('false');

    // Switch to pause - HUD should still be false
    fireEvent.click(screen.getByText('Go to Pause'));
    expect(screen.getByTestId('hud-visible')).toHaveTextContent('false');

    // Switch to menu - HUD should still be false
    fireEvent.click(screen.getByText('Go to Menu'));
    expect(screen.getByTestId('hud-visible')).toHaveTextContent('false');
  });

  it('should automatically show HUD when entering game screen', () => {
    render(
      <UIManagerProvider initialScreen={ScreenType.MENU}>
        <TestComponent />
      </UIManagerProvider>
    );

    expect(screen.getByTestId('hud-visible')).toHaveTextContent('false');

    // Switch to game - HUD should automatically show
    fireEvent.click(screen.getByText('Go to Game'));
    expect(screen.getByTestId('hud-visible')).toHaveTextContent('true');
    expect(screen.getByTestId('current-screen')).toHaveTextContent(ScreenType.GAME);
  });

  it('should automatically hide HUD when leaving game screen', () => {
    render(
      <UIManagerProvider initialScreen={ScreenType.GAME}>
        <TestComponent />
      </UIManagerProvider>
    );

    expect(screen.getByTestId('hud-visible')).toHaveTextContent('true');

    // Switch to pause - HUD should automatically hide
    fireEvent.click(screen.getByText('Go to Pause'));
    expect(screen.getByTestId('hud-visible')).toHaveTextContent('false');
    expect(screen.getByTestId('current-screen')).toHaveTextContent(ScreenType.PAUSE);
  });

  it('should maintain screen state across multiple transitions', () => {
    render(
      <UIManagerProvider initialScreen={ScreenType.MENU}>
        <TestComponent />
      </UIManagerProvider>
    );

    // Menu -> Game -> Pause -> Game -> Menu
    fireEvent.click(screen.getByText('Go to Game'));
    expect(screen.getByTestId('current-screen')).toHaveTextContent(ScreenType.GAME);
    expect(screen.getByTestId('hud-visible')).toHaveTextContent('true');

    fireEvent.click(screen.getByText('Go to Pause'));
    expect(screen.getByTestId('current-screen')).toHaveTextContent(ScreenType.PAUSE);
    expect(screen.getByTestId('hud-visible')).toHaveTextContent('false');

    fireEvent.click(screen.getByText('Go to Game'));
    expect(screen.getByTestId('current-screen')).toHaveTextContent(ScreenType.GAME);
    expect(screen.getByTestId('hud-visible')).toHaveTextContent('true');

    fireEvent.click(screen.getByText('Go to Menu'));
    expect(screen.getByTestId('current-screen')).toHaveTextContent(ScreenType.MENU);
    expect(screen.getByTestId('hud-visible')).toHaveTextContent('false');
  });

  it('should handle rapid screen transitions correctly', async () => {
    render(
      <UIManagerProvider initialScreen={ScreenType.MENU}>
        <TestComponent />
      </UIManagerProvider>
    );

    // Rapidly click through screens
    fireEvent.click(screen.getByText('Go to Game'));
    fireEvent.click(screen.getByText('Go to Pause'));
    fireEvent.click(screen.getByText('Go to Game'));
    fireEvent.click(screen.getByText('Go to Menu'));

    // Should end up on menu with HUD hidden
    await waitFor(() => {
      expect(screen.getByTestId('current-screen')).toHaveTextContent(ScreenType.MENU);
      expect(screen.getByTestId('hud-visible')).toHaveTextContent('false');
    });
  });

  it('should correctly initialize HUD visibility based on initial screen', () => {
    // Test MENU screen
    const { unmount: unmount1 } = render(
      <UIManagerProvider initialScreen={ScreenType.MENU}>
        <TestComponent />
      </UIManagerProvider>
    );
    expect(screen.getByTestId('hud-visible')).toHaveTextContent('false');
    unmount1();

    // Test GAME screen
    const { unmount: unmount2 } = render(
      <UIManagerProvider initialScreen={ScreenType.GAME}>
        <TestComponent />
      </UIManagerProvider>
    );
    expect(screen.getByTestId('hud-visible')).toHaveTextContent('true');
    unmount2();

    // Test PAUSE screen
    render(
      <UIManagerProvider initialScreen={ScreenType.PAUSE}>
        <TestComponent />
      </UIManagerProvider>
    );
    expect(screen.getByTestId('hud-visible')).toHaveTextContent('false');
  });
});

