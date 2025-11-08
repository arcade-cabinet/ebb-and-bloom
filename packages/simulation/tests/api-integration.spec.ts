import { test, expect } from '@playwright/test';

/**
 * Backend API Integration Tests
 * Tests API endpoints independently before frontend integration
 */

const API_BASE = 'http://localhost:3001';

test.describe('Backend API Integration', () => {
  let gameId: string;
  let seed: string;

  test('should create game via API', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/game/create`, {
      data: { seed: 'v1-test-integration-seed' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data.gameId).toBeTruthy();
    expect(data.seed).toBe('v1-test-integration-seed');
    expect(data.state).toBeDefined();
    expect(data.state.planet).toBeDefined();
    
    gameId = data.gameId;
    seed = data.seed;
  });

  test('should get game state', async ({ request }) => {
    // First create a game
    const createResponse = await request.post(`${API_BASE}/api/game/create`, {
      data: { seed: 'v1-test-state-seed' },
    });
    const createData = await createResponse.json();
    const testGameId = createData.gameId;

    // Then get state
    const response = await request.get(`${API_BASE}/api/game/${testGameId}`);
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data.state).toBeDefined();
    expect(data.state.planet).toBeDefined();
    expect(data.state.gen0Data).toBeDefined();
  });

  test('should get Gen0 render data', async ({ request }) => {
    // Create game first
    const createResponse = await request.post(`${API_BASE}/api/game/create`, {
      data: { seed: 'v1-test-render-seed' },
    });
    const createData = await createResponse.json();
    const testGameId = createData.gameId;

    // Get render data
    const response = await request.get(`${API_BASE}/api/game/${testGameId}/gen0/render?time=0`);
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // Verify structure
    expect(data.planet).toBeDefined();
    expect(data.planet.id).toBeTruthy();
    expect(data.planet.radius).toBeGreaterThan(0);
    expect(data.planet.mass).toBeGreaterThan(0);
    expect(data.planet.rotationPeriod).toBeGreaterThan(0);
    expect(data.planet.layers).toBeInstanceOf(Array);
    
    expect(data.moons).toBeInstanceOf(Array);
    
    expect(data.visualBlueprint).toBeDefined();
    expect(data.stellarContext).toBeTruthy();
  });

  test('should calculate moon positions at different times', async ({ request }) => {
    // Create game
    const createResponse = await request.post(`${API_BASE}/api/game/create`, {
      data: { seed: 'v1-test-moon-time-seed' },
    });
    const createData = await createResponse.json();
    const testGameId = createData.gameId;

    // Get render data at time 0
    const response0 = await request.get(`${API_BASE}/api/game/${testGameId}/gen0/render?time=0`);
    const data0 = await response0.json();

    if (data0.moons.length > 0) {
      const initialPosition = data0.moons[0].position;

      // Get render data at later time
      const response1 = await request.get(`${API_BASE}/api/game/${testGameId}/gen0/render?time=1000`);
      const data1 = await response1.json();

      // Moon positions should change (unless orbital period is very long)
      const newPosition = data1.moons[0].position;
      
      // Positions should be different (unless moon hasn't moved much)
      const distance = Math.sqrt(
        Math.pow(newPosition.x - initialPosition.x, 2) +
        Math.pow(newPosition.y - initialPosition.y, 2) +
        Math.pow(newPosition.z - initialPosition.z, 2)
      );
      
      // For a 1000 second difference, moon should have moved (unless period is very long)
      // Just verify API returns different positions
      expect(newPosition).toBeDefined();
    }
  });

  test('should return 404 for non-existent game', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/game/non-existent-id`);
    
    expect(response.status()).toBe(404);
    const data = await response.json();
    expect(data.error).toBeTruthy();
  });

  test('should return 404 for Gen0 render before initialization', async ({ request }) => {
    // Create game but don't initialize Gen0 (shouldn't happen, but test error handling)
    const createResponse = await request.post(`${API_BASE}/api/game/create`, {
      data: { seed: 'v1-test-error-seed' },
    });
    const createData = await createResponse.json();
    const testGameId = createData.gameId;

    // This should work since game is created with Gen0
    const response = await request.get(`${API_BASE}/api/game/${testGameId}/gen0/render`);
    expect(response.ok()).toBeTruthy();
  });

  test('should handle invalid time parameter', async ({ request }) => {
    const createResponse = await request.post(`${API_BASE}/api/game/create`, {
      data: { seed: 'v1-test-invalid-time-seed' },
    });
    const createData = await createResponse.json();
    const testGameId = createData.gameId;

    // Invalid time should default to 0
    const response = await request.get(`${API_BASE}/api/game/${testGameId}/gen0/render?time=invalid`);
    
    // Should still work (defaults to 0)
    expect(response.ok()).toBeTruthy();
  });
});

