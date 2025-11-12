/**
 * GAME SCREEN
 * 
 * Main gameplay screen with 3D world and HUD.
 */

import { ReactNode } from 'react';

interface GameScreenProps {
  children: ReactNode;
}

export function GameScreen({ children }: GameScreenProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
      }}
    >
      {children}
    </div>
  );
}




