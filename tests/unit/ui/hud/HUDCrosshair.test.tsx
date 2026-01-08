/**
 * HUD CROSSHAIR TESTS
 * 
 * Tests for HUDCrosshair component.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { HUDCrosshair } from '../../../../game/ui/hud/HUDCrosshair';

afterEach(() => {
  cleanup();
});

describe('HUDCrosshair', () => {
  it('should render crosshair container', () => {
    render(<HUDCrosshair />);

    const crosshairContainer = screen.getByTestId('hud-crosshair');
    expect(crosshairContainer).toBeInTheDocument();
  });

  it('should be centered on screen', () => {
    render(<HUDCrosshair />);

    const crosshairContainer = screen.getByTestId('hud-crosshair');
    expect(crosshairContainer).toHaveStyle({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
    });
  });

  it('should have pointer-events: none', () => {
    render(<HUDCrosshair />);

    const crosshairContainer = screen.getByTestId('hud-crosshair');
    expect(crosshairContainer).toHaveStyle({
        pointerEvents: 'none'
    });
  });

  it('should render horizontal and vertical lines', () => {
    render(<HUDCrosshair />);

    expect(screen.getByTestId('crosshair-horizontal')).toBeInTheDocument();
    expect(screen.getByTestId('crosshair-vertical')).toBeInTheDocument();
  });
});
