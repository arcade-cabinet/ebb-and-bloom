/**
 * TERRAIN CONTROLS
 * 
 * Instructions and controls overlay
 */

import React from 'react';
import { Link } from 'react-router-dom';
import './TerrainControls.css';

export const TerrainControls: React.FC = () => {
  return (
    <div className="controls-overlay">
      <Link to="/" className="back-button">
        ← Back to Demos
      </Link>
      
      <div className="instructions">
        <h4>Controls</h4>
        <ul>
          <li><kbd>W/A/S/D</kbd> Move</li>
          <li><kbd>Mouse</kbd> Look around</li>
          <li><kbd>Shift</kbd> Sprint</li>
          <li><kbd>Space</kbd> Jump</li>
          <li><kbd>ESC</kbd> Release mouse</li>
        </ul>
      </div>
    </div>
  );
};

