/**
 * Planet RESTful Resource
 * Endpoints for querying planetary composition
 */

import type { FastifyInstance } from 'fastify';
import { PlanetaryComposition } from '../planetary/composition.js';
import { getAllMaterials } from '../planetary/layers.js';

export async function registerPlanetRoutes(fastify: FastifyInstance) {
  // Get planetary structure overview
  fastify.get('/api/game/:id/planet/structure', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    // TODO: Get game state and seed from game engine
    const seed = id; // Temporary: use game ID as seed
    const composition = new PlanetaryComposition(seed);
    
    return composition.getLayerStructure();
  });

  // Query material at a specific point
  fastify.get('/api/game/:id/planet/query', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { x, y, z } = request.query as { x: string; y: string; z: string };
    
    if (!x || !y || !z) {
      return reply.status(400).send({
        error: 'Missing required query parameters: x, y, z',
      });
    }
    
    const seed = id;
    const composition = new PlanetaryComposition(seed);
    
    const point = composition.queryPoint(
      parseFloat(x),
      parseFloat(y),
      parseFloat(z)
    );
    
    return point;
  });

  // Query vertical column from surface to core
  fastify.get('/api/game/:id/planet/column', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { x, z, stepSize } = request.query as { 
      x: string; 
      z: string; 
      stepSize?: string;
    };
    
    if (!x || !z) {
      return reply.status(400).send({
        error: 'Missing required query parameters: x, z',
      });
    }
    
    const seed = id;
    const composition = new PlanetaryComposition(seed);
    
    const column = composition.queryColumn(
      parseFloat(x),
      parseFloat(z),
      stepSize ? parseFloat(stepSize) : 100000 // Default 100km steps
    );
    
    return {
      position: { x: parseFloat(x), z: parseFloat(z) },
      stepSize: stepSize ? parseFloat(stepSize) : 100000,
      points: column,
    };
  });

  // Query 2D slice at specific Y level
  fastify.get('/api/game/:id/planet/slice', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { y, minX, maxX, minZ, maxZ, resolution } = request.query as {
      y: string;
      minX: string;
      maxX: string;
      minZ: string;
      maxZ: string;
      resolution?: string;
    };
    
    if (!y || !minX || !maxX || !minZ || !maxZ) {
      return reply.status(400).send({
        error: 'Missing required query parameters: y, minX, maxX, minZ, maxZ',
      });
    }
    
    const seed = id;
    const composition = new PlanetaryComposition(seed);
    
    const slice = composition.querySlice(
      parseFloat(y),
      {
        minX: parseFloat(minX),
        maxX: parseFloat(maxX),
        minZ: parseFloat(minZ),
        maxZ: parseFloat(maxZ),
      },
      resolution ? parseFloat(resolution) : 10000 // Default 10km resolution
    );
    
    return {
      y: parseFloat(y),
      bounds: {
        minX: parseFloat(minX),
        maxX: parseFloat(maxX),
        minZ: parseFloat(minZ),
        maxZ: parseFloat(maxZ),
      },
      resolution: resolution ? parseFloat(resolution) : 10000,
      grid: slice,
    };
  });

  // Raycast through planet
  fastify.get('/api/game/:id/planet/raycast', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { startX, startY, startZ, dirX, dirY, dirZ, stepSize } = request.query as {
      startX: string;
      startY: string;
      startZ: string;
      dirX: string;
      dirY: string;
      dirZ: string;
      stepSize?: string;
    };
    
    if (!startX || !startY || !startZ || !dirX || !dirY || !dirZ) {
      return reply.status(400).send({
        error: 'Missing required parameters: startX, startY, startZ, dirX, dirY, dirZ',
      });
    }
    
    const seed = id;
    const composition = new PlanetaryComposition(seed);
    
    const points = composition.raycast(
      {
        x: parseFloat(startX),
        y: parseFloat(startY),
        z: parseFloat(startZ),
      },
      {
        x: parseFloat(dirX),
        y: parseFloat(dirY),
        z: parseFloat(dirZ),
      },
      undefined,
      stepSize ? parseFloat(stepSize) : 100000 // Default 100km steps
    );
    
    return {
      start: {
        x: parseFloat(startX),
        y: parseFloat(startY),
        z: parseFloat(startZ),
      },
      direction: {
        x: parseFloat(dirX),
        y: parseFloat(dirY),
        z: parseFloat(dirZ),
      },
      stepSize: stepSize ? parseFloat(stepSize) : 100000,
      points,
    };
  });

  // Get all materials
  fastify.get('/api/game/:id/planet/materials', async (request, reply) => {
    return {
      materials: getAllMaterials(),
    };
  });
}
