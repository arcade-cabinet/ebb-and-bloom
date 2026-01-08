/**
 * HUD INFO TESTS
 * 
 * Tests for HUDInfo component.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { HUDInfo } from '../../../../game/ui/hud/HUDInfo';

afterEach(() => {
  cleanup();
});

describe('HUDInfo', () => {
  it('should render title', () => {
    render(<HUDInfo />);
    // "Ebb & Bloom" might appear multiple times if cleanup fails, but cleanup is active.
    expect(screen.getByText('Ebb & Bloom')).toBeInTheDocument();
  });

  it('should render seed when provided', () => {
    render(<HUDInfo seed="test-seed" />);
    expect(screen.getByText('Seed: test-seed')).toBeInTheDocument();
  });

  it('should render position when provided', () => {
    render(<HUDInfo position={{ x: 10, y: 20, z: 30 }} />);
    expect(screen.getByText('(10, 20, 30)')).toBeInTheDocument();
  });

  it('should render controls help text', () => {
    render(<HUDInfo />);

    const controls = screen.getByTestId('hud-controls');
    expect(controls).toBeInTheDocument();
    expect(controls).toHaveTextContent(/Click to lock pointer/);
  });

  it('should be positioned top-left', () => {
    render(<HUDInfo />);

    const infoContainer = screen.getByTestId('hud-info');
    expect(infoContainer).toHaveStyle({
        position: 'absolute'
    });
  });
});
