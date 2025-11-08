/**
 * Haiku Narrative System - Procedural storytelling for significant moments
 * Enhanced Jaro-Winkler system with contextual metaphor generation
 */

import { log } from '../utils/Logger';
import { gameClock, type EvolutionEvent } from './GameClock';
import type { EvolutionaryCreature } from './CreatureArchetypeSystem';
import type { PackStructure } from './PackSocialSystem';

interface HaikuEntry {
  haiku: [string, string, string]; // Three lines (5-7-5 syllables approximate)
  context: NarrativeContext;
  timestamp: number;
  generation: number;
  emotionalTone: number; // -1 to 1 (melancholy to joyful)
  similarity: number;    // Jaro-Winkler similarity to previous haikus
  significance: number;  // 0-1 importance of the moment
}

interface NarrativeContext {
  eventType: 'evolution' | 'pack_formation' | 'shock_event' | 'discovery' | 'loss' | 'emergence';
  primarySubject: string; // What the haiku is about
  secondaryElements: string[]; // Supporting context
  location: string; // Where it happened
  involvedCreatures: string[]; // Creature IDs
  traits: number[]; // Relevant trait values
  environmentalFactors: string[]; // Pollution, biome, etc.
}

interface MetaphorBank {
  subjects: Map<string, string[]>;     // creature_type -> poetic names
  verbs: Map<string, string[]>;        // action_type -> poetic verbs
  objects: Map<string, string[]>;      // element_type -> poetic objects
  emotions: Map<string, string[]>;     // feeling_type -> emotional words
  environments: Map<string, string[]>; // biome_type -> environmental imagery
}

interface PoeticTemplate {
  trigger: string; // What kind of event triggers this template
  structure: [string, string, string]; // Line templates with placeholders
  emotionalRange: [number, number]; // Min/max emotional tone
  metaphorCategories: string[]; // Which metaphor types to use
}

class HaikuNarrativeSystem {
  private journal: HaikuEntry[] = [];
  private metaphorBank: MetaphorBank;
  private templates: PoeticTemplate[] = [];
  private recentThemes: string[] = []; // Track themes to avoid repetition
  private diversityThreshold = 0.2; // Jaro-Winkler similarity limit
  
  constructor() {
    this.initializeMetaphorBank();
    this.initializePoeticTemplates();
    this.loadJournalHistory();
    log.info('HaikuNarrativeSystem initialized with procedural poetry generation');
  }
  
  private initializeMetaphorBank(): void {
    this.metaphorBank = {
      subjects: new Map([
        ['tiny_scavenger', ['whisper', 'flicker', 'ember', 'shadow', 'mote']],
        ['small_browser', ['wanderer', 'seeker', 'dream', 'pulse', 'echo']],
        ['medium_forager', ['dancer', 'weaver', 'song', 'rhythm', 'flow']],
        ['aerial_drifter', ['wind', 'cloud', 'breath', 'sigh', 'soar']],
        ['aquatic_filter', ['current', 'tide', 'ripple', 'depth', 'pearl']],
        ['pack_former', ['chorus', 'bond', 'unity', 'circle', 'heart']],
        ['tool_experimenter', ['craft', 'shape', 'build', 'forge', 'create']],
        ['hybrid_form', ['merge', 'blend', 'fusion', 'synthesis', 'bridge']]
      ]),
      
      verbs: new Map([
        ['evolution', ['awakens', 'emerges', 'unfolds', 'blooms', 'transforms']],
        ['pack_formation', ['gathers', 'bonds', 'unites', 'harmonizes', 'joins']],
        ['shock_event', ['shatters', 'trembles', 'breaks', 'wounds', 'scars']],
        ['discovery', ['finds', 'reveals', 'uncovers', 'glimpses', 'touches']],
        ['loss', ['fades', 'departs', 'dissolves', 'whispers', 'remembers']],
        ['emergence', ['rises', 'births', 'ignites', 'kindles', 'dawns']]
      ]),
      
      objects: new Map([
        ['trait', ['essence', 'gift', 'blessing', 'mark', 'signature']],
        ['territory', ['realm', 'domain', 'sanctuary', 'haven', 'boundary']],
        ['resource', ['treasure', 'bounty', 'gift', 'offering', 'sustenance']],
        ['pollution', ['shadow', 'poison', 'blight', 'wound', 'scar']],
        ['cooperation', ['harmony', 'symphony', 'dance', 'weaving', 'embrace']],
        ['conflict', ['storm', 'clash', 'fire', 'thunder', 'rupture']]
      ]),
      
      emotions: new Map([
        ['joy', ['light', 'song', 'laughter', 'celebration', 'radiance']],
        ['sorrow', ['tears', 'ache', 'mourning', 'shadow', 'silence']],
        ['wonder', ['mystery', 'magic', 'beauty', 'awe', 'revelation']],
        ['fear', ['trembling', 'darkness', 'void', 'terror', 'dread']],
        ['hope', ['dawn', 'promise', 'tomorrow', 'healing', 'growth']],
        ['peace', ['stillness', 'calm', 'serenity', 'balance', 'grace']]
      ]),
      
      environments: new Map([
        ['plains', ['grass', 'horizon', 'meadow', 'breeze', 'openness']],
        ['forest', ['trees', 'canopy', 'shadows', 'whispers', 'depth']],
        ['mountains', ['peaks', 'stone', 'sky', 'eagles', 'silence']],
        ['wetlands', ['marsh', 'mist', 'reflection', 'frogs', 'mystery']],
        ['desert', ['sand', 'sun', 'heat', 'mirage', 'endurance']]
      ])
    };
    
    log.info('Metaphor bank initialized', {
      subjectCategories: this.metaphorBank.subjects.size,
      verbCategories: this.metaphorBank.verbs.size,
      objectCategories: this.metaphorBank.objects.size
    });
  }
  
