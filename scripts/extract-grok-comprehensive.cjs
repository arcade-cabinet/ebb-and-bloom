#!/usr/bin/env node

/**
 * Comprehensive Grok Chat Extractor v2
 * 
 * Extracts the full 48,000-word game design from Grok conversation
 * Captures: narrative vision, mechanics, traits, roadmap, code, and rationale
 * 
 * Usage: node extract-grok-comprehensive.js <input.md> <output-dir>
 */

const fs = require('fs');
const path = require('path');

class ComprehensiveExtractor {
  constructor(inputFile, outputDir = '.') {
    this.inputFile = inputFile;
    this.outputDir = outputDir;
    
    // Structured content buckets
    this.content = {
      vision: { text: [], title: 'Vision & Philosophy' },
      coreLoop: { text: [], title: 'Core Loop' },
      traits: { text: [], title: 'Trait Atlas' },
      pollutionShocks: { text: [], title: 'Pollution & Shock System' },
      combat: { text: [], title: 'Combat & Clash Mechanics' },
      rituals: { text: [], title: 'Rituals & Redemption' },
      crafting: { text: [], title: 'Resource Snapping & Crafting' },
      mobileUX: { text: [], title: 'Mobile UX & Touch Controls' },
      roadmap: { text: [], title: 'Development Roadmap' },
      techStack: { text: [], title: 'Tech Stack & Architecture' },
      performance: { text: [], title: 'Performance & Optimization' },
      testing: { text: [], title: 'Testing & Playtest Strategy' },
      balance: { text: [], title: 'Balance Pillars & Guardrails' },
      audio: { text: [], title: 'Audio & Haptic Feedback' },
      ai: { text: [], title: 'AI & Yuka Behaviors' }
    };
    
    this.codeSnippets = [];
    this.conversationFlow = [];
  }
  
