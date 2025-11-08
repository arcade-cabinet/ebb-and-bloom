# Active Context

**Last Updated**: 2025-01-09

## Current Focus: Frontend UI/UX Setup - Main Menu with UIKit

### What We Just Completed

1. **Full Generation Pipeline with Quality Assurance** ✅
   - All 7 generations (gen0-gen6) successfully generated: **125 archetypes total**
   - **89.4% average quality score**, **0 anemic archetypes**
   - Proper WARP/WEFT flow implemented and validated
   - Comprehensive documentation generated at `docs/GENERATION_REVIEW.md`
   - Quality assessment system with automatic regeneration
   - File size checking to detect suspicious archetypes

2. **Unlimited Generation System** ✅
   - Removed hardcoded "5 archetypes" limits
   - AI determines optimal count for complete conceptual coverage
   - Dynamic counts loaded from `archetype-generation.json` manifest
   - All prompts updated to "Generate comprehensive..." instead of fixed counts

3. **Quality Assurance Pipeline** ✅
   - Quality assessor checks: description length, parameters, textures, completeness, file sizes
   - Automatic regeneration of anemic archetypes
   - Red flag alarms if still anemic after second pass
   - Integrated into generation workflow - runs automatically
   - Quality statistics included in documentation

4. **Universal Template System** ✅
   - Parameter ranges (min/max/default) for seed-based interpolation
   - Selection biases (baseWeight, seedModifiers) for weighted selection
   - Adjacencies (compatibleWith, incompatibleWith, adjacentTo, requires)
   - Deconstruction annotations (how archetypes break down, by what, into what)
   - Formation/synthesis guidance for Yuka AI (step-by-step formation processes)

### IMMEDIATE PRIORITY: Frontend UI/UX Setup

The generation pipeline is complete. Current focus is building the main menu UI/UX in `packages/frontend`:

1. **UIKit Setup** ✅ COMPLETE
   - Fixed package.json to use `@pmndrs/uikit` (NOT @react-three/uikit)
   - Using `@react-three/uikit` wrapper around `@pmndrs/uikit`
   - Dependencies: `@pmndrs/uikit`, `@react-three/uikit`, `@react-three/uikit-default`, `@react-three/uikit-lucide`
   - Canvas must have `gl={{ localClippingEnabled: true }}` for scrolling/clipping
   - Responsive design using Tailwind-style breakpoints (sm, md, lg, xl, 2xl)

2. **Central AI Model Constants** ✅ COMPLETE
   - Created `packages/gen/src/config/ai-models.ts` with single source of truth
   - `TEXT_MODEL = openai('gpt-5')` - Used by ALL text generation workflows
   - `IMAGE_MODEL = openai.image('gpt-image-1')` - Used by ALL image generation workflows
   - ALL workflows updated: `warp-weft-agent.ts`, `ui-asset-generator.ts`, `archetype-pools.ts`
   - NO hardcoded model names anywhere - all use constants

3. **UI Asset Generator** ✅ COMPLETE
   - Copied from `memory-bank/archived-code/dev-tools/dev/ProductionAssetGenerator.ts`
   - Uses Vercel AI SDK `generateImage()` with `IMAGE_MODEL` constant
   - Uses Vercel AI SDK `generateObject()` with `TEXT_MODEL` constant
   - Outputs to `packages/frontend/public/`
   - Idempotent - skips existing assets

4. **UI Manifests** ✅ COMPLETE
   - `packages/gen/data/manifests/ui-asset-manifest.ts` - Copied from archive
   - `packages/gen/data/manifests/ui-assets.json` - Brand-aligned UI definitions
   - `packages/gen/data/manifests/fonts.json` - Google Fonts manifest (Lora, Inter, JetBrains Mono)

5. **Next Steps** (TODO)
   - Build main menu with UIKit components (Fullscreen, Container, Button, Text)
   - Implement seed cookie persistence
   - Add settings and credits screens
   - Generate UI assets via `pnpm cli ui-assets` in packages/gen
   - Set up fonts workflow with google-fonts-helper

### Key Files

- **AI Model Constants**: `packages/gen/src/config/ai-models.ts` - SINGLE SOURCE OF TRUTH for GPT-5 and GPT-image-1
- **UI Asset Generator**: `packages/gen/src/workflows/ui-asset-generator.ts` - Uses IMAGE_MODEL constant
- **UI Manifests**: `packages/gen/data/manifests/ui-asset-manifest.ts`, `ui-assets.json`, `fonts.json`
- **Frontend Package**: `packages/frontend/` - Main menu UI/UX with UIKit
- **Generation Data**: `packages/gen/data/archetypes/gen0-6/` (125 archetypes)
- **Quality Report**: `packages/gen/data/manifests/quality-assessment.json`
- **Documentation**: `docs/GENERATION_REVIEW.md` (comprehensive review with quality metrics)
- **Backend Integration**: `packages/backend/src/gen-systems/loadGenData.ts`
- **Backend Systems**: `packages/backend/src/gen0-6/` (AccretionSimulation, CreatureSystem, etc.)

### Important Notes

- All generations use proper nested JSON structures (not TOML strings)
- Texture IDs (like "Metal049A", "Rock025") are used throughout
- Visual blueprints include complete PBR properties for rendering
- WARP/WEFT flow ensures causal relationships between generations and scales
- Universal templates enable infinite seed-driven variation
- Quality system ensures all archetypes meet standards before proceeding
- Formation/synthesis guidance enables Yuka AI to understand "how did that squirrel get there?"

### Quality Metrics Summary

- **125 archetypes** across 7 generations, 21 scales
- **89.4% average quality score**
- **0 anemic archetypes** (< 30% threshold)
- **120 excellent** (> 80%), **5 good** (60-80%)
- **2 archetypes automatically regenerated** (gen2/macro)
