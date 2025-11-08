/**
 * SEED MIDDLEWARE - Extract seed from headers/cookies
 * 
 * Priority:
 * 1. x-seed header (API key style)
 * 2. Cookie: seed
 * 3. Query param: ?seed=...
 * 4. Body: { seed: ... }
 * 
 * Validates seed format and attaches to request
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { validateSeed, getSeedInfo } from './seed-manager.js';

declare module 'fastify' {
  interface FastifyRequest {
    seed?: string;
    seedInfo?: ReturnType<typeof getSeedInfo>;
  }
}

export interface SeedMiddlewareOptions {
  required?: boolean; // Require seed for all routes
  cookieName?: string; // Cookie name (default: 'seed')
  headerName?: string; // Header name (default: 'x-seed')
}

const DEFAULT_OPTIONS: Required<SeedMiddlewareOptions> = {
  required: false,
  cookieName: 'seed',
  headerName: 'x-seed',
};

/**
 * Extract seed from request (header > cookie > query > body)
 */
export function extractSeedFromRequest(
  request: FastifyRequest,
  options: SeedMiddlewareOptions = {}
): string | null {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // 1. Check header (x-seed)
  const headerSeed = request.headers[opts.headerName.toLowerCase()];
  if (headerSeed && typeof headerSeed === 'string') {
    return headerSeed;
  }

  // 2. Check cookie
  const cookieSeed = request.cookies?.[opts.cookieName];
  if (cookieSeed) {
    return cookieSeed;
  }

  // 3. Check query param
  const querySeed = (request.query as any)?.seed;
  if (querySeed && typeof querySeed === 'string') {
    return querySeed;
  }

  // 4. Check body
  const bodySeed = (request.body as any)?.seed;
  if (bodySeed && typeof bodySeed === 'string') {
    return bodySeed;
  }

  return null;
}

/**
 * Fastify middleware to extract and validate seed
 */
export async function seedMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  options: SeedMiddlewareOptions = {}
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const seed = extractSeedFromRequest(request, opts);
  
  if (!seed) {
    if (opts.required) {
      return reply.code(400).send({
        error: 'Seed required',
        message: `Provide seed via ${opts.headerName} header, ${opts.cookieName} cookie, ?seed= query param, or body.seed`,
        example: {
          header: `${opts.headerName}: v1-red-blue-green`,
          cookie: `Cookie: ${opts.cookieName}=v1-red-blue-green`,
          query: `?seed=v1-red-blue-green`,
          body: `{ "seed": "v1-red-blue-green" }`,
        },
      });
    }
    return; // Seed optional, continue
  }

  // Validate seed
  const validation = validateSeed(seed);
  if (!validation.valid) {
    return reply.code(400).send({
      error: 'Invalid seed',
      message: validation.error,
      seed,
    });
  }

  // Attach to request
  request.seed = validation.seed!;
  request.seedInfo = getSeedInfo(validation.seed!);
}

/**
 * Helper to set seed cookie
 */
export function setSeedCookie(reply: FastifyReply, seed: string, options?: { maxAge?: number }) {
  reply.setCookie('seed', seed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: options?.maxAge || 60 * 60 * 24 * 365, // 1 year default
    path: '/',
  });
}

