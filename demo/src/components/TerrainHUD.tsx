/**
 * TERRAIN HUD
 * 
 * R3F + Zustand version of the HTML HUD from game.html
 */

import React from 'react';
import { useGameStore } from '../store/gameStore';
import './TerrainHUD.css';

export const TerrainHUD: React.FC = () => {
  const { player, world, performance, ui } = useGameStore();
  
  if (!ui.showHUD) return null;
  
  const hour = Math.floor(world.time);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return (
    <div className="terrain-hud">
      <div className="hud-panel">
        <div className="mono">
          Position: {player.position.x.toFixed(1)}, {player.position.y.toFixed(1)}, {player.position.z.toFixed(1)}
        </div>
        <div className="mono">
          Time: {displayHour}:00 {ampm}
        </div>
        <div className="mono">
          FPS: {performance.fps}
        </div>
        <div className="mono">
          Chunks: {world.loadedChunks.size}
        </div>
      </div>
      
      <div className="compass">
        N
      </div>
    </div>
  );
};

