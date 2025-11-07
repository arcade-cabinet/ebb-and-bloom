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
  
  // ============================================================================
  // BUTTONS - All interactive UI buttons
  // ============================================================================
  {
    id: 'button-observe',
    category: 'button',
    name: 'Observe Button',
    description: 'Button for observation mode',
    path: 'ui/elements/button-observe.png',
    expectedSize: { width: 120, height: 50 },
    expectedFormat: 'png',
    maxFileSizeKB: 15,
    requiresTransparency: true,
    aiPrompt: 'Mobile game button "Observe", organic design, emerald green accent, clean modern UI, transparent PNG, 120x50',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'critical',
  },
  {
    id: 'button-influence',
    category: 'button',
    name: 'Influence Button',
    description: 'Button for influence mode',
    path: 'ui/elements/button-influence.png',
    expectedSize: { width: 120, height: 50 },
    expectedFormat: 'png',
    maxFileSizeKB: 15,
    requiresTransparency: true,
    aiPrompt: 'Mobile game button "Influence", organic design, trait gold accent, clean modern UI, transparent PNG, 120x50',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'critical',
  },
  {
    id: 'button-analyze',
    category: 'button',
    name: 'Analyze Button',
    description: 'Button for analysis mode',
    path: 'ui/elements/button-analyze.png',
    expectedSize: { width: 120, height: 50 },
    expectedFormat: 'png',
    maxFileSizeKB: 15,
    requiresTransparency: true,
    aiPrompt: 'Mobile game button "Analyze", organic design, deep indigo accent, clean modern UI, transparent PNG, 120x50',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'critical',
  },
  
  // ============================================================================
  // ICONS - All trait and status icons
  // ============================================================================
  {
    id: 'icon-trait-social',
    category: 'icon',
    name: 'Social Trait Icon',
    description: 'Icon for social trait',
    path: 'ui/elements/icon-trait-social.png',
    expectedSize: { width: 64, height: 64 },
    expectedFormat: 'png',
    maxFileSizeKB: 10,
    requiresTransparency: true,
    aiPrompt: 'Stylized icon showing social/group trait, interconnected nodes suggesting community, trait gold color, clean vector style, transparent PNG, 64x64',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },
  {
    id: 'icon-trait-aggression',
    category: 'icon',
    name: 'Aggression Trait Icon',
    description: 'Icon for aggression trait',
    path: 'ui/elements/icon-trait-aggression.png',
    expectedSize: { width: 64, height: 64 },
    expectedFormat: 'png',
    maxFileSizeKB: 10,
    requiresTransparency: true,
    aiPrompt: 'Stylized icon showing aggression/combat trait, sharp angular design, red accent, clean vector style, transparent PNG, 64x64',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },
  {
    id: 'icon-pollution',
    category: 'icon',
    name: 'Pollution Indicator Icon',
    description: 'Icon for pollution status',
    path: 'ui/elements/icon-pollution.png',
    expectedSize: { width: 64, height: 64 },
    expectedFormat: 'png',
    maxFileSizeKB: 10,
    requiresTransparency: true,
    aiPrompt: 'Pollution warning icon, toxic cloud design, warning orange/red colors, clean vector style, transparent PNG, 64x64',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },
  {
    id: 'icon-pack',
    category: 'icon',
    name: 'Pack Formation Icon',
    description: 'Icon for pack dynamics',
    path: 'ui/elements/icon-pack.png',
    expectedSize: { width: 64, height: 64 },
    expectedFormat: 'png',
    maxFileSizeKB: 10,
    requiresTransparency: true,
    aiPrompt: 'Pack formation icon, group of creatures together, social bonding design, emerald green accent, clean vector style, transparent PNG, 64x64',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },
  {
    id: 'icon-generation',
    category: 'icon',
    name: 'Generation Counter Icon',
    description: 'Icon for generation tracking',
    path: 'ui/elements/icon-generation.png',
    expectedSize: { width: 64, height: 64 },
    expectedFormat: 'png',
    maxFileSizeKB: 10,
    requiresTransparency: true,
    aiPrompt: 'Generation counter icon, circular progress design, evolutionary spiral pattern, trait gold accent, clean vector style, transparent PNG, 64x64',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },
  
  // ============================================================================
  // PANELS - All UI panel backgrounds
  // ============================================================================
  {
    id: 'panel-creature-display',
    category: 'panel',
    name: 'Creature Display Panel',
    description: 'Background panel for creature information',
    path: 'ui/panels/panel-creature-display.png',
    expectedSize: { width: 400, height: 300 },
    expectedFormat: 'png',
    maxFileSizeKB: 80,
    requiresTransparency: true,
    aiPrompt: 'Semi-transparent panel for creature display, organic flowing design, deep indigo with subtle patterns, modern game UI style, 400x300',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },
  {
    id: 'panel-environmental-status',
    category: 'panel',
    name: 'Environmental Status Panel',
    description: 'Background panel for environmental information',
    path: 'ui/panels/panel-environmental-status.png',
    expectedSize: { width: 400, height: 300 },
    expectedFormat: 'png',
    maxFileSizeKB: 80,
    requiresTransparency: true,
    aiPrompt: 'Semi-transparent panel for environmental status, organic flowing design, emerald green with subtle patterns, modern game UI style, 400x300',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },
  {
    id: 'panel-pack-dynamics',
    category: 'panel',
    name: 'Pack Dynamics Panel',
    description: 'Background panel for pack information',
    path: 'ui/panels/panel-pack-dynamics.png',
    expectedSize: { width: 400, height: 300 },
    expectedFormat: 'png',
    maxFileSizeKB: 80,
    requiresTransparency: true,
    aiPrompt: 'Semi-transparent panel for pack dynamics, organic flowing design, trait gold with subtle patterns, modern game UI style, 400x300',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },
  {
    id: 'panel-narrative',
    category: 'panel',
    name: 'Narrative Display Panel',
    description: 'Background panel for haiku narrative',
    path: 'ui/panels/panel-narrative.png',
    expectedSize: { width: 600, height: 200 },
    expectedFormat: 'png',
    maxFileSizeKB: 100,
    requiresTransparency: true,
    aiPrompt: 'Semi-transparent panel for narrative/haiku display, poetic flowing design, echo silver with subtle patterns, modern game UI style, 600x200',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },
  {
    id: 'panel-evolution-event',
    category: 'panel',
    name: 'Evolution Event Panel',
    description: 'Background panel for evolution events',
    path: 'ui/panels/panel-evolution-event.png',
    expectedSize: { width: 350, height: 150 },
    expectedFormat: 'png',
    maxFileSizeKB: 60,
    requiresTransparency: true,
    aiPrompt: 'Semi-transparent panel for evolution events, dynamic flowing design, deep indigo with trait gold accents, modern game UI style, 350x150',
    aiModel: 'gpt-image-1',
    canBeGenerated: true,
    priority: 'high',
  },
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

