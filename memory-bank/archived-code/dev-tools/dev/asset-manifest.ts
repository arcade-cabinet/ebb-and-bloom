#!/usr/bin/env node
/**
 * Asset Manifest - Declarative asset definitions with post-processing instructions
 * ALIGNED WITH BRAND IDENTITY: Ebb Indigo, Bloom Emerald, Trait Gold, Echo Silver
 * Design: Organic, flowing, evolutionary, meditative
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
 * BRAND ALIGNED: Ebb Indigo (#4A5568), Bloom Emerald (#38A169), Trait Gold (#D69E2E), Echo Silver (#A0AEC0)
 * Design: Organic flowing forms, meditative, evolutionary, touch-first
 */
export const ASSET_MANIFEST: AssetDefinition[] = [
    // ============================================================================
    // SPLASH SCREENS - Full screen portrait loading screens
    // Brand: Meditative, contemplative, evolutionary ecosystem
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
        aiPrompt: 'Meditative evolutionary ecosystem scene, deep indigo (#4A5568) and bloom emerald (#38A169) color palette, flowing organic forms suggesting growth and emergence, peaceful creatures in symbiotic relationships, contemplative atmosphere, mobile game loading screen portrait 1080x1920, soft focus, poetic beauty',
        aiModel: 'gpt-image-1',
        canBeGenerated: true,
        priority: 'critical',
    },

    // ============================================================================
    // UI BUTTONS - Interactive touch elements
    // Brand: Organic flowing forms, trait gold accents, haptic-ready
    // ============================================================================
    {
        id: 'button-observe',
        category: 'button',
        name: 'Observe Button',
        description: 'Button for observation mode - meditative, contemplative',
        path: 'ui/elements/button-observe.png',
        expectedSize: { width: 120, height: 50 },
        expectedFormat: 'png',
        maxFileSizeKB: 15,
        requiresTransparency: true,
        aiPrompt: 'Mobile game button "Observe", organic flowing design with asymmetric rounded corners, deep indigo (#4A5568) base with bloom emerald (#38A169) accent, clean modern UI, transparent PNG, 120x50, meditative contemplative style',
        aiModel: 'gpt-image-1',
        canBeGenerated: true,
        priority: 'critical',
    },
    {
        id: 'button-influence',
        category: 'button',
        name: 'Influence Button',
        description: 'Button for influence mode - active, shaping',
        path: 'ui/elements/button-influence.png',
        expectedSize: { width: 120, height: 50 },
        expectedFormat: 'png',
        maxFileSizeKB: 15,
        requiresTransparency: true,
        aiPrompt: 'Mobile game button "Influence", organic flowing design with asymmetric rounded corners, deep indigo (#4A5568) base with trait gold (#D69E2E) accent, clean modern UI, transparent PNG, 120x50, active shaping style',
        aiModel: 'gpt-image-1',
        canBeGenerated: true,
        priority: 'critical',
    },
    {
        id: 'button-analyze',
        category: 'button',
        name: 'Analyze Button',
        description: 'Button for analysis mode - technical, data-focused',
        path: 'ui/elements/button-analyze.png',
        expectedSize: { width: 120, height: 50 },
        expectedFormat: 'png',
        maxFileSizeKB: 15,
        requiresTransparency: true,
        aiPrompt: 'Mobile game button "Analyze", organic flowing design with asymmetric rounded corners, deep indigo (#4A5568) base with echo silver (#A0AEC0) accent, clean modern UI, transparent PNG, 120x50, technical data-focused style',
        aiModel: 'gpt-image-1',
        canBeGenerated: true,
        priority: 'critical',
    },
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
        aiPrompt: 'Mobile game button "Evolution Tree", organic flowing branches design suggesting growth and inheritance, bloom emerald (#38A169) and deep indigo (#4A5568) colors, trait gold (#D69E2E) highlights, clean modern UI, transparent PNG, 200x50',
        aiModel: 'gpt-image-1',
        canBeGenerated: true,
        priority: 'high',
    },

    // ============================================================================
    // ICONS - Trait and status indicators
    // Brand: Stylized, organic, evolutionary theme
    // ============================================================================
    {
        id: 'icon-trait-mobility',
        category: 'icon',
        name: 'Mobility Trait Icon',
        description: 'Icon for mobility trait - flowing movement',
        path: 'ui/elements/icon-trait-mobility.png',
        expectedSize: { width: 64, height: 64 },
        expectedFormat: 'png',
        maxFileSizeKB: 10,
        requiresTransparency: true,
        aiPrompt: 'Stylized icon showing movement/mobility trait, flowing organic lines suggesting speed and fluidity, trait gold (#D69E2E) color accent, asymmetric organic shape, clean vector style, transparent PNG, 64x64, evolutionary theme',
        aiModel: 'gpt-image-1',
        canBeGenerated: true,
        priority: 'high',
    },
    {
        id: 'icon-trait-social',
        category: 'icon',
        name: 'Social Trait Icon',
        description: 'Icon for social trait - interconnected community',
        path: 'ui/elements/icon-trait-social.png',
        expectedSize: { width: 64, height: 64 },
        expectedFormat: 'png',
        maxFileSizeKB: 10,
        requiresTransparency: true,
        aiPrompt: 'Stylized icon showing social/group trait, interconnected organic nodes suggesting community and bonding, trait gold (#D69E2E) color, asymmetric flowing design, clean vector style, transparent PNG, 64x64, evolutionary theme',
        aiModel: 'gpt-image-1',
        canBeGenerated: true,
        priority: 'high',
    },
    {
        id: 'icon-trait-aggression',
        category: 'icon',
        name: 'Aggression Trait Icon',
        description: 'Icon for aggression trait - sharp, angular',
        path: 'ui/elements/icon-trait-aggression.png',
        expectedSize: { width: 64, height: 64 },
        expectedFormat: 'png',
        maxFileSizeKB: 10,
        requiresTransparency: true,
        aiPrompt: 'Stylized icon showing aggression/combat trait, sharp angular organic design suggesting conflict, pollution red (#E53E3E) accent, asymmetric flowing form, clean vector style, transparent PNG, 64x64, evolutionary theme',
        aiModel: 'gpt-image-1',
        canBeGenerated: true,
        priority: 'high',
    },
    {
        id: 'icon-pollution',
        category: 'icon',
        name: 'Pollution Indicator Icon',
        description: 'Icon for pollution status - warning, environmental pressure',
        path: 'ui/elements/icon-pollution.png',
        expectedSize: { width: 64, height: 64 },
        expectedFormat: 'png',
        maxFileSizeKB: 10,
        requiresTransparency: true,
        aiPrompt: 'Pollution warning icon, organic toxic cloud design suggesting environmental pressure, pollution red (#E53E3E) and warning orange (#ED8936) colors, asymmetric flowing form, clean vector style, transparent PNG, 64x64, evolutionary theme',
        aiModel: 'gpt-image-1',
        canBeGenerated: true,
        priority: 'high',
    },
    {
        id: 'icon-pack',
        category: 'icon',
        name: 'Pack Formation Icon',
        description: 'Icon for pack dynamics - group formation, social bonding',
        path: 'ui/elements/icon-pack.png',
        expectedSize: { width: 64, height: 64 },
        expectedFormat: 'png',
        maxFileSizeKB: 10,
        requiresTransparency: true,
        aiPrompt: 'Pack formation icon, organic group of creatures together suggesting social bonding, bloom emerald (#38A169) accent, interconnected flowing forms, clean vector style, transparent PNG, 64x64, evolutionary theme',
        aiModel: 'gpt-image-1',
        canBeGenerated: true,
        priority: 'high',
    },
    {
        id: 'icon-generation',
        category: 'icon',
        name: 'Generation Counter Icon',
        description: 'Icon for generation tracking - evolutionary spiral',
        path: 'ui/elements/icon-generation.png',
        expectedSize: { width: 64, height: 64 },
        expectedFormat: 'png',
        maxFileSizeKB: 10,
        requiresTransparency: true,
        aiPrompt: 'Generation counter icon, organic circular progress design with evolutionary spiral pattern, trait gold (#D69E2E) accent, flowing asymmetric form, clean vector style, transparent PNG, 64x64, evolutionary theme',
        aiModel: 'gpt-image-1',
        canBeGenerated: true,
        priority: 'high',
    },

    // ============================================================================
    // PANELS - UI backgrounds and containers
    // Brand: Semi-transparent, organic flowing borders, meditative
    // ============================================================================
    {
        id: 'panel-creature-display',
        category: 'panel',
        name: 'Creature Display Panel',
        description: 'Background panel for creature information - organic, flowing',
        path: 'ui/panels/panel-creature-display.png',
        expectedSize: { width: 400, height: 300 },
        expectedFormat: 'png',
        maxFileSizeKB: 80,
        requiresTransparency: true,
        aiPrompt: 'Semi-transparent panel for creature display, organic flowing design with asymmetric rounded corners, deep indigo (#4A5568) base with subtle bloom emerald (#38A169) patterns, meditative contemplative style, modern game UI, transparent PNG, 400x300',
        aiModel: 'gpt-image-1',
        canBeGenerated: true,
        priority: 'high',
    },
    {
        id: 'panel-environmental-status',
        category: 'panel',
        name: 'Environmental Status Panel',
        description: 'Background panel for environmental information - growth, life',
        path: 'ui/panels/panel-environmental-status.png',
        expectedSize: { width: 400, height: 300 },
        expectedFormat: 'png',
        maxFileSizeKB: 80,
        requiresTransparency: true,
        aiPrompt: 'Semi-transparent panel for environmental status, organic flowing design with asymmetric rounded corners, bloom emerald (#38A169) base with subtle deep indigo (#4A5568) patterns, growth and emergence theme, modern game UI, transparent PNG, 400x300',
        aiModel: 'gpt-image-1',
        canBeGenerated: true,
        priority: 'high',
    },
    {
        id: 'panel-pack-dynamics',
        category: 'panel',
        name: 'Pack Dynamics Panel',
        description: 'Background panel for pack information - discovery, mutation',
        path: 'ui/panels/panel-pack-dynamics.png',
        expectedSize: { width: 400, height: 300 },
        expectedFormat: 'png',
        maxFileSizeKB: 80,
        requiresTransparency: true,
        aiPrompt: 'Semi-transparent panel for pack dynamics, organic flowing design with asymmetric rounded corners, trait gold (#D69E2E) base with subtle deep indigo (#4A5568) patterns, discovery and mutation theme, modern game UI, transparent PNG, 400x300',
        aiModel: 'gpt-image-1',
        canBeGenerated: true,
        priority: 'high',
    },
    {
        id: 'panel-narrative',
        category: 'panel',
        name: 'Narrative Display Panel',
        description: 'Background panel for haiku narrative - poetic, memory, inheritance',
        path: 'ui/panels/panel-narrative.png',
        expectedSize: { width: 600, height: 200 },
        expectedFormat: 'png',
        maxFileSizeKB: 100,
        requiresTransparency: true,
        aiPrompt: 'Semi-transparent panel for narrative/haiku display, poetic flowing design with asymmetric rounded corners, echo silver (#A0AEC0) base with subtle deep indigo (#4A5568) patterns, memory and inheritance theme, meditative contemplative style, modern game UI, transparent PNG, 600x200',
        aiModel: 'gpt-image-1',
        canBeGenerated: true,
        priority: 'high',
    },
    {
        id: 'panel-evolution-event',
        category: 'panel',
        name: 'Evolution Event Panel',
        description: 'Background panel for evolution events - dynamic, significant',
        path: 'ui/panels/panel-evolution-event.png',
        expectedSize: { width: 350, height: 150 },
        expectedFormat: 'png',
        maxFileSizeKB: 60,
        requiresTransparency: true,
        aiPrompt: 'Semi-transparent panel for evolution events, dynamic flowing design with asymmetric rounded corners, deep indigo (#4A5568) base with trait gold (#D69E2E) and mutation purple (#805AD5) accents, significant evolutionary leap theme, modern game UI, transparent PNG, 350x150',
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
