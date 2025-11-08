/**
 * Integration tests for Seed API endpoints
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { registerSeedRoutes } from '../src/seed/seed-routes.js';

describe('Seed API Integration', () => {
  let app: ReturnType<typeof Fastify>;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await app.register(cors, { origin: true });
    await app.register(cookie);
    await registerSeedRoutes(app);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/seed/generate', () => {
    it('generates a valid seed', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/seed/generate',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      
      expect(body.seed).toMatch(/^v\d+-[a-z]+-[a-z]+-[a-z]+$/);
      expect(body.version).toBe('v1');
      expect(body.components).toBeDefined();
      expect(body.components.macro).toBeGreaterThanOrEqual(0);
      expect(body.components.macro).toBeLessThan(1);
      expect(body.components.meso).toBeGreaterThanOrEqual(0);
      expect(body.components.meso).toBeLessThan(1);
      expect(body.components.micro).toBeGreaterThanOrEqual(0);
      expect(body.components.micro).toBeLessThan(1);
      expect(body.usage).toBeDefined();
    });

    it('sets seed cookie', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/seed/generate',
      });

      expect(response.statusCode).toBe(200);
      const cookies = response.cookies;
      expect(cookies).toBeDefined();
      expect(cookies.length).toBeGreaterThan(0);
      
      const seedCookie = cookies.find(c => c.name === 'seed');
      expect(seedCookie).toBeDefined();
      expect(seedCookie?.value).toMatch(/^v\d+-[a-z]+-[a-z]+-[a-z]+$/);
    });

    it('generates different seeds on each call', async () => {
      const response1 = await app.inject({
        method: 'POST',
        url: '/api/seed/generate',
      });
      
      const response2 = await app.inject({
        method: 'POST',
        url: '/api/seed/generate',
      });

      const body1 = JSON.parse(response1.body);
      const body2 = JSON.parse(response2.body);

      expect(body1.seed).not.toBe(body2.seed);
    });
  });

  describe('GET /api/seed/validate', () => {
    it('validates correct seed', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/seed/validate?seed=v1-red-blue-green',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      
      expect(body.valid).toBe(true);
      expect(body.seed).toBe('v1-red-blue-green');
      expect(body.version).toBe('v1');
      expect(body.components).toBeDefined();
    });

    it('rejects invalid seed format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/seed/validate?seed=invalid-seed',
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      
      expect(body.valid).toBe(false);
      expect(body.error).toBeDefined();
    });

    it('requires seed parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/seed/validate',
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      
      expect(body.error).toBe('Seed required');
    });

    it('rejects wrong version', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/seed/validate?seed=v2-red-blue-green',
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      
      expect(body.valid).toBe(false);
      expect(body.error).toContain('Unsupported seed version');
    });
  });

  describe('GET /api/seed/info', () => {
    it('returns seed info with generation seeds', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/seed/info?seed=v1-red-blue-green',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      
      expect(body.seed).toBe('v1-red-blue-green');
      expect(body.version).toBe('v1');
      expect(body.components).toBeDefined();
      expect(body.generationSeeds).toBeDefined();
      expect(body.generationSeeds.gen0).toBe('v1-red-blue-green-gen0');
      expect(body.generationSeeds.gen1).toBe('v1-red-blue-green-gen1');
      expect(body.generationSeeds.gen6).toBe('v1-red-blue-green-gen6');
    });

    it('requires seed parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/seed/info',
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      
      expect(body.error).toBe('Seed required');
    });

    it('rejects invalid seed', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/seed/info?seed=invalid',
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      
      expect(body.error).toBeDefined();
    });
  });

  describe('Seed Determinism', () => {
    it('same seed produces same components', async () => {
      const seed = 'v1-test-deterministic-seed';
      
      const response1 = await app.inject({
        method: 'GET',
        url: `/api/seed/info?seed=${seed}`,
      });
      
      const response2 = await app.inject({
        method: 'GET',
        url: `/api/seed/info?seed=${seed}`,
      });

      const body1 = JSON.parse(response1.body);
      const body2 = JSON.parse(response2.body);

      expect(body1.components.macro).toBe(body2.components.macro);
      expect(body1.components.meso).toBe(body2.components.meso);
      expect(body1.components.micro).toBe(body2.components.micro);
    });

    it('different seeds produce different components', async () => {
      const response1 = await app.inject({
        method: 'GET',
        url: '/api/seed/info?seed=v1-red-blue-green',
      });
      
      const response2 = await app.inject({
        method: 'GET',
        url: '/api/seed/info?seed=v1-blue-red-green',
      });

      const body1 = JSON.parse(response1.body);
      const body2 = JSON.parse(response2.body);

      expect(body1.components.macro).not.toBe(body2.components.macro);
    });
  });

  describe('Generation Seed Chaining', () => {
    it('generates consistent generation seeds', async () => {
      const baseSeed = 'v1-chain-test-seed';
      
      const response = await app.inject({
        method: 'GET',
        url: `/api/seed/info?seed=${baseSeed}`,
      });

      const body = JSON.parse(response.body);
      const genSeeds = body.generationSeeds;

      // Verify all generations are present
      expect(genSeeds.gen0).toBeDefined();
      expect(genSeeds.gen1).toBeDefined();
      expect(genSeeds.gen2).toBeDefined();
      expect(genSeeds.gen3).toBeDefined();
      expect(genSeeds.gen4).toBeDefined();
      expect(genSeeds.gen5).toBeDefined();
      expect(genSeeds.gen6).toBeDefined();

      // Verify they're all different
      const unique = new Set(Object.values(genSeeds));
      expect(unique.size).toBe(7);

      // Verify format
      Object.values(genSeeds).forEach((genSeed: any) => {
        expect(genSeed).toMatch(/^v\d+-[a-z]+-[a-z]+-[a-z]+-gen\d+$/);
      });
    });
  });
});

