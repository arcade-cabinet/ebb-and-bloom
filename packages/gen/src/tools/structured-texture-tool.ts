/**
 * STRUCTURED TEXTURE TOOL FOR AI AGENTS
 * Returns actual AmbientCG texture paths from manifest
 */

import { tool } from 'ai';
import { z } from 'zod';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory of this file to resolve relative paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const textureQueryTool = tool({
  description: 'Query available AmbientCG textures by category. Returns actual texture file paths that MUST be used in textureReferences. You MUST call this tool to get real texture paths.',
  parameters: z.object({
    category: z.enum(['bricks', 'concrete', 'fabric', 'grass', 'leather', 'metal', 'rock', 'wood']),
    count: z.number().min(1).max(10).default(5),
  }),
  execute: async ({ category, count = 5 }) => {
    try {
      // Resolve manifest path relative to package root
      const manifestPath = join(__dirname, '../../public/textures/manifest.json');
      const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
      
      // Category names in manifest are capitalized, convert to match
      const categoryCapitalized = category.charAt(0).toUpperCase() + category.slice(1);
      
      // Filter assets by category
      const categoryTextures = manifest.assets?.filter((asset: any) => 
        asset.category === categoryCapitalized
      ) || [];
      
      // Return actual texture paths
      const textures = categoryTextures.slice(0, count).map((asset: any) => ({
        id: asset.assetId,
        name: asset.name,
        path: asset.filePath || asset.localPath, // Use filePath (relative) or localPath (absolute)
        category: asset.category,
        mapType: asset.mapType,
        resolution: manifest.resolution
      }));
      
      return {
        category,
        textures,
        totalAvailable: categoryTextures.length,
        message: `Found ${textures.length} textures. Use the 'path' field values EXACTLY in textureReferences array.`
      };
    } catch (error: any) {
      return { 
        error: `Failed to load textures: ${error.message}`,
        path: `Attempted path: ${join(__dirname, '../../public/textures/manifest.json')}`
      };
    }
  },
});