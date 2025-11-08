# Comprehensive Prompt Engineering Review

## Executive Summary

**Status**: ❌ CRITICAL ISSUES FOUND - DO NOT GENERATE UNTIL FIXED

**Issues**:
1. WEFT flow (macro → meso → micro) NOT implemented in code
2. WARP flow (previous gen → current gen) too weak in prompts
3. Scale definitions inconsistent across generations
4. Visual blueprint requirements incomplete for gen1-gen6

---

## Issue 1: WEFT FLOW NOT IMPLEMENTED IN CODE

### Problem
The `generateScale()` method doesn't receive the current generation's completed scales. When generating:
- **meso**: Should have access to macro archetypes
- **micro**: Should have access to macro AND meso archetypes

### Current Code
```typescript
// Line 318: generateScale() called without current scales
const scaleData = await agent.generateScale(scale);
// generationData.scales[scale] is saved AFTER, but never passed to next scale
```

### Required Fix
```typescript
// Pass completed scales to next scale generation
const currentScales = {
  macro: generationData.scales.macro,
  meso: generationData.scales.meso
};
const scaleData = await agent.generateScale(scale, currentScales);
```

### Impact
- Meso archetypes generated without macro context
- Micro archetypes generated without macro/meso context
- Scales are disconnected within each generation

---

## Issue 2: WEFT FLOW MISSING IN PROMPTS

### Problem
Prompts don't explicitly instruct AI to build on previous scales:

**gen0 meso prompt**: No mention of macro (stellar systems)
**gen0 micro prompt**: No mention of meso (accretion dynamics)
**Same for all generations**

### Required Fix
Each meso prompt needs:
```
CRITICAL WEFT FLOW - BUILDING ON MACRO:
You are generating MESO scale archetypes that build upon the MACRO scale archetypes generated above.
The macro archetypes define the [context]. Your meso archetypes must:
- Be compatible with macro archetypes
- Build upon macro's [specific aspects]
- Reference specific macro archetypes when relevant
```

Each micro prompt needs:
```
CRITICAL WEFT FLOW - BUILDING ON MACRO AND MESO:
You are generating MICRO scale archetypes that integrate MACRO and MESO scales.
- Macro provides: [context]
- Meso provides: [dynamics]
- Your micro archetypes must synthesize both into [specific outcome]
```

---

## Issue 3: WARP FLOW TOO WEAK

### Problem
`buildContextPrompt()` creates summaries but prompts don't explicitly use them:

**Current**: "You inherit complete knowledge from Gen 0"
**Missing**: "Use Gen 0's stellar system contexts to inform Gen 1's ecological niches"

### Required Fix
Each generation's systemPrompt needs explicit WARP instructions:

**gen1 systemPrompt should add**:
```
CRITICAL WARP FLOW - CAUSAL INHERITANCE:
You inherit from Gen 0:
- Stellar system contexts (macro) → inform planetary environment for creatures
- Accretion dynamics (meso) → inform surface conditions creatures adapt to
- Element distributions (micro) → inform available materials creatures can use

Your creature archetypes MUST causally build on these inherited contexts.
```

**gen2 systemPrompt should add**:
```
CRITICAL WARP FLOW - CAUSAL INHERITANCE:
You inherit from:
- Gen 0: Planetary materials and environment
- Gen 1: Creature capabilities and traits

Specifically use:
- Gen 1's ecological niches (macro) → inform pack territorial needs
- Gen 1's population dynamics (meso) → inform pack social structures
- Gen 1's physiology (micro) → inform pack coordination capabilities
```

---

## Issue 4: SCALE DEFINITIONS INCONSISTENT

### gen0 Issues
- **macro**: Says "stellar systems" but previous output was generating planets
- **meso**: "Accretion dynamics" - clear
- **micro**: "Element distributions" - clear

### gen1 Issues  
- **macro**: "Ecological niches" - clear
- **meso**: "Population dynamics" - unclear if groups or individuals
- **micro**: "Individual physiology" - clear

### gen2 Issues
- **macro**: "Territorial geography" - clear
- **meso**: "Pack sociology" - clear
- **micro**: "Individual pack behavior" - confusing (packs are groups)

### Required Fix
Each scale needs explicit definition at start of prompt:
```
SCALE DEFINITION - MACRO:
At the MACRO scale, you are generating [what this represents at largest level].
These archetypes define [purpose] and influence all smaller scales.

SCALE DEFINITION - MESO:
At the MESO scale, you are generating [what this represents at intermediate level].
These archetypes build on MACRO's [aspects] and enable MICRO's [outcomes].

SCALE DEFINITION - MICRO:
At the MICRO scale, you are generating [what this represents at smallest level].
These archetypes integrate MACRO's [context] with MESO's [dynamics] to create [specific result].
```

---

## Issue 5: VISUAL BLUEPRINT REQUIREMENTS INCOMPLETE

### Problem
- gen0: Has detailed PBR requirements ✅
- gen1-gen6: Minimal visual requirements ❌

### Required Fix
All generations need:
- Complete PBR property requirements (baseColor, roughness, metallic, etc.)
- Texture reference requirements (which categories to use)
- Color palette requirements (5-8 colors)
- Procedural rules requirements (how to vary visually)

---

## Implementation Priority

1. **CRITICAL**: Fix WEFT flow in code (pass scales to generateScale)
2. **CRITICAL**: Add WEFT instructions to all meso/micro prompts
3. **HIGH**: Add WARP instructions to all systemPrompts
4. **HIGH**: Add scale definitions to all prompts
5. **MEDIUM**: Standardize visual blueprint requirements

---

## Files to Modify

1. `packages/gen/src/workflows/warp-weft-agent.ts`
   - Update `generateScale()` signature
   - Update `buildContextPrompt()` to include WEFT
   - Update `executeWarpWeftGeneration()` to pass scales

2. `packages/gen/src/prompts/generation-prompts.ts`
   - Add WEFT sections to all meso/micro prompts
   - Add WARP sections to all systemPrompts
   - Add scale definitions
   - Standardize visual requirements

---

**DO NOT GENERATE UNTIL THESE FIXES ARE COMPLETE**

