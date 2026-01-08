/**
 * MENU SCREEN BEHAVIOR TESTS
 * 
 * Tests that verify actual behavior, not just rendering.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UIManagerProvider, ScreenType, useUIManager } from '../../../../game/ui/UIManager';
import { MenuScreen } from '../../../../game/ui/screens/MenuScreen';

afterEach(() => {
  cleanup();
});

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
      <MemoryRouter>
        <UIManagerProvider>
          <TestWrapper />
        </UIManagerProvider>
      </MemoryRouter>
    );

    const statusDivs = screen.getAllByTestId('screen');
    expect(statusDivs[0]).toHaveTextContent(ScreenType.MENU);
    
    const newGameButton = screen.getAllByText('New Game')[0];
    fireEvent.click(newGameButton);
    
    expect(screen.getAllByTestId('screen')[0]).toHaveTextContent(ScreenType.GAME);
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
      <MemoryRouter>
        <UIManagerProvider>
          <TestWrapper />
        </UIManagerProvider>
      </MemoryRouter>
    );

    const statusDivs = screen.getAllByTestId('screen');
    expect(statusDivs[0]).toHaveTextContent(ScreenType.MENU);
    
    const settingsButton = screen.getAllByText('Settings')[0];
    fireEvent.click(settingsButton);
    
    expect(screen.getAllByTestId('screen')[0]).toHaveTextContent(ScreenType.SETTINGS);
  });

  it('should be accessible via keyboard navigation', () => {
    render(
      <MemoryRouter>
        <UIManagerProvider>
          <MenuScreen />
        </UIManagerProvider>
      </MemoryRouter>
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    buttons.forEach(button => {
      expect(button).not.toHaveAttribute('tabindex', '-1');
    });
  });

  it('should handle button clicks without errors', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <MemoryRouter>
        <UIManagerProvider>
          <MenuScreen />
        </UIManagerProvider>
      </MemoryRouter>
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(() => fireEvent.click(button)).not.toThrow();
    });

    consoleError.mockRestore();
  });
});
