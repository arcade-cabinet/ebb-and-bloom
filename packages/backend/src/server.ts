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
import { GameEngine } from './engine/GameEngine.js';

const fastify = Fastify({
  logger: true,
});

await fastify.register(cors, { origin: true });

const games = new Map<string, GameEngine>();

fastify.get('/health', async () => {
  return { status: 'ok' };
});

fastify.post<{
  Body: { seedPhrase: string };
}>('/api/game/create', async (request, reply) => {
  const { seedPhrase } = request.body;
  
  const gameId = `game-${Date.now()}`;
  const engine = new GameEngine(gameId);
  await engine.initialize(seedPhrase);
  games.set(gameId, engine);
  
  return {
    gameId,
    state: engine.getState(),
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
    const port = 3001;
    const host = '0.0.0.0';
    await fastify.listen({ port, host });
    console.log(`Backend running on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
