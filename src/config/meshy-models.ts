/**
 * Meshy API Integration Configuration
 * Central hub for 3D model generation via Meshy.ai
 * 
 * Used by Gen 0 AI workflows to generate:
 * - Planetary core 3D models
 * - Material manifestations
 * - Creature archetypes
 */

import { MeshyBaseClient } from '../dev/meshy/base-client';

/**
 * Meshy API key from environment
 */
const MESHY_API_KEY = process.env.MESHY_API_KEY || '';

/**
 * Meshy model generation options
 */
export interface MeshyModelOptions {
  prompt: string;
  negative_prompt?: string;
  art_style?: 'realistic' | 'cartoon' | 'low-poly' | 'stylized';
  topology?: 'quad' | 'triangle';
  target_polycount?: number;
  enable_pbr?: boolean;
}

/**
 * Meshy model generation result
 */
export interface MeshyModelResult {
  task_id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED';
  model_url?: string;
  thumbnail_url?: string;
  texture_urls?: {
    base_color?: string;
    metallic?: string;
    roughness?: string;
    normal?: string;
  };
  error?: string;
}

/**
 * Meshy Client for Gen 0 workflows
 */
class MeshyModelsClient extends MeshyBaseClient {
  constructor() {
    const apiKey = MESHY_API_KEY;
    if (!apiKey && typeof window === 'undefined') {
      console.warn('MESHY_API_KEY not set. 3D model generation will be disabled.');
    }
    super(apiKey);
  }

  /**
   * Generate 3D model from text prompt
   */
  async generateModel(options: MeshyModelOptions): Promise<MeshyModelResult> {
    try {
      const response = await this.request<MeshyModelResult>('/text-to-3d', {
        method: 'POST',
        body: JSON.stringify({
          prompt: options.prompt,
          negative_prompt: options.negative_prompt || 'low quality, blurry, distorted',
          art_style: options.art_style || 'realistic',
          topology: options.topology || 'triangle',
          target_polycount: options.target_polycount || 20000,
          enable_pbr: options.enable_pbr ?? true,
        }),
      });

      return response;
    } catch (error) {
      console.error('Meshy model generation failed:', error);
      throw error;
    }
  }

  /**
   * Check status of model generation task
   */
  async getTaskStatus(taskId: string): Promise<MeshyModelResult> {
    try {
      const response = await this.request<MeshyModelResult>(`/text-to-3d/${taskId}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Failed to check task status:', error);
      throw error;
    }
  }

  /**
   * Poll for task completion
   */
  async waitForCompletion(
    taskId: string,
    maxAttempts: number = 60,
    intervalMs: number = 5000
  ): Promise<MeshyModelResult> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = await this.getTaskStatus(taskId);

      if (result.status === 'SUCCEEDED') {
        return result;
      }

      if (result.status === 'FAILED') {
        throw new Error(`Model generation failed: ${result.error}`);
      }

      // Wait before polling again
      await this.sleep(intervalMs);
    }

    throw new Error(`Model generation timed out after ${maxAttempts} attempts`);
  }
}

/**
 * Singleton instance
 */
export const meshyModels = new MeshyModelsClient();

/**
 * Helper functions for Gen 0 workflows
 */

/**
 * Generate planetary core model
 */
export async function generatePlanetaryCoreModel(
  coreName: string,
  description: string
): Promise<MeshyModelResult | null> {
  if (!MESHY_API_KEY) {
    console.warn('Skipping 3D model generation (no API key)');
    return null;
  }

  const prompt = `Planetary core material: ${coreName}. ${description}. Crystalline structure, geological formation, high detail, PBR textures.`;

  try {
    const task = await meshyModels.generateModel({
      prompt,
      art_style: 'realistic',
      target_polycount: 30000,
      enable_pbr: true,
    });

    const result = await meshyModels.waitForCompletion(task.task_id);
    return result;
  } catch (error) {
    console.error(`Failed to generate model for ${coreName}:`, error);
    return null;
  }
}

/**
 * Generate creature archetype model
 */
export async function generateCreatureArchetypeModel(
  archetypeName: string,
  description: string
): Promise<MeshyModelResult | null> {
  if (!MESHY_API_KEY) {
    console.warn('Skipping 3D model generation (no API key)');
    return null;
  }

  const prompt = `Creature archetype: ${archetypeName}. ${description}. Game-ready, stylized, animated, PBR textures.`;

  try {
    const task = await meshyModels.generateModel({
      prompt,
      art_style: 'stylized',
      target_polycount: 15000,
      enable_pbr: true,
    });

    const result = await meshyModels.waitForCompletion(task.task_id);
    return result;
  } catch (error) {
    console.error(`Failed to generate model for ${archetypeName}:`, error);
    return null;
  }
}

/**
 * Generate material manifestation model
 */
export async function generateMaterialModel(
  materialName: string,
  description: string
): Promise<MeshyModelResult | null> {
  if (!MESHY_API_KEY) {
    console.warn('Skipping 3D model generation (no API key)');
    return null;
  }

  const prompt = `Material: ${materialName}. ${description}. Tileable, resource node, game-ready, PBR textures.`;

  try {
    const task = await meshyModels.generateModel({
      prompt,
      art_style: 'stylized',
      target_polycount: 5000,
      enable_pbr: true,
    });

    const result = await meshyModels.waitForCompletion(task.task_id);
    return result;
  } catch (error) {
    console.error(`Failed to generate model for ${materialName}:`, error);
    return null;
  }
}
