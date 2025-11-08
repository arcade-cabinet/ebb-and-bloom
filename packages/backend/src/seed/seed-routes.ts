/**
 * SEED API ROUTES
 * 
 * POST /api/seed/generate - Generate new seed
 * GET  /api/seed/validate - Validate seed format
 * GET  /api/seed/info     - Get seed info (components, version)
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { generateSeed, validateSeed, getSeedInfo } from './seed-manager.js';
import { setSeedCookie } from './seed-middleware.js';

export async function registerSeedRoutes(fastify: FastifyInstance) {
  /**
   * Generate a new deterministic seed
   * POST /api/seed/generate
   */
  fastify.post('/api/seed/generate', async (request: FastifyRequest, reply: FastifyReply) => {
    const seed = generateSeed();
    const info = getSeedInfo(seed);

    // Set cookie for session persistence
    setSeedCookie(reply, seed);

    return {
      seed,
      version: info.version,
      components: info.components,
      message: 'Seed generated. Use x-seed header or seed cookie for subsequent requests.',
      usage: {
        header: `x-seed: ${seed}`,
        cookie: `Cookie: seed=${seed}`,
        query: `?seed=${seed}`,
        body: `{ "seed": "${seed}" }`,
      },
    };
  });

  /**
   * Validate seed format
   * GET /api/seed/validate?seed=v1-red-blue-green
   */
  fastify.get<{
    Querystring: { seed: string };
  }>('/api/seed/validate', async (request, reply) => {
    const { seed } = request.query;

    if (!seed) {
      return reply.code(400).send({
        error: 'Seed required',
        message: 'Provide seed via ?seed= query parameter',
        example: '/api/seed/validate?seed=v1-red-blue-green',
      });
    }

    const validation = validateSeed(seed);

    if (!validation.valid) {
      return reply.code(400).send({
        valid: false,
        error: validation.error,
        seed,
      });
    }

    const info = getSeedInfo(seed);

    return {
      valid: true,
      seed: validation.seed,
      version: validation.version,
      components: info.components,
    };
  });

  /**
   * Get seed info (components, version)
   * GET /api/seed/info?seed=v1-red-blue-green
   */
  fastify.get<{
    Querystring: { seed: string };
  }>('/api/seed/info', async (request, reply) => {
    const { seed } = request.query;

    if (!seed) {
      return reply.code(400).send({
        error: 'Seed required',
        message: 'Provide seed via ?seed= query parameter',
        example: '/api/seed/info?seed=v1-red-blue-green',
      });
    }

    const validation = validateSeed(seed);

    if (!validation.valid) {
      return reply.code(400).send({
        error: validation.error,
        seed,
      });
    }

    const info = getSeedInfo(seed);

    return {
      seed: info.seed,
      version: info.version,
      components: info.components,
      generationSeeds: {
        gen0: `${seed}-gen0`,
        gen1: `${seed}-gen1`,
        gen2: `${seed}-gen2`,
        gen3: `${seed}-gen3`,
        gen4: `${seed}-gen4`,
        gen5: `${seed}-gen5`,
        gen6: `${seed}-gen6`,
      },
    };
  });
}

