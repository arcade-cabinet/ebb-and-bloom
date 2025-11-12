/**
 * GAME SCREEN TESTS
 * 
 * Tests for GameScreen component.
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GameScreen } from '../../../../game/ui/screens/GameScreen';

describe('GameScreen', () => {
  it('should render children', () => {
    const { container } = render(
      <GameScreen>
        <div data-testid="child">Test Content</div>
      </GameScreen>
    );

    expect(container.querySelector('[data-testid="child"]')).toBeInTheDocument();
    expect(container.textContent).toContain('Test Content');
  });

  it('should have full viewport dimensions', () => {
    const { container } = render(
      <GameScreen>
        <div>Content</div>
      </GameScreen>
    );

    const screenElement = container.firstChild as HTMLElement;
    expect(screenElement).toBeInTheDocument();
    expect(screenElement.style.width).toBe('100vw');
    expect(screenElement.style.height).toBe('100vh');
  });

  it('should be positioned absolutely', () => {
    const { container } = render(
      <GameScreen>
        <div>Content</div>
      </GameScreen>
    );

    const screenElement = container.firstChild as HTMLElement;
    expect(screenElement.style.position).toBe('absolute');
  });
});




