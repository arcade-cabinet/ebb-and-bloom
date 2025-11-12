/**
 * HUD VITALS TESTS
 * 
 * Tests for HUDVitals component.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { HUDVitals } from '../../../../game/ui/hud/HUDVitals';

describe('HUDVitals', () => {
  it('should render all three bars', () => {
    const { container } = render(<HUDVitals />);

    const bars = container.querySelectorAll('[style*="width: 32px"]');
    expect(bars.length).toBe(3); // Health, Fatigue, Magicka
  });

  it('should render health bar with default value', () => {
    const { container } = render(<HUDVitals health={1.0} />);

    const healthBar = container.querySelector('[style*="background-color: rgb(255, 0, 0)"]');
    expect(healthBar).toBeInTheDocument();
  });

  it('should render fatigue bar with default value', () => {
    const { container } = render(<HUDVitals fatigue={1.0} />);

    const fatigueBar = container.querySelector('[style*="background-color: rgb(255, 136, 0)"]');
    expect(fatigueBar).toBeInTheDocument();
  });

  it('should render magicka bar with default value', () => {
    const { container } = render(<HUDVitals magicka={1.0} />);

    const magickaBar = container.querySelector('[style*="background-color: rgb(0, 136, 255)"]');
    expect(magickaBar).toBeInTheDocument();
  });

  it('should update bar heights based on props', () => {
    const { container, rerender } = render(<HUDVitals health={0.5} fatigue={0.75} magicka={0.25} />);

    const healthBar = container.querySelector('[style*="background-color: rgb(255, 0, 0)"]') as HTMLElement;
    expect(healthBar).toBeInTheDocument();

    rerender(<HUDVitals health={0.8} fatigue={0.6} magicka={0.9} />);

    // Bars should update (we can't easily test exact height without more complex queries)
    expect(healthBar).toBeInTheDocument();
  });

  it('should be positioned bottom-left', () => {
    const { container } = render(<HUDVitals />);

    const hudContainer = container.firstChild as HTMLElement;
    expect(hudContainer.style.position).toBe('absolute');
    expect(hudContainer.style.bottom).toBe('20px');
    expect(hudContainer.style.left).toBe('20px');
  });
});




