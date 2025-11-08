/**
 * STRUCTURED TEXTURE TOOL FOR AI AGENTS
 * Based on Vercel AI examples
 */

import { tool } from 'ai';
import { z } from 'zod';
import { promises as fs } from 'fs';

export const textureQueryTool = tool({
  description: 'Query available textures by category for visual blueprint generation',
  parameters: z.object({
    category: z.enum(['bricks', 'concrete', 'fabric', 'grass', 'leather', 'metal', 'rock', 'wood']),
    count: z.number().min(1).max(10).default(5),
  }),
  execute: async ({ category, count = 5 }) => {
    try {
      const manifest = JSON.parse(await fs.readFile('./public/textures/manifest.json', 'utf8'));
      const categoryTextures = manifest.categories[category] || [];
      
      return {
        category,
        textures: categoryTextures.slice(0, count).map((t: any) => ({
          id: t.id,
          name: t.name,
          path: t.path,
          properties: t.properties
        })),
        totalAvailable: categoryTextures.length
      };
    } catch (error) {
      return { error: `Failed to load textures: ${error.message}` };
    }
  },
});