/**
 * Texture Manifest Schema - DRY single source of truth
 * Used by both gen package and frontend
 */

import { z } from 'zod';

export const TextureAssetSchema = z.object({
  assetId: z.string(),
  name: z.string(),
  category: z.string(),
  mapType: z.string(),
  filePath: z.string(),
  localPath: z.string(),
});

export const TextureManifestSchema = z.object({
  generatedAt: z.string(),
  totalTextures: z.number(),
  categories: z.array(z.string()),
  resolution: z.string(),
  assets: z.array(TextureAssetSchema),
});

// Type exports (DRY - single source of truth)
export type TextureAsset = z.infer<typeof TextureAssetSchema>;
export type TextureManifest = z.infer<typeof TextureManifestSchema>;