  private initializePoeticTemplates(): void {
    this.templates = [
      // Evolution template
      {
        trigger: 'trait_emergence',
        structure: [
          '{subject} {verb}',
          '{trait} {object} stirs',
          'world {response}'
        ],
        emotionalRange: [-0.2, 0.8],
        metaphorCategories: ['evolution', 'trait', 'environment']
      },
      
      // Pack formation template  
      {
        trigger: 'pack_formation',
        structure: [
          '{creatures} gather',
          '{bond} {object} formed',
          '{territory} {response}'
        ],
        emotionalRange: [0.3, 0.9],
        metaphorCategories: ['pack_formation', 'cooperation', 'territory']
      },
      
      // Environmental shock template
      {
        trigger: 'shock_event',
        structure: [
          '{pollution} {verb}',
          '{environment} {object} {affected}',
          '{adaptation} {response}'
        ],
        emotionalRange: [-0.8, 0.2],
        metaphorCategories: ['shock_event', 'pollution', 'environment']
      },
      
      // Discovery template
      {
        trigger: 'discovery',
        structure: [
          '{creature} {verb}',
          '{discovery} {object} hidden',
          '{wonder} {response}'
        ],
        emotionalRange: [0.4, 1.0],
        metaphorCategories: ['discovery', 'wonder', 'trait']
      },
      
      // Loss/extinction template
      {
        trigger: 'extinction',
        structure: [
          '{departed} {verb}',
          '{memory} {object} lingers',
          '{sorrow} {response}'
        ],
        emotionalRange: [-1.0, -0.3],
        metaphorCategories: ['loss', 'sorrow', 'memory']
      }
    ];
    
    log.info('Poetic templates initialized', { templates: this.templates.length });
  }
  
  /**
   * Generate haiku for significant evolution event
   */
  generateHaiku(event: EvolutionEvent, additionalContext?: any): HaikuEntry {
    log.info('Generating haiku for evolution event', {
      eventType: event.eventType,
      significance: event.significance,
      affectedCreatures: event.affectedCreatures.length
    });
    
    // Build narrative context
    const context = this.buildNarrativeContext(event, additionalContext);
    
    // Find appropriate template
    const template = this.selectTemplate(event.eventType, event.significance);
    
    // Generate haiku lines with metaphor substitution
    const haikuLines = this.generateHaikuLines(template, context, event);
    
    // Calculate emotional tone
    const emotionalTone = this.calculateEmotionalTone(event, context);
    
    // Check similarity to recent haikus (diversity guard)
    const similarity = this.calculateMaxSimilarity(haikuLines);
    
    // Create haiku entry
    const haikuEntry: HaikuEntry = {
      haiku: haikuLines,
      context,
      timestamp: event.timestamp,
      generation: event.generation,
      emotionalTone,
      similarity,
      significance: event.significance
    };
    
    // Add to journal if sufficiently diverse
    if (similarity < this.diversityThreshold || event.significance > 0.8) {
      this.addToJournal(haikuEntry);
    }
    
    return haikuEntry;
  }
  
  private buildNarrativeContext(event: EvolutionEvent, additionalContext?: any): NarrativeContext {
    return {
      eventType: this.mapEventToNarrative(event.eventType),
      primarySubject: event.description,
      secondaryElements: event.affectedCreatures,
      location: additionalContext?.location || 'unknown',
      involvedCreatures: event.affectedCreatures,
      traits: event.traits,
      environmentalFactors: additionalContext?.environment || []
    };
  }
  
