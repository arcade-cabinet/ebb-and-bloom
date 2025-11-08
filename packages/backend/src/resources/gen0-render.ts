/**
 * Gen0 Rendering API - Exposes planet, moons, and visual blueprints for frontend
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { calculateMoonPosition } from '../gen0/MoonCalculation.js';

export function registerGen0RenderRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/game/:id/gen0/render
   * Get complete Gen0 rendering data (planet, moons, visual blueprints)
   */
  fastify.get<{
    Params: { id: string };
    Querystring: { time?: string };
  }>('/api/game/:id/gen0/render', async (request, reply) => {
    const { id } = request.params;
    const game = (fastify as any).games?.get(id);
    
    if (!game) {
      return reply.code(404).send({ error: 'Game not found' });
    }
    
    const state = game.getState();
    if (!state.planet || !state.gen0Data) {
      return reply.code(404).send({ error: 'Gen0 not initialized' });
    }
    
    const planet = state.planet;
    const gen0Data = state.gen0Data;
    const time = parseFloat(request.query.time || '0'); // seconds since epoch
    
    // Get moons from planet (stored during simulation)
    let moons = (planet as any).moons || [];
    
    // If no moons in planet object, check game state
    if (!moons || moons.length === 0) {
      const gamePlanet = game.getState().planet as any;
      if (gamePlanet?.moons) {
        moons = gamePlanet.moons;
      }
    }
    
    // Ensure moons is always an array
    if (!Array.isArray(moons)) {
      moons = [];
    }
    
    // Calculate current moon positions
    const moonPositions = moons.map((moon: any) => ({
      ...moon,
      position: calculateMoonPosition(moon, planet.radius, time),
    }));
    
    // Extract visual blueprint data
    const visualBlueprint = gen0Data.macro?.visualBlueprint || gen0Data.meso?.visualBlueprint || gen0Data.micro?.visualBlueprint;
    
    return {
      planet: {
        id: planet.id,
        seed: planet.seed,
        radius: planet.radius,
        mass: planet.mass,
        rotationPeriod: planet.rotationPeriod,
        layers: planet.layers,
      },
      moons: moonPositions, // Always return array, even if empty
      visualBlueprint: {
        textureReferences: visualBlueprint?.textureReferences || [],
        visualProperties: visualBlueprint?.visualProperties || {},
        representations: visualBlueprint?.representations || {},
      },
      stellarContext: gen0Data.macro?.selectedContext || 'Unknown',
    };
  });
  
  /**
   * GET /api/game/:id/gen0/textures
   * Get texture manifest for Gen0 visual blueprints
   */
  fastify.get<{
    Params: { id: string };
  }>('/api/game/:id/gen0/textures', async (request, reply) => {
    const { id } = request.params;
    const game = (fastify as any).games?.get(id);
    
    if (!game) {
      return reply.code(404).send({ error: 'Game not found' });
    }
    
    const state = game.getState();
    if (!state.gen0Data) {
      return reply.code(404).send({ error: 'Gen0 not initialized' });
    }
    
    // Extract texture references from visual blueprints
    const textureRefs = new Set<string>();
    
    [state.gen0Data.macro, state.gen0Data.meso, state.gen0Data.micro].forEach((scale: any) => {
      if (scale?.visualBlueprint?.textureReferences) {
        scale.visualBlueprint.textureReferences.forEach((ref: string) => {
          textureRefs.add(ref);
        });
      }
    });
    
    return {
      textureReferences: Array.from(textureRefs),
      message: 'Load textures from /api/textures/manifest or use texture IDs directly',
    };
  });
}

