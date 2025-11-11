/**
 * HUD CROSSHAIR TESTS
 * 
 * Tests for HUDCrosshair component.
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HUDCrosshair } from '../../../../game/ui/hud/HUDCrosshair';

describe('HUDCrosshair', () => {
  it('should render crosshair container', () => {
    const { container } = render(<HUDCrosshair />);

    const crosshairContainer = container.querySelector('[style*="position: absolute"]');
    expect(crosshairContainer).toBeInTheDocument();
  });

  it('should be centered on screen', () => {
    const { container } = render(<HUDCrosshair />);

    const crosshairContainer = container.firstChild as HTMLElement;
    expect(crosshairContainer.style.top).toBe('50%');
    expect(crosshairContainer.style.left).toBe('50%');
    expect(crosshairContainer.style.transform).toContain('translate(-50%, -50%)');
  });

  it('should have pointer-events: none', () => {
    const { container } = render(<HUDCrosshair />);

    const crosshairContainer = container.firstChild as HTMLElement;
    expect(crosshairContainer.style.pointerEvents).toBe('none');
  });

  it('should render horizontal and vertical lines', () => {
    const { container } = render(<HUDCrosshair />);

    const lines = container.querySelectorAll('[style*="background-color: rgba(255, 255, 255, 0.8)"]');
    expect(lines.length).toBeGreaterThanOrEqual(2); // Horizontal and vertical
  });
});


