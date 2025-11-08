/**
 * Hook to load GEN0 data from packages/gen
 */

import { useState, useEffect } from 'react';
import { generateGen0DataPools } from '@ebb/backend/src/gen-systems/loadGenData';

export function useGen0Data() {
  const [gen0Data, setGen0Data] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Use a test seed for now
        const seed = 'test-gen0-seed';
        const data = await generateGen0DataPools(seed);
        setGen0Data(data);
      } catch (error) {
        console.error('Failed to load GEN0 data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return gen0Data;
}