  // Parse entire conversation with semantic awareness
  parse() {
    console.log('📖 Reading comprehensive game design...');
    const content = fs.readFileSync(this.inputFile, 'utf8');
    const lines = content.split('\n');
    
    let currentSpeaker = null;
    let currentBlock = [];
    let inCodeBlock = false;
    let codeBlockLang = null;
    let codeBlockLines = [];
    
    // Keywords for semantic categorization
    const keywords = {
      vision: ['vision', 'philosophy', 'one-world', 'ache', 'intimate', 'tidal memory', 'overview'],
      coreLoop: ['core loop', 'stride', 'snap', 'inherit', 'clash', 'nova', 'gameplay flow'],
      traits: ['trait', 'flipper', 'chainsaw', 'evo points', 'affinity', 'hybrid', 'mutation'],
      pollutionShocks: ['pollution', 'shock', 'tempest', 'whisper', 'threshold', 'murmur'],
      combat: ['combat', 'clash', 'resonance', 'drain', 'siphon', 'grudge', 'rival'],
      rituals: ['ritual', 'redemption', 'shard', 'purge', 'tame', 'abyss rite'],
      crafting: ['snap', 'resource', 'ore', 'water', 'alloy', 'permutation', 'magnetic'],
      mobileUX: ['touch', 'swipe', 'gesture', 'haptic', 'mobile', 'capacitor', 'ionic'],
      roadmap: ['stage', 'week', 'poc', 'mvp', 'milestone', 'sprint'],
      techStack: ['phaser', 'bitecs', 'yuka', 'zustand', 'tech stack', 'architecture'],
      performance: ['60fps', 'performance', 'optimization', 'memory', 'battery'],
      testing: ['playtest', 'beta', 'frolic test', 'linger rate', 'feedback'],
      balance: ['balance', 'pillar', 'guardrail', 'harmony', 'conquest', 'frolick'],
      audio: ['audio', 'haptic', 'web audio', 'synthesis', 'vibration', 'feedback'],
      ai: ['yuka', 'steering', 'behavior', 'flock', 'pathfind', 'creature ai']
    };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Track speakers
      if (line.startsWith('**[USER]**')) {
        currentSpeaker = 'USER';
        if (currentBlock.length > 0) {
          this.processBlock(currentBlock, keywords);
          currentBlock = [];
        }
      } else if (line.startsWith('**[ASSISTANT]**')) {
        currentSpeaker = 'ASSISTANT';
        if (currentBlock.length > 0) {
          this.processBlock(currentBlock, keywords);
          currentBlock = [];
        }
      }
      
      // Code block handling
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockLang = line.replace('```', '').trim() || 'text';
          codeBlockLines = [];
        } else {
          inCodeBlock = false;
          this.codeSnippets.push({
            language: codeBlockLang,
            code: codeBlockLines.join('\n'),
            context: currentBlock.slice(-3).join(' ') // Last 3 lines for context
          });
          codeBlockLines = [];
        }
        continue;
      }
      
      if (inCodeBlock) {
        codeBlockLines.push(line);
      } else if (line.trim().length > 0) {
        currentBlock.push(line);
      }
    }
    
    // Process final block
    if (currentBlock.length > 0) {
      this.processBlock(currentBlock, keywords);
    }
    
    console.log(`✅ Parsed ${lines.length} lines`);
    console.log(`📊 Found ${this.codeSnippets.length} code snippets`);
    console.log(`📝 Extracted content across ${Object.keys(this.content).length} categories`);
  }
  
  // Categorize text block by keywords
  processBlock(block, keywords) {
    const text = block.join('\n');
    const lowerText = text.toLowerCase();
    
    // Score each category
    const scores = {};
    for (const [category, words] of Object.entries(keywords)) {
      scores[category] = words.reduce((score, word) => {
        return score + (lowerText.includes(word.toLowerCase()) ? 1 : 0);
      }, 0);
    }
    
    // Add to top scoring categories (can belong to multiple)
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore > 0) {
      for (const [category, score] of Object.entries(scores)) {
        if (score >= maxScore * 0.7) { // 70% threshold for multi-category
          this.content[category].text.push(text);
        }
      }
    }
  }
  
  // Generate structured documentation
  generateDocs() {
    console.log('\n📝 Generating structured documentation...');
    
    const docsDir = path.join(this.outputDir, 'docs');
    fs.mkdirSync(docsDir, { recursive: true });
    
    let index = 0;
    for (const [key, data] of Object.entries(this.content)) {
      if (data.text.length === 0) continue;
      
      const filename = `${String(index).padStart(2, '0')}-${key}.md`;
      const filepath = path.join(docsDir, filename);
      
      // Deduplicate and clean
      const uniqueText = [...new Set(data.text)];
      const content = `# ${data.title}\n\n${uniqueText.join('\n\n---\n\n')}`;
      
      fs.writeFileSync(filepath, content, 'utf8');
      console.log(`  ✓ ${filename} (${uniqueText.length} sections)`);
      index++;
    }
  }
  
  // Generate code files with proper structure
  generateCode() {
    console.log('\n🔨 Generating code files...');
    
    const srcDir = path.join(this.outputDir, 'src');
    const dirs = ['core', 'audio', 'utils', 'traits', 'ai', 'crafting'];
    
    dirs.forEach(dir => {
      fs.mkdirSync(path.join(srcDir, dir), { recursive: true });
    });
    
    // Organize code by keywords in context
    const codeMap = {
      'raycast': 'core/raycasting',
      'haiku': 'utils/haiku-guard',
      'jaro': 'utils/haiku-guard',
      'audio': 'audio/evolution-morph',
      'haptic': 'audio/haptic-sync',
      'trait': 'traits/trait-system',
      'yuka': 'ai/behaviors',
      'snap': 'crafting/resource-snap',
      'perlin': 'core/world-generation'
    };
    
    const organizedCode = {};
    
    this.codeSnippets.forEach((snippet, idx) => {
      let targetPath = null;
      const contextLower = (snippet.context || '').toLowerCase();
      
      for (const [keyword, path] of Object.entries(codeMap)) {
        if (contextLower.includes(keyword)) {
          targetPath = path;
          break;
        }
      }
      
      if (!targetPath) {
        targetPath = `misc/snippet-${idx}`;
      }
      
      if (!organizedCode[targetPath]) {
        organizedCode[targetPath] = [];
      }
      
      organizedCode[targetPath].push(snippet);
    });
    
    // Write organized code files
    for (const [filePath, snippets] of Object.entries(organizedCode)) {
      const ext = snippets[0].language === 'typescript' ? 'ts' : 
                   snippets[0].language === 'javascript' ? 'js' :
                   snippets[0].language === 'python' ? 'py' : 'txt';
      
      const fullPath = path.join(srcDir, `${filePath}.${ext}`);
      const dirPath = path.dirname(fullPath);
      
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      const content = snippets.map((s, i) => 
        `// Snippet ${i + 1} - Context: ${s.context}\n\n${s.code}`
      ).join('\n\n// ---\n\n');
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`  ✓ ${filePath}.${ext} (${snippets.length} snippets)`);
    }
  }
  
  // Generate comprehensive memory bank
  generateMemoryBank() {
    console.log('\n🏦 Generating comprehensive memory bank...');
    
    const memoryDir = path.join(this.outputDir, 'memory-bank');
    fs.mkdirSync(memoryDir, { recursive: true });
    
    // Enhanced project brief
    const projectBrief = this.buildEnhancedProjectBrief();
    fs.writeFileSync(path.join(memoryDir, 'projectbrief.md'), projectBrief, 'utf8');
    
    // Enhanced product context
    const productContext = this.buildEnhancedProductContext();
    fs.writeFileSync(path.join(memoryDir, 'productContext.md'), productContext, 'utf8');
    
    console.log('  ✓ Enhanced memory bank files');
  }
  
  buildEnhancedProjectBrief() {
    const visionSummary = this.content.vision.text.slice(0, 3).join('\n\n');
    const traitSummary = this.content.traits.text.slice(0, 2).join('\n\n');
    
    return `# Ebb & Bloom - Comprehensive Project Brief

## Vision Summary
${visionSummary}

## Core Mechanics Overview
${traitSummary}

## Key Statistics from Grok Session
- Total conversation: ~48,000 words
- Development time: 12+ hours of design iteration
- Code examples: ${this.codeSnippets.length} implementations
- Systems designed: ${Object.keys(this.content).length} major categories
- Traits defined: 25 (10 core + 15 hybrids)
- Development stages: 6 (8-week MVP)

## Critical Design Pillars
1. **One-World Intimacy**: 80% gameplay in single persistent world
2. **Procedural Evolution**: Traits inherit and mutate based on player actions
3. **Touch-First**: Mobile gestures as core interaction model
4. **Tidal Rhythm**: 45-minute nova cycles with persistence
5. **Emergent Narrative**: Haiku journal generated from player actions

## Extracted Documentation
See /docs for comprehensive design documentation organized by system.

## Next Steps
1. Review all documentation in /docs (${Object.keys(this.content).filter(k => this.content[k].text.length > 0).length} files)
2. Assess Stage 1 POC requirements
3. Implement core systems: raycasting, touch controls, basic crafting
4. Build 10-minute frolic test

---
Generated from comprehensive Grok conversation extraction
`;
  }
  
  buildEnhancedProductContext() {
    return `# Enhanced Product Context

## What Makes This Special

### The "Ache" Philosophy
This game is built around emotional resonance, not mechanical optimization. Every design decision serves the feeling of:
- **Intimate connection** to a single world that remembers you
- **Tidal rhythm** of growth and decay
- **Evolutionary legacy** through trait inheritance
- **Tactile poetry** via touch gestures and haptic feedback

### Why Mobile-Only
Not a port - designed from scratch for touch:
- Gestures are the primary language (swipe, pinch, long-press)
- Haptic feedback creates physical connection to world
- Portrait orientation for one-handed play
- 60FPS performance target on mid-range Android

### Core Innovation: Magnetic Resource Snapping
Unlike traditional crafting menus, resources "snap" together based on proximity and affinity. Ore + Water = Alloy happens naturally when you place them adjacent. Scales infinitely through procedural permutations.

### Trait Inheritance System
Your creature's traits don't just affect you - they influence the ecosystem:
- Proximity-based inheritance (creatures near you evolve similar traits)
- Dilution mechanics (traits weaken by 50% each generation)
- Hybrid emergence (flow + void = tidal scar)
- Behavioral mirroring (your playstyle shapes creature AI)

## Target Experience

### First 10 Minutes
- Create modular pixel creature with trait allocation
- Stride through procedurally generated meadow
- Discover first resource snap (ore + water = alloy)
- Feel haptic feedback and see pollution increase
- Watch world react to your actions

### First Hour
- Unlock multiple trait combinations
- Build first creature pack via proximity inheritance
- Experience minor pollution shock (world mutation)
- Complete first resource chain (wood → tool → advanced snap)
- See haiku journal capture your story

### Long-term Engagement
- 45-minute nova cycles reset world but persist journal
- Rare stardust travel to sibling worlds (5-10 variants)
- Deep trait exploration (25 total traits with synergies)
- Emergent narratives from ecosystem evolution
- Community seed sharing (deterministic world gen)

---
Extracted from 48,000-word comprehensive design session
`;
  }
  
  // Run full extraction
  run() {
    console.log('🎮 Ebb & Bloom - Comprehensive Extraction v2\n');
    
    this.parse();
    this.generateDocs();
    this.generateCode();
    this.generateMemoryBank();
    
    console.log('\n✨ Comprehensive extraction complete!');
    console.log(`\n📁 Output: ${this.outputDir}`);
    console.log('\nNext steps:');
    console.log('  1. Review /docs for complete game design');
    console.log('  2. Read memory-bank for AI context');
    console.log('  3. Review /src for organized code implementations');
    console.log('  4. Assess POC vs Memory Bank content');
  }
}

// CLI execution
if (require.main === module) {
  const inputFile = process.argv[2] || 'Grok-Procedural_Pixel_World_Evolution_Game.md';
  const outputDir = process.argv[3] || '.';
  
  const extractor = new ComprehensiveExtractor(inputFile, outputDir);
  extractor.run();
}

module.exports = { ComprehensiveExtractor };
