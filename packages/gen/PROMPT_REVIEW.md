# Prompt Engineering Review

## Issues Found

### 1. WEFT FLOW MISSING (Macro → Meso → Micro)
**Problem**: Meso and Micro scales don't reference the previous scale within the same generation.

**Current State**:
- gen0 meso: No reference to gen0 macro (stellar systems)
- gen0 micro: No reference to gen0 meso (accretion dynamics)
- gen1 meso: No reference to gen1 macro (ecological niches)
- gen1 micro: No reference to gen1 meso (population dynamics)
- Same pattern for all generations

**Required**: Each meso prompt should explicitly build on macro, each micro should build on meso.

### 2. WARP FLOW WEAK (Previous Gen → Current Gen)
**Problem**: Prompts mention "inherit knowledge" but don't specify HOW to use it.

**Current State**:
- buildContextPrompt() adds inherited knowledge summary
- But prompts don't explicitly instruct: "Use Gen 0's [specific thing] to inform Gen 1's [specific thing]"
- No explicit causal chain instructions

**Required**: Each generation's prompt should explicitly reference specific outputs from previous generation.

### 3. SCALE DEFINITIONS INCONSISTENT
**Problem**: Some scales don't clearly define what they're generating at that level.

**Examples**:
- gen0 macro: Says "stellar systems" but output was generating planets
- gen1 meso: "Population dynamics" - unclear if this is about groups or individuals
- gen2 micro: "Individual pack behavior" - but packs are groups, not individuals

**Required**: Clear scale definitions for each generation.

### 4. VISUAL BLUEPRINT REQUIREMENTS INCONSISTENT
**Problem**: Some prompts have detailed visual requirements, others don't.

**Current State**:
- gen0: Has detailed PBR requirements
- gen1-gen6: Minimal visual requirements

**Required**: All generations need complete visual blueprint requirements.

## Required Fixes

### Fix 1: Add WEFT Flow Instructions
Each meso prompt needs:
```
CRITICAL WEFT FLOW: You are building on the MACRO scale archetypes generated above. 
Your meso archetypes must be compatible with and build upon the macro context.
Reference specific macro archetypes when generating meso options.
```

Each micro prompt needs:
```
CRITICAL WEFT FLOW: You are building on both MACRO and MESO scale archetypes generated above.
Your micro archetypes must integrate macro context with meso dynamics.
Reference specific macro and meso archetypes when generating micro options.
```

### Fix 2: Add WARP Flow Instructions
Each generation's systemPrompt needs:
```
CRITICAL WARP FLOW: You inherit complete knowledge from [previous generations].
Specifically use:
- Gen 0's [specific outputs] to inform [specific aspects of current gen]
- Gen 1's [specific outputs] to inform [specific aspects of current gen]
[etc for all previous gens]

Your archetypes must causally build on these inherited contexts.
```

### Fix 3: Clarify Scale Definitions
Each scale needs explicit definition:
- MACRO: [What this scale represents at the largest level]
- MESO: [What this scale represents at the intermediate level, building on macro]
- MICRO: [What this scale represents at the smallest level, building on meso]

### Fix 4: Standardize Visual Blueprint Requirements
All prompts need:
- Complete PBR property requirements
- Texture reference requirements
- Color palette requirements
- Procedural rules requirements

