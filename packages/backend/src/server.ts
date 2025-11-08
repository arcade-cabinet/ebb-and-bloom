/**
 * SIMPLEST POSSIBLE REST API
 * 
 * Two endpoints:
 * 1. POST /api/game/create - Create game
 * 2. GET  /api/game/:id    - Get state
 * 
 * That's IT.
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { GameEngine } from './engine/GameEngine.js';
import { registerPlanetRoutes } from './resources/planet.js';
import { registerSeedRoutes } from './seed/seed-routes.js';
import { seedMiddleware, extractSeedFromRequest } from './seed/seed-middleware.js';

const fastify = Fastify({
  logger: true,
});

await fastify.register(cors, { origin: true });
await fastify.register(cookie);

const games = new Map<string, GameEngine>();

// Register seed routes (must be before other routes)
await registerSeedRoutes(fastify);

// Register planet routes
await registerPlanetRoutes(fastify);

fastify.get('/health', async () => {
  return { status: 'ok' };
});

fastify.post<{
  Body: { seedPhrase?: string; seed?: string };
}>('/api/game/create', async (request, reply) => {
  // Extract seed from header/cookie/query/body (seed middleware priority)
  const seed = extractSeedFromRequest(request) || request.body.seed || request.body.seedPhrase;
  
  if (!seed) {
    return reply.code(400).send({
      error: 'Seed required',
      message: 'Provide seed via x-seed header, seed cookie, ?seed= query param, or body.seed',
      example: {
        header: 'x-seed: v1-red-blue-green',
        cookie: 'Cookie: seed=v1-red-blue-green',
        query: '?seed=v1-red-blue-green',
        body: '{ "seed": "v1-red-blue-green" }',
      },
    });
  }
  
  const gameId = `game-${Date.now()}`;
  const engine = new GameEngine(gameId);
  await engine.initialize(seed);
  games.set(gameId, engine);
  
  return {
    gameId,
    seed,
    state: engine.getState(),
    message: 'Game created. Use x-seed header or seed cookie for subsequent requests.',
  };
});

fastify.get<{
  Params: { id: string };
}>('/api/game/:id', async (request, reply) => {
  const { id } = request.params;
  const game = games.get(id);
  
  if (!game) {
    reply.code(404);
    return { error: 'Game not found' };
  }
  
  return { state: game.getState() };
});

fastify.post<{
  Params: { id: string };
}>('/api/game/:id/generation', async (request, reply) => {
  const { id } = request.params;
  const game = games.get(id);
  
  if (!game) {
    reply.code(404);
    return { error: 'Game not found' };
  }
  
  await game.advanceGeneration();
  return { state: game.getState() };
});

const start = async () => {
  try {
    const port = 3000;
    const host = '0.0.0.0';
    await fastify.listen({ port, host });
    console.log(`Backend running on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
