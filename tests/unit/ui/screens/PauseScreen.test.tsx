/**
 * PAUSE SCREEN TESTS
 * 
 * Tests for PauseScreen component.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UIManagerProvider } from '../../../../game/ui/UIManager';
import { PauseScreen } from '../../../../game/ui/screens/PauseScreen';

describe('PauseScreen', () => {
  it('should render pause title', () => {
    render(
      <MemoryRouter>
        <UIManagerProvider>
          <PauseScreen />
        </UIManagerProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Paused')).toBeInTheDocument();
  });

  it('should render Resume button', () => {
    render(
      <MemoryRouter>
        <UIManagerProvider>
          <PauseScreen />
        </UIManagerProvider>
      </MemoryRouter>
    );

    const resumeButton = screen.getAllByText('Resume')[0];
    expect(resumeButton).toBeInTheDocument();
    expect(resumeButton.tagName).toBe('BUTTON');
  });

  it('should render Settings button', () => {
    render(
      <MemoryRouter>
        <UIManagerProvider>
          <PauseScreen />
        </UIManagerProvider>
      </MemoryRouter>
    );

    const settingsButton = screen.getAllByText('Settings')[0];
    expect(settingsButton).toBeInTheDocument();
    expect(settingsButton.tagName).toBe('BUTTON');
  });

  it('should render Main Menu button', () => {
    render(
      <MemoryRouter>
        <UIManagerProvider>
          <PauseScreen />
        </UIManagerProvider>
      </MemoryRouter>
    );

    const mainMenuButton = screen.getAllByText('Main Menu')[0];
    expect(mainMenuButton).toBeInTheDocument();
    expect(mainMenuButton.tagName).toBe('BUTTON');
  });

  it('should have proper styling', () => {
    const { container } = render(
      <MemoryRouter>
        <UIManagerProvider>
          <PauseScreen />
        </UIManagerProvider>
      </MemoryRouter>
    );

    const screenElement = container.querySelector('.pause-screen');
    expect(screenElement).toBeInTheDocument();
  });
});
