/**
 * Gen 0: API Integration Tests
 * Tests /api/game/:id/gen0/render endpoint with full Gen0 data
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import { GameEngine } from '../src/engine/GameEngine.js';
import { registerGen0RenderRoutes } from '../src/resources/gen0-render.js';

describe('Gen 0: API Integration', () => {
  let fastify: any;
  let games: Map<string, GameEngine>;

  beforeEach(async () => {
    fastify = Fastify({ logger: false });
    games = new Map();
    
    // Attach games map to fastify instance
    (fastify as any).games = games;
    
    // Register routes
    registerGen0RenderRoutes(fastify);
    
    await fastify.ready();
  });

  afterEach(async () => {
    await fastify.close();
  });

  describe('GET /api/game/:id/gen0/render', () => {
    it('should return 404 for non-existent game', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/game/non-existent/gen0/render',
      });
      
      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Game not found');
    });

    it('should return 404 for game without Gen0', async () => {
      const engine = new GameEngine('test-no-gen0');
      games.set('test-no-gen0', engine);
      
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/game/test-no-gen0/gen0/render',
      });
      
      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Gen0 not initialized');
    });

    it('should return Gen0 render data for initialized game', async () => {
      const engine = new GameEngine('test-gen0-render');
      await engine.initialize('v1-test-seed-word');
      games.set('test-gen0-render', engine);
      
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/game/test-gen0-render/gen0/render',
      });
      
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      
      // Planet data
      expect(body.planet).toBeDefined();
      expect(body.planet.id).toBeDefined();
      expect(body.planet.seed).toBeDefined();
      expect(body.planet.radius).toBeGreaterThan(0);
      expect(body.planet.mass).toBeGreaterThan(0);
      expect(body.planet.rotationPeriod).toBeGreaterThan(0);
      expect(Array.isArray(body.planet.layers)).toBe(true);
      
      // Moons
      expect(Array.isArray(body.moons)).toBe(true);
      
      // Visual blueprint
      expect(body.visualBlueprint).toBeDefined();
      expect(body.stellarContext).toBeDefined();
    });

    it('should include all planet layers in response', async () => {
      const engine = new GameEngine('test-layers');
      await engine.initialize('v1-test-seed-word');
      games.set('test-layers', engine);
      
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/game/test-layers/gen0/render',
      });
      
      const body = JSON.parse(response.body);
      expect(body.planet.layers.length).toBeGreaterThan(0);
      
      // Should have standard layers
      const layerNames = body.planet.layers.map((l: any) => l.name);
      expect(layerNames).toContain('inner_core');
      expect(layerNames).toContain('outer_core');
      expect(layerNames).toContain('mantle');
      expect(layerNames).toContain('crust');
    });

    it('should calculate moon positions with time parameter', async () => {
      const engine = new GameEngine('test-moon-positions');
      await engine.initialize('v1-test-seed-word');
      games.set('test-moon-positions', engine);
      
      const time1 = 0;
      const response1 = await fastify.inject({
        method: 'GET',
        url: `/api/game/test-moon-positions/gen0/render?time=${time1}`,
      });
      
      const time2 = 86400; // 1 day later
      const response2 = await fastify.inject({
        method: 'GET',
        url: `/api/game/test-moon-positions/gen0/render?time=${time2}`,
      });
      
      const body1 = JSON.parse(response1.body);
      const body2 = JSON.parse(response2.body);
      
      // If moons exist, positions should differ
      if (body1.moons.length > 0) {
        expect(body1.moons[0].position).toBeDefined();
        expect(body2.moons[0].position).toBeDefined();
        // Positions should be different (unless orbital period is exactly 1 day)
        expect(body1.moons[0].position).not.toEqual(body2.moons[0].position);
      }
    });

    it('should return visual blueprint data', async () => {
      const engine = new GameEngine('test-blueprint');
      await engine.initialize('v1-test-seed-word');
      games.set('test-blueprint', engine);
      
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/game/test-blueprint/gen0/render',
      });
      
      const body = JSON.parse(response.body);
      
      expect(body.visualBlueprint).toBeDefined();
      expect(body.visualBlueprint.textureReferences).toBeDefined();
      expect(Array.isArray(body.visualBlueprint.textureReferences)).toBe(true);
      expect(body.stellarContext).toBeDefined();
      expect(typeof body.stellarContext).toBe('string');
    });

    it('should handle missing visual blueprint gracefully', async () => {
      const engine = new GameEngine('test-no-blueprint');
      await engine.initialize('v1-test-seed-word');
      games.set('test-no-blueprint', engine);
      
      // Manually clear gen0Data to test fallback
      const state = engine.getState();
      (state as any).gen0Data = {};
      
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/game/test-no-blueprint/gen0/render',
      });
      
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.visualBlueprint).toBeDefined();
      // stellarContext may be 'Unknown' or undefined when gen0Data is cleared
      expect(body.stellarContext).toBeDefined();
    });
  });

  describe('GET /api/game/:id/gen0/textures', () => {
    it('should return texture references', async () => {
      const engine = new GameEngine('test-textures');
      await engine.initialize('v1-test-seed-word');
      games.set('test-textures', engine);
      
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/game/test-textures/gen0/textures',
      });
      
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      
      expect(body.textureReferences).toBeDefined();
      expect(Array.isArray(body.textureReferences)).toBe(true);
    });

    it('should return 404 for non-existent game', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/game/non-existent/gen0/textures',
      });
      
      expect(response.statusCode).toBe(404);
    });

    it('should return 404 for game without Gen0', async () => {
      const engine = new GameEngine('test-no-gen0-textures');
      games.set('test-no-gen0-textures', engine);
      
      const response = await fastify.inject({
        method: 'GET',
        url: '/api/game/test-no-gen0-textures/gen0/textures',
      });
      
      expect(response.statusCode).toBe(404);
    });
  });
});