  private mapEventToNarrative(eventType: EvolutionEvent['eventType']): NarrativeContext['eventType'] {
    const mapping = {
      'trait_emergence': 'evolution',
      'behavior_shift': 'evolution',
      'pack_formation': 'pack_formation',
      'extinction': 'loss',
      'speciation': 'emergence'
    };
    
    return mapping[eventType] || 'discovery';
  }
  
  private selectTemplate(eventType: string, significance: number): PoeticTemplate {
    // Find templates matching event type
    const matchingTemplates = this.templates.filter(t => t.trigger === eventType);
    
    if (matchingTemplates.length === 0) {
      // Fallback to generic template
      return this.templates[0];
    }
    
    // Select template based on significance (more important events get richer templates)
    const templateIndex = Math.floor(significance * matchingTemplates.length);
    return matchingTemplates[Math.min(templateIndex, matchingTemplates.length - 1)];
  }
  
  private generateHaikuLines(
    template: PoeticTemplate,
    context: NarrativeContext,
    event: EvolutionEvent
  ): [string, string, string] {
    
    const substitutions = this.buildSubstitutions(context, event);
    
    const lines: [string, string, string] = [
      this.substituteTemplate(template.structure[0], substitutions),
      this.substituteTemplate(template.structure[1], substitutions),
      this.substituteTemplate(template.structure[2], substitutions)
    ];
    
    // Ensure poetic quality by adjusting syllable count (simplified)
    return [
      this.adjustSyllables(lines[0], 5),
      this.adjustSyllables(lines[1], 7),
      this.adjustSyllables(lines[2], 5)
    ];
  }
  
  private buildSubstitutions(context: NarrativeContext, event: EvolutionEvent): Record<string, string> {
    const substitutions: Record<string, string> = {};
    
    // Primary subject
    substitutions.subject = this.selectMetaphor('subjects', context.primarySubject) || 'being';
    substitutions.creature = substitutions.subject;
    substitutions.creatures = this.pluralize(substitutions.subject);
    
    // Action verb
    substitutions.verb = this.selectMetaphor('verbs', context.eventType) || 'changes';
    
    // Object/element
    substitutions.object = this.selectMetaphor('objects', 'trait') || 'essence';
    substitutions.trait = substitutions.object;
    
    // Environmental elements
    substitutions.environment = this.selectMetaphor('environments', context.location) || 'realm';
    substitutions.territory = substitutions.environment;
    
    // Emotional response
    const emotionCategory = this.determineEmotionCategory(event.significance);
    substitutions.response = this.selectMetaphor('emotions', emotionCategory) || 'echoes';
    
    // Context-specific substitutions
    if (context.eventType === 'pack_formation') {
      substitutions.bond = this.selectMetaphor('objects', 'cooperation') || 'unity';
    }
    
    if (context.environmentalFactors.length > 0) {
      substitutions.pollution = this.selectMetaphor('objects', 'pollution') || 'shadow';
      substitutions.adaptation = this.selectMetaphor('verbs', 'evolution') || 'adapts';
    }
    
    return substitutions;
  }
  
  private selectMetaphor(category: keyof MetaphorBank, key: string): string | null {
    const metaphors = this.metaphorBank[category].get(key);
    if (!metaphors || metaphors.length === 0) return null;
    
    return metaphors[Math.floor(Math.random() * metaphors.length)];
  }
  
  private substituteTemplate(template: string, substitutions: Record<string, string>): string {
    let result = template;
    
    for (const [placeholder, value] of Object.entries(substitutions)) {
      const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
      result = result.replace(regex, value);
    }
    
    // Clean up any remaining placeholders
    result = result.replace(/\{[^}]+\}/g, '...');
    
