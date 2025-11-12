/**
 * PAUSE SCREEN TESTS
 * 
 * Tests for PauseScreen component.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UIManagerProvider } from '../../../../game/ui/UIManager';
import { PauseScreen } from '../../../../game/ui/screens/PauseScreen';

describe('PauseScreen', () => {
  it('should render pause title', () => {
    render(
      <UIManagerProvider>
        <PauseScreen />
      </UIManagerProvider>
    );

    expect(screen.getByText('Paused')).toBeInTheDocument();
  });

  it('should render Resume button', () => {
    render(
      <UIManagerProvider>
        <PauseScreen />
      </UIManagerProvider>
    );

    const resumeButton = screen.getByText('Resume');
    expect(resumeButton).toBeInTheDocument();
    expect(resumeButton.tagName).toBe('BUTTON');
  });

  it('should render Settings button', () => {
    render(
      <UIManagerProvider>
        <PauseScreen />
      </UIManagerProvider>
    );

    const settingsButton = screen.getByText('Settings');
    expect(settingsButton).toBeInTheDocument();
    expect(settingsButton.tagName).toBe('BUTTON');
  });

  it('should render Main Menu button', () => {
    render(
      <UIManagerProvider>
        <PauseScreen />
      </UIManagerProvider>
    );

    const mainMenuButton = screen.getByText('Main Menu');
    expect(mainMenuButton).toBeInTheDocument();
    expect(mainMenuButton.tagName).toBe('BUTTON');
  });

  it('should have proper styling', () => {
    const { container } = render(
      <UIManagerProvider>
        <PauseScreen />
      </UIManagerProvider>
    );

    const screenElement = container.querySelector('.pause-screen');
    expect(screenElement).toBeInTheDocument();
  });
});




