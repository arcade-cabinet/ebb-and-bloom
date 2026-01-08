/**
 * MENU SCREEN TESTS
 * 
 * Tests for MenuScreen component.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UIManagerProvider } from '../../../../game/ui/UIManager';
import { MenuScreen } from '../../../../game/ui/screens/MenuScreen';

describe('MenuScreen', () => {
  it('should render menu title', () => {
    render(
      <MemoryRouter>
        <UIManagerProvider>
          <MenuScreen />
        </UIManagerProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Ebb & Bloom')).toBeInTheDocument();
  });

  it('should render New Game button', () => {
    render(
      <MemoryRouter>
        <UIManagerProvider>
          <MenuScreen />
        </UIManagerProvider>
      </MemoryRouter>
    );

    const newGameButton = screen.getAllByText('New Game')[0];
    expect(newGameButton).toBeInTheDocument();
    expect(newGameButton.tagName).toBe('BUTTON');
  });

  it('should render Settings button', () => {
    render(
      <MemoryRouter>
        <UIManagerProvider>
          <MenuScreen />
        </UIManagerProvider>
      </MemoryRouter>
    );

    const settingsButton = screen.getAllByText('Settings')[0];
    expect(settingsButton).toBeInTheDocument();
    expect(settingsButton.tagName).toBe('BUTTON');
  });

  it('should have proper styling', () => {
    const { container } = render(
      <MemoryRouter>
        <UIManagerProvider>
          <MenuScreen />
        </UIManagerProvider>
      </MemoryRouter>
    );

    const screenElement = container.querySelector('.menu-screen');
    expect(screenElement).toBeInTheDocument();
  });
});
