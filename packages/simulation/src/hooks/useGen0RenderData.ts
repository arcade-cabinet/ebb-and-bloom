/**
 * Hook to load Gen0 rendering data from backend API
 */

import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3001';

export interface Gen0RenderData {
  planet: {
    id: string;
    seed: string;
    radius: number;
    mass: number;
    rotationPeriod: number;
    layers: any[];
  };
  moons: Array<{
    id: string;
    name: string;
    radius: number;
    mass: number;
    orbitalDistance: number;
    orbitalPeriod: number;
    position: { x: number; y: number; z: number };
  }>;
  visualBlueprint: {
    textureReferences: string[];
    visualProperties: {
      pbrProperties?: {
        baseColor?: string;
        roughness?: number;
        metallic?: number;
        emissive?: string;
      };
      colorPalette?: string[];
    };
    representations?: any;
  };
  stellarContext: string;
}

export function useGen0RenderData(gameId: string | null, time: number = 0) {
  const [data, setData] = useState<Gen0RenderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/game/${gameId}/gen0/render?time=${time}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load Gen0 data: ${response.statusText}`);
        }
        
        const renderData = await response.json();
        setData(renderData);
        setError(null);
      } catch (err) {
        console.error('Failed to load Gen0 render data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [gameId, time]);

  return { data, loading, error };
}

