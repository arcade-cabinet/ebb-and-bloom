/**
 * BASE SCREEN
 * 
 * Base component for all UI screens (DFU DaggerfallBaseWindow pattern).
 * Provides common functionality for all screens.
 */

import { ReactNode } from 'react';

export interface BaseScreenProps {
  children: ReactNode;
  className?: string;
}

export function BaseScreen({ children, className = '' }: BaseScreenProps) {
  return (
    <div
      className={`screen ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1A202C', // Dark background from theme
        zIndex: 100,
      }}
    >
      {children}
    </div>
  );
}

