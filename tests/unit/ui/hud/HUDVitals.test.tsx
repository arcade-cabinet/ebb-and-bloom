/**
 * HUD VITALS TESTS
 * 
 * Tests for HUDVitals component.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { HUDVitals } from '../../../../game/ui/hud/HUDVitals';

afterEach(() => {
  cleanup();
});

describe('HUDVitals', () => {
  it('should render all three bars', () => {
    render(<HUDVitals />);

    // Check by testid
    expect(screen.getByTestId('health-bar')).toBeInTheDocument();
    expect(screen.getByTestId('fatigue-bar')).toBeInTheDocument();
    expect(screen.getByTestId('magicka-bar')).toBeInTheDocument();
  });

  it('should render health bar with default value', () => {
    render(<HUDVitals />);

    const fill = screen.getByTestId('health-fill');
    expect(fill).toBeInTheDocument();

    waitFor(() => {
        expect(fill.style.height).toBe('100%');
    });
  });

  it('should render fatigue bar with default value', () => {
    render(<HUDVitals />);
    const fill = screen.getByTestId('fatigue-fill');
    expect(fill).toBeInTheDocument();
    waitFor(() => {
        expect(fill.style.height).toBe('100%');
    });
  });

  it('should render magicka bar with default value', () => {
    render(<HUDVitals />);
    const fill = screen.getByTestId('magicka-fill');
    expect(fill).toBeInTheDocument();
    waitFor(() => {
        expect(fill.style.height).toBe('100%');
    });
  });

  it('should update bar heights based on props', () => {
    const { rerender } = render(<HUDVitals health={0.5} />);
    const fill = screen.getByTestId('health-fill');

    waitFor(() => {
        expect(fill.style.height).toBe('50%');
    });

    rerender(<HUDVitals health={0.8} fatigue={0.6} magicka={0.9} />);

    const fatigueFill = screen.getByTestId('fatigue-fill');
    const magickaFill = screen.getByTestId('magicka-fill');

    waitFor(() => {
        expect(fill.style.height).toBe('80%');
        expect(fatigueFill.style.height).toBe('60%');
        expect(magickaFill.style.height).toBe('90%');
    });
  });

  it('should be positioned bottom-left', () => {
    render(<HUDVitals />);

    const hudContainer = screen.getByTestId('hud-vitals');
    expect(hudContainer).toHaveStyle({
        position: 'absolute',
        bottom: '20px',
        left: '20px'
    });
  });
});
