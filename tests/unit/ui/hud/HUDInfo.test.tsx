/**
 * HUD INFO TESTS
 * 
 * Tests for HUDInfo component.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HUDInfo } from '../../../../game/ui/hud/HUDInfo';

describe('HUDInfo', () => {
  it('should render game title', () => {
    render(<HUDInfo />);

    expect(screen.getByText('Ebb & Bloom')).toBeInTheDocument();
  });

  it('should render seed when provided', () => {
    render(<HUDInfo seed="v1-test-seed" />);

    expect(screen.getByText(/Seed: v1-test-seed/)).toBeInTheDocument();
  });

  it('should render position when provided', () => {
    render(<HUDInfo position={{ x: 100, y: 50, z: 200 }} />);

    expect(screen.getByText(/\(100, 50, 200\)/)).toBeInTheDocument();
  });

  it('should render controls help text', () => {
    render(<HUDInfo />);

    expect(screen.getByText(/Click to lock pointer/)).toBeInTheDocument();
    expect(screen.getByText(/WASD - Move/)).toBeInTheDocument();
    expect(screen.getByText(/Mouse - Look/)).toBeInTheDocument();
    expect(screen.getByText(/Space - Jump/)).toBeInTheDocument();
    expect(screen.getByText(/ESC - Pause/)).toBeInTheDocument();
  });

  it('should be positioned top-left', () => {
    const { container } = render(<HUDInfo />);

    const infoContainer = container.firstChild as HTMLElement;
    expect(infoContainer.style.position).toBe('absolute');
    expect(infoContainer.style.top).toBe('20px');
    expect(infoContainer.style.left).toBe('20px');
  });

  it('should format position coordinates correctly', () => {
    render(<HUDInfo position={{ x: 123.456, y: 78.9, z: 0.123 }} />);

    expect(screen.getByText(/\(123, 79, 0\)/)).toBeInTheDocument();
  });
});


