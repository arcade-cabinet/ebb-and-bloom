/**
 * HUD COMPASS TESTS
 * 
 * Tests for HUDCompass component.
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HUDCompass } from '../../../../game/ui/hud/HUDCompass';

describe('HUDCompass', () => {
  it('should render compass container', () => {
    const { container } = render(<HUDCompass />);

    const compassContainer = container.querySelector('[style*="position: absolute"]');
    expect(compassContainer).toBeInTheDocument();
  });

  it('should render compass needle', () => {
    const { container } = render(<HUDCompass heading={0} />);

    const needle = container.querySelector('[style*="background-color: rgb(255, 0, 0)"]');
    expect(needle).toBeInTheDocument();
  });

  it('should render N/S/E/W labels', () => {
    const { container } = render(<HUDCompass />);

    expect(container.textContent).toContain('N');
    expect(container.textContent).toContain('S');
    expect(container.textContent).toContain('E');
    expect(container.textContent).toContain('W');
  });

  it('should rotate compass based on heading', () => {
    const { container, rerender } = render(<HUDCompass heading={0} />);

    const needle = container.querySelector('[style*="transform"]') as HTMLElement;
    const initialTransform = needle?.style.transform || '';

    rerender(<HUDCompass heading={90} />);

    const updatedNeedle = container.querySelector('[style*="transform"]') as HTMLElement;
    const updatedTransform = updatedNeedle?.style.transform || '';

    // Transform should change (though exact values depend on implementation)
    expect(updatedTransform).not.toBe(initialTransform);
  });

  it('should be positioned bottom-right', () => {
    const { container } = render(<HUDCompass />);

    const compassContainer = container.firstChild as HTMLElement;
    expect(compassContainer.style.position).toBe('absolute');
    expect(compassContainer.style.bottom).toBe('20px');
    expect(compassContainer.style.right).toBe('20px');
  });
});


