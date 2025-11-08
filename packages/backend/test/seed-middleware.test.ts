/**
 * Unit tests for Seed Middleware
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FastifyRequest, FastifyReply } from 'fastify';
import { extractSeedFromRequest, setSeedCookie } from '../src/seed/seed-middleware.js';

describe('Seed Middleware', () => {
  describe('extractSeedFromRequest', () => {
    it('extracts seed from x-seed header', () => {
      const request = {
        headers: { 'x-seed': 'v1-red-blue-green' },
        cookies: {},
        query: {},
        body: {},
      } as any as FastifyRequest;

      const seed = extractSeedFromRequest(request);
      expect(seed).toBe('v1-red-blue-green');
    });

    it('extracts seed from cookie when header not present', () => {
      const request = {
        headers: {},
        cookies: { seed: 'v1-blue-red-green' },
        query: {},
        body: {},
      } as any as FastifyRequest;

      const seed = extractSeedFromRequest(request);
      expect(seed).toBe('v1-blue-red-green');
    });

    it('extracts seed from query param when header and cookie not present', () => {
      const request = {
        headers: {},
        cookies: {},
        query: { seed: 'v1-green-blue-red' },
        body: {},
      } as any as FastifyRequest;

      const seed = extractSeedFromRequest(request);
      expect(seed).toBe('v1-green-blue-red');
    });

    it('extracts seed from body when other sources not present', () => {
      const request = {
        headers: {},
        cookies: {},
        query: {},
        body: { seed: 'v1-yellow-purple-orange' },
      } as any as FastifyRequest;

      const seed = extractSeedFromRequest(request);
      expect(seed).toBe('v1-yellow-purple-orange');
    });

    it('prioritizes header over cookie', () => {
      const request = {
        headers: { 'x-seed': 'v1-header-seed' },
        cookies: { seed: 'v1-cookie-seed' },
        query: {},
        body: {},
      } as any as FastifyRequest;

      const seed = extractSeedFromRequest(request);
      expect(seed).toBe('v1-header-seed');
    });

    it('prioritizes cookie over query', () => {
      const request = {
        headers: {},
        cookies: { seed: 'v1-cookie-seed' },
        query: { seed: 'v1-query-seed' },
        body: {},
      } as any as FastifyRequest;

      const seed = extractSeedFromRequest(request);
      expect(seed).toBe('v1-cookie-seed');
    });

    it('returns null when no seed found', () => {
      const request = {
        headers: {},
        cookies: {},
        query: {},
        body: {},
      } as any as FastifyRequest;

      const seed = extractSeedFromRequest(request);
      expect(seed).toBeNull();
    });

    it('handles custom cookie name', () => {
      const request = {
        headers: {},
        cookies: { customSeed: 'v1-custom-seed' },
        query: {},
        body: {},
      } as any as FastifyRequest;

      const seed = extractSeedFromRequest(request, { cookieName: 'customSeed' });
      expect(seed).toBe('v1-custom-seed');
    });

    it('handles custom header name', () => {
      const request = {
        headers: { 'custom-seed': 'v1-custom-header' },
        cookies: {},
        query: {},
        body: {},
      } as any as FastifyRequest;

      const seed = extractSeedFromRequest(request, { headerName: 'custom-seed' });
      expect(seed).toBe('v1-custom-header');
    });
  });

  describe('setSeedCookie', () => {
    it('sets cookie with correct properties', () => {
      const reply = {
        setCookie: (name: string, value: string, options: any) => {
          expect(name).toBe('seed');
          expect(value).toBe('v1-red-blue-green');
          expect(options.httpOnly).toBe(true);
          expect(options.path).toBe('/');
        },
      } as any as FastifyReply;

      setSeedCookie(reply, 'v1-red-blue-green');
    });

    it('uses custom maxAge when provided', () => {
      const reply = {
        setCookie: (name: string, value: string, options: any) => {
          expect(options.maxAge).toBe(3600);
        },
      } as any as FastifyReply;

      setSeedCookie(reply, 'v1-red-blue-green', { maxAge: 3600 });
    });
  });
});

