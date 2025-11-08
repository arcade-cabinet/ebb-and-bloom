import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';

describe('Backend API Integration Tests', () => {
  const API_URL = 'http://localhost:3001';
  
  // These tests require the backend server to be running
  // Run with: pnpm dev:backend (in another terminal)
  
  describe('Health Check', () => {
    it('should respond to health endpoint', async () => {
      const response = await axios.get(`${API_URL}/health`);
      
      expect(response.status).toBe(200);
      expect(response.data).toEqual({ status: 'ok' });
    });
  });
  
  describe('Game Creation', () => {
    it('should create game with seed phrase', async () => {
      const response = await axios.post(`${API_URL}/api/game/create`, {
        seedPhrase: 'test-world',
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('gameId');
      expect(response.data).toHaveProperty('state');
      expect(response.data.state.seedPhrase).toBe('test-world');
      expect(response.data.state.generation).toBe(0);
    });
    
    it('should create unique game IDs', async () => {
      const response1 = await axios.post(`${API_URL}/api/game/create`, {
        seedPhrase: 'world-1',
      });
      
      const response2 = await axios.post(`${API_URL}/api/game/create`, {
        seedPhrase: 'world-2',
      });
      
      expect(response1.data.gameId).not.toBe(response2.data.gameId);
    });
  });
  
  describe('Game State Retrieval', () => {
    let gameId: string;
    
    beforeAll(async () => {
      const response = await axios.post(`${API_URL}/api/game/create`, {
        seedPhrase: 'retrieval-test',
      });
      gameId = response.data.gameId;
    });
    
    it('should retrieve game state', async () => {
      const response = await axios.get(`${API_URL}/api/game/${gameId}`);
      
      expect(response.status).toBe(200);
      expect(response.data.state.gameId).toBe(gameId);
      expect(response.data.state.seedPhrase).toBe('retrieval-test');
    });
    
    it('should return 404 for non-existent game', async () => {
      try {
        await axios.get(`${API_URL}/api/game/non-existent-game`);
        expect.fail('Should have thrown 404');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.error).toBe('Game not found');
      }
    });
  });
  
  describe('Generation Advancement', () => {
    let gameId: string;
    
    beforeAll(async () => {
      const response = await axios.post(`${API_URL}/api/game/create`, {
        seedPhrase: 'generation-test',
      });
      gameId = response.data.gameId;
    });
    
    it('should advance generation', async () => {
      const response = await axios.post(`${API_URL}/api/game/${gameId}/generation`);
      
      expect(response.status).toBe(200);
      expect(response.data.state.generation).toBe(1);
    });
    
    it('should persist generation changes', async () => {
      // Advance
      await axios.post(`${API_URL}/api/game/${gameId}/generation`);
      
      // Retrieve
      const response = await axios.get(`${API_URL}/api/game/${gameId}`);
      
      expect(response.data.state.generation).toBe(2);
    });
    
    it('should return 404 for non-existent game', async () => {
      try {
        await axios.post(`${API_URL}/api/game/non-existent-game/generation`);
        expect.fail('Should have thrown 404');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });
});
