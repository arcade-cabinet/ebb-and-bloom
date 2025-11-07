/**
 * Ebb & Bloom - Backend REST API Server
 * 
 * This is the GAME SERVER. All game logic runs here.
 * Frontend and CLI both connect to this API.
 * 
 * Architecture:
 * - Game state managed in memory (or Redis for multiplayer later)
 * - REST API for synchronous operations
 * - WebSocket for real-time updates (day/night cycles, events)
 * - Stateless endpoints where possible
 * 
 * Endpoints:
 * POST   /api/game/create          - Create new game from seed
 * GET    /api/game/:id             - Get game state
 * POST   /api/game/:id/cycle       - Advance day/night cycle
 * POST   /api/game/:id/generation  - Advance generation
 * POST   /api/game/:id/command     - Execute game command
 * GET    /api/game/:id/events      - Get recent events
 * GET    /api/game/:id/creatures   - Get creatures
 * GET    /api/game/:id/materials   - Get materials at position
 * WS     /ws/game/:id              - Real-time game updates
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { GameEngine } from './engine/GameEngine.js';
import { log } from './utils/Logger.js';

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Register plugins
await fastify.register(cors, {
  origin: true, // Allow all origins for now
});

await fastify.register(websocket);

// In-memory game storage (will move to Redis for multiplayer)
const games = new Map<string, GameEngine>();

/**
 * Health check
 */
fastify.get('/health', async () => {
  return { status: 'ok', version: '0.2.0' };
});

/**
 * Create new game
 */
fastify.post<{
  Body: { seedPhrase: string; playerName?: string };
}>('/api/game/create', async (request, reply) => {
  const { seedPhrase, playerName = 'Player' } = request.body;
  
  log.info('Creating new game', { seedPhrase, playerName });
  
  try {
    const gameId = generateGameId();
    const engine = new GameEngine(gameId);
    
    await engine.initialize(seedPhrase);
    games.set(gameId, engine);
    
    log.info('Game created', { gameId, seedPhrase });
    
    return {
      gameId,
      state: engine.getState(),
    };
  } catch (error) {
    log.error('Failed to create game', error);
    reply.code(500);
    return { error: 'Failed to create game', details: error.message };
  }
});

/**
 * Get game state
 */
fastify.get<{
  Params: { id: string };
}>('/api/game/:id', async (request, reply) => {
  const { id } = request.params;
  const game = games.get(id);
  
  if (!game) {
    reply.code(404);
    return { error: 'Game not found' };
  }
  
  return {
    gameId: id,
    state: game.getState(),
  };
});

/**
 * Advance day/night cycle
 */
fastify.post<{
  Params: { id: string };
}>('/api/game/:id/cycle', async (request, reply) => {
  const { id } = request.params;
  const game = games.get(id);
  
  if (!game) {
    reply.code(404);
    return { error: 'Game not found' };
  }
  
  try {
    await game.advanceCycle();
    
    return {
      gameId: id,
      state: game.getState(),
      events: game.getRecentEvents(10),
    };
  } catch (error) {
    log.error('Failed to advance cycle', error);
    reply.code(500);
    return { error: 'Failed to advance cycle', details: error.message };
  }
});

/**
 * Advance generation
 */
fastify.post<{
  Params: { id: string };
}>('/api/game/:id/generation', async (request, reply) => {
  const { id } = request.params;
  const game = games.get(id);
  
  if (!game) {
    reply.code(404);
    return { error: 'Game not found' };
  }
  
  try {
    await game.advanceGeneration();
    
    return {
      gameId: id,
      state: game.getState(),
      events: game.getRecentEvents(20),
    };
  } catch (error) {
    log.error('Failed to advance generation', error);
    reply.code(500);
    return { error: 'Failed to advance generation', details: error.message };
  }
});

/**
 * Execute game command
 */
fastify.post<{
  Params: { id: string };
  Body: { command: string; args: any[] };
}>('/api/game/:id/command', async (request, reply) => {
  const { id } = request.params;
  const { command, args } = request.body;
  const game = games.get(id);
  
  if (!game) {
    reply.code(404);
    return { error: 'Game not found' };
  }
  
  try {
    const result = await game.executeCommand(command, args);
    
    return {
      gameId: id,
      command,
      result,
      state: game.getState(),
    };
  } catch (error) {
    log.error('Failed to execute command', error);
    reply.code(500);
    return { error: 'Failed to execute command', details: error.message };
  }
});

/**
 * Get recent events
 */
fastify.get<{
  Params: { id: string };
  Querystring: { count?: number };
}>('/api/game/:id/events', async (request, reply) => {
  const { id } = request.params;
  const { count = 50 } = request.query;
  const game = games.get(id);
  
  if (!game) {
    reply.code(404);
    return { error: 'Game not found' };
  }
  
  return {
    gameId: id,
    events: game.getRecentEvents(count),
  };
});

/**
 * WebSocket connection for real-time updates
 */
fastify.get('/ws/game/:id', { websocket: true }, (connection, request) => {
  const gameId = request.params.id;
  const game = games.get(gameId);
  
  if (!game) {
    connection.socket.close(1008, 'Game not found');
    return;
  }
  
  log.info('WebSocket client connected', { gameId });
  
  // Subscribe to game events
  const unsubscribe = game.on('event', (event) => {
    connection.socket.send(JSON.stringify({
      type: 'event',
      data: event,
    }));
  });
  
  connection.socket.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'ping') {
        connection.socket.send(JSON.stringify({ type: 'pong' }));
      }
    } catch (error) {
      log.error('WebSocket message error', error);
    }
  });
  
  connection.socket.on('close', () => {
    log.info('WebSocket client disconnected', { gameId });
    unsubscribe();
  });
});

/**
 * Start server
 */
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    
    log.info(`🎮 Ebb & Bloom Backend Server running on http://${host}:${port}`);
    log.info(`📡 WebSocket server ready on ws://${host}:${port}/ws/game/:id`);
    log.info(`🏥 Health check: http://${host}:${port}/health`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Handle shutdown gracefully
process.on('SIGTERM', async () => {
  log.info('SIGTERM received, shutting down gracefully');
  await fastify.close();
  process.exit(0);
});

start();

/**
 * Generate unique game ID
 */
function generateGameId(): string {
  return `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
