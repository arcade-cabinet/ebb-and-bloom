/**
 * MENU SCREEN TESTS
 * 
 * Tests for MenuScreen component.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UIManagerProvider } from '../../../../game/ui/UIManager';
import { MenuScreen } from '../../../../game/ui/screens/MenuScreen';

describe('MenuScreen', () => {
  it('should render menu title', () => {
    render(
      <UIManagerProvider>
        <MenuScreen />
      </UIManagerProvider>
    );

    expect(screen.getByText('Ebb & Bloom')).toBeInTheDocument();
  });

  it('should render New Game button', () => {
    render(
      <UIManagerProvider>
        <MenuScreen />
      </UIManagerProvider>
    );

    const newGameButton = screen.getByText('New Game');
    expect(newGameButton).toBeInTheDocument();
    expect(newGameButton.tagName).toBe('BUTTON');
  });

  it('should render Settings button', () => {
    render(
      <UIManagerProvider>
        <MenuScreen />
      </UIManagerProvider>
    );

    const settingsButton = screen.getByText('Settings');
    expect(settingsButton).toBeInTheDocument();
    expect(settingsButton.tagName).toBe('BUTTON');
  });

  it('should have proper styling', () => {
    const { container } = render(
      <UIManagerProvider>
        <MenuScreen />
      </UIManagerProvider>
    );

    const screenElement = container.querySelector('.menu-screen');
    expect(screenElement).toBeInTheDocument();
  });
});

