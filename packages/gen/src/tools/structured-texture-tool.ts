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

const textureQueryToolImpl = async ({ category, count = 5 }: { category: string; count?: number }) => {
    try {
      // Resolve manifest path - textures are in frontend public directory
      const manifestPath = join(__dirname, '../../../game/public/textures/manifest.json');
      const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
      
      // Category names in manifest are capitalized, convert to match
      const categoryCapitalized = category.charAt(0).toUpperCase() + category.slice(1);
      
      // Filter assets by category
      const categoryTextures = manifest.assets?.filter((asset: any) => 
        asset.category === categoryCapitalized
      ) || [];
      
      // Return texture IDs and category info (NOT paths - backend uses IDs from manifest)
      const textures = categoryTextures.slice(0, count).map((asset: any) => ({
        id: asset.assetId, // THIS IS WHAT YOU USE - texture ID
        name: asset.name,
        category: asset.category, // Category determines wrapping/shaping behavior
        mapType: asset.mapType, // bundle, color, normal, etc.
        resolution: manifest.resolution,
        // Include path for reference, but ID is what matters
        path: asset.filePath || asset.localPath
      }));
      
      const categoryDescriptions: Record<string, string> = {
        'Metal': 'Smooth, reflective surfaces. High metallic values. Good for planetary cores, metallic surfaces, tools.',
        'Rock': 'Rough, geological textures. Low metallic, high roughness. Perfect for planetary crusts, mountains, stone formations.',
        'Stone': 'Similar to Rock - geological surfaces for planetary rendering.',
        'Wood': 'Organic, fibrous textures. Low metallic. Good for natural materials, organic structures.',
        'Fabric': 'Flexible, cloth-like textures. Low metallic, moderate roughness.',
        'Grass': 'Ground cover textures. Low metallic, high roughness. Good for surface vegetation.',
        'Concrete': 'Architectural textures. Moderate roughness. Good for constructed surfaces.',
        'Bricks': 'Architectural textures. High roughness. Good for buildings and structures.',
        'Leather': 'Organic, flexible textures. Moderate roughness, low metallic.'
      };
      
      return {
        category,
        categoryDescription: categoryDescriptions[categoryCapitalized] || `Texture category: ${categoryCapitalized}`,
        textures,
        totalAvailable: categoryTextures.length,
        message: `Found ${textures.length} textures. Use the 'id' field values (texture IDs like "${textures[0]?.id}") in textureReferences array. Category "${categoryCapitalized}" affects how textures wrap and shape objects.`
      };
    } catch (error: any) {
      return { 
        error: `Failed to load textures: ${error.message}`,
        path: `Attempted path: ${join(__dirname, '../../../game/public/textures/manifest.json')}`
      };
    }
};

export const textureQueryTool = tool({
  description: `Query available AmbientCG textures by category. Returns texture IDs and category information for visual blueprint generation.

CRITICAL: The backend uses texture IDs (like "Wood094", "Metal049A") from the texture manifest, NOT file paths. The manifest is addressable at runtime.

CATEGORY IMPORTANCE: Texture categories determine how textures wrap and shape objects:
- Metal: Smooth, reflective surfaces with metallic properties
- Rock/Stone: Rough, geological surfaces for planetary crusts
- Wood: Organic, fibrous textures for natural materials
- Fabric: Flexible, cloth-like textures
- Grass: Ground cover textures
- Concrete/Bricks: Architectural textures

You MUST use texture IDs (the 'id' field) in textureReferences, NOT paths.`,
  parameters: z.object({
    category: z.enum(['bricks', 'concrete', 'fabric', 'grass', 'leather', 'metal', 'rock', 'wood']),
    count: z.number().min(1).max(10).default(5),
  }),
  execute: textureQueryToolImpl,
});