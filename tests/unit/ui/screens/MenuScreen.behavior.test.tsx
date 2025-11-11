/**
 * MENU SCREEN BEHAVIOR TESTS
 * 
 * Tests that verify actual behavior, not just rendering.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UIManagerProvider, ScreenType, useUIManager } from '../../../../game/ui/UIManager';
import { MenuScreen } from '../../../../game/ui/screens/MenuScreen';

describe('MenuScreen Behavior', () => {
  it('should navigate to game screen when New Game is clicked', () => {
    function TestWrapper() {
      const { currentScreen } = useUIManager();
      return (
        <div>
          {currentScreen === ScreenType.MENU && <MenuScreen />}
          <div data-testid="screen">{currentScreen}</div>
        </div>
      );
    }
    
    render(
      <UIManagerProvider>
        <TestWrapper />
      </UIManagerProvider>
    );

    expect(screen.getByTestId('screen')).toHaveTextContent(ScreenType.MENU);
    
    const newGameButton = screen.getByText('New Game');
    fireEvent.click(newGameButton);
    
    // Should navigate to game screen
    expect(screen.getByTestId('screen')).toHaveTextContent(ScreenType.GAME);
  });

  it('should navigate to settings screen when Settings is clicked', () => {
    function TestWrapper() {
      const { currentScreen } = useUIManager();
      return (
        <div>
          {currentScreen === ScreenType.MENU && <MenuScreen />}
          <div data-testid="screen">{currentScreen}</div>
        </div>
      );
    }
    
    render(
      <UIManagerProvider>
        <TestWrapper />
      </UIManagerProvider>
    );

    expect(screen.getByTestId('screen')).toHaveTextContent(ScreenType.MENU);
    
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);
    
    // Should navigate to settings screen
    expect(screen.getByTestId('screen')).toHaveTextContent(ScreenType.SETTINGS);
  });

  it('should be accessible via keyboard navigation', () => {
    render(
      <UIManagerProvider>
        <MenuScreen />
      </UIManagerProvider>
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    // All buttons should be focusable
    buttons.forEach(button => {
      expect(button).not.toHaveAttribute('tabindex', '-1');
    });
  });

  it('should handle button clicks without errors', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <UIManagerProvider>
        <MenuScreen />
      </UIManagerProvider>
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(() => fireEvent.click(button)).not.toThrow();
    });

    consoleError.mockRestore();
  });
});

