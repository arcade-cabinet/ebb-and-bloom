#!/usr/bin/env node
/**
 * Asset Manifest - Declarative asset definitions with post-processing instructions
 * Copied from otter-river-rush pattern
 */

export interface QualityMetrics {
  // File metrics
  fileSize: number;
  fileSizeKB: number;
  
  // Image metrics
  width: number;
  height: number;
  aspectRatio: number;
  format: string;
  
  // Quality checks
  hasTransparency: boolean;
  hasWhiteBackground: boolean; // BAD if requiresTransparency
  isDistorted: boolean;
  isUndersized: boolean;
  isOversized: boolean;
  
  // Computed quality score
  qualityScore: number; // 0-100
  issues: string[];
  
  // Generation metadata
  lastGenerated?: Date;
  generationMethod?: 'ai' | 'manual' | 'placeholder';
  needsRegeneration: boolean;
}

export interface AssetDefinition {
  id: string;
  category: 'splash' | 'panel' | 'icon' | 'button' | 'hud' | 'creature' | 'building';
  name: string;
  description: string;
  
  // File location
  path: string; // relative to public/
  
  // POST-PROCESSING INSTRUCTIONS
  expectedSize: { width: number; height: number };
  expectedFormat: 'png' | 'webp' | 'jpg';
  maxFileSizeKB: number;
  requiresTransparency: boolean;
  
  // Generation config
  aiPrompt?: string;
  aiModel?: 'gpt-image-1';
  canBeGenerated: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  // Current quality
  currentQuality?: QualityMetrics;
}

/**
 * Complete asset manifest for Ebb & Bloom
 */
export const ASSET_MANIFEST: AssetDefinition[] = [
  // ============================================================================
  // SPLASH SCREENS - Full screen portrait loading screens
  // ============================================================================
  {
    id: 'splash-harmony-1',
    category: 'splash',
    name: 'Splash Screen - Harmony Variant 1',
    description: 'Serene evolutionary ecosystem splash screen',
    path: 'splash/splash-harmony-1.png',
    expectedSize: { width: 1080, height: 1920 },
    expectedFormat: 'png',
    maxFileSizeKB: 500,
    requiresTransparency: false,
    aiPrompt: 'Serene, flowing evolutionary ecosystem with blues and greens, peaceful creatures, symbiotic relationships, organic growth patterns, mobile game loading screen, portrait 1080x1920',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'critical',
  },
  
  // ============================================================================
  // UI BUTTONS - Small interactive elements
  // ============================================================================
  {
    id: 'button-evolution-tree',
    category: 'button',
    name: 'Evolution Tree Button',
    description: 'Button to open evolution tree interface',
    path: 'ui/elements/button-evolution-tree.png',
    expectedSize: { width: 200, height: 50 },
    expectedFormat: 'png',
    maxFileSizeKB: 20,
    requiresTransparency: true,
    aiPrompt: 'Organic evolution tree button, flowing branches design, emerald green and deep indigo colors, clean modern UI, transparent PNG, 200x50',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },
  
  // ============================================================================
  // ICONS - Small UI elements
  // ============================================================================
  {
    id: 'icon-trait-mobility',
    category: 'icon',
    name: 'Mobility Trait Icon',
    description: 'Icon for mobility trait in evolution interface',
    path: 'ui/elements/icon-trait-mobility.png',
    expectedSize: { width: 128, height: 128 },
    expectedFormat: 'png',
    maxFileSizeKB: 15,
    requiresTransparency: true,
    aiPrompt: 'Stylized icon showing movement/mobility trait, flowing lines suggesting speed, trait gold color accent, clean vector style, transparent PNG, 128x128',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },
  
  // ============================================================================
  // PANELS - UI backgrounds and containers
  // ============================================================================
  {
    id: 'panel-evolution-ui',
    category: 'panel',
    name: 'Evolution UI Panel',
    description: 'Background panel for evolution interface',
    path: 'ui/panels/panel-evolution-ui.png',
    expectedSize: { width: 800, height: 600 },
    expectedFormat: 'png',
    maxFileSizeKB: 150,
    requiresTransparency: true,
    aiPrompt: 'Semi-transparent panel for evolution UI, organic flowing design, deep indigo with subtle patterns, modern game UI style, 800x600',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'medium',
  },
  
  // Add more assets as needed...
];

/**
 * Get asset definition by ID
 */
export function getAssetDefinition(id: string): AssetDefinition | undefined {
  return ASSET_MANIFEST.find(asset => asset.id === id);
}

/**
 * Get all assets by category
 */
export function getAssetsByCategory(category: AssetDefinition['category']): AssetDefinition[] {
  return ASSET_MANIFEST.filter(asset => asset.category === category);
}

/**
 * Get all assets that can be AI generated
 */
export function getGeneratableAssets(): AssetDefinition[] {
  return ASSET_MANIFEST.filter(asset => asset.canBeGenerated);
}

/**
 * Get assets by priority
 */
export function getAssetsByPriority(priority: AssetDefinition['priority']): AssetDefinition[] {
  return ASSET_MANIFEST.filter(asset => asset.priority === priority);
}