    return result;
  }
  
  private adjustSyllables(line: string, targetSyllables: number): string {
    // Simplified syllable adjustment - would use proper syllable counting in production
    const words = line.split(' ');
    
    if (words.length > targetSyllables + 1) {
      // Too many words, trim
      return words.slice(0, targetSyllables).join(' ');
    } else if (words.length < targetSyllables - 1) {
      // Too few words, add poetic filler
      return line + ' softly';
    }
    
    return line;
  }
  
  private determineEmotionCategory(significance: number): string {
    if (significance > 0.8) return 'wonder';
    if (significance > 0.6) return 'joy';
    if (significance < 0.3) return 'sorrow';
    if (significance < 0.5) return 'fear';
    return 'peace';
  }
  
  private pluralize(word: string): string {
    // Simple pluralization - would use proper grammar in production
    if (word.endsWith('s')) return word;
    return word + 's';
  }
  
  private calculateEmotionalTone(event: EvolutionEvent, context: NarrativeContext): number {
    let tone = 0;
    
    // Base tone from event type
    switch (context.eventType) {
      case 'evolution': tone += 0.4; break;
      case 'emergence': tone += 0.8; break;
      case 'pack_formation': tone += 0.6; break;
      case 'discovery': tone += 0.7; break;
      case 'loss': tone -= 0.7; break;
      case 'shock_event': tone -= 0.5; break;
    }
    
    // Modify based on significance
    tone += (event.significance - 0.5) * 0.6;
    
    // Environmental factors
    if (context.environmentalFactors.includes('pollution')) {
      tone -= 0.3;
    }
    
    return Math.max(-1, Math.min(1, tone));
  }
  
  /**
   * Jaro-Winkler similarity calculation for diversity guard
   */
  private jaroWinklerSimilarity(s1: string, s2: string): number {
    const m1 = s1.length;
    const m2 = s2.length;
    
    if (m1 === 0 && m2 === 0) return 1.0;
    if (m1 === 0 || m2 === 0) return 0.0;
    
    const matchWindow = Math.floor(Math.max(m1, m2) / 2) - 1;
    const s1Matches = new Array(m1).fill(false);
    const s2Matches = new Array(m2).fill(false);
    
    let matches = 0;
    let transpositions = 0;
    
    // Find matches
    for (let i = 0; i < m1; i++) {
      const start = Math.max(0, i - matchWindow);
      const end = Math.min(i + matchWindow + 1, m2);
      
      for (let j = start; j < end; j++) {
        if (s2Matches[j] || s1[i] !== s2[j]) continue;
        s1Matches[i] = true;
        s2Matches[j] = true;
        matches++;
        break;
      }
    }
    
    if (matches === 0) return 0.0;
    
    // Find transpositions
    let k = 0;
    for (let i = 0; i < m1; i++) {
      if (!s1Matches[i]) continue;
      while (!s2Matches[k]) k++;
      if (s1[i] !== s2[k]) transpositions++;
      k++;
    }
    
    const jaro = (matches / m1 + matches / m2 + (matches - transpositions / 2) / matches) / 3;
    
    // Winkler prefix bonus
    let prefix = 0;
    for (let i = 0; i < Math.min(4, m1, m2); i++) {
      if (s1[i] === s2[i]) prefix++;
      else break;
    }
    
    return jaro + prefix * 0.1 * (1 - jaro);
  }
  
  private calculateMaxSimilarity(newHaiku: [string, string, string]): number {
    if (this.journal.length === 0) return 0;
    
    const newHaikuText = newHaiku.join(' ');
    let maxSimilarity = 0;
    
    // Check against last 20 haikus for diversity
    const recentHaikus = this.journal.slice(-20);
    
    for (const entry of recentHaikus) {
      const existingText = entry.haiku.join(' ');
      const similarity = this.jaroWinklerSimilarity(newHaikuText, existingText);
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }
    
    return maxSimilarity;
  }
  
  private addToJournal(haiku: HaikuEntry): void {
    this.journal.push(haiku);
    
    // Limit journal size for memory management
    if (this.journal.length > 500) {
      this.journal = this.journal.slice(-300); // Keep last 300 entries
    }
    
    // Update theme tracking
    this.recentThemes.push(haiku.context.primarySubject);
    if (this.recentThemes.length > 50) {
      this.recentThemes = this.recentThemes.slice(-25);
    }
    
    // Persist to localStorage
    this.saveJournalToStorage();
    
    log.info('Haiku added to journal', {
      generation: haiku.generation,
      emotionalTone: haiku.emotionalTone.toFixed(2),
      similarity: haiku.similarity.toFixed(2),
      haiku: haiku.haiku
    });
  }
  
  private saveJournalToStorage(): void {
    try {
      const journalData = {
        entries: this.journal,
        recentThemes: this.recentThemes,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem('ebb-bloom-haiku-journal', JSON.stringify(journalData));
    } catch (error) {
      log.error('Failed to save haiku journal', error);
    }
  }
  
  private loadJournalHistory(): void {
    try {
      const stored = localStorage.getItem('ebb-bloom-haiku-journal');
      if (stored) {
        const data = JSON.parse(stored);
        this.journal = data.entries || [];
        this.recentThemes = data.recentThemes || [];
        
        log.info('Haiku journal restored', { 
          entries: this.journal.length,
          themes: this.recentThemes.length 
        });
      }
    } catch (error) {
      log.warn('Failed to load haiku journal history', error);
    }
  }
  
  /**
   * Generate haiku for creature evolution event
   */
  generateCreatureEvolutionHaiku(
    creature: EvolutionaryCreature,
    oldTraits: number[],
    newTraits: number[],
    location: string
  ): HaikuEntry {
    
    // Find most significant trait change
    let maxChange = 0;
    let changedTraitIndex = 0;
    
    for (let i = 0; i < Math.min(oldTraits.length, newTraits.length); i++) {
      const change = Math.abs(newTraits[i] - oldTraits[i]);
      if (change > maxChange) {
        maxChange = change;
        changedTraitIndex = i;
      }
    }
    
    const event: EvolutionEvent = {
      generation: gameClock.getCurrentTime().generation,
      timestamp: gameClock.getCurrentTime().gameTimeMs,
      eventType: 'trait_emergence',
      description: `Trait ${changedTraitIndex} evolved`,
      affectedCreatures: [creature.archetype.baseSpecies],
      traits: newTraits,
      significance: Math.min(1, maxChange * 2) // Scale significance with change magnitude
    };
    
    const additionalContext = {
      location,
      creatureArchetype: creature.archetype.category,
      dominantTrait: changedTraitIndex,
      environment: []
    };
    
    return this.generateHaiku(event, additionalContext);
  }
  
  /**
   * Generate haiku for pack formation
   */
  generatePackFormationHaiku(
    pack: PackStructure,
    location: string
  ): HaikuEntry {
    
    const event: EvolutionEvent = {
      generation: gameClock.getCurrentTime().generation,
      timestamp: gameClock.getCurrentTime().gameTimeMs,
      eventType: 'pack_formation',
      description: `${pack.packType} formed`,
      affectedCreatures: Array.from(pack.members.keys()),
      traits: pack.sharedTraits,
      significance: Math.min(1, pack.members.size / 10) // Larger packs more significant
    };
    
    const additionalContext = {
      location,
      packType: pack.packType,
      memberCount: pack.members.size,
      territory: pack.territoryRadius,
      environment: []
    };
    
    return this.generateHaiku(event, additionalContext);
  }
  
  /**
   * Export journal for sharing
   */
  exportJournal(): {
    totalEntries: number;
    generationSpan: [number, number];
    emotionalJourney: number[];
    mostSignificant: HaikuEntry[];
    diversityMetrics: {
      averageSimilarity: number;
      themeVariety: number;
      uniqueMetaphors: number;
    };
  } {
    
    if (this.journal.length === 0) {
      return {
        totalEntries: 0,
        generationSpan: [0, 0],
        emotionalJourney: [],
        mostSignificant: [],
        diversityMetrics: { averageSimilarity: 0, themeVariety: 0, uniqueMetaphors: 0 }
      };
    }
    
    const firstEntry = this.journal[0];
    const lastEntry = this.journal[this.journal.length - 1];
    
    const emotionalJourney = this.journal.map(entry => entry.emotionalTone);
    const mostSignificant = this.journal
      .filter(entry => entry.significance > 0.7)
      .sort((a, b) => b.significance - a.significance)
      .slice(0, 10);
    
    // Calculate diversity metrics
    let totalSimilarity = 0;
    for (const entry of this.journal) {
      totalSimilarity += entry.similarity;
    }
    const averageSimilarity = totalSimilarity / this.journal.length;
    
    const uniqueThemes = new Set(this.journal.map(e => e.context.primarySubject)).size;
    const uniqueMetaphors = new Set(this.journal.flatMap(e => e.haiku)).size;
    
    return {
      totalEntries: this.journal.length,
      generationSpan: [firstEntry.generation, lastEntry.generation],
      emotionalJourney,
      mostSignificant,
      diversityMetrics: {
        averageSimilarity,
        themeVariety: uniqueThemes,
        uniqueMetaphors
      }
    };
  }
  
  // Get recent haikus for UI display
  getRecentHaikus(count: number = 10): HaikuEntry[] {
    return this.journal.slice(-count);
  }
  
  // Get haikus by theme
  getHaikusByTheme(theme: string): HaikuEntry[] {
    return this.journal.filter(entry => 
      entry.context.primarySubject.includes(theme) ||
      entry.context.secondaryElements.some(element => element.includes(theme))
    );
  }
  
  // Get emotional arc over time
  getEmotionalArc(): Array<{ generation: number; tone: number; event: string }> {
    return this.journal.map(entry => ({
      generation: entry.generation,
      tone: entry.emotionalTone,
      event: entry.context.eventType
    }));
  }
}

export default HaikuNarrativeSystem;
export type { HaikuEntry, NarrativeContext, PoeticTemplate };