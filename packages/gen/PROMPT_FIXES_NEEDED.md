# Prompt Engineering Fixes Required

## Critical Issues

### 1. WEFT FLOW NOT IMPLEMENTED
**Current**: When generating meso, agent doesn't have access to macro. When generating micro, agent doesn't have access to macro/meso.

**Required**: 
- Pass `generationData.scales.macro` to meso generation
- Pass `generationData.scales.macro` and `generationData.scales.meso` to micro generation
- Add explicit WEFT instructions to meso/micro prompts

### 2. WARP FLOW TOO WEAK
**Current**: buildContextPrompt() creates summary but prompts don't explicitly use it.

**Required**:
- Each prompt must explicitly reference specific outputs from previous generations
- Add "CRITICAL WARP FLOW" sections to each generation's prompts

### 3. SCALE DEFINITIONS UNCLEAR
**Required**: Each scale needs explicit definition of what it represents

## Implementation Plan

### Step 1: Update WarpWeftAgent.generateScale()
- Add parameter: `currentGenerationScales?: { macro?: any, meso?: any }`
- Pass completed scales to prompt builder
- Add WEFT context to prompt

### Step 2: Update buildContextPrompt()
- Add parameter: `currentGenerationScales?: { macro?: any, meso?: any }`
- Add WEFT context section when scales exist
- Format: "WEFT FLOW: Building on macro archetypes: [list], meso archetypes: [list]"

### Step 3: Update All Prompts
- Add "CRITICAL WEFT FLOW" section to meso prompts
- Add "CRITICAL WEFT FLOW" section to micro prompts  
- Add "CRITICAL WARP FLOW" section to all systemPrompts
- Add explicit scale definitions

### Step 4: Update executeWarpWeftGeneration()
- Pass `generationData.scales` to `generateScale()` calls
- Ensure macro → meso → micro order is enforced

