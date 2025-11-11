/**
 * HUD TESTS
 * 
 * Tests for HUD component.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UIManagerProvider, ScreenType } from '../../../../game/ui/UIManager';
import { HUD } from '../../../../game/ui/hud/HUD';

describe('HUD', () => {
  it('should not render when HUD is not visible', () => {
    render(
      <UIManagerProvider initialScreen={ScreenType.MENU}>
        <HUD />
      </UIManagerProvider>
    );

    // HUD should not render when screen is MENU
    expect(screen.queryByTestId('hud-vitals')).not.toBeInTheDocument();
  });

  it('should render when HUD is visible', () => {
    const { container } = render(
      <UIManagerProvider initialScreen={ScreenType.GAME}>
        <HUD />
      </UIManagerProvider>
    );

    // HUD components should be present - check for HUDVitals (has specific styling)
    const vitalsContainer = container.querySelector('[style*="bottom: 20px"][style*="left: 20px"]');
    expect(vitalsContainer).toBeTruthy();
  });
});

